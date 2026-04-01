import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { getSpotifyToken, getUserPlaylists } from "@/lib/spotify";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard — MoodSort",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  // Fetch real playlists for the sidebar accordion
  const token = await getSpotifyToken();
  const playlists = token ? await getUserPlaylists(token) : [];

  return (
    <div
      className="flex min-h-screen bg-[#F5F4F0]"
      style={{ fontFamily: "var(--font-manrope)" }}
    >
      <Sidebar
        displayName={displayName}
        avatarUrl={avatarUrl}
        playlists={playlists}
      />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
