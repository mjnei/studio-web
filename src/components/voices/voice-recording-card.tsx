"use client";

import { useState, useRef, useEffect } from "react";
import { Trash2, Play, Pause, Share2, Lock, CheckCircle, Clock } from "lucide-react";
import { VoiceResponse } from "@/lib/types/api";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { ConfirmModal, AlertModal } from "@/components/ui/modal";

interface VoiceRecordingCardProps {
  recording: VoiceResponse;
  onDelete: (id: number) => void;
  onToggleSharing: (id: number, isShared: boolean) => Promise<void>;
  onSharingToggled?: (id: number, isShared: boolean) => void;
}

export function VoiceRecordingCard({
  recording,
  onDelete,
  onToggleSharing,
  onSharingToggled,
}: VoiceRecordingCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTogglingSharing, setIsTogglingSharing] = useState(false);
  const [isShared, setIsShared] = useState(recording.is_shared || false);
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
      await onDelete(recording.id);
      setDeleteConfirmOpen(false);
    } catch {
      setAudioErrorAlert({ open: true, message: "Failed to delete recording" });
      setIsDeleting(false);
    }
  };

  const handleToggleSharing = async () => {
    setIsTogglingSharing(true);
    try {
      await onToggleSharing(recording.id, !isShared);
      setIsShared(!isShared);
      onSharingToggled?.(recording.id, !isShared);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update sharing status";
      console.error("Failed to toggle sharing:", error);
      setAudioErrorAlert({
        open: true,
        message: errorMessage,
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
        // Use audio URL attached by useVoices hook from new endpoint
        // The hook fetches from /api/v1/voices/{id}/audio-url and attaches audio_url property
        const audioUrl = recording.audio_url;

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

  const formatDuration = (seconds: number | null | undefined) => {
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

  /**
   * Get badge information based on sharing and approval status
   *
   * Display Logic (from design):
   * - Private: !is_shared
   * - Pending approval: is_shared && !is_approved
   * - Community (approved): is_shared && is_approved
   */
  const getBadgeInfo = () => {
    if (!isShared) {
      return {
        label: "🔒 Private",
        color: "bg-gray-500/10 text-gray-600 border-gray-500/30",
        icon: <Lock className="h-3 w-3" />,
      };
    }

    // Handle optional is_approved field gracefully (could be undefined, null, or false)
    if (!recording.is_approved) {
      return {
        label: "⏳ Pending Approval",
        color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
        icon: <Clock className="h-3 w-3" />,
      };
    }

    // Approved community voice - handle optional admin_approved_at gracefully
    const approvalDate = recording.admin_approved_at
      ? ` • Approved ${formatDate(recording.admin_approved_at)}`
      : "";
    return {
      label: `✅ Community${approvalDate}`,
      color: "bg-green-500/10 text-green-600 border-green-500/30",
      icon: <CheckCircle className="h-3 w-3" />,
    };
  };

  const formatLanguage = (language: string | null | undefined): string | null => {
    // Handle null and undefined explicitly per Requirement 7.4
    if (!language) return null;

    // Format language code to display name
    const displayNames: Record<string, string> = {
      en: "English",
      es: "Spanish",
      fr: "French",
      de: "German",
      it: "Italian",
      pt: "Portuguese",
      ru: "Russian",
      ja: "Japanese",
      zh: "Chinese",
      "zh-CN": "Simplified Chinese",
      "zh-TW": "Traditional Chinese",
      ko: "Korean",
      ar: "Arabic",
      hi: "Hindi",
    };

    return displayNames[language] || language.toUpperCase();
  };

  return (
    <div className="rounded-xl border border-border-default bg-surface-panel p-5 hover:border-border-hover hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Heading variant="subsection" as="h3" className="text-text-primary truncate">
              {recording.name}
            </Heading>
            {/* Community Voice Status Badge */}
            {(() => {
              const badgeInfo = getBadgeInfo();
              return (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold border whitespace-nowrap ${badgeInfo.color}`}
                  title={badgeInfo.label}
                >
                  {badgeInfo.icon}
                  {badgeInfo.label}
                </span>
              );
            })()}
          </div>
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
        <div className="flex items-center gap-2">
          <span>{formatDate(recording.created_at)}</span>
          <span>•</span>
          <span>{formatDuration(recording.duration_seconds)}</span>
          {/* Language Display (Requirement 8.2) */}
          {formatLanguage(recording.language) && (
            <>
              <span>•</span>
              <span className="text-xs bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded">
                {formatLanguage(recording.language)}
              </span>
            </>
          )}
        </div>
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
        description={`Are you sure you want to delete "${recording.name}"? This action cannot be undone.`}
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
