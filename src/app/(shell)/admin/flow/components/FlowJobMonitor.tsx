"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCw,
  Film,
  Mic,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { retryFlowRender, getFlowJob } from "@/lib/api/flow-client";
import type { FlowJobResponse, FlowSubStatus } from "@/types/flow";

interface FlowJobMonitorProps {
  job: FlowJobResponse;
  onUpdateJob: (job: FlowJobResponse) => void;
}

export function FlowJobMonitor({ job, onUpdateJob }: FlowJobMonitorProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const isJobInFlight =
    job.lifecycle_status === "queued" || job.lifecycle_status === "processing";

  // Polling effect
  useEffect(() => {
    if (!autoRefresh || !isJobInFlight) return;

    const interval = setInterval(async () => {
      try {
        const updated = await getFlowJob(job.id);
        onUpdateJob(updated);
      } catch (err) {
        console.error("Failed to poll flow job:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [autoRefresh, isJobInFlight, job.id, onUpdateJob]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const updated = await getFlowJob(job.id);
      onUpdateJob(updated);
    } catch (err) {
      console.error("Failed to refresh flow job:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRetryRender = async () => {
    setIsRetrying(true);
    setRetryError(null);
    try {
      const updated = await retryFlowRender(job.id);
      onUpdateJob(updated);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to retry render";
      setRetryError(msg);
    } finally {
      setIsRetrying(false);
    }
  };

  const getStatusBadge = (status: FlowSubStatus) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="mr-1 h-3 w-3" /> Completed
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse">
            <Spinner size="sm" className="mr-1" /> Processing
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-500/10 text-red-400 border border-red-500/20">
            <AlertTriangle className="mr-1 h-3 w-3" /> Failed
          </Badge>
        );
      default:
        return (
          <Badge className="bg-surface-panel text-text-muted border border-border-default">
            <Clock className="mr-1 h-3 w-3" /> Queued
          </Badge>
        );
    }
  };

  const canRetryRender =
    job.render_status === "failed" &&
    job.tts_en_status === "completed" &&
    job.tts_zh_cn_status === "completed" &&
    job.tts_zh_tw_status === "completed" &&
    job.retry_count < 3;

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border-default">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-accent-primary" />
          <h3 className="text-body font-semibold text-text-primary">
            Flow Job #{job.id} Status
          </h3>
          <span className="text-micro font-mono text-text-muted">
            Phase: <strong className="text-text-primary uppercase">{job.current_phase}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-micro text-text-muted cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-border-default text-accent-primary focus:ring-accent-primary"
            />
            <span>Auto-poll (3s)</span>
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="text-caption h-8"
          >
            <RotateCw className={`mr-1.5 h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Phase 1: 3-Locale TTS Synthesis */}
        <div className="rounded-xl border border-border-default bg-surface-panel p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-text-primary">
              <Mic className="h-4 w-4 text-purple-400" />
              <span className="text-caption font-semibold">Phase 1: Multi-Locale TTS</span>
            </div>
            <span className="text-micro text-text-muted">Sequential Queue</span>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between p-2 rounded-lg bg-surface-base border border-border-default">
              <span className="text-caption font-medium text-text-primary">English (en)</span>
              {getStatusBadge(job.tts_en_status)}
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-surface-base border border-border-default">
              <span className="text-caption font-medium text-text-primary">Simplified Chinese (zh-CN)</span>
              {getStatusBadge(job.tts_zh_cn_status)}
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-surface-base border border-border-default">
              <span className="text-caption font-medium text-text-primary">Traditional Chinese (zh-TW)</span>
              {getStatusBadge(job.tts_zh_tw_status)}
            </div>
          </div>
        </div>

        {/* Phase 2: FFmpeg Multi-Clip Render */}
        <div className="rounded-xl border border-border-default bg-surface-panel p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-text-primary">
              <Film className="h-4 w-4 text-blue-400" />
              <span className="text-caption font-semibold">Phase 2: FFmpeg Video Render</span>
            </div>
            <span className="text-micro text-text-muted">
              Retries: {job.retry_count} / 3
            </span>
          </div>

          <div className="p-3 rounded-lg bg-surface-base border border-border-default space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-caption font-medium text-text-primary">Render Status</span>
              {getStatusBadge(job.render_status)}
            </div>

            <p className="text-micro text-text-muted">
              Adjusts 10 clips via ffmpeg setpts & atempo to match ~4s speech windows for all 3 locales.
            </p>

            {canRetryRender && (
              <div className="pt-2 border-t border-border-default">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRetryRender}
                  disabled={isRetrying}
                  className="w-full text-caption border-amber-500/40 text-amber-400 hover:bg-amber-950/20"
                >
                  {isRetrying ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Retrying FFmpeg Render...
                    </>
                  ) : (
                    <>
                      <RotateCw className="mr-1.5 h-3.5 w-3.5" />
                      Retry Failed Render (Attempt {job.retry_count + 1} of 3)
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Banners */}
      {(job.error_message || retryError) && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-950/20 p-3.5 text-caption text-red-400">
          <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Execution Error:</p>
            <p className="font-mono text-micro break-all">
              {retryError || job.error_message}
            </p>
          </div>
        </div>
      )}

      {/* Summary Footer */}
      <div className="flex flex-wrap items-center justify-between text-micro text-text-muted px-1">
        <span>Created: {new Date(job.created_at).toLocaleString()}</span>
        {job.completed_at && (
          <span className="text-emerald-400 font-medium">
            Completed: {new Date(job.completed_at).toLocaleString()}
          </span>
        )}
      </div>
    </div>
  );
}
