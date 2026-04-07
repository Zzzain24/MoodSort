"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ListMusic, Zap, Settings } from "lucide-react";

const items = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home", exact: true },
  { href: "/dashboard", icon: ListMusic, label: "Playlists", exact: false },
  { href: "/dashboard/run", icon: Zap, label: "Create", exact: true },
  { href: "/dashboard/settings", icon: Settings, label: "Settings", exact: true },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#ECEAE4]/90 backdrop-blur-md border-t border-black/[0.08] flex items-center justify-around h-16 px-2">
      {items.map(({ href, icon: Icon, label, exact }) => {
        const active = exact
          ? pathname === href && !(label === "Playlists")
          : false;
        return (
          <Link
            key={label}
            href={href}
            className={`flex flex-col items-center gap-1 flex-1 py-2 rounded-xl transition-colors duration-150 ${
              active
                ? "text-[#1DB954]"
                : "text-black/50 hover:text-black/80"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-semibold">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
