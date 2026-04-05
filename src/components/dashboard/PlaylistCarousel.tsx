"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Music2 } from "lucide-react";
import { getPlaylistThumbnail, type SpotifyPlaylist } from "@/lib/spotify-utils";

interface PlaylistCarouselProps {
  playlists: SpotifyPlaylist[];
}

export function PlaylistCarousel({ playlists }: PlaylistCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState({ left: 0, width: 0 });

  const updateThumb = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    if (scrollWidth <= clientWidth) {
      setThumb({ left: 0, width: 0 });
      return;
    }
    const thumbWidth = (clientWidth / scrollWidth) * 100;
    const thumbLeft = (scrollLeft / (scrollWidth - clientWidth)) * (100 - thumbWidth);
    setThumb({ left: thumbLeft, width: thumbWidth });
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const obs = new ResizeObserver(updateThumb);
    obs.observe(el);
    el.addEventListener("scroll", updateThumb, { passive: true });
    updateThumb();
    return () => {
      obs.disconnect();
      el.removeEventListener("scroll", updateThumb);
    };
  }, [updateThumb]);

  const showScrollbar = thumb.width > 0 && thumb.width < 99;

  return (
    <div className="flex flex-col gap-2">
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {playlists.map((pl) => {
          const thumb = getPlaylistThumbnail(pl.images);
          return (
            <a
              key={pl.id}
              href={pl.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="group/card shrink-0 w-[160px] bg-[#ECEAE4]/60 border border-black/[0.08] rounded-xl overflow-hidden hover:border-[#1DB954]/30 hover:shadow-[0_4px_16px_rgba(29,185,84,0.10)] transition-all duration-300"
              style={{ scrollSnapAlign: "start" }}
            >
              <div className="aspect-square w-full bg-black/[0.06] relative overflow-hidden">
                {thumb ? (
                  <Image
                    src={thumb}
                    alt={pl.name}
                    fill
                    sizes="160px"
                    className="object-cover group-hover/card:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music2 className="w-8 h-8 text-black/15" />
                  </div>
                )}
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

      {showScrollbar && (
        <div className="h-[3px] bg-black/[0.06] rounded-full relative overflow-hidden">
          <div
            className="absolute top-0 h-full bg-black/[0.18] rounded-full transition-[left] duration-75"
            style={{ left: `${thumb.left}%`, width: `${thumb.width}%` }}
          />
        </div>
      )}
    </div>
  );
}
