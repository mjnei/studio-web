export default function MoviesPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Movie Library</h1>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search movies..."
          className="w-full rounded-md border border-border-default bg-surface-raised px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:border-accent-cyan focus:outline-none sm:w-auto sm:max-w-md"
        />
        <button className="rounded-md border border-border-default bg-surface-raised px-3 py-2 text-sm text-text-secondary hover:bg-surface-hover">
          Filters
        </button>
      </div>
      <div className="rounded-lg border border-border-default bg-surface-panel p-4 md:p-8 text-center">
        <p className="mb-2 text-text-secondary">No movies in your library yet.</p>
        <p className="text-sm text-text-muted">Upload clips or browse the stock catalog to get started.</p>
      </div>
    </div>
  );
}
