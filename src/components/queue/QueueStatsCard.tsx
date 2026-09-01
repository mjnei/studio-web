"use client";

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Inbox,
  Users,
  ShieldAlert,
  Info,
} from "lucide-react";
import type { QueueStats } from "@/lib/types/queue";
import { getQueueHealth } from "@/lib/types/queue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";

interface QueueStatsCardProps {
  stats: QueueStats;
  onViewDetails?: () => void;
}

export function getQueueDisplayCategory(
  queueName: string,
  category?: string
): {
  label: "TTS" | "Video" | "Background";
  badgeClass: string;
} {
  const name = queueName.toLowerCase();
  if (
    name.includes("_result") ||
    name === "agnes_jobs" ||
    name === "credit_warnings" ||
    name === "thumbnail_jobs" ||
    category === "system" ||
    category === "agnes" ||
    category === "background"
  ) {
    return {
      label: "Background",
      badgeClass: "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400",
    };
  }
  if (category === "tts" || name.startsWith("tts_")) {
    return {
      label: "TTS",
      badgeClass: "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
    };
  }
  if (category === "video" || name.startsWith("video_")) {
    return {
      label: "Video",
      badgeClass: "border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    };
  }
  return {
    label: "Background",
    badgeClass: "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400",
  };
}

export function QueueStatsCard({ stats, onViewDetails }: QueueStatsCardProps) {
  const health = getQueueHealth(stats);
  const { metadata, message_count, consumer_count, queue_name } = stats;
  const categoryInfo = getQueueDisplayCategory(queue_name, metadata?.category);

  const getHealthBadge = () => {
    switch (health.status) {
      case "critical":
        return (
          <Badge variant="destructive" className="gap-1 px-2 py-0.5 font-medium">
            <AlertCircle className="h-3 w-3" />
            Critical
          </Badge>
        );
      case "warning":
        return (
          <Badge
            variant="outline"
            className="gap-1 border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 font-medium"
          >
            <AlertTriangle className="h-3 w-3" />
            Warning
          </Badge>
        );
      case "healthy":
      default:
        return (
          <Badge
            variant="outline"
            className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 font-medium"
          >
            <CheckCircle2 className="h-3 w-3" />
            Healthy
          </Badge>
        );
    }
  };

  return (
    <Card
      variant="glass"
      role="button"
      tabIndex={0}
      onClick={onViewDetails}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onViewDetails?.();
        }
      }}
      className="group relative flex flex-col justify-between overflow-hidden border-border-default hover:border-accent-primary/60 hover:shadow-md hover:scale-[1.01] transition-all duration-200 cursor-pointer select-none"
    >
      <div>
        <CardHeader className="pb-3 pt-4 px-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <CardTitle className="font-mono text-section truncate text-text-primary group-hover:text-accent-primary transition-colors">
                {metadata?.display_name || queue_name}
              </CardTitle>
              {metadata?.description && (
                <Tooltip content={metadata.description} position="top">
                  <div
                    className="text-text-muted hover:text-text-primary transition-colors cursor-help shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Info className="h-3.5 w-3.5" />
                  </div>
                </Tooltip>
              )}
            </div>
            {getHealthBadge()}
          </div>
          {metadata?.display_name && metadata.display_name !== queue_name && (
            <p className="font-mono text-micro text-text-muted truncate mt-0.5">{queue_name}</p>
          )}
        </CardHeader>

        <CardContent className="px-4 pb-4 pt-0 space-y-3">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Messages / Backlog */}
            <div className="flex items-center gap-2.5 rounded-lg border border-border-default bg-surface-raised/60 p-2.5">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
                  message_count > 0
                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    : "bg-accent-muted text-accent-primary"
                }`}
              >
                <Inbox className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <Heading variant="metric" className="text-text-primary text-section">
                  {message_count.toLocaleString()}
                </Heading>
                <Text variant="caption" className="text-text-muted text-micro truncate">
                  Messages
                </Text>
              </div>
            </div>

            {/* Consumers / Workers */}
            <div className="flex items-center gap-2.5 rounded-lg border border-border-default bg-surface-raised/60 p-2.5">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
                  consumer_count > 0
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : "bg-surface-panel text-text-muted"
                }`}
              >
                <Users className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <Heading variant="metric" className="text-text-primary text-section">
                  {consumer_count}
                </Heading>
                <Text variant="caption" className="text-text-muted text-micro truncate">
                  Consumers
                </Text>
              </div>
            </div>
          </div>

          {/* Health Alert message if non-healthy */}
          {health.status !== "healthy" && (
            <div className="flex items-center gap-1.5 rounded-md bg-destructive/10 px-2.5 py-1.5 text-caption text-destructive">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{health.message}</span>
            </div>
          )}

          {/* Metadata tags */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <Badge
              variant="outline"
              className={`text-micro font-medium uppercase tracking-wider ${categoryInfo.badgeClass}`}
            >
              {categoryInfo.label}
            </Badge>

            {metadata?.is_job_queue ? (
              <Badge variant="outline" className="text-micro text-text-secondary">
                Job Queue
              </Badge>
            ) : (
              <Badge variant="outline" className="text-micro text-text-muted">
                Result Queue
              </Badge>
            )}

            {metadata?.dlq_name && (
              <Tooltip content={`Dead-letter queue: ${metadata.dlq_name}`} position="top">
                <Badge
                  variant="outline"
                  className="gap-1 text-micro border-border-default text-text-muted cursor-help"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ShieldAlert className="h-3 w-3" />
                  DLQ
                </Badge>
              </Tooltip>
            )}

            {metadata?.retention_hours && (
              <span className="text-micro text-text-muted ml-auto">
                {metadata.retention_hours}h ttl
              </span>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
