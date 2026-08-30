"use client";

import type { PlaygroundStaleJob } from "@/types/admin";
import { StaleJobsAlert } from "@/app/(shell)/admin/tts-jobs/_shared/StaleJobsAlert";
import { formatIPHash, formatStaleDuration } from "@/app/(shell)/admin/tts-jobs/_shared/formatters";

interface PlaygroundStaleJobsAlertProps {
  staleJobs: PlaygroundStaleJob[];
  onCancel?: (jobId: string) => void;
}

export function PlaygroundStaleJobsAlert({ staleJobs, onCancel }: PlaygroundStaleJobsAlertProps) {
  const count = staleJobs.length;

  return (
    <StaleJobsAlert
      staleJobs={staleJobs}
      title={`${count} Stale Playground Job${count !== 1 ? "s" : ""} Detected`}
      description="These playground jobs have been queued or processing for too long. They may require manual intervention."
      onCancel={onCancel}
      renderMetadata={(job) =>
        `Duration: ${formatStaleDuration(job.duration_seconds)} | ${
          job.voice_id
            ? `Voice ID: ${job.voice_id}`
            : `Anonymous Voice ID: ${job.anonymous_voice_id}`
        } | IP: ${formatIPHash(job.client_ip_address)}`
      }
      renderPreview={(job) =>
        job.text ? (
          <p className="text-caption text-text-muted mt-1 truncate">{job.text}</p>
        ) : null
      }
    />
  );
}
