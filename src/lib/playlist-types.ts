import { z } from 'zod'
import type { MatchedSong } from '@/components/dashboard/run/types'

// ─── Analyze endpoint ──────────────────────────────────────────────────────────

export const AnalyzeRequestSchema = z.object({
  playlistName: z.string().min(1).max(50),
  vibeDescription: z.string().max(200).optional().default(''),
  seedSongIds: z.array(z.string()).length(10),
})

export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>

export type AnalyzeResponse = {
  matchedSongs: MatchedSong[]
}

// ─── Create endpoint ───────────────────────────────────────────────────────────

export const CreatePlaylistRequestSchema = z.object({
  playlistName: z.string().min(1).max(50),
  vibeDescription: z.string().max(200).optional().default(''),
  songIds: z.array(z.string()).min(1).max(500),
})

export type CreatePlaylistRequest = z.infer<typeof CreatePlaylistRequestSchema>

export type CreatePlaylistResponse = {
  spotifyPlaylistId: string
  spotifyUrl: string
}

// ─── AI internals ─────────────────────────────────────────────────────────────

export type VibeProfile = {
  energyLevel: 'low' | 'medium' | 'high'
  mood: string[]
  tempo: 'slow' | 'mid' | 'fast'
  genres: string[]
  instrumentation: string[]
  lyricFocus: 'instrumental' | 'background-vocals' | 'lyric-forward'
  keywords: string[]
}

export type ScoredSong = {
  id: string
  score: number
}
