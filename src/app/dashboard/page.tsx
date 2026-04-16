import { createClient } from "@/lib/supabase/server";
import {
  getOrRefreshSpotifyToken,
  getLikedSongsCount,
  getUserPlaylists,
} from "@/lib/spotify";
import { createAdminClient } from "@/lib/supabase/admin";
import { SyncButton } from "@/components/dashboard/SyncButton";
import { PlaylistCarousel } from "@/components/dashboard/PlaylistCarousel";
import { InitialSyncLoader } from "@/components/dashboard/InitialSyncLoader";
import { PENDING_REVIEW_COUNT } from "@/lib/constants";

function formatRelativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}


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
  const admin = createAdminClient();
  const songCountResult = await admin
    .from("user_songs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user!.id);

  if ((songCountResult.count ?? 0) === 0) {
    return <InitialSyncLoader />;
  }

  const token = await getOrRefreshSpotifyToken();
  const [likedCount, playlists, syncStateRow] = await Promise.all([
    token ? getLikedSongsCount(token) : Promise.resolve(null),
    token ? getUserPlaylists(token) : Promise.resolve([]),
    admin
      .from("user_sync_state")
      .select("last_synced_at")
      .eq("user_id", user!.id)
      .maybeSingle(),
  ]);

  const lastSyncedAt =
    (syncStateRow.data?.last_synced_at as string | null) ?? null;
  const lastSyncedLabel = lastSyncedAt
    ? formatRelativeTime(new Date(lastSyncedAt))
    : null;

  const likedSongsDisplay =
    likedCount !== null ? likedCount.toLocaleString() : "—";

  // Placeholder until real sort data comes from the DB
  const sortedCount = 0;
  const sortedPercent =
    likedCount !== null && likedCount > 0
      ? Math.min(Math.round((sortedCount / likedCount) * 100), 100)
      : null;

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-6 pt-8 md:pt-12 pb-8 flex flex-col gap-10 md:gap-8 w-full">
      {/* ── Welcome header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-[#1DB954] mb-1">
            Your library
          </p>
          <h1 className="text-3xl font-extrabold text-[#121212] leading-tight">
            Hey, {firstName}
          </h1>
          {lastSyncedLabel && (
            <p className="text-black/65 mt-1 text-sm">
              Last synced {lastSyncedLabel}
            </p>
          )}
        </div>
        <SyncButton lastSyncedAt={lastSyncedAt} />
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
              className="bg-[#ECEAE4]/60 border border-black/[0.08] rounded-2xl px-4 md:px-5 py-3 md:py-4"
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

      {/* ── Row 2: Fun Spotify stats ── */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-black/55 mb-3">
          Your vibe
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="bg-[#ECEAE4]/60 border border-black/[0.08] rounded-2xl px-4 md:px-5 py-3 md:py-4 overflow-hidden relative">
            <p className="text-xs text-black/65 mb-1">
              Top mood this week
            </p>
            <p className="text-base md:text-lg font-extrabold text-[#121212] leading-tight">
              Chill Nights
            </p>
            <p className="text-[11px] text-black/60 mt-1">
              Most active playlist lately
            </p>
            <span className="absolute bottom-3 right-3 text-[9px] font-bold tracking-widest text-[#1DB954]/40 uppercase">
              CHILL
            </span>
          </div>

          <div className="bg-[#ECEAE4]/60 border border-black/[0.08] rounded-2xl px-4 md:px-5 py-3 md:py-4 overflow-hidden relative">
            <p className="text-xs text-black/65 mb-1">
              Recently growing
            </p>
            <p className="text-base md:text-lg font-extrabold text-[#121212] leading-tight">
              Hype Mode
            </p>
            <p className="text-[11px] text-black/60 mt-1">
              +8 songs added this week
            </p>
            <span className="absolute bottom-3 right-3 text-[9px] font-bold tracking-widest text-purple-400/40 uppercase">
              HYPE
            </span>
          </div>

          <div className="col-span-2 md:col-span-1 bg-[#ECEAE4]/60 border border-black/[0.08] rounded-2xl px-4 md:px-5 py-3 md:py-4">
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
          <PlaylistCarousel playlists={playlists} />
        </div>
      )}

      {/* ── Pending review — full width, only when there are items ── */}
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
  );
}
