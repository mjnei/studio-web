"use client";

import React from "react";
import { Clock, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n";
import { formatWaitTime } from "@/lib/utils/time-format";
import type { TTSJobResponse } from "@/lib/types/api";

interface TTSQueueStatusProps {
  job: TTSJobResponse;
}

/**
 * Display TTS job queue position and estimated wait time
 * Only shown when job status is "queued" and queue metrics are available
 */
export function TTSQueueStatus({ job }: TTSQueueStatusProps) {
  const { t } = useI18n();

  // Only show for queued jobs with metrics
  if (job.status !== "queued" || !job.queue_position) {
    return null;
  }

  const isNextInLine = job.queue_position === 1;
  const hasWaitTime = job.estimated_wait_seconds !== null && job.estimated_wait_seconds !== undefined;

  return (
    <Card
      variant="default"
      padding="md"
      className="bg-blue-500/5 border-blue-500/20 backdrop-blur-sm"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
            <Clock className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              {t("tts.queue.title")}
            </h3>
            <p className="text-sm text-text-muted">
              {isNextInLine ? t("tts.queue.nextInLine") : t("tts.queue.inProgress")}
            </p>
          </div>
        </div>

        {/* Queue Metrics */}
        <div className="grid grid-cols-2 gap-4">
          {/* Position */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-text-muted">
              <Users className="h-3.5 w-3.5" />
              <span>{t("tts.queue.position")}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-blue-500">
                {job.queue_position}
              </span>
              {job.queue_depth && (
                <span className="text-sm text-text-muted">
                  / {job.queue_depth}
                </span>
              )}
            </div>
          </div>

          {/* Jobs Ahead */}
          {job.jobs_ahead !== null && job.jobs_ahead !== undefined && (
            <div className="space-y-1">
              <div className="text-xs text-text-muted">
                {t("tts.queue.jobsAhead")}
              </div>
              <div className="text-2xl font-bold text-text-primary">
                {job.jobs_ahead}
              </div>
            </div>
          )}
        </div>

        {/* Estimated Wait Time */}
        {hasWaitTime && (
          <div className="pt-3 border-t border-blue-500/10">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">
                {t("tts.queue.estimatedWait")}
              </span>
              <Badge
                variant="outline"
                className="text-sm font-semibold bg-blue-500/5 border-blue-500/20 text-blue-600"
              >
                {formatWaitTime(job.estimated_wait_seconds!)}
              </Badge>
            </div>
          </div>
        )}

        {/* Live Update Indicator */}
        <div className="flex items-center gap-2 pt-2">
          <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          <span className="text-xs text-text-muted">
            {t("tts.queue.updatesAutomatically")}
          </span>
        </div>
      </div>
    </Card>
  );
}
