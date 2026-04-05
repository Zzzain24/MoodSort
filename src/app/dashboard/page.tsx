import Image from "next/image";
import { Music2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  getSpotifyToken,
  getLikedSongsCount,
  getUserPlaylists,
  getPlaylistThumbnail,
} from "@/lib/spotify";
import { SyncButton } from "@/components/dashboard/SyncButton";
import { PENDING_REVIEW_COUNT } from "@/lib/constants";

const RECENT_SONGS = [
  { title: "Let It Happen", artist: "Tame Impala", mood: "Chill Nights" },
  { title: "Cant Say", artist: "Travis Scott", mood: "Hype Mode" },
  { title: "Nights", artist: "Frank Ocean", mood: "Late Night" },
  { title: "Borderline", artist: "Tame Impala", mood: "Deep Focus" },
  { title: "Gasoline", artist: "The Weeknd", mood: "Hype Mode" },
];

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const displayName =
    user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? "there";
  const firstName = displayName.split(" ")[0];

  // Fetch real Spotify data — getUserPlaylists is deduped with the layout call
  const token = await getSpotifyToken();
  const [likedCount, playlists] = await Promise.all([
    token ? getLikedSongsCount(token) : Promise.resolve(null),
    token ? getUserPlaylists(token) : Promise.resolve([]),
  ]);

  const likedSongsDisplay =
    likedCount !== null ? likedCount.toLocaleString() : "—";

  const manualSyncCount = 7;
  const manualSyncThreshold = 10;
  const manualSyncRemaining = manualSyncThreshold - manualSyncCount;
  const manualSyncProgress = (manualSyncCount / manualSyncThreshold) * 100;

  // Placeholder until real sort data comes from the DB
  const sortedCount = 0;
  const sortedPercent =
    likedCount !== null && likedCount > 0
      ? Math.min(Math.round((sortedCount / likedCount) * 100), 100)
      : null;

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8 flex flex-col gap-8 w-full">
      {/* ── Welcome header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-[#1DB954] mb-1">
            Your library
          </p>
          <h1 className="text-3xl font-extrabold text-[#121212] leading-tight">
            Hey, {firstName}
          </h1>
          <p className="text-black/65 mt-1 text-sm">
            Last synced 2 hours ago &middot; Next auto-sync in 6h
          </p>
        </div>
        <SyncButton />
      </div>

      {/* ── Row 1: Core counts ── */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-black/55 mb-3">
          Overview
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Liked songs", value: likedSongsDisplay },
            { label: "Sorted", value: sortedCount > 0 ? sortedCount.toLocaleString() : "—" },
            {
              label: "Playlists",
              value: playlists.length > 0 ? playlists.length : "—",
            },
            {
              label: "Pending review",
              value: PENDING_REVIEW_COUNT,
              accent: PENDING_REVIEW_COUNT > 0,
            },
          ].map(({ label, value, accent }) => (
            <div
              key={label}
              className="bg-[#ECEAE4]/60 border border-black/[0.08] rounded-2xl px-5 py-4"
            >
              <p
                className={`text-2xl font-extrabold ${accent ? "text-[#1DB954]" : "text-[#121212]"}`}
              >
                {value}
              </p>
              <p className="text-xs text-black/65 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Row 2: Sync status ── */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-black/55 mb-3">
          Sync status
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-[#ECEAE4]/60 border border-black/[0.08] rounded-2xl px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-[#121212]">
                Manual sync progress
              </p>
              <span className="text-[11px] font-semibold text-black/65">
                {manualSyncCount} / {manualSyncThreshold} songs
              </span>
            </div>
            <div className="w-full h-1.5 bg-black/[0.08] rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-[#1DB954] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(manualSyncProgress, 100)}%` }}
              />
            </div>
            <p className="text-xs text-black/65">
              {manualSyncRemaining > 0
                ? `${manualSyncRemaining} more song${manualSyncRemaining !== 1 ? "s" : ""} to unlock Run MoodSort Now`
                : "Ready — run a manual sync anytime"}
            </p>
          </div>

          <div className="bg-[#ECEAE4]/60 border border-black/[0.08] rounded-2xl px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-[#121212]">Auto-sync</p>
              <div className="flex items-center gap-1.5 bg-[#1DB954]/10 border border-[#1DB954]/20 rounded-full px-2.5 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1DB954] animate-pulse" />
                <span className="text-[11px] font-semibold text-[#1DB954]">
                  Next in 6h
                </span>
              </div>
            </div>
            <p className="text-xs text-black/65">Last synced 2 hours ago</p>
            <p className="text-xs text-black/55 mt-0.5">
              Runs daily — new liked songs sorted automatically
            </p>
          </div>
        </div>
      </div>

      {/* ── Row 3: Fun Spotify stats ── */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-black/55 mb-3">
          Your vibe
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-[#ECEAE4]/60 border border-black/[0.08] rounded-2xl px-5 py-4 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#1a6b3c]/10 to-transparent pointer-events-none" />
            <p className="text-xs text-black/65 mb-1 relative">
              Top mood this week
            </p>
            <p className="text-lg font-extrabold text-[#121212] relative leading-tight">
              Chill Nights
            </p>
            <p className="text-[11px] text-black/60 mt-1 relative">
              Most active playlist lately
            </p>
            <span className="absolute bottom-4 right-4 text-[9px] font-bold tracking-widest text-[#1DB954]/40 uppercase">
              CHILL
            </span>
          </div>

          <div className="bg-[#ECEAE4]/60 border border-black/[0.08] rounded-2xl px-5 py-4 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#6b1a8b]/8 to-transparent pointer-events-none" />
            <p className="text-xs text-black/65 mb-1 relative">
              Recently growing
            </p>
            <p className="text-lg font-extrabold text-[#121212] relative leading-tight">
              Hype Mode
            </p>
            <p className="text-[11px] text-black/60 mt-1 relative">
              +8 songs added this week
            </p>
            <span className="absolute bottom-4 right-4 text-[9px] font-bold tracking-widest text-purple-400/40 uppercase">
              HYPE
            </span>
          </div>

          <div className="bg-[#ECEAE4]/60 border border-black/[0.08] rounded-2xl px-5 py-4">
            <p className="text-xs text-black/65 mb-1">Library sorted</p>
            <div className="flex items-end gap-1.5 mb-2">
              <p className="text-3xl font-extrabold text-[#121212] leading-none">
                {sortedPercent !== null ? `${sortedPercent}%` : "—"}
              </p>
              <p className="text-xs text-black/60 mb-0.5">of liked songs</p>
            </div>
            {sortedPercent !== null && (
              <div className="w-full h-1.5 bg-black/[0.08] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#1DB954] rounded-full"
                  style={{ width: `${sortedPercent}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mood playlists (real Spotify data) ── */}
      {playlists.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-black/55">
              Your playlists
            </p>
            <span className="text-[11px] text-black/55">Opens in Spotify</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {playlists.map((pl) => {
              const thumb = getPlaylistThumbnail(pl.images);
              return (
                <a
                  key={pl.id}
                  href={pl.external_urls.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-[#ECEAE4]/60 border border-black/[0.08] rounded-xl overflow-hidden hover:border-[#1DB954]/30 hover:shadow-[0_4px_16px_rgba(29,185,84,0.10)] transition-all duration-300"
                >
                  {/* Square card — cover art fills the card, info overlaid at bottom */}
                  <div className="aspect-square w-full bg-black/[0.06] relative overflow-hidden">
                    {thumb ? (
                      <Image
                        src={thumb}
                        alt={pl.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music2 className="w-8 h-8 text-black/15" />
                      </div>
                    )}
                    {/* Name + count overlaid on the image */}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2.5">
                      <p className="text-xs font-bold text-white leading-tight truncate">
                        {pl.name}
                      </p>
                      <p className="text-[10px] text-white/70 mt-0.5">
                        {pl.tracks?.total ?? 0} songs
                      </p>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Bottom row: recently sorted + pending review ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-8">
        <div className="bg-[#ECEAE4]/60 border border-black/[0.08] rounded-2xl px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-black/55 mb-3">
            Recently sorted
          </p>
          <div className="flex flex-col gap-2.5">
            {RECENT_SONGS.map((song) => (
              <div key={song.title} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-black/[0.07] shrink-0 flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-[#1DB954]"
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
                  <p className="text-[11px] text-black/60 truncate leading-tight">
                    {song.artist}
                  </p>
                </div>
                <span className="text-[10px] text-black/55 shrink-0">
                  {song.mood}
                </span>
              </div>
            ))}
          </div>
        </div>

        {PENDING_REVIEW_COUNT > 0 && (
          <div className="bg-[#ECEAE4]/60 border border-black/[0.08] rounded-2xl px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-black/55">
                Pending review
              </p>
              <span className="text-[10px] font-bold bg-[#1DB954]/15 text-[#1DB954] rounded-full px-2 py-0.5">
                {PENDING_REVIEW_COUNT} songs
              </span>
            </div>
            <p className="text-sm text-black/65 leading-relaxed mb-4">
              These songs couldn&apos;t be confidently clustered. Review them to
              keep your playlists tight.
            </p>
            <button className="w-full rounded-xl border border-black/[0.10] bg-[#F5F4F0] hover:border-[#1DB954]/40 text-sm font-semibold text-[#121212] py-2.5 transition-all duration-200">
              Review songs →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
