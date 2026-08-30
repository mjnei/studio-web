"use client";

import { CheckCircle2, Clock, Zap, Timer } from "lucide-react";
import type { TTSJobStats } from "@/types/admin";
import { StatsMetricCard } from "@/app/(shell)/admin/tts-jobs/_shared/StatsMetricCard";
import { formatStatsDuration } from "@/app/(shell)/admin/tts-jobs/_shared/formatters";

interface TTSStatsWidgetProps {
  stats: TTSJobStats;
}

export function TTSStatsWidget({ stats }: TTSStatsWidgetProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatsMetricCard
        label="Total Jobs"
        value={stats.total_jobs}
        subtitle={`Completed: ${stats.completed_jobs}`}
        icon={<Zap className="h-6 w-6 text-blue-600" />}
        iconClassName="bg-blue-500/10"
      />
      <StatsMetricCard
        label="Success Rate"
        value={`${(stats.success_rate * 100).toFixed(1)}%`}
        subtitle={`Failed: ${stats.failed_jobs}`}
        valueClassName="text-green-600"
        icon={<CheckCircle2 className="h-6 w-6 text-green-600" />}
        iconClassName="bg-green-500/10"
      />
      <StatsMetricCard
        label="Avg Duration"
        value={formatStatsDuration(stats.average_duration_seconds)}
        subtitle="Per job"
        valueClassName="text-purple-600"
        icon={<Timer className="h-6 w-6 text-purple-600" />}
        iconClassName="bg-purple-500/10"
      />
      <StatsMetricCard
        label="Active Jobs"
        value={stats.queued_jobs + stats.processing_jobs}
        subtitle={`Queued: ${stats.queued_jobs} | Processing: ${stats.processing_jobs}`}
        valueClassName="text-orange-600"
        icon={<Clock className="h-6 w-6 text-orange-600" />}
        iconClassName="bg-orange-500/10"
      />
    </div>
  );
}
