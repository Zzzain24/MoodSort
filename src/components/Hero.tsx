const NUM_BARS = 185;

// Build bar data: heights follow an overlapping-sine envelope to mimic an
// audio waveform (multiple peaks / valleys across the span).
const BARS = Array.from({ length: NUM_BARS }, (_, i) => {
  const t = i / (NUM_BARS - 1); // 0 → 1
  const env =
    Math.abs(Math.sin(t * Math.PI * 4.5 + 0.3)) * 0.85 +
    Math.abs(Math.sin(t * Math.PI * 2.5 + 0.9)) * 0.45 +
    Math.abs(Math.sin(t * Math.PI * 7.5 + 0.2)) * 0.2;
  const height = Math.max(10, Math.round((env / 1.5) * 280));
  return {
    height,
    delay: `${((i * 0.065) % 1.3).toFixed(3)}s`,
    duration: `${(0.55 + (i % 11) * 0.07).toFixed(3)}s`,
  };
});

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-24">
      {/* ── Audio waveform overlay — right side, starts after hero text ── */}
      <div
        className="hidden lg:block absolute inset-y-0 pointer-events-none overflow-hidden"
        style={{ left: "45%", right: "0%" }}
      >
        {/* Left fade — waves emerge softly from the text boundary */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#121212] to-transparent z-10" />
        {/* Top + bottom fades */}
        <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-[#121212] to-transparent z-10" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#121212] to-transparent z-10" />
        {/* Right fade — waves drift off the edge */}
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#121212] to-transparent z-10" />

        {/* Subtle green bloom behind bars */}
        <div className="glow-pulse absolute inset-0 bg-[#1DB954]/6 blur-3xl" />

        {/* Bars — flex row, centered vertically in the section */}
        <div className="absolute inset-0 flex items-center px-2">
          <div className="flex items-center gap-[2px]">
            {BARS.map((bar, i) => (
              <div
                key={i}
                className="flutter-bar w-[2px] rounded-full bg-[#1DB954] shrink-0"
                style={{
                  height: `${bar.height}px`,
                  animationDelay: bar.delay,
                  animationDuration: bar.duration,
                  boxShadow: "0 0 6px rgba(29,185,84,0.55)",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Hero copy ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 w-full">
        <div className="flex flex-col gap-8 max-w-xl">
          {/* Headline */}
          <h1
            className="fade-up text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight text-white"
            style={{
              fontFamily: "var(--font-manrope)",
              animationDelay: "0.1s",
            }}
          >
            Your music. <span className="text-[#1DB954]">Sorted</span> by mood.{" "}
            <span className="text-white/50">Automatically.</span>
          </h1>

          {/* Subheadline */}
          <p
            className="fade-up text-base md:text-lg text-white/55 leading-relaxed"
            style={{ animationDelay: "0.2s" }}
          >
            MoodSort connects to your Spotify library, analyzes your liked songs
            using, and organizes them into coherent mood-based playlists using
            Ai. As you like new songs your playlists update automatically,
            adding newly liked songs to the matching playlist with that vibe.
          </p>

          {/* CTAs */}
          <div
            className="fade-up flex flex-wrap items-center gap-4"
            style={{ animationDelay: "0.3s" }}
          >
            <a
              href="#"
              className="inline-flex items-center gap-3 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold px-7 py-4 text-base transition-all duration-200 hover:scale-105 hover:shadow-[0_0_32px_rgba(29,185,84,0.4)]"
            >
              <svg
                className="w-5 h-5 shrink-0"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
              Connect Spotify
            </a>

            <a
              href="#about"
              className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors duration-200"
            >
              Learn how it works
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          {/* Social proof */}
          <p
            className="fade-up text-xs text-white/25"
            style={{ animationDelay: "0.4s" }}
          >
            Reads your liked songs · Creates playlists in your Spotify · Updates
            automatically
          </p>
        </div>
      </div>
    </section>
  );
}
