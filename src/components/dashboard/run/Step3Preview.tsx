"use client";

import Image from "next/image";
import { Lock, Music2, X, AlertTriangle } from "lucide-react";
import type { LikedSong, MatchedSong } from "./types";

interface Step3PreviewProps {
  playlistName: string;
  seedSongs: LikedSong[];
  matchedSongs: MatchedSong[];
  removedMatchIds: string[];
  onRemoveMatch: (id: string) => void;
  onRestoreMatch: (id: string) => void;
  onBack: () => void;
  onConfirm: () => void;
}

function SongRow({
  song,
  locked,
  removed,
  onRemove,
  onRestore,
}: {
  song: LikedSong;
  locked?: boolean;
  removed?: boolean;
  onRemove?: () => void;
  onRestore?: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-2.5 transition-opacity ${
        removed ? "opacity-40" : ""
      }`}
    >
      <div className="w-8 h-8 rounded-md overflow-hidden shrink-0 bg-black/[0.08] flex items-center justify-center">
        {song.albumArt ? (
          <Image
            src={song.albumArt}
            alt={song.name}
            width={32}
            height={32}
            className="object-cover"
          />
        ) : (
          <Music2 className="w-3.5 h-3.5 text-black/30" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#121212] truncate">{song.name}</p>
        <p className="text-xs text-black/50 truncate">{song.artist}</p>
      </div>
      {locked && (
        <Lock className="w-3.5 h-3.5 text-black/25 shrink-0" title="Seed song — cannot be removed" />
      )}
      {!locked && !removed && onRemove && (
        <button
          onClick={onRemove}
          className="w-6 h-6 flex items-center justify-center rounded-full text-black/30 hover:text-black/70 hover:bg-black/[0.06] transition-colors shrink-0"
          title="Remove from playlist"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
      {!locked && removed && onRestore && (
        <button
          onClick={onRestore}
          className="text-[11px] font-medium text-[#1DB954] hover:underline shrink-0"
        >
          Restore
        </button>
      )}
    </div>
  );
}

export function Step3Preview({
  playlistName,
  seedSongs,
  matchedSongs,
  removedMatchIds,
  onRemoveMatch,
  onRestoreMatch,
  onBack,
  onConfirm,
}: Step3PreviewProps) {
  const visibleMatches = matchedSongs.filter((s) => !removedMatchIds.includes(s.id));
  const removedMatches = matchedSongs.filter((s) => removedMatchIds.includes(s.id));
  // Only warn when analysis has run (matchedSongs populated) but produced fewer than 3 non-seed matches
  const tooFewMatches = matchedSongs.length > 0 && visibleMatches.length < 3;
  const totalSongs = seedSongs.length + visibleMatches.length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-[#121212] tracking-tight">
          Preview your playlist
        </h1>
        <p className="mt-1 text-sm text-black/55">
          Review the songs MoodSort found for{" "}
          <span className="font-semibold text-[#121212]">{playlistName}</span>.
          Remove anything that doesn&apos;t fit.
        </p>
      </div>

      {/* Low-match warning */}
      {tooFewMatches && (
        <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            Only your seed songs matched this vibe. Your playlist will be
            created with just these — you can always add more later.
          </p>
        </div>
      )}

      {/* Song list */}
      <div className="rounded-xl border border-black/[0.08] bg-white/40 overflow-hidden">
        {/* Seed songs */}
        <div className="px-4 py-2 bg-black/[0.03] border-b border-black/[0.06]">
          <p className="text-[11px] font-semibold text-black/40 uppercase tracking-wider">
            Seed songs ({seedSongs.length})
          </p>
        </div>
        <div className="divide-y divide-black/[0.05]">
          {seedSongs.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-black/30">
              Seed songs will appear here
            </p>
          ) : (
            seedSongs.map((song) => (
              <SongRow key={song.id} song={song} locked />
            ))
          )}
        </div>

        {/* Matched songs */}
        <div className="px-4 py-2 bg-black/[0.03] border-y border-black/[0.06]">
          <p className="text-[11px] font-semibold text-black/40 uppercase tracking-wider">
            Matched songs ({visibleMatches.length})
          </p>
        </div>
        <div className="divide-y divide-black/[0.05]">
          {matchedSongs.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-black/30">
              Matched songs will appear here after analysis
            </p>
          ) : (
            <>
              {visibleMatches.map((song) => (
                <SongRow
                  key={song.id}
                  song={song}
                  onRemove={() => onRemoveMatch(song.id)}
                />
              ))}
              {removedMatches.map((song) => (
                <SongRow
                  key={song.id}
                  song={song}
                  removed
                  onRestore={() => onRestoreMatch(song.id)}
                />
              ))}
            </>
          )}
        </div>
      </div>

      {totalSongs > 0 && (
        <p className="text-xs text-black/40 -mt-3">
          {totalSongs} song{totalSongs !== 1 ? "s" : ""} will be added to Spotify
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="text-sm font-medium text-black/50 hover:text-[#121212] transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={onConfirm}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1DB954] text-white text-sm font-semibold hover:bg-[#1DB954]/90 shadow-sm transition-all duration-150"
        >
          Create Playlist
        </button>
      </div>
    </div>
  );
}
