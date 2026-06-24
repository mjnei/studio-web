"use client";

import { useState, useRef, useEffect } from "react";
import { Trash2, Play, Pause } from "lucide-react";
import { VoiceRecordingResponse } from "@/lib/types/api";
import { Button } from "@/components/ui/button";
import { ConfirmModal, AlertModal } from "@/components/ui/modal";

interface VoiceRecordingCardProps {
  recording: VoiceRecordingResponse;
  onDelete: (id: string) => void;
}

export function VoiceRecordingCard({ recording, onDelete }: VoiceRecordingCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [audioErrorAlert, setAudioErrorAlert] = useState<{ open: boolean; message: string }>({ open: false, message: "" });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(recording.id);
      setDeleteConfirmOpen(false);
    } catch (error) {
      setAudioErrorAlert({ open: true, message: "Failed to delete recording" });
      setIsDeleting(false);
    }
  };

  const togglePlayback = async () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    if (!audioRef.current) {
      setIsLoading(true);

      try {
        // Check if we have a direct audio URL (from S3 or backend)
        const audioUrl = (recording as any).audio_url;
        
        if (!audioUrl) {
          // Fallback: fetch audio URL from backend
          const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8020/api/v1";
          const token = (await import("@/lib/api-client")).getAccessToken();
          
          const response = await fetch(`${API_BASE}/recordings/${recording.id}/audio-url`, {
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            credentials: "include",
          });

          if (!response.ok) {
            throw new Error("Failed to get audio URL");
          }

          const data = await response.json();
          const fetchedAudioUrl = data.storage_type === "local" 
            ? `${API_BASE}${data.audio_url}`
            : data.audio_url;

          const audio = new Audio(fetchedAudioUrl);
          audioRef.current = audio;
        } else {
          // Check if it's a relative URL (local storage) and needs API base
          const storageType = (recording as any).audio_storage_type;
          const finalAudioUrl = storageType === "local" && audioUrl.startsWith("/")
            ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8020/api/v1"}${audioUrl}`
            : audioUrl;

          const audio = new Audio(finalAudioUrl);
          audioRef.current = audio;
        }

        audioRef.current.onended = () => {
          setIsPlaying(false);
        };

        audioRef.current.onerror = () => {
          setIsPlaying(false);
          setIsLoading(false);
          setAudioErrorAlert({ open: true, message: "Failed to play audio" });
        };

        audioRef.current.oncanplay = () => {
          setIsLoading(false);
        };

        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Audio playback error:", error);
        setIsLoading(false);
        setAudioErrorAlert({ open: true, message: "Failed to load audio" });
      }
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

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
          onClick={handleDeleteClick}
          disabled={isDeleting}
          className="shrink-0 p-1.5 text-text-muted hover:text-red-400 transition-colors disabled:opacity-50"
          title="Delete recording"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="flex items-center justify-between text-xs text-text-muted mb-3">
        <span>{formatDate(recording.created_at)}</span>
        <span>{formatDuration(recording.duration_seconds)}</span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={togglePlayback}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="mr-1 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Loading...
            </>
          ) : isPlaying ? (
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Recording"
        description={`Are you sure you want to delete "${recording.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={isDeleting}
      />

      {/* Error Alert Modal */}
      <AlertModal
        open={audioErrorAlert.open}
        onClose={() => setAudioErrorAlert({ open: false, message: "" })}
        title="Error"
        message={audioErrorAlert.message}
        variant="error"
        actionText="OK"
      />
    </div>
  );
}
