"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  ListMusic,
  ClipboardList,
  Zap,
  Settings,
  ChevronDown,
  ExternalLink,
  Music2,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { getPlaylistThumbnail, type SpotifyPlaylist } from "@/lib/spotify-utils";
import { PENDING_REVIEW_COUNT } from "@/lib/constants";

interface SidebarProps {
  displayName: string;
  avatarUrl?: string;
  playlists: SpotifyPlaylist[];
}

export function Sidebar({ displayName, avatarUrl, playlists }: SidebarProps) {
  const [playlistsOpen, setPlaylistsOpen] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const firstName = displayName.split(" ")[0];
  const initial = displayName.charAt(0).toUpperCase();

  const navItemClass = (active: boolean) =>
    `flex items-center ${
      collapsed ? "justify-center px-0 py-2.5 w-full" : "gap-2.5 px-3 py-2"
    } rounded-lg transition-colors duration-150 ${
      active
        ? "bg-black/[0.07] text-[#121212]"
        : "text-black/70 hover:bg-black/[0.05] hover:text-[#121212]"
    }`;

  const disabledItemClass = `flex items-center ${
    collapsed ? "justify-center px-0 py-2.5 w-full" : "gap-2.5 px-3 py-2"
  } rounded-lg text-black/55 cursor-not-allowed`;

  return (
    <aside
      className={`${
        collapsed ? "w-14" : "w-[220px]"
      } transition-[width] duration-200 ease-in-out hidden md:flex flex-col min-h-screen bg-[#ECEAE4] border-r border-black/[0.08] shrink-0 sticky top-0 h-screen overflow-hidden`}
    >
      {/* Logo + toggle */}
      <div className={`flex items-center ${collapsed ? "justify-center px-2" : "justify-between px-5"} pt-6 pb-5`}>
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-0.5">
            <span className="text-base font-bold tracking-tight text-[#121212]">
              Mood
            </span>
            <span className="text-base font-bold tracking-tight text-[#1DB954]">
              Sort
            </span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-black/50 hover:text-[#121212] hover:bg-black/[0.05] transition-colors duration-150 shrink-0"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>
      </div>

      <div className="h-px bg-black/[0.07] mx-4" />

      {/* Navigation */}
      <nav className={`flex-1 ${collapsed ? "px-2" : "px-3"} py-4 flex flex-col gap-0.5`}>
        {/* Home */}
        <Link
          href="/dashboard"
          className={navItemClass(pathname === "/dashboard")}
          title={collapsed ? "Home" : undefined}
        >
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Home</span>}
        </Link>

        {/* My Playlists */}
        {collapsed ? (
          <div
            className={disabledItemClass}
            title="Playlists"
          >
            <ListMusic className="w-4 h-4 shrink-0 text-black/70" />
          </div>
        ) : (
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
        )}

        {/* Run Mood Sort */}
        <Link
          href="/dashboard/run"
          className={navItemClass(pathname === "/dashboard/run")}
          title={collapsed ? "Run Mood Sort" : undefined}
        >
          <Zap className="w-4 h-4 shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Run Mood Sort</span>}
        </Link>

        {/* Pending review */}
        <button
          disabled
          title={collapsed ? "Pending review (coming soon)" : "Coming soon"}
          className={disabledItemClass}
        >
          <ClipboardList className="w-4 h-4 shrink-0" />
          {!collapsed && (
            <>
              <span className="text-sm font-medium flex-1 text-left">
                Pending review
              </span>
              {PENDING_REVIEW_COUNT > 0 && (
                <span className="text-[10px] font-bold bg-[#1DB954]/20 text-[#1DB954]/50 rounded-full px-1.5 py-0.5 leading-none">
                  {PENDING_REVIEW_COUNT}
                </span>
              )}
            </>
          )}
        </button>

        <div className="h-px bg-black/[0.07] my-2" />

        {/* Settings */}
        <Link
          href="/dashboard/settings"
          className={navItemClass(pathname === "/dashboard/settings")}
          title={collapsed ? "Settings" : undefined}
        >
          <Settings className="w-4 h-4 shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Settings</span>}
        </Link>
      </nav>

      {/* User section */}
      <div className={`${collapsed ? "px-2" : "px-3"} py-3 border-t border-black/[0.07] flex flex-col gap-0.5`}>
        {/* Profile row */}
        <div className={`flex items-center ${collapsed ? "justify-center px-0 py-2.5" : "gap-2.5 px-3 py-2"} rounded-lg`} title={collapsed ? displayName : undefined}>
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={displayName}
              width={44}
              height={44}
              className="rounded-full object-cover border border-black/10 shrink-0"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-[#1DB954]/20 border border-[#1DB954]/30 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-[#1DB954]">{initial}</span>
            </div>
          )}
          {!collapsed && (
            <span className="text-sm font-medium text-black/70 truncate">{firstName}</span>
          )}
        </div>

        {/* Sign out row */}
        {!collapsed && (
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-black/70 hover:bg-black/[0.05] hover:text-[#121212] transition-colors duration-150"
            >
              Sign out
            </button>
          </form>
        )}
      </div>
    </aside>
  );
}
