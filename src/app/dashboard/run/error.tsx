"use client";

import { AlertTriangle } from "lucide-react";

export default function RunMoodSortError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {

  return (
    <div className="px-6 py-8 md:px-10 md:py-10 flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4 text-center max-w-sm">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <p className="font-semibold text-[#121212]">Something went wrong</p>
          <p className="mt-1 text-sm text-black/50">
            We couldn&apos;t load your liked songs. Check your Spotify connection and try again.
          </p>
        </div>
        <button
          onClick={reset}
          className="px-5 py-2 rounded-xl bg-[#1DB954] text-white text-sm font-semibold hover:bg-[#1DB954]/90 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
