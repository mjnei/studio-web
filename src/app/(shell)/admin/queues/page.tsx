"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  RefreshCw,
  AlertCircle,
  TrendingUp,
  ArrowUpDown,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import { listAllQueues } from "@/lib/api/queue-admin";
import type { QueueStats, QueueCategory } from "@/lib/types/queue";
import { QueueStatsCard } from "@/components/queue/QueueStatsCard";
import { QueueCategoryTabs } from "@/components/queue/QueueCategoryTabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { PageHeader } from "@/components/ui/PageHeader";
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
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("grid-md");
  const [sortBy, setSortBy] = useState<"name" | "messages" | "consumers">("messages");
  const [statsExpanded, setStatsExpanded] = useState(true);

  // Auto-refresh interval (10 seconds)
  const [autoRefresh, setAutoRefresh] = useState(true);

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

  // Calculate summary stats
  const totalMessages = Object.values(queues).reduce((sum, q) => sum + q.message_count, 0);
  const totalConsumers = Object.values(queues).reduce((sum, q) => sum + q.consumer_count, 0);
  const criticalQueues = Object.values(queues).filter(
    (q) => q.metadata?.is_job_queue && q.message_count > 0 && q.consumer_count === 0
  ).length;
  const warningQueues = Object.values(queues).filter((q) => q.message_count > 1000).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <PageHeader
        title="兔子MQ"
        description="Monitor and manage all RabbitMQ across TTS, Video, and Agnes services"
      />

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="flex items-center gap-3 pt-6">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <div>
              <p className="font-medium">Failed to load queues</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats Charts - Expandable */}
      {!loading && !error && (
        <Card>
          <CardHeader
            className="pb-4 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => setStatsExpanded(!statsExpanded)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle>Summary Statistics</CardTitle>
                <ChevronDown
                  className={`w-5 h-5 text-muted-foreground transition-transform ${
                    statsExpanded ? "rotate-0" : "-rotate-90"
                  }`}
                />
              </div>
              {/* Show compact stats in header when collapsed */}
              {!statsExpanded && (
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>
                    Messages: <strong>{totalMessages.toLocaleString()}</strong>
                  </span>
                  <span>
                    Consumers: <strong>{totalConsumers}</strong>
                  </span>
                  {criticalQueues > 0 && (
                    <span className="text-destructive">
                      Critical: <strong>{criticalQueues}</strong>
                    </span>
                  )}
                </div>
              )}
            </div>
          </CardHeader>

          {statsExpanded && (
            <CardContent className="space-y-4">
              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-muted">
                  <CardHeader className="pb-3">
                    <CardDescription className="text-xs">Total Messages</CardDescription>
                    <CardTitle className="text-3xl font-bold">
                      {totalMessages.toLocaleString()}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card className="border-muted">
                  <CardHeader className="pb-3">
                    <CardDescription className="text-xs">Active Consumers</CardDescription>
                    <CardTitle className="text-3xl font-bold">{totalConsumers}</CardTitle>
                  </CardHeader>
                </Card>
                <Card
                  className={
                    criticalQueues > 0 ? "border-destructive bg-destructive/5" : "border-muted"
                  }
                >
                  <CardHeader className="pb-3">
                    <CardDescription className="text-xs">Critical Queues</CardDescription>
                    <CardTitle className="text-3xl font-bold flex items-center gap-2">
                      {criticalQueues}
                      {criticalQueues > 0 && <AlertTriangle className="w-5 h-5 text-destructive" />}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card
                  className={
                    warningQueues > 0 ? "border-yellow-500/50 bg-yellow-500/5" : "border-muted"
                  }
                >
                  <CardHeader className="pb-3">
                    <CardDescription className="text-xs">High Load Queues</CardDescription>
                    <CardTitle className="text-3xl font-bold flex items-center gap-2">
                      {warningQueues}
                      {warningQueues > 0 && <TrendingUp className="w-5 h-5 text-yellow-600" />}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>

              {/* Health & Distribution Charts */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Health Indicator Chart */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">Queue Health Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <HealthIndicator queues={Object.values(queues)} />
                  </CardContent>
                </Card>

                {/* Queue Distribution Chart */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">Messages by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <QueueDistributionChart queues={Object.values(queues)} />
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Category Tabs with Control Buttons */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <QueueCategoryTabs
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            counts={categoryCounts}
          />

          {/* Control Buttons (moved from header) */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => fetchQueues()} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
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
                icon={<ArrowUpDown className="w-4 h-4" />}
              />
            </div>
            <LayoutToggle
              layoutMode={layoutMode}
              onLayoutChange={(mode) => setLayoutMode(mode as LayoutMode)}
              variant="compact"
            />
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
          <CardContent className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">No queues found</p>
            <p className="text-sm text-muted-foreground">
              No queues found for category: {activeCategory}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className={getGridClass()}>
            {sortedQueues.map((queue) => (
              <QueueStatsCard
                key={queue.queue_name}
                stats={queue}
                isRefreshing={refreshing}
                onViewDetails={() => router.push(`/admin/queues/${queue.queue_name}`)}
                onRefresh={() => fetchQueues(true)}
              />
            ))}
          </div>
        </>
      )}

      {/* Auto-refresh indicator */}
      <div className="flex justify-center">
        <button
          onClick={() => setAutoRefresh(!autoRefresh)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Auto-refresh: {autoRefresh ? "ON" : "OFF"} • Updates every 10s
        </button>
      </div>
    </div>
  );
}
