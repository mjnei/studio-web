"use client";

import { Check, Play, Pause } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { WaveformEqualizer } from "@/components/ui/waveform-equalizer";
import { useI18n } from "@/i18n";

interface VoiceSelectionCardProps {
  id: string | number;
  name: string;
  description?: string | null;
  type: "stock" | "recording" | "community" | "own";
  metadata?: {
    gender?: string;
    accent?: string;
    language?: string;
    duration?: number;
    creator?: string;
  };
  isSelected: boolean;
  isPlaying: boolean;
  onSelect: () => void;
  onPreviewToggle?: (e: React.MouseEvent) => void;
  isPreviewLoading?: boolean;
}

export function VoiceSelectionCard({
  name,
  description,
  type,
  metadata,
  isSelected,
  isPlaying,
  onSelect,
  onPreviewToggle,
  isPreviewLoading = false,
}: VoiceSelectionCardProps) {
  const { t } = useI18n();

  const isCustom = type === "recording" || type === "own";

  return (
    <Card
      variant={isSelected ? "elevated" : "default"}
      padding="none"
      className={`group cursor-pointer transition-all duration-200 overflow-hidden ${
        isSelected
          ? "border-accent-primary ring-2 ring-accent-primary/25 shadow-glow"
          : "hover:border-border-strong hover:bg-surface-raised"
      }`}
      onClick={onSelect}
    >
      <div className="p-3.5 sm:p-4 flex items-start gap-3">
        {/* Voice Avatar / Playback Audition Button */}
        <button
          type="button"
          onClick={(e) => {
            if (onPreviewToggle) {
              e.stopPropagation();
              onPreviewToggle(e);
            } else {
              onSelect();
            }
          }}
          title={isPlaying ? t("common.pause") : t("common.play")}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-200 shadow-sm ${
            isPlaying
              ? "bg-accent-primary text-white shadow-glow ring-2 ring-accent-primary/50 scale-105"
              : isCustom
                ? "bg-purple-600/15 text-purple-400 group-hover:bg-purple-600/25"
                : "bg-accent-cyan/15 text-accent-cyan group-hover:bg-accent-cyan/25"
          }`}
        >
          {isPreviewLoading ? (
            <Spinner className="h-5 w-5 text-current" />
          ) : isPlaying ? (
            <Pause className="h-5 w-5 fill-current" />
          ) : (
            <Play className="h-5 w-5 ml-0.5 fill-current" />
          )}
        </button>

        {/* Content Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-text-primary text-body truncate group-hover:text-accent-primary transition-colors">
                  {name}
                </p>
                {isPlaying && (
                  <WaveformEqualizer
                    isPlaying={true}
                    barCount={4}
                    color={isCustom ? "bg-purple-400" : "bg-accent-cyan"}
                  />
                )}
              </div>

              {metadata && (
                <p className="mt-0.5 text-caption text-text-muted truncate">
                  {[metadata.gender, metadata.accent, metadata.language, metadata.creator]
                    .filter(Boolean)
                    .join(" • ")}
                </p>
              )}

              {description && (
                <p className="mt-1 text-caption text-text-secondary line-clamp-1">{description}</p>
              )}
            </div>

            {/* Selection Check Circle */}
            <div
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all ${
                isSelected
                  ? "border-accent-primary bg-accent-primary text-white shadow-sm"
                  : "border-border-default bg-surface-raised group-hover:border-border-strong"
              }`}
            >
              {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
