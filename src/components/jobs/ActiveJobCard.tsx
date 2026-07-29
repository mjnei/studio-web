"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Video, Eye, Bell, BellOff, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { VideoJob } from "@/types/jobs";

interface ActiveJobCardProps {
  job: VideoJob;
  onDelete: (projectId: string, videoId: string) => void;
  isDeleting?: boolean;
}

export const ActiveJobCard: React.FC<ActiveJobCardProps> = ({ job, onDelete, isDeleting }) => {
  const router = useRouter();
  const [notifyMe, setNotifyMe] = useState(true);

  // Contextual stage message calculation
  const getContextMessage = (progress: number) => {
    if (progress <= 20) return "Initializing video generation...";
    if (progress <= 40) return "Processing audio and syncing...";
    if (progress <= 60) return "Rendering video frames...";
    if (progress <= 80) return "Applying effects and transitions...";
    if (progress < 100) return "Finalizing and encoding...";
    return "Complete! Video ready.";
  };

  // Time remaining estimate calculation (~10 min baseline total duration)
  const getEstimatedMinutesLeft = (progress: number) => {
    const totalEstMinutes = 10;
    const remainingFraction = Math.max(0, (100 - progress) / 100);
    const est = Math.ceil(totalEstMinutes * remainingFraction);
    return est <= 1 ? "1 min" : `${est} mins`;
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
            <img src={job.thumbnail_url} alt={job.projectName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-surface-panel">
              <Video className="h-8 w-8 text-blue-400/60" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
            <Loader2 className="h-7 w-7 text-blue-400 animate-spin" />
          </div>
        </div>

        {/* Info & Progress */}
        <div className="flex-1 min-w-0 w-full space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-text-primary truncate">{job.projectName}</h3>
                <Badge variant="info" className="animate-pulse flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-ping" />
                  {job.status === "queued" ? "Queued" : "Processing"}
                </Badge>
              </div>
              {job.movieTitle && <p className="text-xs text-text-muted truncate">{job.movieTitle}</p>}
            </div>

            <div className="text-right text-xs">
              <span className="font-semibold text-blue-400">~{getEstimatedMinutesLeft(job.progress)}</span>
              <span className="text-text-muted"> remaining</span>
            </div>
          </div>

          {/* Progress Bar & Stage Context */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-secondary font-medium">{getContextMessage(job.progress)}</span>
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-text-muted pt-1">
            <div>
              <span className="font-medium text-text-secondary">Voice:</span> {job.voice_name || "N/A"}
            </div>
            <div>
              <span className="font-medium text-text-secondary">Cost:</span> {job.credit_cost} credit
              {job.credit_cost !== 1 ? "s" : ""}
            </div>
            <div>
              <span className="font-medium text-text-secondary">Attempt:</span> #{job.generation_attempt}
            </div>
            <div>
              <span className="font-medium text-text-secondary">Started:</span>{" "}
              {new Date(job.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Eye className="h-3.5 w-3.5" />}
              onClick={() => router.push(`/project/${job.projectId}/export`)}
            >
              View Project
            </Button>

            <Tooltip content={notifyMe ? "Notification enabled" : "Notify when complete"} position="top">
              <Button
                variant={notifyMe ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setNotifyMe(!notifyMe)}
                className="px-2.5"
              >
                {notifyMe ? (
                  <Bell className="h-3.5 w-3.5 text-accent-cyan" />
                ) : (
                  <BellOff className="h-3.5 w-3.5 text-text-muted" />
                )}
              </Button>
            </Tooltip>

            <Button
              variant="ghost"
              size="sm"
              leftIcon={<XCircle className="h-3.5 w-3.5" />}
              onClick={() => onDelete(job.projectId, job.id)}
              disabled={isDeleting}
              className="text-text-muted hover:text-status-failed ml-auto"
            >
              Cancel Job
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
