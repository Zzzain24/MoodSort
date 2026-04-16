import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { getSpotifyToken } from '@/lib/spotify'
import { refreshSpotifyToken } from '@/lib/spotify-token'
import { rateLimit } from '@/lib/rate-limit'
import { CreatePlaylistRequestSchema } from '@/lib/playlist-types'

// ─── Constants ─────────────────────────────────────────────────────────────────

const SPOTIFY_TOKEN_COOKIE = 'sp_access_token'
const SPOTIFY_REFRESH_COOKIE = 'sp_refresh_token'
const SPOTIFY_ADD_LIMIT = 100

// ─── Helpers ───────────────────────────────────────────────────────────────────

function sanitizeUserText(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/[^\w\s.,!?'"-()/]/g, '')
    .trim()
    .slice(0, 200)
}

// ─── Route ─────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // Auth
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Rate limit: 10 playlist creations per hour per user
  const { allowed, retryAfter } = rateLimit(`create:${user.id}`, 1, 60_000)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }

  // Parse + validate body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const parsed = CreatePlaylistRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { playlistName, vibeDescription, songIds } = parsed.data

  // Verify song ownership — all songIds must exist in this user's library
  const { data: ownedRows, error: ownershipErr } = await supabase
    .from('user_songs')
    .select('spotify_track_id')
    .eq('user_id', user.id)
    .in('spotify_track_id', songIds)

  if (ownershipErr) {
    console.error('[playlist/create] ownership check error', ownershipErr.message)
    return NextResponse.json({ error: 'Failed to create playlist' }, { status: 500 })
  }

  const ownedSet = new Set((ownedRows ?? []).map((r) => r.spotify_track_id as string))
  const unowned = songIds.filter((id) => !ownedSet.has(id))
  if (unowned.length > 0) {
    return NextResponse.json({ error: 'Invalid songs' }, { status: 400 })
  }

  // Resolve Spotify token
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

  // Create Spotify playlist
  const createRes = await fetch(
    'https://api.spotify.com/v1/me/playlists',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        name: sanitizeUserText(playlistName),
        description: vibeDescription ? sanitizeUserText(vibeDescription) : '',
        public: true,
      }),
    }
  )
  if (!createRes.ok) {
    let createErrBody = ''
    try { createErrBody = await createRes.text() } catch { /* ignore */ }
    console.error('[playlist/create] Spotify playlist creation failed', createRes.status, createErrBody)
    return NextResponse.json({ error: 'Failed to create playlist' }, { status: 502 })
  }
  const playlist = (await createRes.json()) as {
    id: string
    external_urls: { spotify: string }
  }
  // Add songs in batches of 100
  const spotifyUris = songIds.map((id) => `spotify:track:${id}`)
  let trackAddFailed = false
  for (let i = 0; i < spotifyUris.length; i += SPOTIFY_ADD_LIMIT) {
    const chunk = spotifyUris.slice(i, i + SPOTIFY_ADD_LIMIT)
    const addRes = await fetch(
      `https://api.spotify.com/v1/playlists/${encodeURIComponent(playlist.id)}/items`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ uris: chunk }),
      }
    )
    if (!addRes.ok) {
      let errBody = ''
      try { errBody = await addRes.text() } catch { /* ignore */ }
      console.error(
        `[playlist/create] failed to add batch at offset ${i}`,
        addRes.status,
        errBody
      )
      trackAddFailed = true
      break
    }
  }

  // If tracks failed to add, delete the orphaned empty playlist and return error
  if (trackAddFailed) {
    await fetch(
      `https://api.spotify.com/v1/playlists/${encodeURIComponent(playlist.id)}/followers`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }
    ).catch(() => { /* non-fatal */ })
    const error = 'Failed to add songs to playlist'
    return NextResponse.json({ error }, { status: 502 })
  }

  // Store playlist record in DB
  const { error: insertErr } = await supabase.from('playlists').insert({
    user_id: user.id,
    spotify_playlist_id: playlist.id,
    name: playlistName,
    vibe_description: vibeDescription || null,
    song_count: songIds.length,
  })
  if (insertErr) {
    console.error('[playlist/create] DB insert error', insertErr.message)
    // Non-fatal — playlist is already on Spotify
  }

  const response = NextResponse.json({
    spotifyPlaylistId: playlist.id,
    spotifyUrl: playlist.external_urls.spotify,
  })

  if (newAccessToken) {
    response.cookies.set(SPOTIFY_TOKEN_COOKIE, newAccessToken.value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: newAccessToken.maxAge,
    })
  }

  return response
}
