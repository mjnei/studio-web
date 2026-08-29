"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Mic,
  CheckCircle2,
  Search,
  User,
  Play,
  Pause,
  Volume2,
  Clock,
  ThumbsUp,
  XCircle,
  Upload,
} from "lucide-react";
import { ConfirmModal } from "@/components/ui/modal";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { VoiceBulkImportModal } from "@/components/admin/VoiceBulkImportModal";
import {
  adminGetPendingVoices,
  adminGetApprovedVoices,
  adminApproveVoice,
  adminUnapproveVoice,
  adminGetVoiceRecordings,
  adminGetAllVoices,
  attachAdminVoiceAudioUrls,
} from "@/lib/api/admin";
import { useVoiceAudioPlayback } from "@/lib/hooks/use-voice-audio-playback";
import type { VoiceWithCreator } from "@/lib/types/api";

type ViewType = "pending" | "approved" | "all";

export default function AdminVoicesPage() {
  const toast = useToast();
  const [pendingVoices, setPendingVoices] = useState<VoiceWithCreator[]>([]);
  const [approvedVoices, setApprovedVoices] = useState<VoiceWithCreator[]>([]);
  const [allSharedVoices, setAllSharedVoices] = useState<VoiceWithCreator[]>([]);
  const [allRecordings, setAllRecordings] = useState<Record<string, unknown>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewType, setViewType] = useState<ViewType>("pending");
  const { togglePlayback, playingVoiceId } = useVoiceAudioPlayback({
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

  const [approveModal, setApproveModal] = useState<{
    open: boolean;
    voice: VoiceWithCreator | null;
  }>({ open: false, voice: null });

  const [unapproveModal, setUnapproveModal] = useState<{
    open: boolean;
    voice: VoiceWithCreator | null;
  }>({ open: false, voice: null });

  const [bulkImportModal, setBulkImportModal] = useState(false);

  const loadVoices = useCallback(async () => {
    setIsLoading(true);
    try {
      const [pending, approved, allVoices, recordings] = await Promise.all([
        adminGetPendingVoices(),
        adminGetApprovedVoices(),
        adminGetAllVoices(),
        adminGetVoiceRecordings(),
      ]);
      const [pendingWithUrls, approvedWithUrls, allVoicesWithUrls] = await Promise.all([
        attachAdminVoiceAudioUrls(pending),
        attachAdminVoiceAudioUrls(approved),
        attachAdminVoiceAudioUrls(allVoices),
      ]);
      setPendingVoices(pendingWithUrls);
      setApprovedVoices(approvedWithUrls);
      setAllSharedVoices(allVoicesWithUrls);
      setAllRecordings(recordings);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An error occurred";
      toast.error("Failed to load voices", message);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      try {
        const [pending, approved, allVoices, recordings] = await Promise.all([
          adminGetPendingVoices(),
          adminGetApprovedVoices(),
          adminGetAllVoices(),
          adminGetVoiceRecordings(),
        ]);
        const [pendingWithUrls, approvedWithUrls, allVoicesWithUrls] = await Promise.all([
          attachAdminVoiceAudioUrls(pending),
          attachAdminVoiceAudioUrls(approved),
          attachAdminVoiceAudioUrls(allVoices),
        ]);
        if (isMounted) {
          setPendingVoices(pendingWithUrls);
          setApprovedVoices(approvedWithUrls);
          setAllSharedVoices(allVoicesWithUrls);
          setAllRecordings(recordings);
        }
      } catch (error: unknown) {
        if (isMounted) {
          const message = error instanceof Error ? error.message : "An error occurred";
          toast.error("Failed to load voices", message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [toast]);

  const handlePreviewToggle = (voice: VoiceWithCreator) => {
    void togglePlayback(voice.id, voice.audio_url);
  };

  const handleApprove = (voice: VoiceWithCreator) => {
    setApproveModal({ open: true, voice });
  };

  const handleConfirmApprove = async () => {
    if (!approveModal.voice) return;
    try {
      await adminApproveVoice(approveModal.voice.id);
      toast.success("Voice approved", `Approved "${approveModal.voice.name}" for public catalog`);
      await loadVoices();
      setApproveModal({ open: false, voice: null });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An error occurred";
      toast.error("Failed to approve voice", message);
    }
  };

  const handleUnapprove = (voice: VoiceWithCreator) => {
    setUnapproveModal({ open: true, voice });
  };

  const handleConfirmUnapprove = async () => {
    if (!unapproveModal.voice) return;
    try {
      await adminUnapproveVoice(unapproveModal.voice.id);
      toast.success("Approval revoked", `Revoked approval for "${unapproveModal.voice.name}"`);
      await loadVoices();
      setUnapproveModal({ open: false, voice: null });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An error occurred";
      toast.error("Failed to unapprove voice", message);
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
      // "all" shows all voices
      voices = allSharedVoices;
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
    allShared: allSharedVoices.length,
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

          {/* Bulk Import Button */}
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

      {/* Search Bar */}
      <div className="mb-6">
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
        {searchTerm && (
          <p className="mt-2 text-caption text-text-muted">
            Found {filteredVoices.length} voice{filteredVoices.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

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
          title={searchTerm ? "No voices found" : `No ${viewType} voices`}
          description={
            searchTerm
              ? "Try adjusting your search criteria"
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
                  <p className="text-body font-semibold text-text-primary">{voice.name}</p>
                  {voice.duration_seconds && (
                    <p className="mt-1 text-caption text-text-secondary">
                      {Math.floor(voice.duration_seconds / 60)}:
                      {String(Math.floor(voice.duration_seconds % 60)).padStart(2, "0")}
                    </p>
                  )}
                </div>
                <div className="col-span-1 md:col-span-2">
                  <div className="md:hidden text-caption font-medium text-text-muted mb-1">
                    Creator
                  </div>
                  <p className="text-body text-text-secondary flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />@{voice.creator_username}
                  </p>
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
                  <p className="text-body text-text-secondary">
                    {voice.is_approved
                      ? formatRelativeTime(voice.admin_approved_at)
                      : formatRelativeTime(voice.created_at)}
                  </p>
                </div>
                <div className="col-span-1 md:col-span-3 flex flex-wrap items-center gap-2">
                  <div className="md:hidden text-caption font-medium text-text-muted mb-1 w-full">
                    Actions
                  </div>
                  <Button
                    size="sm"
                    variant={playingVoiceId === voice.id ? "primary" : "secondary"}
                    onClick={() => handlePreviewToggle(voice)}
                    leftIcon={
                      playingVoiceId === voice.id ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )
                    }
                    rightIcon={
                      playingVoiceId === voice.id ? (
                        <Volume2 className="h-4 w-4 animate-pulse" />
                      ) : undefined
                    }
                  >
                    {playingVoiceId !== voice.id && (
                      <span className="hidden md:inline">Preview</span>
                    )}
                  </Button>

                  {voice.is_shared ? (
                    voice.is_approved ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleUnapprove(voice)}
                        leftIcon={<XCircle className="h-4 w-4" />}
                      >
                        <span className="hidden md:inline">Revoke</span>
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleApprove(voice)}
                        leftIcon={<ThumbsUp className="h-4 w-4" />}
                      >
                        <span className="hidden md:inline">Approve</span>
                      </Button>
                    )
                  ) : null}
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

      {/* Bulk Import Modal */}
      <VoiceBulkImportModal
        open={bulkImportModal}
        onClose={() => setBulkImportModal(false)}
        onSuccess={() => {
          void loadVoices();
        }}
      />
    </div>
  );
}
