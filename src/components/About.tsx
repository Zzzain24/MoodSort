import { Music2, ListMusic, Sparkles } from "lucide-react";

const STEPS = [
  {
    number: "01",
    icon: Music2,
    title: "Connect Spotify",
    description:
      "Sign in with your Spotify account in one click. MoodSort reads your liked songs — nothing else.",
  },
  {
    number: "02",
    icon: ListMusic,
    title: "Pick Seed Songs",
    description:
      "Select 50+ songs that represent your taste. The AI uses these to learn your moods and define your playlist clusters.",
  },
  {
    number: "03",
    icon: Sparkles,
    title: "AI Builds Your Playlists",
    description:
      "MoodSort clusters your entire library into 3–5 named mood playlists and creates them directly in your Spotify.",
  },
];

export default function About() {
  return (
    <section
      id="about"
      className="relative py-28 px-6 overflow-hidden"
    >
      {/* Subtle background accent */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-[#1DB954]/40 to-transparent" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16 text-center">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#1DB954] mb-4">
            How it works
          </p>
          <h2
            className="text-4xl md:text-5xl font-extrabold text-white mb-5"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            From liked songs to{" "}
            <span className="text-[#1DB954]">curated moods</span>
            <br className="hidden md:block" /> in under 3 minutes.
          </h2>
          <p className="text-white/50 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            MoodSort analyzes Spotify's audio features — energy, valence,
            tempo, danceability — combined with Claude AI to understand the
            emotional feel of every song you've saved.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Connector line (desktop only) */}
          <div className="hidden md:block absolute top-10 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={i}
                className="relative flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-8 hover:border-[#1DB954]/30 hover:bg-white/[0.05] transition-all duration-300 group"
              >
                {/* Step number */}
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1DB954]/10 border border-[#1DB954]/20 group-hover:bg-[#1DB954]/20 transition-colors duration-300">
                    <Icon className="w-5 h-5 text-[#1DB954]" strokeWidth={1.5} />
                  </div>
                  <span
                    className="text-5xl font-black text-white/[0.06] select-none"
                    style={{ fontFamily: "var(--font-manrope)" }}
                  >
                    {step.number}
                  </span>
                </div>

                <div>
                  <h3
                    className="text-lg font-bold text-white mb-2"
                    style={{ fontFamily: "var(--font-manrope)" }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-sm text-white/50 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom note */}
        <p className="mt-10 text-center text-sm text-white/30">
          Once your playlists are approved, MoodSort sorts{" "}
          <span className="text-white/50">every song in your library</span> — not just
          your seed picks.
        </p>
      </div>
    </section>
  );
}
