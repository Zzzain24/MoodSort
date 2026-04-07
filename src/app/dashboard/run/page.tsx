import { getSpotifyToken, getLikedSongs } from "@/lib/spotify";
import { CreatePlaylistWizard } from "@/components/dashboard/run/CreatePlaylistWizard";

export default async function RunMoodSortPage() {
  const token = await getSpotifyToken();
  const songs = token ? await getLikedSongs(token) : [];

  return (
    <div className="px-6 py-8 md:px-10 md:py-10">
      <CreatePlaylistWizard songs={songs} />
    </div>
  );
}
