export function GenerationProgress({
  label,
  current,
  total,
}: {
  label: string;
  current: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="rounded-lg border border-border-default bg-surface-panel p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-body font-medium text-text-primary">{label}</span>
        <span className="text-caption text-text-muted">
          {current}/{total} &middot; {pct}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-raised">
        <div
          className="h-full rounded-full bg-accent-gradient-solid transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
