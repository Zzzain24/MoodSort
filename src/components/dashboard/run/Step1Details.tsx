"use client";

interface Step1DetailsProps {
  playlistName: string;
  vibeDescription: string;
  onPlaylistNameChange: (value: string) => void;
  onVibeDescriptionChange: (value: string) => void;
  onNext: () => void;
}

export function Step1Details({
  playlistName,
  vibeDescription,
  onPlaylistNameChange,
  onVibeDescriptionChange,
  onNext,
}: Step1DetailsProps) {
  const canProceed = playlistName.trim().length > 0;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-[#121212] tracking-tight">
          Name your playlist
        </h1>
        <p className="mt-1 text-sm text-black/55">
          Give it a name and optionally describe the vibe — MoodSort will use
          this to find the right songs.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {/* Playlist name */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="playlist-name"
            className="text-sm font-semibold text-[#121212]"
          >
            Playlist name <span className="text-[#1DB954]">*</span>
          </label>
          <input
            id="playlist-name"
            type="text"
            value={playlistName}
            onChange={(e) => onPlaylistNameChange(e.target.value)}
            maxLength={50}
            placeholder="e.g. Locked In, Late Night Drive, Hype Mode"
            className="w-full rounded-xl border border-black/[0.12] bg-white/60 px-4 py-3 text-sm text-[#121212] placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-[#1DB954]/40 focus:border-[#1DB954]/60 transition-all"
          />
          <p className="text-[11px] text-black/40 text-right">
            {playlistName.length} / 50
          </p>
        </div>

        {/* Vibe description */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="vibe-description"
            className="text-sm font-semibold text-[#121212]"
          >
            Vibe description{" "}
            <span className="font-normal text-black/40">(optional)</span>
          </label>
          <textarea
            id="vibe-description"
            value={vibeDescription}
            onChange={(e) => onVibeDescriptionChange(e.target.value)}
            maxLength={200}
            rows={3}
            placeholder="e.g. deep focus, no lyrics, cinematic, slow build"
            className="w-full rounded-xl border border-black/[0.12] bg-white/60 px-4 py-3 text-sm text-[#121212] placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-[#1DB954]/40 focus:border-[#1DB954]/60 transition-all resize-none"
          />
          <p className="text-[11px] text-black/40 text-right">
            {vibeDescription.length} / 200
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={!canProceed}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
            canProceed
              ? "bg-[#1DB954] text-white hover:bg-[#1DB954]/90 shadow-sm"
              : "bg-black/[0.06] text-black/30 cursor-not-allowed"
          }`}
        >
          Next
          <span className="text-base leading-none">→</span>
        </button>
      </div>
    </div>
  );
}
