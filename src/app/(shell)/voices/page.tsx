"use client";

import { useState, useEffect } from "react";
import { Plus, Mic, Globe, AlertCircle, Info } from "lucide-react";
import { VoiceRecordingModal } from "@/components/shared/voice-recording-modal";
import { VoiceLimitDialog } from "@/components/voices/voice-limit-dialog";
import { VoiceCard } from "@/components/voices/VoiceCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Heading } from "@/components/ui/heading";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmModal } from "@/components/ui/modal";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/toast";
import { useI18n } from "@/i18n";
import { useVoices } from "@/lib/hooks/use-voices";
import { useVoiceLimits } from "@/lib/hooks/use-voice-limits";
import { getAvailableVoices, getVoiceAudioUrl } from "@/lib/api/voice-client";
import type { VoiceWithCreator } from "@/lib/types/api";

/**
 * Fetch audio URLs for community voices in parallel
 */
async function fetchAudioUrlsForVoices(voices: VoiceWithCreator[]): Promise<VoiceWithCreator[]> {
  return Promise.all(
    voices.map(async (voice) => {
      try {
        const audioUrlData = await getVoiceAudioUrl(voice.id);
        return {
          ...voice,
          audio_url: audioUrlData.audio_url,
          audio_storage_type: audioUrlData.storage_type,
          audio_expires_in: audioUrlData.expires_in,
        };
      } catch (err) {
        console.error(`Failed to fetch audio URL for voice ${voice.id}:`, err);
        return voice;
      }
    })
  );
}

/**
 * Main Voices Page Component
 */
export default function VoicesPage() {
  const [tab, setTab] = useState<"private" | "community">("private");
  const [showRecorder, setShowRecorder] = useState(false);
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const { user } = useAuth();
  const toast = useToast();
  const { t } = useI18n();
  const { voices, loading, error, deleteVoice, toggleSharing, refetch } = useVoices();
  const voiceLimits = useVoiceLimits();

  const [communityVoices, setCommunityVoices] = useState<VoiceWithCreator[]>([]);
  const [communityLoading, setCommunityLoading] = useState(false);
  const [communityError, setCommunityError] = useState<string | null>(null);

  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [voiceToDelete, setVoiceToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Share confirmation state
  const [shareConfirmOpen, setShareConfirmOpen] = useState(false);
  const [voiceToShare, setVoiceToShare] = useState<number | null>(null);
  const [sharing, setSharing] = useState(false);

  // Unshare confirmation state
  const [unshareConfirmOpen, setUnshareConfirmOpen] = useState(false);
  const [voiceToUnshare, setVoiceToUnshare] = useState<number | null>(null);
  const [unsharing, setUnsharing] = useState(false);

  // Filter private voices: exclude those that are shared AND approved
  const privateVoices = voices.filter((voice) => !(voice.is_shared && voice.is_approved));

  // Fetch community voices when switching to community tab
  useEffect(() => {
    if (tab === "community") {
      const fetchCommunityVoices = async () => {
        setCommunityLoading(true);
        try {
          const data = await getAvailableVoices();
          const voicesWithAudioUrls = await fetchAudioUrlsForVoices(data.community_voices);
          setCommunityVoices(voicesWithAudioUrls);
          setCommunityError(null);
        } catch (err) {
          setCommunityError(
            err instanceof Error ? err.message : t("voices.toasts.anErrorOccurred")
          );
        } finally {
          setCommunityLoading(false);
        }
      };

      fetchCommunityVoices();
    }
  }, [tab, t]);

  const handleRecordingSaved = async () => {
    await refetch();
    setShowRecorder(false);
    await voiceLimits.refetch();
  };

  const handleAddVoiceClick = () => {
    if (!voiceLimits.canAdd) {
      setShowLimitDialog(true);
      return;
    }
    setShowRecorder(true);
  };

  const handleUpgradeClick = () => {
    setShowLimitDialog(false);
    window.location.href = "/pricing";
  };

  // Share handlers
  const handleShareClick = (voiceId: number) => {
    setVoiceToShare(voiceId);
    setShareConfirmOpen(true);
  };

  const handleShareConfirm = async () => {
    if (!voiceToShare) return;

    setSharing(true);
    try {
      await toggleSharing(voiceToShare, true);
      toast.success(t("voices.toasts.voiceShared"), t("voices.toasts.voiceShareedDescription"));
      setShareConfirmOpen(false);
      setVoiceToShare(null);
      await refetch();

      // Always refresh community voices (cache has been invalidated)
      const data = await getAvailableVoices();
      const voicesWithAudioUrls = await fetchAudioUrlsForVoices(data.community_voices);
      setCommunityVoices(voicesWithAudioUrls);
    } catch (err) {
      toast.error(
        t("voices.toasts.voiceSharedError"),
        err instanceof Error ? err.message : t("voices.toasts.anErrorOccurred")
      );
    } finally {
      setSharing(false);
    }
  };

  // Unshare handlers
  const handleUnshareClick = (voiceId: number) => {
    setVoiceToUnshare(voiceId);
    setUnshareConfirmOpen(true);
  };

  const handleUnshareConfirm = async () => {
    if (!voiceToUnshare) return;

    setUnsharing(true);
    try {
      await toggleSharing(voiceToUnshare, false);
      toast.success(
        t("voices.toasts.voiceMadePrivate"),
        t("voices.toasts.voiceMadePrivateDescription")
      );
      setUnshareConfirmOpen(false);
      setVoiceToUnshare(null);
      await refetch();

      // Always refresh community voices (cache has been invalidated)
      const data = await getAvailableVoices();
      const voicesWithAudioUrls = await fetchAudioUrlsForVoices(data.community_voices);
      setCommunityVoices(voicesWithAudioUrls);
    } catch (err) {
      toast.error(
        t("voices.toasts.voiceMadePrivateError"),
        err instanceof Error ? err.message : t("voices.toasts.anErrorOccurred")
      );
    } finally {
      setUnsharing(false);
    }
  };

  // Delete handlers
  const handleDeleteClick = (voiceId: number) => {
    setVoiceToDelete(voiceId);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!voiceToDelete) return;

    setDeleting(true);
    try {
      await deleteVoice(voiceToDelete);
      toast.success(t("voices.toasts.voiceDeleted"), t("voices.toasts.voiceDeletedDescription"));
      setDeleteConfirmOpen(false);
      setVoiceToDelete(null);
      await refetch();
      await voiceLimits.refetch();

      // Always refresh community voices (cache has been invalidated)
      const data = await getAvailableVoices();
      const voicesWithAudioUrls = await fetchAudioUrlsForVoices(data.community_voices);
      setCommunityVoices(voicesWithAudioUrls);
    } catch (err) {
      toast.error(
        t("voices.toasts.voiceDeletedError"),
        err instanceof Error ? err.message : t("voices.toasts.anErrorOccurred")
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title={t("voices.library.title")}
        description={t("voices.library.description")}
        meta={
          tab === "private" ? (
            <span className="rounded-full bg-green-500/10 border border-green-500/30 px-3 py-1.5 text-caption font-medium text-green-600 whitespace-nowrap">
              {voiceLimits.currentCount} / {voiceLimits.limit}{" "}
              {t("voices.tabs.private").toLowerCase()}
            </span>
          ) : (
            `${communityVoices.length} ${t("voices.tabs.community").toLowerCase()}`
          )
        }
      />

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1 rounded-xl bg-surface-panel p-1 shadow-sm border border-border-default">
          <button
            onClick={() => setTab("private")}
            className={`relative flex items-center gap-2 rounded-lg px-5 py-2 text-body font-semibold transition-all duration-200 ${
              tab === "private"
                ? "bg-accent-primary text-white shadow-md"
                : "text-text-muted hover:text-text-primary hover:bg-surface-raised"
            }`}
          >
            <Mic className="h-4 w-4" />
            <span>{t("voices.tabs.private")}</span>
            {privateVoices.length > 0 && (
              <span
                className={`ml-1 rounded-full px-2 py-0.5 text-caption font-bold ${
                  tab === "private"
                    ? "bg-white/20 text-white"
                    : "bg-surface-elevated text-text-muted"
                }`}
              >
                {privateVoices.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setTab("community")}
            className={`relative flex items-center gap-2 rounded-lg px-5 py-2 text-body font-semibold transition-all duration-200 ${
              tab === "community"
                ? "bg-accent-primary text-white shadow-md"
                : "text-text-muted hover:text-text-primary hover:bg-surface-raised"
            }`}
          >
            <Globe className="h-4 w-4" />
            <span>{t("voices.tabs.community")}</span>
            {communityVoices.length > 0 && (
              <span
                className={`ml-1 rounded-full px-2 py-0.5 text-caption font-bold ${
                  tab === "community"
                    ? "bg-white/20 text-white"
                    : "bg-surface-elevated text-text-muted"
                }`}
              >
                {communityVoices.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content Area */}
      {tab === "private" ? (
        <div>
          {/* Voice Recorder Modal */}
          <VoiceRecordingModal
            isOpen={showRecorder}
            onClose={() => setShowRecorder(false)}
            onSaved={handleRecordingSaved}
          />

          {/* Voice Limit Dialog */}
          {showLimitDialog && (
            <VoiceLimitDialog
              tier={voiceLimits.tier}
              currentCount={voiceLimits.currentCount}
              limit={voiceLimits.limit}
              upgradeRequired={voiceLimits.upgradeRequired}
              onClose={() => setShowLimitDialog(false)}
              onUpgrade={handleUpgradeClick}
            />
          )}

          {/* Info Banner */}
          <Card variant="elevated" padding="md" className="mb-6 border-blue-500/30 bg-blue-500/5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 flex-shrink-0">
                <Info className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <Heading variant="label" as="h3" className="text-text-primary mb-1">
                  {t("voices.banners.privateInfo.title")}
                </Heading>
                <p className="text-caption text-text-secondary leading-relaxed">
                  {t("voices.banners.privateInfo.description")}
                </p>
              </div>
            </div>
          </Card>

          <div className="mb-6 flex justify-end">
            <Button
              variant="primary"
              size="md"
              onClick={handleAddVoiceClick}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              {t("voices.addVoice")}
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <Card
              variant="elevated"
              padding="md"
              className="mb-6 border-status-error/30 bg-status-error/10"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-status-error flex-shrink-0 mt-0.5" />
                <p className="text-body text-status-error">{error}</p>
              </div>
            </Card>
          )}

          {/* Loading State */}
          {loading ? (
            <LoadingSpinner size="lg" message={t("voices.errors.loadingVoices")} fullHeight />
          ) : privateVoices.length === 0 ? (
            /* Empty State */
            <EmptyState
              variant="bordered"
              size="lg"
              icon={<Mic aria-hidden />}
              title={t("voices.emptyStates.private.title")}
              description={t("voices.emptyStates.private.description")}
              action={
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleAddVoiceClick}
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  {t("voices.emptyStates.private.cta")}
                </Button>
              }
            />
          ) : (
            /* Voice Recordings Grid */
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {privateVoices.map((voice) => (
                <VoiceCard
                  key={voice.id}
                  voice={voice}
                  variant="private"
                  currentUserId={user?.id}
                  onDelete={handleDeleteClick}
                  onShare={handleShareClick}
                  onUnshare={handleUnshareClick}
                />
              ))}

              {/* Add Voice Card */}
              <Card
                variant="default"
                padding="none"
                className="border-dashed hover:border-accent-primary/50 hover:bg-accent-primary/5 transition-all cursor-pointer group min-h-[180px]"
                onClick={handleAddVoiceClick}
              >
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent-primary/10 group-hover:bg-accent-primary/20 transition-colors">
                    <Plus className="h-6 w-6 text-accent-primary" />
                  </div>
                  <Heading variant="label" as="h3" className="text-text-primary mb-1">
                    {t("voices.addVoiceCard.title")}
                  </Heading>
                  <p className="text-caption text-text-muted">
                    {voiceLimits.canAdd
                      ? t("voices.addVoiceCard.slotsRemaining", {
                          count: voiceLimits.remainingCount,
                        })
                      : voiceLimits.message}
                  </p>
                </div>
              </Card>
            </div>
          )}
        </div>
      ) : (
        /* Community Voices Tab */
        <div>
          {/* Info Banner */}
          <Card
            variant="elevated"
            padding="md"
            className="mb-6 border-accent-cyan/30 bg-accent-cyan/5"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-cyan/10 flex-shrink-0">
                <Globe className="h-5 w-5 text-accent-cyan" />
              </div>
              <div className="flex-1">
                <Heading variant="label" as="h3" className="text-text-primary mb-1">
                  {t("voices.banners.communityInfo.title")}
                </Heading>
                <p className="text-caption text-text-secondary leading-relaxed">
                  {t("voices.banners.communityInfo.description")}
                </p>
              </div>
            </div>
          </Card>

          {/* Error Message */}
          {communityError && (
            <Card
              variant="elevated"
              padding="md"
              className="mb-6 border-status-error/30 bg-status-error/10"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-status-error flex-shrink-0 mt-0.5" />
                <p className="text-body text-status-error">{communityError}</p>
              </div>
            </Card>
          )}

          {/* Loading State */}
          {communityLoading ? (
            <LoadingSpinner
              size="lg"
              message={t("voices.errors.loadingCommunityVoices")}
              fullHeight
            />
          ) : communityVoices.length === 0 ? (
            /* Empty State */
            <EmptyState
              variant="bordered"
              size="lg"
              icon={<Globe aria-hidden />}
              title={t("voices.emptyStates.community.title")}
              description={t("voices.emptyStates.community.description")}
            />
          ) : (
            /* Community Voices Grid */
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {communityVoices.map((voice) => (
                <VoiceCard
                  key={voice.id}
                  voice={voice}
                  variant="community"
                  currentUserId={user?.id}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setVoiceToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title={t("voices.modals.delete.title")}
        description={t("voices.modals.delete.description")}
        confirmText={t("voices.modals.delete.confirmText")}
        cancelText={t("voices.modals.delete.cancelText")}
        variant="danger"
        loading={deleting}
      />

      {/* Share Confirmation Modal */}
      <ConfirmModal
        open={shareConfirmOpen}
        onClose={() => {
          setShareConfirmOpen(false);
          setVoiceToShare(null);
        }}
        onConfirm={handleShareConfirm}
        title={t("voices.modals.share.title")}
        description={t("voices.modals.share.description")}
        confirmText={t("voices.modals.share.confirmText")}
        cancelText={t("voices.modals.share.cancelText")}
        variant="default"
        loading={sharing}
      />

      {/* Unshare Confirmation Modal */}
      <ConfirmModal
        open={unshareConfirmOpen}
        onClose={() => {
          setUnshareConfirmOpen(false);
          setVoiceToUnshare(null);
        }}
        onConfirm={handleUnshareConfirm}
        title={t("voices.modals.unshare.title")}
        description={t("voices.modals.unshare.description")}
        confirmText={t("voices.modals.unshare.confirmText")}
        cancelText={t("voices.modals.unshare.cancelText")}
        variant="default"
        loading={unsharing}
      />
    </div>
  );
}
