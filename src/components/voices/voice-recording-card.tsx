"use client";

import { useState } from "react";
import { Trash2, Play, Pause } from "lucide-react";
import { VoiceRecordingResponse } from "@/lib/types/api";
import { Button } from "@/components/ui/button";

interface VoiceRecordingCardProps {
  recording: VoiceRecordingResponse;
  onDelete: (id: string) => void;
}

export function VoiceRecordingCard({ recording, onDelete }: VoiceRecordingCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete "${recording.title}"?`)) return;
    setIsDeleting(true);
    try {
      await onDelete(recording.id);
    } catch (error) {
      alert("Failed to delete recording");
      setIsDeleting(false);
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "Unknown";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="rounded-lg border border-border-default bg-surface-panel p-4 hover:border-border-hover transition-colors">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-text-primary truncate">{recording.title}</h3>
          {recording.description && (
            <p className="text-sm text-text-muted mt-1 line-clamp-2">{recording.description}</p>
          )}
        </div>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="shrink-0 p-1.5 text-text-muted hover:text-red-400 transition-colors disabled:opacity-50"
          title="Delete recording"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="flex items-center justify-between text-xs text-text-muted">
        <span>{formatDate(recording.created_at)}</span>
        <span>{formatDuration(recording.duration_seconds)}</span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? (
            <>
              <Pause size={14} className="mr-1" />
              Pause
            </>
          ) : (
            <>
              <Play size={14} className="mr-1" />
              Play
            </>
          )}
        </Button>
        <Button variant="primary" size="sm" className="flex-1">
          Use Voice
        </Button>
      </div>
    </div>
  );
}
