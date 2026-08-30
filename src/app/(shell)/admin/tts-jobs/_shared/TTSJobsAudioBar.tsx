"use client";

import { AudioPlayer } from "@/app/(shell)/admin/playground/components/AudioPlayer";

interface TTSJobsAudioBarProps {
  audioUrl: string;
  jobId: string;
  jobName: string;
  onDismiss: () => void;
}

export function TTSJobsAudioBar({ audioUrl, jobId, jobName, onDismiss }: TTSJobsAudioBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border-default bg-surface-base/95 backdrop-blur-lg shadow-2xl">
      <div className="mx-auto max-w-7xl px-4 py-2">
        <AudioPlayer
          audioUrl={audioUrl}
          jobId={jobId}
          jobName={jobName}
          onDismiss={onDismiss}
        />
      </div>
    </div>
  );
}
