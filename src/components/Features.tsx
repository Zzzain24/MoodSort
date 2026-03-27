import { Cpu, RefreshCw, Zap, Clock, Compass, Lock } from "lucide-react";

const FEATURES = [
  {
    icon: Cpu,
    title: "AI Mood Clustering",
    description:
      "K-means clustering on Spotify audio features, then named by Claude AI to capture the true emotional feel of each group.",
  },
  {
    icon: RefreshCw,
    title: "Auto-Sync Daily",
    description:
      "Every new song you like is automatically scored and added to the right playlist overnight — no manual effort required.",
  },
  {
    icon: Zap,
    title: "Manual Sync Trigger",
    description:
      'Liked 10+ songs since your last sync? Unlock "Run MoodSort Now" and sort them immediately without waiting.',
  },
  {
    icon: Clock,
    title: "Pending Review Queue",
    description:
      "Borderline songs surface for your approval before being added, so your playlists stay tight and coherent.",
  },
  {
    icon: Compass,
    title: "Song Discovery",
    description:
      "Get 5–10 Spotify-recommended songs per playlist, matched to each mood's audio fingerprint so they actually fit.",
  },
  {
    icon: Lock,
    title: "Protected Playlists",
    description:
      'Toggle "do not touch" on any playlist to exclude it from all automatic sorting — your handcrafted lists stay yours.',
  },
];

export default function Features() {
  return (
    <section id="features" className="relative py-28 px-6 overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute bottom-0 right-0 w-96 h-96 bg-[#1DB954]/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16 text-center">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#1DB954] mb-4">
            Features
          </p>
          <h2
            className="text-4xl md:text-5xl font-extrabold text-white mb-5"
            style={{ fontFamily: "var(--font-manrope)" }}
          >
            Everything you need.{" "}
            <span className="text-white/35">Nothing you don&apos;t.</span>
          </h2>
          <p className="text-white/50 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            MoodSort handles the full lifecycle. From initial clustering, to
            daily sync, to discovery, so you never have to think about playlist
            management again.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className="group flex flex-col gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-7 hover:border-[#1DB954]/30 hover:bg-white/[0.05] transition-all duration-300 hover:shadow-[0_0_32px_rgba(29,185,84,0.06)]"
              >
                {/* Icon */}
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1DB954]/10 border border-[#1DB954]/20 group-hover:bg-[#1DB954]/20 group-hover:border-[#1DB954]/40 transition-all duration-300">
                  <Icon className="w-5 h-5 text-[#1DB954]" strokeWidth={1.5} />
                </div>

                {/* Text */}
                <div>
                  <h3
                    className="text-base font-bold text-white mb-2"
                    style={{ fontFamily: "var(--font-manrope)" }}
                  >
                    {feature.title}
                  </h3>
                  <p className="text-sm text-white/50 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA nudge */}
        <div className="mt-16 flex flex-col items-center gap-5 text-center">
          <a
            href="#"
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
