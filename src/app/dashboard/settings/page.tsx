import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsClient } from "@/components/dashboard/SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const displayName =
    user.user_metadata?.full_name ?? user.user_metadata?.name ?? "Unknown";
  const email = user.email ?? "";
  const rawAvatar = user.user_metadata?.avatar_url
  const avatarUrl = typeof rawAvatar === 'string' ? rawAvatar : undefined

  return (
    <SettingsClient
      displayName={displayName}
      email={email}
      avatarUrl={avatarUrl}
    />
  );
}
