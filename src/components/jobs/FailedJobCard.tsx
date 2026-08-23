"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, RotateCcw, Trash2, Eye, CheckSquare, Square } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { useI18n } from "@/i18n";
import { VideoJob } from "@/types/jobs";

interface FailedJobCardProps {
  job: VideoJob;
  isSelected: boolean;
  onToggleSelect: (jobId: string) => void;
  onRetry: (projectId: string, videoId: string) => void;
  onDelete: (projectId: string, videoId: string) => void;
  isActionLoading?: boolean;
}

export const FailedJobCard: React.FC<FailedJobCardProps> = ({
  job,
  isSelected,
  onToggleSelect,
  onRetry,
  onDelete,
  isActionLoading,
}) => {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <Card
      variant="elevated"
      padding="md"
      className={`border-status-failed/40 bg-status-failed/5 transition-all ${
        isSelected ? "ring-1 ring-status-failed" : ""
      }`}
    >
      <div className="flex flex-col md:flex-row gap-4 items-start">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onToggleSelect(job.id)}
            className="text-text-muted hover:text-status-failed transition-colors p-1"
          >
            {isSelected ? (
              <CheckSquare className="h-4 w-4 text-status-failed" aria-hidden />
            ) : (
              <Square className="h-4 w-4" aria-hidden />
            )}
          </button>

          <div className="flex-shrink-0 w-28 aspect-video rounded-md overflow-hidden bg-black/50 border border-status-failed/30 flex items-center justify-center">
            <AlertTriangle className="h-7 w-7 text-status-failed" aria-hidden />
          </div>
        </div>

        <div className="flex-1 min-w-0 w-full space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Heading variant="subsection" as="h3" className="text-text-primary truncate">
                  {job.projectName}
                </Heading>
                <Badge variant="error">{t("jobs.failedJob.failed")}</Badge>
              </div>
              {job.movieTitle && (
                <Text variant="caption" className="text-text-muted truncate">
                  {job.movieTitle}
                </Text>
              )}
            </div>

            <div className="text-xs text-text-muted text-right">
              <span>
                {t("jobs.failedJob.attempt")} #{job.generation_attempt}
              </span>
            </div>
          </div>

          {/* Error Message Box */}
          <div className="p-2.5 rounded-md bg-status-failed/10 border border-status-failed/20 text-xs text-status-failed space-y-0.5">
            <p className="font-semibold flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" aria-hidden />
              {t("jobs.failedJob.generationFailed", { progress: job.progress })}
            </p>
            <p className="text-text-secondary line-clamp-2 pl-5">
              {job.error_message || t("jobs.failedJob.unexpectedError")}
            </p>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted">
            <span>
              {t("jobs.failedJob.voice")}:{" "}
              <strong className="text-text-secondary">
                {job.voice_name || t("jobs.failedJob.default")}
              </strong>
            </span>
            <span>
              {t("jobs.failedJob.cost")}:{" "}
              <strong className="text-text-secondary">
                {job.credit_cost} {t("jobs.failedJob.credit")}
              </strong>
            </span>
            <span>
              {t("jobs.failedJob.failedOn")}:{" "}
              {new Date(job.updated_at || job.created_at).toLocaleString()}
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<RotateCcw className="h-3.5 w-3.5" aria-hidden />}
              onClick={() => onRetry(job.projectId, job.id)}
              disabled={isActionLoading}
            >
              {t("jobs.failedJob.retryGeneration")}
            </Button>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<Eye className="h-3.5 w-3.5" aria-hidden />}
              onClick={() => router.push(`/project/${job.projectId}/export`)}
            >
              {t("jobs.failedJob.viewProject")}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Trash2 className="h-3.5 w-3.5" aria-hidden />}
              onClick={() => onDelete(job.projectId, job.id)}
              disabled={isActionLoading}
              className="text-status-failed hover:bg-status-failed/10 ml-auto"
            >
              {t("jobs.failedJob.delete")}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
