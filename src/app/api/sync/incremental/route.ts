import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSpotifyToken } from '@/lib/spotify'
import { refreshSpotifyToken } from '@/lib/spotify-token'
import { rateLimit } from '@/lib/rate-limit'

// ─── Spotify types ─────────────────────────────────────────────────────────────

interface SpotifyImage {
  url: string
  width: number | null
  height: number | null
}

interface SpotifyTrackItem {
  added_at: string | null
  track: {
    id: string
    name: string
    artists: Array<{ name: string }>
    album: { images: SpotifyImage[] }
  } | null
}

interface SpotifyTracksPage {
  items: SpotifyTrackItem[]
  total: number
  next: string | null
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const SPOTIFY_TOKEN_COOKIE = 'sp_access_token'
const SPOTIFY_REFRESH_COOKIE = 'sp_refresh_token'
const PAGE_SIZE = 50
const BATCH_SIZE = 5
const DB_CHUNK = 500

// ─── Helpers ───────────────────────────────────────────────────────────────────

async function fetchPage(
  token: string,
  offset: number,
  retries = 2
): Promise<SpotifyTracksPage | null> {
  try {
    const res = await fetch(
      `https://api.spotify.com/v1/me/tracks?limit=${PAGE_SIZE}&offset=${offset}`,
      {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        cache: 'no-store',
      }
    )
    if (res.status === 429 && retries > 0) {
      const wait = Math.min(
        parseInt(res.headers.get('Retry-After') ?? '2', 10) * 1000,
        10_000
      )
      await new Promise((r) => setTimeout(r, wait))
      return fetchPage(token, offset, retries - 1)
    }
    if (!res.ok) return null
    return (await res.json()) as SpotifyTracksPage
  } catch (err) {
    console.error('[sync/incremental] fetchPage network error at offset', offset, (err as Error).name)
    return null
  }
}

type SongRecord = {
  spotify_track_id: string
  name: string
  artist: string
  album_art_url: string | null
  added_at: string | null
}

function itemsToSongRecords(items: SpotifyTrackItem[]): SongRecord[] {
  const seen = new Set<string>()
  const records: SongRecord[] = []
  for (const item of items) {
    const track = item.track
    if (!track || !track.id || seen.has(track.id)) continue
    seen.add(track.id)
    const images = track.album.images
    records.push({
      spotify_track_id: track.id,
      name: track.name,
      artist: track.artists[0]?.name ?? 'Unknown Artist',
      album_art_url: images.length > 0 ? images[images.length - 1].url : null,
      added_at: item.added_at ?? null,
    })
  }
  return records
}

// ─── Route ─────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // Verify authenticated session
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Rate limit: 1 sync per minute per user
  const { allowed, retryAfter } = await rateLimit(`sync_incremental:${user.id}`, 1, 60_000)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }

  // Resolve Spotify token — refresh if the access token has expired
  let token = await getSpotifyToken()
  let newAccessToken: { value: string; maxAge: number } | null = null

  if (!token) {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get(SPOTIFY_REFRESH_COOKIE)?.value
    if (!refreshToken) {
      return NextResponse.json({ error: 'Spotify token expired' }, { status: 400 })
    }
    const refreshed = await refreshSpotifyToken(refreshToken)
    if (!refreshed) {
      return NextResponse.json({ error: 'Spotify token expired' }, { status: 400 })
    }
    token = refreshed.accessToken
    newAccessToken = { value: refreshed.accessToken, maxAge: refreshed.expiresIn }
  }

  const admin = createAdminClient()

  // ── Fetch all liked songs from Spotify ───────────────────────────────────

  const firstPage = await fetchPage(token, 0)
  if (!firstPage) {
    console.error('[sync/incremental] failed to fetch first page from Spotify for user', user.id)
    return NextResponse.json({ error: 'Failed to fetch from Spotify' }, { status: 502 })
  }

  const allItems: SpotifyTrackItem[] = [...firstPage.items]
  const remainingOffsets: number[] = []
  for (let o = PAGE_SIZE; o < firstPage.total; o += PAGE_SIZE) {
    remainingOffsets.push(o)
  }
  for (let i = 0; i < remainingOffsets.length; i += BATCH_SIZE) {
    const pages = await Promise.all(
      remainingOffsets.slice(i, i + BATCH_SIZE).map((o) => fetchPage(token, o))
    )
    for (const page of pages) {
      if (page) allItems.push(...page.items)
    }
  }

  // ── Diff against DB ───────────────────────────────────────────────────────

  const spotifyIdSet = new Set<string>()
  for (const item of allItems) {
    if (item.track?.id) spotifyIdSet.add(item.track.id)
  }

  // Paginate the DB fetch — Supabase returns at most 1 000 rows per request,
  // so we loop until we have all rows for this user.
  type DbRow = { spotify_track_id: string; song_id: string }
  const allDbRows: DbRow[] = []
  {
    const PAGE = 1000
    let from = 0
    while (true) {
      const { data } = await admin
        .from('user_songs')
        .select('spotify_track_id, song_id')
        .eq('user_id', user.id)
        .range(from, from + PAGE - 1)
      const rows = (data ?? []) as DbRow[]
      allDbRows.push(...rows)
      if (rows.length < PAGE) break
      from += PAGE
    }
  }

  const dbIdSet = new Set<string>()
  const dbSpotifyToSongId = new Map<string, string>()
  for (const row of allDbRows) {
    dbIdSet.add(row.spotify_track_id)
    dbSpotifyToSongId.set(row.spotify_track_id, row.song_id)
  }

  const toRemove = [...dbIdSet].filter((id) => !spotifyIdSet.has(id))
  const toAddItems = allItems.filter((item) => item.track?.id && !dbIdSet.has(item.track.id))

  // ── Remove unliked songs ──────────────────────────────────────────────────

  let removed = 0

  if (toRemove.length > 0) {
    const removedSongIds = toRemove
      .map((id) => dbSpotifyToSongId.get(id))
      .filter((id): id is string => id !== undefined)

    for (let i = 0; i < toRemove.length; i += DB_CHUNK) {
      await admin
        .from('user_songs')
        .delete()
        .eq('user_id', user.id)
        .in('spotify_track_id', toRemove.slice(i, i + DB_CHUNK))
    }

    // Delete songs from the global table that no user references anymore
    for (let i = 0; i < removedSongIds.length; i += DB_CHUNK) {
      const chunk = removedSongIds.slice(i, i + DB_CHUNK)
      const { data: stillUsed } = await admin
        .from('user_songs')
        .select('song_id')
        .in('song_id', chunk)
      const stillUsedSet = new Set((stillUsed ?? []).map((r) => r.song_id as string))
      const orphans = chunk.filter((id) => !stillUsedSet.has(id))
      if (orphans.length > 0) {
        await admin.from('songs').delete().in('id', orphans)
      }
    }

    removed = toRemove.length
  }

  // ── Add newly liked songs ─────────────────────────────────────────────────

  const added = await upsertSongs(admin, user.id, itemsToSongRecords(toAddItems))

  // ── Update sync state ─────────────────────────────────────────────────────

  const lastSyncedAt = new Date().toISOString()
  await admin
    .from('user_sync_state')
    .upsert({ user_id: user.id, last_synced_at: lastSyncedAt }, { onConflict: 'user_id' })

  const res = NextResponse.json({ added, removed, lastSyncedAt })
  if (newAccessToken) {
    setTokenCookie(res, newAccessToken.value, newAccessToken.maxAge)
  }
  return res
}

// ─── Shared upsert helper ──────────────────────────────────────────────────────

async function upsertSongs(
  admin: ReturnType<typeof import('@/lib/supabase/admin').createAdminClient>,
  userId: string,
  songRecords: SongRecord[]
): Promise<number> {
  if (songRecords.length === 0) return 0

  for (let i = 0; i < songRecords.length; i += DB_CHUNK) {
    const chunk = songRecords.slice(i, i + DB_CHUNK)
    await admin.from('songs').upsert(
      chunk.map((s) => ({
        spotify_track_id: s.spotify_track_id,
        name: s.name,
        artist: s.artist,
        album_art_url: s.album_art_url,
      })),
      { onConflict: 'spotify_track_id', ignoreDuplicates: true }
    )
  }

  const spotifyIds = songRecords.map((s) => s.spotify_track_id)
  const songIdMap = new Map<string, string>()
  for (let i = 0; i < spotifyIds.length; i += DB_CHUNK) {
    const { data: rows } = await admin
      .from('songs')
      .select('id, spotify_track_id')
      .in('spotify_track_id', spotifyIds.slice(i, i + DB_CHUNK))
    for (const row of rows ?? []) {
      songIdMap.set(row.spotify_track_id as string, row.id as string)
    }
  }

  const userSongRows = songRecords
    .map((s) => {
      const songId = songIdMap.get(s.spotify_track_id)
      if (!songId) return null
      return {
        user_id: userId,
        song_id: songId,
        spotify_track_id: s.spotify_track_id,
        added_at: s.added_at,
        status: 'unsorted' as const,
      }
    })
    .filter((r): r is NonNullable<typeof r> => r !== null)

  let insertedCount = 0
  for (let i = 0; i < userSongRows.length; i += DB_CHUNK) {
    const { data } = await admin
      .from('user_songs')
      .upsert(userSongRows.slice(i, i + DB_CHUNK), { onConflict: 'user_id,song_id', ignoreDuplicates: true })
      .select('id')
    insertedCount += (data ?? []).length
  }

  return insertedCount
}

// ─── Utility ───────────────────────────────────────────────────────────────────

function setTokenCookie(res: NextResponse, value: string, maxAge: number): void {
  res.cookies.set(SPOTIFY_TOKEN_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge,
  })
}
