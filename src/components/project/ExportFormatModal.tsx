"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Heading } from "@/components/ui/heading";
import { Film, Download } from "lucide-react";
import { useI18n } from "@/i18n";

interface ExportFormatModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  onExport: (url: string) => void;
}

export function ExportFormatModal({ isOpen, onClose, videoUrl, onExport }: ExportFormatModalProps) {
  const { t } = useI18n();
  const [format, setFormat] = useState("mp4");
  const [resolution, setResolution] = useState("1920x1080");
  const [fps, setFps] = useState("30");
  const [quality, setQuality] = useState("high");

  const formatOptions = [
    { value: "mp4", label: t("project.exportModal.formatMp4"), icon: <Film className="h-4 w-4" /> },
    { value: "webm", label: t("project.exportModal.formatWebm"), disabled: true },
    { value: "mov", label: t("project.exportModal.formatMov"), disabled: true },
  ];

  const resolutionOptions = [
    { value: "3840x2160", label: t("project.exportModal.resolution4k") },
    { value: "1920x1080", label: t("project.exportModal.resolution1080") },
    { value: "1280x720", label: t("project.exportModal.resolution720") },
    { value: "854x480", label: t("project.exportModal.resolution480") },
  ];

  const fpsOptions = [
    { value: "60", label: t("project.exportModal.fps60") },
    { value: "30", label: t("project.exportModal.fps30") },
    { value: "24", label: t("project.exportModal.fps24") },
  ];

  const qualityOptions = [
    { value: "high", label: t("project.exportModal.qualityHigh") },
    { value: "medium", label: t("project.exportModal.qualityMedium") },
    { value: "low", label: t("project.exportModal.qualityLow") },
  ];

  const handleExport = () => {
    // In a real implementation, this would trigger a re-encoding job
    // For now, we just download the existing video
    onExport(videoUrl);
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={t("project.exportModal.title")}
      size="md"
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button
            variant="primary"
            size="md"
            leftIcon={<Download className="h-4 w-4" />}
            onClick={handleExport}
          >
            {t("project.exportModal.exportDownload")}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Format Selection */}
        <Select
          label={t("project.exportModal.format")}
          value={format}
          onChange={setFormat}
          options={formatOptions}
          helperText={t("project.exportModal.formatHelper")}
        />

        {/* Resolution Selection */}
        <Select
          label={t("project.exportModal.resolution")}
          value={resolution}
          onChange={setResolution}
          options={resolutionOptions}
          helperText={t("project.exportModal.resolutionHelper")}
        />

        {/* FPS Selection */}
        <Select
          label={t("project.exportModal.fps")}
          value={fps}
          onChange={setFps}
          options={fpsOptions}
          helperText={t("project.exportModal.fpsHelper")}
        />

        {/* Quality Selection */}
        <Select
          label={t("project.exportModal.quality")}
          value={quality}
          onChange={setQuality}
          options={qualityOptions}
          helperText={t("project.exportModal.qualityHelper")}
        />

        {/* Export Summary */}
        <div className="p-4 rounded-lg bg-surface-raised border border-border-default">
          <Heading variant="label" as="h4" className="text-text-primary mb-3 font-medium">
            {t("project.exportModal.summary")}
          </Heading>
          <div className="space-y-2 text-body">
            <div className="flex justify-between">
              <span className="text-text-secondary">{t("project.exportModal.summaryFormat")}</span>
              <span className="text-text-primary font-medium">
                {formatOptions.find((o) => o.value === format)?.label}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">
                {t("project.exportModal.summaryResolution")}
              </span>
              <span className="text-text-primary font-medium">
                {resolutionOptions.find((o) => o.value === resolution)?.label}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">{t("project.exportModal.summaryFps")}</span>
              <span className="text-text-primary font-medium">
                {fpsOptions.find((o) => o.value === fps)?.label}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">{t("project.exportModal.summaryQuality")}</span>
              <span className="text-text-primary font-medium">
                {qualityOptions.find((o) => o.value === quality)?.label}
              </span>
            </div>
          </div>
        </div>

        {/* Coming Soon Note */}
        <div className="p-3 rounded-lg bg-accent-cyan/5 border border-accent-cyan/20">
          <p className="text-caption text-accent-cyan">
            <strong>{t("project.exportModal.note")}</strong>{" "}
            {t("project.exportModal.comingSoonNote")}
          </p>
        </div>
      </div>
    </Modal>
  );
}
