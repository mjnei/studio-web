"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, AlertCircle, ArrowUpDown } from "lucide-react";
import { listAllQueues } from "@/lib/api/queue-admin";
import {
  QUEUE_HISTORY_MONITORED_QUEUES,
  type QueueStats,
  type QueueCategory,
} from "@/lib/types/queue";
import { QueueActivityChart } from "@/components/queue/QueueActivityChart";
import { QueueStatsCard } from "@/components/queue/QueueStatsCard";
import { QueueCategoryTabs } from "@/components/queue/QueueCategoryTabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { LayoutToggle, type LayoutMode } from "@/components/ui/LayoutToggle";
import { Select } from "@/components/ui/select";
import { HealthIndicator } from "@/components/queue/HealthIndicator";
import { QueueDistributionChart } from "@/components/queue/QueueDistributionChart";

export default function QueueManagementPage() {
  const router = useRouter();
  const toast = useToast();

  const [queues, setQueues] = useState<Record<string, QueueStats>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<QueueCategory | "all">("all");
  const [sortBy, setSortBy] = useState<"name" | "messages" | "consumers">("messages");

  // Auto-refresh interval (10 seconds)
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Load layout preference from localStorage on mount (via state initializer)
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(() => {
    if (typeof window === "undefined") return "grid-md";
    const saved = localStorage.getItem("layoutMode:admin-queues");
    if (saved && (saved === "grid-sm" || saved === "grid-md" || saved === "list")) {
      return saved as LayoutMode;
    }
    return "grid-md";
  });

  // Save layout preference to localStorage when it changes
  const handleLayoutChange = (mode: LayoutMode) => {
    setLayoutMode(mode);
    localStorage.setItem("layoutMode:admin-queues", mode);
  };

  const fetchQueues = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    setError(null);

    try {
      const data = await listAllQueues();
      setQueues(data.queues);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load queues";
      setError(message);
      if (!silent) {
        toast.error(message);
      }
    } finally {
      setLoading(false);
      // Extend visual feedback duration: 2 seconds instead of immediate reset
      if (!silent) {
        setTimeout(() => setRefreshing(false), 2000);
      } else {
        setRefreshing(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initial load
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchQueues();
  }, [fetchQueues]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchQueues(true); // Silent refresh
    }, 10000);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchQueues]);

  // Filter queues by category
  const filteredQueues = Object.values(queues).filter((queue) => {
    if (activeCategory !== "all" && queue.metadata?.category !== activeCategory) {
      return false;
    }
    return true;
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

  // Count queues by category
  const categoryCounts = {
    all: Object.keys(queues).length,
    tts: Object.values(queues).filter((q) => q.metadata?.category === "tts").length,
    video: Object.values(queues).filter((q) => q.metadata?.category === "video").length,
    agnes: Object.values(queues).filter((q) => q.metadata?.category === "agnes").length,
    system: Object.values(queues).filter((q) => q.metadata?.category === "system").length,
  };

  // Get responsive grid class based on layout mode
  const getGridClass = () => {
    switch (layoutMode) {
      case "grid-sm":
        // Small cards: 2 cols (base), 2 cols (sm), 3 cols (md), 4 cols (lg), 4 cols (xl)
        return "grid gap-3 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4";
      case "grid-md":
        // Medium cards: 1 col (base), 1 col (sm), 2 cols (md), 3 cols (lg), 3 cols (xl)
        return "grid gap-4 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3";
      case "list":
        return "space-y-3";
      default:
        return "grid gap-4 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3";
    }
  };

  const queueList = Object.values(queues);

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <PageHeader
        title="LavinMQ"
        description="Monitor RabbitMQ queues across TTS, Video, and Agnes"
        className="mb-2 sm:mb-4"
      />

      {error && (
        <Card className="border-destructive">
          <CardContent className="flex items-center gap-3 pt-6">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div>
              <p className="font-medium">Failed to load queues</p>
              <p className="text-body text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && !error && (
        <div className="space-y-5">
          {/* Job queue activity — primary dashboard row */}
          <section aria-label="Job queue activity">
            <div className="grid gap-4 lg:grid-cols-2">
              {QUEUE_HISTORY_MONITORED_QUEUES.map((queueName) => {
                const queueStats = queues[queueName];
                const label = queueStats?.metadata?.display_name ?? queueName;

                return (
                  <Card key={queueName}>
                    <CardHeader className="pb-3">
                      <CardTitle>{label}</CardTitle>
                      <CardDescription>Backlog and consumer trends over the last 5 hours</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {queueStats ? (
                        <QueueActivityChart
                          queueName={queueName}
                          stats={queueStats}
                          compact
                        />
                      ) : (
                        <Skeleton className="h-64 w-full" />
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <p className="mt-3 text-caption text-muted-foreground">
              History is sampled every 60 seconds by the background worker. Enable{" "}
              <code className="text-text-secondary">QUEUE_HISTORY_ENABLED</code> on the worker if
              charts stay empty.
            </p>
          </section>

          {/* Health + distribution — secondary row */}
          <div className="grid gap-4 lg:grid-cols-12">
            <Card className="lg:col-span-4">
              <CardHeader className="pb-3">
                <CardTitle>Queue Health</CardTitle>
                <CardDescription>Healthy, warning, and critical queues</CardDescription>
              </CardHeader>
              <CardContent>
                <HealthIndicator queues={queueList} />
              </CardContent>
            </Card>

            <Card className="lg:col-span-8">
              <CardHeader className="pb-3">
                <CardTitle>Messages by Category</CardTitle>
                <CardDescription>Message volume across TTS, Video, Agnes, and System</CardDescription>
              </CardHeader>
              <CardContent>
                <QueueDistributionChart queues={queueList} />
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Category Tabs with Control Buttons */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <QueueCategoryTabs
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            counts={categoryCounts}
          />

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button variant="outline" size="sm" onClick={() => fetchQueues()} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <div className="w-40">
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
            <LayoutToggle layoutMode={layoutMode} onLayoutChange={handleLayoutChange} />
          </div>
        </div>
      </div>

      {/* Queue Grid */}
      {loading ? (
        <div className={getGridClass()}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sortedQueues.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={<AlertCircle aria-hidden />}
              title="No queues found"
              description={`No queues found for category: ${activeCategory}`}
            />
          </CardContent>
        </Card>
      ) : (
        <div className={getGridClass()}>
          {sortedQueues.map((queue) => (
            <QueueStatsCard
              key={queue.queue_name}
              stats={queue}
              isRefreshing={refreshing}
              onViewDetails={() => router.push(`/admin/queues/${queue.queue_name}`)}
            />
          ))}
        </div>
      )}

      <div className="flex justify-center">
        <button
          onClick={() => setAutoRefresh(!autoRefresh)}
          className="text-caption text-muted-foreground hover:text-foreground transition-colors"
        >
          Auto-refresh: {autoRefresh ? "ON" : "OFF"} • Updates every 10s
        </button>
      </div>
    </div>
  );
}
