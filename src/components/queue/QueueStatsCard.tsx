"use client";

import { AlertCircle, CheckCircle2, Clock, Users, RefreshCw } from "lucide-react";
import type { QueueStats } from "@/lib/types/queue";
import { getQueueHealth, getHealthColor } from "@/lib/types/queue";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";

interface QueueStatsCardProps {
  stats: QueueStats;
  onViewDetails?: () => void;
  onRefresh?: () => void;
}

export function QueueStatsCard({ stats, onViewDetails, onRefresh }: QueueStatsCardProps) {
  const health = getQueueHealth(stats);
  const colors = getHealthColor(health.status);

  const { metadata, message_count, consumer_count, queue_name } = stats;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{queue_name}</CardTitle>
              {metadata?.description && (
                <Tooltip content={metadata.description} position="top">
                  <div className="text-muted-foreground hover:text-foreground cursor-help">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                </Tooltip>
              )}
            </div>
          </div>
          <Badge variant="outline" className={colors.badge}>
            {health.status === "healthy" && <CheckCircle2 className="w-3 h-3 mr-1" />}
            {health.status === "warning" && <AlertCircle className="w-3 h-3 mr-1" />}
            {health.status === "critical" && <AlertCircle className="w-3 h-3 mr-1" />}
            {health.status.charAt(0).toUpperCase() + health.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Message Count */}
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded">
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{message_count.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Messages</p>
            </div>
          </div>

          {/* Consumer Count */}
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded">
              <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{consumer_count}</p>
              <p className="text-xs text-muted-foreground">Consumers</p>
            </div>
          </div>
        </div>

        {/* Health Message */}
        {health.status !== "healthy" && (
          <div className={`p-2 rounded text-sm mb-3 ${colors.badge}`}>{health.message}</div>
        )}

        {/* Queue Details */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span>Type:</span>
            <span className="font-medium">
              {metadata?.is_job_queue ? "Job Queue" : "Result Queue"}
            </span>
          </div>
          {metadata?.dlq_name && (
            <div className="flex justify-between">
              <span>DLQ:</span>
              <span className="font-medium">{metadata.dlq_name}</span>
            </div>
          )}
          {metadata?.retention_hours && (
            <div className="flex justify-between">
              <span>Retention:</span>
              <span className="font-medium">{metadata.retention_hours}h</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          {onViewDetails && (
            <button
              onClick={onViewDetails}
              className="flex-1 px-3 py-1.5 text-xs font-medium rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              View Details
            </button>
          )}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-3 py-1.5 text-xs font-medium rounded border border-muted-foreground/30 hover:bg-muted transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3 h-3" />
              Refresh
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
