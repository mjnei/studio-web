"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Mic,
  CheckCircle2,
  Search,
  User,
  Play,
  Pause,
  Clock,
  Upload,
  Pencil,
} from "lucide-react";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { VoiceBulkImportModal } from "@/components/admin/VoiceBulkImportModal";
import { VoiceEditModal } from "@/components/admin/VoiceEditModal";
import { VoiceAvatarModal } from "@/components/admin/VoiceAvatarModal";
import {
  adminGetVoiceRecordings,
  adminGetAllVoices,
  adminApproveVoice,
  getAdminRecordingAudioUrl,
} from "@/lib/api/admin";
import { useVoiceAudioPlayback } from "@/lib/hooks/use-voice-audio-playback";
import { formatRelativeTimeCompact } from "@/lib/utils/time-format";
import { locales, voiceLanguageNames, type Locale } from "@/i18n";
import type { VoiceWithCreator } from "@/lib/types/api";

type ViewType = "pending" | "approved" | "all";

const LANGUAGE_FILTER_OPTIONS = [
  { value: "all", label: "All languages" },
  ...locales.map((code) => ({
    value: code,
    label: `${voiceLanguageNames[code]} (${code})`,
  })),
];

function isPendingVoice(voice: VoiceWithCreator) {
  return voice.is_shared && !voice.is_approved;
}

function isApprovedVoice(voice: VoiceWithCreator) {
  return voice.is_approved;
}

export default function AdminVoicesPage() {
  const toast = useToast();
  const [allVoices, setAllVoices] = useState<VoiceWithCreator[]>([]);
  const [allRecordings, setAllRecordings] = useState<Record<string, unknown>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [languageFilter, setLanguageFilter] = useState<"all" | Locale>("all");
  const [viewType, setViewType] = useState<ViewType>("pending");
  const audioUrlCacheRef = useRef(new Map<number, string>());
  const { togglePlayback, playingVoiceId, loadingVoiceId } = useVoiceAudioPlayback({
    onError: (error) => {
      if (error === "unavailable") {
        toast.error("Audio unavailable", "Audio preview URL is not available for this voice.");
        return;
      }

      toast.error(
        "Audio playback failed",
        error === "play_failed" ? "Failed to play audio" : "Failed to load audio"
      );
    },
  });

  const [bulkImportModal, setBulkImportModal] = useState(false);
  const [editModal, setEditModal] = useState<{
    open: boolean;
    voice: VoiceWithCreator | null;
  }>({ open: false, voice: null });
  const [avatarModal, setAvatarModal] = useState<{
    open: boolean;
    voice: VoiceWithCreator | null;
  }>({ open: false, voice: null });
  const [approvingVoiceId, setApprovingVoiceId] = useState<number | null>(null);

  const pendingVoices = allVoices.filter(isPendingVoice);
  const approvedVoices = allVoices.filter(isApprovedVoice);

  const applyUpdatedVoice = useCallback((updated: VoiceWithCreator) => {
    setAllVoices((prev) => prev.map((v) => (v.id === updated.id ? { ...v, ...updated } : v)));
    setEditModal((prev) =>
      prev.voice?.id === updated.id ? { ...prev, voice: { ...prev.voice, ...updated } } : prev
    );
    setAvatarModal((prev) =>
      prev.voice?.id === updated.id ? { ...prev, voice: { ...prev.voice, ...updated } } : prev
    );
  }, []);

  const loadVoices = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!opts?.silent) {
        setIsLoading(true);
      }
      try {
        const [voices, recordings] = await Promise.all([
          adminGetAllVoices(),
          adminGetVoiceRecordings(),
        ]);
        setAllVoices(voices);
        setAllRecordings(recordings);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "An error occurred";
        toast.error("Failed to load voices", message);
      } finally {
        if (!opts?.silent) {
          setIsLoading(false);
        }
      }
    },
    [toast]
  );

  // Initial load
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadVoices();
  }, [loadVoices]);

  const resolveAudioUrl = useCallback(async (voiceId: number) => {
    const cached = audioUrlCacheRef.current.get(voiceId);
    if (cached) return cached;

    const data = await getAdminRecordingAudioUrl(String(voiceId));
    audioUrlCacheRef.current.set(voiceId, data.audio_url);
    return data.audio_url;
  }, []);

  const handlePreviewToggle = (voice: VoiceWithCreator) => {
    void togglePlayback(voice.id, () => resolveAudioUrl(voice.id));
  };

  const handleApprove = async (voice: VoiceWithCreator) => {
    if (approvingVoiceId !== null) return;
    setApprovingVoiceId(voice.id);
    try {
      const result = await adminApproveVoice(voice.id);
      toast.success("Voice approved", `"${voice.name}" is now in the public catalog`);
      applyUpdatedVoice({ ...voice, ...result });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An error occurred";
      toast.error("Failed to approve voice", message);
    } finally {
      setApprovingVoiceId(null);
    }
  };

  const formatAbsoluteTime = (dateString: string | null | undefined) => {
    if (!dateString) return undefined;
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return undefined;
    return date.toLocaleString();
  };

  const getFilteredVoices = (): VoiceWithCreator[] => {
    let voices: VoiceWithCreator[] = [];

    if (viewType === "pending") {
      voices = pendingVoices;
    } else if (viewType === "approved") {
      voices = approvedVoices;
    } else {
      voices = allVoices;
    }

    if (languageFilter !== "all") {
      voices = voices.filter((v) => v.language === languageFilter);
    }

    if (!searchTerm) return voices;

    const query = searchTerm.toLowerCase();
    return voices.filter(
      (v) =>
        v.name.toLowerCase().includes(query) || v.creator_username.toLowerCase().includes(query)
    );
  };

  const filteredVoices = getFilteredVoices();
  const hasActiveFilters = Boolean(searchTerm) || languageFilter !== "all";

  const stats = {
    total: allRecordings.length,
    pending: pendingVoices.length,
    approved: approvedVoices.length,
    allShared: allVoices.length,
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-accent-primary to-purple-600 shadow-lg">
                <Mic className="h-6 w-6 text-white" />
              </div>
              <Heading variant="page" className="text-text-primary">
                Community Voices
              </Heading>
            </div>
            <p className="text-text-secondary">
              Review and approve shared voices for the public catalog
            </p>
          </div>

          <Button
            size="md"
            onClick={() => setBulkImportModal(true)}
            leftIcon={<Upload className="h-4 w-4" />}
          >
            Bulk Import
          </Button>
        </div>

        {/* View Type Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-surface-raised border border-border-default w-fit">
          <button
            onClick={() => setViewType("pending")}
            className={`flex h-9 items-center gap-2 rounded-lg px-3.5 py-0 text-body font-semibold transition-all ${
              viewType === "pending"
                ? "bg-gradient-to-r from-orange-500 to-yellow-600 text-white shadow-lg shadow-orange-500/30"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-panel"
            }`}
          >
            <Clock className="h-4 w-4" />
            Pending
            <span
              className={`ml-1 px-2 py-0.5 rounded-full text-caption font-bold ${
                viewType === "pending" ? "bg-white/20" : "bg-orange-500/20 text-orange-600"
              }`}
            >
              {stats.pending}
            </span>
          </button>
          <button
            onClick={() => setViewType("approved")}
            className={`flex h-9 items-center gap-2 rounded-lg px-3.5 py-0 text-body font-semibold transition-all ${
              viewType === "approved"
                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-panel"
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            Approved
            <span
              className={`ml-1 px-2 py-0.5 rounded-full text-caption font-bold ${
                viewType === "approved" ? "bg-white/20" : "bg-green-500/20 text-green-600"
              }`}
            >
              {stats.approved}
            </span>
          </button>
          <button
            onClick={() => setViewType("all")}
            className={`flex h-9 items-center gap-2 rounded-lg px-3.5 py-0 text-body font-semibold transition-all ${
              viewType === "all"
                ? "bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-500/30"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-panel"
            }`}
          >
            <User className="h-4 w-4" />
            All Voices
            <span
              className={`ml-1 px-2 py-0.5 rounded-full text-caption font-bold ${
                viewType === "all" ? "bg-white/20" : "bg-blue-500/20 text-blue-600"
              }`}
            >
              {stats.allShared}
            </span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {!isLoading && (
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border-default bg-gradient-to-br from-surface-panel to-surface-raised p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption font-medium text-text-muted uppercase tracking-wider mb-1">
                  Total User Voices
                </p>
                <Heading variant="metric" className="text-text-primary">
                  {stats.total}
                </Heading>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/10">
                <Mic className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border-default bg-gradient-to-br from-surface-panel to-surface-raised p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption font-medium text-text-muted uppercase tracking-wider mb-1">
                  Pending Approval
                </p>
                <Heading variant="metric" className="text-orange-600">
                  {stats.pending}
                </Heading>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-orange-500/10">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border-default bg-gradient-to-br from-surface-panel to-surface-raised p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-caption font-medium text-text-muted uppercase tracking-wider mb-1">
                  Approved
                </p>
                <Heading variant="metric" className="text-green-600">
                  {stats.approved}
                </Heading>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-500/10">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search + Language Filter */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Search by voice name or creator username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="h-4 w-4" />}
            rightIcon={
              searchTerm ? (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="text-text-muted hover:text-text-primary transition-colors"
                  aria-label="Clear search"
                >
                  ×
                </button>
              ) : undefined
            }
          />
        </div>
        <div className="w-full sm:w-56">
          <Select
            value={languageFilter}
            onChange={(value) => setLanguageFilter(value as "all" | Locale)}
            options={LANGUAGE_FILTER_OPTIONS}
            placeholder="Language"
          />
        </div>
      </div>
      {hasActiveFilters && (
        <p className="mb-4 -mt-3 text-caption text-text-muted">
          Found {filteredVoices.length} voice{filteredVoices.length !== 1 ? "s" : ""}
          {languageFilter !== "all" ? ` in ${languageFilter}` : ""}
        </p>
      )}

      {/* Voices List */}
      {isLoading ? (
        <LoadingSpinner size="lg" message="Loading voices..." fullHeight />
      ) : filteredVoices.length === 0 ? (
        <EmptyState
          variant="default"
          icon={
            viewType === "pending" ? (
              <Clock aria-hidden />
            ) : viewType === "approved" ? (
              <CheckCircle2 aria-hidden />
            ) : (
              <Mic aria-hidden />
            )
          }
          title={hasActiveFilters ? "No voices found" : `No ${viewType} voices`}
          description={
            hasActiveFilters
              ? "Try adjusting your search or language filter"
              : viewType === "pending"
                ? "User-shared voices will appear here for your approval"
                : viewType === "approved"
                  ? "Approved voices will appear here"
                  : "All voices from all users will appear here"
          }
        />
      ) : (
        <div className="space-y-2 rounded-2xl border border-border-default bg-surface-panel overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid md:grid-cols-12 gap-4 border-b border-border-default bg-surface-raised/50 px-6 py-3 text-body font-semibold text-text-secondary">
            <div className="col-span-3">Voice</div>
            <div className="col-span-2">Creator</div>
            <div className="col-span-1">Lang</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Timestamp</div>
            <div className="col-span-2">Actions</div>
          </div>

          {/* Table Rows */}
          {filteredVoices.map((voice) => {
            const timestampValue = voice.is_approved ? voice.admin_approved_at : voice.created_at;
            const isPending = voice.is_shared && !voice.is_approved;

            return (
              <div
                key={voice.id}
                className="border-b border-border-default last:border-0 hover:bg-surface-raised/50 transition-colors"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center">
                  <div className="col-span-1 md:col-span-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={() => setAvatarModal({ open: true, voice })}
                        className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-border-default bg-surface-raised transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
                        aria-label={`Manage avatar for ${voice.name}`}
                        title="Manage avatar"
                      >
                        {voice.creator_avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={voice.creator_avatar_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-text-muted">
                            <User className="h-4 w-4" />
                          </div>
                        )}
                      </button>
                      <div className="min-w-0">
                        <p className="text-body font-semibold text-text-primary truncate">
                          {voice.name}
                        </p>
                        {voice.duration_seconds && (
                          <p className="mt-1 text-caption text-text-secondary">
                            {Math.floor(voice.duration_seconds / 60)}:
                            {String(Math.floor(voice.duration_seconds % 60)).padStart(2, "0")}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <div className="md:hidden text-caption font-medium text-text-muted mb-1">
                      Creator
                    </div>
                    <p className="text-body text-text-secondary truncate">
                      @{voice.creator_username}
                    </p>
                  </div>
                  <div className="col-span-1 md:col-span-1">
                    <div className="md:hidden text-caption font-medium text-text-muted mb-1">
                      Language
                    </div>
                    <p className="text-body text-text-secondary">{voice.language || "—"}</p>
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <div className="md:hidden text-caption font-medium text-text-muted mb-1">
                      Status
                    </div>
                    {!voice.is_shared ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-caption font-bold bg-gray-500/10 text-gray-600 border border-gray-500/30">
                        <User className="h-3.5 w-3.5" />
                        Private
                      </span>
                    ) : voice.is_approved ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-caption font-bold bg-green-500/10 text-green-600 border border-green-500/30">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-caption font-bold bg-orange-500/10 text-orange-600 border border-orange-500/30">
                        <Clock className="h-3.5 w-3.5" />
                        Pending
                      </span>
                    )}
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <div className="md:hidden text-caption font-medium text-text-muted mb-1">
                      {voice.is_approved ? "Approved" : "Shared"}
                    </div>
                    <p
                      className="text-body text-text-secondary cursor-default"
                      title={formatAbsoluteTime(timestampValue)}
                    >
                      {formatRelativeTimeCompact(timestampValue, "Unknown")}
                    </p>
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <div className="md:hidden text-caption font-medium text-text-muted mb-1">
                      Actions
                    </div>
                    <div className="flex items-center gap-1.5 flex-nowrap">
                      {isPending && (
                        <Button
                          size="icon"
                          variant="success"
                          onClick={() => void handleApprove(voice)}
                          className="shrink-0 h-8 w-8"
                          aria-label={`Approve ${voice.name}`}
                          title="Approve"
                          disabled={approvingVoiceId !== null}
                        >
                          {approvingVoiceId === voice.id ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={() => setEditModal({ open: true, voice })}
                        className="shrink-0 h-8 w-8"
                        aria-label={`Edit ${voice.name}`}
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant={playingVoiceId === voice.id ? "primary" : "secondary"}
                        onClick={() => handlePreviewToggle(voice)}
                        className="shrink-0 h-8 w-8"
                        aria-label={
                          playingVoiceId === voice.id
                            ? `Pause preview of ${voice.name}`
                            : `Preview ${voice.name}`
                        }
                        title={playingVoiceId === voice.id ? "Pause" : "Preview"}
                        disabled={loadingVoiceId !== null && loadingVoiceId !== voice.id}
                      >
                        {loadingVoiceId === voice.id ? (
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />
                        ) : playingVoiceId === voice.id ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <VoiceBulkImportModal
        open={bulkImportModal}
        onClose={() => setBulkImportModal(false)}
        onSuccess={() => {
          void loadVoices();
        }}
      />

      {editModal.voice ? (
        <VoiceEditModal
          key={editModal.voice.id}
          open={editModal.open}
          voice={editModal.voice}
          onClose={() => setEditModal({ open: false, voice: null })}
          onSaved={applyUpdatedVoice}
        />
      ) : null}

      {avatarModal.voice ? (
        <VoiceAvatarModal
          key={avatarModal.voice.id}
          open={avatarModal.open}
          voice={avatarModal.voice}
          onClose={() => setAvatarModal({ open: false, voice: null })}
          onSaved={applyUpdatedVoice}
        />
      ) : null}
    </div>
  );
}
