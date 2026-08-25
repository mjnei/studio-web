"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Activity,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import { getQueueStats, getQueueDLQStats } from "@/lib/api/queue-admin";
import type { QueueStats } from "@/lib/types/queue";
import { QueueDetailPanel } from "@/components/queue/QueueDetailPanel";
import { QueueActivityChart } from "@/components/queue/QueueActivityChart";
import { DLQInspector } from "@/components/queue/DLQInspector";
import { QueueMessagePeeker } from "@/components/queue/QueueMessagePeeker";
import { QueuePurgeDialog } from "@/components/queue/QueuePurgeDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { PageHeader } from "@/components/ui/PageHeader";
import { Heading } from "@/components/ui/heading";
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
  const [statsExpanded, setStatsExpanded] = useState(true);

  // Auto-refresh interval (5 seconds for detail page)
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchStats = useCallback(
    async (silent = false) => {
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
          } catch {
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
    },
    [queueName, toast]
  );

  // Initial load
  useEffect(() => {
    let isMounted = true;

    const loadInitial = async () => {
      setError(null);

      try {
        const data = await getQueueStats(queueName);
        if (isMounted) {
          setStats(data);

          // Fetch DLQ stats if queue has a DLQ
          if (data.metadata?.dlq_name) {
            try {
              const dlqData = await getQueueDLQStats(queueName);
              if (isMounted) {
                setDLQStats(dlqData);
              }
            } catch {
              // DLQ might not exist yet, that's okay
              if (isMounted) {
                setDLQStats(null);
              }
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : "Failed to load queue stats";
          setError(message);
          toast.error(message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadInitial();

    return () => {
      isMounted = false;
    };
  }, [queueName, toast]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchStats(true); // Silent refresh
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchStats]);

  // Determine queue health status
  const getHealthStatus = () => {
    if (!stats) return { status: "unknown", color: "default" as const, icon: Activity };

    const isJobQueue = stats.metadata?.is_job_queue;
    const hasMessages = stats.message_count > 0;
    const hasConsumers = stats.consumer_count > 0;

    if (isJobQueue && hasMessages && !hasConsumers) {
      return { status: "critical", color: "destructive" as const, icon: AlertCircle };
    }

    if (stats.message_count > 1000) {
      return { status: "warning", color: "default" as const, icon: AlertTriangle };
    }

    return { status: "healthy", color: "default" as const, icon: Activity };
  };

  const health = getHealthStatus();
  const HealthIcon = health.icon;

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
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card className="border-destructive">
          <CardContent className="flex items-center gap-3 pt-6">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div>
              <p className="font-medium">Failed to load queue details</p>
              <p className="text-body text-muted-foreground">{error}</p>
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
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <Heading variant="page">{stats.metadata?.display_name || queueName}</Heading>
              <p className="text-body text-muted-foreground mt-1">
                {stats.metadata?.description || queueName}
              </p>
            </div>
          </div>
        }
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => fetchStats()} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setPurgeDialogOpen(true)}>
              Purge Queue
            </Button>
          </div>
        }
      />

      {/* Summary Statistics - Expandable (matching hub page design) */}
      <Card>
        <CardHeader
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => setStatsExpanded(!statsExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle>Queue Statistics</CardTitle>
              <Badge variant={health.color}>{health.status.toUpperCase()}</Badge>
              <ChevronDown
                className={`h-5 w-5 text-muted-foreground transition-transform ${
                  statsExpanded ? "rotate-0" : "-rotate-90"
                }`}
              />
            </div>
            {/* Show compact stats in header when collapsed */}
            {!statsExpanded && (
              <div className="flex items-center gap-4 text-body text-muted-foreground">
                <span>
                  Messages: <strong>{stats.message_count.toLocaleString()}</strong>
                </span>
                <span>
                  Consumers: <strong>{stats.consumer_count}</strong>
                </span>
                {dlqStats && dlqStats.message_count > 0 && (
                  <span className="text-destructive">
                    DLQ: <strong>{dlqStats.message_count}</strong>
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
                  <CardDescription className="flex items-center gap-2 text-caption">
                    <Activity className="h-4 w-4" />
                    Messages
                  </CardDescription>
                  <Heading variant="metric">{stats.message_count.toLocaleString()}</Heading>
                  {stats.metadata?.max_messages && (
                    <p className="text-caption text-muted-foreground mt-1">
                      {Math.round((stats.message_count / stats.metadata.max_messages) * 100)}%
                      capacity
                    </p>
                  )}
                </CardHeader>
              </Card>

              <Card className="border-muted">
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2 text-caption">
                    <TrendingUp className="h-4 w-4" />
                    Consumers
                  </CardDescription>
                  <Heading variant="metric">{stats.consumer_count}</Heading>
                  <p className="text-caption text-muted-foreground mt-1">
                    {stats.consumer_count > 0 ? "Active" : "Inactive"}
                  </p>
                </CardHeader>
              </Card>

              <Card className="border-muted">
                <CardHeader className="pb-3">
                  <CardDescription className="text-caption">Queue Type</CardDescription>
                  <Heading variant="subsection" as="h3">
                    {stats.metadata?.is_job_queue ? "Job Queue" : "Result Queue"}
                  </Heading>
                  <p className="text-caption text-muted-foreground mt-1">
                    Category: {stats.metadata?.category?.toUpperCase()}
                  </p>
                </CardHeader>
              </Card>

              {dlqStats && (
                <Card
                  className={
                    dlqStats.message_count > 0
                      ? "border-destructive bg-destructive/5"
                      : "border-muted"
                  }
                >
                  <CardHeader className="pb-3">
                    <CardDescription className="text-caption">Dead-Letter Queue</CardDescription>
                    <Heading variant="metric" className="flex items-center gap-2">
                      {dlqStats.message_count}
                      {dlqStats.message_count > 0 && (
                        <AlertCircle className="h-5 w-5 text-destructive" />
                      )}
                    </Heading>
                    <p className="text-caption text-muted-foreground mt-1">
                      {dlqStats.message_count > 0 ? "Failed messages" : "No failures"}
                    </p>
                  </CardHeader>
                </Card>
              )}
            </div>

            {/* Health Status Banner */}
            <Card
              className={
                health.status === "critical"
                  ? "border-destructive bg-destructive/5"
                  : health.status === "warning"
                    ? "border-yellow-500 bg-yellow-500/5"
                    : "border-muted"
              }
            >
              <CardContent className="flex items-center gap-3 pt-4 pb-4">
                <HealthIcon
                  className={`h-5 w-5 ${
                    health.status === "critical"
                      ? "text-destructive"
                      : health.status === "warning"
                        ? "text-yellow-600"
                        : "text-green-600"
                  }`}
                />
                <div>
                  <p className="font-semibold text-body">
                    Health Status: {health.status === "critical" && "Critical - Requires Attention"}
                    {health.status === "warning" && "Warning - High Load"}
                    {health.status === "healthy" && "Healthy - Normal Operation"}
                  </p>
                  <p className="text-caption text-muted-foreground mt-1">
                    {health.status === "critical" &&
                      "No consumers processing messages - jobs may be stuck"}
                    {health.status === "warning" &&
                      "Queue is experiencing high load - monitor for backlog"}
                    {health.status === "healthy" && "All systems operating normally"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        )}
      </Card>

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity Chart</TabsTrigger>
          <TabsTrigger value="messages">Peek Messages</TabsTrigger>
          {dlqStats && <TabsTrigger value="dlq">Dead-Letter Queue</TabsTrigger>}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <QueueDetailPanel stats={stats} />
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <QueueActivityChart queueName={queueName} stats={stats} />
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          <QueueMessagePeeker queueName={queueName} stats={stats} />
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
          className="text-caption text-muted-foreground hover:text-foreground transition-colors"
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
