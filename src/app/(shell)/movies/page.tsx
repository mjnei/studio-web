export default function MoviesPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Movie Library</h1>
      <div className="mb-6 flex items-center gap-3">
        <input
          type="text"
          placeholder="Search movies..."
          className="w-full max-w-md rounded-md border border-border-default bg-surface-raised px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:border-accent-cyan focus:outline-none"
        />
        <button className="rounded-md border border-border-default bg-surface-raised px-3 py-2 text-sm text-text-secondary hover:bg-surface-hover">
          Filters
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[2/3] animate-pulse rounded-lg bg-surface-panel"
          />
        ))}
      </div>
      <div className="mt-8 rounded-lg border border-border-default bg-surface-panel p-8 text-center">
        <p className="mb-2 text-text-secondary">No movies in your library yet.</p>
        <p className="text-sm text-text-muted">Upload clips or browse the stock catalog to get started.</p>
      </div>
    </div>
  );
}
