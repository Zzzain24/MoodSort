// ── Feature visual mockups ────────────────────────────────────────────────────

function ClusteringVisual() {
  const clusters = [
    {
      color: "#1DB954", label: "CHILL", labelX: 3, labelY: 95,
      cx: 14, cy: 72,
      floatValues: "0,0; 3,4; 5,1; 2,-3; -2,2; 0,0",
      floatDur: "7s", floatDelay: "0s",
      pulseDur: "3.2s", pulseDelay: "0s",
      dots: [
        { x: 8,  y: 78, r: 5.5 }, { x: 20, y: 66, r: 4.5 },
        { x: 4,  y: 64, r: 4 },   { x: 24, y: 78, r: 3.5 },
        { x: 14, y: 58, r: 3.5 }, { x: 4,  y: 76, r: 3 },
      ],
    },
    {
      color: "#a855f7", label: "HYPE", labelX: 74, labelY: 9,
      cx: 86, cy: 22,
      floatValues: "0,0; -4,3; -2,-4; 3,-2; 2,3; 0,0",
      floatDur: "8s", floatDelay: "1.5s",
      pulseDur: "2.8s", pulseDelay: "0.8s",
      dots: [
        { x: 90, y: 16, r: 5.5 }, { x: 96, y: 28, r: 4.5 },
        { x: 78, y: 14, r: 4 },   { x: 94, y: 12, r: 3.5 },
        { x: 80, y: 30, r: 3.5 }, { x: 96, y: 18, r: 3 },
      ],
    },
    {
      color: "#f59e0b", label: "FOCUS", labelX: 44, labelY: 58,
      cx: 50, cy: 46,
      floatValues: "0,0; 2,-4; -3,-2; -4,3; 2,4; 0,0",
      floatDur: "9s", floatDelay: "0.5s",
      pulseDur: "3.6s", pulseDelay: "1.2s",
      dots: [
        { x: 50, y: 40, r: 5.5 }, { x: 60, y: 50, r: 4.5 },
        { x: 40, y: 50, r: 4 },   { x: 56, y: 36, r: 3.5 },
        { x: 44, y: 42, r: 3.5 }, { x: 62, y: 40, r: 3 },
      ],
    },
    {
      color: "#06b6d4", label: "NIGHT", labelX: 3, labelY: 10,
      cx: 12, cy: 24,
      floatValues: "0,0; 4,-3; 2,4; -3,3; -2,-3; 0,0",
      floatDur: "6.5s", floatDelay: "2s",
      pulseDur: "3s", pulseDelay: "0.4s",
      dots: [
        { x: 8,  y: 18, r: 5 },   { x: 20, y: 22, r: 4 },
        { x: 4,  y: 30, r: 4.5 }, { x: 16, y: 12, r: 3.5 },
        { x: 20, y: 32, r: 3 },   { x: 4,  y: 20, r: 3 },
      ],
    },
    {
      color: "#f43f5e", label: "ENERGY", labelX: 74, labelY: 95,
      cx: 86, cy: 74,
      floatValues: "0,0; -3,-4; 2,-3; 4,2; -2,4; 0,0",
      floatDur: "7.5s", floatDelay: "3s",
      pulseDur: "3.4s", pulseDelay: "1.6s",
      dots: [
        { x: 82, y: 80, r: 5 },   { x: 94, y: 72, r: 4 },
        { x: 78, y: 68, r: 4.5 }, { x: 92, y: 82, r: 3.5 },
        { x: 88, y: 66, r: 3 },   { x: 96, y: 78, r: 3 },
      ],
    },
  ];

  return (
    <div className="relative h-56 bg-[#ECEAE4] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-b from-transparent to-[#ECEAE4] pointer-events-none" />
      {/* Subtle grid lines in background */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.08]" viewBox="0 0 200 224" preserveAspectRatio="none">
        {[40,80,120,160,200].map(x => <line key={x} x1={x} y1="0" x2={x} y2="224" stroke="#121212" strokeWidth="1"/>)}
        {[40,80,120,160,200].map(y => <line key={y} x1="0" y1={y} x2="200" y2={y} stroke="#121212" strokeWidth="1"/>)}
      </svg>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {clusters.map(({ color, cx, cy, dots, label, labelX, labelY, floatValues, floatDur, floatDelay, pulseDur, pulseDelay }) => (
          <g key={label}>
            <animateTransform
              attributeName="transform"
              type="translate"
              values={floatValues}
              dur={floatDur}
              begin={floatDelay}
              repeatCount="indefinite"
              calcMode="spline"
              keySplines="0.45 0.05 0.55 0.95;0.45 0.05 0.55 0.95;0.45 0.05 0.55 0.95;0.45 0.05 0.55 0.95;0.45 0.05 0.55 0.95"
            />
            {/* Outer pulse halo */}
            <circle cx={cx} cy={cy} r="24" fill={color} fillOpacity="0.04">
              <animate attributeName="r" values="24;28;24" dur={pulseDur} begin={pulseDelay} repeatCount="indefinite" calcMode="spline" keySplines="0.45 0.05 0.55 0.95;0.45 0.05 0.55 0.95" />
              <animate attributeName="fill-opacity" values="0.04;0.08;0.04" dur={pulseDur} begin={pulseDelay} repeatCount="indefinite" calcMode="spline" keySplines="0.45 0.05 0.55 0.95;0.45 0.05 0.55 0.95" />
            </circle>
            {/* Inner halo */}
            <circle cx={cx} cy={cy} r="15" fill={color} fillOpacity="0.08">
              <animate attributeName="r" values="15;18;15" dur={pulseDur} begin={pulseDelay} repeatCount="indefinite" calcMode="spline" keySplines="0.45 0.05 0.55 0.95;0.45 0.05 0.55 0.95" />
              <animate attributeName="fill-opacity" values="0.08;0.14;0.08" dur={pulseDur} begin={pulseDelay} repeatCount="indefinite" calcMode="spline" keySplines="0.45 0.05 0.55 0.95;0.45 0.05 0.55 0.95" />
            </circle>
            {/* Centroid */}
            <circle cx={cx} cy={cy} r="2.2" fill={color} fillOpacity="0.4">
              <animate attributeName="fill-opacity" values="0.4;0.7;0.4" dur={pulseDur} begin={pulseDelay} repeatCount="indefinite" />
            </circle>
            <line x1={cx - 4} y1={cy} x2={cx + 4} y2={cy} stroke={color} strokeOpacity="0.2" strokeWidth="0.7" />
            <line x1={cx} y1={cy - 4} x2={cx} y2={cy + 4} stroke={color} strokeOpacity="0.2" strokeWidth="0.7" />
            {/* Dots */}
            {dots.map((d, i) => (
              <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={color} fillOpacity={0.7 + i * 0.03} />
            ))}
            {/* Label */}
            <text x={labelX} y={labelY} fontSize="4.5" fill={color} fillOpacity="0.45" fontWeight="700" letterSpacing="0.8">{label}</text>
          </g>
        ))}
      </svg>
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
          {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg, i) => {
            const rad = (deg - 90) * Math.PI / 180;
            const x1 = 20 + 14 * Math.cos(rad);
            const y1 = 20 + 14 * Math.sin(rad);
            const x2 = 20 + (i % 3 === 0 ? 11 : 12.5) * Math.cos(rad);
            const y2 = 20 + (i % 3 === 0 ? 11 : 12.5) * Math.sin(rad);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#121212" strokeOpacity={i % 3 === 0 ? 0.3 : 0.1} strokeWidth={i % 3 === 0 ? 1.5 : 1} />;
          })}
          {/* Hour hand ~2 o'clock */}
          <line x1="20" y1="20" x2="27.5" y2="14.5" stroke="#121212" strokeOpacity="0.75" strokeWidth="2.2" strokeLinecap="round" />
          {/* Minute hand pointing to 12 */}
          <line x1="20" y1="20" x2="20" y2="7" stroke="#1DB954" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="20" cy="20" r="1.8" fill="#1DB954" />
        </svg>
        <span className="absolute -bottom-5 text-[10px] text-black/35 font-mono tracking-wide">2:00</span>
      </div>

      {/* Schedule row */}
      <div className="w-52">
        <div className="flex items-center justify-between bg-black/[0.12] rounded-xl px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1DB954] animate-pulse" />
            <span className="text-[11px] text-black/70 font-medium">Next sync</span>
          </div>
          <span className="text-[11px] text-black/45 font-mono">2:00 AM</span>
        </div>
      </div>
    </div>
  );
}

function ReviewQueueVisual() {
  const songs = [
    { title: "Nights",         artist: "The Weeknd",     approve: true },
    { title: "Blinding Lights", artist: "The Weeknd",    approve: false },
  ];

  return (
    <div className="relative h-56 bg-[#ECEAE4] flex flex-col items-center justify-center gap-3 px-5 overflow-hidden">
      <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-b from-transparent to-[#ECEAE4] pointer-events-none" />

      {songs.map((s, i) => (
        <div key={i} className="w-full flex flex-col gap-2">
          <div className="flex items-center gap-3 bg-black/[0.11] rounded-xl px-3.5 py-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1a3d8b] to-[#0d1f4a] shrink-0 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white/50" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-black/85 leading-tight truncate">{s.title}</p>
              <p className="text-[10px] text-black/35 leading-tight">{s.artist}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="w-7 h-7 rounded-full bg-[#1DB954]/15 border border-[#1DB954]/30 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-[#1DB954]" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="w-7 h-7 rounded-full bg-black/[0.11] border border-black/10 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-black/30" viewBox="0 0 12 12" fill="none">
                  <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"/>
                </svg>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <svg className="w-2.5 h-2.5 text-black/20" viewBox="0 0 12 12" fill="none">
              <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round"/>
            </svg>
            <span className="text-[9px] text-black/25">Add to <span className="text-black/45 font-medium">Late Night</span>?</span>
          </div>
        </div>
      ))}
    </div>
  );
}

const DISCOVERY_SONGS = [
  { title: "Borderline",    artist: "Tame Impala",      match: 94 },
  { title: "Gasoline",      artist: "The Weeknd",       match: 88 },
  { title: "Passion Pain",  artist: "PinkPantheress",   match: 81 },
];

function DiscoveryVisual() {
  return (
    <div className="relative h-56 bg-[#ECEAE4] flex flex-col items-center justify-center gap-3 px-5 overflow-hidden">
      <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-b from-transparent to-[#ECEAE4] pointer-events-none" />

      {DISCOVERY_SONGS.map((s, i) => (
        <div key={i} className="w-full flex items-center gap-3 bg-black/[0.09] rounded-xl px-3.5 py-3">
          <div className="w-8 h-8 rounded-lg bg-black/[0.11] border border-black/10 shrink-0 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-[#1DB954]" viewBox="0 0 12 12" fill="currentColor">
              <path d="M10 6L4 2v8l6-4z"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-black/80 truncate leading-tight">{s.title}</p>
            <p className="text-[10px] text-black/35 truncate leading-tight">{s.artist}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-14 h-1.5 bg-black/15 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1DB954] rounded-full"
                style={{ width: `${s.match}%`, opacity: 0.6 + s.match / 400 }}
              />
            </div>
            <span className="text-[9px] text-[#1DB954]/65 w-6 text-right font-medium">{s.match}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Feature definitions ───────────────────────────────────────────────────────

const FEATURES = [
  {
    Visual: ClusteringVisual,
    span: "lg:col-span-2",
    title: "AI Mood Clustering",
    description:
      "K-means clustering on Spotify audio features, then named by Claude AI to capture the true emotional feel of each group.",
  },
  {
    Visual: AutoSyncVisual,
    span: "lg:col-span-1",
    title: "Auto-Sync Daily",
    description:
      "Every new song you like is automatically scored and slotted into the right playlist overnight.",
  },
  {
    Visual: ReviewQueueVisual,
    span: "lg:col-span-1",
    title: "Pending Review Queue",
    description:
      "Borderline songs surface for your approval before being added, so your playlists stay tight.",
  },
  {
    Visual: DiscoveryVisual,
    span: "lg:col-span-2",
    title: "Song Discovery",
    description:
      "Get 5–10 Spotify-recommended songs per playlist, matched to each mood's audio fingerprint so they actually fit.",
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
            MoodSort handles the full lifecycle — from initial clustering to
            daily sync to discovery, so you never think about playlist
            management again.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ Visual, span, title, description }, i) => (
            <div key={i} className={`flex flex-col gap-4 ${span}`}>
              {/* Card — purely visual */}
              <div className="group rounded-2xl overflow-hidden border border-black/[0.15] bg-[#ECEAE4]/60 hover:border-[#1DB954]/40 transition-all duration-300">
                <Visual />
              </div>

              {/* Text — outside the card */}
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

        {/* Bottom CTA */}
        <div className="mt-16 flex flex-col items-center gap-5 text-center">
          <a
            href="#"
            className="inline-flex items-center gap-3 rounded-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold px-7 py-4 text-sm transition-all duration-200 hover:scale-105 hover:shadow-[0_0_32px_rgba(29,185,84,0.4)]"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            Get Started
          </a>
        </div>
      </div>
    </section>
  );
}
