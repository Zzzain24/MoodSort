import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSpotifyToken } from '@/lib/spotify'
import { rateLimit } from '@/lib/rate-limit'

// ─── Spotify types ────────────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 50
const BATCH_SIZE = 5   // concurrent Spotify requests per round
const DB_CHUNK  = 500  // max rows per Supabase upsert

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
    console.error('[sync/initial] fetchPage network error at offset', offset, (err as Error).name)
    return null
  }
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST() {
  // Verify authenticated session first so we can key rate limit by user ID
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    console.log('[sync/initial] no user')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  console.log('[sync/initial] user', user.id)

  const admin = createAdminClient()

  // Idempotency check first — already-synced users skip rate limiting entirely.
  const { count, error: countErr } = await admin
    .from('user_songs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
  console.log('[sync/initial] count', count, 'countErr', countErr?.message)

  if (count && count > 0) {
    console.log('[sync/initial] already synced')
    return NextResponse.json({ alreadySynced: true })
  }

  // Rate limit: 3 calls per minute per user (allows retries after timeouts)
  const { allowed, retryAfter } = await rateLimit(`sync_initial:${user.id}`, 3, 60_000)
  if (!allowed) {
    console.log('[sync/initial] rate limited')
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }

  const token = await getSpotifyToken()
  console.log('[sync/initial] token present', !!token)
  if (!token) {
    return NextResponse.json({ error: 'Spotify token expired' }, { status: 400 })
  }

  // ── Fetch all pages from Spotify in parallel batches ──────────────────────
  const firstPage = await fetchPage(token, 0)
  if (!firstPage) {
    console.error('[sync/initial] failed to fetch first page from Spotify for user', user.id)
    return NextResponse.json(
      { error: 'Failed to fetch from Spotify' },
      { status: 502 }
    )
  }

  const allItems: SpotifyTrackItem[] = [...firstPage.items]
  const total = firstPage.total

  // Build remaining offsets and fetch in concurrent batches of BATCH_SIZE
  const offsets: number[] = []
  for (let offset = PAGE_SIZE; offset < total; offset += PAGE_SIZE) {
    offsets.push(offset)
  }

  for (let i = 0; i < offsets.length; i += BATCH_SIZE) {
    const batch = offsets.slice(i, i + BATCH_SIZE)
    const pages = await Promise.all(batch.map((o) => fetchPage(token, o)))
    for (const page of pages) {
      if (page) allItems.push(...page.items)
    }
  }

  // ── Build normalised song records ─────────────────────────────────────────
  type SongRecord = {
    spotify_track_id: string
    name: string
    artist: string
    album_art_url: string | null
    added_at: string | null
  }

  const seen = new Set<string>()
  const songRecords: SongRecord[] = []

  for (const item of allItems) {
    const track = item.track
    // Skip local files and null tracks (no Spotify ID)
    if (!track || !track.id) continue
    if (seen.has(track.id)) continue
    seen.add(track.id)

    // Spotify returns images largest-first; last entry is the smallest thumbnail
    const images = track.album.images
    const albumArt = images.length > 0 ? images[images.length - 1].url : null

    songRecords.push({
      spotify_track_id: track.id,
      name: track.name,
      artist: track.artists[0]?.name ?? 'Unknown Artist',
      album_art_url: albumArt,
      added_at: item.added_at ?? null,
    })
  }

  if (songRecords.length === 0) {
    return NextResponse.json({ imported: 0 })
  }

  // ── Upsert into global songs table in chunks ──────────────────────────────
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

  // ── Resolve song UUIDs so we can populate user_songs ─────────────────────
  const spotifyIds = songRecords.map((s) => s.spotify_track_id)
  const songIdMap = new Map<string, string>() // spotify_track_id → uuid

  for (let i = 0; i < spotifyIds.length; i += DB_CHUNK) {
    const chunk = spotifyIds.slice(i, i + DB_CHUNK)
    const { data: rows } = await admin
      .from('songs')
      .select('id, spotify_track_id')
      .in('spotify_track_id', chunk)
    for (const row of rows ?? []) {
      songIdMap.set(row.spotify_track_id as string, row.id as string)
    }
  }

  // ── Bulk insert into user_songs ───────────────────────────────────────────
  const userSongRows = songRecords
    .map((s) => {
      const songId = songIdMap.get(s.spotify_track_id)
      if (!songId) return null
      return {
        user_id: user.id,
        song_id: songId,
        spotify_track_id: s.spotify_track_id,
        added_at: s.added_at,
        status: 'unsorted' as const,
      }
    })
    .filter((r): r is NonNullable<typeof r> => r !== null)

  for (let i = 0; i < userSongRows.length; i += DB_CHUNK) {
    const chunk = userSongRows.slice(i, i + DB_CHUNK)
    await admin
      .from('user_songs')
      .upsert(chunk, { onConflict: 'user_id,song_id', ignoreDuplicates: true })
  }

  return NextResponse.json({ imported: userSongRows.length })
}
