"use client";

import { useState, useEffect } from "react";
import { Mic, Plus, Upload, Trash2, Power, AlertCircle, CheckCircle2, Search, Loader, Edit2, User, Database } from "lucide-react";
import {
  adminGetVoices,
  adminCreateVoice,
  adminUpdateVoice,
  adminToggleVoiceAvailability,
  adminDeleteVoice,
  adminBulkImportVoices,
  adminGetVoiceRecordings,
  adminDeleteVoiceRecording,
} from "@/lib/api/admin";
import type { VoiceCreateRequest, VoiceResponse, VoiceUpdateRequest, VoiceRecordingResponse } from "@/lib/types/api";

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
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProvider, setFilterProvider] = useState<string>("all");
  const [filterAvailability, setFilterAvailability] = useState<string>("all");
  const [filterGender, setFilterGender] = useState<string>("all");
  const [viewType, setViewType] = useState<"stock" | "recordings">("stock");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<EditingVoice | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

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
    setIsCreateOpen(false);
    try {
      const formData = new FormData(e.currentTarget);
      await adminCreateVoice(formData as any);
      showToast("success", "Voice created successfully");
      await loadVoices();
      e.currentTarget.reset();
    } catch (error: any) {
      showToast("error", error.message || "Failed to create voice");
      setIsCreateOpen(true);
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
      showToast("success", "Voice updated successfully");
      setEditingId(null);
      setEditingData(null);
      await loadVoices();
    } catch (error: any) {
      showToast("error", error.message || "Failed to update voice");
    }
  };

  const handleToggleAvailability = async (voiceId: string, isAvailable: boolean) => {
    try {
      await adminToggleVoiceAvailability(voiceId, { is_available: !isAvailable });
      showToast("success", `Voice ${!isAvailable ? "enabled" : "disabled"} successfully`);
      await loadVoices();
    } catch (error: any) {
      showToast("error", error.message || "Failed to toggle voice availability");
    }
  };

  const handleDeleteVoice = async (voiceId: string) => {
    if (!confirm("Delete this voice? This action cannot be undone.")) return;
    try {
      await adminDeleteVoice(voiceId);
      showToast("success", "Voice deleted successfully");
      await loadVoices();
    } catch (error: any) {
      showToast("error", error.message || "Failed to delete voice");
    }
  };

  const handleBulkImport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.currentTarget);
      const jsonText = formData.get("json") as string;
      const items = JSON.parse(jsonText) as VoiceCreateRequest[];
      const result = await adminBulkImportVoices({ items });
      showToast(
        "success",
        `Bulk import completed: ${result.success_count} succeeded, ${result.failure_count} failed`
      );
      if (result.errors.length > 0) {
        console.error("Bulk import errors:", result.errors);
      }
      setIsBulkOpen(false);
      e.currentTarget.reset();
      await loadVoices();
    } catch (error: any) {
      showToast("error", error.message || "Failed to bulk import voices");
    }
  };

  const handleDeleteRecording = async (recordingId: string) => {
    if (!confirm("Delete this voice recording? This action cannot be undone.")) return;
    try {
      await adminDeleteVoiceRecording(recordingId);
      showToast("success", "Voice recording deleted successfully");
      await loadRecordings();
    } catch (error: any) {
      showToast("error", error.message || "Failed to delete voice recording");
    }
  };

  const filteredVoices = voices.filter((v) => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProvider = filterProvider === "all" || v.provider === filterProvider;
    const matchesAvailability = filterAvailability === "all" || 
      (filterAvailability === "active" && v.is_available) ||
      (filterAvailability === "disabled" && !v.is_available);
    const matchesGender = filterGender === "all" || v.gender === filterGender;
    return matchesSearch && matchesProvider && matchesAvailability && matchesGender;
  });

  // Get unique providers for filter
  const providers = Array.from(new Set(voices.map(v => v.provider)));
  
  // Calculate statistics
  const stats = viewType === "stock" ? {
    total: voices.length,
    active: voices.filter(v => v.is_available).length,
    disabled: voices.filter(v => !v.is_available).length,
    byProvider: providers.map(p => ({
      name: p,
      count: voices.filter(v => v.provider === p).length
    }))
  } : {
    total: recordings.length,
    active: recordings.length,
    disabled: 0,
    byProvider: []
  };

  const filteredRecordings = recordings.filter((r) =>
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Mic className="h-8 w-8 text-accent-primary" />
            <h1 className="text-3xl font-bold text-text-primary">Manage Voices</h1>
          </div>
          <p className="text-text-secondary">Manage stock voices from providers and user voice recordings</p>
        </div>
        <div className="flex gap-3">
          {viewType === "stock" && (
            <>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="flex items-center gap-2 rounded-lg bg-accent-primary px-4 py-2 text-sm font-medium text-white hover:bg-accent-primary/90 transition-all"
              >
                <Plus className="h-4 w-4" />
                Create Voice
              </button>
              <button
                onClick={() => setIsBulkOpen(true)}
                className="flex items-center gap-2 rounded-lg border border-border-default bg-surface-panel px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-hover transition-all"
              >
                <Upload className="h-4 w-4" />
                Bulk Import
              </button>
            </>
          )}
        </div>
      </div>

      {/* View Type Toggle */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setViewType("stock")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            viewType === "stock"
              ? "bg-accent-primary text-white"
              : "border border-border-default bg-surface-panel text-text-secondary hover:bg-surface-hover"
          }`}
        >
          <Database className="h-4 w-4" />
          Stock Voices ({voices.length})
        </button>
        <button
          onClick={() => setViewType("recordings")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            viewType === "recordings"
              ? "bg-accent-primary text-white"
              : "border border-border-default bg-surface-panel text-text-secondary hover:bg-surface-hover"
          }`}
        >
          <User className="h-4 w-4" />
          User Recordings ({recordings.length})
        </button>
      </div>

      {/* Statistics Cards */}
      {!isLoading && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-border-default bg-surface-panel p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-muted">{viewType === "stock" ? "Total Voices" : "Total Recordings"}</p>
                <p className="text-2xl font-bold text-text-primary">{stats.total}</p>
              </div>
              <Mic className="h-8 w-8 text-accent-primary opacity-50" />
            </div>
          </div>
          {viewType === "stock" && (
            <>
              <div className="rounded-2xl border border-border-default bg-surface-panel p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-muted">Active</p>
                    <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-600 opacity-50" />
                </div>
              </div>
              <div className="rounded-2xl border border-border-default bg-surface-panel p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-muted">Disabled</p>
                    <p className="text-2xl font-bold text-red-600">{stats.disabled}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-600 opacity-50" />
                </div>
              </div>
              <div className="rounded-2xl border border-border-default bg-surface-panel p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-muted">Providers</p>
                    <p className="text-2xl font-bold text-text-primary">{providers.length}</p>
                  </div>
                  <Upload className="h-8 w-8 text-accent-primary opacity-50" />
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center gap-2 rounded-lg border border-border-default bg-surface-panel px-3 py-2">
          <Search className="h-5 w-5 text-text-muted" />
          <input
            type="text"
            placeholder={viewType === "stock" ? "Search voices by name or description..." : "Search recordings by title or description..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent text-text-primary placeholder-text-muted focus:outline-none"
          />
        </div>
        {viewType === "stock" && (
          <div className="flex flex-wrap gap-2">
            <select
              value={filterProvider}
              onChange={(e) => setFilterProvider(e.target.value)}
              className="rounded-lg border border-border-default bg-surface-panel px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
            >
              <option value="all">All Providers</option>
              {providers.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            <select
              value={filterAvailability}
              onChange={(e) => setFilterAvailability(e.target.value)}
              className="rounded-lg border border-border-default bg-surface-panel px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="disabled">Disabled Only</option>
            </select>
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="rounded-lg border border-border-default bg-surface-panel px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
            >
              <option value="all">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="neutral">Neutral</option>
            </select>
            {(searchTerm || filterProvider !== "all" || filterAvailability !== "all" || filterGender !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterProvider("all");
                  setFilterAvailability("all");
                  setFilterGender("all");
                }}
                className="rounded-lg border border-border-default bg-surface-panel px-3 py-2 text-sm text-text-secondary hover:bg-surface-hover"
              >
                Clear Filters
              </button>
            )}
            <div className="ml-auto text-sm text-text-muted flex items-center">
              Showing {filteredVoices.length} of {voices.length} voices
            </div>
          </div>
        )}
        {viewType === "recordings" && (
          <div className="flex justify-between items-center">
            <div className="text-sm text-text-muted">
              Showing {filteredRecordings.length} of {recordings.length} recordings
            </div>
          </div>
        )}
      </div>

      {/* Voices List */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader className="h-8 w-8 animate-spin text-accent-primary" />
            <p className="text-sm text-text-muted">Loading {viewType === "stock" ? "voices" : "recordings"}...</p>
          </div>
        </div>
      ) : viewType === "stock" ? (
        /* Stock Voices View */
        filteredVoices.length === 0 ? (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border-default">
            <p className="text-sm text-text-muted">No voices found. Create or import one to get started.</p>
          </div>
        ) : (
        <div className="space-y-2 rounded-2xl border border-border-default bg-surface-panel overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 border-b border-border-default bg-surface-raised/50 px-6 py-3 text-sm font-semibold text-text-secondary">
            <div className="col-span-3">Name</div>
            <div className="col-span-2">Provider</div>
            <div className="col-span-1">Gender</div>
            <div className="col-span-1">Language</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-4">Actions</div>
          </div>

          {/* Table Rows */}
          {filteredVoices.map((voice) => (
            <div key={voice.id} className="border-b border-border-default last:border-0 hover:bg-surface-raised/50 transition-colors">
              {editingId === voice.id && editingData ? (
                <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
                  <input
                    type="text"
                    value={editingData.name}
                    onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                    className="col-span-3 rounded-lg border border-border-default bg-surface-base px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                  />
                  <div className="col-span-2 flex items-center text-sm text-text-secondary">
                    {voice.provider}
                  </div>
                  <input
                    type="text"
                    value={editingData.gender || ""}
                    onChange={(e) => setEditingData({ ...editingData, gender: e.target.value })}
                    className="col-span-1 rounded-lg border border-border-default bg-surface-base px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                  />
                  <input
                    type="text"
                    value={editingData.language || ""}
                    onChange={(e) => setEditingData({ ...editingData, language: e.target.value })}
                    className="col-span-1 rounded-lg border border-border-default bg-surface-base px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                  />
                  <div className="col-span-1 flex items-center">
                    <span className={`text-xs font-medium ${voice.is_available ? "text-green-600" : "text-red-600"}`}>
                      {voice.is_available ? "Active" : "Disabled"}
                    </span>
                  </div>
                  <div className="col-span-4 flex items-center gap-2">
                    <button
                      onClick={handleUpdateVoice}
                      className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditingData(null);
                      }}
                      className="rounded-lg border border-border-default px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-hover"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
                  <div className="col-span-3">
                    <p className="text-sm font-medium text-text-primary">{voice.name}</p>
                    {voice.description && (
                      <p className="mt-0.5 text-xs text-text-muted line-clamp-1">{voice.description}</p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-text-secondary capitalize">{voice.provider}</p>
                  </div>
                  <div className="col-span-1">
                    <p className="text-sm text-text-secondary capitalize">{voice.gender || "N/A"}</p>
                  </div>
                  <div className="col-span-1">
                    <p className="text-sm text-text-secondary uppercase">{voice.language || "N/A"}</p>
                  </div>
                  <div className="col-span-1">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      voice.is_available 
                        ? "bg-green-500/10 text-green-600" 
                        : "bg-red-500/10 text-red-600"
                    }`}>
                      {voice.is_available ? "Active" : "Disabled"}
                    </span>
                  </div>
                  <div className="col-span-4 flex items-center gap-2">
                    {voice.preview_url && (
                      <button
                        onClick={() => {
                          const audio = new Audio(voice.preview_url!);
                          audio.play();
                        }}
                        className="flex items-center gap-1 rounded-lg border border-border-default bg-surface-base px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-all"
                        title="Play preview"
                      >
                        <Mic className="h-4 w-4" />
                      </button>
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
                      className="flex items-center gap-1 rounded-lg border border-border-default bg-surface-base px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-all"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleAvailability(voice.id, voice.is_available)}
                      className={`flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                        voice.is_available
                          ? "border-yellow-500/50 bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20"
                          : "border-green-500/50 bg-green-500/10 text-green-600 hover:bg-green-500/20"
                      }`}
                    >
                      <Power className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteVoice(voice.id)}
                      className="flex items-center gap-1 rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-500/20 transition-all"
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
      ) : (
        /* User Recordings View */
        filteredRecordings.length === 0 ? (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border-default">
            <p className="text-sm text-text-muted">No voice recordings found.</p>
          </div>
        ) : (
          <div className="space-y-2 rounded-2xl border border-border-default bg-surface-panel overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 border-b border-border-default bg-surface-raised/50 px-6 py-3 text-sm font-semibold text-text-secondary">
              <div className="col-span-3">Title</div>
              <div className="col-span-2">User ID</div>
              <div className="col-span-2">Duration</div>
              <div className="col-span-2">Created</div>
              <div className="col-span-3">Actions</div>
            </div>

            {/* Table Rows */}
            {filteredRecordings.map((recording) => (
              <div key={recording.id} className="border-b border-border-default last:border-0 hover:bg-surface-raised/50 transition-colors">
                <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
                  <div className="col-span-3">
                    <p className="text-sm font-medium text-text-primary">{recording.title}</p>
                    {recording.description && (
                      <p className="mt-0.5 text-xs text-text-muted line-clamp-1">{recording.description}</p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-text-secondary font-mono text-xs">{recording.user_id.substring(0, 8)}...</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-text-secondary">
                      {recording.duration_seconds 
                        ? `${Math.floor(recording.duration_seconds / 60)}:${String(Math.floor(recording.duration_seconds % 60)).padStart(2, '0')}`
                        : "N/A"
                      }
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-text-secondary">
                      {new Date(recording.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="col-span-3 flex items-center gap-2">
                    <button
                      onClick={() => {
                        const audio = new Audio(recording.file_path);
                        audio.play();
                      }}
                      className="flex items-center gap-1 rounded-lg border border-border-default bg-surface-base px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-all"
                      title="Play recording"
                    >
                      <Mic className="h-4 w-4" />
                      Play
                    </button>
                    <button
                      onClick={() => handleDeleteRecording(recording.id)}
                      className="flex items-center gap-1 rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-500/20 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Create Voice Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-border-default bg-surface-panel p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="mb-4 text-xl font-semibold text-text-primary">Create Voice</h2>
            <form onSubmit={handleCreateVoice} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-text-secondary">
                    Voice ID *
                  </label>
                  <input
                    type="text"
                    name="id"
                    required
                    placeholder="e.g., 21m00Tcm4TlvDq8ikWAM"
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
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text-secondary">
                  Name *
                </label>
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
                  Description
                </label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="A calm and clear American female voice"
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
                  Preview Audio File
                </label>
                <input
                  type="file"
                  name="preview_file"
                  accept="audio/*"
                  className="w-full rounded-lg border border-border-default bg-surface-base px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none file:mr-4 file:rounded-md file:border-0 file:bg-accent-primary/10 file:px-3 file:py-1 file:text-sm file:font-medium file:text-accent-primary hover:file:bg-accent-primary/20"
                />
                <p className="mt-1 text-xs text-text-muted">Optional: Upload a sample audio file for voice preview</p>
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
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {isBulkOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-3xl rounded-2xl border border-border-default bg-surface-panel p-6 shadow-2xl">
            <h2 className="mb-4 text-xl font-semibold text-text-primary">Bulk Import Voices</h2>
            <form onSubmit={handleBulkImport} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-text-secondary">
                  JSON Array *
                </label>
                <textarea
                  name="json"
                  required
                  rows={15}
                  placeholder='[{"id": "voice_123", "provider": "elevenlabs", "name": "Rachel", "gender": "female", "language": "en"}]'
                  className="w-full rounded-lg border border-border-default bg-surface-base px-3 py-2 font-mono text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsBulkOpen(false)}
                  className="rounded-lg border border-border-default px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-hover"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-accent-primary px-4 py-2 text-sm font-medium text-white hover:bg-accent-primary/90"
                >
                  Import
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
