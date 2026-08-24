"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Play, Download, Trash2, CheckCircle2, CheckSquare, Square, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { useI18n } from "@/i18n";
import { VideoJob, LayoutMode } from "@/types/jobs";

interface CompletedJobCardProps {
  job: VideoJob;
  layoutMode: LayoutMode;
  isSelected: boolean;
  onToggleSelect: (jobId: string) => void;
  onPlay: (job: VideoJob) => void;
  onDelete: (projectId: string, videoId: string) => void;
  isDeleting?: boolean;
}

export const CompletedJobCard: React.FC<CompletedJobCardProps> = ({
  job,
  layoutMode,
  isSelected,
  onToggleSelect,
  onPlay,
  onDelete,
  isDeleting,
}) => {
  const router = useRouter();
  const { t } = useI18n();

  // List View Layout
  if (layoutMode === "list") {
    return (
      <Card
        variant="elevated"
        padding="sm"
        className={`hover:border-status-success/40 transition-all border ${
          isSelected ? "border-accent-primary bg-accent-primary/5" : "border-border-default"
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onToggleSelect(job.id)}
              className="text-text-muted hover:text-accent-primary transition-colors p-1"
            >
              {isSelected ? (
                <CheckSquare className="h-4 w-4 text-accent-primary" aria-hidden />
              ) : (
                <Square className="h-4 w-4" aria-hidden />
              )}
            </button>

            {/* Thumbnail */}
            <div
              onClick={() => onPlay(job)}
              className="relative w-28 aspect-video rounded-md overflow-hidden bg-surface-raised border border-border-default cursor-pointer group flex-shrink-0"
            >
              {job.thumbnail_url ? (
                <Image
                  src={job.thumbnail_url}
                  alt={job.projectName}
                  className="w-full h-full object-cover"
                  fill
                  sizes="112px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-surface-panel">
                  <Play className="h-5 w-5 text-text-muted" aria-hidden />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Play className="h-6 w-6 text-white fill-current" aria-hidden />
              </div>
            </div>
          </div>

          {/* Metadata & Title */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3
                onClick={() => onPlay(job)}
                className="text-body font-semibold text-text-primary hover:text-accent-cyan cursor-pointer truncate"
              >
                {job.projectName}
              </h3>
              <Badge variant="success" className="text-micro py-0 px-1.5 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" aria-hidden />
                {t("jobs.completedJob.ready")}
              </Badge>
            </div>
            {job.movieTitle && (
              <p className="text-caption text-text-muted truncate mb-1">{job.movieTitle}</p>
            )}

            <div className="flex flex-wrap items-center gap-3 text-caption text-text-muted">
              <span>
                {t("jobs.completedJob.voice")}:{" "}
                <strong className="text-text-secondary">
                  {job.voice_name || t("jobs.completedJob.default")}
                </strong>
              </span>
              <span>
                {t("jobs.completedJob.cost")}:{" "}
                <strong className="text-text-secondary">
                  {job.credit_cost} {t("jobs.completedJob.credit")}
                </strong>
              </span>
              <span>
                {t("jobs.completedJob.date")}: {new Date(job.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5 self-end sm:self-center">
            <Tooltip content={t("jobs.completedJob.previewVideo")} position="top">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onPlay(job)}
                aria-label={t("jobs.completedJob.previewVideo")}
              >
                <Play className="h-4 w-4" aria-hidden />
              </Button>
            </Tooltip>

            {job.video_url && (
              <Tooltip content={t("jobs.completedJob.download")} position="top">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(job.video_url!, "_blank")}
                  className="px-2"
                >
                  <Download className="h-4 w-4 text-accent-cyan" aria-hidden />
                </Button>
              </Tooltip>
            )}

            <Tooltip content={t("jobs.completedJob.viewProject")} position="top">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/project/${job.projectId}/export`)}
                className="px-2"
              >
                <Eye className="h-4 w-4" aria-hidden />
              </Button>
            </Tooltip>

            <Tooltip content={t("jobs.completedJob.delete")} position="top">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(job.projectId, job.id)}
                disabled={isDeleting}
                className="px-2 text-status-failed hover:bg-status-failed/10"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </Button>
            </Tooltip>
          </div>
        </div>
      </Card>
    );
  }

  // Grid Layout (sm / md)
  return (
    <Card
      variant="elevated"
      padding="none"
      className={`group overflow-hidden border transition-all hover:border-status-success/50 relative flex flex-col ${
        isSelected ? "border-accent-primary ring-1 ring-accent-primary" : "border-border-default"
      }`}
    >
      {/* Thumbnail area */}
      <div className="relative aspect-video w-full bg-black/60 overflow-hidden cursor-pointer">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect(job.id);
          }}
          className="absolute top-2 left-2 z-10 p-1.5 rounded-md bg-black/60 text-white hover:bg-black/80 transition-colors backdrop-blur-sm"
        >
          {isSelected ? (
            <CheckSquare className="h-4 w-4 text-accent-primary" aria-hidden />
          ) : (
            <Square className="h-4 w-4 text-white/80" aria-hidden />
          )}
        </button>

        <Badge
          variant="success"
          className="absolute top-2 right-2 z-10 text-micro py-0.5 px-1.5 shadow-md"
        >
          {t("jobs.completedJob.completed")}
        </Badge>

        {job.thumbnail_url ? (
          <Image
            src={job.thumbnail_url}
            alt={job.projectName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-panel">
            <Play className="h-8 w-8 text-text-muted" aria-hidden />
          </div>
        )}

        {/* Hover play button overlay */}
        <div
          onClick={() => onPlay(job)}
          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
        >
          <div className="h-11 w-11 rounded-full bg-accent-primary text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
            <Play className="h-5 w-5 fill-current ml-0.5" aria-hidden />
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3
            onClick={() => onPlay(job)}
            className="text-body font-bold text-text-primary hover:text-accent-cyan cursor-pointer truncate"
            title={job.projectName}
          >
            {job.projectName}
          </h3>
          {job.movieTitle && (
            <p className="text-caption text-text-muted truncate mt-0.5">{job.movieTitle}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-1 text-micro text-text-muted pt-1 border-t border-border-default">
          <div>
            {t("jobs.completedJob.voice")}:{" "}
            <span className="font-medium text-text-secondary">
              {job.voice_name || t("jobs.completedJob.na")}
            </span>
          </div>
          <div className="text-right">
            {t("jobs.completedJob.cost")}:{" "}
            <span className="font-medium text-text-secondary">
              {job.credit_cost} {t("jobs.completedJob.creditAbbr")}
            </span>
          </div>
          <div>
            {t("jobs.completedJob.date")}: {new Date(job.created_at).toLocaleDateString()}
          </div>
          <div className="text-right">
            {t("jobs.completedJob.attempt")}: #{job.generation_attempt}
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center gap-1 pt-2 border-t border-border-default">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPlay(job)}
            leftIcon={<Play className="h-3.5 w-3.5" aria-hidden />}
            className="flex-1 text-caption"
          >
            {t("jobs.completedJob.play")}
          </Button>

          {job.video_url && (
            <Tooltip content={t("jobs.completedJob.download")} position="top">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(job.video_url!, "_blank")}
                className="px-2 text-accent-cyan"
              >
                <Download className="h-3.5 w-3.5" aria-hidden />
              </Button>
            </Tooltip>
          )}

          <Tooltip content={t("jobs.completedJob.delete")} position="top">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(job.projectId, job.id)}
              disabled={isDeleting}
              className="px-2 text-status-failed hover:bg-status-failed/10"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden />
            </Button>
          </Tooltip>
        </div>
      </div>
    </Card>
  );
};
