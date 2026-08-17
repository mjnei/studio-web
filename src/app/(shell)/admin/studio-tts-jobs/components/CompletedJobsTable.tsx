"use client";

import { useState } from "react";
import { CheckCircle2, Eye, Clock, Play } from "lucide-react";
import type { CompletedJob } from "@/types/admin";

interface CompletedJobsTableProps {
  completedJobs: CompletedJob[];
  onViewDetails?: (job: CompletedJob) => void;
}

export function CompletedJobsTable({ completedJobs, onViewDetails }: CompletedJobsTableProps) {
  const [expandedJobId, setExpandedJobId] = useState<number | null>(null);

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

  const toggleExpand = (jobId: number) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId);
  };

  if (completedJobs.length === 0) {
    return (
      <div className="rounded-xl border border-border-default bg-surface-panel p-8 text-center">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-500/10">
            <CheckCircle2 className="h-8 w-8 text-gray-600" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary">No Completed Jobs</h3>
          <p className="text-sm text-text-secondary max-w-md">
            No completed TTS jobs found in the system yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-2xl border border-border-default bg-surface-panel overflow-hidden">
      {/* Table Header */}
      <div className="hidden md:grid md:grid-cols-12 gap-4 border-b border-border-default bg-surface-raised/50 px-6 py-3 text-sm font-semibold text-text-secondary">
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
          className="border-b border-border-default last:border-0 hover:bg-surface-raised/50 transition-colors"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center">
            {/* Job ID */}
            <div className="col-span-1 md:col-span-2">
              <p className="text-xs font-mono font-semibold text-text-primary">#{job.job_id}</p>
              {job.project_id && (
                <p className="text-xs text-text-muted mt-1">Project: {job.project_id}</p>
              )}
            </div>

            {/* Voice ID */}
            <div className="col-span-1 md:col-span-2">
              <div className="md:hidden text-xs font-medium text-text-muted mb-1">Voice</div>
              <p className="text-sm text-text-secondary">Voice #{job.voice_id}</p>
            </div>

            {/* Audio Duration */}
            <div className="col-span-1 md:col-span-2">
              <div className="md:hidden text-xs font-medium text-text-muted mb-1">
                Audio Duration
              </div>
              <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                <Play className="h-3.5 w-3.5" />
                {formatDuration(job.audio_duration)}
              </div>
            </div>

            {/* Synthesis Time */}
            <div className="col-span-1 md:col-span-2">
              <div className="md:hidden text-xs font-medium text-text-muted mb-1">
                Synthesis Time
              </div>
              <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                <Clock className="h-3.5 w-3.5" />
                {formatDuration(job.synthesis_duration_seconds)}
              </div>
            </div>

            {/* Completed At */}
            <div className="col-span-1 md:col-span-2">
              <div className="md:hidden text-xs font-medium text-text-muted mb-1">Completed</div>
              <div className="flex items-center gap-1.5 text-sm text-green-600">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {formatRelativeTime(job.completed_at || job.created_at)}
              </div>
            </div>

            {/* Actions */}
            <div className="col-span-1 md:col-span-2 flex flex-wrap items-center gap-2">
              <div className="md:hidden text-xs font-medium text-text-muted mb-1 w-full">
                Actions
              </div>
              {onViewDetails && (
                <button
                  onClick={() => onViewDetails(job)}
                  className="flex items-center gap-1.5 rounded-lg border-2 border-border-default bg-surface-base px-3 py-1.5 text-xs font-medium text-text-secondary hover:border-accent-primary hover:text-accent-primary hover:bg-accent-primary/5 transition-all"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Details</span>
                </button>
              )}
              {job.audio_path && (
                <a
                  href={job.audio_path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg border border-green-500/50 bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-600 hover:bg-green-500/20 transition-all"
                >
                  <Play className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Play</span>
                </a>
              )}
            </div>
          </div>

          {/* Expanded Text (if job has text) */}
          {expandedJobId === job.id && job.text && (
            <div className="px-6 pb-4">
              <div className="rounded-lg border border-border-default bg-surface-base p-3">
                <p className="text-xs font-medium text-text-muted mb-2">Input Text:</p>
                <p className="text-sm text-text-secondary">{job.text}</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
