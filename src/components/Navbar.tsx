"use client";

import { useEffect, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu when a link is tapped
  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      className={`fixed left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        scrolled ? "top-2 px-4 md:px-6 lg:px-12" : "top-4 px-4 md:px-8"
      }`}
    >
      {/* ── Main bar ── */}
      <div
        className={`mx-auto bg-[#F5F4F0]/80 backdrop-blur-md border border-black/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] flex items-center justify-between transition-all duration-300 ease-in-out ${
          scrolled ? "max-w-3xl px-4 py-2" : "max-w-7xl px-5 py-3"
        }`}
      >
        {/* Logo */}
        <a href="/" className="flex items-center gap-1">
          <span
            className={`font-bold tracking-tight text-[#121212] transition-all duration-300 ${scrolled ? "text-base" : "text-xl"}`}
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            Mood
          </span>
          <span
            className={`font-bold tracking-tight text-[#1DB954] transition-all duration-300 ${scrolled ? "text-base" : "text-xl"}`}
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            Sort
          </span>
        </a>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#about" className="text-sm text-black/60 hover:text-black transition-colors duration-200">
            About
          </a>
          <a href="#features" className="text-sm text-black/60 hover:text-black transition-colors duration-200">
            Features
          </a>
        </nav>

        {/* Desktop auth buttons */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="/login"
            className={`inline-flex items-center text-sm text-black/70 hover:text-black border border-black/20 hover:border-black/40 rounded-full transition-all duration-300 ${scrolled ? "px-3 py-1.5" : "px-4 py-2"}`}
          >
            Log In
          </a>
          <a
            href="/login"
            className={`inline-flex items-center text-sm font-semibold text-black bg-[#1DB954] hover:bg-[#1ed760] rounded-full transition-all duration-300 hover:scale-105 ${scrolled ? "px-3 py-1.5" : "px-4 py-2"}`}
          >
            Sign Up
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5 focus:outline-none"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <span
            className={`block h-0.5 w-5 bg-[#121212] rounded-full transition-all duration-300 origin-center ${
              menuOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 bg-[#121212] rounded-full transition-all duration-300 ${
              menuOpen ? "opacity-0 scale-x-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-5 bg-[#121212] rounded-full transition-all duration-300 origin-center ${
              menuOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>
      </div>

      {/* ── Mobile dropdown menu ── */}
      <div
        className={`md:hidden mx-auto mt-2 bg-[#F5F4F0]/90 backdrop-blur-md border border-black/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden transition-all duration-300 ease-in-out ${
          scrolled ? "max-w-3xl" : "max-w-7xl"
        } ${menuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0 pointer-events-none"}`}
      >
        <div className="flex flex-col px-5 py-4 gap-4">
          <a
            href="#about"
            onClick={closeMenu}
            className="text-sm text-black/60 hover:text-black transition-colors duration-200 py-1"
          >
            About
          </a>
          <a
            href="#features"
            onClick={closeMenu}
            className="text-sm text-black/60 hover:text-black transition-colors duration-200 py-1"
          >
            Features
          </a>
          <div className="h-px bg-black/10" />
          <div className="flex flex-col gap-3 pb-1">
            <a
              href="/login"
              onClick={closeMenu}
              className="w-full text-center text-sm text-black/70 hover:text-black border border-black/20 hover:border-black/40 rounded-full px-4 py-2 transition-all duration-200"
            >
              Log In
            </a>
            <a
              href="/login"
              onClick={closeMenu}
              className="w-full text-center text-sm font-semibold text-black bg-[#1DB954] hover:bg-[#1ed760] rounded-full px-4 py-2 transition-all duration-200"
            >
              Sign Up
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
