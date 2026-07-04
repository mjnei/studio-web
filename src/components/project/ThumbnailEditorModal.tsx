"use client";

import { useState, useRef, useEffect } from "react";
import {
  X,
  Upload,
  Loader2,
  Check,
  Palette,
  AlignLeft,
  AlignRight,
  Sparkles,
  Minus,
  Plus,
  Droplets,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  regenerateThumbnail,
  uploadCustomThumbnail,
  finalizeThumbnail,
} from "@/lib/project-client";
import type { ProjectState } from "@/lib/hooks/use-project-state";

interface ThumbnailEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectState;
  onThumbnailFinalized: () => void;
}

// Font options
const FONT_OPTIONS = [
  { value: "bold", label: "Bold" },
  { value: "elegant", label: "Elegant" },
  { value: "modern", label: "Modern" },
];

// Color presets
const COLOR_PRESETS = [
  { value: "#FFFFFF", label: "White" },
  { value: "#000000", label: "Black" },
  { value: "#FF0000", label: "Red" },
  { value: "#00FF00", label: "Green" },
  { value: "#0000FF", label: "Blue" },
  { value: "#FFFF00", label: "Yellow" },
  { value: "#FF00FF", label: "Magenta" },
  { value: "#00FFFF", label: "Cyan" },
];

export function ThumbnailEditorModal({
  isOpen,
  onClose,
  project,
  onThumbnailFinalized,
}: ThumbnailEditorModalProps) {
  const [thumbnailText, setThumbnailText] = useState(
    project.thumbnailText || project.scriptSummary || ""
  );
  const [textPosition, setTextPosition] = useState<"left" | "right">(
    (project.thumbnailTextPosition as "left" | "right") || "left"
  );
  const [textFont, setTextFont] = useState(project.thumbnailTextFont || "bold");
  const [textColor, setTextColor] = useState(project.thumbnailTextColor || "#FFFFFF");
  const [textSize, setTextSize] = useState(project.thumbnailTextSize ?? 1.0);
  const [textBackgroundBlur, setTextBackgroundBlur] = useState(
    project.thumbnailTextBackgroundBlur ?? true
  );
  const [customPrompt, setCustomPrompt] = useState("");
  const [showPromptInput, setShowPromptInput] = useState(false);

  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [useCustom, setUseCustom] = useState(!!project.customThumbnailUrl);
  const [customPreviewUrl, setCustomPreviewUrl] = useState<string | null>(
    project.customThumbnailUrl || null
  );
  const [uploadWarning, setUploadWarning] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close modal when user clicks outside
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentThumbnailUrl = useCustom
    ? customPreviewUrl || project.customThumbnailUrl
    : project.thumbnailUrl;

  const handleRegenerateAI = async () => {
    if (!project.id) return;

    setIsRegenerating(true);
    try {
      await regenerateThumbnail(String(project.id), showPromptInput ? customPrompt : null);
      setUseCustom(false);
      setShowPromptInput(false);
      setCustomPrompt("");
      onThumbnailFinalized();
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
    setUploadWarning(null);

    try {
      const response = await uploadCustomThumbnail(String(project.id), file);

      // Show validation warning if any
      if (response.warning) {
        setUploadWarning(response.warning);
      }

      // Create local preview URL
      const previewUrl = URL.createObjectURL(file);
      setCustomPreviewUrl(previewUrl);
      setUseCustom(true);

      onThumbnailFinalized();
    } catch (error: any) {
      console.error("Failed to upload thumbnail:", error);
      alert(error.message || "Failed to upload thumbnail. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFinalize = async () => {
    if (!project.id) return;

    setIsFinalizing(true);
    try {
      // Queue the composition job (returns immediately with status='processing')
      await finalizeThumbnail(String(project.id), {
        thumbnailText,
        thumbnailTextPosition: textPosition,
        thumbnailTextFont: textFont,
        thumbnailTextColor: textColor,
        thumbnailTextSize: textSize,
        thumbnailTextBackgroundBlur: textBackgroundBlur,
        useCustom,
      });

      // Close modal immediately - composition happens in background
      onClose();

      // Trigger callback to start polling
      onThumbnailFinalized();
    } catch (error) {
      console.error("Failed to queue thumbnail composition:", error);
      alert("Failed to start thumbnail composition. Please try again.");
      setIsFinalizing(false);
    }
  };

  const hasThumbnail =
    (project.thumbnailStatus === "completed" && project.thumbnailUrl) || project.customThumbnailUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        className="relative w-full max-h-[90vh] overflow-y-auto mx-4"
        style={{ maxWidth: "788px" }}
      >
        <Card variant="elevated" padding="none" className="bg-surface-base">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border-default bg-surface-base">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-cyan-muted">
                <Sparkles className="h-4 w-4 text-accent-cyan" />
              </div>
              <h2 className="text-lg font-semibold text-text-primary">Thumbnail Editor</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={<X className="h-5 w-5" />}
              onClick={onClose}
              className="flex-shrink-0"
            />
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 space-y-4">
            {/* Text Input */}
            <div>
              <input
                type="text"
                value={thumbnailText}
                onChange={(e) => setThumbnailText(e.target.value)}
                placeholder="Enter overlay text (optional, max 200 chars)"
                maxLength={200}
                className="w-full rounded-lg border border-border-default bg-surface-base px-4 py-2.5 text-base text-text-primary placeholder-text-muted focus:border-accent-cyan focus:outline-none focus:ring-2 focus:ring-accent-cyan/20 transition-all"
              />
            </div>

            {/* Compact Controls Row */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 pb-2 border-b border-border-default">
              {/* Position Toggle */}
              <div className="flex gap-1 border border-border-default rounded-lg overflow-hidden">
                <button
                  onClick={() => setTextPosition("left")}
                  className={`p-2 transition-colors ${
                    textPosition === "left"
                      ? "bg-accent-cyan text-white"
                      : "bg-surface-raised text-text-muted hover:bg-surface-base"
                  }`}
                  title="Align Left"
                >
                  <AlignLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setTextPosition("right")}
                  className={`p-2 transition-colors ${
                    textPosition === "right"
                      ? "bg-accent-cyan text-white"
                      : "bg-surface-raised text-text-muted hover:bg-surface-base"
                  }`}
                  title="Align Right"
                >
                  <AlignRight className="h-4 w-4" />
                </button>
              </div>

              {/* Font Size Controls */}
              <div className="flex items-center gap-1 border border-border-default rounded-lg overflow-hidden bg-surface-raised">
                <button
                  onClick={() => setTextSize(Math.max(0.8, textSize - 0.1))}
                  disabled={textSize <= 0.8}
                  className="p-2 hover:bg-surface-base disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Decrease Font Size"
                >
                  <Minus className="h-4 w-4 text-text-secondary" />
                </button>
                <span className="px-2 text-xs font-medium text-text-primary min-w-[3rem] text-center">
                  {textSize.toFixed(1)}x
                </span>
                <button
                  onClick={() => setTextSize(Math.min(2.0, textSize + 0.1))}
                  disabled={textSize >= 2.0}
                  className="p-2 hover:bg-surface-base disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Increase Font Size"
                >
                  <Plus className="h-4 w-4 text-text-secondary" />
                </button>
              </div>

              {/* Font Selector */}
              <select
                value={textFont}
                onChange={(e) => setTextFont(e.target.value)}
                className="px-3 py-2 rounded-lg border border-border-default bg-surface-raised text-sm text-text-primary focus:border-accent-cyan focus:outline-none focus:ring-2 focus:ring-accent-cyan/20 transition-all cursor-pointer"
                title="Font Style"
              >
                {FONT_OPTIONS.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </select>

              {/* Color Picker */}
              <div className="flex items-center gap-2 border border-border-default rounded-lg overflow-hidden bg-surface-raised">
                <div className="p-1.5">
                  <Palette className="h-4 w-4 text-text-muted" />
                </div>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-8 h-8 cursor-pointer border-0 bg-transparent"
                  title="Text Color"
                />
                <select
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="pr-3 py-2 text-sm text-text-primary bg-transparent border-0 focus:outline-none cursor-pointer"
                >
                  {COLOR_PRESETS.map((preset) => (
                    <option key={preset.value} value={preset.value}>
                      {preset.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Background Blur Toggle */}
              <button
                onClick={() => setTextBackgroundBlur(!textBackgroundBlur)}
                className={`p-2 rounded-lg border transition-colors ${
                  textBackgroundBlur
                    ? "border-accent-cyan bg-accent-cyan text-white"
                    : "border-border-default bg-surface-raised text-text-muted hover:bg-surface-base"
                }`}
                title={textBackgroundBlur ? "Blur Enabled" : "Blur Disabled"}
              >
                <Droplets className="h-4 w-4" />
              </button>

              {/* Spacer */}
              <div className="flex-1 min-w-[1rem]" />

              {/* AI Regenerate (icon only) */}
              <Button
                variant="secondary"
                size="sm"
                icon={<Sparkles className="h-4 w-4" />}
                onClick={() => setShowPromptInput(!showPromptInput)}
                disabled={isRegenerating || isUploading}
                className="p-2"
                title="Regenerate with AI"
              />

              {/* Upload (icon only) */}
              <Button
                variant="secondary"
                size="sm"
                icon={<Upload className="h-4 w-4" />}
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || isRegenerating}
                className="p-2"
                title="Upload Custom Image"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleUploadCustom}
                className="hidden"
              />
            </div>

            {/* Custom Prompt (Collapsible) */}
            {showPromptInput && (
              <div className="space-y-2 pt-2">
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Enter custom prompt (optional, leave empty for default)"
                  rows={3}
                  className="w-full rounded-lg border border-border-default bg-surface-base px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:border-accent-cyan focus:outline-none focus:ring-2 focus:ring-accent-cyan/20 transition-all resize-none"
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleRegenerateAI}
                  disabled={isRegenerating}
                  className="w-full sm:w-auto"
                >
                  {isRegenerating ? "Generating..." : "Generate"}
                </Button>
              </div>
            )}

            {/* Live Preview */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-text-muted uppercase tracking-wide">
                Live Preview
              </label>
              <label className="text-sm font-medium text-text-secondary">Live Preview</label>
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
                  <>
                    <img
                      src={currentThumbnailUrl}
                      alt="Project thumbnail"
                      className="w-full h-full object-cover"
                    />

                    {/* Text Overlay Preview (Client-side simulation) */}
                    {thumbnailText && (
                      <div
                        className={`absolute inset-0 flex items-center ${
                          textPosition === "left" ? "justify-start pl-[5%]" : "justify-end pr-[5%]"
                        } pointer-events-none`}
                      >
                        <div
                          className={`w-[45%] px-4 py-3 rounded-lg ${
                            textBackgroundBlur ? "bg-black/40 backdrop-blur-sm" : "bg-transparent"
                          }`}
                        >
                          <p
                            className={`text-center font-${textFont === "bold" ? "bold" : textFont === "elegant" ? "serif" : "sans"} leading-tight`}
                            style={{
                              color: textColor,
                              fontSize: `clamp(${textSize}rem, ${textSize * 3}vw, ${textSize * 2}rem)`,
                              textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                            }}
                          >
                            {thumbnailText}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-text-muted">
                    <div className="text-center">
                      <Sparkles className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No thumbnail available</p>
                      <p className="text-xs">Generate AI thumbnail or upload custom image</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Warning */}
              {uploadWarning && (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 mt-2">
                  <p className="text-xs text-amber-400">{uploadWarning}</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-t border-border-default bg-surface-base">
            <Button variant="ghost" size="md" onClick={onClose} className="flex-shrink-0">
              Cancel
            </Button>

            <Button
              variant="primary"
              size="md"
              icon={<Check className="h-4 w-4" />}
              onClick={handleFinalize}
              disabled={!hasThumbnail || isFinalizing}
              className="flex-1 sm:flex-initial"
            >
              {isFinalizing ? "Finalizing..." : "Save & Finalize"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
