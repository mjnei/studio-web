"use client";

import { CheckCircle2, AlertCircle, AlertTriangle } from "lucide-react";
import type { QueueStats } from "@/lib/types/queue";
import { getQueueHealth } from "@/lib/types/queue";

interface HealthIndicatorProps {
  queues: QueueStats[];
}

export function HealthIndicator({ queues }: HealthIndicatorProps) {
  const healthCounts = {
    healthy: 0,
    warning: 0,
    critical: 0,
  };

  queues.forEach((queue) => {
    const health = getQueueHealth(queue);
    healthCounts[health.status]++;
  });

  const total = queues.length;
  const healthyPercent = total > 0 ? Math.round((healthCounts.healthy / total) * 100) : 0;
  const warningPercent = total > 0 ? Math.round((healthCounts.warning / total) * 100) : 0;
  const criticalPercent = total > 0 ? Math.round((healthCounts.critical / total) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Health Bar Chart */}
      <div className="flex items-end gap-1 h-24">
        {/* Healthy Bar */}
        <div
          className="flex-1 bg-emerald-500 rounded-t transition-all hover:bg-emerald-600 cursor-help"
          style={{ height: `${Math.max(healthyPercent, 10)}%` }}
          title={`Healthy: ${healthCounts.healthy} (${healthyPercent}%)`}
        />
        {/* Warning Bar */}
        <div
          className="flex-1 bg-yellow-500 rounded-t transition-all hover:bg-yellow-600 cursor-help"
          style={{ height: `${Math.max(warningPercent, 10)}%` }}
          title={`Warning: ${healthCounts.warning} (${warningPercent}%)`}
        />
        {/* Critical Bar */}
        <div
          className="flex-1 bg-destructive rounded-t transition-all hover:bg-destructive/90 cursor-help"
          style={{ height: `${Math.max(criticalPercent, 10)}%` }}
          title={`Critical: ${healthCounts.critical} (${criticalPercent}%)`}
        />
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <div>
              <p className="text-sm font-medium">{healthCounts.healthy}</p>
              <p className="text-xs text-muted-foreground">Healthy</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <div>
              <p className="text-sm font-medium">{healthCounts.warning}</p>
              <p className="text-xs text-muted-foreground">Warning</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <div>
              <p className="text-sm font-medium">{healthCounts.critical}</p>
              <p className="text-xs text-muted-foreground">Critical</p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="pt-2 border-t">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{healthyPercent}%</span> of queues are
          healthy
        </p>
      </div>
    </div>
  );
}
