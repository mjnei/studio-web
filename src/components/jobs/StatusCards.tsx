"use client";

import React from "react";
import { Play, CheckCircle2, AlertTriangle } from "lucide-react";
import { useI18n } from "@/i18n";
import { JobsSummary, JobStatusFilter } from "@/types/jobs";
import { cn } from "@/lib/utils/cn";

interface StatusCardsProps {
  summary: JobsSummary;
  activeFilter: JobStatusFilter;
  onSelectFilter: (filter: JobStatusFilter) => void;
}

const STATUS_ITEMS: Array<{
  value: JobStatusFilter;
  icon: typeof Play;
  colorClass: string;
  getCount: (summary: JobsSummary) => number;
}> = [
  {
    value: "active",
    icon: Play,
    colorClass: "text-blue-400",
    getCount: (summary) => summary.activeCount,
  },
  {
    value: "completed",
    icon: CheckCircle2,
    colorClass: "text-status-success",
    getCount: (summary) => summary.completedCount,
  },
  {
    value: "failed",
    icon: AlertTriangle,
    colorClass: "text-status-failed",
    getCount: (summary) => summary.failedCount,
  },
];

export const StatusCards: React.FC<StatusCardsProps> = ({
  summary,
  activeFilter,
  onSelectFilter,
}) => {
  const { t } = useI18n();

  return (
    <div className="mb-6">
      <div className="inline-flex items-center gap-1 rounded-xl bg-surface-panel p-1 shadow-sm border border-border-default">
        {STATUS_ITEMS.map(({ value, icon: Icon, colorClass, getCount }) => {
          const isActive = activeFilter === value;
          const count = getCount(summary);
          return (
            <button
              key={value}
              type="button"
              onClick={() => onSelectFilter(value)}
              className={cn(
                "relative flex items-center gap-2 rounded-lg px-5 py-2 text-body font-semibold transition-all duration-200",
                isActive
                  ? "bg-accent-primary text-white shadow-md"
                  : "text-text-muted hover:text-text-primary hover:bg-surface-raised"
              )}
              aria-pressed={isActive}
            >
              <Icon
                className={cn(
                  "h-4 w-4",
                  isActive ? "text-white" : colorClass,
                  value === "active" && count > 0 && !isActive ? "animate-pulse" : ""
                )}
                aria-hidden
              />
              <span>{t(`jobs.status.${value}`)}</span>
              {count > 0 && (
                <span
                  className={cn(
                    "ml-1 rounded-full px-2 py-0.5 text-caption font-bold",
                    isActive ? "bg-white/20 text-white" : "bg-surface-elevated text-text-muted"
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
