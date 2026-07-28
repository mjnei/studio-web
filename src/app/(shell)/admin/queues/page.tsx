"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, AlertCircle } from "lucide-react";
import { listAllQueues } from "@/lib/api/queue-admin";
import type { QueueStats, QueueCategory } from "@/lib/types/queue";
import { QueueStatsCard } from "@/components/queue/QueueStatsCard";
import { QueueCategoryTabs } from "@/components/queue/QueueCategoryTabs";
import { QueuePurgeDialog } from "@/components/queue/QueuePurgeDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/lib/hooks/use-toast";

export default function QueueManagementPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [queues, setQueues] = useState<Record<string, QueueStats>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<QueueCategory | "all">("all");
  const [purgeQueue, setPurgeQueue] = useState<QueueStats | null>(null);

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
      toast({
        title: "Error Loading Queues",
        description: message,
        variant: "destructive",
      });
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
    if (activeCategory === "all") return true;
    return queue.metadata?.category === activeCategory;
  });

  // Count queues by category
  const categoryCounts = {
    all: Object.keys(queues).length,
    tts: Object.values(queues).filter((q) => q.metadata?.category === "tts").length,
    video: Object.values(queues).filter((q) => q.metadata?.category === "video").length,
    agnes: Object.values(queues).filter((q) => q.metadata?.category === "agnes").length,
  };

  // Calculate summary stats
  const totalMessages = Object.values(queues).reduce((sum, q) => sum + q.message_count, 0);
  const totalConsumers = Object.values(queues).reduce((sum, q) => sum + q.consumer_count, 0);
  const criticalQueues = Object.values(queues).filter(
    (q) => q.metadata?.is_job_queue && q.message_count > 0 && q.consumer_count === 0
  ).length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Queue Management</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage all queues across TTS, Video, and Agnes services
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchQueues()} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Messages</CardDescription>
              <CardTitle className="text-3xl">{totalMessages.toLocaleString()}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Active Consumers</CardDescription>
              <CardTitle className="text-3xl">{totalConsumers}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Critical Queues</CardDescription>
              <CardTitle className="text-3xl">
                {criticalQueues}
                {criticalQueues > 0 && (
                  <AlertCircle className="inline-block w-6 h-6 ml-2 text-destructive" />
                )}
              </CardTitle>
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

      {/* Queue Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
      ) : filteredQueues.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">No queues found for category: {activeCategory}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQueues.map((queue) => (
            <QueueStatsCard
              key={queue.queue_name}
              stats={queue}
              onViewDetails={() => router.push(`/admin/queues/${queue.queue_name}`)}
              onPurge={() => setPurgeQueue(queue)}
            />
          ))}
        </div>
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
