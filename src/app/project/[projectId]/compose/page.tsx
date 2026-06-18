"use client";

export default function ComposePage() {
  return (
    <div className="flex h-full flex-col gap-3 md:gap-4">
      <div className="flex-1 rounded-lg border border-border-default bg-surface-panel p-3 md:p-4">
        <h3 className="mb-3 text-sm font-medium text-text-secondary">Video Preview</h3>
        <div className="aspect-video max-h-[360px] rounded-md bg-surface-raised" />
      </div>
      <div className="h-56 shrink-0 rounded-lg border border-border-default bg-surface-panel p-3 md:p-4">
        <h3 className="mb-3 text-sm font-medium text-text-secondary">Timeline</h3>
        <div className="space-y-2">
          {["Movie Clip", "Voiceover", "Background Music", "SFX"].map((track, i) => (
            <div key={track} className="flex items-center gap-2 md:gap-3">
              <span className="w-20 shrink-0 truncate text-xs text-text-muted md:w-28">
                {track}
              </span>
              <div className="flex-1">
                <div
                  className={`h-8 rounded ${
                    i === 0
                      ? "bg-accent-cyan/20"
                      : i === 1
                        ? "bg-accent-gradient-solid/30"
                        : i === 2
                          ? "bg-status-processing/20"
                          : "bg-surface-raised"
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
