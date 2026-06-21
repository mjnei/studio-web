"use client";

import { Play, Pause, Check, Mic } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useState, useRef, useEffect } from "react";

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
  previewUrl?: string | null;
  onSelect: () => void;
  onPreview?: () => void;
  isPreviewLoading?: boolean;
}

export function VoiceSelectionCard({
  id,
  name,
  description,
  type,
  metadata,
  isSelected,
  previewUrl,
  onSelect,
  onPreview,
  isPreviewLoading = false,
}: VoiceSelectionCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => setIsPlaying(false);
    }
  }, []);

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!previewUrl) {
      onPreview?.();
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio(previewUrl);
      audioRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card
      variant={isSelected ? "elevated" : "bordered"}
      padding="md"
      className={`cursor-pointer transition-all hover:border-accent-cyan/60 ${
        isSelected ? "border-accent-cyan ring-2 ring-accent-cyan/20" : ""
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
            type === "recording"
              ? "bg-accent-purple-muted"
              : "bg-accent-cyan-muted"
          }`}
        >
          {type === "recording" ? (
            <Mic className={`h-5 w-5 ${
              type === "recording" ? "text-accent-purple" : "text-accent-cyan"
            }`} />
          ) : (
            <div className="text-sm font-bold text-accent-cyan">
              {name.charAt(0).toUpperCase()}
            </div>
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
                <p className="mt-1 text-xs text-text-secondary line-clamp-2">
                  {description}
                </p>
              )}
            </div>

            <div
              className={`h-5 w-5 shrink-0 rounded-full border-2 transition-all ${
                isSelected
                  ? "border-accent-cyan bg-accent-cyan"
                  : "border-border-default"
              }`}
            >
              {isSelected && (
                <Check className="h-full w-full scale-50 text-white" />
              )}
            </div>
          </div>

          <button
            onClick={handlePlayPause}
            disabled={isPreviewLoading}
            className="mt-3 flex items-center gap-2 rounded-md bg-surface-raised px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:bg-surface-panel hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPreviewLoading ? (
              <>
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-accent-cyan border-t-transparent" />
                <span>Generating...</span>
              </>
            ) : isPlaying ? (
              <>
                <Pause className="h-3 w-3 fill-current" />
                <span>Pause Preview</span>
              </>
            ) : (
              <>
                <Play className="h-3 w-3 fill-current" />
                <span>{previewUrl ? "Play Preview" : "Generate Preview"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Card>
  );
}
