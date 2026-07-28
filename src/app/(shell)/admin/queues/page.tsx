"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, AlertCircle, Search, Filter, TrendingUp, TrendingDown } from "lucide-react";
import { listAllQueues } from "@/lib/api/queue-admin";
import type { QueueStats, QueueCategory } from "@/lib/types/queue";
import { QueueStatsCard } from "@/components/queue/QueueStatsCard";
import { QueueCategoryTabs } from "@/components/queue/QueueCategoryTabs";
import { QueuePurgeDialog } from "@/components/queue/QueuePurgeDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { PageHeader } from "@/components/ui/PageHeader";
import { LayoutToggle, type LayoutMode } from "@/components/ui/LayoutToggle";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export default function QueueManagementPage() {
  const router = useRouter();
  const toast = useToast();

  const [queues, setQueues] = useState<Record<string, QueueStats>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<QueueCategory | "all">("all");
  const [purgeQueue, setPurgeQueue] = useState<QueueStats | null>(null);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("grid-md");

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [healthFilter, setHealthFilter] = useState<"all" | "healthy" | "warning" | "critical">(
    "all"
  );
  const [sortBy, setSortBy] = useState<"name" | "messages" | "consumers">("messages");

  // Auto-refresh interval (10 seconds)
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchQueues = async (silent = false) => {
    if (!silent) setRefreshing(true);
    setError(null);

    try {
      const data = await listAllQueues();
      setQueues(data.queues);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load queues";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchQueues();
  }, []);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchQueues(true); // Silent refresh
    }, 10000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Filter queues by category
  const filteredQueues = Object.values(queues).filter((queue) => {
    // Category filter
    if (activeCategory !== "all" && queue.metadata?.category !== activeCategory) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      const matchesName = queue.queue_name.toLowerCase().includes(search);
      const matchesDisplay = queue.metadata?.display_name.toLowerCase().includes(search);
      const matchesDescription = queue.metadata?.description.toLowerCase().includes(search);
      if (!matchesName && !matchesDisplay && !matchesDescription) {
        return false;
      }
    }

    // Health filter
    if (healthFilter !== "all") {
      const isJobQueue = queue.metadata?.is_job_queue;
      const hasMessages = queue.message_count > 0;
      const hasConsumers = queue.consumer_count > 0;

      const currentHealth =
        isJobQueue && hasMessages && !hasConsumers
          ? "critical"
          : queue.message_count > 1000
            ? "warning"
            : "healthy";

      if (currentHealth !== healthFilter) {
        return false;
      }
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
  const avgMessagesPerQueue =
    Object.values(queues).length > 0 ? Math.round(totalMessages / Object.values(queues).length) : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <PageHeader
        title="Queue Management"
        description="Monitor and manage all queues across TTS, Video, and Agnes services"
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => fetchQueues()} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <LayoutToggle
              layoutMode={layoutMode}
              onLayoutChange={(mode) => setLayoutMode(mode as LayoutMode)}
              variant="compact"
            />
          </div>
        }
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

      {/* Summary Stats */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Messages</CardDescription>
              <CardTitle className="text-3xl">{totalMessages.toLocaleString()}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Avg {avgMessagesPerQueue}/queue</p>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Active Consumers</CardDescription>
              <CardTitle className="text-3xl">{totalConsumers}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Across {Object.keys(queues).length} queues
              </p>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Critical Queues</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                {criticalQueues}
                {criticalQueues > 0 && <AlertCircle className="w-5 h-5 text-destructive" />}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {criticalQueues > 0 ? "Action required" : "All healthy"}
              </p>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Warning Queues</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                {warningQueues}
                {warningQueues > 0 && <TrendingUp className="w-5 h-5 text-yellow-500" />}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {warningQueues > 0 ? "High load" : "Normal load"}
              </p>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>System Health</CardDescription>
              <CardTitle className="text-2xl">
                {criticalQueues > 0 ? (
                  <span className="text-destructive">Critical</span>
                ) : warningQueues > 0 ? (
                  <span className="text-yellow-500">Warning</span>
                ) : (
                  <span className="text-green-500">Healthy</span>
                )}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {criticalQueues === 0 && warningQueues === 0 ? "All systems go" : "Monitor closely"}
              </p>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Category Tabs */}
      <QueueCategoryTabs
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        counts={categoryCounts}
      />

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search queues by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Health Filter */}
            <div className="flex items-center gap-2 min-w-[180px]">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select
                value={healthFilter}
                onChange={(v) => setHealthFilter(v as typeof healthFilter)}
                placeholder="Filter by health"
                options={[
                  { value: "all", label: "All Health States" },
                  { value: "healthy", label: "Healthy Only" },
                  { value: "warning", label: "Warning Only" },
                  { value: "critical", label: "Critical Only" },
                ]}
              />
            </div>

            {/* Sort By */}
            <div className="flex items-center gap-2 min-w-[150px]">
              <TrendingDown className="w-4 h-4 text-muted-foreground" />
              <Select
                value={sortBy}
                onChange={(v) => setSortBy(v as typeof sortBy)}
                placeholder="Sort by"
                options={[
                  { value: "messages", label: "Most Messages" },
                  { value: "consumers", label: "Most Consumers" },
                  { value: "name", label: "Queue Name" },
                ]}
              />
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchQuery || healthFilter !== "all") && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchQuery && (
                <span className="text-xs bg-muted px-2 py-1 rounded">Search: "{searchQuery}"</span>
              )}
              {healthFilter !== "all" && (
                <span className="text-xs bg-muted px-2 py-1 rounded">Health: {healthFilter}</span>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setHealthFilter("all");
                }}
                className="h-6 text-xs"
              >
                Clear all
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

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
              {searchQuery || healthFilter !== "all"
                ? "Try adjusting your filters or search query"
                : `No queues found for category: ${activeCategory}`}
            </p>
            {(searchQuery || healthFilter !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setHealthFilter("all");
                }}
                className="mt-4"
              >
                Clear filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Results count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {sortedQueues.length} of {Object.keys(queues).length} queues
            </p>
          </div>

          <div className={getGridClass()}>
            {sortedQueues.map((queue) => (
              <QueueStatsCard
                key={queue.queue_name}
                stats={queue}
                onViewDetails={() => router.push(`/admin/queues/${queue.queue_name}`)}
                onPurge={() => setPurgeQueue(queue)}
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

      {/* Purge Dialog */}
      {purgeQueue && (
        <QueuePurgeDialog
          queue={purgeQueue}
          open={!!purgeQueue}
          onOpenChange={(open) => !open && setPurgeQueue(null)}
          onSuccess={() => fetchQueues()}
        />
      )}
    </div>
  );
}
