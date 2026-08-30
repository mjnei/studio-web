"use client";

import { useState, useEffect, useCallback } from "react";
import { Zap } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useToast } from "@/components/ui/toast";
import { TTSJobsPageHeader } from "@/app/(shell)/admin/tts-jobs/_shared/TTSJobsPageHeader";
import { TTSJobsTabBar } from "@/app/(shell)/admin/tts-jobs/_shared/TTSJobsTabBar";
import { TTSJobsAudioBar } from "@/app/(shell)/admin/tts-jobs/_shared/TTSJobsAudioBar";
import { downloadCsv } from "@/app/(shell)/admin/tts-jobs/_shared/formatters";
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
      }

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
    });

    downloadCsv(`tts-${activeTab}-jobs-${new Date().toISOString()}.csv`, headers, rows);
    toast.success("CSV exported", `${activeTab} jobs exported successfully`);
  };

  const tabs = [
    { id: "failed", label: "Failed Jobs", count: failedJobs.length, tone: "failed" as const },
    {
      id: "completed",
      label: "Completed Jobs",
      count: completedJobs.length,
      tone: "completed" as const,
    },
  ];

  return (
    <div className={`mx-auto max-w-7xl ${showAudioPlayer ? "pb-32" : ""}`}>
      <TTSJobsPageHeader
        icon={<Zap className="h-6 w-6 text-white" />}
        iconGradientClassName="bg-gradient-to-br from-accent-primary to-purple-600"
        title="Studio TTS Jobs"
        description="Monitor Studio project TTS job health and diagnose failures in real-time"
        autoRefresh={autoRefresh}
        isLoading={isLoading}
        lastRefresh={lastRefresh}
        exportDisabled={activeTab === "failed" ? !failedJobs.length : !completedJobs.length}
        onToggleAutoRefresh={() => setAutoRefresh(!autoRefresh)}
        onRefresh={() => loadData()}
        onExport={handleExportCSV}
      />

      {isLoading && !stats ? (
        <LoadingSpinner size="lg" message="Loading TTS job data..." fullHeight />
      ) : (
        <div className="space-y-6">
          {stats && <TTSStatsWidget stats={stats} />}
          {staleJobs.length > 0 && <StaleJobsAlert staleJobs={staleJobs} onCancel={handleCancel} />}

          <div>
            <TTSJobsTabBar
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={(tabId) => setActiveTab(tabId as TabType)}
            />

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

      {showAudioPlayer && currentAudio && (
        <TTSJobsAudioBar
          audioUrl={currentAudio.url}
          jobId={currentAudio.jobId}
          jobName={currentAudio.jobName}
          onDismiss={handleDismissPlayer}
        />
      )}

      <JobDetailModal job={selectedJob} open={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
