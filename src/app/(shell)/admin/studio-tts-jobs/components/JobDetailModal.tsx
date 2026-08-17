"use client";

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
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold border ${badge.bg} ${badge.text} ${badge.border}`}
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
            <h2 className="text-xl font-bold text-text-primary">Job Details</h2>
            <p className="text-sm text-text-muted mt-1">#{job.job_id}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-text-muted hover:bg-surface-raised hover:text-text-primary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status */}
          <div>
            <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
              Status
            </label>
            <div className="mt-2">{getStatusBadge(job.status)}</div>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
                Created At
              </label>
              <div className="mt-2 rounded-lg border border-border-default bg-surface-panel px-3 py-2">
                <p className="text-sm text-text-primary">{formatDateTime(job.created_at)}</p>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
                Completed At
              </label>
              <div className="mt-2 rounded-lg border border-border-default bg-surface-panel px-3 py-2">
                <p className="text-sm text-text-primary">{formatDateTime(job.completed_at)}</p>
              </div>
            </div>
          </div>

          {/* Duration */}
          {job.duration_seconds && (
            <div>
              <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
                Duration
              </label>
              <div className="mt-2 rounded-lg border border-border-default bg-surface-panel px-3 py-2">
                <p className="text-sm text-text-primary">
                  {formatDuration(job.duration_seconds)}
                </p>
              </div>
            </div>
          )}

          {/* Voice ID */}
          <div>
            <label className="text-xs font-medium text-text-muted uppercase tracking-wider flex items-center gap-2">
              <Mic className="h-3.5 w-3.5" />
              Voice ID
            </label>
            <div className="mt-2 rounded-lg border border-border-default bg-surface-panel px-3 py-2">
              <p className="text-sm text-text-primary">Voice #{job.voice_id}</p>
            </div>
          </div>

          {/* Project ID */}
          {job.project_id && (
            <div>
              <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
                Project ID
              </label>
              <div className="mt-2 rounded-lg border border-border-default bg-surface-panel px-3 py-2">
                <p className="text-sm text-text-primary">Project #{job.project_id}</p>
              </div>
            </div>
          )}

          {/* Text */}
          {job.text && (
            <div>
              <label className="text-xs font-medium text-text-muted uppercase tracking-wider flex items-center gap-2">
                <FileText className="h-3.5 w-3.5" />
                Input Text
              </label>
              <div className="mt-2 rounded-lg border border-border-default bg-surface-panel p-4">
                <p className="text-sm text-text-primary whitespace-pre-wrap">{job.text}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {job.error_message && (
            <div>
              <label className="text-xs font-medium text-text-muted uppercase tracking-wider flex items-center gap-2">
                <XCircle className="h-3.5 w-3.5 text-red-500" />
                Error Message
              </label>
              <div className="mt-2 rounded-lg border-2 border-red-500/50 bg-red-500/10 p-4">
                <p className="text-sm text-red-600 font-mono">{job.error_message}</p>
              </div>
            </div>
          )}

          {/* Audio URL */}
          {job.audio_url && (
            <div>
              <label className="text-xs font-medium text-text-muted uppercase tracking-wider">
                Audio URL
              </label>
              <div className="mt-2 rounded-lg border border-border-default bg-surface-panel px-3 py-2">
                <a
                  href={job.audio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-accent-primary hover:underline break-all"
                >
                  {job.audio_url}
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-border-default bg-surface-panel px-6 py-4">
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-gradient-to-r from-accent-primary to-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:shadow-lg hover:shadow-accent-primary/30 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
