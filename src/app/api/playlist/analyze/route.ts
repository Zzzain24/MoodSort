import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSpotifyToken } from '@/lib/spotify'
import { refreshSpotifyToken } from '@/lib/spotify-token'
import { rateLimit } from '@/lib/rate-limit'
import { AnalyzeRequestSchema } from '@/lib/playlist-types'
import type { VibeProfile, ScoredSong } from '@/lib/playlist-types'
import type { MatchedSong } from '@/components/dashboard/run/types'

// ─── Constants ─────────────────────────────────────────────────────────────────

const SPOTIFY_REFRESH_COOKIE = 'sp_refresh_token'
const AUDIO_FEATURES_BATCH = 100
const SCORING_BATCH = 50
const SCORING_CONCURRENCY = 5
const SCORE_THRESHOLD = 65
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? 'gpt-4.1-nano'

// ─── Helpers ───────────────────────────────────────────────────────────────────

function sanitizeUserText(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/[^\w\s.,!?'"-()/]/g, '')
    .trim()
    .slice(0, 200)
}

async function withConcurrencyLimit<T>(
  tasks: (() => Promise<T>)[],
  limit: number
): Promise<T[]> {
  const results: T[] = new Array(tasks.length)
  let index = 0
  async function worker() {
    while (index < tasks.length) {
      const i = index++
      results[i] = await tasks[i]()
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker))
  return results
}

interface AudioFeatures {
  energy: number
  danceability: number
  valence: number
  tempo: number
  acousticness: number
  instrumentalness: number
}

interface LibrarySong {
  spotifyTrackId: string
  name: string
  artist: string
  albumArt: string | null
  audioFeatures: AudioFeatures | null
}

async function fetchAudioFeaturesBatch(
  token: string,
  ids: string[]
): Promise<Map<string, AudioFeatures>> {
  const result = new Map<string, AudioFeatures>()
  try {
    const res = await fetch(
      `https://api.spotify.com/v1/audio-features?ids=${ids.join(',')}`,
      {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        cache: 'no-store',
      }
    )
    if (!res.ok) return result
    const data = (await res.json()) as {
      audio_features: Array<{
        id: string
        energy: number
        danceability: number
        valence: number
        tempo: number
        acousticness: number
        instrumentalness: number
      } | null>
    }
    for (const f of data.audio_features ?? []) {
      if (!f) continue
      result.set(f.id, {
        energy: f.energy,
        danceability: f.danceability,
        valence: f.valence,
        tempo: f.tempo,
        acousticness: f.acousticness,
        instrumentalness: f.instrumentalness,
      })
    }
  } catch (err) {
    console.error('[playlist/analyze] fetchAudioFeaturesBatch error', (err as Error).message)
  }
  return result
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

  // Rate limit
  const { allowed, retryAfter } = await rateLimit(`analyze:${user.id}`, 1, 60_000)
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

  const parsed = AnalyzeRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { playlistName, vibeDescription, seedSongIds } = parsed.data
  const admin = createAdminClient()

  // ── Verify seed ownership + fetch seed metadata ──────────────────────────

  type SeedRow = {
    spotify_track_id: string
    songs: { name: string; artist: string; audio_features: AudioFeatures | null; has_audio_features: boolean } | null
  }

  const { data: seedRows, error: seedErr } = await supabase
    .from('user_songs')
    .select('spotify_track_id, songs(name, artist, audio_features, has_audio_features)')
    .eq('user_id', user.id)
    .in('spotify_track_id', seedSongIds)

  if (seedErr) {
    console.error('[playlist/analyze] seed fetch error', seedErr.message)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }

  const ownedSeedIds = new Set((seedRows ?? []).map((r) => r.spotify_track_id as string))
  if (ownedSeedIds.size !== seedSongIds.length || !seedSongIds.every((id) => ownedSeedIds.has(id))) {
    return NextResponse.json({ error: 'Invalid seed songs' }, { status: 400 })
  }

  const typedSeedRows = (seedRows ?? []) as unknown as SeedRow[]

  // ── Fetch full library ───────────────────────────────────────────────────

  type LibRow = {
    spotify_track_id: string
    songs: {
      name: string
      artist: string
      album_art_url: string | null
      audio_features: AudioFeatures | null
      has_audio_features: boolean
    } | null
  }

  const { data: libRows, error: libErr } = await supabase
    .from('user_songs')
    .select('spotify_track_id, songs(name, artist, album_art_url, audio_features, has_audio_features)')
    .eq('user_id', user.id)

  if (libErr) {
    console.error('[playlist/analyze] library fetch error', libErr.message)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }

  const typedLibRows = ((libRows ?? []) as unknown as LibRow[]).filter((r) => r.songs !== null)

  // Build in-memory library map
  const libraryMap = new Map<string, LibrarySong>()
  for (const row of typedLibRows) {
    const song = row.songs!
    libraryMap.set(row.spotify_track_id as string, {
      spotifyTrackId: row.spotify_track_id as string,
      name: song.name,
      artist: song.artist,
      albumArt: song.album_art_url,
      audioFeatures: song.has_audio_features ? (song.audio_features as AudioFeatures) : null,
    })
  }

  // ── Populate missing audio features (cache on first use) ─────────────────

  const missingFeatureIds = [...libraryMap.entries()]
    .filter(([, song]) => song.audioFeatures === null)
    .map(([id]) => id)

  if (missingFeatureIds.length > 0) {
    // Resolve Spotify token
    let token = await getSpotifyToken()
    if (!token) {
      const cookieStore = await cookies()
      const refreshToken = cookieStore.get(SPOTIFY_REFRESH_COOKIE)?.value
      if (refreshToken) {
        const refreshed = await refreshSpotifyToken(refreshToken)
        token = refreshed?.accessToken ?? null
      }
    }

    if (token) {
      const idBatches: string[][] = []
      for (let i = 0; i < missingFeatureIds.length; i += AUDIO_FEATURES_BATCH) {
        idBatches.push(missingFeatureIds.slice(i, i + AUDIO_FEATURES_BATCH))
      }

      const batchTasks = idBatches.map(
        (batch) => () => fetchAudioFeaturesBatch(token!, batch)
      )
      const batchResults = await withConcurrencyLimit(batchTasks, SCORING_CONCURRENCY)

      // Merge fetched features into memory + upsert into DB
      const upsertRows: { spotify_track_id: string; audio_features: AudioFeatures; has_audio_features: boolean }[] = []
      for (const featMap of batchResults) {
        for (const [trackId, features] of featMap) {
          const song = libraryMap.get(trackId)
          if (song) {
            song.audioFeatures = features
            libraryMap.set(trackId, song)
          }
          upsertRows.push({
            spotify_track_id: trackId,
            audio_features: features,
            has_audio_features: true,
          })
        }
      }

      if (upsertRows.length > 0) {
        const DB_CHUNK = 500
        for (let i = 0; i < upsertRows.length; i += DB_CHUNK) {
          const { error: upsertErr } = await admin
            .from('songs')
            .upsert(upsertRows.slice(i, i + DB_CHUNK), { onConflict: 'spotify_track_id' })
          if (upsertErr) {
            console.error('[playlist/analyze] audio features upsert error', upsertErr.message)
          }
        }
      }
    } else {
      console.error('[playlist/analyze] no Spotify token — skipping audio features fetch')
    }
  }

  // ── AI Phase 1: Extract vibe profile ─────────────────────────────────────

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const seedSongsForPrompt = typedSeedRows.map((row) => {
    const song = row.songs!
    const features = song.has_audio_features
      ? (song.audio_features as AudioFeatures)
      : libraryMap.get(row.spotify_track_id as string)?.audioFeatures ?? null
    return {
      name: song.name,
      artist: song.artist,
      ...(features
        ? {
            energy: features.energy,
            danceability: features.danceability,
            valence: features.valence,
            tempo: Math.round(features.tempo),
            acousticness: features.acousticness,
          }
        : {}),
    }
  })

  let vibeProfile: VibeProfile
  try {
    const phase1 = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You are a music analyst. Given seed songs and an optional vibe hint, return a structured JSON vibe profile. Respond ONLY with valid JSON matching the requested schema. Do not include any other text.',
        },
        {
          role: 'user',
          content: [
            `<playlist_name>${sanitizeUserText(playlistName)}</playlist_name>`,
            `<vibe_hint>${vibeDescription ? sanitizeUserText(vibeDescription) : 'none provided'}</vibe_hint>`,
            `<seed_songs>${JSON.stringify(seedSongsForPrompt)}</seed_songs>`,
            '',
            'Return JSON with this exact structure:',
            '{ "energyLevel": "low"|"medium"|"high", "mood": string[], "tempo": "slow"|"mid"|"fast", "genres": string[], "instrumentation": string[], "lyricFocus": "instrumental"|"background-vocals"|"lyric-forward", "keywords": string[] }',
          ].join('\n'),
        },
      ],
    })

    const content = phase1.choices[0]?.message?.content ?? ''
    vibeProfile = JSON.parse(content) as VibeProfile
  } catch (err) {
    console.error('[playlist/analyze] phase1 error', (err as Error).message)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }

  // ── AI Phase 2: Batch score library ──────────────────────────────────────

  const seedSet = new Set(seedSongIds)
  const allLibrary = [...libraryMap.values()]

  const batches: LibrarySong[][] = []
  for (let i = 0; i < allLibrary.length; i += SCORING_BATCH) {
    batches.push(allLibrary.slice(i, i + SCORING_BATCH))
  }

  const vibeProfileStr = JSON.stringify(vibeProfile)

  const scoringTasks = batches.map((batch) => async (): Promise<ScoredSong[]> => {
    const songsForPrompt = batch.map((s) => ({
      id: s.spotifyTrackId,
      name: s.name,
      artist: s.artist,
      ...(s.audioFeatures
        ? {
            energy: s.audioFeatures.energy,
            danceability: s.audioFeatures.danceability,
            valence: s.audioFeatures.valence,
            tempo: Math.round(s.audioFeatures.tempo),
            acousticness: s.audioFeatures.acousticness,
          }
        : {}),
    }))

    try {
      const res = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'You are a music curator. Score how well each song matches the given vibe profile. Respond ONLY with a JSON object: { "scores": [{ "id": string, "score": number }] }. Scores must be integers 0–100. No other text.',
          },
          {
            role: 'user',
            content: [
              `<vibe_profile>${vibeProfileStr}</vibe_profile>`,
              `<songs>${JSON.stringify(songsForPrompt)}</songs>`,
              '',
              'Score each song 0–100 based on how well it matches the vibe profile.',
              'Consider genre, energy, mood, tempo, and instrumentation.',
              'Return exactly one score object per input song.',
            ].join('\n'),
          },
        ],
      })

      const content = res.choices[0]?.message?.content ?? ''
      const parsed = JSON.parse(content) as { scores: ScoredSong[] }
      return parsed.scores ?? []
    } catch (err) {
      console.error('[playlist/analyze] phase2 batch error', (err as Error).message)
      return []
    }
  })

  const batchResults = await withConcurrencyLimit(scoringTasks, SCORING_CONCURRENCY)

  const failedBatches = batchResults.filter((r) => r.length === 0).length
  if (failedBatches > batches.length / 2 && batches.length > 0) {
    console.error(`[playlist/analyze] >50% batches failed (${failedBatches}/${batches.length})`)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }

  // Flatten, filter by threshold, exclude seeds, sort by score desc
  const allScores = batchResults.flat()
  const qualifyingScores = allScores
    .filter((s) => s.score >= SCORE_THRESHOLD && !seedSet.has(s.id))
    .sort((a, b) => b.score - a.score)

  // Join back to library for full song metadata
  const matchedSongsRaw = qualifyingScores
    .map((scored) => {
      const song = libraryMap.get(scored.id)
      if (!song) return null
      const matched: MatchedSong = {
        id: song.spotifyTrackId,
        name: song.name,
        artist: song.artist,
        matchScore: scored.score,
      }
      if (song.albumArt) matched.albumArt = song.albumArt
      return matched
    })
  const matchedSongs: MatchedSong[] = matchedSongsRaw.filter((s): s is MatchedSong => s !== null)

  return NextResponse.json({ matchedSongs })
}
