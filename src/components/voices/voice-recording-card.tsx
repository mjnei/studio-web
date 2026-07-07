"use client";

import { useState, useRef, useEffect } from "react";
import { Trash2, Play, Pause, Share2, Lock } from "lucide-react";
import { VoiceRecordingResponse } from "@/lib/types/api";
import { Button } from "@/components/ui/button";
import { ConfirmModal, AlertModal } from "@/components/ui/modal";
import { toggleVoiceSharing } from "@/lib/api/voice-recording-client";

interface VoiceRecordingCardProps {
  recording: VoiceRecordingResponse;
  onDelete: (id: string) => void;
  onSharingToggled?: (id: number, isShared: boolean) => void;
}

export function VoiceRecordingCard({ recording, onDelete, onSharingToggled }: VoiceRecordingCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTogglingSharing, setIsTogglingSharing] = useState(false);
  const [isShared, setIsShared] = useState((recording as any).is_shared || false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [audioErrorAlert, setAudioErrorAlert] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(recording.id.toString());
      setDeleteConfirmOpen(false);
    } catch (error) {
      setAudioErrorAlert({ open: true, message: "Failed to delete recording" });
      setIsDeleting(false);
    }
  };

  const handleToggleSharing = async () => {
    setIsTogglingSharing(true);
    try {
      await toggleVoiceSharing(recording.id, !isShared);
      setIsShared(!isShared);
      onSharingToggled?.(recording.id, !isShared);
    } catch (error: any) {
      console.error("Failed to toggle sharing:", error);
      setAudioErrorAlert({ 
        open: true, 
        message: error.message || "Failed to update sharing status" 
      });
    } finally {
      setIsTogglingSharing(false);
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
        // Use presigned URL from S3
        const audioUrl = (recording as any).audio_url;

        if (!audioUrl) {
          setAudioErrorAlert({ open: true, message: "Audio URL not available" });
          setIsLoading(false);
          return;
        }

        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.onended = () => {
          setIsPlaying(false);
        };

        audio.onerror = () => {
          setIsPlaying(false);
          setIsLoading(false);
          setAudioErrorAlert({
            open: true,
            message: "Failed to play audio. The file may be unavailable.",
          });
        };

        audio.oncanplay = () => {
          setIsLoading(false);
        };

        await audio.play();
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
    <div className="rounded-xl border border-border-default bg-surface-panel p-5 hover:border-border-hover hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-text-primary truncate">{recording.title}</h3>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                isShared
                  ? "bg-green-500/10 text-green-600 border border-green-500/30"
                  : "bg-gray-500/10 text-gray-600 border border-gray-500/30"
              }`}
            >
              {isShared ? (
                <>
                  <Share2 className="h-3 w-3" />
                  Shared
                </>
              ) : (
                <>
                  <Lock className="h-3 w-3" />
                  Private
                </>
              )}
            </span>
          </div>
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

      <div className="flex items-center justify-between text-xs text-text-muted mb-4">
        <span>{formatDate(recording.created_at)}</span>
        <span>{formatDuration(recording.duration_seconds)}</span>
      </div>

      <div className="flex gap-2">
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

        <button
          onClick={handleToggleSharing}
          disabled={isTogglingSharing}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
            isShared
              ? "border border-orange-500/50 bg-orange-500/10 text-orange-600 hover:bg-orange-500/20"
              : "border border-green-500/50 bg-green-500/10 text-green-600 hover:bg-green-500/20"
          } disabled:opacity-50`}
          title={isShared ? "Stop sharing (make private)" : "Share with community"}
        >
          {isTogglingSharing ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : isShared ? (
            <Lock size={14} />
          ) : (
            <Share2 size={14} />
          )}
        </button>
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
