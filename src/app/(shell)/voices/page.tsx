"use client";

import { useState, useEffect } from "react";
import { Plus, Mic, Globe, User, AlertCircle, CheckCircle, Play, Clock, Trash2 } from "lucide-react";
import { VoiceRecordingModal } from "@/components/shared/voice-recording-modal";
import { VoiceRecordingCard } from "@/components/voices/voice-recording-card";
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
import { getAvailableVoices } from "@/lib/api/voice-client";
import type { VoiceWithCreator } from "@/lib/types/api";

/**
 * Format relative time for display
 * @param dateString ISO date string
 * @returns Relative time like "3 days ago"
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
  
  // State for delete confirmation on community tab
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [voiceToDelete, setVoiceToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filter private voices: exclude those that are shared AND approved (they appear in community tab)
  const privateVoices = voices.filter((voice) => !(voice.is_shared && voice.is_approved));

  // Fetch all community voices when switching to community tab
  useEffect(() => {
    if (tab === "community") {
      const fetchCommunityVoices = async () => {
        setCommunityLoading(true);
        try {
          const data = await getAvailableVoices();
          // Backend returns community_voices: approved shared voices from ALL users (including current user)
          // community_voices are filtered: is_shared=TRUE AND is_approved=TRUE AND is_deleted=FALSE
          setCommunityVoices(data.community_voices);
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
    // Refetch to get the newly uploaded voice through the hook
    await refetch();
    setShowRecorder(false);
    // Refresh voice limits after adding a voice
    await voiceLimits.refetch();
  };

  const handleAddVoiceClick = () => {
    // Check limits before opening recorder
    if (!voiceLimits.canAdd) {
      setShowLimitDialog(true);
      return;
    }
    setShowRecorder(true);
  };

  const handleUpgradeClick = () => {
    setShowLimitDialog(false);
    // Navigate to pricing/upgrade page
    window.location.href = "/pricing";
  };

  const handleDeleteVoice = async (id: number) => {
    try {
      await deleteVoice(id);
      // Refresh voice limits after deleting a voice
      await voiceLimits.refetch();
    } catch (err) {
      console.error("Failed to delete voice:", err);
      throw err;
    }
  };

  const handleToggleSharingVoice = async (id: number, isShared: boolean) => {
    try {
      await toggleSharing(id, isShared);
    } catch (err) {
      console.error("Failed to toggle sharing:", err);
      throw err;
    }
  };

  const handleSharingToggled = () => {
    // Refetch voices to get updated sharing status
    refetch();
  };
  
  // Community tab: delete handler
  const handleCommunityDeleteClick = (voiceId: number) => {
    setVoiceToDelete(voiceId);
    setDeleteConfirmOpen(true);
  };
  
  const handleCommunityDeleteConfirm = async () => {
    if (!voiceToDelete) return;
    
    setDeleting(true);
    try {
      await deleteVoice(voiceToDelete);
      toast.success("Voice deleted successfully");
      setDeleteConfirmOpen(false);
      setVoiceToDelete(null);
      // Refresh both lists
      await refetch();
      await voiceLimits.refetch();
      // Refetch community voices to update the list
      const data = await getAvailableVoices();
      setCommunityVoices(data.community_voices);
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
          {/* Private Voices Tab */}
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
                  tab === "private" ? "bg-white/20 text-white" : "bg-surface-elevated text-text-muted"
                }`}
              >
                {privateVoices.length}
              </span>
            )}
          </button>

          {/* Community Voices Tab */}
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
                  tab === "community" ? "bg-white/20 text-white" : "bg-surface-elevated text-text-muted"
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
              description="Start by recording a voice sample from your microphone. Your voice will be cloned and ready to use in your projects. Shared and approved voices appear in the Community tab."
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
                <VoiceRecordingCard
                  key={voice.id}
                  recording={voice}
                  onDelete={handleDeleteVoice}
                  onToggleSharing={handleToggleSharingVoice}
                  onSharingToggled={handleSharingToggled}
                />
              ))}

              {/* Add Voice Card - Always visible when voices exist */}
              <Card
                variant="default"
                padding="md"
                className="border-dashed hover:border-accent-primary/50 hover:bg-accent-primary/5 transition-all cursor-pointer group"
                onClick={handleAddVoiceClick}
              >
                <div className="flex flex-col items-center justify-center h-full min-h-[180px] text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent-primary/10 group-hover:bg-accent-primary/20 transition-colors">
                    <Plus className="h-6 w-6 text-accent-primary" />
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary mb-1">Add New Voice</h3>
                  <p className="text-xs text-text-muted">
                    {voiceLimits.canAdd
                      ? `${voiceLimits.remainingCount} of ${voiceLimits.limit} slots remaining`
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
                <h3 className="text-sm font-semibold text-text-primary mb-1">
                  Community Voices
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  These voices have been shared and approved by our team. All community voices are available for use in your projects. You can delete your own shared voices from here.
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
              description="Community voices will appear here once users share their voices and they're approved by our team."
            />
          ) : (
            /* Community Voices Grid */
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {communityVoices.map((voice) => {
                // Check if this voice belongs to the current user (compare as numbers)
                const isOwnVoice = user && voice.user_id === parseInt(user.id, 10);
                
                return (
                  <Card
                    key={voice.id}
                    variant="elevated"
                    padding="md"
                    className="group hover:border-accent-cyan/40 hover:shadow-lg hover:shadow-accent-cyan/10 transition-all duration-200"
                  >
                    {/* Voice Header */}
                    <div className="mb-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-text-primary text-base truncate group-hover:text-accent-cyan transition-colors flex-1">
                          {voice.name}
                        </h3>
                        
                        {/* Actions: Delete (if own voice) or Approved badge */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {isOwnVoice ? (
                            <button
                              onClick={() => handleCommunityDeleteClick(voice.id)}
                              className="p-1.5 text-text-muted hover:text-red-400 transition-colors"
                              title="Delete your shared voice"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 border border-green-500/30 px-2 py-0.5 text-xs font-bold text-green-600">
                              <CheckCircle className="h-3 w-3" />
                              Approved
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Creator Info */}
                    <div className="mb-4 space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/10 flex-shrink-0">
                          <User className="h-3.5 w-3.5 text-purple-600" />
                        </div>
                        <span className="text-text-secondary font-medium truncate">
                          by @{voice.creator_username}
                          {isOwnVoice && <span className="text-accent-primary ml-1">(you)</span>}
                        </span>
                      </div>

                      {/* Voice Details */}
                      <div className="flex items-center gap-2 text-xs text-text-muted flex-wrap">
                        {voice.admin_approved_at && (
                          <>
                            <Clock className="h-3 w-3" />
                            <span>{formatRelativeTime(voice.admin_approved_at)}</span>
                          </>
                        )}
                        {voice.duration_seconds && (
                          <>
                            {voice.admin_approved_at && <span>•</span>}
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

                    {/* Placeholder for preview - will be available in project workflow */}
                    <div className="pt-3 border-t border-border-subtle">
                      <div className="flex items-center justify-center gap-2 text-xs text-text-muted italic">
                        <Play className="h-3 w-3" />
                        <span>Preview available in projects</span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
          
          {/* Delete Confirmation Modal for Community Voices */}
          <ConfirmModal
            open={deleteConfirmOpen}
            onClose={() => {
              setDeleteConfirmOpen(false);
              setVoiceToDelete(null);
            }}
            onConfirm={handleCommunityDeleteConfirm}
            title="Delete Shared Voice"
            description="Are you sure you want to delete this shared voice? It will be removed from the community library and you won't be able to recover it."
            confirmText="Delete"
            cancelText="Cancel"
            variant="danger"
            loading={deleting}
          />
        </div>
      )}
    </div>
  );
}
