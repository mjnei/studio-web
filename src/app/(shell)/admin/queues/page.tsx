"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowUpDown, Users } from "lucide-react";
import { listAllQueues } from "@/lib/api/queue-admin";
import { QUEUE_HISTORY_MONITORED_QUEUES, type QueueStats } from "@/lib/types/queue";
import { QueueActivityChart } from "@/components/queue/QueueActivityChart";
import { QueueStatsCard, getQueueDisplayCategory } from "@/components/queue/QueueStatsCard";
import { QueueCategoryTabs, type FilterCategory } from "@/components/queue/QueueCategoryTabs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Select } from "@/components/ui/select";
import { HealthIndicator } from "@/components/queue/HealthIndicator";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";

export default function QueueManagementPage() {
  const router = useRouter();

  const [queues, setQueues] = useState<Record<string, QueueStats>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("all");
  const [sortBy, setSortBy] = useState<"name" | "messages" | "consumers">("messages");

  const fetchQueues = useCallback(async () => {
    try {
      const data = await listAllQueues();
      setQueues(data.queues);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load queues";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchQueues();
  }, [fetchQueues]);

  // Continuous auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      void fetchQueues();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchQueues]);

  const queueList = Object.values(queues);

  // Compute key KPI metrics
  const totalQueues = queueList.length;
  const totalConsumers = queueList.reduce((sum, q) => sum + (q.consumer_count || 0), 0);

  // Filter queues by active category
  const filteredQueues = queueList.filter((queue) => {
    if (activeCategory === "all") return true;
    const categoryInfo = getQueueDisplayCategory(queue.queue_name, queue.metadata?.category);
    return categoryInfo.label.toLowerCase() === activeCategory;
  });

  // Sort queues
  const sortedQueues = [...filteredQueues].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.queue_name.localeCompare(b.queue_name);
      case "messages":
        return b.message_count - a.message_count;
      case "consumers":
        return b.consumer_count - a.consumer_count;
      default:
        return 0;
    }
  });

  // Count queues per category
  const categoryCounts: Record<FilterCategory, number> = {
    all: totalQueues,
    tts: queueList.filter(
      (q) => getQueueDisplayCategory(q.queue_name, q.metadata?.category).label === "TTS"
    ).length,
    video: queueList.filter(
      (q) => getQueueDisplayCategory(q.queue_name, q.metadata?.category).label === "Video"
    ).length,
    background: queueList.filter(
      (q) => getQueueDisplayCategory(q.queue_name, q.metadata?.category).label === "Background"
    ).length,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header with Live Status Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <PageHeader
          title="LavinMQ Queues"
          description="Real-time message broker telemetry & cluster status"
          className="mb-0"
        />
        <div className="flex items-center gap-2 self-start sm:self-center px-3 py-1.5 rounded-full bg-surface-panel border border-border-default shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-micro font-medium text-text-secondary tracking-wide uppercase">
            Live • 10s auto-refresh
          </span>
        </div>
      </div>

      {/* Error state if API call failed */}
      {error && (
        <Card variant="solid" className="border-destructive/50 bg-destructive/10">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
            <div>
              <p className="font-medium text-text-primary text-body">Failed to load queues</p>
              <p className="text-caption text-text-secondary">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Row: Active Consumers Card & Health Distribution Card side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Health Distribution (No title to save space) */}
        <Card
          variant="glass"
          padding="md"
          className="border-border-default flex flex-col justify-center"
        >
          <HealthIndicator queues={queueList} />
        </Card>
      </div>

      {/* Activity Charts (TTS & Video) */}
      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {QUEUE_HISTORY_MONITORED_QUEUES.map((queueName) => {
            const queueStats = queues[queueName];
            if (!queueStats) return null;

            return (
              <div key={queueName}>
                <QueueActivityChart queueName={queueName} stats={queueStats} compact />
              </div>
            );
          })}
        </div>
      )}

      {/* Category Tabs & Sorting Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
        <QueueCategoryTabs
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          counts={categoryCounts}
        />

        <div className="w-48 self-end sm:self-auto">
          <Select
            value={sortBy}
            onChange={(v) => setSortBy(v as typeof sortBy)}
            options={[
              { value: "messages", label: "Most Messages" },
              { value: "consumers", label: "Most Consumers" },
              { value: "name", label: "Queue Name" },
            ]}
            size="sm"
            icon={<ArrowUpDown className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* Queues Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} variant="glass">
              <CardHeader className="space-y-2">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sortedQueues.length === 0 ? (
        <Card variant="glass">
          <CardContent className="py-8">
            <EmptyState
              size="md"
              icon={<AlertCircle aria-hidden className="text-text-muted" />}
              title="No queues found"
              description={`No queues found in category: ${activeCategory}`}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedQueues.map((queue) => (
            <QueueStatsCard
              key={queue.queue_name}
              stats={queue}
              onViewDetails={() => router.push(`/admin/queues/${queue.queue_name}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
