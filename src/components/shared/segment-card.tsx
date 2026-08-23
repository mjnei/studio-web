"use client";

const colorMap = {
  "accent-cyan": "border-accent-cyan",
  "accent-primary": "border-accent-primary",
  "accent-secondary": "border-accent-secondary",
  "status-processing": "border-status-processing",
  "status-completed": "border-status-completed",
} as const;

export function SegmentCard({
  start,
  end,
  children,
  color = "accent-cyan",
}: {
  start: string;
  end: string;
  children: React.ReactNode;
  color?: keyof typeof colorMap;
}) {
  return (
    <div className={`rounded-md border-l-2 ${colorMap[color]} bg-surface-raised p-3`}>
      <p className="mb-1 font-mono text-caption text-text-muted">
        {start} — {end}
      </p>
      <div className="text-body text-text-secondary">{children}</div>
    </div>
  );
}
