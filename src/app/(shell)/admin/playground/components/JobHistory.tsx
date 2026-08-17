"use client";

import { Clock, CheckCircle2, XCircle, Zap, Play, Trash2 } from "lucide-react";
import type { PlaygroundJob } from "@/types/admin";

interface JobHistoryProps {
  jobs: PlaygroundJob[];
  onPlay: (job: PlaygroundJob) => void;
  onDelete?: (jobId: string) => void;
}

export function JobHistory({ jobs, onPlay, onDelete }: JobHistoryProps) {
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

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: {
        bg: "bg-gray-500/10",
        text: "text-gray-600",
        icon: <Clock className="h-3 w-3" />,
      },
      queued: {
        bg: "bg-yellow-500/10",
        text: "text-yellow-600",
        icon: <Clock className="h-3 w-3" />,
      },
      processing: {
        bg: "bg-blue-500/10",
        text: "text-blue-600",
        icon: <Zap className="h-3 w-3 animate-pulse" />,
      },
      completed: {
        bg: "bg-green-500/10",
        text: "text-green-600",
        icon: <CheckCircle2 className="h-3 w-3" />,
      },
      failed: {
        bg: "bg-red-500/10",
        text: "text-red-600",
        icon: <XCircle className="h-3 w-3" />,
      },
    };

    const badge = badges[status as keyof typeof badges] || badges.pending;

    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${badge.bg} ${badge.text}`}
      >
        {badge.icon}
        {status}
      </span>
    );
  };

  if (jobs.length === 0) {
    return (
      <div className="rounded-xl border border-border-default bg-surface-panel p-6 text-center">
        <Clock className="h-12 w-12 text-text-muted mx-auto mb-3 opacity-50" />
        <p className="text-sm text-text-secondary">No recent jobs</p>
        <p className="text-xs text-text-muted mt-1">Your playground job history will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-xl border border-border-default bg-surface-panel overflow-hidden">
      {/* Header */}
      <div className="bg-surface-raised px-4 py-3 border-b border-border-default">
        <h3 className="text-sm font-semibold text-text-primary">Recent Jobs</h3>
      </div>

      {/* Job List */}
      <div className="divide-y divide-border-default">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="px-4 py-3 hover:bg-surface-raised/50 transition-colors group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                {/* Status and Time */}
                <div className="flex items-center gap-2 mb-2">
                  {getStatusBadge(job.status)}
                  <span className="text-xs text-text-muted">
                    {formatRelativeTime(job.created_at)}
                  </span>
                  {job.duration_seconds && (
                    <span className="text-xs text-text-muted">
                      • {job.duration_seconds.toFixed(1)}s
                    </span>
                  )}
                </div>

                {/* Text Preview */}
                <p className="text-sm text-text-secondary line-clamp-2 mb-2">{job.text}</p>

                {/* Speed Ratio */}
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <span>Speed: {job.speed_ratio.toFixed(1)}x</span>
                  <span>•</span>
                  <span>Voice #{job.voice_id}</span>
                </div>

                {/* Error */}
                {job.error && (
                  <div className="mt-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2">
                    <p className="text-xs text-red-600">{job.error}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {job.status === "completed" && job.audio_url && (
                  <button
                    onClick={() => onPlay(job)}
                    className="flex items-center justify-center w-8 h-8 rounded-lg border border-border-default bg-surface-base text-text-secondary hover:border-accent-primary hover:text-accent-primary hover:bg-accent-primary/5 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Play className="h-4 w-4" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(job.id)}
                    className="flex items-center justify-center w-8 h-8 rounded-lg border border-border-default bg-surface-base text-text-secondary hover:border-red-500 hover:text-red-600 hover:bg-red-500/5 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
