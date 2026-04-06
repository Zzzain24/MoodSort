// ── Feature visual mockups ────────────────────────────────────────────────────

const VIBE_SEEDS = [
  { title: "Let It Happen", artist: "Tame Impala" },
  { title: "Lonely Star", artist: "The Weeknd" },
  { title: "Stateside", artist: "PinkPantheress" },
  { title: "Starboy", artist: "The Weeknd" },
];

const VIBE_MATCHES = [
  { title: "Nights", artist: "Frank Ocean", score: 94, adding: true },
  { title: "Gasoline", artist: "The Weeknd", score: 88, adding: true },
  { title: "Borderline", artist: "Tame Impala", score: 81, adding: true },
  { title: "E85", artist: "Don Toliver", score: 67, adding: false },
  { title: "Blinding Lights", artist: "The Weeknd", score: 51, adding: false },
];

function VibeMatchingVisual() {
  return (
    <div className="relative h-full min-h-56 bg-[#ECEAE4] flex flex-col overflow-hidden">
      {/* ── Seeds zone ── */}
      <div className="px-6 pt-6 pb-4">
        <p className="text-[9px] font-bold text-black/30 uppercase tracking-widest mb-3">
          Your 10 seed songs
        </p>
        <div className="grid grid-cols-2 gap-2">
          {VIBE_SEEDS.map((s, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 bg-black/[0.07] rounded-xl px-3 py-2.5"
            >
              <div className="w-2 h-2 rounded-full bg-[#1DB954]/70 shrink-0" />
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-black/75 truncate leading-snug">
                  {s.title}
                </p>
                <p className="text-[10px] text-black/35 truncate leading-snug mt-0.5">
                  {s.artist}
                </p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-black/25 mt-2.5 pl-1">+ 6 more seeds</p>
      </div>

      {/* ── AI scanning divider ── */}
      <div className="flex items-center gap-3 px-6 py-1">
        <div className="flex-1 h-px bg-black/[0.08]" />
        <div className="flex items-center gap-1.5 bg-black/[0.07] rounded-full px-3 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1DB954] animate-pulse" />
          <span className="text-[9px] font-semibold text-black/40 uppercase tracking-wider">
            AI scanning your library
          </span>
        </div>
        <div className="flex-1 h-px bg-black/[0.08]" />
      </div>

      {/* ── Matches zone ── */}
      <div className="flex-1 px-6 pt-4 pb-6 flex flex-col gap-2.5 min-h-0">
        <p className="text-[9px] font-bold text-black/30 uppercase tracking-widest mb-1">
          Matches found in your library
        </p>
        {VIBE_MATCHES.map((s, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="min-w-0 mr-3">
                <p className="text-[12px] font-semibold text-black/75 truncate leading-snug">
                  {s.title}
                </p>
                <p className="text-[10px] text-black/35 truncate leading-snug">
                  {s.artist}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`text-[11px] font-bold tabular-nums ${
                    s.adding ? "text-[#1DB954]/80" : "text-black/30"
                  }`}
                >
                  {s.score}%
                </span>
                {s.adding ? (
                  <span className="text-[9px] font-semibold text-[#1DB954]/70 bg-[#1DB954]/10 rounded-full px-2 py-0.5 leading-none">
                    Adding
                  </span>
                ) : (
                  <span className="text-[9px] font-medium text-black/25 bg-black/[0.06] rounded-full px-2 py-0.5 leading-none">
                    Skip
                  </span>
                )}
              </div>
            </div>
            <div className="h-[3px] bg-black/[0.08] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${s.adding ? "bg-[#1DB954]" : "bg-black/20"}`}
                style={{ width: `${s.score}%`, opacity: s.adding ? 0.65 : 0.35 }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-b from-transparent to-[#ECEAE4] pointer-events-none" />
    </div>
  );
}

function AutoSyncVisual() {
  return (
    <div className="relative h-56 bg-[#ECEAE4] flex flex-col items-center justify-center gap-6 overflow-hidden">
      <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-b from-transparent to-[#ECEAE4] pointer-events-none" />

      {/* Analog clock */}
      <div className="relative w-20 h-20 rounded-full border border-black/20 bg-black/[0.10] flex items-center justify-center shadow-[0_0_28px_rgba(29,185,84,0.1)]">
        <svg viewBox="0 0 40 40" className="w-14 h-14">
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(
            (deg, i) => {
              const rad = ((deg - 90) * Math.PI) / 180;
              const x1 = 20 + 14 * Math.cos(rad);
              const y1 = 20 + 14 * Math.sin(rad);
              const x2 = 20 + (i % 3 === 0 ? 11 : 12.5) * Math.cos(rad);
              const y2 = 20 + (i % 3 === 0 ? 11 : 12.5) * Math.sin(rad);
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#121212"
                  strokeOpacity={i % 3 === 0 ? 0.3 : 0.1}
                  strokeWidth={i % 3 === 0 ? 1.5 : 1}
                />
              );
            },
          )}
          {/* Hour hand pointing to 12 */}
          <line
            x1="20"
            y1="20"
            x2="20"
            y2="12.5"
            stroke="#121212"
            strokeOpacity="0.75"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Minute hand pointing to 12 */}
          <line
            x1="20"
            y1="20"
            x2="20"
            y2="7"
            stroke="#1DB954"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <circle cx="20" cy="20" r="1.8" fill="#1DB954" />
        </svg>
        <span className="absolute -bottom-5 text-[10px] text-black/35 font-mono tracking-wide">
          12:00 AM
        </span>
      </div>

      {/* Schedule row */}
      <div className="w-52">
        <div className="flex items-center justify-between bg-black/[0.12] rounded-xl px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1DB954] animate-pulse" />
            <span className="text-[11px] text-black/70 font-medium">
              Next sync
            </span>
          </div>
          <span className="text-[11px] text-black/45 font-mono">12:00 AM</span>
        </div>
      </div>
    </div>
  );
}

function ReviewQueueVisual() {
  const songs = [
    { title: "Nights", artist: "The Weeknd" },
    { title: "Blinding Lights", artist: "The Weeknd" },
  ];

  return (
    <div className="relative h-56 bg-[#ECEAE4] flex flex-col items-center justify-center gap-3 px-5 overflow-hidden">
      <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-b from-transparent to-[#ECEAE4] pointer-events-none" />

      {songs.map((s, i) => (
        <div key={i} className="w-full flex flex-col gap-2">
          <div className="flex items-center gap-3 bg-black/[0.11] rounded-xl px-3.5 py-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1a3d8b] to-[#0d1f4a] shrink-0 flex items-center justify-center">
              <svg
                className="w-3.5 h-3.5 text-white/50"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-black/85 leading-tight truncate">
                {s.title}
              </p>
              <p className="text-[10px] text-black/35 leading-tight">
                {s.artist}
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="w-7 h-7 rounded-full bg-[#1DB954]/15 border border-[#1DB954]/30 flex items-center justify-center">
                <svg
                  className="w-3.5 h-3.5 text-[#1DB954]"
                  viewBox="0 0 12 12"
                  fill="none"
                >
                  <path
                    d="M2 6l3 3 5-5"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="w-7 h-7 rounded-full bg-black/[0.11] border border-black/10 flex items-center justify-center">
                <svg
                  className="w-3.5 h-3.5 text-black/30"
                  viewBox="0 0 12 12"
                  fill="none"
                >
                  <path
                    d="M3 3l6 6M9 3l-6 6"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <svg
              className="w-2.5 h-2.5 text-black/20"
              viewBox="0 0 12 12"
              fill="none"
            >
              <path
                d="M6 2v8M2 6h8"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
              />
            </svg>
            <span className="text-[9px] text-black/25">
              Add to{" "}
              <span className="text-black/45 font-medium">Late Night</span>?
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Feature definitions ───────────────────────────────────────────────────────

const SIDE_FEATURES = [
  {
    Visual: AutoSyncVisual,
    title: "Auto-Sync Daily",
    description:
      "Every new song you like is automatically scored and slotted into the right playlist daily.",
  },
  {
    Visual: ReviewQueueVisual,
    title: "Pending Review Queue",
    description:
      "Borderline songs surface for your approval before being added, so your playlists stay tight.",
  },
];

// ── Section ───────────────────────────────────────────────────────────────────

export default function Features() {
  return (
    <section id="features" className="relative py-28 px-6 overflow-hidden">
      <div className="pointer-events-none absolute bottom-0 right-0 w-96 h-96 bg-[#1DB954]/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16 text-center">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#1DB954] mb-4">
            Features
          </p>
          <h2
            className="text-4xl md:text-5xl font-extrabold text-[#121212] mb-5"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            Everything you need.{" "}
            <span className="text-black/35">Nothing you don&apos;t.</span>
          </h2>
          <p className="text-black/50 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            MoodSort handles everything from vibe matching to daily sync to
            discovery, so you never think about playlist management again.
          </p>
        </div>

        {/* Bento grid — 2 + 1 stacked */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Vibe Matching Engine — spans 2 cols */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="group rounded-2xl overflow-hidden border border-black/[0.15] bg-[#ECEAE4]/60 hover:border-[#1DB954]/40 transition-all duration-300 flex-1">
              <VibeMatchingVisual />
            </div>
            <div className="px-1">
              <h3
                className="text-base font-bold text-[#121212] mb-1.5"
                style={{ fontFamily: "var(--font-manrope)" }}
              >
                Vibe Matching Engine
              </h3>
              <p className="text-sm text-black/45 leading-relaxed">
                MoodSort builds an audio profile from your 10 seed songs and
                uses AI to find every song in your library that truly fits. Not
                just numerically close, but contextually right.
              </p>
            </div>
          </div>

          {/* Right column — Auto-Sync + Review Queue stacked */}
          <div className="lg:col-span-1 grid grid-cols-2 lg:grid-cols-1 gap-5">
            {SIDE_FEATURES.map(({ Visual, title, description }, i) => (
              <div key={i} className="flex flex-col gap-4">
                <div className="group rounded-2xl overflow-hidden border border-black/[0.15] bg-[#ECEAE4]/60 hover:border-[#1DB954]/40 transition-all duration-300">
                  <Visual />
                </div>
                <div className="px-1">
                  <h3
                    className="text-base font-bold text-[#121212] mb-1.5"
                    style={{ fontFamily: "var(--font-manrope)" }}
                  >
                    {title}
                  </h3>
                  <p className="text-sm text-black/45 leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 flex flex-col items-center gap-5 text-center">
          <a
            href="/login"
            className="inline-flex items-center gap-3 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold px-7 py-4 text-sm transition-all duration-200 hover:scale-105 hover:shadow-[0_0_32px_rgba(29,185,84,0.4)]"
          >
            <svg
              className="w-4 h-4 shrink-0"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            Get Started
          </a>
        </div>
      </div>
    </section>
  );
}
