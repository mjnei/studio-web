"use client";

import { Heading } from "@/components/ui/heading";

interface ReferralLevelBreakdownProps {
  referralsByLevel: Record<string, number>;
}

const LEVEL_LABELS: Record<string, string> = {
  "1": "Level 1 (Direct)",
  "2": "Level 2",
  "3": "Level 3",
  "4": "Level 4",
  "5": "Level 5",
  organic: "Organic signup",
};

function sortKey(level: string): number {
  if (level === "organic") return 0;
  return Number(level);
}

export function ReferralLevelBreakdown({ referralsByLevel }: ReferralLevelBreakdownProps) {
  const entries = Object.entries(referralsByLevel)
    .map(([level, count]) => ({
      level,
      label: LEVEL_LABELS[level] ?? `Level ${level}`,
      count,
    }))
    .sort((a, b) => sortKey(a.level) - sortKey(b.level));

  const total = entries.reduce((sum, entry) => sum + entry.count, 0);

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-border-default bg-surface-panel p-5">
      <Heading variant="label" as="h3" className="mb-4 uppercase tracking-wider text-text-muted">
        Referrals by Level
      </Heading>
      <div className="space-y-3">
        {entries.map((entry) => {
          const percentage = total > 0 ? (entry.count / total) * 100 : 0;
          return (
            <div key={entry.level} className="space-y-1">
              <div className="flex items-center justify-between text-body">
                <span className="font-medium text-text-primary">{entry.label}</span>
                <span className="text-text-muted">
                  {entry.count.toLocaleString()} ({percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-raised">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    entry.level === "organic" ? "bg-text-muted" : "bg-accent-primary"
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
