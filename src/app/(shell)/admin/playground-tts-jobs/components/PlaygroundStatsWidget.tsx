"use client";

import { CheckCircle2, Clock, Zap, Users } from "lucide-react";
import type { PlaygroundTTSJobStats } from "@/types/admin";
import { StatsMetricCard } from "@/app/(shell)/admin/tts-jobs/_shared/StatsMetricCard";

interface PlaygroundStatsWidgetProps {
  stats: PlaygroundTTSJobStats;
}

export function PlaygroundStatsWidget({ stats }: PlaygroundStatsWidgetProps) {
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
        subtitle={`Failed: ${stats.failed_jobs} | Rate Limited: ${stats.rate_limited_count}`}
        valueClassName="text-green-600"
        icon={<CheckCircle2 className="h-6 w-6 text-green-600" />}
        iconClassName="bg-green-500/10"
      />
      <StatsMetricCard
        label="Unique Users"
        value={stats.unique_ip_count}
        subtitle="Anonymous IPs tracked"
        valueClassName="text-purple-600"
        icon={<Users className="h-6 w-6 text-purple-600" />}
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
