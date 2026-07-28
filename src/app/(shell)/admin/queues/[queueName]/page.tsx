"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw, AlertCircle, TrendingUp, Activity } from "lucide-react";
import { getQueueStats, getQueueDLQStats } from "@/lib/api/queue-admin";
import type { QueueStats } from "@/lib/types/queue";
import { QueueDetailPanel } from "@/components/queue/QueueDetailPanel";
import { QueueActivityChart } from "@/components/queue/QueueActivityChart";
import { DLQInspector } from "@/components/queue/DLQInspector";
import { QueuePurgeDialog } from "@/components/queue/QueuePurgeDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function QueueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const queueName = params.queueName as string;

  const [stats, setStats] = useState<QueueStats | null>(null);
  const [dlqStats, setDLQStats] = useState<QueueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [purgeDialogOpen, setPurgeDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Auto-refresh interval (5 seconds for detail page)
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchStats = async (silent = false) => {
    if (!silent) setRefreshing(true);
    setError(null);

    try {
      const data = await getQueueStats(queueName);
      setStats(data);

      // Fetch DLQ stats if queue has a DLQ
      if (data.metadata?.dlq_name) {
        try {
          const dlqData = await getQueueDLQStats(queueName);
          setDLQStats(dlqData);
        } catch (err) {
          // DLQ might not exist yet, that's okay
          setDLQStats(null);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load queue stats";
      setError(message);
      if (!silent) toast.error(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchStats();
  }, [queueName]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchStats(true); // Silent refresh
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh, queueName]);

  // Determine queue health status
  const getHealthStatus = () => {
    if (!stats) return { status: "unknown", color: "gray" };

    const isJobQueue = stats.metadata?.is_job_queue;
    const hasMessages = stats.message_count > 0;
    const hasConsumers = stats.consumer_count > 0;

    if (isJobQueue && hasMessages && !hasConsumers) {
      return { status: "critical", color: "destructive" };
    }

    if (isJobQueue && hasMessages && hasConsumers) {
      return { status: "active", color: "default" };
    }

    return { status: "healthy", color: "default" };
  };

  const health = getHealthStatus();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-8 w-24 mt-2" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Card className="border-destructive">
          <CardContent className="flex items-center gap-3 pt-6">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <div>
              <p className="font-medium">Failed to load queue details</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">{stats.metadata?.display_name || queueName}</h1>
                <Badge variant={health.color as any}>{health.status.toUpperCase()}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {stats.metadata?.description || queueName}
              </p>
            </div>
          </div>
        }
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => fetchStats()} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setPurgeDialogOpen(true)}>
              Purge Queue
            </Button>
          </div>
        }
      />

      {/* Real-time Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Messages
            </CardDescription>
            <CardTitle className="text-3xl">{stats.message_count.toLocaleString()}</CardTitle>
            {stats.metadata?.max_messages && (
              <p className="text-xs text-muted-foreground mt-1">
                {Math.round((stats.message_count / stats.metadata.max_messages) * 100)}% capacity
              </p>
            )}
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Consumers
            </CardDescription>
            <CardTitle className="text-3xl">{stats.consumer_count}</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.consumer_count > 0 ? "Active" : "Inactive"}
            </p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Queue Type</CardDescription>
            <CardTitle className="text-lg">
              {stats.metadata?.is_job_queue ? "Job Queue" : "Result Queue"}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Category: {stats.metadata?.category?.toUpperCase()}
            </p>
          </CardHeader>
        </Card>
        {dlqStats && (
          <Card className={dlqStats.message_count > 0 ? "border-destructive" : ""}>
            <CardHeader className="pb-3">
              <CardDescription>Dead-Letter Queue</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                {dlqStats.message_count}
                {dlqStats.message_count > 0 && (
                  <AlertCircle className="w-5 h-5 text-destructive" />
                )}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {dlqStats.message_count > 0 ? "Failed messages" : "No failures"}
              </p>
            </CardHeader>
          </Card>
        )}
      </div>

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity Chart</TabsTrigger>
          {dlqStats && <TabsTrigger value="dlq">Dead-Letter Queue</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <QueueDetailPanel stats={stats} />
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <QueueActivityChart queueName={queueName} stats={stats} />
        </TabsContent>

        {dlqStats && (
          <TabsContent value="dlq" className="space-y-6">
            <DLQInspector queueName={queueName} dlqStats={dlqStats} />
          </TabsContent>
        )}
      </Tabs>

      {/* Auto-refresh indicator */}
      <div className="flex justify-center">
        <button
          onClick={() => setAutoRefresh(!autoRefresh)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Auto-refresh: {autoRefresh ? "ON" : "OFF"} • Updates every 5s
        </button>
      </div>

      {/* Purge Dialog */}
      <QueuePurgeDialog
        queue={stats}
        open={purgeDialogOpen}
        onOpenChange={setPurgeDialogOpen}
        onSuccess={() => fetchStats()}
      />
    </div>
  );
}
