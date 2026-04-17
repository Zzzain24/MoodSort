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
import { formatRelativeTime } from "@/lib/format-time";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const displayName =
    user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? "there";
  const firstName = displayName.split(" ")[0];

  const admin = createAdminClient();
  const songCountResult = await admin
    .from("user_songs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user!.id);

  if ((songCountResult.count ?? 0) === 0) {
    return <InitialSyncLoader />;
  }

  const token = await getOrRefreshSpotifyToken();
  const [
    likedCount,
    playlists,
    syncStateRow,
    playlistsData,
    latestSongResult,
    biggestPlaylistResult,
  ] = await Promise.all([
    token ? getLikedSongsCount(token) : Promise.resolve(null),
    token ? getUserPlaylists(token) : Promise.resolve([]),
    admin
      .from("user_sync_state")
      .select("last_synced_at")
      .eq("user_id", user!.id)
      .maybeSingle(),
    admin
      .from("playlists")
      .select("song_count")
      .eq("user_id", user!.id),
    admin
      .from("user_songs")
      .select("added_at, songs(name, artist)")
      .eq("user_id", user!.id)
      .order("added_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    admin
      .from("playlists")
      .select("name, song_count")
      .eq("user_id", user!.id)
      .order("song_count", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const lastSyncedAt =
    (syncStateRow.data?.last_synced_at as string | null) ?? null;
  const lastSyncedLabel = lastSyncedAt
    ? formatRelativeTime(new Date(lastSyncedAt))
    : null;

  const likedSongsDisplay =
    likedCount !== null ? likedCount.toLocaleString() : "—";

  const moodSortPlaylistCount = playlistsData.data?.length ?? 0;
  const songsSorted =
    playlistsData.data?.reduce((sum, p) => sum + (p.song_count ?? 0), 0) ?? 0;

  const latestAddedAt =
    (latestSongResult.data?.added_at as string | null) ?? null;
  const latestAddedLabel = latestAddedAt
    ? formatRelativeTime(new Date(latestAddedAt))
    : "—";

  const latestSong = latestSongResult.data?.songs as
    | { name: string; artist: string }
    | null;

  const biggestPlaylist = biggestPlaylistResult.data as
    | { name: string; song_count: number }
    | null;

  const sortedPercent =
    likedCount !== null && likedCount > 0
      ? Math.min(Math.round((songsSorted / likedCount) * 100), 100)
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
            { label: "MoodSort playlists", value: moodSortPlaylistCount },
            {
              label: "Songs sorted",
              value:
                songsSorted > 0 ? songsSorted.toLocaleString() : "—",
            },
            { label: "Latest added", value: latestAddedLabel },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="bg-[#ECEAE4]/60 border border-black/[0.08] rounded-2xl px-4 md:px-5 py-3 md:py-4"
            >
              <p className="text-2xl font-extrabold text-[#121212]">{value}</p>
              <p className="text-xs text-black/65 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Row 2: Your Vibe ── */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-black/55 mb-3">
          Your vibe
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {/* Latest liked song */}
          <div className="bg-[#ECEAE4]/60 border border-black/[0.08] rounded-2xl px-4 md:px-5 py-3 md:py-4 overflow-hidden relative">
            <p className="text-xs text-black/65 mb-1">Latest liked</p>
            <p className="text-base md:text-lg font-extrabold text-[#121212] leading-tight truncate">
              {latestSong?.name ?? "—"}
            </p>
            <p className="text-[11px] text-black/60 mt-1 truncate">
              {latestSong?.artist ?? "No songs yet"}
            </p>
          </div>

          {/* Biggest playlist */}
          <div className="bg-[#ECEAE4]/60 border border-black/[0.08] rounded-2xl px-4 md:px-5 py-3 md:py-4 overflow-hidden relative">
            <p className="text-xs text-black/65 mb-1">Biggest playlist</p>
            <p className="text-base md:text-lg font-extrabold text-[#121212] leading-tight truncate">
              {biggestPlaylist?.name ?? "—"}
            </p>
            <p className="text-[11px] text-black/60 mt-1">
              {biggestPlaylist
                ? `${biggestPlaylist.song_count} songs`
                : "No playlists yet"}
            </p>
          </div>

          {/* Library covered % */}
          <div className="col-span-2 md:col-span-1 bg-[#ECEAE4]/60 border border-black/[0.08] rounded-2xl px-4 md:px-5 py-3 md:py-4">
            <p className="text-xs text-black/65 mb-1">Library covered</p>
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

      {/* ── Playlists carousel ── */}
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
    </div>
  );
}
