"use client";

import React from "react";
import { Download } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { VideoJob } from "@/types/jobs";

interface JobVideoModalProps {
  job: VideoJob | null;
  onClose: () => void;
}

export const JobVideoModal: React.FC<JobVideoModalProps> = ({ job, onClose }) => {
  const { t } = useI18n();

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
            {t("jobs.modal.close")}
          </Button>
          {job.video_url && (
            <Button
              variant="primary"
              leftIcon={<Download className="h-4 w-4" />}
              onClick={() => window.open(job.video_url!, "_blank")}
            >
              {t("jobs.modal.download")}
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
            {t("jobs.modal.noVideoUrl")}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-text-muted bg-surface-panel p-3 rounded-lg border border-border-default">
          <div>
            <span className="font-semibold text-text-secondary">{t("jobs.modal.voice")}:</span>{" "}
            {job.voice_name || t("jobs.modal.default")}
          </div>
          <div>
            <span className="font-semibold text-text-secondary">{t("jobs.modal.cost")}:</span>{" "}
            {job.credit_cost} {job.credit_cost !== 1 ? t("jobs.credits") : t("jobs.credit")}
          </div>
          <div>
            <span className="font-semibold text-text-secondary">{t("jobs.modal.attempt")}:</span> #
            {job.generation_attempt}
          </div>
          <div>
            <span className="font-semibold text-text-secondary">{t("jobs.modal.date")}:</span>{" "}
            {new Date(job.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    </Modal>
  );
};
