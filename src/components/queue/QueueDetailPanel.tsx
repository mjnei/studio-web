import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { QueueStats } from "@/lib/types/queue";
import { Clock, Database, HardDrive, TrendingUp, Users } from "lucide-react";

interface QueueDetailPanelProps {
  stats: QueueStats;
}

export function QueueDetailPanel({ stats }: QueueDetailPanelProps) {
  const metadata = stats.metadata;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Queue Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Queue Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Queue Name</span>
            <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded">
              {stats.queue_name}
            </code>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Display Name</span>
            <span className="text-sm font-medium">{metadata?.display_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Category</span>
            <Badge variant="outline">{metadata?.category?.toUpperCase()}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Type</span>
            <Badge variant={metadata?.is_job_queue ? "default" : "secondary"}>
              {metadata?.is_job_queue ? "Job Queue" : "Result Queue"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Current Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Current Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Message Count</span>
            <span className="text-sm font-medium font-mono">
              {stats.message_count.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Active Consumers</span>
            <span className="text-sm font-medium font-mono">{stats.consumer_count}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Consumer Status</span>
            {stats.consumer_count > 0 ? (
              <Badge variant="default" className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                Active
              </Badge>
            ) : (
              <Badge variant="destructive">No Consumers</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="w-5 h-5" />
            Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Max Messages</span>
            <span className="text-sm font-medium">
              {metadata?.max_messages?.toLocaleString() || "Unlimited"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Retention Period</span>
            <span className="text-sm font-medium">
              {metadata?.retention_hours ? `${metadata.retention_hours}h` : "Default"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Dead-Letter Queue</span>
            {metadata?.dlq_name ? (
              <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded">
                {metadata.dlq_name}
              </code>
            ) : (
              <span className="text-sm text-muted-foreground">None</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Description
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{metadata?.description}</p>
          {metadata?.is_job_queue && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">
                This is a job queue. Messages represent pending work that will be processed by
                consumers. High message counts with no consumers may indicate system issues.
              </p>
            </div>
          )}
          {!metadata?.is_job_queue && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">
                This is a result queue. Messages represent completed work results. Messages
                accumulate here until they are consumed by the backend.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
