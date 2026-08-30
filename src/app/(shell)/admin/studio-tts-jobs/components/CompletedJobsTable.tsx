"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { CheckCircle2, Eye, Clock, Play } from "lucide-react";
import type { CompletedJob } from "@/types/admin";
import {
  formatRelativeTime,
  formatTableDuration,
} from "@/app/(shell)/admin/tts-jobs/_shared/formatters";
import { DetailsButton } from "@/app/(shell)/admin/tts-jobs/_shared/table-actions";

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
      <div className="hidden md:grid md:grid-cols-12 gap-4 border-b border-border-default bg-surface-raised/50 px-6 py-3 text-body font-semibold text-text-secondary">
        <div className="col-span-2">Job ID</div>
        <div className="col-span-2">Voice ID</div>
        <div className="col-span-2">Audio Duration</div>
        <div className="col-span-2">Synthesis Time</div>
        <div className="col-span-2">Completed At</div>
        <div className="col-span-2">Actions</div>
      </div>

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
            <div className="col-span-1 md:col-span-2">
              <p className="text-caption font-mono font-semibold text-text-primary">
                #{job.job_id}
              </p>
              {job.project_id && (
                <p className="text-caption text-text-muted mt-1">Project: {job.project_id}</p>
              )}
            </div>

            <div className="col-span-1 md:col-span-2">
              <div className="md:hidden text-caption font-medium text-text-muted mb-1">Voice</div>
              <p className="text-body text-text-secondary">Voice #{job.voice_id}</p>
            </div>

            <div className="col-span-1 md:col-span-2">
              <div className="md:hidden text-caption font-medium text-text-muted mb-1">
                Audio Duration
              </div>
              <div className="flex items-center gap-1.5 text-body text-text-secondary">
                <Play className="h-3.5 w-3.5" />
                {formatTableDuration(job.audio_duration)}
              </div>
            </div>

            <div className="col-span-1 md:col-span-2">
              <div className="md:hidden text-caption font-medium text-text-muted mb-1">
                Synthesis Time
              </div>
              <div className="flex items-center gap-1.5 text-body text-text-secondary">
                <Clock className="h-3.5 w-3.5" />
                {formatTableDuration(job.synthesis_duration_seconds)}
              </div>
            </div>

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

            <div className="col-span-1 md:col-span-2 flex flex-wrap items-center gap-2">
              <div className="md:hidden text-caption font-medium text-text-muted mb-1 w-full">
                Actions
              </div>
              {onViewDetails && (
                <DetailsButton onClick={() => onViewDetails(job)} stopPropagation />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
