"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Search, Music2, CheckCircle2 } from "lucide-react";
import type { LikedSong } from "./types";

const MAX_SEEDS = 10;

interface Step2SeedPickerProps {
  songs: LikedSong[];
  selectedSeedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
  error: string | null;
}

export function Step2SeedPicker({
  songs,
  selectedSeedIds,
  onSelectionChange,
  onNext,
  onBack,
  isLoading,
  error,
}: Step2SeedPickerProps) {
  const [query, setQuery] = useState("");
  const [shakeId, setShakeId] = useState<string | null>(null);
  const shakeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear the shake timeout on unmount to avoid setState on unmounted component
  useEffect(() => {
    return () => {
      if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
    };
  }, []);

  const filtered = songs.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.artist.toLowerCase().includes(query.toLowerCase())
  );

  const canProceed = selectedSeedIds.length === MAX_SEEDS;

  function toggleSong(id: string) {
    if (selectedSeedIds.includes(id)) {
      onSelectionChange(selectedSeedIds.filter((s) => s !== id));
    } else if (selectedSeedIds.length < MAX_SEEDS) {
      onSelectionChange([...selectedSeedIds, id]);
    } else {
      // Already at max — trigger shake animation
      if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
      setShakeId(id);
      shakeTimeoutRef.current = setTimeout(() => setShakeId(null), 500);
    }
  }

  return (
    <div className="flex flex-col gap-6 h-full">
      <div>
        <h1 className="text-2xl font-bold text-[#121212] tracking-tight">
          Pick your seed songs
        </h1>
        <p className="mt-1 text-sm text-black/55">
          Select exactly 10 songs that represent the vibe. MoodSort will use
          these to find every matching song in your library.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/35" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search songs or artists..."
          className="w-full rounded-xl border border-black/[0.12] bg-white/60 pl-10 pr-4 py-2.5 text-sm text-[#121212] placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-[#1DB954]/40 focus:border-[#1DB954]/60 transition-all"
        />
      </div>

      {/* Song list */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-black/[0.08] bg-white/40 divide-y divide-black/[0.05] min-h-[280px] max-h-[400px]">
        {songs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-black/35">
            <Music2 className="w-8 h-8" />
            <p className="text-sm">Your liked songs will appear here</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-sm text-black/35">
            No songs match &quot;{query}&quot;
          </div>
        ) : (
          filtered.map((song) => {
            const selected = selectedSeedIds.includes(song.id);
            const isShaking = shakeId === song.id;
            return (
              <button
                key={song.id}
                onClick={() => toggleSong(song.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-100 ${
                  selected
                    ? "bg-[#1DB954]/[0.06] hover:bg-[#1DB954]/[0.10]"
                    : "hover:bg-black/[0.03]"
                } ${isShaking ? "animate-[shake_0.4s_ease-in-out]" : ""}`}
              >
                {/* Album art */}
                <div className="w-9 h-9 rounded-md overflow-hidden shrink-0 bg-black/[0.08] flex items-center justify-center">
                  {song.albumArt ? (
                    <Image
                      src={song.albumArt}
                      alt={song.name}
                      width={36}
                      height={36}
                      className="object-cover"
                    />
                  ) : (
                    <Music2 className="w-4 h-4 text-black/30" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#121212] truncate">
                    {song.name}
                  </p>
                  <p className="text-xs text-black/50 truncate">{song.artist}</p>
                </div>

                {/* Checkbox indicator */}
                {selected ? (
                  <CheckCircle2 className="w-5 h-5 text-[#1DB954] shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-black/20 shrink-0" />
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Max seeds warning */}
      {selectedSeedIds.length === MAX_SEEDS && (
        <p className="text-xs text-[#1DB954] font-medium -mt-3">
          10 seeds selected — you&apos;re ready to analyze!
        </p>
      )}
      {selectedSeedIds.length > 0 && selectedSeedIds.length < MAX_SEEDS && (
        <p className="text-xs text-black/45 -mt-3">
          {MAX_SEEDS - selectedSeedIds.length} more{" "}
          {MAX_SEEDS - selectedSeedIds.length === 1 ? "song" : "songs"} needed
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-sm font-medium text-black/50 hover:text-[#121212] transition-colors"
        >
          ← Back
        </button>

        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-black/50">
            <span className={selectedSeedIds.length === MAX_SEEDS ? "text-[#1DB954]" : ""}>
              {selectedSeedIds.length}
            </span>{" "}
            / {MAX_SEEDS} selected
          </span>
          <button
            onClick={onNext}
            disabled={!canProceed || isLoading}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
              canProceed && !isLoading
                ? "bg-[#1DB954] text-white hover:bg-[#1DB954]/90 shadow-sm"
                : "bg-black/[0.06] text-black/30 cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-black/20 border-t-black/50 rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                Analyze
                <span className="text-base leading-none">→</span>
              </>
            )}
          </button>
        </div>
      </div>
      {error && (
        <p className="text-xs text-red-500 text-right">{error}</p>
      )}
    </div>
  );
}
