"use client";

import { EmptyState } from "@/components/ui/EmptyState";

import { CheckCircle2, Eye, Clock, Play } from "lucide-react";
import type { CompletedJob } from "@/types/admin";

interface CompletedJobsTableProps {
  completedJobs: CompletedJob[];
  onViewDetails?: (job: CompletedJob) => void;
  onPlay?: (job: CompletedJob) => void;
}

export function CompletedJobsTable({
  completedJobs,
  onViewDetails,
  onPlay,
}: CompletedJobsTableProps) {
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "N/A";
    if (seconds < 1) return `${Math.round(seconds * 1000)}ms`;
    return `${seconds.toFixed(2)}s`;
  };

  if (completedJobs.length === 0) {
    return (
      <EmptyState
        size="lg"
        className="rounded-xl border border-border-default bg-surface-panel"
        icon={<CheckCircle2 aria-hidden />}
        title="No Completed Jobs"
        description="No completed TTS jobs found in the system yet."
      />
    );
  }

  return (
    <div className="space-y-2 rounded-2xl border border-border-default bg-surface-panel overflow-hidden">
      {/* Table Header */}
      <div className="hidden md:grid md:grid-cols-12 gap-4 border-b border-border-default bg-surface-raised/50 px-6 py-3 text-body font-semibold text-text-secondary">
        <div className="col-span-2">Job ID</div>
        <div className="col-span-2">Voice ID</div>
        <div className="col-span-2">Audio Duration</div>
        <div className="col-span-2">Synthesis Time</div>
        <div className="col-span-2">Completed At</div>
        <div className="col-span-2">Actions</div>
      </div>

      {/* Table Rows */}
      {completedJobs.map((job) => (
        <div
          key={job.id}
          onClick={() => {
            if (onPlay && job.audio_path) {
              onPlay(job);
            }
          }}
          className={`border-b border-border-default last:border-0 transition-all ${
            job.audio_path && onPlay
              ? "cursor-pointer hover:bg-accent-primary/5 hover:border-l-4 hover:border-accent-primary"
              : "hover:bg-surface-raised/50"
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center">
            {/* Job ID */}
            <div className="col-span-1 md:col-span-2">
              <p className="text-caption font-mono font-semibold text-text-primary">
                #{job.job_id}
              </p>
              {job.project_id && (
                <p className="text-caption text-text-muted mt-1">Project: {job.project_id}</p>
              )}
            </div>

            {/* Voice ID */}
            <div className="col-span-1 md:col-span-2">
              <div className="md:hidden text-caption font-medium text-text-muted mb-1">Voice</div>
              <p className="text-body text-text-secondary">Voice #{job.voice_id}</p>
            </div>

            {/* Audio Duration */}
            <div className="col-span-1 md:col-span-2">
              <div className="md:hidden text-caption font-medium text-text-muted mb-1">
                Audio Duration
              </div>
              <div className="flex items-center gap-1.5 text-body text-text-secondary">
                <Play className="h-3.5 w-3.5" />
                {formatDuration(job.audio_duration)}
              </div>
            </div>

            {/* Synthesis Time */}
            <div className="col-span-1 md:col-span-2">
              <div className="md:hidden text-caption font-medium text-text-muted mb-1">
                Synthesis Time
              </div>
              <div className="flex items-center gap-1.5 text-body text-text-secondary">
                <Clock className="h-3.5 w-3.5" />
                {formatDuration(job.synthesis_duration_seconds)}
              </div>
            </div>

            {/* Completed At */}
            <div className="col-span-1 md:col-span-2">
              <div className="md:hidden text-caption font-medium text-text-muted mb-1">
                Completed
              </div>
              <div className="flex items-center gap-1.5 text-body text-green-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {formatRelativeTime(job.completed_at || job.created_at)}
                {job.audio_path && onPlay && (
                  <span className="text-caption text-accent-primary font-medium ml-2">
                    • Click to play
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="col-span-1 md:col-span-2 flex flex-wrap items-center gap-2">
              <div className="md:hidden text-caption font-medium text-text-muted mb-1 w-full">
                Actions
              </div>
              {onViewDetails && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails(job);
                  }}
                  className="flex items-center gap-1.5 rounded-lg border-2 border-border-default bg-surface-base px-3 py-1.5 text-caption font-medium text-text-secondary hover:border-accent-primary hover:text-accent-primary hover:bg-accent-primary/5 transition-all"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Details</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
