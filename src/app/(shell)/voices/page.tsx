"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Mic, Globe, User, AlertCircle } from "lucide-react";
import { VoiceRecorder } from "@/components/shared/voice-recorder";
import { VoiceRecordingCard } from "@/components/voices/voice-recording-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/PageHeader";
import { useVoices } from "@/lib/hooks/use-voices";
import { getAvailableVoices } from "@/lib/api/voice-client";
import type { VoiceResponse, VoiceWithCreator } from "@/lib/types/api";

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

export default function VoicesPage() {
  const [tab, setTab] = useState<"my" | "community">("my");
  const [showRecorder, setShowRecorder] = useState(false);
  const { voices, loading, error, uploadVoice, deleteVoice, toggleSharing, refetch } = useVoices();

  const [communityVoices, setCommunityVoices] = useState<VoiceWithCreator[]>([]);
  const [communityLoading, setCommunityLoading] = useState(false);
  const [communityError, setCommunityError] = useState<string | null>(null);

  const [playingVoiceId, setPlayingVoiceId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch community voices when switching to community tab
  useEffect(() => {
    if (tab === "community" && communityVoices.length === 0) {
      setCommunityLoading(true);
      getAvailableVoices()
        .then((data) => {
          setCommunityVoices(data.community_voices);
          setCommunityError(null);
        })
        .catch((err) => {
          setCommunityError(err instanceof Error ? err.message : "Failed to load community voices");
        })
        .finally(() => {
          setCommunityLoading(false);
        });
    }
  }, [tab, communityVoices.length]);

  const handleRecordingSaved = async (newRecording: any) => {
    // VoiceRecorder component still uses the old upload function
    // Refetch to get the newly uploaded voice through the hook
    await refetch();
    setShowRecorder(false);
  };

  const handleDeleteVoice = async (id: number) => {
    try {
      await deleteVoice(id);
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

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingVoiceId(null);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title="Voice Library"
        description="Create custom voices and discover community-shared voices for your projects"
        action={
          tab === "my" && !showRecorder ? (
            <Button
              variant="primary"
              size="md"
              onClick={() => setShowRecorder(true)}
              className="w-full sm:w-auto shadow-lg shadow-accent-primary/20"
            >
              <Plus size={18} className="mr-2" />
              Record New Voice
            </Button>
          ) : undefined
        }
      />

      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-xl bg-surface-panel p-1.5 shadow-sm border border-border-default">
          {/* My Voices Tab */}
          <button
            onClick={() => setTab("my")}
            className={`relative flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold transition-all duration-200 ${
              tab === "my"
                ? "bg-gradient-to-r from-accent-primary to-purple-600 text-white shadow-lg shadow-accent-primary/30"
                : "text-text-muted hover:text-text-secondary hover:bg-surface-raised"
            }`}
          >
            <Mic className="h-4 w-4" />
            <span>My Voices</span>
            {voices.length > 0 && (
              <span
                className={`ml-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                  tab === "my" ? "bg-white/20" : "bg-surface-raised"
                }`}
              >
                {voices.length}
              </span>
            )}
          </button>

          {/* Community Voices Tab */}
          <button
            onClick={() => setTab("community")}
            className={`relative flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold transition-all duration-200 ${
              tab === "community"
                ? "bg-gradient-to-r from-accent-primary to-purple-600 text-white shadow-lg shadow-accent-primary/30"
                : "text-text-muted hover:text-text-secondary hover:bg-surface-raised"
            }`}
          >
            <Globe className="h-4 w-4" />
            <span>Community</span>
            {communityVoices.length > 0 && (
              <span
                className={`ml-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                  tab === "community" ? "bg-white/20" : "bg-surface-raised"
                }`}
              >
                {communityVoices.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content Area */}
      {tab === "my" ? (
        <div>
          {/* Voice Recorder */}
          {showRecorder && (
            <Card variant="elevated" padding="lg" className="mb-8 border-accent-purple/30">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-text-primary">Record New Voice</h2>
                <Button variant="secondary" size="sm" onClick={() => setShowRecorder(false)}>
                  Cancel
                </Button>
              </div>
              <VoiceRecorder onSaved={handleRecordingSaved} />
            </Card>
          )}

          {/* Error Message */}
          {error && (
            <Card
              variant="elevated"
              padding="md"
              className="mb-6 border-status-failed/30 bg-status-failed/10"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-status-failed flex-shrink-0 mt-0.5" />
                <p className="text-sm text-status-failed">{error}</p>
              </div>
            </Card>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-48 animate-pulse rounded-xl bg-surface-panel border border-border-default"
                />
              ))}
            </div>
          ) : voices.length === 0 ? (
            /* Empty State */
            <Card variant="default" padding="lg" className="text-center border-dashed">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent-primary/10">
                <Mic className="h-8 w-8 text-accent-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-text-primary">No voices yet</h3>
              <p className="mb-6 text-sm text-text-muted max-w-md mx-auto">
                Start by recording a voice sample from your microphone. Your voice will be cloned
                and ready to use in your projects.
              </p>
              {!showRecorder && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setShowRecorder(true)}
                  className="shadow-lg shadow-accent-primary/20"
                >
                  <Plus size={18} className="mr-2" />
                  Record Your First Voice
                </Button>
              )}
            </Card>
          ) : (
            /* Voice Recordings Grid */
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {voices.map((voice) => (
                <VoiceRecordingCard
                  key={voice.id}
                  recording={voice}
                  onDelete={handleDeleteVoice}
                  onToggleSharing={handleToggleSharingVoice}
                  onSharingToggled={handleSharingToggled}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Community Voices Tab */
        <div>
          {/* Info Banner */}
          <Card variant="default" padding="md" className="mb-6 border-accent-cyan/30">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-cyan/10 flex-shrink-0">
                <Globe className="h-5 w-5 text-accent-cyan" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-text-primary mb-1">Community Voices</h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  Discover voices shared by other users and approved by our team. Use these voices
                  in your projects alongside your own recordings.
                </p>
              </div>
            </div>
          </Card>

          {/* Error Message */}
          {communityError && (
            <Card
              variant="elevated"
              padding="md"
              className="mb-6 border-status-failed/30 bg-status-failed/10"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-status-failed flex-shrink-0 mt-0.5" />
                <p className="text-sm text-status-failed">{communityError}</p>
              </div>
            </Card>
          )}

          {/* Loading State */}
          {communityLoading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-56 animate-pulse rounded-xl bg-surface-panel border border-border-default"
                />
              ))}
            </div>
          ) : communityVoices.length === 0 ? (
            /* Empty State */
            <Card variant="default" padding="lg" className="text-center border-dashed">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent-cyan/10">
                <Globe className="h-8 w-8 text-accent-cyan" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-text-primary">
                No community voices yet
              </h3>
              <p className="text-sm text-text-muted max-w-md mx-auto">
                Community voices will appear here once users share their voices and they're approved
                by our team.
              </p>
            </Card>
          ) : (
            /* Community Voices Grid */
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {communityVoices.map((voice) => (
                <Card
                  key={voice.id}
                  variant="elevated"
                  padding="md"
                  className="group hover:border-accent-cyan/40 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                >
                  {/* Voice Header */}
                  <div className="mb-4">
                    <h3 className="font-semibold text-text-primary text-lg mb-1 truncate group-hover:text-accent-cyan transition-colors">
                      {voice.name}
                    </h3>
                  </div>

                  {/* Creator Info */}
                  <div className="mb-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/10 flex-shrink-0">
                        <User className="h-3.5 w-3.5 text-purple-600" />
                      </div>
                      <span className="text-text-secondary font-medium">
                        by @{voice.creator_username}
                      </span>
                    </div>

                    {voice.admin_approved_at && (
                      <div className="flex items-center gap-1.5 text-xs text-status-completed">
                        <div className="h-1 w-1 rounded-full bg-status-completed"></div>
                        <span>Approved {formatRelativeTime(voice.admin_approved_at)}</span>
                      </div>
                    )}

                    {voice.duration_seconds && (
                      <div className="text-xs text-text-muted">
                        Duration: {Math.floor(voice.duration_seconds / 60)}:
                        {(voice.duration_seconds % 60).toFixed(0).padStart(2, "0")}
                      </div>
                    )}
                  </div>

                  {/* Action Button - Placeholder for future preview functionality */}
                  <div className="pt-3 border-t border-border-subtle">
                    <div className="text-xs text-text-muted text-center italic">
                      Preview available in projects
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
