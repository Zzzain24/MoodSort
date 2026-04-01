export interface SpotifyImage {
  url: string
  height: number | null
  width: number | null
}

export interface SpotifyPlaylist {
  id: string
  name: string
  description: string
  images: SpotifyImage[]
  tracks?: { total: number }
  external_urls: { spotify: string }
}

// Returns the best thumbnail URL for a playlist (smallest image available).
// Spotify returns images largest-first; the last entry is usually the 64×64 thumb.
export function getPlaylistThumbnail(images: SpotifyImage[]): string | null {
  if (!images || images.length === 0) return null
  return images[images.length - 1].url
}
