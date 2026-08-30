"use client";

import { EmptyState } from "@/components/ui/EmptyState";
import { useState } from "react";
import { CheckCircle2, Clock } from "lucide-react";
import type { PlaygroundRateLimitedJob } from "@/types/admin";
import { formatIPHash, formatRelativeTime } from "@/app/(shell)/admin/tts-jobs/_shared/formatters";
import { DetailsButton, RetryButton } from "@/app/(shell)/admin/tts-jobs/_shared/table-actions";

interface PlaygroundRateLimitedJobsTableProps {
  rateLimitedJobs: PlaygroundRateLimitedJob[];
  onRetry?: (jobId: number) => void;
  onViewDetails?: (job: PlaygroundRateLimitedJob) => void;
}

export function PlaygroundRateLimitedJobsTable({
  rateLimitedJobs,
  onRetry,
  onViewDetails,
}: PlaygroundRateLimitedJobsTableProps) {
  const [expandedJobId, setExpandedJobId] = useState<number | null>(null);

  const toggleExpand = (jobId: number) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId);
  };

  if (rateLimitedJobs.length === 0) {
    return (
      <EmptyState
        size="lg"
        className="rounded-xl border border-border-default bg-surface-panel"
        icon={<CheckCircle2 aria-hidden />}
        title="No Rate-Limited Jobs"
        description="No abuse patterns detected. All requests within rate limits."
      />
    );
  }

  return (
    <div className="space-y-2 rounded-2xl border border-border-default bg-surface-panel overflow-hidden">
      <div className="hidden md:grid md:grid-cols-12 gap-4 border-b border-border-default bg-surface-raised/50 px-6 py-3 text-body font-semibold text-text-secondary">
        <div className="col-span-2">Job ID</div>
        <div className="col-span-3">Error Message</div>
        <div className="col-span-2">Voice</div>
        <div className="col-span-2">Rate Limited At</div>
        <div className="col-span-3">Actions</div>
      </div>

      {rateLimitedJobs.map((job) => (
        <div
          key={job.id}
          className="border-b border-border-default last:border-0 hover:bg-surface-raised/50 transition-colors"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center">
            <div className="col-span-1 md:col-span-2">
              <p className="text-caption font-mono font-semibold text-text-primary">
                #{job.job_id}
              </p>
            </div>

            <div className="col-span-1 md:col-span-3">
              <div className="md:hidden text-caption font-medium text-text-muted mb-1">Text</div>
              <div
                className="flex items-start gap-2 cursor-pointer"
                onClick={() => toggleExpand(job.id)}
              >
                <p
                  className={`text-body text-text-secondary ${expandedJobId === job.id ? "" : "line-clamp-2"}`}
                >
                  {job.text}
                </p>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2">
              <div className="md:hidden text-caption font-medium text-text-muted mb-1">Voice</div>
              <p className="text-body text-text-secondary">
                {job.voice_id ? `Voice #${job.voice_id}` : `Anon #${job.anonymous_voice_id}`}
              </p>
            </div>

            <div className="col-span-1 md:col-span-2">
              <div className="md:hidden text-caption font-medium text-text-muted mb-1">
                Rate Limited At
              </div>
              <div className="flex items-center gap-1.5 text-body text-text-secondary">
                <Clock className="h-3.5 w-3.5" />
                {formatRelativeTime(job.created_at)}
              </div>
              <p className="text-caption font-mono text-text-muted mt-1 md:hidden">
                IP: {formatIPHash(job.client_ip_address)}
              </p>
            </div>

            <div className="col-span-1 md:col-span-3 flex flex-wrap items-center gap-2">
              <div className="md:hidden text-caption font-medium text-text-muted mb-1 w-full">
                Actions
              </div>
              {onViewDetails && <DetailsButton onClick={() => onViewDetails(job)} />}
              {onRetry && <RetryButton onClick={() => onRetry(job.id)} />}
            </div>
          </div>

          {expandedJobId === job.id && (
            <div className="px-6 pb-4">
              <div className="rounded-lg border border-border-default bg-surface-base p-3">
                <p className="text-caption font-medium text-text-muted mb-2">Full Text:</p>
                <p className="text-body text-text-secondary">{job.text}</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
