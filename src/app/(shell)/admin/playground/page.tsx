"use client";

import { useState, useEffect, useCallback } from "react";
import { Play, Trash2 } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useToast } from "@/components/ui/toast";
import { ConfirmModal } from "@/components/ui/modal";
import { PlaygroundForm } from "./components/PlaygroundForm";
import { AudioPlayer } from "./components/AudioPlayer";
import { JobHistory } from "./components/JobHistory";
import {
  createPlaygroundTTSJob,
  getPlaygroundJob,
  getPlaygroundHistory,
  deletePlaygroundJob,
  clearPlaygroundHistory,
} from "@/lib/api/playground-client";
import type { PlaygroundTTSRequest, PlaygroundJob } from "@/types/admin";

export default function PlaygroundPage() {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [currentJob, setCurrentJob] = useState<PlaygroundJob | null>(null);
  const [history, setHistory] = useState<PlaygroundJob[]>([]);
  const [clearHistoryModal, setClearHistoryModal] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  const loadHistory = useCallback(async () => {
    try {
      const jobs = await getPlaygroundHistory(20);
      setHistory(jobs);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An error occurred";
      console.error("Failed to load history:", message);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const jobs = await getPlaygroundHistory(20);
        if (isMounted) {
          setHistory(jobs);
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "An error occurred";
        console.error("Failed to load history:", message);
      } finally {
        if (isMounted) {
          setIsLoadingHistory(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  // Poll for job status updates
  const startPolling = useCallback(
    (jobId: string) => {
      const interval = setInterval(async () => {
        try {
          const job = await getPlaygroundJob(jobId);
          setCurrentJob(job);

          if (job.status === "completed" || job.status === "failed") {
            if (pollingInterval) {
              clearInterval(pollingInterval);
              setPollingInterval(null);
            }
            await loadHistory();

            if (job.status === "completed") {
              toast.success("Audio generated", "Your TTS audio is ready to play");
            } else {
              toast.error("Generation failed", job.error || "Failed to generate audio");
            }
          }
        } catch (error) {
          console.error("Failed to poll job status:", error);
          if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
          }
        }
      }, 2000);

      setPollingInterval(interval);
    },
    [pollingInterval, loadHistory, toast]
  );

  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const handleSubmit = async (data: PlaygroundTTSRequest) => {
    setIsLoading(true);
    try {
      const job = await createPlaygroundTTSJob(data);
      setCurrentJob(job);
      toast.success("Job created", "Generating TTS audio...");
      startPolling(job.id);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An error occurred";
      toast.error("Failed to create TTS job", message);
      setIsLoading(false);
    } finally {
      // Keep loading state until job completes
    }
  };

  const handlePlayFromHistory = (job: PlaygroundJob) => {
    setCurrentJob(job);
    toast.success("Audio loaded", "Playing audio from history");
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      await deletePlaygroundJob(jobId);
      toast.success("Job deleted", "Playground job removed from history");
      await loadHistory();
      if (currentJob?.id === jobId) {
        setCurrentJob(null);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An error occurred";
      toast.error("Failed to delete job", message);
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearPlaygroundHistory();
      toast.success("History cleared", "All playground jobs have been removed");
      setHistory([]);
      setCurrentJob(null);
      setClearHistoryModal(false);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An error occurred";
      toast.error("Failed to clear history", message);
    }
  };

  // Update loading state when job completes
  useEffect(() => {
    if (currentJob && (currentJob.status === "completed" || currentJob.status === "failed")) {
      setIsLoading(false);
    }
  }, [currentJob]);

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-accent-primary to-purple-600 shadow-lg">
            <Play className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary">TTS Playground</h1>
        </div>
        <p className="text-text-secondary">
          Test TTS functionality without creating a full project
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Form */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border-default bg-surface-panel p-6">
            <h2 className="text-lg font-bold text-text-primary mb-4">Generate TTS Audio</h2>
            <PlaygroundForm onSubmit={handleSubmit} isLoading={isLoading} />
          </div>

          {/* Audio Player */}
          {currentJob?.status === "completed" && currentJob.audio_url && (
            <AudioPlayer audioUrl={currentJob.audio_url} jobId={currentJob.id} />
          )}

          {/* Processing Status */}
          {currentJob && (currentJob.status === "pending" || currentJob.status === "queued" || currentJob.status === "processing") && (
            <div className="rounded-xl border border-border-default bg-surface-panel p-6">
              <div className="flex items-center gap-4">
                <LoadingSpinner size="md" />
                <div>
                  <h3 className="text-sm font-semibold text-text-primary mb-1">
                    Processing Audio
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Status: {currentJob.status} • This usually takes 10-30 seconds
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Failed Status */}
          {currentJob?.status === "failed" && (
            <div className="rounded-xl border-2 border-red-500/50 bg-red-500/10 p-6">
              <h3 className="text-sm font-semibold text-red-600 mb-2">Generation Failed</h3>
              <p className="text-xs text-red-600">{currentJob.error || "Unknown error occurred"}</p>
            </div>
          )}
        </div>

        {/* Right Column: History */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-text-primary">Job History</h2>
              {history.length > 0 && (
                <button
                  onClick={() => setClearHistoryModal(true)}
                  className="flex items-center gap-2 rounded-lg border border-border-default bg-surface-base px-3 py-2 text-xs font-medium text-text-secondary hover:border-red-500 hover:text-red-600 hover:bg-red-500/5 transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear History
                </button>
              )}
            </div>

            {isLoadingHistory ? (
              <LoadingSpinner size="md" message="Loading history..." />
            ) : (
              <JobHistory
                jobs={history}
                onPlay={handlePlayFromHistory}
                onDelete={handleDeleteJob}
              />
            )}
          </div>
        </div>
      </div>

      {/* Clear History Confirmation Modal */}
      <ConfirmModal
        open={clearHistoryModal}
        onClose={() => setClearHistoryModal(false)}
        onConfirm={handleClearHistory}
        title="Clear Playground History"
        description="Are you sure you want to clear all playground job history? This action cannot be undone."
        confirmText="Clear History"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
