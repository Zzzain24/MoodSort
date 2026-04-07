export interface LikedSong {
  id: string;         // Spotify track ID
  name: string;
  artist: string;
  albumArt?: string;
}

export interface MatchedSong {
  id: string;
  name: string;
  artist: string;
  albumArt?: string;
  matchScore: number;
}

