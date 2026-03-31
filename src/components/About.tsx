// ── Card visual mockups ─────────────────────────────────────────────────────

function ConnectVisual() {
  return (
    <div className="relative h-60 bg-[#ECEAE4] flex flex-col items-center justify-center gap-6 p-8">
      <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-b from-transparent to-[#ECEAE4] pointer-events-none" />
      {/* Clean Spotify logo */}
      <svg
        className="w-12 h-12 text-[#1DB954]"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
      </svg>

      {/* Request text */}
      <p className="text-[#121212] text-xs font-semibold text-center leading-relaxed max-w-[170px]">
        MoodSort would like permission to access your Spotify library
      </p>

      {/* Connect button */}
      <div className="bg-[#1DB954] rounded-full px-7 py-2.5 text-black text-xs font-bold shadow-[0_0_20px_rgba(29,185,84,0.3)]">
        Connect with Spotify
      </div>
    </div>
  );
}

const MOCK_SONGS = [
  { checked: true, title: "Let It Happen", artist: "Tame Impala" },
  { checked: true, title: "Lonely Star", artist: "The Weeknd" },
  { checked: false, title: "Stateside", artist: "PinkPantheress" },
  { checked: true, title: "The Less I Know", artist: "Tame Impala" },
  { checked: false, title: "E85", artist: "Don Toliver" },
];

function SongsVisual() {
  return (
    <div className="relative h-60 bg-[#ECEAE4] flex flex-col justify-center gap-3 pl-4 pr-6 pt-4 pb-3">
      {/* Mock scrollbar */}
      <div className="absolute right-1.5 top-4 bottom-10 w-1 rounded-full bg-black/[0.12]">
        <div className="w-full h-[45%] rounded-full bg-black/30 mt-[10%]" />
      </div>

      {/* Song rows */}
      {MOCK_SONGS.map((song, i) => (
        <div key={i} className="flex items-center gap-3 shrink-0">
          <div
            className={`w-4 h-4 rounded-full shrink-0 flex items-center justify-center border ${
              song.checked
                ? "bg-[#1DB954] border-[#1DB954]"
                : "border-black/20 bg-transparent"
            }`}
          >
            {song.checked && (
              <svg
                className="w-2.5 h-2.5 text-black"
                viewBox="0 0 12 12"
                fill="none"
              >
                <path
                  d="M2 6l3 3 5-5"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-black/80 truncate leading-tight">
              {song.title}
            </p>
            <p className="text-[10px] text-black/35 truncate leading-tight">
              {song.artist}
            </p>
          </div>
        </div>
      ))}

      {/* Progress bar */}
      <div className="mt-auto pt-2 border-t border-black/10 shrink-0">
        <div className="flex justify-between text-[9px] text-black/35 mb-1">
          <span>47 selected</span>
          <span>50 minimum</span>
        </div>
        <div className="h-1 bg-black/15 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1DB954] rounded-full"
            style={{ width: "94%" }}
          />
        </div>
      </div>
    </div>
  );
}

const SPOTIFY_PLAYLISTS = [
  { name: "Chill Nights", gradient: "from-[#1a6b3c] to-[#0d3d22]" },
  { name: "Hype Mode", gradient: "from-[#8b1a6b] to-[#4a0d3a]" },
  { name: "Deep Focus", gradient: "from-[#1a3d8b] to-[#0d1f4a]" },
  { name: "Late Night", gradient: "from-[#6b3a1a] to-[#3a1d0a]" },
];

function PlaylistsVisual() {
  return (
    <div className="relative h-60 bg-[#eaf5ed] flex flex-col overflow-hidden">
      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-b from-transparent to-[#eaf5ed] pointer-events-none z-10" />

      {SPOTIFY_PLAYLISTS.map((pl, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-4 py-2.5 hover:bg-black/[0.04] transition-colors shrink-0"
        >
          {/* Thumbnail */}
          <div
            className={`w-10 h-10 rounded shrink-0 bg-gradient-to-br ${pl.gradient} flex items-center justify-center`}
          >
            <svg
              className="w-4 h-4 text-white/60"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[#121212] truncate">
              {pl.name}
            </p>
            <p className="text-[9px] text-black/45 mt-0.5">
              Playlist · Spotify
            </p>
            <p className="text-[9px] text-black/35">Made for you</p>
          </div>

          {/* Chevron */}
          <svg
            className="w-3.5 h-3.5 text-black/25 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              d="M9 18l6-6-6-6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      ))}
    </div>
  );
}

// ── Section ──────────────────────────────────────────────────────────────────

const STEPS = [
  {
    number: "01",
    Visual: ConnectVisual,
    title: "Connect Spotify",
    description:
      "Sign in with your Spotify account in one click. MoodSort reads your liked songs — nothing else.",
  },
  {
    number: "02",
    Visual: SongsVisual,
    title: "Pick Seed Songs",
    description:
      "Select 50+ songs that represent your taste. The AI uses these to learn your moods and define your playlist clusters.",
  },
  {
    number: "03",
    Visual: PlaylistsVisual,
    title: "AI Builds Your Playlists",
    description:
      "MoodSort clusters your entire library into 3–5 named mood playlists and creates them directly in your Spotify.",
  },
];

export default function About() {
  return (
    <section id="about" className="relative py-28 px-6 overflow-hidden">
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-[#1DB954]/40 to-transparent" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16 text-center">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#1DB954] mb-4">
            How it works
          </p>
          <h2
            className="text-4xl md:text-5xl font-extrabold text-[#121212] mb-5"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            From liked songs to{" "}
            <span className="text-[#1DB954]">curated moods</span>
            <br className="hidden md:block" /> in under 3 minutes.
          </h2>
          <p className="text-black/50 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            MoodSort analyzes Spotify's audio features such as energy, valence,
            tempo, danceability, etc. combined with Claude AI to understand the
            emotional feel of every song you've saved.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map(({ number, Visual, title, description }) => (
            <div
              key={number}
              className="rounded-2xl overflow-hidden border border-black/[0.15] bg-[#ECEAE4]/60 hover:border-[#1DB954]/40 hover:bg-[#ECEAE4] transition-all duration-300 group"
            >
              {/* Visual mockup area */}
              <Visual />

              {/* Text area */}
              <div className="p-6 transition-colors duration-300">
                <span className="text-xs font-semibold text-[#1DB954] tracking-widest uppercase block mb-2">
                  Step {number}
                </span>
                <h3
                  className="text-lg font-bold text-[#121212] mb-2"
                  style={{ fontFamily: "var(--font-manrope)" }}
                >
                  {title}
                </h3>
                <p className="text-sm text-black/50 leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-black/30">
          Once your playlists are approved, MoodSort sorts{" "}
          <span className="text-black/50">every song in your library</span> —
          not just your seed picks.
        </p>
      </div>
    </section>
  );
}
