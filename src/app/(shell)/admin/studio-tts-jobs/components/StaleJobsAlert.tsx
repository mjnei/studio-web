"use client";

import type { StaleJob } from "@/types/admin";
import { StaleJobsAlert as StaleJobsAlertBase } from "@/app/(shell)/admin/tts-jobs/_shared/StaleJobsAlert";
import { formatStaleDuration } from "@/app/(shell)/admin/tts-jobs/_shared/formatters";

interface StaleJobsAlertProps {
  staleJobs: StaleJob[];
  onCancel?: (jobId: string) => void;
}

export function StaleJobsAlert({ staleJobs, onCancel }: StaleJobsAlertProps) {
  const count = staleJobs.length;

  return (
    <StaleJobsAlertBase
      staleJobs={staleJobs}
      title={`${count} Stale Job${count !== 1 ? "s" : ""} Detected`}
      description="These jobs have been queued or processing for over 5 minutes. They may require manual intervention."
      onCancel={onCancel}
      renderMetadata={(job) =>
        `Duration: ${formatStaleDuration(job.duration_seconds)} | Voice ID: ${job.voice_id}`
      }
      renderPreview={(job) =>
        job.text ? <p className="text-caption text-text-muted mt-1 truncate">{job.text}</p> : null
      }
    />
  );
}
