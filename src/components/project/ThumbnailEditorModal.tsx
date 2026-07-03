"use client";

import { useState, useRef, useEffect } from "react";
import { X, Upload, RefreshCw, Loader2, Check, Type, Palette, AlignLeft, AlignRight, Sparkles } from "lucide-react";
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
      await finalizeThumbnail(String(project.id), {
        thumbnailText,
        thumbnailTextPosition: textPosition,
        thumbnailTextFont: textFont,
        thumbnailTextColor: textColor,
        useCustom,
      });

      onThumbnailFinalized();
      onClose();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto mx-4">
        <Card variant="elevated" padding="none" className="bg-surface-base">
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-border-default bg-surface-base">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-cyan-muted">
                <Sparkles className="h-5 w-5 text-accent-cyan" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-text-primary">Thumbnail Editor</h2>
                <p className="text-sm text-text-muted">Customize your project thumbnail</p>
              </div>
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
          <div className="p-6 space-y-6">
            {/* Live Preview */}
            <div className="space-y-3">
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
                        <div className="w-[45%] px-4 py-3 bg-black/40 backdrop-blur-sm rounded-lg">
                          <p
                            className={`text-center font-${textFont === "bold" ? "bold" : textFont === "elegant" ? "serif" : "sans"} leading-tight`}
                            style={{
                              color: textColor,
                              fontSize: "clamp(1rem, 3vw, 2rem)",
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
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
                  <p className="text-sm text-amber-400">{uploadWarning}</p>
                </div>
              )}
            </div>

            {/* Base Image Controls */}
            <div className="space-y-4">
              <h3 className="text-base font-medium text-text-primary flex items-center gap-2">
                <Upload className="h-4 w-4 text-accent-cyan" />
                Base Image
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Regenerate AI Thumbnail */}
                <div className="space-y-2">
                  <Button
                    variant="secondary"
                    size="md"
                    icon={<RefreshCw className="h-4 w-4" />}
                    onClick={() => setShowPromptInput(!showPromptInput)}
                    disabled={isRegenerating || isUploading}
                    className="w-full"
                  >
                    Regenerate with AI
                  </Button>
                  
                  {showPromptInput && (
                    <div className="space-y-2">
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
                        className="w-full"
                      >
                        {isRegenerating ? "Generating..." : "Generate"}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Upload Custom Image */}
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
                  <p className="mt-2 text-xs text-text-muted">
                    Min: 1280x720px | 16:9 ratio recommended | Max: 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* Text Overlay Controls */}
            <div className="space-y-4">
              <h3 className="text-base font-medium text-text-primary flex items-center gap-2">
                <Type className="h-4 w-4 text-accent-cyan" />
                Text Overlay
              </h3>

              {/* Text Content */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Text Content</label>
                <input
                  type="text"
                  value={thumbnailText}
                  onChange={(e) => setThumbnailText(e.target.value)}
                  placeholder="Enter overlay text (optional)"
                  maxLength={200}
                  className="w-full rounded-lg border border-border-default bg-surface-base px-4 py-2.5 text-text-primary placeholder-text-muted focus:border-accent-cyan focus:outline-none focus:ring-2 focus:ring-accent-cyan/20 transition-all"
                />
                <p className="text-xs text-text-muted">{thumbnailText.length}/200 characters</p>
              </div>

              {/* Position, Font, Color */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Position */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Position</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={textPosition === "left" ? "primary" : "secondary"}
                      size="sm"
                      icon={<AlignLeft className="h-4 w-4" />}
                      onClick={() => setTextPosition("left")}
                      className="w-full"
                    >
                      Left
                    </Button>
                    <Button
                      variant={textPosition === "right" ? "primary" : "secondary"}
                      size="sm"
                      icon={<AlignRight className="h-4 w-4" />}
                      onClick={() => setTextPosition("right")}
                      className="w-full"
                    >
                      Right
                    </Button>
                  </div>
                </div>

                {/* Font */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Font</label>
                  <select
                    value={textFont}
                    onChange={(e) => setTextFont(e.target.value)}
                    className="w-full rounded-lg border border-border-default bg-surface-base px-4 py-2.5 text-text-primary focus:border-accent-cyan focus:outline-none focus:ring-2 focus:ring-accent-cyan/20 transition-all"
                  >
                    {FONT_OPTIONS.map((font) => (
                      <option key={font.value} value={font.value}>
                        {font.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Color */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-12 h-10 rounded border border-border-default cursor-pointer"
                    />
                    <select
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="flex-1 rounded-lg border border-border-default bg-surface-base px-3 py-2 text-sm text-text-primary focus:border-accent-cyan focus:outline-none focus:ring-2 focus:ring-accent-cyan/20 transition-all"
                    >
                      {COLOR_PRESETS.map((preset) => (
                        <option key={preset.value} value={preset.value}>
                          {preset.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 flex items-center justify-between gap-4 px-6 py-4 border-t border-border-default bg-surface-base">
            <Button variant="ghost" size="md" onClick={onClose} className="flex-shrink-0">
              Cancel
            </Button>
            
            <Button
              variant="primary"
              size="lg"
              icon={<Check className="h-4 w-4" />}
              onClick={handleFinalize}
              disabled={!hasThumbnail || isFinalizing}
              className="flex-1 sm:flex-initial"
            >
              {isFinalizing ? "Finalizing..." : "Save & Finalize Thumbnail"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
