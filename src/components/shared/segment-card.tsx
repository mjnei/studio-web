"use client";

export function SegmentCard({
  start,
  end,
  children,
  color = "accent-cyan",
}: {
  start: string;
  end: string;
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <div className={`rounded-md border-l-2 border-${color} bg-surface-raised p-3`}>
      <p className="mb-1 font-mono text-xs text-text-muted">
        {start} — {end}
      </p>
      <div className="text-sm text-text-secondary">{children}</div>
    </div>
  );
}
