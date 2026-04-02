"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  ListMusic,
  ClipboardList,
  SlidersHorizontal,
  Zap,
  Settings,
  ChevronDown,
  ExternalLink,
  Music2,
} from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { getPlaylistThumbnail, type SpotifyPlaylist } from "@/lib/spotify-utils";
import { PENDING_REVIEW_COUNT } from "@/lib/constants";

interface SidebarProps {
  displayName: string;
  avatarUrl?: string;
  playlists: SpotifyPlaylist[];
}

export function Sidebar({ displayName, avatarUrl, playlists }: SidebarProps) {
  const [playlistsOpen, setPlaylistsOpen] = useState(true);
  const pathname = usePathname();

  const firstName = displayName.split(" ")[0];
  const initial = displayName.charAt(0).toUpperCase();

  const navItemClass = (active: boolean) =>
    `flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors duration-150 ${
      active
        ? "bg-black/[0.07] text-[#121212]"
        : "text-black/70 hover:bg-black/[0.05] hover:text-[#121212]"
    }`;

  return (
    <aside className="w-[220px] min-h-screen bg-[#ECEAE4] border-r border-black/[0.08] flex flex-col shrink-0 sticky top-0 h-screen overflow-y-auto">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5">
        <Link href="/dashboard" className="flex items-center gap-0.5">
          <span className="text-base font-bold tracking-tight text-[#121212]">
            Mood
          </span>
          <span className="text-base font-bold tracking-tight text-[#1DB954]">
            Sort
          </span>
        </Link>
      </div>

      <div className="h-px bg-black/[0.07] mx-4" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {/* Home */}
        <Link
          href="/dashboard"
          className={navItemClass(pathname === "/dashboard")}
        >
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          <span className="text-sm font-medium">Home</span>
        </Link>

        {/* My Playlists — accordion */}
        <div>
          <button
            onClick={() => setPlaylistsOpen((o) => !o)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-black/70 hover:bg-black/[0.05] hover:text-[#121212] transition-colors duration-150"
          >
            <ListMusic className="w-4 h-4 shrink-0" />
            <span className="text-sm font-medium flex-1 text-left">
              Playlists
            </span>
            {playlists.length > 0 && (
              <ChevronDown
                className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
                  playlistsOpen ? "rotate-180" : ""
                }`}
              />
            )}
          </button>

          {playlistsOpen && playlists.length > 0 && (
            <div className="mt-0.5 ml-3 pl-4 border-l border-black/[0.10] flex flex-col gap-0.5 max-h-64 overflow-y-auto">
              {playlists.map((pl) => {
                const thumb = getPlaylistThumbnail(pl.images);
                return (
                  <a
                    key={pl.id}
                    href={pl.external_urls.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md text-black/65 hover:text-[#121212] hover:bg-black/[0.05] transition-colors duration-150 group"
                  >
                    {/* Playlist cover or fallback icon */}
                    {thumb ? (
                      <Image
                        src={thumb}
                        alt={pl.name}
                        width={18}
                        height={18}
                        className="rounded-sm object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-[18px] h-[18px] rounded-sm bg-black/[0.10] flex items-center justify-center shrink-0">
                        <Music2 className="w-2.5 h-2.5 text-black/30" />
                      </div>
                    )}
                    <span className="text-[12px] font-medium flex-1 truncate">
                      {pl.name}
                    </span>
                    <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-0 group-hover:opacity-40 transition-opacity" />
                  </a>
                );
              })}
            </div>
          )}

          {playlistsOpen && playlists.length === 0 && (
            <p className="ml-7 mt-1 text-[11px] text-black/55 italic">
              No playlists found
            </p>
          )}
        </div>

        {/* Run Mood Sort */}
        <button
          disabled
          title="Coming soon"
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-black/55 cursor-not-allowed"
        >
          <Zap className="w-4 h-4 shrink-0" />
          <span className="text-sm font-medium flex-1 text-left">
            Run Mood Sort
          </span>
        </button>

        {/* Seed songs */}
        <button
          disabled
          title="Coming soon"
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-black/55 cursor-not-allowed"
        >
          <SlidersHorizontal className="w-4 h-4 shrink-0" />
          <span className="text-sm font-medium flex-1 text-left">
            Seed songs
          </span>
        </button>

        {/* Pending review */}
        <button
          disabled
          title="Coming soon"
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-black/55 cursor-not-allowed"
        >
          <ClipboardList className="w-4 h-4 shrink-0" />
          <span className="text-sm font-medium flex-1 text-left">
            Pending review
          </span>
          {PENDING_REVIEW_COUNT > 0 && (
            <span className="text-[10px] font-bold bg-[#1DB954]/20 text-[#1DB954]/50 rounded-full px-1.5 py-0.5 leading-none">
              {PENDING_REVIEW_COUNT}
            </span>
          )}
        </button>

        <div className="h-px bg-black/[0.07] my-2" />

        {/* Settings */}
        <Link
          href="/dashboard/settings"
          className={navItemClass(pathname === "/dashboard/settings")}
        >
          <Settings className="w-4 h-4 shrink-0" />
          <span className="text-sm font-medium">Settings</span>
        </Link>
      </nav>

      {/* User section */}
      <div className="px-4 py-4 border-t border-black/[0.07]">
        <div className="flex items-center gap-2.5 mb-3">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={displayName}
              width={28}
              height={28}
              className="rounded-full object-cover border border-black/10 shrink-0"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-[#1DB954]/20 border border-[#1DB954]/30 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-bold text-[#1DB954]">
                {initial}
              </span>
            </div>
          )}
          <span className="text-xs font-semibold text-[#121212] truncate">
            {firstName}
          </span>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="text-[11px] text-black/60 hover:text-[#121212] transition-colors duration-200 font-medium"
          >
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
