"use client";

import { useState, useEffect, useRef } from "react";
import {
  Mic,
  Plus,
  Upload,
  Trash2,
  Power,
  AlertCircle,
  CheckCircle2,
  Search,
  Loader,
  Edit2,
  User,
  Database,
  Play,
  Pause,
  Volume2,
} from "lucide-react";
import { ConfirmModal } from "@/components/ui/modal";
import {
  adminGetVoices,
  adminCreateVoice,
  adminUpdateVoice,
  adminToggleVoiceAvailability,
  adminDeleteVoice,
  adminGetVoiceRecordings,
  adminDeleteVoiceRecording,
  getAdminRecordingAudioUrl,
  getAdminVoiceAudioUrl,
} from "@/lib/api/admin";
import type {
  VoiceCreateRequest,
  VoiceResponse,
  VoiceUpdateRequest,
  VoiceRecordingResponse,
} from "@/lib/types/api";

type Toast = {
  id: number;
  type: "success" | "error";
  message: string;
};

type EditingVoice = {
  id: string;
  name: string;
  description?: string;
  gender?: string;
  accent?: string;
  language?: string;
  category?: string;
};

export default function AdminVoicesPage() {
  const [voices, setVoices] = useState<VoiceResponse[]>([]);
  const [recordings, setRecordings] = useState<VoiceRecordingResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProvider, setFilterProvider] = useState<string>("all");
  const [filterAvailability, setFilterAvailability] = useState<string>("active");
  const [filterGender, setFilterGender] = useState<string>("all");
  const [viewType, setViewType] = useState<"stock" | "recordings">("stock");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<EditingVoice | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const audioObjectUrlRef = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playRecordingAudio = async (recordingId: string) => {
    try {
      // Stop currently playing audio if any
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      // Clean up previous audio if exists
      if (audioObjectUrlRef.current) {
        URL.revokeObjectURL(audioObjectUrlRef.current);
        audioObjectUrlRef.current = null;
      }

      setPlayingVoiceId(recordingId);

      // Get presigned URL from backend
      const { audio_url } = await getAdminRecordingAudioUrl(recordingId);

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
      showToast("error", "Failed to play recording");
      setPlayingVoiceId(null);
    }
  };

  const playStockVoiceAudio = async (voiceId: string) => {
    try {
      // Stop currently playing audio if any
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      // Clean up previous audio if exists
      if (audioObjectUrlRef.current) {
        URL.revokeObjectURL(audioObjectUrlRef.current);
        audioObjectUrlRef.current = null;
      }

      setPlayingVoiceId(voiceId);

      // Get presigned URL from backend
      const { audio_url } = await getAdminVoiceAudioUrl(voiceId);

      const audio = new Audio(audio_url);
      audioRef.current = audio;

      audio.onerror = () => {
        showToast("error", "Failed to play audio preview");
        setPlayingVoiceId(null);
      };

      audio.onended = () => {
        setPlayingVoiceId(null);
      };

      await audio.play();
    } catch (error) {
      console.error("Audio playback error:", error);
      showToast("error", "Failed to play audio preview");
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
      if (audioObjectUrlRef.current) {
        URL.revokeObjectURL(audioObjectUrlRef.current);
      }
    };
  }, []);

  const [deleteVoiceModal, setDeleteVoiceModal] = useState<{
    open: boolean;
    voiceId: string | null;
  }>({ open: false, voiceId: null });
  const [deleteRecordingModal, setDeleteRecordingModal] = useState<{
    open: boolean;
    recordingId: string | null;
  }>({ open: false, recordingId: null });
  const [toggleAvailabilityModal, setToggleAvailabilityModal] = useState<{
    open: boolean;
    voiceId: string | null;
    voiceName: string | null;
    currentStatus: boolean;
  }>({ open: false, voiceId: null, voiceName: null, currentStatus: false });

  useEffect(() => {
    if (viewType === "stock") {
      loadVoices();
    } else {
      loadRecordings();
    }
  }, [viewType]);

  const loadVoices = async () => {
    setIsLoading(true);
    try {
      const data = await adminGetVoices();
      setVoices(data);
    } catch (error: any) {
      showToast("error", error.message || "Failed to load voices");
    } finally {
      setIsLoading(false);
    }
  };

  const loadRecordings = async () => {
    setIsLoading(true);
    try {
      const data = await adminGetVoiceRecordings();
      setRecordings(data);
    } catch (error: any) {
      showToast("error", error.message || "Failed to load voice recordings");
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

  const handleCreateVoice = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const previewFile = formData.get("preview_file") as File;
    const voiceName = formData.get("name") as string;

    // Validate preview file is provided
    if (!previewFile || previewFile.size === 0) {
      showToast("error", "Preview audio file is required");
      return;
    }

    // Validate file format
    const validAudioTypes = [
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/ogg",
      "audio/webm",
      "audio/m4a",
      "audio/aac",
    ];
    if (!validAudioTypes.includes(previewFile.type)) {
      showToast(
        "error",
        "Invalid audio format. Please upload MP3, WAV, OGG, WEBM, M4A, or AAC file"
      );
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (previewFile.size > maxSize) {
      showToast("error", "Audio file too large. Maximum size is 10MB");
      return;
    }

    try {
      // Process audio file: convert WebM to pure audio if needed and use voice name as filename
      let processedFile = previewFile;

      if (previewFile.type.includes("webm")) {
        try {
          const { convertWebmToAudio } = await import("@/lib/utils/audio-converter");
          const convertedBlob = await convertWebmToAudio(previewFile, voiceName);
          // Create a new File with the voice name
          const sanitizedName = voiceName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
          const ext = convertedBlob.type === "audio/wav" ? ".wav" : ".mp3";
          processedFile = new File([convertedBlob], `${sanitizedName || "voice"}${ext}`, {
            type: convertedBlob.type,
          });
        } catch (conversionErr) {
          console.warn("WebM conversion failed, using original file:", conversionErr);
          // Proceed with original file if conversion fails
        }
      } else {
        // For non-WebM files, just rename with voice name
        const sanitizedName = voiceName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
        const ext = previewFile.name.split(".").pop() || "audio";
        processedFile = new File([previewFile], `${sanitizedName || "voice"}.${ext}`, {
          type: previewFile.type,
        });
      }

      // Create new FormData with processed file
      const newFormData = new FormData();
      for (const [key, value] of formData.entries()) {
        if (key === "preview_file") {
          newFormData.append(key, processedFile);
        } else {
          newFormData.append(key, value);
        }
      }

      await adminCreateVoice(newFormData as any);
      showToast("success", "Voice created");
      setIsCreateOpen(false);
      await loadVoices();
    } catch (error: any) {
      showToast("error", error.message || "Failed to create voice");
    }
  };

  const handleUpdateVoice = async () => {
    if (!editingData) return;
    try {
      const updateData: VoiceUpdateRequest = {
        name: editingData.name,
        description: editingData.description,
        gender: editingData.gender,
        accent: editingData.accent,
        language: editingData.language,
        category: editingData.category,
      };
      await adminUpdateVoice(editingData.id, updateData);
      showToast("success", "Voice updated");
      setEditingId(null);
      setEditingData(null);
      await loadVoices();
    } catch (error: any) {
      showToast("error", error.message || "Failed to update voice");
    }
  };

  const handleToggleAvailability = async (
    voiceId: string,
    voiceName: string,
    isAvailable: boolean
  ) => {
    setToggleAvailabilityModal({
      open: true,
      voiceId,
      voiceName,
      currentStatus: isAvailable,
    });
  };

  const handleConfirmToggleAvailability = async () => {
    if (!toggleAvailabilityModal.voiceId) return;
    try {
      const newStatus = !toggleAvailabilityModal.currentStatus;
      await adminToggleVoiceAvailability(toggleAvailabilityModal.voiceId, {
        is_available: newStatus,
      });
      showToast("success", `Voice ${newStatus ? "enabled" : "disabled"}`);
      await loadVoices();
      setToggleAvailabilityModal({
        open: false,
        voiceId: null,
        voiceName: null,
        currentStatus: false,
      });
    } catch (error: any) {
      showToast("error", error.message || "Failed to toggle voice availability");
    }
  };

  const handleDeleteVoice = async (voiceId: string) => {
    setDeleteVoiceModal({ open: true, voiceId });
  };

  const handleConfirmDeleteVoice = async () => {
    if (!deleteVoiceModal.voiceId) return;
    try {
      await adminDeleteVoice(deleteVoiceModal.voiceId);
      showToast("success", "Voice deleted");
      await loadVoices();
      setDeleteVoiceModal({ open: false, voiceId: null });
    } catch (error: any) {
      showToast("error", error.message || "Failed to delete voice");
    }
  };

  const handleDeleteRecording = async (recordingId: string) => {
    setDeleteRecordingModal({ open: true, recordingId });
  };

  const handleConfirmDeleteRecording = async () => {
    if (!deleteRecordingModal.recordingId) return;
    try {
      await adminDeleteVoiceRecording(deleteRecordingModal.recordingId);
      showToast("success", "Recording deleted");
      await loadRecordings();
      setDeleteRecordingModal({ open: false, recordingId: null });
    } catch (error: any) {
      showToast("error", error.message || "Failed to delete voice recording");
    }
  };

  const filteredVoices = voices.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProvider = filterProvider === "all" || v.provider === filterProvider;
    const matchesAvailability =
      filterAvailability === "all" ||
      (filterAvailability === "active" && v.is_available === true) ||
      (filterAvailability === "disabled" && v.is_available === false);
    const matchesGender = filterGender === "all" || v.gender === filterGender;
    return matchesSearch && matchesProvider && matchesAvailability && matchesGender;
  });

  // Get unique providers for filter
  const providers = Array.from(new Set(voices.map((v) => v.provider)));

  // Calculate statistics
  const stats =
    viewType === "stock"
      ? {
          total: voices.length,
          active: voices.filter((v) => v.is_available).length,
          disabled: voices.filter((v) => !v.is_available).length,
          byProvider: providers.map((p) => ({
            name: p,
            count: voices.filter((v) => v.provider === p).length,
          })),
        }
      : {
          total: recordings.length,
          active: recordings.length,
          disabled: 0,
          byProvider: [],
        };

  const filteredRecordings = recordings.filter(
    (r) =>
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <h1 className="text-3xl font-bold text-text-primary">Voices</h1>
            </div>
            <p className="text-text-secondary">Manage stock voices and recordings</p>
          </div>
          <div className="flex gap-3">
            {viewType === "stock" && (
              <button
                onClick={() => setIsCreateOpen(true)}
                className="flex items-center gap-2 rounded-lg bg-accent-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-primary/90 transition-all shadow-lg shadow-accent-primary/25"
              >
                <Plus className="h-4 w-4" />
                Add Voice
              </button>
            )}
          </div>
        </div>

        {/* View Type Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-surface-raised border border-border-default w-fit">
          <button
            onClick={() => setViewType("stock")}
            className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold transition-all ${
              viewType === "stock"
                ? "bg-accent-primary text-white shadow-lg shadow-accent-primary/25"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-panel"
            }`}
          >
            <Database className="h-4 w-4" />
            Stock Voices
            <span
              className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                viewType === "stock" ? "bg-white/20" : "bg-surface-raised"
              }`}
            >
              {voices.length}
            </span>
          </button>
          <button
            onClick={() => setViewType("recordings")}
            className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold transition-all ${
              viewType === "recordings"
                ? "bg-accent-primary text-white shadow-lg shadow-accent-primary/25"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-panel"
            }`}
          >
            <User className="h-4 w-4" />
            User Recordings
            <span
              className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                viewType === "recordings" ? "bg-white/20" : "bg-surface-raised"
              }`}
            >
              {recordings.length}
            </span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {!isLoading && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border-default bg-gradient-to-br from-surface-panel to-surface-raised p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">
                  {viewType === "stock" ? "Total Voices" : "Total Recordings"}
                </p>
                <p className="text-3xl font-bold text-text-primary">{stats.total}</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent-primary/10">
                <Mic className="h-6 w-6 text-accent-primary" />
              </div>
            </div>
          </div>
          {viewType === "stock" && (
            <>
              <div className="rounded-xl border border-border-default bg-gradient-to-br from-surface-panel to-surface-raised p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">
                      Active
                    </p>
                    <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                  </div>
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-500/10">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border-default bg-gradient-to-br from-surface-panel to-surface-raised p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">
                      Disabled
                    </p>
                    <p className="text-3xl font-bold text-red-600">{stats.disabled}</p>
                  </div>
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-red-500/10">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border-default bg-gradient-to-br from-surface-panel to-surface-raised p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1">
                      Providers
                    </p>
                    <p className="text-3xl font-bold text-text-primary">{providers.length}</p>
                  </div>
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/10">
                    <Upload className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center gap-3 rounded-xl border-2 border-border-default bg-surface-panel px-4 py-3 focus-within:border-accent-primary transition-colors shadow-sm">
          <Search className="h-5 w-5 text-text-muted flex-shrink-0" />
          <input
            type="text"
            placeholder={
              viewType === "stock"
                ? "Search voices by name or description..."
                : "Search recordings by title or description..."
            }
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

        {viewType === "stock" && (
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter Tabs */}
            <div className="flex gap-1 p-1 rounded-lg bg-surface-raised border border-border-default">
              <button
                onClick={() => setFilterAvailability("active")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  filterAvailability === "active"
                    ? "bg-green-500/10 text-green-600 border border-green-500/30"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-panel"
                }`}
              >
                Active Only
              </button>
              <button
                onClick={() => setFilterAvailability("disabled")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  filterAvailability === "disabled"
                    ? "bg-red-500/10 text-red-600 border border-red-500/30"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-panel"
                }`}
              >
                Disabled Only
              </button>
              <button
                onClick={() => setFilterAvailability("all")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  filterAvailability === "all"
                    ? "bg-accent-primary/10 text-accent-primary border border-accent-primary/30"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-panel"
                }`}
              >
                All Status
              </button>
            </div>

            {/* Gender Filter Tabs */}
            <div className="flex gap-1 p-1 rounded-lg bg-surface-raised border border-border-default">
              <button
                onClick={() => setFilterGender("all")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  filterGender === "all"
                    ? "bg-surface-panel text-text-primary border border-border-default"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-panel"
                }`}
              >
                All Genders
              </button>
              <button
                onClick={() => setFilterGender("male")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  filterGender === "male"
                    ? "bg-surface-panel text-text-primary border border-border-default"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-panel"
                }`}
              >
                Male
              </button>
              <button
                onClick={() => setFilterGender("female")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  filterGender === "female"
                    ? "bg-surface-panel text-text-primary border border-border-default"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-panel"
                }`}
              >
                Female
              </button>
              <button
                onClick={() => setFilterGender("neutral")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  filterGender === "neutral"
                    ? "bg-surface-panel text-text-primary border border-border-default"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-panel"
                }`}
              >
                Neutral
              </button>
            </div>

            {/* Provider Selection */}
            <div className="flex gap-1 p-1 rounded-lg bg-surface-raised border border-border-default">
              <button
                onClick={() => setFilterProvider("all")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  filterProvider === "all"
                    ? "bg-surface-panel text-text-primary border border-border-default"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-panel"
                }`}
              >
                All Providers
              </button>
              {providers.map((p) => (
                <button
                  key={p}
                  onClick={() => setFilterProvider(p)}
                  className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all ${
                    filterProvider === p
                      ? "bg-surface-panel text-text-primary border border-border-default"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-panel"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-3">
              {(searchTerm ||
                filterProvider !== "all" ||
                filterAvailability !== "active" ||
                filterGender !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterProvider("all");
                    setFilterAvailability("active");
                    setFilterGender("all");
                  }}
                  className="px-4 py-2 rounded-lg border border-border-default bg-surface-panel text-sm font-medium text-text-secondary hover:bg-surface-hover transition-all"
                >
                  Reset Filters
                </button>
              )}
              <div className="text-sm text-text-muted font-medium">
                <span className="text-text-primary font-semibold">{filteredVoices.length}</span> of{" "}
                {voices.length} voices
              </div>
            </div>
          </div>
        )}
        {viewType === "recordings" && (
          <div className="flex justify-end items-center">
            <div className="text-sm text-text-muted font-medium">
              <span className="text-text-primary font-semibold">{filteredRecordings.length}</span>{" "}
              of {recordings.length} recordings
            </div>
          </div>
        )}
      </div>

      {/* Voices List */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader className="h-8 w-8 animate-spin text-accent-primary" />
            <p className="text-sm text-text-muted">
              Loading {viewType === "stock" ? "voices" : "recordings"}...
            </p>
          </div>
        </div>
      ) : viewType === "stock" ? (
        /* Stock Voices View */
        filteredVoices.length === 0 ? (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border-default">
            <p className="text-sm text-text-muted">
              No voices found. Create or import one to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-2 rounded-2xl border border-border-default bg-surface-panel overflow-hidden">
            {/* Table Header */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 border-b border-border-default bg-surface-raised/50 px-6 py-3 text-sm font-semibold text-text-secondary">
              <div className="col-span-4">Voice Name</div>
              <div className="col-span-2">Provider</div>
              <div className="col-span-2">Details</div>
              <div className="col-span-4">Actions</div>
            </div>

            {/* Table Rows */}
            {filteredVoices.map((voice) => (
              <div
                key={voice.id}
                className="border-b border-border-default last:border-0 hover:bg-surface-raised/50 transition-colors"
              >
                {editingId === voice.id && editingData ? (
                  /* Edit Mode */
                  <div className="px-6 py-4 space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-text-muted mb-1">
                          Voice Name *
                        </label>
                        <input
                          type="text"
                          value={editingData.name}
                          onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                          className="w-full rounded-lg border border-border-default bg-surface-base px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-text-muted mb-1">
                          Provider
                        </label>
                        <input
                          type="text"
                          value={voice.provider}
                          disabled
                          className="w-full rounded-lg border border-border-default bg-surface-raised px-3 py-2 text-sm text-text-muted cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-muted mb-1">
                        Description
                      </label>
                      <textarea
                        value={editingData.description || ""}
                        onChange={(e) =>
                          setEditingData({ ...editingData, description: e.target.value })
                        }
                        className="w-full rounded-lg border border-border-default bg-surface-base px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-text-muted mb-1">
                          Gender
                        </label>
                        <select
                          value={editingData.gender || ""}
                          onChange={(e) =>
                            setEditingData({ ...editingData, gender: e.target.value })
                          }
                          className="w-full rounded-lg border border-border-default bg-surface-base px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                        >
                          <option value="">Select...</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="neutral">Neutral</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-text-muted mb-1">
                          Accent
                        </label>
                        <select
                          value={editingData.accent || ""}
                          onChange={(e) =>
                            setEditingData({ ...editingData, accent: e.target.value })
                          }
                          className="w-full rounded-lg border border-border-default bg-surface-base px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                        >
                          <option value="">Select...</option>
                          <option value="american">American</option>
                          <option value="british">British</option>
                          <option value="australian">Australian</option>
                          <option value="indian">Indian</option>
                          <option value="neutral">Neutral</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-text-muted mb-1">
                          Language
                        </label>
                        <select
                          value={editingData.language || ""}
                          onChange={(e) =>
                            setEditingData({ ...editingData, language: e.target.value })
                          }
                          className="w-full rounded-lg border border-border-default bg-surface-base px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                        >
                          <option value="">Select...</option>
                          <option value="en">English (en)</option>
                          <option value="es">Spanish (es)</option>
                          <option value="fr">French (fr)</option>
                          <option value="de">German (de)</option>
                          <option value="it">Italian (it)</option>
                          <option value="pt">Portuguese (pt)</option>
                          <option value="zh">Chinese (zh)</option>
                          <option value="ja">Japanese (ja)</option>
                          <option value="ko">Korean (ko)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-text-muted mb-1">
                          Category
                        </label>
                        <select
                          value={editingData.category || ""}
                          onChange={(e) =>
                            setEditingData({ ...editingData, category: e.target.value })
                          }
                          className="w-full rounded-lg border border-border-default bg-surface-base px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                        >
                          <option value="">Select...</option>
                          <option value="narration">Narration</option>
                          <option value="conversational">Conversational</option>
                          <option value="professional">Professional</option>
                          <option value="casual">Casual</option>
                          <option value="storytelling">Storytelling</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={handleUpdateVoice}
                        className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-all"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditingData(null);
                        }}
                        className="rounded-lg border-2 border-border-default px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-surface-hover transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Browse Mode */
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center">
                    <div className="col-span-1 md:col-span-4">
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-text-primary">{voice.name}</p>
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${
                                voice.is_available
                                  ? "bg-green-500/10 text-green-600 border border-green-500/30"
                                  : "bg-red-500/10 text-red-600 border border-red-500/30"
                              }`}
                            >
                              {voice.is_available ? "Active" : "Disabled"}
                            </span>
                          </div>
                          {voice.description && (
                            <p className="mt-1 text-xs text-text-muted line-clamp-2">
                              {voice.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <div className="md:hidden text-xs font-medium text-text-muted mb-1">
                        Provider
                      </div>
                      <p className="text-sm text-text-secondary capitalize">{voice.provider}</p>
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <div className="md:hidden text-xs font-medium text-text-muted mb-1">
                        Details
                      </div>
                      <div className="flex flex-wrap gap-1 text-xs">
                        {voice.gender && (
                          <span className="inline-flex items-center rounded-md bg-blue-500/10 px-2 py-1 text-blue-600 capitalize">
                            {voice.gender}
                          </span>
                        )}
                        {voice.language && (
                          <span className="inline-flex items-center rounded-md bg-purple-500/10 px-2 py-1 text-purple-600 uppercase">
                            {voice.language}
                          </span>
                        )}
                        {voice.accent && (
                          <span className="inline-flex items-center rounded-md bg-orange-500/10 px-2 py-1 text-orange-600 capitalize">
                            {voice.accent}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="col-span-1 md:col-span-4 flex flex-wrap items-center gap-2">
                      <div className="md:hidden text-xs font-medium text-text-muted mb-1 w-full">
                        Actions
                      </div>
                      {voice.preview_path ? (
                        <button
                          onClick={() => {
                            if (playingVoiceId === voice.id) {
                              stopAudio();
                            } else {
                              playStockVoiceAudio(voice.id);
                            }
                          }}
                          className={`group relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-all shadow-sm ${
                            playingVoiceId === voice.id
                              ? "bg-gradient-to-r from-accent-primary to-purple-600 text-white shadow-accent-primary/30"
                              : "border-2 border-border-default bg-surface-base text-text-secondary hover:border-accent-primary hover:text-accent-primary hover:bg-accent-primary/5"
                          }`}
                          title={playingVoiceId === voice.id ? "Stop preview" : "Play preview"}
                        >
                          {playingVoiceId === voice.id ? (
                            <>
                              <Pause className="h-4 w-4" />
                              <span className="hidden md:inline">Stop</span>
                              <Volume2 className="h-4 w-4 animate-pulse" />
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4" />
                              <span className="hidden md:inline">Preview</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="px-3 py-2 text-xs text-text-muted italic hidden md:inline">
                          No preview
                        </span>
                      )}
                      <button
                        onClick={() => {
                          setEditingId(voice.id);
                          setEditingData({
                            id: voice.id,
                            name: voice.name,
                            description: voice.description || undefined,
                            gender: voice.gender || undefined,
                            accent: voice.accent || undefined,
                            language: voice.language || undefined,
                            category: voice.category || undefined,
                          });
                        }}
                        className="flex items-center gap-1.5 rounded-lg border-2 border-border-default bg-surface-base px-3 py-2 text-sm font-medium text-text-secondary hover:border-blue-500 hover:bg-blue-500/10 hover:text-blue-600 transition-all"
                        title="Edit voice"
                      >
                        <Edit2 className="h-4 w-4" />
                        <span className="hidden md:inline">Edit</span>
                      </button>
                      <button
                        onClick={() =>
                          handleToggleAvailability(voice.id, voice.name, voice.is_available)
                        }
                        className={`flex items-center gap-1.5 rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all ${
                          voice.is_available
                            ? "border-yellow-500/50 bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20"
                            : "border-green-500/50 bg-green-500/10 text-green-600 hover:bg-green-500/20"
                        }`}
                        title={voice.is_available ? "Disable voice" : "Enable voice"}
                      >
                        <Power className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteVoice(voice.id)}
                        className="flex items-center gap-1.5 rounded-lg border-2 border-red-500/50 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-500/20 transition-all"
                        title="Delete voice"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      ) : /* User Recordings View */
      filteredRecordings.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border-default">
          <p className="text-sm text-text-muted">No voice recordings found.</p>
        </div>
      ) : (
        <div className="space-y-2 rounded-2xl border border-border-default bg-surface-panel overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid md:grid-cols-12 gap-4 border-b border-border-default bg-surface-raised/50 px-6 py-3 text-sm font-semibold text-text-secondary">
            <div className="col-span-4">Title</div>
            <div className="col-span-3">User ID</div>
            <div className="col-span-2">Created</div>
            <div className="col-span-3">Actions</div>
          </div>

          {/* Table Rows */}
          {filteredRecordings.map((recording) => (
            <div
              key={recording.id}
              className="border-b border-border-default last:border-0 hover:bg-surface-raised/50 transition-colors"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center">
                <div className="col-span-1 md:col-span-4">
                  <p className="text-sm font-semibold text-text-primary">{recording.title}</p>
                  {recording.description && (
                    <p className="mt-1 text-xs text-text-muted line-clamp-2">
                      {recording.description}
                    </p>
                  )}
                  {recording.duration_seconds && (
                    <p className="mt-1 text-xs text-text-secondary">
                      Duration: {Math.floor(recording.duration_seconds / 60)}:
                      {String(Math.floor(recording.duration_seconds % 60)).padStart(2, "0")}
                    </p>
                  )}
                </div>
                <div className="col-span-1 md:col-span-3">
                  <div className="md:hidden text-xs font-medium text-text-muted mb-1">User ID</div>
                  <p className="text-sm text-text-secondary font-mono text-xs break-all">
                    {recording.user_id}
                  </p>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <div className="md:hidden text-xs font-medium text-text-muted mb-1">Created</div>
                  <p className="text-sm text-text-secondary">
                    {new Date(recording.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="col-span-1 md:col-span-3 flex flex-wrap items-center gap-2">
                  <div className="md:hidden text-xs font-medium text-text-muted mb-1 w-full">
                    Actions
                  </div>
                  <button
                    onClick={() => {
                      if (playingVoiceId === String(recording.id)) {
                        stopAudio();
                      } else {
                        playRecordingAudio(String(recording.id));
                      }
                    }}
                    className={`group relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-all shadow-sm ${
                      playingVoiceId === String(recording.id)
                        ? "bg-gradient-to-r from-accent-primary to-purple-600 text-white shadow-accent-primary/30"
                        : "border-2 border-border-default bg-surface-base text-text-secondary hover:border-accent-primary hover:text-accent-primary hover:bg-accent-primary/5"
                    }`}
                    title={
                      playingVoiceId === String(recording.id) ? "Stop recording" : "Play recording"
                    }
                  >
                    {playingVoiceId === String(recording.id) ? (
                      <>
                        <Pause className="h-4 w-4" />
                        <span className="hidden md:inline">Stop</span>
                        <Volume2 className="h-4 w-4 animate-pulse" />
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        <span className="hidden md:inline">Play</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteRecording(recording.id)}
                    className="flex items-center gap-1.5 rounded-lg border-2 border-red-500/50 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-500/20 transition-all"
                    title="Delete recording"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden md:inline">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Voice Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-border-default bg-surface-panel p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="mb-4 text-xl font-semibold text-text-primary">Add Voice</h2>
            <form onSubmit={handleCreateVoice} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-text-secondary">Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g., Rachel"
                  className="w-full rounded-lg border border-border-default bg-surface-base px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text-secondary">
                  Provider *
                </label>
                <input
                  type="text"
                  name="provider"
                  required
                  placeholder="e.g., elevenlabs"
                  className="w-full rounded-lg border border-border-default bg-surface-base px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text-secondary">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="A calm and clear voice"
                  className="w-full rounded-lg border border-border-default bg-surface-base px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-text-secondary">
                    Gender
                  </label>
                  <select
                    name="gender"
                    className="w-full rounded-lg border border-border-default bg-surface-base px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none"
                  >
                    <option value="">Select...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="neutral">Neutral</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-text-secondary">
                    Accent
                  </label>
                  <input
                    type="text"
                    name="accent"
                    placeholder="e.g., american, british"
                    className="w-full rounded-lg border border-border-default bg-surface-base px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-text-secondary">
                    Language
                  </label>
                  <input
                    type="text"
                    name="language"
                    placeholder="e.g., en, es"
                    className="w-full rounded-lg border border-border-default bg-surface-base px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-text-secondary">
                    Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    placeholder="e.g., narration, conversational"
                    className="w-full rounded-lg border border-border-default bg-surface-base px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text-secondary">
                  Preview Audio File *
                </label>
                <input
                  type="file"
                  name="preview_file"
                  required
                  accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/webm,audio/m4a,audio/aac"
                  className="w-full rounded-lg border border-border-default bg-surface-base px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none file:mr-4 file:rounded-md file:border-0 file:bg-accent-primary/10 file:px-3 file:py-1 file:text-sm file:font-medium file:text-accent-primary hover:file:bg-accent-primary/20"
                />
                <p className="mt-1 text-xs text-text-muted">
                  Audio preview file. Max 10MB (MP3, WAV, OGG, WEBM, M4A, AAC)
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-lg border border-border-default px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-hover"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-accent-primary px-4 py-2 text-sm font-medium text-white hover:bg-accent-primary/90"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Voice Confirmation Modal */}
      <ConfirmModal
        open={deleteVoiceModal.open}
        onClose={() => setDeleteVoiceModal({ open: false, voiceId: null })}
        onConfirm={handleConfirmDeleteVoice}
        title="Delete Voice"
        description="This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Delete Recording Confirmation Modal */}
      <ConfirmModal
        open={deleteRecordingModal.open}
        onClose={() => setDeleteRecordingModal({ open: false, recordingId: null })}
        onConfirm={handleConfirmDeleteRecording}
        title="Delete Recording"
        description="This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Toggle Availability Confirmation Modal */}
      <ConfirmModal
        open={toggleAvailabilityModal.open}
        onClose={() =>
          setToggleAvailabilityModal({
            open: false,
            voiceId: null,
            voiceName: null,
            currentStatus: false,
          })
        }
        onConfirm={handleConfirmToggleAvailability}
        title={toggleAvailabilityModal.currentStatus ? "Disable Voice" : "Enable Voice"}
        description={`${toggleAvailabilityModal.currentStatus ? "Disable" : "Enable"} "${toggleAvailabilityModal.voiceName}"`}
        confirmText={toggleAvailabilityModal.currentStatus ? "Disable" : "Enable"}
        cancelText="Cancel"
        variant={toggleAvailabilityModal.currentStatus ? "danger" : "success"}
      />
    </div>
  );
}
