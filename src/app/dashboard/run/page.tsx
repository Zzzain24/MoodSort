import { createClient } from "@/lib/supabase/server";
import { CreatePlaylistWizard } from "@/components/dashboard/run/CreatePlaylistWizard";
import type { LikedSong } from "@/components/dashboard/run/types";

export const dynamic = "force-dynamic";

export default async function RunMoodSortPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let songs: LikedSong[] = [];

  if (user) {
    const { data } = await supabase
      .from("user_songs")
      .select("spotify_track_id, songs(name, artist, album_art_url)")
      .eq("user_id", user.id)
      .order("added_at", { ascending: false });

    songs = (data ?? [])
      .map((row) => {
        const song = Array.isArray(row.songs) ? row.songs[0] : row.songs;
        if (!song) return null;
        return {
          id: row.spotify_track_id as string,
          name: song.name as string,
          artist: song.artist as string,
          albumArt: (song.album_art_url as string | null) ?? undefined,
        };
      })
      .filter((s): s is LikedSong => s !== null);
  }

  return (
    <div className="px-6 py-8 md:px-10 md:py-10">
      <CreatePlaylistWizard songs={songs} />
    </div>
  );
}
