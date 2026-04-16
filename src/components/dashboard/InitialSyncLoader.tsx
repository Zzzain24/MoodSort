"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function InitialSyncLoader() {
  const router = useRouter();
  const [error, setError] = useState(false);
  const [bypassed, setBypassed] = useState(false);

  useEffect(() => {
    fetch("/api/sync/initial", { method: "POST" })
      .then((res) => {
        if (res.ok || res.status === 429) router.refresh();
        else setError(true);
      })
      .catch(() => setError(true));
  }, [router]);

  if (bypassed) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-[#F5F4F0] px-6"
      style={{ fontFamily: "var(--font-manrope)" }}
    >
      <a href="/" className="flex items-center gap-1">
        <span className="text-2xl font-bold tracking-tight text-[#121212]">Mood</span>
        <span className="text-2xl font-bold tracking-tight text-[#1DB954]">Sort</span>
      </a>

      {error ? (
        <>
          <div className="text-center">
            <p className="text-base font-bold text-[#121212]">Couldn&apos;t import your library</p>
            <p className="text-sm text-black/50 mt-1">
              Something went wrong. You can retry from the dashboard.
            </p>
          </div>
          <button
            onClick={() => setBypassed(true)}
            className="rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold px-6 py-2.5 text-sm transition-all duration-200"
          >
            Continue anyway
          </button>
        </>
      ) : (
        <>
          <svg
            className="w-8 h-8 animate-spin text-[#1DB954]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M1 4v6h6M23 20v-6h-6" />
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" />
          </svg>
          <div className="text-center">
            <p className="text-base font-bold text-[#121212]">Importing your liked songs</p>
            <p className="text-sm text-black/50 mt-1">This only happens once — won&apos;t take long</p>
          </div>
        </>
      )}
    </div>
  );
}
