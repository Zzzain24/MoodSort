export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Mobile layout */}
        <div className="flex flex-col gap-4 items-center text-center md:hidden">
          {/* Logo */}
          <div className="flex items-center gap-1">
            <span
              className="text-base font-bold text-white"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              Mood
            </span>
            <span
              className="text-base font-bold text-[#1DB954]"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              Sort
            </span>
          </div>

          {/* Center text */}
          <p className="text-sm text-white/40">
            Made with{" "}
            <span className="text-red-400">♥</span>{" "}
            by Zain{" "}
            <span className="text-white/25 px-2">|</span>
            <span className="text-xs align-middle">© 2026 MoodSort</span>
          </p>

          {/* Links */}
          <nav className="flex items-center gap-6">
            <a
              href="#"
              className="text-sm text-white/30 hover:text-white/60 transition-colors duration-200"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-sm text-white/30 hover:text-white/60 transition-colors duration-200"
            >
              Terms
            </a>
            <a
              href="#"
              className="text-sm text-white/30 hover:text-white/60 transition-colors duration-200"
            >
              Contact
            </a>
          </nav>
        </div>

        {/* Desktop layout */}
        <div className="hidden md:flex relative items-center justify-between">
          {/* Left: Logo */}
          <div className="flex items-center gap-1">
            <span
              className="text-base font-bold text-white"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              Mood
            </span>
            <span
              className="text-base font-bold text-[#1DB954]"
              style={{ fontFamily: "var(--font-manrope)" }}
            >
              Sort
            </span>
          </div>

          {/* Center: absolutely centered attribution + copyright */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <p className="pointer-events-auto text-sm text-white/40 text-center">
              Made with{" "}
              <span className="text-red-400">♥</span>{" "}
              by Zain{" "}
              <span className="text-white/25 px-2">|</span>
              <span className="text-xs align-middle">© 2026 MoodSort</span>
            </p>
          </div>

          {/* Right: Links */}
          <nav className="flex items-center gap-6 ml-auto">
            <a
              href="#"
              className="text-sm text-white/30 hover:text-white/60 transition-colors duration-200"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-sm text-white/30 hover:text-white/60 transition-colors duration-200"
            >
              Terms
            </a>
            <a
              href="#"
              className="text-sm text-white/30 hover:text-white/60 transition-colors duration-200"
            >
              Contact
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
