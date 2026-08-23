"use client";

import { EmptyState } from "@/components/ui/EmptyState";

import { useState } from "react";
import { CheckCircle2, RotateCcw, Eye, Clock, AlertCircle } from "lucide-react";
import type { PlaygroundFailedJob } from "@/types/admin";

interface PlaygroundFailedJobsTableProps {
  failedJobs: PlaygroundFailedJob[];
  onRetry?: (jobId: number) => void;
  onViewDetails?: (job: PlaygroundFailedJob) => void;
}

export function PlaygroundFailedJobsTable({
  failedJobs,
  onRetry,
  onViewDetails,
}: PlaygroundFailedJobsTableProps) {
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

  const formatIPHash = (hash: string) => {
    return hash.substring(0, 12) + "...";
  };

  const toggleExpand = (jobId: number) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId);
  };

  if (failedJobs.length === 0) {
    return (
      <EmptyState
        size="lg"
        className="rounded-xl border border-border-default bg-surface-panel"
        icon={<CheckCircle2 aria-hidden />}
        title="No Failed Playground Jobs"
        description="All playground TTS jobs are processing successfully. Great job!"
      />
    );
  }

  return (
    <div className="space-y-2 rounded-2xl border border-border-default bg-surface-panel overflow-hidden">
      {/* Table Header */}
      <div className="hidden md:grid md:grid-cols-12 gap-4 border-b border-border-default bg-surface-raised/50 px-6 py-3 text-sm font-semibold text-text-secondary">
        <div className="col-span-2">Job ID</div>
        <div className="col-span-3">Error Message</div>
        <div className="col-span-2">Voice</div>
        <div className="col-span-2">Client IP</div>
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
              <p className="text-xs text-text-muted mt-1">Retries: {job.retry_count}</p>
              <div className="flex items-center gap-1.5 text-xs text-text-muted mt-1">
                <Clock className="h-3 w-3" />
                {formatRelativeTime(job.completed_at || job.created_at)}
              </div>
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

            {/* Voice */}
            <div className="col-span-1 md:col-span-2">
              <div className="md:hidden text-xs font-medium text-text-muted mb-1">Voice</div>
              <p className="text-sm text-text-secondary">
                {job.voice_id ? `Voice #${job.voice_id}` : `Anon #${job.anonymous_voice_id}`}
              </p>
            </div>

            {/* Client IP */}
            <div className="col-span-1 md:col-span-2">
              <div className="md:hidden text-xs font-medium text-text-muted mb-1">Client IP</div>
              <p className="text-xs font-mono text-text-secondary">
                {formatIPHash(job.client_ip_address)}
              </p>
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
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Retry</span>
                </button>
              )}
            </div>
          </div>

          {/* Expanded Text */}
          {expandedJobId === job.id && (
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
