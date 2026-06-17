"use client";

export default function SourcePage() {
  return (
    <div className="flex h-full gap-6">
      <div className="flex-1">
        <h2 className="mb-4 text-lg font-semibold">Select a Movie Clip</h2>
        <div className="mb-4 flex items-center gap-3">
          <input
            type="text"
            placeholder="Search movies..."
            className="w-full max-w-sm rounded-md border border-border-default bg-surface-raised px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:border-accent-cyan focus:outline-none"
          />
          <button className="rounded-md border border-border-default bg-surface-raised px-3 py-2 text-sm text-text-secondary hover:bg-surface-hover">
            Genre
          </button>
          <button className="rounded-md border border-border-default bg-surface-raised px-3 py-2 text-sm text-text-secondary hover:bg-surface-hover">
            Duration
          </button>
          <button className="rounded-md border border-border-default bg-surface-raised px-3 py-2 text-sm text-text-secondary hover:bg-surface-hover">
            Resolution
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="group cursor-pointer overflow-hidden rounded-lg border border-border-default bg-surface-panel transition-colors hover:border-accent-cyan/40"
            >
              <div className="aspect-video bg-surface-raised" />
              <div className="p-3">
                <p className="text-sm font-medium text-text-primary">Movie Title {i + 1}</p>
                <p className="mt-0.5 text-xs text-text-muted">1:30:00 &middot; Drama</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="w-80 shrink-0 rounded-lg border border-border-default bg-surface-panel p-4">
        <h3 className="mb-3 text-sm font-medium text-text-secondary">Preview</h3>
        <div className="aspect-video rounded-md bg-surface-raised" />
        <p className="mt-3 text-sm text-text-muted">Select a clip to preview it here.</p>
      </div>
    </div>
  );
}
