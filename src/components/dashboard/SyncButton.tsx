"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SyncButton() {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);

  async function handleSync() {
    setSyncing(true);
    router.refresh(); // re-runs all server components, fetches fresh Spotify data
    // Give the refresh a moment to settle before re-enabling the button
    setTimeout(() => setSyncing(false), 1200);
  }

  return (
    <button
      onClick={handleSync}
      disabled={syncing}
      className="inline-flex items-center gap-2 shrink-0 rounded-full bg-[#1DB954] hover:bg-[#1ed760] disabled:opacity-70 disabled:cursor-not-allowed text-black font-bold px-5 py-2.5 text-sm transition-all duration-200 hover:scale-105 hover:shadow-[0_0_24px_rgba(29,185,84,0.30)]"
    >
      <svg
        className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M1 4v6h6M23 20v-6h-6" />
        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" />
      </svg>
      {syncing ? "Refreshing…" : "Sync now"}
    </button>
  );
}
