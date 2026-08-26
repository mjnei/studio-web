"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getQueueHistory } from "@/lib/api/queue-admin";
import type { QueueHistoryPoint, QueueStats } from "@/lib/types/queue";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface QueueActivityChartProps {
  queueName: string;
  stats: QueueStats;
}

interface ChartPoint {
  ts: number;
  label: string;
  messageCount: number;
  consumerCount: number;
}

const HISTORY_RANGE_SECONDS = 18000;
const HISTORY_POLL_MS = 30_000;

function formatClock(ts: number): string {
  const d = new Date(ts * 1000);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
}

function toChartPoints(points: QueueHistoryPoint[]): ChartPoint[] {
  return points.map((p) => ({
    ts: p.ts,
    label: formatClock(p.ts),
    messageCount: p.message_count,
    consumerCount: p.consumer_count,
  }));
}

/** Append live stats as the newest point when they differ from the last sample. */
function mergeLivePoint(points: ChartPoint[], stats: QueueStats): ChartPoint[] {
  if (points.length === 0) {
    return points;
  }

  const nowTs = Math.floor(Date.now() / 1000);
  const live: ChartPoint = {
    ts: nowTs,
    label: formatClock(nowTs),
    messageCount: stats.message_count,
    consumerCount: stats.consumer_count,
  };

  const last = points[points.length - 1];
  if (last.messageCount === live.messageCount && last.consumerCount === live.consumerCount) {
    return points;
  }

  return [...points, live];
}

export function QueueActivityChart({ queueName, stats }: QueueActivityChartProps) {
  const [history, setHistory] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      try {
        const data = await getQueueHistory(queueName, HISTORY_RANGE_SECONDS);
        if (cancelled) return;
        if (data.available === false) {
          setUnavailable(true);
          setHistory([]);
        } else {
          setHistory(toChartPoints(data.points ?? []));
          setUnavailable(false);
        }
      } catch {
        if (cancelled) return;
        setUnavailable(true);
        setHistory([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    setLoading(true);
    void loadHistory();
    const id = window.setInterval(() => {
      void loadHistory();
    }, HISTORY_POLL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [queueName]);

  const displayHistory = mergeLivePoint(history, stats);
  const hasSeries = displayHistory.length > 0;

  const firstValue = displayHistory[0]?.messageCount || 0;
  const lastValue = displayHistory[displayHistory.length - 1]?.messageCount || 0;
  const trend = lastValue - firstValue;
  const trendPercent =
    firstValue > 0 ? (((lastValue - firstValue) / firstValue) * 100).toFixed(1) : "0.0";

  const maxMessages = Math.max(...displayHistory.map((d) => d.messageCount), 1);
  const maxConsumers = Math.max(...displayHistory.map((d) => d.consumerCount), 1);

  const emptyMessage = unavailable
    ? "History unavailable"
    : loading
      ? "Loading history…"
      : "Collecting samples…";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Activity Trend (Last 5 Hours)</span>
            {hasSeries && (
              <div className="flex items-center gap-2 text-body font-normal">
                {trend > 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-status-error" />
                    <span className="text-status-error">+{trendPercent}%</span>
                  </>
                ) : trend < 0 ? (
                  <>
                    <TrendingDown className="h-4 w-4 text-status-success" />
                    <span className="text-status-success">{trendPercent}%</span>
                  </>
                ) : (
                  <>
                    <Minus className="h-4 w-4 text-text-muted" />
                    <span className="text-text-muted">No change</span>
                  </>
                )}
              </div>
            )}
          </CardTitle>
          <CardDescription>Message count over time (sampled every 30 seconds)</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Message Count</CardTitle>
          <CardDescription>Number of pending messages in the queue</CardDescription>
        </CardHeader>
        <CardContent>
          {!hasSeries ? (
            <p className="text-body text-text-muted py-12 text-center">{emptyMessage}</p>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between text-caption text-text-muted mb-2">
                <span>0</span>
                <span>{Math.floor(maxMessages / 2)}</span>
                <span>{maxMessages}</span>
              </div>

              <div className="relative h-48 rounded-lg border border-border-default bg-surface-raised p-4">
                <svg
                  className="h-full w-full text-accent-primary"
                  viewBox="0 0 600 180"
                  aria-hidden
                >
                  <line
                    x1="0"
                    y1="90"
                    x2="600"
                    y2="90"
                    className="text-text-muted"
                    stroke="currentColor"
                    strokeOpacity="0.2"
                    strokeDasharray="4"
                  />
                  <line
                    x1="0"
                    y1="45"
                    x2="600"
                    y2="45"
                    className="text-text-muted"
                    stroke="currentColor"
                    strokeOpacity="0.2"
                    strokeDasharray="4"
                  />
                  <line
                    x1="0"
                    y1="135"
                    x2="600"
                    y2="135"
                    className="text-text-muted"
                    stroke="currentColor"
                    strokeOpacity="0.2"
                    strokeDasharray="4"
                  />

                  {displayHistory.length > 1 && (
                    <polyline
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      points={displayHistory
                        .map((point, i) => {
                          const x = (i / (displayHistory.length - 1)) * 580 + 10;
                          const y = 160 - (point.messageCount / maxMessages) * 140;
                          return `${x},${y}`;
                        })
                        .join(" ")}
                    />
                  )}

                  {displayHistory.map((point, i) => {
                    const x =
                      displayHistory.length === 1
                        ? 300
                        : (i / (displayHistory.length - 1)) * 580 + 10;
                    const y = 160 - (point.messageCount / maxMessages) * 140;
                    return (
                      <circle
                        key={`${point.ts}-${i}`}
                        cx={x}
                        cy={y}
                        r="3.5"
                        fill="currentColor"
                        stroke="var(--surface-raised)"
                        strokeWidth="1.5"
                      >
                        <title>
                          {point.label}: {point.messageCount} messages
                        </title>
                      </circle>
                    );
                  })}
                </svg>
              </div>

              <div className="mt-2 flex justify-between text-caption text-text-muted">
                <span>{displayHistory[0]?.label || ""}</span>
                <span>{displayHistory[Math.floor(displayHistory.length / 2)]?.label || ""}</span>
                <span>{displayHistory[displayHistory.length - 1]?.label || ""}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Consumer Count</CardTitle>
          <CardDescription>Number of active consumers processing the queue</CardDescription>
        </CardHeader>
        <CardContent>
          {!hasSeries ? (
            <p className="text-body text-text-muted py-8 text-center">{emptyMessage}</p>
          ) : (
            <div className="space-y-2">
              <div className="mb-2 flex justify-between text-caption text-text-muted">
                <span>0</span>
                <span>{Math.max(1, Math.floor(maxConsumers / 2))}</span>
                <span>{Math.max(1, maxConsumers)}</span>
              </div>

              <div className="relative h-32 rounded-lg border border-border-default bg-surface-raised p-4">
                <svg
                  className="h-full w-full text-accent-secondary"
                  viewBox="0 0 600 120"
                  aria-hidden
                >
                  <line
                    x1="0"
                    y1="60"
                    x2="600"
                    y2="60"
                    className="text-text-muted"
                    stroke="currentColor"
                    strokeOpacity="0.2"
                    strokeDasharray="4"
                  />

                  {displayHistory.map((point, i) => {
                    if (i === 0 || displayHistory.length < 2) return null;
                    const x1 = ((i - 1) / (displayHistory.length - 1)) * 580 + 10;
                    const x2 = (i / (displayHistory.length - 1)) * 580 + 10;
                    const y1 =
                      100 - (displayHistory[i - 1].consumerCount / Math.max(1, maxConsumers)) * 80;
                    const y2 = 100 - (point.consumerCount / Math.max(1, maxConsumers)) * 80;

                    return (
                      <g key={`step-${point.ts}-${i}`}>
                        <line
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y1}
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <line
                          x1={x2}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeDasharray="2"
                          strokeLinecap="round"
                        />
                      </g>
                    );
                  })}

                  {displayHistory.map((point, i) => {
                    const x =
                      displayHistory.length === 1
                        ? 300
                        : (i / (displayHistory.length - 1)) * 580 + 10;
                    const y = 100 - (point.consumerCount / Math.max(1, maxConsumers)) * 80;
                    return (
                      <circle
                        key={`c-${point.ts}-${i}`}
                        cx={x}
                        cy={y}
                        r="3.5"
                        fill="currentColor"
                        stroke="var(--surface-raised)"
                        strokeWidth="1.5"
                      >
                        <title>
                          {point.label}: {point.consumerCount} consumers
                        </title>
                      </circle>
                    );
                  })}
                </svg>
              </div>

              <div className="mt-2 flex justify-between text-caption text-text-muted">
                <span>{displayHistory[0]?.label || ""}</span>
                <span>{displayHistory[Math.floor(displayHistory.length / 2)]?.label || ""}</span>
                <span>{displayHistory[displayHistory.length - 1]?.label || ""}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-surface-raised/60">
        <CardContent className="pt-6">
          <p className="text-caption text-text-muted">
            History is sampled every 30 seconds by the background worker and stored in Valkey
            (shared across admins). Enable{" "}
            <code className="text-text-secondary">QUEUE_HISTORY_ENABLED</code> on the worker if the
            chart stays empty.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
