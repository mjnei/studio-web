"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Heading } from "@/components/ui/heading";
import { Film, Download } from "lucide-react";

interface ExportFormatModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  onExport: (url: string) => void;
}

export function ExportFormatModal({ isOpen, onClose, videoUrl, onExport }: ExportFormatModalProps) {
  const [format, setFormat] = useState("mp4");
  const [resolution, setResolution] = useState("1920x1080");
  const [fps, setFps] = useState("30");
  const [quality, setQuality] = useState("high");

  const formatOptions = [
    { value: "mp4", label: "MP4 (H.264)", icon: <Film className="h-4 w-4" /> },
    { value: "webm", label: "WebM (VP9)", disabled: true },
    { value: "mov", label: "MOV (ProRes)", disabled: true },
  ];

  const resolutionOptions = [
    { value: "3840x2160", label: "4K (3840×2160)" },
    { value: "1920x1080", label: "Full HD (1920×1080)" },
    { value: "1280x720", label: "HD (1280×720)" },
    { value: "854x480", label: "SD (854×480)" },
  ];

  const fpsOptions = [
    { value: "60", label: "60 FPS" },
    { value: "30", label: "30 FPS" },
    { value: "24", label: "24 FPS (Cinematic)" },
  ];

  const qualityOptions = [
    { value: "high", label: "High Quality" },
    { value: "medium", label: "Medium Quality" },
    { value: "low", label: "Low Quality (Smaller file)" },
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
      title="Export Video"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            leftIcon={<Download className="h-4 w-4" />}
            onClick={handleExport}
          >
            Export & Download
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Format Selection */}
        <Select
          label="Format"
          value={format}
          onChange={setFormat}
          options={formatOptions}
          helperText="MP4 is currently the only supported format"
        />

        {/* Resolution Selection */}
        <Select
          label="Resolution"
          value={resolution}
          onChange={setResolution}
          options={resolutionOptions}
          helperText="Higher resolutions produce larger file sizes"
        />

        {/* FPS Selection */}
        <Select
          label="Frame Rate (FPS)"
          value={fps}
          onChange={setFps}
          options={fpsOptions}
          helperText="Higher frame rates create smoother motion"
        />

        {/* Quality Selection */}
        <Select
          label="Quality"
          value={quality}
          onChange={setQuality}
          options={qualityOptions}
          helperText="Higher quality means better visual fidelity but larger files"
        />

        {/* Export Summary */}
        <div className="p-4 rounded-lg bg-surface-raised border border-border-default">
          <Heading variant="label" as="h4" className="text-text-primary mb-3 font-medium">
            Export Summary
          </Heading>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Format:</span>
              <span className="text-text-primary font-medium">
                {formatOptions.find((o) => o.value === format)?.label}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Resolution:</span>
              <span className="text-text-primary font-medium">
                {resolutionOptions.find((o) => o.value === resolution)?.label}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Frame Rate:</span>
              <span className="text-text-primary font-medium">
                {fpsOptions.find((o) => o.value === fps)?.label}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Quality:</span>
              <span className="text-text-primary font-medium">
                {qualityOptions.find((o) => o.value === quality)?.label}
              </span>
            </div>
          </div>
        </div>

        {/* Coming Soon Note */}
        <div className="p-3 rounded-lg bg-accent-cyan/5 border border-accent-cyan/20">
          <p className="text-xs text-accent-cyan">
            <strong>Note:</strong> Advanced export options (resolution, FPS, quality) are coming
            soon. Currently, all exports use the original video settings.
          </p>
        </div>
      </div>
    </Modal>
  );
}
