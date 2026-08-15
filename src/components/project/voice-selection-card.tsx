"use client";

import { Check, Mic, Volume2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface VoiceSelectionCardProps {
  id: string;
  name: string;
  description?: string | null;
  type: "stock" | "recording";
  metadata?: {
    gender?: string;
    accent?: string;
    language?: string;
    duration?: number;
  };
  isSelected: boolean;
  isPlaying: boolean;
  previewUrl?: string | null;
  onSelect: () => void;
  onPreview?: () => void;
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
  isPreviewLoading = false,
}: VoiceSelectionCardProps) {
  const formatDuration = (seconds?: number) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card
      variant={isSelected ? "elevated" : "default"}
      padding="md"
      className={`cursor-pointer transition-all hover:border-accent-cyan/60 ${
        isSelected ? "border-accent-cyan ring-2 ring-accent-cyan/20" : ""
      } ${isPlaying ? "ring-2 ring-accent-purple/40" : ""}`}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
            type === "recording" ? "bg-accent-purple-muted" : "bg-accent-cyan-muted"
          } ${isPlaying ? "ring-2 ring-accent-purple" : ""}`}
        >
          {isPlaying ? (
            <Volume2 className="h-5 w-5 text-accent-purple animate-pulse" />
          ) : type === "recording" ? (
            <Mic className="h-5 w-5 text-accent-purple" />
          ) : (
            <div className="text-sm font-bold text-accent-cyan">{name.charAt(0).toUpperCase()}</div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-text-primary truncate">{name}</h4>
              {metadata && (
                <p className="mt-1 text-xs text-text-muted">
                  {[
                    metadata.gender,
                    metadata.accent,
                    metadata.language,
                    metadata.duration ? formatDuration(metadata.duration) : null,
                  ]
                    .filter(Boolean)
                    .join(" • ")}
                </p>
              )}
              {description && (
                <p className="mt-1 text-xs text-text-secondary line-clamp-2">{description}</p>
              )}
              {isPreviewLoading && (
                <div className="mt-2 text-xs text-text-muted flex items-center gap-1">
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-accent-cyan border-t-transparent" />
                  <span>Loading preview...</span>
                </div>
              )}
            </div>

            <div
              className={`h-5 w-5 shrink-0 rounded-full border-2 transition-all ${
                isSelected ? "border-accent-cyan bg-accent-cyan" : "border-border-default"
              }`}
            >
              {isSelected && <Check className="h-full w-full scale-50 text-white" />}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
