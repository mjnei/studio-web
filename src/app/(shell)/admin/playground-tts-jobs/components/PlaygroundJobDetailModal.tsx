"use client";

import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";

import {
  X,
  Clock,
  CheckCircle2,
  XCircle,
  Zap,
  FileText,
  Mic,
  ShieldAlert,
  Globe,
} from "lucide-react";
import type { PlaygroundTTSJob } from "@/types/admin";

interface PlaygroundJobDetailModalProps {
  job: PlaygroundTTSJob | null;
  open: boolean;
  onClose: () => void;
}

export function PlaygroundJobDetailModal({ job, open, onClose }: PlaygroundJobDetailModalProps) {
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

  const formatIPHash = (hash: string) => {
    return hash.substring(0, 16) + "...";
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
      rate_limited: {
        bg: "bg-orange-500/10",
        text: "text-orange-600",
        border: "border-orange-500/30",
        icon: <ShieldAlert className="h-4 w-4" />,
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
              Playground Job Details
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
            <label className="text-caption font-medium text-text-muted uppercase tracking-wider">
              Status
            </label>
            <div className="mt-2 flex items-center gap-3">
              {getStatusBadge(job.status)}
              {job.retry_count > 0 && (
                <span className="text-caption text-text-muted">Retries: {job.retry_count}</span>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-caption font-medium text-text-muted uppercase tracking-wider">
                Created At
              </label>
              <div className="mt-2 rounded-lg border border-border-default bg-surface-panel px-3 py-2">
                <p className="text-body text-text-primary">{formatDateTime(job.created_at)}</p>
              </div>
            </div>
            <div>
              <label className="text-caption font-medium text-text-muted uppercase tracking-wider">
                Completed At
              </label>
              <div className="mt-2 rounded-lg border border-border-default bg-surface-panel px-3 py-2">
                <p className="text-body text-text-primary">{formatDateTime(job.completed_at)}</p>
              </div>
            </div>
          </div>

          {/* Expires At */}
          <div>
            <label className="text-caption font-medium text-text-muted uppercase tracking-wider">
              Expires At (30-day cleanup)
            </label>
            <div className="mt-2 rounded-lg border border-border-default bg-surface-panel px-3 py-2">
              <p className="text-body text-text-primary">{formatDateTime(job.expires_at)}</p>
            </div>
          </div>

          {/* Audio Duration & Synthesis Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-caption font-medium text-text-muted uppercase tracking-wider">
                Audio Duration
              </label>
              <div className="mt-2 rounded-lg border border-border-default bg-surface-panel px-3 py-2">
                <p className="text-body text-text-primary">{formatDuration(job.audio_duration)}</p>
              </div>
            </div>
            <div>
              <label className="text-caption font-medium text-text-muted uppercase tracking-wider">
                Synthesis Time
              </label>
              <div className="mt-2 rounded-lg border border-border-default bg-surface-panel px-3 py-2">
                <p className="text-body text-text-primary">
                  {formatDuration(job.synthesis_duration_seconds)}
                </p>
              </div>
            </div>
          </div>

          {/* Voice ID */}
          <div>
            <label className="text-caption font-medium text-text-muted uppercase tracking-wider flex items-center gap-2">
              <Mic className="h-3.5 w-3.5" />
              Voice Source
            </label>
            <div className="mt-2 rounded-lg border border-border-default bg-surface-panel px-3 py-2">
              <p className="text-body text-text-primary">
                {job.voice_id
                  ? `Approved Voice #${job.voice_id}`
                  : `Anonymous Voice #${job.anonymous_voice_id}`}
              </p>
            </div>
          </div>

          {/* Language & Speed */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-caption font-medium text-text-muted uppercase tracking-wider flex items-center gap-2">
                <Globe className="h-3.5 w-3.5" />
                Language
              </label>
              <div className="mt-2 rounded-lg border border-border-default bg-surface-panel px-3 py-2">
                <p className="text-body text-text-primary">{job.language}</p>
              </div>
            </div>
            <div>
              <label className="text-caption font-medium text-text-muted uppercase tracking-wider">
                Speed Ratio
              </label>
              <div className="mt-2 rounded-lg border border-border-default bg-surface-panel px-3 py-2">
                <p className="text-body text-text-primary">{job.ratio}x</p>
              </div>
            </div>
          </div>

          {/* Client Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-caption font-medium text-text-muted uppercase tracking-wider">
                Client IP (Hashed)
              </label>
              <div className="mt-2 rounded-lg border border-border-default bg-surface-panel px-3 py-2">
                <p className="text-caption font-mono text-text-primary">
                  {formatIPHash(job.client_ip_address)}
                </p>
              </div>
            </div>
            <div>
              <label className="text-caption font-medium text-text-muted uppercase tracking-wider">
                Correlation ID
              </label>
              <div className="mt-2 rounded-lg border border-border-default bg-surface-panel px-3 py-2">
                <p className="text-caption font-mono text-text-primary">{job.correlation_id}</p>
              </div>
            </div>
          </div>

          {/* User Agent */}
          {job.user_agent && (
            <div>
              <label className="text-caption font-medium text-text-muted uppercase tracking-wider">
                User Agent
              </label>
              <div className="mt-2 rounded-lg border border-border-default bg-surface-panel px-3 py-2">
                <p className="text-caption text-text-primary break-all">{job.user_agent}</p>
              </div>
            </div>
          )}

          {/* Text */}
          <div>
            <label className="text-caption font-medium text-text-muted uppercase tracking-wider flex items-center gap-2">
              <FileText className="h-3.5 w-3.5" />
              Input Text
            </label>
            <div className="mt-2 rounded-lg border border-border-default bg-surface-panel p-4">
              <p className="text-body text-text-primary whitespace-pre-wrap">{job.text}</p>
            </div>
          </div>

          {/* Error Message */}
          {job.error_message && (
            <div>
              <label className="text-caption font-medium text-text-muted uppercase tracking-wider flex items-center gap-2">
                <XCircle className="h-3.5 w-3.5 text-red-500" />
                Error Message
              </label>
              <div className="mt-2 rounded-lg border-2 border-red-500/50 bg-red-500/10 p-4">
                <p className="text-body text-red-600 font-mono">{job.error_message}</p>
              </div>
            </div>
          )}

          {/* Audio Path */}
          {job.audio_path && (
            <div>
              <label className="text-caption font-medium text-text-muted uppercase tracking-wider">
                Audio Path
              </label>
              <div className="mt-2 rounded-lg border border-border-default bg-surface-panel px-3 py-2">
                <p className="text-caption text-accent-primary font-mono break-all">
                  {job.audio_path}
                </p>
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
