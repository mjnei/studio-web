"use client";

import { CheckCircle2, AlertCircle, AlertTriangle } from "lucide-react";
import type { QueueStats } from "@/lib/types/queue";
import { getQueueHealth } from "@/lib/types/queue";

interface HealthIndicatorProps {
  queues: QueueStats[];
}

function getPieSlicePath(startPercent: number, endPercent: number, radius = 40, cx = 50, cy = 50) {
  const startAngle = startPercent * 2 * Math.PI - Math.PI / 2;
  const endAngle = endPercent * 2 * Math.PI - Math.PI / 2;

  const x1 = cx + radius * Math.cos(startAngle);
  const y1 = cy + radius * Math.sin(startAngle);
  const x2 = cx + radius * Math.cos(endAngle);
  const y2 = cy + radius * Math.sin(endAngle);

  const largeArcFlag = endPercent - startPercent > 0.5 ? 1 : 0;

  return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
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

  const slices = [
    {
      key: "healthy",
      label: "Healthy",
      count: healthCounts.healthy,
      percent: healthyPercent,
      className: "fill-emerald-500 hover:fill-emerald-600",
      icon: CheckCircle2,
      iconColor: "text-emerald-500",
    },
    {
      key: "warning",
      label: "Warning",
      count: healthCounts.warning,
      percent: warningPercent,
      className: "fill-yellow-500 hover:fill-yellow-600",
      icon: AlertTriangle,
      iconColor: "text-yellow-500",
    },
    {
      key: "critical",
      label: "Critical",
      count: healthCounts.critical,
      percent: criticalPercent,
      className: "fill-destructive hover:fill-destructive/90",
      icon: AlertCircle,
      iconColor: "text-destructive",
    },
  ];

  let cumulativePercent = 0;
  const renderableSlices = slices
    .filter((s) => s.count > 0)
    .map((s) => {
      const fraction = total > 0 ? s.count / total : 0;
      const start = cumulativePercent;
      const end = cumulativePercent + fraction;
      cumulativePercent = end;
      return {
        ...s,
        fraction,
        start,
        end,
      };
    });

  return (
    <div className="space-y-4">
      {/* Pie Chart & Legend Container */}
      <div className="flex flex-col sm:flex-row items-center gap-4 py-1">
        {/* Pie Chart SVG */}
        <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
            {total === 0 ? (
              <circle cx="50" cy="50" r="40" className="fill-muted stroke-border" />
            ) : (
              renderableSlices.map((slice) =>
                slice.fraction >= 0.999 ? (
                  <circle
                    key={slice.key}
                    cx="50"
                    cy="50"
                    r="40"
                    className={`${slice.className} transition-all duration-300 cursor-pointer`}
                  >
                    <title>{`${slice.label}: ${slice.count} (${Math.round(slice.fraction * 100)}%)`}</title>
                  </circle>
                ) : (
                  <path
                    key={slice.key}
                    d={getPieSlicePath(slice.start, slice.end, 40, 50, 50)}
                    className={`${slice.className} transition-all duration-300 cursor-pointer`}
                  >
                    <title>{`${slice.label}: ${slice.count} (${Math.round(slice.fraction * 100)}%)`}</title>
                  </path>
                )
              )
            )}
            {/* Center cutout for donut style stats */}
            <circle cx="50" cy="50" r="24" className="fill-card" />
            <text
              x="50"
              y="47"
              textAnchor="middle"
              className="fill-foreground text-[14px] font-bold"
              style={{ fontSize: "14px", fontWeight: "bold" }}
            >
              {total}
            </text>
            <text
              x="50"
              y="59"
              textAnchor="middle"
              className="fill-muted-foreground text-[8px]"
              style={{ fontSize: "8px" }}
            >
              queues
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-1 gap-2 flex-1 w-full">
          {slices.map((slice) => (
            <div
              key={slice.key}
              className="flex items-center justify-between gap-2 p-1.5 rounded-md hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <slice.icon className={`h-4 w-4 ${slice.iconColor}`} />
                <span className="text-xs text-muted-foreground">{slice.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{slice.count}</span>
                <span className="text-xs text-muted-foreground w-8 text-right">
                  {total > 0 ? `${slice.percent}%` : "0%"}
                </span>
              </div>
            </div>
          ))}
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
