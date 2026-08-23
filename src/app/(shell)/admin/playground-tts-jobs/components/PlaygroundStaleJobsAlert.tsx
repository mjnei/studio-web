"use client";

import { Heading } from "@/components/ui/heading";

import { AlertTriangle, Clock, Ban } from "lucide-react";
import type { PlaygroundStaleJob } from "@/types/admin";

interface PlaygroundStaleJobsAlertProps {
  staleJobs: PlaygroundStaleJob[];
  onCancel?: (jobId: string) => void;
}

export function PlaygroundStaleJobsAlert({ staleJobs, onCancel }: PlaygroundStaleJobsAlertProps) {
  if (staleJobs.length === 0) return null;

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    return `${hours}h ${remainingMins}m`;
  };

  const formatIPHash = (hash: string) => {
    return hash.substring(0, 12) + "...";
  };

  return (
    <div className="rounded-xl border-2 border-red-500/50 bg-gradient-to-br from-red-500/10 to-orange-500/5 p-5 shadow-lg">
      <div className="flex items-start gap-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-red-500/20 flex-shrink-0">
          <AlertTriangle className="h-6 w-6 text-red-600 animate-pulse" />
        </div>
        <div className="flex-1">
          <Heading variant="subsection" as="h3" className="text-red-600 mb-2">
            ⚠️ {staleJobs.length} Stale Playground Job{staleJobs.length !== 1 ? "s" : ""} Detected
          </Heading>
          <p className="text-body text-text-secondary mb-4">
            These playground jobs have been queued or processing for too long. They may require
            manual intervention.
          </p>

          {/* Stale Jobs List */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {staleJobs.map((job) => (
              <div
                key={job.id}
                className="rounded-lg border border-red-500/30 bg-surface-base p-3 flex items-center justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-caption font-mono text-text-muted">#{job.job_id}</span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-caption font-bold ${
                        job.status === "queued"
                          ? "bg-yellow-500/10 text-yellow-600"
                          : "bg-blue-500/10 text-blue-600"
                      }`}
                    >
                      <Clock className="h-3 w-3" />
                      {job.status}
                    </span>
                  </div>
                  <p className="text-caption text-text-secondary">
                    Duration: {formatDuration(job.duration_seconds)} |{" "}
                    {job.voice_id
                      ? `Voice ID: ${job.voice_id}`
                      : `Anonymous Voice ID: ${job.anonymous_voice_id}`}{" "}
                    | IP: {formatIPHash(job.client_ip_address)}
                  </p>
                  {job.text && (
                    <p className="text-caption text-text-muted mt-1 truncate">{job.text}</p>
                  )}
                </div>
                {onCancel && (
                  <button
                    onClick={() => onCancel(job.job_id)}
                    className="flex items-center gap-1.5 rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-1.5 text-caption font-medium text-red-600 hover:bg-red-500/20 transition-all flex-shrink-0"
                  >
                    <Ban className="h-3.5 w-3.5" />
                    Cancel
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
