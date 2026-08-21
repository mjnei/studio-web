"use client";

import { Heading } from "@/components/ui/heading";

import { CheckCircle2, XCircle, Clock, Zap, TrendingUp, Timer } from "lucide-react";
import type { TTSJobStats } from "@/types/admin";

interface TTSStatsWidgetProps {
  stats: TTSJobStats;
}

export function TTSStatsWidget({ stats }: TTSStatsWidgetProps) {
  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}m ${secs}s`;
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Jobs */}
      <div className="rounded-xl border border-border-default bg-gradient-to-br from-surface-panel to-surface-raised p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">
              Total Jobs
            </p>
            <Heading variant="metric" className="text-text-primary">
              {stats.total_jobs}
            </Heading>
            <p className="text-xs text-text-secondary mt-1">Completed: {stats.completed_jobs}</p>
          </div>
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10">
            <Zap className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Success Rate */}
      <div className="rounded-xl border border-border-default bg-gradient-to-br from-surface-panel to-surface-raised p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">
              Success Rate
            </p>
            <Heading variant="metric" className="text-green-600">
              {(stats.success_rate * 100).toFixed(1)}%
            </Heading>
            <p className="text-xs text-text-secondary mt-1">Failed: {stats.failed_jobs}</p>
          </div>
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-500/10">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>

      {/* Average Duration */}
      <div className="rounded-xl border border-border-default bg-gradient-to-br from-surface-panel to-surface-raised p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">
              Avg Duration
            </p>
            <Heading variant="metric" className="text-purple-600">
              {formatDuration(stats.average_duration_seconds)}
            </Heading>
            <p className="text-xs text-text-secondary mt-1">Per job</p>
          </div>
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/10">
            <Timer className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Queue Status */}
      <div className="rounded-xl border border-border-default bg-gradient-to-br from-surface-panel to-surface-raised p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">
              Active Jobs
            </p>
            <Heading variant="metric" className="text-orange-600">
              {stats.queued_jobs + stats.processing_jobs}
            </Heading>
            <p className="text-xs text-text-secondary mt-1">
              Queued: {stats.queued_jobs} | Processing: {stats.processing_jobs}
            </p>
          </div>
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-orange-500/10">
            <Clock className="h-6 w-6 text-orange-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
