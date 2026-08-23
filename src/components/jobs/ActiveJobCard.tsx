"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Video, Eye, Bell, BellOff, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { useI18n } from "@/i18n";
import { VideoJob } from "@/types/jobs";

interface ActiveJobCardProps {
  job: VideoJob;
  onDelete: (projectId: string, videoId: string) => void;
  isDeleting?: boolean;
}

export const ActiveJobCard: React.FC<ActiveJobCardProps> = ({ job, onDelete, isDeleting }) => {
  const router = useRouter();
  const { t } = useI18n();
  const [notifyMe, setNotifyMe] = useState(true);

  // Contextual stage message calculation
  const getContextMessage = (progress: number) => {
    if (progress <= 20) return t("jobs.activeJob.initializing");
    if (progress <= 40) return t("jobs.activeJob.processingAudio");
    if (progress <= 60) return t("jobs.activeJob.renderingFrames");
    if (progress <= 80) return t("jobs.activeJob.applyingEffects");
    if (progress < 100) return t("jobs.activeJob.finalizing");
    return t("jobs.activeJob.complete");
  };

  // Time remaining estimate calculation (~10 min baseline total duration)
  const getEstimatedMinutesLeft = (progress: number) => {
    const totalEstMinutes = 10;
    const remainingFraction = Math.max(0, (100 - progress) / 100);
    const est = Math.ceil(totalEstMinutes * remainingFraction);
    return est <= 1 ? "1 min" : `${est} ${t("jobs.activeJob.mins")}`;
  };

  return (
    <Card
      variant="elevated"
      padding="md"
      className="border-blue-500/30 bg-gradient-to-br from-surface-raised to-blue-950/20 shadow-glow relative overflow-hidden transition-all"
    >
      <div className="flex flex-col md:flex-row gap-4 items-start">
        {/* Thumbnail preview */}
        <div className="flex-shrink-0 w-full md:w-44 aspect-video rounded-lg overflow-hidden bg-black/40 border border-blue-500/20 relative group">
          {job.thumbnail_url ? (
            <Image
              src={job.thumbnail_url}
              alt={job.projectName}
              className="w-full h-full object-cover"
              fill
              sizes="(max-width: 768px) 100vw, 176px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-surface-panel">
              <Video className="h-8 w-8 text-blue-400/60" aria-hidden />
            </div>
          )}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
            <Spinner className="h-7 w-7 text-blue-400" />
          </div>
        </div>

        {/* Info & Progress */}
        <div className="flex-1 min-w-0 w-full space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Heading variant="subsection" as="h3" className="text-text-primary truncate">
                  {job.projectName}
                </Heading>
                <Badge variant="info" className="animate-pulse flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-ping" />
                  {job.status === "queued"
                    ? t("jobs.activeJob.queued")
                    : t("jobs.activeJob.processing")}
                </Badge>
              </div>
              {job.movieTitle && (
                <Text variant="caption" className="text-text-muted truncate">
                  {job.movieTitle}
                </Text>
              )}
            </div>

            <div className="text-right text-caption">
              <span className="font-semibold text-blue-400">
                ~{getEstimatedMinutesLeft(job.progress)}
              </span>
              <span className="text-text-muted"> {t("jobs.activeJob.remaining")}</span>
            </div>
          </div>

          {/* Progress Bar & Stage Context */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-caption">
              <span className="text-text-secondary font-medium">
                {getContextMessage(job.progress)}
              </span>
              <span className="text-blue-400 font-bold">{job.progress}%</span>
            </div>
            <div className="h-2 bg-surface-panel rounded-full overflow-hidden border border-border-default">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500 rounded-full"
                style={{ width: `${Math.max(5, job.progress)}%` }}
              />
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-caption text-text-muted pt-1">
            <div>
              <span className="font-medium text-text-secondary">{t("jobs.activeJob.voice")}:</span>{" "}
              {job.voice_name || "N/A"}
            </div>
            <div>
              <span className="font-medium text-text-secondary">{t("jobs.activeJob.cost")}:</span>{" "}
              {job.credit_cost} {job.credit_cost !== 1 ? t("jobs.credits") : t("jobs.credit")}
            </div>
            <div>
              <span className="font-medium text-text-secondary">
                {t("jobs.activeJob.attempt")}:
              </span>{" "}
              #{job.generation_attempt}
            </div>
            <div>
              <span className="font-medium text-text-secondary">
                {t("jobs.activeJob.started")}:
              </span>{" "}
              {new Date(job.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Eye className="h-3.5 w-3.5" aria-hidden />}
              onClick={() => router.push(`/project/${job.projectId}/export`)}
            >
              {t("jobs.activeJob.viewProject")}
            </Button>

            <Tooltip
              content={
                notifyMe
                  ? t("jobs.activeJob.notificationEnabled")
                  : t("jobs.activeJob.notifyWhenComplete")
              }
              position="top"
            >
              <Button
                variant={notifyMe ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setNotifyMe(!notifyMe)}
                aria-label={
                  notifyMe
                    ? t("jobs.activeJob.notificationEnabled")
                    : t("jobs.activeJob.notifyWhenComplete")
                }
                className="px-2.5"
              >
                {notifyMe ? (
                  <Bell className="h-3.5 w-3.5 text-accent-cyan" aria-hidden />
                ) : (
                  <BellOff className="h-3.5 w-3.5 text-text-muted" aria-hidden />
                )}
              </Button>
            </Tooltip>

            <Button
              variant="ghost"
              size="sm"
              leftIcon={<XCircle className="h-3.5 w-3.5" aria-hidden />}
              onClick={() => onDelete(job.projectId, job.id)}
              disabled={isDeleting}
              className="text-text-muted hover:text-status-failed ml-auto"
            >
              {t("jobs.activeJob.cancelJob")}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
