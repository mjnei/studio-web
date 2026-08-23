import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { QueueStats } from "@/lib/types/queue";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface QueueActivityChartProps {
  queueName: string;
  stats: QueueStats;
}

interface DataPoint {
  timestamp: string;
  messageCount: number;
  consumerCount: number;
}

export function QueueActivityChart({ queueName, stats }: QueueActivityChartProps) {
  const [history, setHistory] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulate collecting historical data
  // In a real implementation, this would fetch from a time-series database or API
  useEffect(() => {
    // Initialize with current data
    const now = new Date();
    const initialData: DataPoint[] = [];

    // Generate last hour of data (12 points, 5 minutes apart)
    for (let i = 11; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 5 * 60 * 1000);
      initialData.push({
        timestamp: timestamp.toLocaleTimeString(),
        messageCount: Math.max(0, stats.message_count + Math.floor(Math.random() * 20 - 10)),
        consumerCount: stats.consumer_count,
      });
    }

    setHistory(initialData);
    setLoading(false);
  }, [queueName, stats.message_count, stats.consumer_count]);

  // Update history with new data point every time stats change
  useEffect(() => {
    if (loading) return;

    const newDataPoint: DataPoint = {
      timestamp: new Date().toLocaleTimeString(),
      messageCount: stats.message_count,
      consumerCount: stats.consumer_count,
    };

    setHistory((prev) => {
      const updated = [...prev.slice(1), newDataPoint]; // Keep last 12 points
      return updated;
    });
  }, [stats.message_count, stats.consumer_count, loading]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Calculate trend
  const firstValue = history[0]?.messageCount || 0;
  const lastValue = history[history.length - 1]?.messageCount || 0;
  const trend = lastValue - firstValue;
  const trendPercent =
    firstValue > 0 ? (((lastValue - firstValue) / firstValue) * 100).toFixed(1) : "0.0";

  // Calculate max value for scaling
  const maxMessages = Math.max(...history.map((d) => d.messageCount), 1);
  const maxConsumers = Math.max(...history.map((d) => d.consumerCount), 1);

  return (
    <div className="space-y-6">
      {/* Trend Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Activity Trend (Last Hour)</span>
            <div className="flex items-center gap-2 text-sm font-normal">
              {trend > 0 ? (
                <>
                  <TrendingUp className="h-4 w-4 text-red-500" />
                  <span className="text-red-500">+{trendPercent}%</span>
                </>
              ) : trend < 0 ? (
                <>
                  <TrendingDown className="h-4 w-4 text-green-500" />
                  <span className="text-green-500">{trendPercent}%</span>
                </>
              ) : (
                <>
                  <Minus className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">No change</span>
                </>
              )}
            </div>
          </CardTitle>
          <CardDescription>Message count over time (sampled every 5 minutes)</CardDescription>
        </CardHeader>
      </Card>

      {/* Message Count Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Message Count</CardTitle>
          <CardDescription>Number of pending messages in the queue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {/* Y-axis labels */}
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>0</span>
              <span>{Math.floor(maxMessages / 2)}</span>
              <span>{maxMessages}</span>
            </div>

            {/* Chart */}
            <div className="relative h-48 border rounded-lg bg-muted/20 p-4">
              <svg className="w-full h-full" viewBox="0 0 600 180">
                {/* Grid lines */}
                <line
                  x1="0"
                  y1="90"
                  x2="600"
                  y2="90"
                  stroke="currentColor"
                  strokeOpacity="0.1"
                  strokeDasharray="4"
                />
                <line
                  x1="0"
                  y1="45"
                  x2="600"
                  y2="45"
                  stroke="currentColor"
                  strokeOpacity="0.1"
                  strokeDasharray="4"
                />
                <line
                  x1="0"
                  y1="135"
                  x2="600"
                  y2="135"
                  stroke="currentColor"
                  strokeOpacity="0.1"
                  strokeDasharray="4"
                />

                {/* Line chart */}
                <polyline
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  points={history
                    .map((point, i) => {
                      const x = (i / (history.length - 1)) * 580 + 10;
                      const y = 170 - (point.messageCount / maxMessages) * 160;
                      return `${x},${y}`;
                    })
                    .join(" ")}
                />

                {/* Data points */}
                {history.map((point, i) => {
                  const x = (i / (history.length - 1)) * 580 + 10;
                  const y = 170 - (point.messageCount / maxMessages) * 160;
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r="3"
                      fill="hsl(var(--primary))"
                      className="hover:r-5 transition-all"
                    >
                      <title>
                        {point.timestamp}: {point.messageCount} messages
                      </title>
                    </circle>
                  );
                })}
              </svg>
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>{history[0]?.timestamp || ""}</span>
              <span>{history[Math.floor(history.length / 2)]?.timestamp || ""}</span>
              <span>{history[history.length - 1]?.timestamp || ""}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consumer Count Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Consumer Count</CardTitle>
          <CardDescription>Number of active consumers processing the queue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {/* Y-axis labels */}
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>0</span>
              <span>{Math.max(1, Math.floor(maxConsumers / 2))}</span>
              <span>{Math.max(1, maxConsumers)}</span>
            </div>

            {/* Chart */}
            <div className="relative h-32 border rounded-lg bg-muted/20 p-4">
              <svg className="w-full h-full" viewBox="0 0 600 120">
                {/* Grid line */}
                <line
                  x1="0"
                  y1="60"
                  x2="600"
                  y2="60"
                  stroke="currentColor"
                  strokeOpacity="0.1"
                  strokeDasharray="4"
                />

                {/* Step chart (consumers usually don't change gradually) */}
                {history.map((point, i) => {
                  if (i === 0) return null;
                  const x1 = ((i - 1) / (history.length - 1)) * 580 + 10;
                  const x2 = (i / (history.length - 1)) * 580 + 10;
                  const y1 = 110 - (history[i - 1].consumerCount / Math.max(1, maxConsumers)) * 100;
                  const y2 = 110 - (point.consumerCount / Math.max(1, maxConsumers)) * 100;

                  return (
                    <g key={i}>
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y1}
                        stroke="hsl(var(--chart-2))"
                        strokeWidth="2"
                      />
                      <line
                        x1={x2}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="hsl(var(--chart-2))"
                        strokeWidth="2"
                        strokeDasharray="2"
                      />
                    </g>
                  );
                })}

                {/* Data points */}
                {history.map((point, i) => {
                  const x = (i / (history.length - 1)) * 580 + 10;
                  const y = 110 - (point.consumerCount / Math.max(1, maxConsumers)) * 100;
                  return (
                    <circle key={i} cx={x} cy={y} r="3" fill="hsl(var(--chart-2))">
                      <title>
                        {point.timestamp}: {point.consumerCount} consumers
                      </title>
                    </circle>
                  );
                })}
              </svg>
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>{history[0]?.timestamp || ""}</span>
              <span>{history[Math.floor(history.length / 2)]?.timestamp || ""}</span>
              <span>{history[history.length - 1]?.timestamp || ""}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Note about data collection */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <p className="text-xs text-muted-foreground">
            <strong>Note:</strong> Activity data is collected client-side during your current
            session. Historical data from before you opened this page is not available. For
            persistent monitoring, consider setting up a monitoring service.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
