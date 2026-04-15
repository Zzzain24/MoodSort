"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Step1Details } from "./Step1Details";
import { Step2SeedPicker } from "./Step2SeedPicker";
import { Step3Preview } from "./Step3Preview";
import type { LikedSong, MatchedSong } from "./types";
import type { AnalyzeResponse, CreatePlaylistResponse } from "@/lib/playlist-types";

type Step = 1 | 2 | 3;

const STEPS: { label: string }[] = [
  { label: "Details" },
  { label: "Seed songs" },
  { label: "Preview" },
];

interface CreatePlaylistWizardProps {
  songs: LikedSong[];
}

export function CreatePlaylistWizard({ songs }: CreatePlaylistWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [playlistName, setPlaylistName] = useState("");
  const [vibeDescription, setVibeDescription] = useState("");
  const [selectedSeedIds, setSelectedSeedIds] = useState<string[]>([]);
  const [removedMatchIds, setRemovedMatchIds] = useState<string[]>([]);
  const [matchedSongs, setMatchedSongs] = useState<MatchedSong[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  const seedSongs = songs.filter((s) => selectedSeedIds.includes(s.id));

  async function handleAnalyze() {
    setIsAnalyzing(true);
    setAnalyzeError(null);
    try {
      const res = await fetch("/api/playlist/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playlistName, vibeDescription, seedSongIds: selectedSeedIds }),
      });
      if (!res.ok) {
        setAnalyzeError("Analysis failed. Please try again.");
        return;
      }
      const data = (await res.json()) as AnalyzeResponse;
      setMatchedSongs(data.matchedSongs);
      setStep(3);
    } catch {
      setAnalyzeError("Network error. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function handleConfirm() {
    const finalSongIds = [
      ...selectedSeedIds,
      ...matchedSongs
        .filter((s) => !removedMatchIds.includes(s.id))
        .map((s) => s.id),
    ];
    setIsCreating(true);
    setCreateError(null);
    try {
      const res = await fetch("/api/playlist/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playlistName, vibeDescription, songIds: finalSongIds }),
      });
      if (!res.ok) {
        setCreateError("Failed to create playlist. Please try again.");
        return;
      }
      const data = (await res.json()) as CreatePlaylistResponse;
      void data;
      router.push("/dashboard");
    } catch {
      setCreateError("Network error. Please try again.");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto">
      {/* Stepper */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => {
          const num = i + 1;
          const isActive = num === step;
          const isDone = num < step;
          return (
            <div key={s.label} className="flex items-center gap-0 flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-200 ${
                    isDone
                      ? "bg-[#1DB954] text-white"
                      : isActive
                      ? "bg-[#121212] text-white"
                      : "bg-black/[0.08] text-black/35"
                  }`}
                >
                  {isDone ? "✓" : num}
                </div>
                <span
                  className={`text-[11px] font-medium transition-colors duration-200 ${
                    isActive ? "text-[#121212]" : "text-black/35"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-px mx-2 mb-4 transition-colors duration-200 ${
                    isDone ? "bg-[#1DB954]/40" : "bg-black/[0.10]"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div className="bg-white/60 rounded-2xl border border-black/[0.07] shadow-sm p-8">
        {step === 1 && (
          <Step1Details
            playlistName={playlistName}
            vibeDescription={vibeDescription}
            onPlaylistNameChange={setPlaylistName}
            onVibeDescriptionChange={setVibeDescription}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <Step2SeedPicker
            songs={songs}
            selectedSeedIds={selectedSeedIds}
            onSelectionChange={setSelectedSeedIds}
            onNext={handleAnalyze}
            onBack={() => setStep(1)}
            isLoading={isAnalyzing}
            error={analyzeError}
          />
        )}
        {step === 3 && (
          <Step3Preview
            playlistName={playlistName}
            seedSongs={seedSongs}
            matchedSongs={matchedSongs}
            removedMatchIds={removedMatchIds}
            onRemoveMatch={(id) => setRemovedMatchIds((prev) => [...prev, id])}
            onRestoreMatch={(id) =>
              setRemovedMatchIds((prev) => prev.filter((r) => r !== id))
            }
            onBack={() => setStep(2)}
            onConfirm={handleConfirm}
            isCreating={isCreating}
            error={createError}
          />
        )}
      </div>
    </div>
  );
}
