"use client";

export default function ScriptPage() {
  const variants = ["Narrative", "Promotional", "Energetic"];

  return (
    <div className="flex h-full flex-col gap-4 md:flex-row md:gap-6">
      <div className="w-full shrink-0 rounded-lg border border-border-default bg-surface-panel p-4 md:w-80">
        <h3 className="mb-3 text-sm font-medium text-text-secondary">Source Clip</h3>
        <div className="aspect-video rounded-md bg-surface-raised" />
        <p className="mt-2 text-xs text-text-muted">Looping preview (muted)</p>
      </div>
      <div className="flex-1">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">AI Script Generation</h2>
          <div className="flex items-center gap-2">
            <select className="rounded-md border border-border-default bg-surface-raised px-2 py-1 text-xs text-text-secondary">
              <option>Standard</option>
              <option>Short</option>
              <option>Detailed</option>
            </select>
            <button className="rounded-md bg-accent-gradient-solid px-3 py-1.5 text-sm font-medium text-white hover:opacity-90">
              Regenerate all
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {variants.map((variant) => (
            <div
              key={variant}
              className="rounded-lg border border-border-default bg-surface-panel p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-text-primary">{variant}</span>
                <button className="rounded-md bg-accent-cyan-muted px-2 py-1 text-xs text-accent-cyan hover:bg-accent-cyan/20">
                  Use this script
                </button>
              </div>
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-md bg-surface-raised p-2">
                    <p className="mb-1 text-xs text-text-muted">00:{(i * 15).toString().padStart(2, "0")} — 00:{((i + 1) * 15).toString().padStart(2, "0")}</p>
                    <p className="text-sm text-text-secondary">
                      Script segment {i + 1} placeholder text for the {variant.toLowerCase()} variant...
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
