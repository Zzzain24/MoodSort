interface RefreshResult {
  accessToken: string
  expiresIn: number
}

/**
 * Exchanges a Spotify refresh token for a new access token.
 * Requires SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET env vars.
 * Returns null on any failure — caller must handle re-auth.
 */
export async function refreshSpotifyToken(
  refreshToken: string
): Promise<RefreshResult | null> {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
  if (!clientId || !clientSecret) return null

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
  })

  try {
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = (await res.json()) as { access_token?: string; expires_in?: number }
    if (!data.access_token) return null
    return { accessToken: data.access_token, expiresIn: data.expires_in ?? 3600 }
  } catch {
    return null
  }
}
