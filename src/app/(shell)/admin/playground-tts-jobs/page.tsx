"use client";

import { useState, useEffect, useCallback } from "react";
import { Gamepad2, RefreshCw, Download, ShieldAlert } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useToast } from "@/components/ui/toast";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { PlaygroundStatsWidget } from "./components/PlaygroundStatsWidget";
import { PlaygroundStaleJobsAlert } from "./components/PlaygroundStaleJobsAlert";
import { PlaygroundFailedJobsTable } from "./components/PlaygroundFailedJobsTable";
import { PlaygroundRateLimitedJobsTable } from "./components/PlaygroundRateLimitedJobsTable";
import { PlaygroundCompletedJobsTable } from "./components/PlaygroundCompletedJobsTable";
import { PlaygroundJobDetailModal } from "./components/PlaygroundJobDetailModal";
import {
  getPlaygroundStaleTTSJobs,
  getPlaygroundFailedTTSJobs,
  getPlaygroundRateLimitedJobs,
  getPlaygroundCompletedTTSJobs,
  getPlaygroundTTSJobStats,
  retryPlaygroundTTSJob,
  cancelPlaygroundTTSJob,
} from "@/lib/api/admin-playground-tts-client";
import type {
  PlaygroundStaleJob,
  PlaygroundFailedJob,
  PlaygroundRateLimitedJob,
  PlaygroundCompletedJob,
  PlaygroundTTSJobStats,
  PlaygroundTTSJob,
} from "@/types/admin";

type TabType = "failed" | "rate_limited" | "completed";

export default function PlaygroundTTSJobsPage() {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<PlaygroundTTSJobStats | null>(null);
  const [staleJobs, setStaleJobs] = useState<PlaygroundStaleJob[]>([]);
  const [failedJobs, setFailedJobs] = useState<PlaygroundFailedJob[]>([]);
  const [rateLimitedJobs, setRateLimitedJobs] = useState<PlaygroundRateLimitedJob[]>([]);
  const [completedJobs, setCompletedJobs] = useState<PlaygroundCompletedJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<PlaygroundTTSJob | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<TabType>("failed");

  const loadData = useCallback(async () => {
    try {
      const [statsData, staleData, failedData, rateLimitedData, completedData] = await Promise.all([
        getPlaygroundTTSJobStats(),
        getPlaygroundStaleTTSJobs(100),
        getPlaygroundFailedTTSJobs(50, 0),
        getPlaygroundRateLimitedJobs(50, 0),
        getPlaygroundCompletedTTSJobs(50, 0),
      ]);

      setStats(statsData);
      // Combine queued and processing stale jobs
      setStaleJobs([...staleData.queued_jobs, ...staleData.processing_jobs]);
      setFailedJobs(failedData);
      setRateLimitedJobs(rateLimitedData);
      setCompletedJobs(completedData);
      setLastRefresh(new Date());
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An error occurred";
      toast.error("Failed to load playground TTS job data", message);
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
        const [statsData, staleData, failedData, rateLimitedData, completedData] =
          await Promise.all([
            getPlaygroundTTSJobStats(),
            getPlaygroundStaleTTSJobs(100),
            getPlaygroundFailedTTSJobs(50, 0),
            getPlaygroundRateLimitedJobs(50, 0),
            getPlaygroundCompletedTTSJobs(50, 0),
          ]);

        if (isMounted) {
          setStats(statsData);
          setStaleJobs([...staleData.queued_jobs, ...staleData.processing_jobs]);
          setFailedJobs(failedData);
          setRateLimitedJobs(rateLimitedData);
          setCompletedJobs(completedData);
          setLastRefresh(new Date());
        }
      } catch (error: unknown) {
        if (isMounted) {
          const message = error instanceof Error ? error.message : "An error occurred";
          toast.error("Failed to load playground TTS job data", message);
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
      await retryPlaygroundTTSJob(jobId);
      toast.success("Job retry initiated", "The playground TTS job has been queued for retry");
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

      await cancelPlaygroundTTSJob(staleJob.id);
      toast.success("Job cancelled", "The stale playground TTS job has been cancelled");
      await loadData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An error occurred";
      toast.error("Failed to cancel job", message);
    }
  };

  const handleViewDetails = (
    job: PlaygroundFailedJob | PlaygroundRateLimitedJob | PlaygroundCompletedJob
  ) => {
    // Convert job to PlaygroundTTSJob format for modal
    const ttsJob: PlaygroundTTSJob = {
      id: job.id,
      job_id: job.job_id,
      status: job.status,
      created_at: job.created_at,
      completed_at: job.completed_at,
      expires_at: "", // Will be fetched if needed
      error_message: "error_message" in job ? job.error_message : undefined,
      voice_id: job.voice_id,
      anonymous_voice_id: job.anonymous_voice_id,
      text: job.text,
      language: "", // Will be fetched if needed
      ratio: 1.0,
      retry_count: "retry_count" in job ? job.retry_count : 0,
      audio_path: "audio_path" in job ? job.audio_path : undefined,
      audio_duration: "audio_duration" in job ? job.audio_duration : undefined,
      synthesis_duration_seconds:
        "synthesis_duration_seconds" in job ? job.synthesis_duration_seconds : undefined,
      correlation_id: "",
      client_ip_address: job.client_ip_address,
      user_agent: undefined,
    };
    setSelectedJob(ttsJob);
    setIsModalOpen(true);
  };

  const handleExportCSV = () => {
    const voiceLabel = (job: { voice_id?: number; anonymous_voice_id?: number }) =>
      job.voice_id ? `Voice ${job.voice_id}` : `Anon ${job.anonymous_voice_id}`;

    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    if (activeTab === "failed") {
      headers = [
        "Job ID",
        "Status",
        "Voice",
        "Error Message",
        "Client IP",
        "Retries",
        "Created At",
        "Failed At",
      ];
      rows = failedJobs.map((job) => [
        job.job_id,
        job.status,
        voiceLabel(job),
        job.error_message || "N/A",
        job.client_ip_address,
        job.retry_count,
        job.created_at,
        job.completed_at || "N/A",
      ]);
    } else if (activeTab === "rate_limited") {
      headers = ["Job ID", "Status", "Voice", "Client IP", "Created At"];
      rows = rateLimitedJobs.map((job) => [
        job.job_id,
        job.status,
        voiceLabel(job),
        job.client_ip_address,
        job.created_at,
      ]);
    } else {
      headers = [
        "Job ID",
        "Status",
        "Voice",
        "Audio Duration",
        "Synthesis Time",
        "Client IP",
        "Created At",
        "Completed At",
      ];
      rows = completedJobs.map((job) => [
        job.job_id,
        job.status,
        voiceLabel(job),
        job.audio_duration || "N/A",
        job.synthesis_duration_seconds || "N/A",
        job.client_ip_address,
        job.created_at,
        job.completed_at || "N/A",
      ]);
    }

    if (!rows.length) {
      toast.info("No data to export", `There are no ${activeTab} jobs to export`);
      return;
    }

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `playground-tts-${activeTab}-jobs-${new Date().toISOString()}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("CSV exported", `${activeTab} playground jobs exported successfully`);
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
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
                <Gamepad2 className="h-6 w-6 text-white" />
              </div>
              <Heading variant="page" className="text-text-primary">
                Playground TTS Jobs
              </Heading>
            </div>
            <p className="text-text-secondary">
              Track anonymous user activity, rate limiting, abuse patterns, and resource usage
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Auto-refresh toggle */}
            <Button
              size="md"
              variant={autoRefresh ? "success" : "secondary"}
              onClick={() => setAutoRefresh(!autoRefresh)}
              leftIcon={<RefreshCw className={`h-4 w-4 ${autoRefresh ? "animate-spin" : ""}`} />}
            >
              Auto-refresh {autoRefresh ? "ON" : "OFF"}
            </Button>

            {/* Manual refresh */}
            <Button
              size="md"
              variant="secondary"
              onClick={() => loadData()}
              disabled={isLoading}
              leftIcon={<RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />}
            >
              Refresh
            </Button>

            {/* Export CSV */}
            <Button
              size="md"
              onClick={handleExportCSV}
              disabled={
                (activeTab === "failed" && !failedJobs.length) ||
                (activeTab === "rate_limited" && !rateLimitedJobs.length) ||
                (activeTab === "completed" && !completedJobs.length)
              }
              leftIcon={<Download className="h-4 w-4" />}
            >
              Export CSV
            </Button>
          </div>
        </div>

        {/* Last refresh time */}
        <p className="text-caption text-text-muted">
          Last refreshed: {formatTime(lastRefresh)} {autoRefresh && "(auto-refresh every 5s)"}
        </p>
      </div>

      {/* Loading State */}
      {isLoading && !stats ? (
        <LoadingSpinner size="lg" message="Loading playground TTS job data..." fullHeight />
      ) : (
        <div className="space-y-6">
          {/* Statistics */}
          {stats && <PlaygroundStatsWidget stats={stats} />}

          {/* Stale Jobs Alert */}
          {staleJobs.length > 0 && (
            <PlaygroundStaleJobsAlert staleJobs={staleJobs} onCancel={handleCancel} />
          )}

          {/* Tabs Section */}
          <div>
            {/* Tab Navigation */}
            <div className="mb-6 overflow-x-auto scrollbar-hide">
              <div className="inline-flex min-w-min items-center gap-2">
                <button
                  onClick={() => setActiveTab("failed")}
                  className={`flex h-9 shrink-0 items-center gap-2 whitespace-nowrap px-3.5 py-0 rounded-lg text-body font-semibold transition-all ${
                    activeTab === "failed"
                      ? "bg-red-500/10 text-red-600 border-2 border-red-500/30"
                      : "border-2 border-border-default bg-surface-base text-text-secondary hover:border-accent-primary hover:bg-accent-primary/5"
                  }`}
                >
                  Failed Jobs
                  <span
                    className={`px-2 py-0.5 rounded-full text-caption font-bold ${
                      activeTab === "failed"
                        ? "bg-red-600 text-white"
                        : "bg-text-muted/10 text-text-muted"
                    }`}
                  >
                    {failedJobs.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("rate_limited")}
                  className={`flex h-9 shrink-0 items-center gap-2 whitespace-nowrap px-3.5 py-0 rounded-lg text-body font-semibold transition-all ${
                    activeTab === "rate_limited"
                      ? "bg-orange-500/10 text-orange-600 border-2 border-orange-500/30"
                      : "border-2 border-border-default bg-surface-base text-text-secondary hover:border-accent-primary hover:bg-accent-primary/5"
                  }`}
                >
                  <ShieldAlert className="h-4 w-4" />
                  Rate Limited
                  <span
                    className={`px-2 py-0.5 rounded-full text-caption font-bold ${
                      activeTab === "rate_limited"
                        ? "bg-orange-600 text-white"
                        : "bg-text-muted/10 text-text-muted"
                    }`}
                  >
                    {rateLimitedJobs.length}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab("completed")}
                  className={`flex h-9 shrink-0 items-center gap-2 whitespace-nowrap px-3.5 py-0 rounded-lg text-body font-semibold transition-all ${
                    activeTab === "completed"
                      ? "bg-green-500/10 text-green-600 border-2 border-green-500/30"
                      : "border-2 border-border-default bg-surface-base text-text-secondary hover:border-accent-primary hover:bg-accent-primary/5"
                  }`}
                >
                  Completed Jobs
                  <span
                    className={`px-2 py-0.5 rounded-full text-caption font-bold ${
                      activeTab === "completed"
                        ? "bg-green-600 text-white"
                        : "bg-text-muted/10 text-text-muted"
                    }`}
                  >
                    {completedJobs.length}
                  </span>
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === "failed" ? (
              <PlaygroundFailedJobsTable
                failedJobs={failedJobs}
                onRetry={handleRetry}
                onViewDetails={handleViewDetails}
              />
            ) : activeTab === "rate_limited" ? (
              <PlaygroundRateLimitedJobsTable
                rateLimitedJobs={rateLimitedJobs}
                onRetry={handleRetry}
                onViewDetails={handleViewDetails}
              />
            ) : (
              <PlaygroundCompletedJobsTable
                completedJobs={completedJobs}
                onViewDetails={handleViewDetails}
              />
            )}
          </div>
        </div>
      )}

      {/* Job Detail Modal */}
      <PlaygroundJobDetailModal
        job={selectedJob}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
