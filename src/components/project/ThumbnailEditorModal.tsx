"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  Upload,
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
import { Modal } from "@/components/ui/modal";
import { Spinner } from "@/components/ui/spinner";
import {
  regenerateThumbnail,
  uploadCustomThumbnail,
  finalizeThumbnail,
} from "@/lib/project-client";
import type { ProjectState } from "@/lib/hooks/use-project-state";
import { useI18n } from "@/i18n";

interface ThumbnailEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectState;
  onThumbnailFinalized: () => void;
}

export function ThumbnailEditorModal({
  isOpen,
  onClose,
  project,
  onThumbnailFinalized,
}: ThumbnailEditorModalProps) {
  const { t } = useI18n();

  const FONT_OPTIONS = [
    { value: "bold", label: t("project.thumbnailEditor.fontBold") },
    { value: "elegant", label: t("project.thumbnailEditor.fontElegant") },
    { value: "modern", label: t("project.thumbnailEditor.fontModern") },
  ];

  const COLOR_PRESETS = [
    { value: "#FFFFFF", label: t("project.thumbnailEditor.colorWhite") },
    { value: "#000000", label: t("project.thumbnailEditor.colorBlack") },
    { value: "#FF0000", label: t("project.thumbnailEditor.colorRed") },
    { value: "#00FF00", label: t("project.thumbnailEditor.colorGreen") },
    { value: "#0000FF", label: t("project.thumbnailEditor.colorBlue") },
    { value: "#FFFF00", label: t("project.thumbnailEditor.colorYellow") },
    { value: "#FF00FF", label: t("project.thumbnailEditor.colorMagenta") },
    { value: "#00FFFF", label: t("project.thumbnailEditor.colorCyan") },
  ];

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
      alert(t("project.thumbnailEditor.regenFailed"));
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleUploadCustom = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !project.id) return;

    if (!file.type.startsWith("image/")) {
      alert(t("project.thumbnailEditor.uploadImageOnly"));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert(t("project.thumbnailEditor.imageTooLarge"));
      return;
    }

    setIsUploading(true);
    setUploadWarning(null);

    try {
      const response = await uploadCustomThumbnail(String(project.id), file);

      if (response.warning) {
        setUploadWarning(response.warning);
      }

      const previewUrl = URL.createObjectURL(file);
      setCustomPreviewUrl(previewUrl);
      setUseCustom(true);

      onThumbnailFinalized();
    } catch (error: any) {
      console.error("Failed to upload thumbnail:", error);
      alert(error.message || t("project.thumbnailEditor.uploadFailed"));
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
        thumbnailTextSize: textSize,
        thumbnailTextBackgroundBlur: textBackgroundBlur,
        useCustom,
      });

      onClose();
      onThumbnailFinalized();
    } catch (error) {
      console.error("Failed to queue thumbnail composition:", error);
      alert(t("project.thumbnailEditor.composeFailed"));
      setIsFinalizing(false);
    }
  };

  const hasThumbnail =
    (project.thumbnailStatus === "completed" && project.thumbnailUrl) || project.customThumbnailUrl;

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={t("project.thumbnailEditor.title")}
      size="xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isFinalizing}>
            {t("common.cancel")}
          </Button>
          <Button
            variant="primary"
            size="md"
            leftIcon={<Check className="h-4 w-4" />}
            onClick={handleFinalize}
            disabled={!hasThumbnail || isFinalizing}
            loading={isFinalizing}
          >
            {isFinalizing
              ? t("project.thumbnailEditor.finalizing")
              : t("project.thumbnailEditor.saveAndFinalize")}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Text Input */}
        <div>
          <input
            type="text"
            value={thumbnailText}
            onChange={(e) => setThumbnailText(e.target.value)}
            placeholder={t("project.thumbnailEditor.overlayPlaceholder")}
            maxLength={200}
            className="w-full rounded-lg border border-border-default bg-surface-base px-4 py-2.5 text-base text-text-primary placeholder-text-muted focus:border-accent-cyan focus:outline-none focus:ring-2 focus:ring-accent-cyan/20 transition-all"
          />
        </div>

        {/* Compact Controls Row */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 pb-4 border-b border-border-default">
          {/* Position Toggle */}
          <div className="flex gap-1 border border-border-default rounded-lg overflow-hidden">
            <button
              onClick={() => setTextPosition("left")}
              className={`p-2 transition-colors ${
                textPosition === "left"
                  ? "bg-accent-cyan text-white"
                  : "bg-surface-raised text-text-muted hover:bg-surface-base"
              }`}
              title={t("project.thumbnailEditor.alignLeft")}
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
              title={t("project.thumbnailEditor.alignRight")}
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
              title={t("project.thumbnailEditor.decreaseFontSize")}
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
              title={t("project.thumbnailEditor.increaseFontSize")}
            >
              <Plus className="h-4 w-4 text-text-secondary" />
            </button>
          </div>

          {/* Font Selector */}
          <select
            value={textFont}
            onChange={(e) => setTextFont(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border-default bg-surface-raised text-sm text-text-primary focus:border-accent-cyan focus:outline-none focus:ring-2 focus:ring-accent-cyan/20 transition-all cursor-pointer"
            title={t("project.thumbnailEditor.fontStyle")}
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
              title={t("project.thumbnailEditor.textColor")}
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
            title={
              textBackgroundBlur
                ? t("project.thumbnailEditor.blurEnabled")
                : t("project.thumbnailEditor.blurDisabled")
            }
          >
            <Droplets className="h-4 w-4" />
          </button>

          {/* Spacer */}
          <div className="flex-1 min-w-[1rem]" />

          {/* AI Regenerate (icon only) */}
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Sparkles className="h-4 w-4" />}
            onClick={() => setShowPromptInput(!showPromptInput)}
            disabled={isRegenerating || isUploading}
            className="p-2"
            title={t("project.thumbnailEditor.regenerateAi")}
          />

          {/* Upload (icon only) */}
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Upload className="h-4 w-4" />}
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isRegenerating}
            className="p-2"
            title={t("project.thumbnailEditor.uploadCustom")}
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
          <div className="space-y-2">
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder={t("project.thumbnailEditor.customPromptPlaceholder")}
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
              {isRegenerating
                ? t("project.thumbnailEditor.generating")
                : t("project.thumbnailEditor.generate")}
            </Button>
          </div>
        )}

        {/* Live Preview */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-text-muted uppercase tracking-wide">
            {t("project.thumbnailEditor.livePreview")}
          </label>
          <div className="relative aspect-video rounded-lg overflow-hidden bg-surface-raised border-2 border-border-default">
            {isRegenerating && !useCustom && (
              <div className="absolute inset-0 flex items-center justify-center bg-surface-base/80 z-10">
                <div className="text-center">
                  <Spinner size="md" className="text-accent-cyan mx-auto mb-2" />
                  <p className="text-sm text-text-muted">
                    {t("project.thumbnailEditor.generatingNew")}
                  </p>
                </div>
              </div>
            )}

            {project.thumbnailStatus === "generating" && !useCustom && !isRegenerating && (
              <div className="absolute inset-0 flex items-center justify-center bg-surface-base/80 z-10">
                <div className="text-center">
                  <Spinner size="md" className="text-accent-cyan mx-auto mb-2" />
                  <p className="text-sm text-text-muted">
                    {t("project.thumbnailEditor.aiGenerating")}
                  </p>
                </div>
              </div>
            )}

            {hasThumbnail && currentThumbnailUrl ? (
              <>
                <Image
                  src={currentThumbnailUrl}
                  alt={t("project.thumbnailEditor.projectThumbnail")}
                  className="w-full h-full object-cover"
                  fill
                  sizes="(max-width: 640px) 100vw, 500px"
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
                  <p className="text-sm">{t("project.thumbnailEditor.noThumbnail")}</p>
                  <p className="text-xs">{t("project.thumbnailEditor.noThumbnailHint")}</p>
                </div>
              </div>
            )}
          </div>

          {/* Upload Warning */}
          {uploadWarning && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2">
              <p className="text-xs text-amber-400">{uploadWarning}</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
