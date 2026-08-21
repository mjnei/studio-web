"use client";

import { useState, useEffect, useCallback } from "react";
import { Zap, RefreshCw, Download, Filter } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useToast } from "@/components/ui/toast";
import { Heading } from "@/components/ui/heading";
import { AudioPlayer } from "@/app/(shell)/admin/playground/components/AudioPlayer";
import { TTSStatsWidget } from "./components/TTSStatsWidget";
import { StaleJobsAlert } from "./components/StaleJobsAlert";
import { FailedJobsTable } from "./components/FailedJobsTable";
import { CompletedJobsTable } from "./components/CompletedJobsTable";
import { JobDetailModal } from "./components/JobDetailModal";
import {
  getStaleTTSJobs,
  getFailedTTSJobs,
  getCompletedTTSJobs,
  getTTSJobStats,
  retryTTSJob,
  cancelTTSJob,
} from "@/lib/api/admin-studio-tts-client";
import type { StaleJob, FailedJob, CompletedJob, TTSJobStats, TTSJob } from "@/types/admin";

type TabType = "failed" | "completed";

export default function TTSJobsPage() {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<TTSJobStats | null>(null);
  const [staleJobs, setStaleJobs] = useState<StaleJob[]>([]);
  const [failedJobs, setFailedJobs] = useState<FailedJob[]>([]);
  const [completedJobs, setCompletedJobs] = useState<CompletedJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<TTSJob | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<TabType>("failed");
  const [currentAudio, setCurrentAudio] = useState<{
    url: string;
    jobId: string;
    jobName: string;
  } | null>(null);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [statsData, staleData, failedData, completedData] = await Promise.all([
        getTTSJobStats(),
        getStaleTTSJobs(100),
        getFailedTTSJobs(50, 0),
        getCompletedTTSJobs(50, 0),
      ]);

      setStats(statsData);
      setStaleJobs(staleData);
      setFailedJobs(failedData);
      setCompletedJobs(completedData);
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
        const [statsData, staleData, failedData, completedData] = await Promise.all([
          getTTSJobStats(),
          getStaleTTSJobs(100),
          getFailedTTSJobs(50, 0),
          getCompletedTTSJobs(50, 0),
        ]);

        if (isMounted) {
          setStats(statsData);
          setStaleJobs(staleData);
          setFailedJobs(failedData);
          setCompletedJobs(completedData);
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

  const handleViewDetails = (job: FailedJob | CompletedJob) => {
    // Convert job to TTSJob format for modal
    const ttsJob: TTSJob = {
      id: job.id,
      job_id: job.job_id,
      status: job.status,
      created_at: job.created_at,
      completed_at: job.completed_at,
      error_message: "error_message" in job ? job.error_message : undefined,
      voice_id: job.voice_id,
      text: job.text,
      project_id: job.project_id,
      audio_url: "audio_path" in job ? job.audio_path : undefined,
      duration_seconds:
        "synthesis_duration_seconds" in job ? job.synthesis_duration_seconds : undefined,
    };
    setSelectedJob(ttsJob);
    setIsModalOpen(true);
  };

  const handlePlayAudio = (job: CompletedJob) => {
    if (job.audio_path) {
      setCurrentAudio({
        url: job.audio_path,
        jobId: job.job_id,
        jobName: `Job #${job.job_id}`,
      });
      setShowAudioPlayer(true);
    }
  };

  const handleDismissPlayer = () => {
    setShowAudioPlayer(false);
    setCurrentAudio(null);
  };

  const handleExportCSV = () => {
    const jobsToExport = activeTab === "failed" ? failedJobs : completedJobs;
    if (!jobsToExport.length) {
      toast.info("No data to export", `There are no ${activeTab} jobs to export`);
      return;
    }

    // Create CSV content
    const headers =
      activeTab === "failed"
        ? ["Job ID", "Status", "Voice ID", "Error Message", "Created At", "Failed At"]
        : [
            "Job ID",
            "Status",
            "Voice ID",
            "Audio Duration",
            "Synthesis Time",
            "Created At",
            "Completed At",
          ];

    const rows = jobsToExport.map((job) => {
      if (activeTab === "failed") {
        const failedJob = job as FailedJob;
        return [
          failedJob.job_id,
          failedJob.status,
          failedJob.voice_id,
          failedJob.error_message || "N/A",
          failedJob.created_at,
          failedJob.completed_at || "N/A",
        ];
      } else {
        const completedJob = job as CompletedJob;
        return [
          completedJob.job_id,
          completedJob.status,
          completedJob.voice_id,
          completedJob.audio_duration || "N/A",
          completedJob.synthesis_duration_seconds || "N/A",
          completedJob.created_at,
          completedJob.completed_at || "N/A",
        ];
      }
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `tts-${activeTab}-jobs-${new Date().toISOString()}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("CSV exported", `${activeTab} jobs exported successfully`);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="mx-auto max-w-7xl pb-32">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-accent-primary to-purple-600 shadow-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <Heading variant="page" className="text-text-primary">Studio TTS Jobs Monitoring</Heading>
            </div>
            <p className="text-text-secondary">
              Monitor Studio project TTS job health and diagnose failures in real-time
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
              disabled={activeTab === "failed" ? !failedJobs.length : !completedJobs.length}
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

          {/* Tabs Section */}
          <div>
            {/* Tab Navigation */}
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => setActiveTab("failed")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === "failed"
                    ? "bg-red-500/10 text-red-600 border-2 border-red-500/30"
                    : "border-2 border-border-default bg-surface-base text-text-secondary hover:border-accent-primary hover:bg-accent-primary/5"
                }`}
              >
                Failed Jobs
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === "failed"
                      ? "bg-red-600 text-white"
                      : "bg-text-muted/10 text-text-muted"
                  }`}
                >
                  {failedJobs.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("completed")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === "completed"
                    ? "bg-green-500/10 text-green-600 border-2 border-green-500/30"
                    : "border-2 border-border-default bg-surface-base text-text-secondary hover:border-accent-primary hover:bg-accent-primary/5"
                }`}
              >
                Completed Jobs
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === "completed"
                      ? "bg-green-600 text-white"
                      : "bg-text-muted/10 text-text-muted"
                  }`}
                >
                  {completedJobs.length}
                </span>
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === "failed" ? (
              <FailedJobsTable
                failedJobs={failedJobs}
                onRetry={handleRetry}
                onViewDetails={handleViewDetails}
              />
            ) : (
              <CompletedJobsTable
                completedJobs={completedJobs}
                onViewDetails={handleViewDetails}
                onPlay={handlePlayAudio}
              />
            )}
          </div>
        </div>
      )}

      {/* Sticky Bottom Audio Player */}
      {showAudioPlayer && currentAudio && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border-default bg-surface-base/95 backdrop-blur-lg shadow-2xl">
          <div className="mx-auto max-w-7xl px-4 py-4">
            <AudioPlayer
              audioUrl={currentAudio.url}
              jobId={currentAudio.jobId}
              jobName={currentAudio.jobName}
              onDismiss={handleDismissPlayer}
            />
          </div>
        </div>
      )}

      {/* Job Detail Modal */}
      <JobDetailModal job={selectedJob} open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
