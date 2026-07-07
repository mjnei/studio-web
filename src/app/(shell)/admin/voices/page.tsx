"use client";

import { useState, useEffect, useRef } from "react";
import {
  Mic,
  CheckCircle2,
  AlertCircle,
  Search,
  Loader,
  User,
  Play,
  Pause,
  Volume2,
  Clock,
  ThumbsUp,
  XCircle,
} from "lucide-react";
import { ConfirmModal } from "@/components/ui/modal";
import {
  adminGetPendingVoices,
  adminGetApprovedVoices,
  adminApproveVoice,
  adminUnapproveVoice,
  adminGetVoiceRecordings,
  getAdminRecordingAudioUrl,
} from "@/lib/api/admin";
import type { VoiceWithCreator } from "@/lib/types/api";

type Toast = {
  id: number;
  type: "success" | "error";
  message: string;
};

type ViewType = "pending" | "approved" | "all";

export default function AdminVoicesPage() {
  const [pendingVoices, setPendingVoices] = useState<VoiceWithCreator[]>([]);
  const [approvedVoices, setApprovedVoices] = useState<VoiceWithCreator[]>([]);
  const [allRecordings, setAllRecordings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewType, setViewType] = useState<ViewType>("pending");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [playingVoiceId, setPlayingVoiceId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [approveModal, setApproveModal] = useState<{
    open: boolean;
    voice: VoiceWithCreator | null;
  }>({ open: false, voice: null });

  const [unapproveModal, setUnapproveModal] = useState<{
    open: boolean;
    voice: VoiceWithCreator | null;
  }>({ open: false, voice: null });

  useEffect(() => {
    loadVoices();
  }, []);

  const loadVoices = async () => {
    setIsLoading(true);
    try {
      const [pending, approved, recordings] = await Promise.all([
        adminGetPendingVoices(),
        adminGetApprovedVoices(),
        adminGetVoiceRecordings(),
      ]);
      setPendingVoices(pending);
      setApprovedVoices(approved);
      setAllRecordings(recordings);
    } catch (error: any) {
      showToast("error", error.message || "Failed to load voices");
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const playVoiceAudio = async (voiceId: number) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      setPlayingVoiceId(voiceId);

      const { audio_url } = await getAdminRecordingAudioUrl(String(voiceId));

      const audio = new Audio(audio_url);
      audioRef.current = audio;

      audio.onerror = () => {
        showToast("error", "Failed to play audio");
        setPlayingVoiceId(null);
      };

      audio.onended = () => {
        setPlayingVoiceId(null);
      };

      await audio.play();
    } catch (error) {
      console.error("Audio playback error:", error);
      showToast("error", "Failed to play voice");
      setPlayingVoiceId(null);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingVoiceId(null);
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const handleApprove = (voice: VoiceWithCreator) => {
    setApproveModal({ open: true, voice });
  };

  const handleConfirmApprove = async () => {
    if (!approveModal.voice) return;
    try {
      await adminApproveVoice(approveModal.voice.id);
      showToast("success", `Approved "${approveModal.voice.name}" for public catalog`);
      await loadVoices();
      setApproveModal({ open: false, voice: null });
    } catch (error: any) {
      showToast("error", error.message || "Failed to approve voice");
    }
  };

  const handleUnapprove = (voice: VoiceWithCreator) => {
    setUnapproveModal({ open: true, voice });
  };

  const handleConfirmUnapprove = async () => {
    if (!unapproveModal.voice) return;
    try {
      await adminUnapproveVoice(unapproveModal.voice.id);
      showToast("success", `Revoked approval for "${unapproveModal.voice.name}"`);
      await loadVoices();
      setUnapproveModal({ open: false, voice: null });
    } catch (error: any) {
      showToast("error", error.message || "Failed to unapprove voice");
    }
  };

  const formatRelativeTime = (dateString: string | null | undefined) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  // Filter voices based on search and view type
  const getFilteredVoices = (): VoiceWithCreator[] => {
    let voices: VoiceWithCreator[] = [];

    if (viewType === "pending") {
      voices = pendingVoices;
    } else if (viewType === "approved") {
      voices = approvedVoices;
    } else {
      // "all" combines both pending and approved
      voices = [...pendingVoices, ...approvedVoices];
    }

    if (!searchTerm) return voices;

    const query = searchTerm.toLowerCase();
    return voices.filter(
      (v) =>
        v.name.toLowerCase().includes(query) || v.creator_username.toLowerCase().includes(query)
    );
  };

  const filteredVoices = getFilteredVoices();

  // Statistics
  const stats = {
    total: allRecordings.length,
    pending: pendingVoices.length,
    approved: approvedVoices.length,
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Toasts */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg ${
              toast.type === "success"
                ? "border-green-500/50 bg-green-500/10 text-green-600"
                : "border-red-500/50 bg-red-500/10 text-red-600"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-accent-primary to-purple-600 shadow-lg">
                <Mic className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-text-primary">Community Voices</h1>
            </div>
            <p className="text-text-secondary">
              Review and approve shared voices for the public catalog
            </p>
          </div>
        </div>

        {/* View Type Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-surface-raised border border-border-default w-fit">
          <button
            onClick={() => setViewType("pending")}
            className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold transition-all ${
              viewType === "pending"
                ? "bg-gradient-to-r from-orange-500 to-yellow-600 text-white shadow-lg shadow-orange-500/30"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-panel"
            }`}
          >
            <Clock className="h-4 w-4" />
            Pending
            <span
              className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                viewType === "pending" ? "bg-white/20" : "bg-orange-500/20 text-orange-600"
              }`}
            >
              {stats.pending}
            </span>
          </button>
          <button
            onClick={() => setViewType("approved")}
            className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold transition-all ${
              viewType === "approved"
                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-panel"
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            Approved
            <span
              className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                viewType === "approved" ? "bg-white/20" : "bg-green-500/20 text-green-600"
              }`}
            >
              {stats.approved}
            </span>
          </button>
          <button
            onClick={() => setViewType("all")}
            className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold transition-all ${
              viewType === "all"
                ? "bg-gradient-to-r from-accent-primary to-purple-600 text-white shadow-lg shadow-accent-primary/30"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-panel"
            }`}
          >
            <User className="h-4 w-4" />
            All Shared
            <span
              className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                viewType === "all" ? "bg-white/20" : "bg-surface-raised"
              }`}
            >
              {stats.pending + stats.approved}
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
                <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">
                  Total User Voices
                </p>
                <p className="text-3xl font-bold text-text-primary">{stats.total}</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/10">
                <Mic className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border-default bg-gradient-to-br from-surface-panel to-surface-raised p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">
                  Pending Approval
                </p>
                <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-orange-500/10">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border-default bg-gradient-to-br from-surface-panel to-surface-raised p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">
                  Approved
                </p>
                <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-500/10">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6">
        <div className="flex items-center gap-3 rounded-xl border-2 border-border-default bg-surface-panel px-4 py-3 focus-within:border-accent-primary transition-colors shadow-sm">
          <Search className="h-5 w-5 text-text-muted flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by voice name or creator username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent text-text-primary placeholder-text-muted focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-text-muted hover:text-text-primary transition-colors"
            >
              <span className="sr-only">Clear search</span>×
            </button>
          )}
        </div>
        {searchTerm && (
          <p className="mt-2 text-xs text-text-muted">
            Found {filteredVoices.length} voice{filteredVoices.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Voices List */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader className="h-8 w-8 animate-spin text-accent-primary" />
            <p className="text-sm text-text-muted">Loading voices...</p>
          </div>
        </div>
      ) : filteredVoices.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border-default">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent-primary/10">
              {viewType === "pending" ? (
                <Clock className="h-8 w-8 text-accent-primary" />
              ) : (
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              )}
            </div>
            <h3 className="mb-2 text-lg font-semibold text-text-primary">
              {searchTerm ? "No voices found" : `No ${viewType} voices`}
            </h3>
            <p className="text-sm text-text-muted">
              {searchTerm
                ? "Try adjusting your search criteria"
                : viewType === "pending"
                  ? "User-shared voices will appear here for your approval"
                  : "Approved voices will appear here"}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2 rounded-2xl border border-border-default bg-surface-panel overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid md:grid-cols-12 gap-4 border-b border-border-default bg-surface-raised/50 px-6 py-3 text-sm font-semibold text-text-secondary">
            <div className="col-span-3">Voice Name</div>
            <div className="col-span-2">Creator</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Timestamp</div>
            <div className="col-span-3">Actions</div>
          </div>

          {/* Table Rows */}
          {filteredVoices.map((voice) => (
            <div
              key={voice.id}
              className="border-b border-border-default last:border-0 hover:bg-surface-raised/50 transition-colors"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center">
                <div className="col-span-1 md:col-span-3">
                  <p className="text-sm font-semibold text-text-primary">{voice.name}</p>
                  {voice.duration_seconds && (
                    <p className="mt-1 text-xs text-text-secondary">
                      {Math.floor(voice.duration_seconds / 60)}:
                      {String(Math.floor(voice.duration_seconds % 60)).padStart(2, "0")}
                    </p>
                  )}
                </div>
                <div className="col-span-1 md:col-span-2">
                  <div className="md:hidden text-xs font-medium text-text-muted mb-1">Creator</div>
                  <p className="text-sm text-text-secondary flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />@{voice.creator_username}
                  </p>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <div className="md:hidden text-xs font-medium text-text-muted mb-1">Status</div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                      voice.is_approved
                        ? "bg-green-500/10 text-green-600 border border-green-500/30"
                        : "bg-orange-500/10 text-orange-600 border border-orange-500/30"
                    }`}
                  >
                    {voice.is_approved ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Approved
                      </>
                    ) : (
                      <>
                        <Clock className="h-3.5 w-3.5" />
                        Pending
                      </>
                    )}
                  </span>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <div className="md:hidden text-xs font-medium text-text-muted mb-1">
                    {voice.is_approved ? "Approved" : "Shared"}
                  </div>
                  <p className="text-sm text-text-secondary">
                    {voice.is_approved
                      ? formatRelativeTime(voice.admin_approved_at)
                      : formatRelativeTime(voice.created_at)}
                  </p>
                </div>
                <div className="col-span-1 md:col-span-3 flex flex-wrap items-center gap-2">
                  <div className="md:hidden text-xs font-medium text-text-muted mb-1 w-full">
                    Actions
                  </div>
                  <button
                    onClick={() => {
                      if (playingVoiceId === voice.id) {
                        stopAudio();
                      } else {
                        playVoiceAudio(voice.id);
                      }
                    }}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-all shadow-sm ${
                      playingVoiceId === voice.id
                        ? "bg-gradient-to-r from-accent-primary to-purple-600 text-white shadow-accent-primary/30"
                        : "border-2 border-border-default bg-surface-base text-text-secondary hover:border-accent-primary hover:text-accent-primary hover:bg-accent-primary/5"
                    }`}
                  >
                    {playingVoiceId === voice.id ? (
                      <>
                        <Pause className="h-4 w-4" />
                        <Volume2 className="h-4 w-4 animate-pulse" />
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        <span className="hidden md:inline">Preview</span>
                      </>
                    )}
                  </button>

                  {!voice.is_approved ? (
                    <button
                      onClick={() => handleApprove(voice)}
                      className="flex items-center gap-1.5 rounded-lg border-2 border-green-500/50 bg-green-500/10 px-3 py-2 text-sm font-medium text-green-600 hover:bg-green-500/20 transition-all"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span className="hidden md:inline">Approve</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUnapprove(voice)}
                      className="flex items-center gap-1.5 rounded-lg border-2 border-orange-500/50 bg-orange-500/10 px-3 py-2 text-sm font-medium text-orange-600 hover:bg-orange-500/20 transition-all"
                    >
                      <XCircle className="h-4 w-4" />
                      <span className="hidden md:inline">Revoke</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Approve Confirmation Modal */}
      <ConfirmModal
        open={approveModal.open}
        onClose={() => setApproveModal({ open: false, voice: null })}
        onConfirm={handleConfirmApprove}
        title="Approve Voice"
        description={`Approve "${approveModal.voice?.name}" by @${approveModal.voice?.creator_username} for the public catalog?`}
        confirmText="Approve"
        cancelText="Cancel"
        variant="success"
      />

      {/* Unapprove Confirmation Modal */}
      <ConfirmModal
        open={unapproveModal.open}
        onClose={() => setUnapproveModal({ open: false, voice: null })}
        onConfirm={handleConfirmUnapprove}
        title="Revoke Approval"
        description={`Revoke approval for "${unapproveModal.voice?.name}"? This will remove it from the public catalog.`}
        confirmText="Revoke"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
