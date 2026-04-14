"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const COOLDOWN_MS = 1 * 60 * 1000; // 1 minute

function formatCountdown(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface SyncButtonProps {
  lastSyncedAt: string | null; // ISO string from server, null if never synced
}

export function SyncButton({ lastSyncedAt }: SyncButtonProps) {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ added: number; removed: number } | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [remainingMs, setRemainingMs] = useState<number>(0);

  const inCooldown = remainingMs > 0;

  // Tick down the countdown every second based on lastSyncedAt
  useEffect(() => {
    if (!lastSyncedAt) {
      setRemainingMs(0);
      return;
    }

    function getRemaining() {
      return Math.max(0, COOLDOWN_MS - (Date.now() - new Date(lastSyncedAt!).getTime()));
    }

    const initial = getRemaining();
    setRemainingMs(initial);
    if (initial === 0) return;

    const interval = setInterval(() => {
      const r = getRemaining();
      setRemainingMs(r);
      if (r === 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [lastSyncedAt]);

  async function handleSync() {
    setSyncing(true);
    setSyncResult(null);
    setSyncError(null);

    try {
      const res = await fetch("/api/sync/incremental", { method: "POST" });

      if (res.status === 429) {
        const retryAfter = parseInt(res.headers.get("Retry-After") ?? "300", 10);
        setRemainingMs(retryAfter * 1000);
        return;
      }

      if (!res.ok) {
        setSyncError("Sync failed — try again");
        return;
      }

      const data = (await res.json()) as { added: number; removed: number; lastSyncedAt: string };
      setSyncResult({ added: data.added, removed: data.removed });
      router.refresh();
    } finally {
      setSyncing(false);
    }
  }

  const isDisabled = syncing || inCooldown;

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleSync}
        disabled={isDisabled}
        className={`inline-flex items-center gap-2 shrink-0 rounded-full font-bold px-5 py-2.5 text-sm transition-all duration-200 ${
          isDisabled
            ? "bg-[#1DB954]/50 text-black/40 cursor-not-allowed"
            : "bg-[#1DB954] hover:bg-[#1ed760] text-black hover:scale-105 hover:shadow-[0_0_24px_rgba(29,185,84,0.30)]"
        }`}
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
        {syncing
          ? "Syncing…"
          : inCooldown
          ? `${formatCountdown(remainingMs)}`
          : "Sync now"}
      </button>

      {syncResult !== null && (
        <p className="text-xs text-[#1DB954] font-medium">
          {syncResult.added === 0 && syncResult.removed === 0
            ? "Already up to date"
            : [
                syncResult.added > 0
                  ? `${syncResult.added} song${syncResult.added !== 1 ? "s" : ""} added`
                  : "",
                syncResult.removed > 0
                  ? `${syncResult.removed} removed`
                  : "",
              ]
                .filter(Boolean)
                .join(" · ")}
        </p>
      )}
      {syncError && (
        <p className="text-xs text-red-500 font-medium">{syncError}</p>
      )}
    </div>
  );
}
