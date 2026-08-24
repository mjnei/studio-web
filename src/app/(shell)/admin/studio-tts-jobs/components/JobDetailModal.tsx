"use client";

import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { X, Clock, CheckCircle2, XCircle, Zap, FileText, Mic } from "lucide-react";
import type { TTSJob } from "@/types/admin";

interface JobDetailModalProps {
  job: TTSJob | null;
  open: boolean;
  onClose: () => void;
}

export function JobDetailModal({ job, open, onClose }: JobDetailModalProps) {
  if (!open || !job) return null;

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "N/A";
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}m ${secs}s`;
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      queued: {
        bg: "bg-yellow-500/10",
        text: "text-yellow-600",
        border: "border-yellow-500/30",
        icon: <Clock className="h-4 w-4" />,
      },
      processing: {
        bg: "bg-blue-500/10",
        text: "text-blue-600",
        border: "border-blue-500/30",
        icon: <Zap className="h-4 w-4 animate-pulse" />,
      },
      completed: {
        bg: "bg-green-500/10",
        text: "text-green-600",
        border: "border-green-500/30",
        icon: <CheckCircle2 className="h-4 w-4" />,
      },
      failed: {
        bg: "bg-red-500/10",
        text: "text-red-600",
        border: "border-red-500/30",
        icon: <XCircle className="h-4 w-4" />,
      },
    };

    const badge = badges[status as keyof typeof badges] || badges.queued;

    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-body font-bold border ${badge.bg} ${badge.text} ${badge.border}`}
      >
        {badge.icon}
        {status}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border-default bg-surface-base shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border-default bg-surface-panel px-6 py-4">
          <div>
            <Heading variant="section" as="h2" className="text-text-primary">
              Job Details
            </Heading>
            <p className="text-body text-text-muted mt-1">#{job.job_id}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" aria-hidden />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status */}
          <div>
            <Label tone="meta" className="uppercase tracking-wider">
              Status
            </Label>
            <div className="mt-2">{getStatusBadge(job.status)}</div>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label tone="meta" className="uppercase tracking-wider">
                Created At
              </Label>
              <div className="mt-2 rounded-lg border border-border-default bg-surface-panel px-3 py-2">
                <p className="text-body text-text-primary">{formatDateTime(job.created_at)}</p>
              </div>
            </div>
            <div>
              <Label tone="meta" className="uppercase tracking-wider">
                Completed At
              </Label>
              <div className="mt-2 rounded-lg border border-border-default bg-surface-panel px-3 py-2">
                <p className="text-body text-text-primary">{formatDateTime(job.completed_at)}</p>
              </div>
            </div>
          </div>

          {/* Duration */}
          {job.duration_seconds && (
            <div>
              <Label tone="meta" className="uppercase tracking-wider">
                Duration
              </Label>
              <div className="mt-2 rounded-lg border border-border-default bg-surface-panel px-3 py-2">
                <p className="text-body text-text-primary">
                  {formatDuration(job.duration_seconds)}
                </p>
              </div>
            </div>
          )}

          {/* Voice ID */}
          <div>
            <Label tone="meta" className="uppercase tracking-wider flex items-center gap-2">
              <Mic className="h-3.5 w-3.5" />
              Voice ID
            </Label>
            <div className="mt-2 rounded-lg border border-border-default bg-surface-panel px-3 py-2">
              <p className="text-body text-text-primary">Voice #{job.voice_id}</p>
            </div>
          </div>

          {/* Project ID */}
          {job.project_id && (
            <div>
              <Label tone="meta" className="uppercase tracking-wider">
                Project ID
              </Label>
              <div className="mt-2 rounded-lg border border-border-default bg-surface-panel px-3 py-2">
                <p className="text-body text-text-primary">Project #{job.project_id}</p>
              </div>
            </div>
          )}

          {/* Text */}
          {job.text && (
            <div>
              <Label tone="meta" className="uppercase tracking-wider flex items-center gap-2">
                <FileText className="h-3.5 w-3.5" />
                Input Text
              </Label>
              <div className="mt-2 rounded-lg border border-border-default bg-surface-panel p-4">
                <p className="text-body text-text-primary whitespace-pre-wrap">{job.text}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {job.error_message && (
            <div>
              <Label tone="meta" className="uppercase tracking-wider flex items-center gap-2">
                <XCircle className="h-3.5 w-3.5 text-red-500" />
                Error Message
              </Label>
              <div className="mt-2 rounded-lg border-2 border-red-500/50 bg-red-500/10 p-4">
                <p className="text-body text-red-600 font-mono">{job.error_message}</p>
              </div>
            </div>
          )}

          {/* Audio URL */}
          {job.audio_url && (
            <div>
              <Label tone="meta" className="uppercase tracking-wider">
                Audio URL
              </Label>
              <div className="mt-2 rounded-lg border border-border-default bg-surface-panel px-3 py-2">
                <a
                  href={job.audio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-body text-accent-primary hover:underline break-all"
                >
                  {job.audio_url}
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-border-default bg-surface-panel px-6 py-4">
          <Button size="md" fullWidth onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
