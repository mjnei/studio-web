"use client";

import { useState, useRef } from "react";
import { Image, Upload, RefreshCw, Loader2, Check, Type } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  regenerateThumbnail,
  uploadCustomThumbnail,
  finalizeThumbnail,
} from "@/lib/project-client";
import type { ProjectState } from "@/lib/hooks/use-project-state";

interface ThumbnailEditorProps {
  project: ProjectState;
  onThumbnailFinalized: () => void;
}

export function ThumbnailEditor({ project, onThumbnailFinalized }: ThumbnailEditorProps) {
  const [thumbnailText, setThumbnailText] = useState(
    project.thumbnailText || project.scriptSummary || ""
  );
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [useCustom, setUseCustom] = useState(!!project.customThumbnailUrl);
  const [customPreviewUrl, setCustomPreviewUrl] = useState<string | null>(
    project.customThumbnailUrl || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentThumbnailUrl = useCustom
    ? customPreviewUrl || project.customThumbnailUrl
    : project.thumbnailUrl;

  const handleRegenerateAI = async () => {
    if (!project.id) return;

    setIsRegenerating(true);
    try {
      await regenerateThumbnail(String(project.id));
      // Switch to AI-generated thumbnail
      setUseCustom(false);
      // Polling will update the thumbnail_url when ready
      onThumbnailFinalized(); // Refresh project state
    } catch (error) {
      console.error("Failed to regenerate thumbnail:", error);
      alert("Failed to regenerate thumbnail. Please try again.");
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleUploadCustom = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !project.id) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (JPG, PNG, or WEBP)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      const response = await uploadCustomThumbnail(String(project.id), file);

      // Create local preview URL
      const previewUrl = URL.createObjectURL(file);
      setCustomPreviewUrl(previewUrl);
      setUseCustom(true);

      onThumbnailFinalized(); // Refresh project state
    } catch (error) {
      console.error("Failed to upload thumbnail:", error);
      alert("Failed to upload thumbnail. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFinalize = async () => {
    if (!project.id) return;

    setIsFinalizing(true);
    try {
      await finalizeThumbnail(String(project.id), {
        thumbnailText,
        useCustom,
      });

      onThumbnailFinalized(); // Refresh project state and navigate
    } catch (error) {
      console.error("Failed to finalize thumbnail:", error);
      alert("Failed to finalize thumbnail. Please try again.");
    } finally {
      setIsFinalizing(false);
    }
  };

  const hasThumbnail =
    (project.thumbnailStatus === "completed" && project.thumbnailUrl) || project.customThumbnailUrl;

  return (
    <Card variant="elevated" padding="lg" className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-cyan-muted">
          <Image className="h-5 w-5 text-accent-cyan" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-text-primary">Thumbnail Customization</h3>
          <p className="text-sm text-text-muted">
            Customize your project thumbnail before generating the video
          </p>
        </div>
      </div>

      {/* Thumbnail Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-text-secondary">Base Image</label>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                useCustom
                  ? "bg-accent-purple/10 text-accent-purple"
                  : "bg-accent-cyan/10 text-accent-cyan"
              }`}
            >
              {useCustom ? "Custom Upload" : "AI Generated"}
            </span>
          </div>
        </div>

        <div className="relative aspect-video rounded-lg overflow-hidden bg-surface-raised border-2 border-border-default">
          {isRegenerating && !useCustom && (
            <div className="absolute inset-0 flex items-center justify-center bg-surface-base/80 z-10">
              <div className="text-center">
                <Loader2 className="h-8 w-8 text-accent-cyan animate-spin mx-auto mb-2" />
                <p className="text-sm text-text-muted">Generating new thumbnail...</p>
              </div>
            </div>
          )}

          {project.thumbnailStatus === "generating" && !useCustom && !isRegenerating && (
            <div className="absolute inset-0 flex items-center justify-center bg-surface-base/80 z-10">
              <div className="text-center">
                <Loader2 className="h-8 w-8 text-accent-cyan animate-spin mx-auto mb-2" />
                <p className="text-sm text-text-muted">AI is generating your thumbnail...</p>
              </div>
            </div>
          )}

          {hasThumbnail && currentThumbnailUrl ? (
            <img
              src={currentThumbnailUrl}
              alt="Project thumbnail"
              className="w-full h-full object-cover"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.style.display = "none";
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-text-muted">
              <div className="text-center">
                <Image className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No thumbnail available</p>
              </div>
            </div>
          )}

          {/* Text Overlay Preview */}
          {thumbnailText && hasThumbnail && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-black/60 backdrop-blur-sm px-6 py-3 rounded-lg">
                <p className="text-white text-2xl font-bold text-center">{thumbnailText}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Thumbnail Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button
          variant="secondary"
          size="md"
          icon={<RefreshCw className="h-4 w-4" />}
          onClick={handleRegenerateAI}
          disabled={isRegenerating || isUploading}
          className="w-full"
        >
          {isRegenerating ? "Regenerating..." : "Regenerate AI Thumbnail"}
        </Button>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleUploadCustom}
            className="hidden"
          />
          <Button
            variant="secondary"
            size="md"
            icon={<Upload className="h-4 w-4" />}
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isRegenerating}
            className="w-full"
          >
            {isUploading ? "Uploading..." : "Upload Custom Image"}
          </Button>
        </div>
      </div>

      {/* Text Overlay Editor */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Type className="h-4 w-4 text-accent-cyan" />
          <label className="text-sm font-medium text-text-secondary">Text Overlay</label>
        </div>

        <input
          type="text"
          value={thumbnailText}
          onChange={(e) => setThumbnailText(e.target.value)}
          placeholder="Enter overlay text (optional)"
          maxLength={200}
          className="w-full rounded-lg border border-border-default bg-surface-base px-4 py-2.5 text-text-primary placeholder-text-muted focus:border-accent-cyan focus:outline-none focus:ring-2 focus:ring-accent-cyan/20 transition-all"
        />

        <p className="text-xs text-text-muted">
          {thumbnailText.length}/200 characters • This text will overlay on your thumbnail
        </p>
      </div>

      {/* Finalize Button */}
      <div className="pt-4 border-t border-border-default">
        <Button
          variant="primary"
          size="lg"
          icon={project.thumbnailConfirmed ? <Check className="h-4 w-4" /> : undefined}
          onClick={handleFinalize}
          disabled={!hasThumbnail || isFinalizing}
          className="w-full"
        >
          {isFinalizing
            ? "Finalizing..."
            : project.thumbnailConfirmed
              ? "Thumbnail Confirmed"
              : "Confirm Thumbnail"}
        </Button>

        {!hasThumbnail && (
          <p className="mt-2 text-xs text-center text-text-muted">
            Generate an AI thumbnail or upload a custom image first
          </p>
        )}

        {project.thumbnailConfirmed && (
          <p className="mt-2 text-xs text-center text-status-success">
            ✓ Thumbnail confirmed and ready for video generation
          </p>
        )}
      </div>
    </Card>
  );
}
