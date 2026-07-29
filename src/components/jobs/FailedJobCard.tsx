"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, RotateCcw, Trash2, Eye, CheckSquare, Square } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
              <CheckSquare className="h-4 w-4 text-status-failed" />
            ) : (
              <Square className="h-4 w-4" />
            )}
          </button>

          <div className="flex-shrink-0 w-28 aspect-video rounded-md overflow-hidden bg-black/50 border border-status-failed/30 flex items-center justify-center">
            <AlertTriangle className="h-7 w-7 text-status-failed" />
          </div>
        </div>

        <div className="flex-1 min-w-0 w-full space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-text-primary truncate">{job.projectName}</h3>
                <Badge variant="error">Failed</Badge>
              </div>
              {job.movieTitle && <p className="text-xs text-text-muted truncate">{job.movieTitle}</p>}
            </div>

            <div className="text-xs text-text-muted text-right">
              <span>Attempt #{job.generation_attempt}</span>
            </div>
          </div>

          {/* Error Message Box */}
          <div className="p-2.5 rounded-md bg-status-failed/10 border border-status-failed/20 text-xs text-status-failed space-y-0.5">
            <p className="font-semibold flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
              Generation Failed (at {job.progress}%)
            </p>
            <p className="text-text-secondary line-clamp-2 pl-5">
              {job.error_message || "An unexpected server error occurred during video rendering."}
            </p>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted">
            <span>Voice: <strong className="text-text-secondary">{job.voice_name || "Default"}</strong></span>
            <span>Cost: <strong className="text-text-secondary">{job.credit_cost} credit</strong></span>
            <span>Failed on: {new Date(job.updated_at || job.created_at).toLocaleString()}</span>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
              onClick={() => onRetry(job.projectId, job.id)}
              disabled={isActionLoading}
            >
              Retry Generation
            </Button>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<Eye className="h-3.5 w-3.5" />}
              onClick={() => router.push(`/project/${job.projectId}/export`)}
            >
              View Project
            </Button>

            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Trash2 className="h-3.5 w-3.5" />}
              onClick={() => onDelete(job.projectId, job.id)}
              disabled={isActionLoading}
              className="text-status-failed hover:bg-status-failed/10 ml-auto"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
