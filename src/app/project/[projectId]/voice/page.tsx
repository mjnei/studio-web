"use client";

export default function VoicePage() {
  return (
    <div>
      <h2 className="mb-6 text-lg font-semibold">Voice Selection & Generation</h2>

      <section className="mb-8">
        <h3 className="mb-3 text-base font-medium text-text-secondary">1. Choose a Voice</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {["Voice A", "Voice B", "Voice C", "Voice D"].map((name, i) => (
            <div
              key={name}
              className="rounded-lg border border-border-default bg-surface-panel p-4 hover:border-accent-cyan/40"
            >
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-text-primary">{name}</p>
                <button className="rounded-md p-1 text-text-muted hover:bg-surface-hover hover:text-text-secondary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </button>
              </div>
              <p className="text-xs text-text-muted">English &middot; {i % 2 === 0 ? "Female" : "Male"}</p>
              <div className="mt-2 h-6 rounded bg-surface-raised" />
            </div>
          ))}
          <div className="flex items-center justify-center rounded-lg border border-dashed border-border-default bg-surface-panel p-4 text-center">
    <div className="flex h-full flex-col gap-6 overflow-y-auto">
              <p className="text-sm text-text-secondary">Upload or record</p>
              <p className="mt-1 text-xs text-text-muted">30–60s for best clone quality</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h3 className="mb-3 text-base font-medium text-text-secondary">2. Preview Voice</h3>
        <div className="rounded-lg border border-border-default bg-surface-panel p-4">
          <div className="flex items-center gap-4">
            <button className="shrink-0 rounded-md p-2 text-text-muted hover:bg-surface-hover hover:text-text-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </button>
            <div className="h-8 flex-1 rounded bg-surface-raised" />
          </div>
          <p className="mt-2 text-xs text-text-muted">Preview of the first few sentences in the selected voice.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="rounded-md bg-accent-gradient-solid px-3 py-1.5 text-sm font-medium text-white hover:opacity-90">
              Sounds good, continue
            </button>
            <button className="rounded-md border border-border-default bg-surface-raised px-3 py-1.5 text-sm text-text-secondary hover:bg-surface-hover">
              Try a different voice
            </button>
          </div>
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-base font-medium text-text-secondary">3. Generate Full Voiceover</h3>
        <div className="rounded-lg border border-border-default bg-surface-panel p-4">
          <p className="text-sm text-text-muted">Select a voice and preview it first, then generate the full voiceover here.</p>
        </div>
      </section>
    </div>
  );
}
