"use client";

import { useState } from "react";
import { Trash2, Play, Pause, Share2, Lock, CheckCircle2, Clock } from "lucide-react";
import { VoiceResponse } from "@/lib/types/api";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Heading } from "@/components/ui/heading";
import { ConfirmModal, AlertModal } from "@/components/ui/modal";
import { useI18n } from "@/i18n";
import { useVoiceAudioPlayback } from "@/lib/hooks/use-voice-audio-playback";

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
  const { t } = useI18n();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingSharing, setIsTogglingSharing] = useState(false);
  const [isShared, setIsShared] = useState(recording.is_shared || false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [audioErrorAlert, setAudioErrorAlert] = useState<{ open: boolean; message: string }>({
    open: false,
    message: "",
  });
  const { togglePlayback, isPlaying, isLoading } = useVoiceAudioPlayback({
    onError: (error) => {
      const message =
        error === "unavailable"
          ? t("voices.recordingCard.audioUrlUnavailable")
          : error === "play_failed"
            ? t("voices.recordingCard.playFailed")
            : t("voices.recordingCard.loadFailed");
      setAudioErrorAlert({ open: true, message });
    },
  });

  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(recording.id);
      setDeleteConfirmOpen(false);
    } catch {
      setAudioErrorAlert({ open: true, message: t("voices.recordingCard.deleteFailed") });
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
        error instanceof Error ? error.message : t("voices.recordingCard.updateSharingFailed");
      console.error("Failed to toggle sharing:", error);
      setAudioErrorAlert({
        open: true,
        message: errorMessage,
      });
    } finally {
      setIsTogglingSharing(false);
    }
  };

  const handleTogglePlayback = () => {
    void togglePlayback(recording.id, recording.audio_url);
  };

  const formatDuration = (seconds: number | null | undefined) => {
    if (!seconds) return t("voices.recordingCard.unknown");
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
        label: `🔒 ${t("voices.recordingCard.private")}`,
        color: "bg-gray-500/10 text-gray-600 border-gray-500/30",
        icon: <Lock className="h-3 w-3" />,
      };
    }

    // Handle optional is_approved field gracefully (could be undefined, null, or false)
    if (!recording.is_approved) {
      return {
        label: `⏳ ${t("voices.recordingCard.pendingApproval")}`,
        color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
        icon: <Clock className="h-3 w-3" />,
      };
    }

    // Approved community voice - handle optional admin_approved_at gracefully
    const approvalDate = recording.admin_approved_at
      ? ` • ${t("voices.recordingCard.approvedOn", { date: formatDate(recording.admin_approved_at) })}`
      : "";
    return {
      label: `✅ ${t("voices.recordingCard.community")}${approvalDate}`,
      color: "bg-green-500/10 text-green-600 border-green-500/30",
      icon: <CheckCircle2 className="h-3 w-3" />,
    };
  };

  const formatLanguage = (language: string | null | undefined): string | null => {
    // Handle null and undefined explicitly per Requirement 7.4
    if (!language) return null;

    const normalized = language === "zh-CN" ? "zhCN" : language === "zh-TW" ? "zhTW" : language;
    const key = `voices.languages.${normalized}`;
    const translated = t(key);
    return translated === key ? language.toUpperCase() : translated;
  };

  return (
    <div className="rounded-xl glass-card p-5 hover:border-border-hover hover:shadow-md transition-all">
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
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-caption font-bold border whitespace-nowrap ${badgeInfo.color}`}
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
          aria-label={t("voices.recordingCard.deleteRecording")}
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <div className="flex items-center justify-between text-caption text-text-muted mb-4">
        <div className="flex items-center gap-2">
          <span>{formatDate(recording.created_at)}</span>
          <span>•</span>
          <span>{formatDuration(recording.duration_seconds)}</span>
          {/* Language Display (Requirement 8.2) */}
          {formatLanguage(recording.language) && (
            <>
              <span>•</span>
              <span className="text-caption bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded">
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
          onClick={handleTogglePlayback}
          disabled={isLoading(recording.id)}
        >
          {isLoading(recording.id) ? (
            <>
              <Spinner className="mr-1 h-3 w-3 text-current" />
              {t("voices.playback.loading")}
            </>
          ) : isPlaying(recording.id) ? (
            <>
              <Pause className="mr-1 h-3.5 w-3.5" aria-hidden />
              {t("voices.playback.pause")}
            </>
          ) : (
            <>
              <Play className="mr-1 h-3.5 w-3.5" aria-hidden />
              {t("voices.playback.play")}
            </>
          )}
        </Button>

        <button
          onClick={handleToggleSharing}
          disabled={isTogglingSharing}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-body font-medium transition-all ${
            isShared
              ? "border border-orange-500/50 bg-orange-500/10 text-orange-600 hover:bg-orange-500/20"
              : "border border-green-500/50 bg-green-500/10 text-green-600 hover:bg-green-500/20"
          } disabled:opacity-50`}
          aria-label={
            isShared
              ? t("voices.recordingCard.stopSharing")
              : t("voices.recordingCard.shareCommunity")
          }
        >
          {isTogglingSharing ? (
            <Spinner className="h-4 w-4 text-current" />
          ) : isShared ? (
            <Lock className="h-3.5 w-3.5" aria-hidden />
          ) : (
            <Share2 className="h-3.5 w-3.5" aria-hidden />
          )}
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t("voices.recordingCard.deleteTitle")}
        description={t("voices.recordingCard.deleteDescription", { name: recording.name })}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        variant="danger"
        loading={isDeleting}
      />

      {/* Error Alert Modal */}
      <AlertModal
        open={audioErrorAlert.open}
        onClose={() => setAudioErrorAlert({ open: false, message: "" })}
        title={t("voices.recordingCard.errorTitle")}
        message={audioErrorAlert.message}
        variant="error"
        actionText={t("common.ok")}
      />
    </div>
  );
}
