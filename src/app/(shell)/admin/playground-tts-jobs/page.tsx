"use client";

import { useState, useEffect, useCallback } from "react";
import { Gamepad2, ShieldAlert } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useToast } from "@/components/ui/toast";
import { TTSJobsPageHeader } from "@/app/(shell)/admin/tts-jobs/_shared/TTSJobsPageHeader";
import { TTSJobsTabBar } from "@/app/(shell)/admin/tts-jobs/_shared/TTSJobsTabBar";
import { TTSJobsAudioBar } from "@/app/(shell)/admin/tts-jobs/_shared/TTSJobsAudioBar";
import { downloadCsv } from "@/app/(shell)/admin/tts-jobs/_shared/formatters";
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
  const [currentAudio, setCurrentAudio] = useState<{
    url: string;
    jobId: string;
    jobName: string;
  } | null>(null);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);

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
    const ttsJob: PlaygroundTTSJob = {
      id: job.id,
      job_id: job.job_id,
      status: job.status,
      created_at: job.created_at,
      completed_at: job.completed_at,
      expires_at: "",
      error_message: "error_message" in job ? job.error_message : undefined,
      voice_id: job.voice_id,
      anonymous_voice_id: job.anonymous_voice_id,
      text: job.text,
      language: "",
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

  const handlePlayAudio = (job: PlaygroundCompletedJob) => {
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

  const voiceLabel = (job: { voice_id?: number; anonymous_voice_id?: number }) =>
    job.voice_id ? `Voice ${job.voice_id}` : `Anon ${job.anonymous_voice_id}`;

  const handleExportCSV = () => {
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

    downloadCsv(`playground-tts-${activeTab}-jobs-${new Date().toISOString()}.csv`, headers, rows);
    toast.success("CSV exported", `${activeTab} playground jobs exported successfully`);
  };

  const tabs = [
    { id: "failed", label: "Failed Jobs", count: failedJobs.length, tone: "failed" as const },
    {
      id: "completed",
      label: "Completed Jobs",
      count: completedJobs.length,
      tone: "completed" as const,
    },
    {
      id: "rate_limited",
      label: "Rate Limited",
      count: rateLimitedJobs.length,
      tone: "rate_limited" as const,
      icon: <ShieldAlert className="h-4 w-4" />,
    },
  ];

  const exportDisabled =
    (activeTab === "failed" && !failedJobs.length) ||
    (activeTab === "rate_limited" && !rateLimitedJobs.length) ||
    (activeTab === "completed" && !completedJobs.length);

  return (
    <div className={`mx-auto max-w-7xl ${showAudioPlayer ? "pb-32" : ""}`}>
      <TTSJobsPageHeader
        icon={<Gamepad2 className="h-6 w-6 text-white" />}
        iconGradientClassName="bg-gradient-to-br from-purple-500 to-pink-600"
        title="Playground TTS Jobs"
        description="Track anonymous user activity, rate limiting, abuse patterns, and resource usage"
        autoRefresh={autoRefresh}
        isLoading={isLoading}
        lastRefresh={lastRefresh}
        exportDisabled={exportDisabled}
        onToggleAutoRefresh={() => setAutoRefresh(!autoRefresh)}
        onRefresh={() => loadData()}
        onExport={handleExportCSV}
      />

      {isLoading && !stats ? (
        <LoadingSpinner size="lg" message="Loading playground TTS job data..." fullHeight />
      ) : (
        <div className="space-y-6">
          {stats && <PlaygroundStatsWidget stats={stats} />}
          {staleJobs.length > 0 && (
            <PlaygroundStaleJobsAlert staleJobs={staleJobs} onCancel={handleCancel} />
          )}

          <div>
            <TTSJobsTabBar
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={(tabId) => setActiveTab(tabId as TabType)}
            />

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
                onPlay={handlePlayAudio}
              />
            )}
          </div>
        </div>
      )}

      {showAudioPlayer && currentAudio && (
        <TTSJobsAudioBar
          audioUrl={currentAudio.url}
          jobId={currentAudio.jobId}
          jobName={currentAudio.jobName}
          onDismiss={handleDismissPlayer}
        />
      )}

      <PlaygroundJobDetailModal
        job={selectedJob}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
