import { cache } from 'react'
import { cookies } from 'next/headers'
import {
  type SpotifyImage,
  type SpotifyPlaylist,
  getPlaylistThumbnail,
} from '@/lib/spotify-utils'

export type { SpotifyImage, SpotifyPlaylist }
export { getPlaylistThumbnail }

function coerceTotal(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value)
    return Number.isFinite(n) ? n : null
  }
  return null
}

function pagingTotalFromResponse(data: unknown): number | null {
  if (!data || typeof data !== 'object') return null
  if ('error' in data) return null
  if (!('total' in data)) return null
  return coerceTotal((data as { total: unknown }).total)
}

async function spotifyAuthorizedGet(
  token: string,
  url: string
): Promise<unknown | null> {
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    })
    if (!res.ok) return null
    return (await res.json()) as unknown
  } catch {
    return null
  }
}

// Fetches the authoritative item count for a playlist via the /items endpoint
// (which includes both tracks and episodes). Falls back to the legacy /tracks
// path if /items is unavailable for the playlist type.
async function resolvePlaylistTrackTotal(
  token: string,
  playlistId: string
): Promise<number | null> {
  const id = encodeURIComponent(playlistId)

  // Step 1: canonical /items endpoint — limit=1 ensures Spotify computes and
  // returns the correct `total` in the paging response (limit=0 is unreliable).
  const itemsData = await spotifyAuthorizedGet(
    token,
    `https://api.spotify.com/v1/playlists/${id}/items?limit=1`
  )
  const itemsTotal = pagingTotalFromResponse(itemsData)
  if (itemsTotal !== null) return itemsTotal

  // Step 2: legacy /tracks path as final fallback
  const tracksData = await spotifyAuthorizedGet(
    token,
    `https://api.spotify.com/v1/playlists/${id}/tracks?limit=1`
  )
  return pagingTotalFromResponse(tracksData)
}

// Reads the Spotify access token from its dedicated httpOnly cookie.
// Deduped per request via React cache so layout + page share one call.
export const getSpotifyToken = cache(async (): Promise<string | null> => {
  const cookieStore = await cookies()
  return cookieStore.get('sp_access_token')?.value ?? null
})

// Returns the total number of liked songs, or null on failure.
export const getLikedSongsCount = cache(
  async (token: string): Promise<number | null> => {
    try {
      const res = await fetch(
        'https://api.spotify.com/v1/me/tracks?limit=1',
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        }
      )
      if (!res.ok) return null
      const data = (await res.json()) as { total?: unknown }
      return coerceTotal(data.total)
    } catch {
      return null
    }
  }
)

// Spotify raw track item shape from /me/tracks
interface SpotifyTrackItem {
  track: {
    id: string
    name: string
    artists: Array<{ name: string }>
    album: {
      images: SpotifyImage[]
    }
  } | null
}

export interface LikedSong {
  id: string
  name: string
  artist: string
  albumArt?: string
}

// Fetches all of the user's liked songs, paginated.
// Returns up to 1 000 songs (20 pages × 50) to keep response time reasonable.
// Local files and tracks with no ID are skipped.
export const getLikedSongs = cache(
  async (token: string): Promise<LikedSong[]> => {
    const PAGE_SIZE = 50
    const MAX_SONGS = 1000
    const songs: LikedSong[] = []
    let offset = 0
    let hasMore = true

    try {
      while (hasMore && songs.length < MAX_SONGS) {
        const res = await fetch(
          `https://api.spotify.com/v1/me/tracks?limit=${PAGE_SIZE}&offset=${offset}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
            cache: 'no-store',
          }
        )
        if (!res.ok) break

        const data = (await res.json()) as {
          items: SpotifyTrackItem[]
          next: string | null
        }

        for (const item of data.items ?? []) {
          const track = item.track
          // Skip local files and null tracks
          if (!track || !track.id) continue
          const artist = track.artists[0]?.name ?? 'Unknown Artist'
          // Images are largest-first; last is the smallest thumbnail
          const albumArt =
            track.album.images.length > 0
              ? track.album.images[track.album.images.length - 1].url
              : undefined
          songs.push({ id: track.id, name: track.name, artist, albumArt })
        }

        hasMore = data.next !== null
        offset += PAGE_SIZE
      }
    } catch {
      // Return whatever we managed to fetch
    }

    return songs
  }
)

// Returns the user's playlists (up to 50), or [] on failure.
export const getUserPlaylists = cache(
  async (token: string): Promise<SpotifyPlaylist[]> => {
    try {
      const res = await fetch(
        'https://api.spotify.com/v1/me/playlists?limit=50',
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
          cache: 'no-store',
        }
      )
      if (!res.ok) return []
      const data = (await res.json()) as { items: SpotifyPlaylist[] }
      const items = data.items ?? []
      // Always resolve from the /items endpoint — the simplified count in the
      // listing response can be stale or track-only (excludes episodes), so it
      // won't match what Spotify shows. All requests use limit=1 and run in
      // parallel, so the overhead is one network round-trip for the batch.
      return Promise.all(
        items.map(async (pl) => {
          const total = await resolvePlaylistTrackTotal(token, pl.id)
          return {
            ...pl,
            tracks: { total: total ?? pl.tracks?.total ?? 0 },
          }
        })
      )
    } catch {
      return []
    }
  }
)
