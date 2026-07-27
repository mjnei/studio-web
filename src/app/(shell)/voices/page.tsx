"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Mic,
  Globe,
  User,
  AlertCircle,
  CheckCircle,
  Play,
  Pause,
  Clock,
  Trash2,
  Share2,
  Lock,
  Info,
} from "lucide-react";
import { VoiceRecordingModal } from "@/components/shared/voice-recording-modal";
import { VoiceLimitDialog } from "@/components/voices/voice-limit-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmModal } from "@/components/ui/modal";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/toast";
import { useVoices } from "@/lib/hooks/use-voices";
import { useVoiceLimits } from "@/lib/hooks/use-voice-limits";
import { getAvailableVoices, getVoiceAudioUrl } from "@/lib/api/voice-client";
import type { VoiceWithCreator, VoiceResponse } from "@/lib/types/api";

/**
 * Format relative time for display
 */
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;

  const months = Math.floor(diffDays / 30);
  if (months < 12) return `${months}mo ago`;

  const years = Math.floor(diffDays / 365);
  return `${years}y ago`;
}

/**
 * Format duration in seconds to MM:SS format
 */
function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Format language code to display name
 */
function formatLanguage(language: string | null | undefined): string | null {
  if (!language) return null;

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
}

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
        // Log but don't fail - audio URL fetch is optional
        console.error(`Failed to fetch audio URL for voice ${voice.id}:`, err);
        return voice;
      }
    })
  );
}

/**
 * Voice Card Component - Used for both Private and Community tabs
 */
interface VoiceCardProps {
  voice: VoiceResponse | VoiceWithCreator;
  variant: "private" | "community";
  currentUserId?: string;
  onDelete: (id: number) => void;
  onShare?: (id: number) => void;
  onUnshare?: (id: number) => void;
}

function VoiceCard({
  voice,
  variant,
  currentUserId,
  onDelete,
  onShare,
  onUnshare,
}: VoiceCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const toast = useToast();

  const isOwnVoice = currentUserId && voice.user_id === parseInt(currentUserId, 10);
  const creatorInfo = "creator_username" in voice ? voice : null;

  const togglePlayback = async () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    if (!audioRef.current) {
      setIsLoading(true);

      try {
        const audioUrl = voice.audio_url;

        if (!audioUrl) {
          toast.error("Audio unavailable", "Audio URL not available");
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
          toast.error("Playback failed", "Failed to play audio");
        };

        audio.oncanplay = () => {
          setIsLoading(false);
        };

        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Audio playback error:", error);
        setIsLoading(false);
        toast.error("Playback failed", "Failed to load audio");
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

  const renderStatusBadge = () => {
    if (variant === "private") {
      if (voice.is_shared && !voice.is_approved) {
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 px-2 py-1 text-xs font-semibold text-yellow-600">
            <Clock className="h-3 w-3" />
            Pending Review
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-500/10 border border-gray-500/30 px-2 py-1 text-xs font-semibold text-gray-600">
          <Lock className="h-3 w-3" />
          Private
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 border border-green-500/30 px-2 py-1 text-xs font-semibold text-green-600">
          <CheckCircle className="h-3 w-3" />
          Approved
        </span>
      );
    }
  };

  return (
    <Card
      variant="elevated"
      padding="none"
      className="overflow-hidden hover:border-accent-primary/40 hover:shadow-lg transition-all duration-200"
    >
      {/* Voice Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-semibold text-text-primary text-base truncate flex-1">
            {voice.name}
          </h3>
          {renderStatusBadge()}
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-2 text-xs text-text-muted flex-wrap">
          {variant === "community" && creatorInfo && (
            <>
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>
                  @{creatorInfo.creator_username}
                  {isOwnVoice && <span className="text-accent-primary ml-1">(you)</span>}
                </span>
              </div>
              <span>•</span>
            </>
          )}
          <span>{formatRelativeTime(voice.created_at)}</span>
          {voice.duration_seconds && (
            <>
              <span>•</span>
              <span>{formatDuration(voice.duration_seconds)}</span>
            </>
          )}
          {formatLanguage(voice.language) && (
            <>
              <span>•</span>
              <span className="inline-flex items-center rounded-full bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 text-xs font-medium text-blue-600">
                {formatLanguage(voice.language)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Playback Controls */}
      <div className="px-4 pb-3 border-t border-border-subtle pt-3">
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlayback}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-accent-primary/10 hover:bg-accent-primary/20 text-accent-primary font-medium py-2.5 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span className="text-sm">Loading...</span>
              </>
            ) : isPlaying ? (
              <>
                <Pause className="h-4 w-4" />
                <span className="text-sm">Pause</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                <span className="text-sm">Play</span>
              </>
            )}
          </button>

          {/* Action Buttons */}
          {variant === "private" && (
            <>
              {!voice.is_shared && onShare && (
                <button
                  onClick={() => onShare(voice.id)}
                  className="p-2.5 rounded-lg border border-green-500/50 bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors"
                  title="Share with community"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              )}
              {voice.is_shared && !voice.is_approved && onUnshare && (
                <button
                  onClick={() => onUnshare(voice.id)}
                  className="p-2.5 rounded-lg border border-orange-500/50 bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 transition-colors"
                  title="Make private"
                >
                  <Lock className="h-4 w-4" />
                </button>
              )}
            </>
          )}

          {(variant === "private" || (variant === "community" && isOwnVoice)) && (
            <button
              onClick={() => onDelete(voice.id)}
              className="p-2.5 rounded-lg border border-red-500/50 bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors"
              title="Delete voice"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </Card>
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
          setCommunityError(err instanceof Error ? err.message : "Failed to load community voices");
        } finally {
          setCommunityLoading(false);
        }
      };

      fetchCommunityVoices();
    }
  }, [tab]);

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
      toast.success("Voice shared", "Your voice has been submitted for review");
      setShareConfirmOpen(false);
      setVoiceToShare(null);
      await refetch();
    } catch (err) {
      toast.error(
        "Failed to share voice",
        err instanceof Error ? err.message : "An error occurred"
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
      toast.success("Voice made private", "Your voice is no longer shared");
      setUnshareConfirmOpen(false);
      setVoiceToUnshare(null);
      await refetch();
    } catch (err) {
      toast.error(
        "Failed to make voice private",
        err instanceof Error ? err.message : "An error occurred"
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
      toast.success("Voice deleted", "Your voice has been deleted successfully");
      setDeleteConfirmOpen(false);
      setVoiceToDelete(null);
      await refetch();
      await voiceLimits.refetch();

      // Refresh community voices if on community tab
      if (tab === "community") {
        const data = await getAvailableVoices();
        const voicesWithAudioUrls = await fetchAudioUrlsForVoices(data.community_voices);
        setCommunityVoices(voicesWithAudioUrls);
      }
    } catch (err) {
      toast.error(
        "Failed to delete voice",
        err instanceof Error ? err.message : "An error occurred"
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Voice Library"
        description="Create custom voices and discover community-shared voices for your projects"
        action={
          tab === "private" ? (
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-green-500/10 border border-green-500/30 px-3 py-1.5 text-xs font-medium text-green-600 whitespace-nowrap">
                {voiceLimits.currentCount} / {voiceLimits.limit} voices
              </span>
              <Button
                variant="primary"
                size="md"
                onClick={handleAddVoiceClick}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Add Voice
              </Button>
            </div>
          ) : (
            <span className="rounded-full bg-accent-cyan/10 border border-accent-cyan/30 px-3 py-1.5 text-xs font-medium text-accent-cyan whitespace-nowrap">
              {communityVoices.length} shared {communityVoices.length === 1 ? "voice" : "voices"}
            </span>
          )
        }
      />

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1 rounded-xl bg-surface-panel p-1 shadow-sm border border-border-default">
          <button
            onClick={() => setTab("private")}
            className={`relative flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition-all duration-200 ${
              tab === "private"
                ? "bg-accent-primary text-white shadow-md"
                : "text-text-muted hover:text-text-primary hover:bg-surface-raised"
            }`}
          >
            <Mic className="h-4 w-4" />
            <span>Private</span>
            {privateVoices.length > 0 && (
              <span
                className={`ml-1 rounded-full px-2 py-0.5 text-xs font-bold ${
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
            className={`relative flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition-all duration-200 ${
              tab === "community"
                ? "bg-accent-primary text-white shadow-md"
                : "text-text-muted hover:text-text-primary hover:bg-surface-raised"
            }`}
          >
            <Globe className="h-4 w-4" />
            <span>Community</span>
            {communityVoices.length > 0 && (
              <span
                className={`ml-1 rounded-full px-2 py-0.5 text-xs font-bold ${
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
                <h3 className="text-sm font-semibold text-text-primary mb-1">Private Voices</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Your private voice recordings. Share them with the community for admin review.
                  Once approved, they&apos;ll appear in the Community tab and won&apos;t count
                  toward your voice limit.
                </p>
              </div>
            </div>
          </Card>

          {/* Error Message */}
          {error && (
            <Card
              variant="elevated"
              padding="md"
              className="mb-6 border-status-error/30 bg-status-error/10"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-status-error flex-shrink-0 mt-0.5" />
                <p className="text-sm text-status-error">{error}</p>
              </div>
            </Card>
          )}

          {/* Loading State */}
          {loading ? (
            <LoadingSpinner size="lg" message="Loading your voices..." fullHeight />
          ) : privateVoices.length === 0 ? (
            /* Empty State */
            <EmptyState
              variant="bordered"
              size="lg"
              icon={<Mic className="h-12 w-12" />}
              title="No private voices"
              description="Start by recording a voice sample. Your voice will be cloned and ready to use in your projects. Share them with the community to earn extra voice slots!"
              action={
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleAddVoiceClick}
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  Record Your First Voice
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
                  <h3 className="text-sm font-semibold text-text-primary mb-1">Add New Voice</h3>
                  <p className="text-xs text-text-muted">
                    {voiceLimits.canAdd
                      ? `${voiceLimits.remainingCount} slot${voiceLimits.remainingCount === 1 ? "" : "s"} remaining`
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
                <h3 className="text-sm font-semibold text-text-primary mb-1">Community Voices</h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Approved voices shared by our community. All voices here are free to use in your
                  projects. Your approved voices appear here and don&apos;t count toward your voice
                  limit.
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
                <p className="text-sm text-status-error">{communityError}</p>
              </div>
            </Card>
          )}

          {/* Loading State */}
          {communityLoading ? (
            <LoadingSpinner size="lg" message="Loading community voices..." fullHeight />
          ) : communityVoices.length === 0 ? (
            /* Empty State */
            <EmptyState
              variant="bordered"
              size="lg"
              icon={<Globe className="h-12 w-12" />}
              title="No community voices yet"
              description="Community voices will appear here once users share their voices and they're approved by our team. Be the first to contribute!"
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
        title="Delete Voice"
        description="Are you sure you want to delete this voice? This action cannot be undone and the voice will be removed from all your projects."
        confirmText="Delete"
        cancelText="Cancel"
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
        title="Share Voice with Community"
        description="Your voice will be submitted for admin review. Once approved, it will be available to all users and won't count toward your voice limit. This helps build our community library!"
        confirmText="Share for Review"
        cancelText="Cancel"
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
        title="Make Voice Private"
        description="Your voice will be withdrawn from review and made private again. It will only be accessible to you and will count toward your voice limit."
        confirmText="Make Private"
        cancelText="Cancel"
        variant="default"
        loading={unsharing}
      />
    </div>
  );
}
