"use client";

import React from "react";
import { Play, CheckCircle2, AlertTriangle, Video } from "lucide-react";
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
  icon: typeof Video;
  colorClass: string;
  getCount: (summary: JobsSummary) => number;
}> = [
  {
    value: "all",
    icon: Video,
    colorClass: "text-accent-primary",
    getCount: (summary) => summary.totalCount,
  },
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

export const StatusCards: React.FC<StatusCardsProps> = ({ summary, activeFilter, onSelectFilter }) => {
  const { t } = useI18n();

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-border-default bg-surface-panel p-1">
      {STATUS_ITEMS.map(({ value, icon: Icon, colorClass, getCount }) => {
        const isActive = activeFilter === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => onSelectFilter(value)}
            className={cn(
              "inline-flex min-w-[9rem] flex-1 items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition-all",
              isActive
                ? "bg-accent-primary text-white shadow-sm"
                : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
            )}
            aria-pressed={isActive}
          >
            <span className="flex items-center gap-2">
              <Icon
                className={cn(
                  "h-4 w-4",
                  isActive ? "text-white" : colorClass,
                  value === "active" && getCount(summary) > 0 && !isActive ? "animate-pulse" : ""
                )}
                aria-hidden
              />
              <span className="text-body font-medium">
                {value === "all" ? t("jobs.status.total") : t(`jobs.status.${value}`)}
              </span>
            </span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-caption font-semibold",
                isActive ? "bg-white/20 text-white" : "bg-surface-elevated text-text-primary"
              )}
            >
              {getCount(summary)}
            </span>
          </button>
        );
      })}
    </div>
  );
};
