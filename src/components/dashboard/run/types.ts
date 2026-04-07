// LikedSong is the canonical type — imported from lib so it matches what the
// server fetches and passes down to the wizard.
export type { LikedSong } from "@/lib/spotify";

export interface MatchedSong {
  id: string;
  name: string;
  artist: string;
  albumArt?: string;
  matchScore: number;
}

export interface WizardState {
  playlistName: string;
  vibeDescription: string;
  selectedSeedIds: string[];
  removedMatchIds: string[];
}
