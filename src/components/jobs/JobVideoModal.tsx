"use client";

import React from "react";
import { Download } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { VideoJob } from "@/types/jobs";

interface JobVideoModalProps {
  job: VideoJob | null;
  onClose: () => void;
}

export const JobVideoModal: React.FC<JobVideoModalProps> = ({ job, onClose }) => {
  if (!job) return null;

  return (
    <Modal
      open={!!job}
      onClose={onClose}
      title={job.projectName}
      description={job.movieTitle || undefined}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          {job.video_url && (
            <Button
              variant="primary"
              leftIcon={<Download className="h-4 w-4" />}
              onClick={() => window.open(job.video_url!, "_blank")}
            >
              Download Video
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-4">
        {job.video_url ? (
          <div className="relative aspect-video w-full rounded-lg bg-black overflow-hidden border border-border-default">
            <video src={job.video_url} controls autoPlay className="w-full h-full object-contain" />
          </div>
        ) : (
          <div className="aspect-video w-full rounded-lg bg-surface-panel flex items-center justify-center text-text-muted">
            No video playback URL available
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-text-muted bg-surface-panel p-3 rounded-lg border border-border-default">
          <div>
            <span className="font-semibold text-text-secondary">Voice:</span>{" "}
            {job.voice_name || "Default"}
          </div>
          <div>
            <span className="font-semibold text-text-secondary">Cost:</span> {job.credit_cost}{" "}
            credit{job.credit_cost !== 1 ? "s" : ""}
          </div>
          <div>
            <span className="font-semibold text-text-secondary">Attempt:</span> #
            {job.generation_attempt}
          </div>
          <div>
            <span className="font-semibold text-text-secondary">Date:</span>{" "}
            {new Date(job.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    </Modal>
  );
};
