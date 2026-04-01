import { redirect } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — MoodSort",
};

const PLACEHOLDER_PLAYLISTS = [
  {
    name: "Chill Nights",
    description: "Low energy · Late evening vibes",
    count: 47,
    gradient: "from-[#1a6b3c] to-[#0d3d22]",
    label: "CHILL",
    labelColor: "#1DB954",
  },
  {
    name: "Hype Mode",
    description: "High energy · Peak intensity",
    count: 31,
    gradient: "from-[#6b1a8b] to-[#3a0d4a]",
    label: "HYPE",
    labelColor: "#a855f7",
  },
  {
    name: "Deep Focus",
    description: "Steady tempo · Minimal distraction",
    count: 58,
    gradient: "from-[#1a3d8b] to-[#0d1f4a]",
    label: "FOCUS",
    labelColor: "#06b6d4",
  },
  {
    name: "Late Night",
    description: "Dark · Introspective · Slow",
    count: 24,
    gradient: "from-[#6b3a1a] to-[#3a1d0a]",
    label: "NIGHT",
    labelColor: "#f59e0b",
  },
];

const RECENT_SONGS = [
  { title: "Let It Happen", artist: "Tame Impala", mood: "Chill Nights" },
  { title: "Cant Say", artist: "Travis Scott", mood: "Hype Mode" },
  { title: "Nights", artist: "Frank Ocean", mood: "Late Night" },
  { title: "Borderline", artist: "Tame Impala", mood: "Deep Focus" },
  { title: "Gasoline", artist: "The Weeknd", mood: "Hype Mode" },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const displayName =
    user.user_metadata?.full_name ?? user.user_metadata?.name ?? "there";
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;

  return (
    <div
      className="min-h-screen bg-[#F5F4F0]"
      style={{ fontFamily: "var(--font-manrope)" }}
    >
      {/* ── Top nav ── */}
      <header className="sticky top-0 z-40 bg-[#F5F4F0]/80 backdrop-blur-md border-b border-black/[0.08]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-1">
            <span className="text-lg font-bold tracking-tight text-[#121212]">
              Mood
            </span>
            <span className="text-lg font-bold tracking-tight text-[#1DB954]">
              Sort
            </span>
          </a>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Next sync badge */}
            <div className="hidden sm:flex items-center gap-2 bg-[#ECEAE4] border border-black/[0.08] rounded-full px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1DB954] animate-pulse" />
              <span className="text-xs text-black/50 font-medium">
                Next sync in 6h
              </span>
            </div>

            {/* Avatar + name */}
            <div className="flex items-center gap-2.5">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={displayName}
                  width={32}
                  height={32}
                  className="rounded-full object-cover border border-black/10"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#1DB954]/20 border border-[#1DB954]/30 flex items-center justify-center">
                  <span className="text-xs font-bold text-[#1DB954]">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="text-sm font-medium text-[#121212] hidden sm:block">
                {displayName}
              </span>
            </div>

            {/* Sign out */}
            <form action="/auth/signout" method="POST">
              <button
                type="submit"
                className="text-sm text-black/40 hover:text-black/70 transition-colors duration-200"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 flex flex-col gap-12">
        {/* ── Welcome banner ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-[#1DB954] mb-1">
              Your library
            </p>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#121212] leading-tight">
              Hey, {displayName.split(" ")[0]} 👋
            </h1>
            <p className="text-black/45 mt-1 text-sm">
              Your mood playlists are ready. Last synced 2 hours ago.
            </p>
          </div>
          <button className="inline-flex items-center gap-2 self-start sm:self-auto rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold px-5 py-2.5 text-sm transition-all duration-200 hover:scale-105 hover:shadow-[0_0_24px_rgba(29,185,84,0.35)]">
            <svg
              className="w-4 h-4"
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
            Sync now
          </button>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Liked songs", value: "1,284" },
            { label: "Sorted", value: "160" },
            { label: "Playlists", value: "4" },
            { label: "Pending review", value: "12" },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="bg-[#ECEAE4]/60 border border-black/[0.08] rounded-2xl px-5 py-4"
            >
              <p className="text-2xl font-extrabold text-[#121212]">{value}</p>
              <p className="text-xs text-black/45 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Mood playlists ── */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-[#121212]">
              Your mood playlists
            </h2>
            <span className="text-xs text-black/35">Opens in Spotify →</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLACEHOLDER_PLAYLISTS.map((pl) => (
              <div
                key={pl.name}
                className="group bg-[#ECEAE4]/60 border border-black/[0.08] rounded-2xl overflow-hidden hover:border-black/20 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 cursor-pointer"
              >
                {/* Gradient cover art */}
                <div
                  className={`h-28 bg-gradient-to-br ${pl.gradient} flex items-end p-4`}
                >
                  <span
                    className="text-[10px] font-bold tracking-widest opacity-60"
                    style={{ color: pl.labelColor }}
                  >
                    {pl.label}
                  </span>
                </div>
                {/* Info */}
                <div className="px-4 py-3.5">
                  <p className="text-sm font-bold text-[#121212] leading-tight">
                    {pl.name}
                  </p>
                  <p className="text-[11px] text-black/40 mt-0.5 leading-tight">
                    {pl.description}
                  </p>
                  <p className="text-[11px] text-black/30 mt-2">
                    {pl.count} songs
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom row: recent sorts + pending review ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recently sorted */}
          <div className="bg-[#ECEAE4]/60 border border-black/[0.08] rounded-2xl px-6 py-5">
            <h2 className="text-sm font-bold text-[#121212] mb-4">
              Recently sorted
            </h2>
            <div className="flex flex-col gap-3">
              {RECENT_SONGS.map((song) => (
                <div key={song.title} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-black/[0.08] shrink-0 flex items-center justify-center">
                    <svg
                      className="w-3.5 h-3.5 text-[#1DB954]"
                      viewBox="0 0 12 12"
                      fill="currentColor"
                    >
                      <path d="M10 6L4 2v8l6-4z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-[#121212] truncate leading-tight">
                      {song.title}
                    </p>
                    <p className="text-[11px] text-black/40 truncate leading-tight">
                      {song.artist}
                    </p>
                  </div>
                  <span className="text-[10px] text-black/30 shrink-0">
                    {song.mood}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pending review placeholder */}
          <div className="bg-[#ECEAE4]/60 border border-black/[0.08] rounded-2xl px-6 py-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[#121212]">
                Pending review
              </h2>
              <span className="text-[10px] font-semibold bg-[#1DB954]/15 text-[#1DB954] rounded-full px-2 py-0.5">
                12 songs
              </span>
            </div>
            <p className="text-sm text-black/40 leading-relaxed mb-5">
              These songs couldn&apos;t be confidently clustered. Review them to
              keep your playlists tight.
            </p>
            <button className="w-full rounded-xl border border-black/[0.12] bg-[#F5F4F0] hover:border-[#1DB954]/40 hover:bg-[#F5F4F0] text-sm font-semibold text-[#121212] py-2.5 transition-all duration-200">
              Review songs →
            </button>
          </div>
        </div>

        {/* ── Placeholder empty state banner ── */}
        <div className="bg-gradient-to-br from-[#1DB954]/8 to-[#1DB954]/3 border border-[#1DB954]/20 rounded-2xl px-6 py-6 flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-10 h-10 rounded-xl bg-[#1DB954]/15 flex items-center justify-center shrink-0">
            <svg
              className="w-5 h-5 text-[#1DB954]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4l3 3" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-[#121212]">
              Full sync coming soon
            </p>
            <p className="text-sm text-black/45 mt-0.5">
              MoodSort will automatically sort all 1,284 of your liked songs
              once the AI pipeline is live.
            </p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold px-5 py-2 text-sm transition-all duration-200 hover:scale-105 shrink-0">
            Get notified
          </button>
        </div>
      </main>
    </div>
  );
}
