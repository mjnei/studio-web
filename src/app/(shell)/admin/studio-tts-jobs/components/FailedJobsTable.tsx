"use client";

import { Heading } from "@/components/ui/heading";

import { useState } from "react";
import { XCircle, RefreshCw, Eye, Clock, AlertCircle } from "lucide-react";
import type { FailedJob } from "@/types/admin";

interface FailedJobsTableProps {
  failedJobs: FailedJob[];
  onRetry?: (jobId: number) => void;
  onViewDetails?: (job: FailedJob) => void;
}

export function FailedJobsTable({ failedJobs, onRetry, onViewDetails }: FailedJobsTableProps) {
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

  const toggleExpand = (jobId: number) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId);
  };

  if (failedJobs.length === 0) {
    return (
      <div className="rounded-xl border border-border-default bg-surface-panel p-8 text-center">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10">
            <XCircle className="h-8 w-8 text-green-600" />
          </div>
          <Heading variant="subsection" as="h3" className="text-text-primary">No Failed Jobs</Heading>
          <p className="text-sm text-text-secondary max-w-md">
            All TTS jobs are processing successfully. Great job!
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
        <div className="col-span-3">Error Message</div>
        <div className="col-span-2">Voice ID</div>
        <div className="col-span-2">Failed At</div>
        <div className="col-span-3">Actions</div>
      </div>

      {/* Table Rows */}
      {failedJobs.map((job) => (
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

            {/* Error Message */}
            <div className="col-span-1 md:col-span-3">
              <div className="md:hidden text-xs font-medium text-text-muted mb-1">Error</div>
              <div
                className="flex items-start gap-2 cursor-pointer"
                onClick={() => toggleExpand(job.id)}
              >
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p
                  className={`text-sm text-red-600 ${expandedJobId === job.id ? "" : "line-clamp-2"}`}
                >
                  {job.error_message || "Unknown error"}
                </p>
              </div>
            </div>

            {/* Voice ID */}
            <div className="col-span-1 md:col-span-2">
              <div className="md:hidden text-xs font-medium text-text-muted mb-1">Voice</div>
              <p className="text-sm text-text-secondary">Voice #{job.voice_id}</p>
            </div>

            {/* Failed At */}
            <div className="col-span-1 md:col-span-2">
              <div className="md:hidden text-xs font-medium text-text-muted mb-1">Failed At</div>
              <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                <Clock className="h-3.5 w-3.5" />
                {formatRelativeTime(job.completed_at || job.created_at)}
              </div>
            </div>

            {/* Actions */}
            <div className="col-span-1 md:col-span-3 flex flex-wrap items-center gap-2">
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
              {onRetry && (
                <button
                  onClick={() => onRetry(job.id)}
                  className="flex items-center gap-1.5 rounded-lg border border-green-500/50 bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-600 hover:bg-green-500/20 transition-all"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Retry</span>
                </button>
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
