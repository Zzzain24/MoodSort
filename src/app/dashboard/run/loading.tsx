export default function RunMoodSortLoading() {
  return (
    <div className="px-6 py-8 md:px-10 md:py-10 max-w-2xl mx-auto">
      {/* Stepper skeleton */}
      <div className="flex items-center gap-0 mb-8">
        {[1, 2, 3].map((n, i) => (
          <div key={n} className="flex items-center gap-0 flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className="w-7 h-7 rounded-full bg-black/[0.08] animate-pulse" />
              <div className="w-12 h-2.5 rounded bg-black/[0.06] animate-pulse" />
            </div>
            {i < 2 && <div className="flex-1 h-px mx-2 mb-4 bg-black/[0.08]" />}
          </div>
        ))}
      </div>

      {/* Card skeleton */}
      <div className="bg-white/60 rounded-2xl border border-black/[0.07] shadow-sm p-8 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="w-48 h-6 rounded-lg bg-black/[0.08] animate-pulse" />
          <div className="w-72 h-4 rounded bg-black/[0.05] animate-pulse" />
        </div>
        <div className="flex flex-col gap-4">
          <div className="w-full h-11 rounded-xl bg-black/[0.06] animate-pulse" />
          <div className="w-full h-24 rounded-xl bg-black/[0.06] animate-pulse" />
        </div>
      </div>
    </div>
  );
}
