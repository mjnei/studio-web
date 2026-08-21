"use client";

import { Heading } from "@/components/ui/heading";

import { Activity, Users, BarChart3, Calendar } from "lucide-react";
import type { AuditStats } from "@/types/admin";

interface AuditStatsCardProps {
  stats: AuditStats;
}

export default function AuditStatsCard({ stats }: AuditStatsCardProps) {
  const topActions = Object.entries(stats.actions_by_type || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="mb-6 space-y-4">
      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border-2 border-border bg-surface-panel p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted">Total Logs</p>
              <Heading variant="metric" className="text-text-primary">
                {stats.total_logs.toLocaleString()}
              </Heading>
            </div>
          </div>
        </div>

        <div className="rounded-xl border-2 border-border bg-surface-panel p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted">Active Users</p>
              <Heading variant="metric" className="text-text-primary">
                {stats.unique_users.toLocaleString()}
              </Heading>
            </div>
          </div>
        </div>

        <div className="rounded-xl border-2 border-border bg-surface-panel p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
              <BarChart3 className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted">Action Types</p>
              <Heading variant="metric" className="text-text-primary">
                {Object.keys(stats.actions_by_type || {}).length}
              </Heading>
            </div>
          </div>
        </div>

        <div className="rounded-xl border-2 border-border bg-surface-panel p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
              <Calendar className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted">Date Range</p>
              <p className="text-sm font-bold text-text-primary">
                {stats.date_range?.start
                  ? new Date(stats.date_range.start).toLocaleDateString()
                  : "N/A"}
              </p>
              <p className="text-xs text-text-muted">
                to{" "}
                {stats.date_range?.end
                  ? new Date(stats.date_range.end).toLocaleDateString()
                  : "Now"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Actions Breakdown */}
      {topActions.length > 0 && (
        <div className="rounded-xl border-2 border-border bg-surface-panel p-4">
          <Heading variant="label" as="h3" className="mb-3 uppercase tracking-wider text-text-muted">
            Top Actions
          </Heading>
          <div className="space-y-2">
            {topActions.map(([action, count]) => {
              const percentage = (count / stats.total_logs) * 100;
              return (
                <div key={action} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-text-primary">{action}</span>
                    <span className="text-text-muted">
                      {count.toLocaleString()} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-surface-raised">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
