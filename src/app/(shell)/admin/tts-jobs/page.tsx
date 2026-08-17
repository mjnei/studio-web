"use client";

import { useState, useEffect, useCallback } from "react";
import { Zap, RefreshCw, Download, Filter } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useToast } from "@/components/ui/toast";
import { TTSStatsWidget } from "./components/TTSStatsWidget";
import { StaleJobsAlert } from "./components/StaleJobsAlert";
import { FailedJobsTable } from "./components/FailedJobsTable";
import { JobDetailModal } from "./components/JobDetailModal";
import {
  getStaleTTSJobs,
  getFailedTTSJobs,
  getTTSJobStats,
  retryTTSJob,
  cancelTTSJob,
} from "@/lib/api/admin-tts-client";
import type { StaleJob, FailedJob, TTSJobStats, TTSJob } from "@/types/admin";

export default function TTSJobsPage() {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<TTSJobStats | null>(null);
  const [staleJobs, setStaleJobs] = useState<StaleJob[]>([]);
  const [failedJobs, setFailedJobs] = useState<FailedJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<TTSJob | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const loadData = useCallback(async () => {
    try {
      const [statsData, staleData, failedData] = await Promise.all([
        getTTSJobStats(),
        getStaleTTSJobs(100),
        getFailedTTSJobs(50, 0),
      ]);

      setStats(statsData);
      setStaleJobs(staleData);
      setFailedJobs(failedData);
      setLastRefresh(new Date());
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An error occurred";
      toast.error("Failed to load TTS job data", message);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Initial load
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      try {
        const [statsData, staleData, failedData] = await Promise.all([
          getTTSJobStats(),
          getStaleTTSJobs(100),
          getFailedTTSJobs(50, 0),
        ]);

        if (isMounted) {
          setStats(statsData);
          setStaleJobs(staleData);
          setFailedJobs(failedData);
          setLastRefresh(new Date());
        }
      } catch (error: unknown) {
        if (isMounted) {
          const message = error instanceof Error ? error.message : "An error occurred";
          toast.error("Failed to load TTS job data", message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [toast]);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      void loadData();
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh, loadData]);

  const handleRetry = async (jobId: number) => {
    try {
      await retryTTSJob(jobId);
      toast.success("Job retry initiated", "The TTS job has been queued for retry");
      await loadData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An error occurred";
      toast.error("Failed to retry job", message);
    }
  };

  const handleCancel = async (jobId: string) => {
    try {
      // Find the numeric ID from job_id
      const staleJob = staleJobs.find((j) => j.job_id === jobId);
      if (!staleJob) return;

      await cancelTTSJob(staleJob.id);
      toast.success("Job cancelled", "The stale TTS job has been cancelled");
      await loadData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An error occurred";
      toast.error("Failed to cancel job", message);
    }
  };

  const handleViewDetails = (job: FailedJob) => {
    // Convert FailedJob to TTSJob format for modal
    const ttsJob: TTSJob = {
      id: job.id,
      job_id: job.job_id,
      status: job.status,
      created_at: job.created_at,
      completed_at: job.completed_at,
      error_message: job.error_message,
      voice_id: job.voice_id,
      text: job.text,
      project_id: job.project_id,
    };
    setSelectedJob(ttsJob);
    setIsModalOpen(true);
  };

  const handleExportCSV = () => {
    if (!failedJobs.length) {
      toast.info("No data to export", "There are no failed jobs to export");
      return;
    }

    // Create CSV content
    const headers = ["Job ID", "Status", "Voice ID", "Error Message", "Created At", "Failed At"];
    const rows = failedJobs.map((job) => [
      job.job_id,
      job.status,
      job.voice_id,
      job.error_message || "N/A",
      job.created_at,
      job.completed_at || "N/A",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `tts-failed-jobs-${new Date().toISOString()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("CSV exported", "Failed jobs exported successfully");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-accent-primary to-purple-600 shadow-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-text-primary">TTS Jobs Monitoring</h1>
            </div>
            <p className="text-text-secondary">
              Monitor TTS job health and diagnose failures in real-time
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Auto-refresh toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                autoRefresh
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30"
                  : "border-2 border-border-default bg-surface-base text-text-secondary hover:border-accent-primary hover:bg-accent-primary/5"
              }`}
            >
              <RefreshCw className={`h-4 w-4 ${autoRefresh ? "animate-spin" : ""}`} />
              Auto-refresh {autoRefresh ? "ON" : "OFF"}
            </button>

            {/* Manual refresh */}
            <button
              onClick={() => loadData()}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border-2 border-border-default bg-surface-base text-text-secondary hover:border-accent-primary hover:text-accent-primary hover:bg-accent-primary/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              disabled={!failedJobs.length}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-accent-primary to-purple-600 text-white hover:shadow-lg hover:shadow-accent-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Last refresh time */}
        <p className="text-xs text-text-muted">
          Last refreshed: {formatTime(lastRefresh)} {autoRefresh && "(auto-refresh every 5s)"}
        </p>
      </div>

      {/* Loading State */}
      {isLoading && !stats ? (
        <LoadingSpinner size="lg" message="Loading TTS job data..." fullHeight />
      ) : (
        <div className="space-y-6">
          {/* Statistics */}
          {stats && <TTSStatsWidget stats={stats} />}

          {/* Stale Jobs Alert */}
          {staleJobs.length > 0 && <StaleJobsAlert staleJobs={staleJobs} onCancel={handleCancel} />}

          {/* Failed Jobs Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-text-primary">Failed Jobs</h2>
                <p className="text-sm text-text-secondary">
                  Recent TTS jobs that failed to complete
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-600 border border-red-500/30">
                {failedJobs.length} Failed
              </span>
            </div>
            <FailedJobsTable
              failedJobs={failedJobs}
              onRetry={handleRetry}
              onViewDetails={handleViewDetails}
            />
          </div>
        </div>
      )}

      {/* Job Detail Modal */}
      <JobDetailModal job={selectedJob} open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
