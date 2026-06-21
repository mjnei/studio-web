"use client";

import { useState, useEffect } from "react";
import { Mic, Plus, Upload, Trash2, Edit2, Power, AlertCircle, CheckCircle2, Search, Loader } from "lucide-react";
import {
  adminGetVoices,
  adminCreateVoice,
  adminUpdateVoice,
  adminToggleVoiceAvailability,
  adminDeleteVoice,
  adminBulkImportVoices,
} from "@/lib/api/admin";
import type { VoiceResponse, VoiceCreateRequest, VoiceUpdateRequest } from "@/lib/types/api";

type Toast = {
  id: number;
  type: "success" | "error";
  message: string;
};

type EditingVoice = {
  id: string;
  name: string;
  gender?: string;
  accent?: string;
  description?: string;
};

export default function AdminVoicesPage() {
  const [voices, setVoices] = useState<VoiceResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<EditingVoice | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    loadVoices();
  }, []);

  const loadVoices = async () => {
    setIsLoading(true);
    try {
      const data = await adminGetVoices();
      setVoices(data.voices);
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

  const handleCreateVoice = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsCreating(false);
    try {
      const formData = new FormData(e.currentTarget);
      const data: VoiceCreateRequest = {
        id: formData.get("id") as string,
        provider: formData.get("provider") as string,
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        gender: formData.get("gender") as string,
        accent: formData.get("accent") as string,
        language: formData.get("language") as string,
        category: formData.get("category") as string,
        preview_url: formData.get("preview_url") as string,
        is_available: true,
      };
      await adminCreateVoice(data);
      showToast("success", "Voice created successfully");
      await loadVoices();
      e.currentTarget.reset();
    } catch (error: any) {
      showToast("error", error.message || "Failed to create voice");
      setIsCreating(true);
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

  const handleToggleAvailability = async (voiceId: string, currentState: boolean) => {
    try {
      await adminToggleVoiceAvailability(voiceId, { is_available: !currentState });
      showToast("success", `Voice ${!currentState ? "enabled" : "disabled"} successfully`);
      await loadVoices();
    } catch (error: any) {
      showToast("error", error.message || "Failed to toggle availability");
    }
  };

  const handleUpdateVoice = async () => {
    if (!editingData) return;
    try {
      const updateData: VoiceUpdateRequest = {
        name: editingData.name,
        gender: editingData.gender,
        accent: editingData.accent,
        description: editingData.description,
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
      setIsBulkOpen(false);
      e.currentTarget.reset();
      await loadVoices();
    } catch (error: any) {
      showToast("error", error.message || "Failed to bulk import voices");
    }
  };

  const filteredVoices = voices.filter((v) =>
    v.name.toLowerCase().includes(searchTerm.toLowerCase())
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
          <p className="text-text-secondary">Browse, create, edit, and delete voices</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsCreating(true)}
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
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex items-center gap-2 rounded-lg border border-border-default bg-surface-panel px-3 py-2">
        <Search className="h-5 w-5 text-text-muted" />
        <input
          type="text"
          placeholder="Search voices by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-transparent text-text-primary placeholder-text-muted focus:outline-none"
        />
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
          <p className="text-sm text-text-muted">No voices found. Create or import one to get started.</p>
        </div>
      ) : (
        <div className="space-y-2 rounded-2xl border border-border-default bg-surface-panel overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 border-b border-border-default bg-surface-raised/50 px-6 py-3 text-sm font-semibold text-text-secondary">
            <div className="col-span-2">Name</div>
            <div className="col-span-2">Gender</div>
            <div className="col-span-2">Accent</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-5">Actions</div>
          </div>

          {/* Table Rows */}
          {filteredVoices.map((voice) => (
            <div key={voice.id} className="border-b border-border-default last:border-0 hover:bg-surface-raised/50 transition-colors">
              {editingId === voice.id && editingData ? (
                <div className="grid grid-cols-12 gap-4 px-6 py-4">
                  <input
                    type="text"
                    value={editingData.name}
                    onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                    className="col-span-2 rounded-lg border border-border-default bg-surface-base px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                  />
                  <select
                    value={editingData.gender || ""}
                    onChange={(e) => setEditingData({ ...editingData, gender: e.target.value })}
                    className="col-span-2 rounded-lg border border-border-default bg-surface-base px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                  >
                    <option value="">Select...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="neutral">Neutral</option>
                  </select>
                  <input
                    type="text"
                    value={editingData.accent || ""}
                    onChange={(e) => setEditingData({ ...editingData, accent: e.target.value })}
                    className="col-span-2 rounded-lg border border-border-default bg-surface-base px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                  />
                  <div className="col-span-1"></div>
                  <div className="col-span-5 flex items-center gap-2">
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
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-text-primary">{voice.name}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-text-secondary capitalize">{voice.gender || "N/A"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-text-secondary uppercase">{voice.accent || "N/A"}</p>
                  </div>
                  <div className="col-span-1">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        voice.is_available
                          ? "bg-green-100/50 text-green-700"
                          : "bg-gray-100/50 text-gray-600"
                      }`}
                    >
                      {voice.is_available ? "Available" : "Unavailable"}
                    </span>
                  </div>
                  <div className="col-span-5 flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleToggleAvailability(voice.id, voice.is_available)
                      }
                      className={`flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                        voice.is_available
                          ? "border-yellow-500/50 bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20"
                          : "border-green-500/50 bg-green-500/10 text-green-600 hover:bg-green-500/20"
                      }`}
                    >
                      <Power className="h-4 w-4" />
                      {voice.is_available ? "Disable" : "Enable"}
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(voice.id);
                        setEditingData({
                          id: voice.id,
                          name: voice.name,
                          gender: voice.gender,
                          accent: voice.accent,
                          description: "",
                        });
                      }}
                      className="flex items-center gap-1 rounded-lg border border-border-default bg-surface-base px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-all"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteVoice(voice.id)}
                      className="flex items-center gap-1 rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-500/20 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Voice Modal */}
      {isCreating && (
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
                  Preview URL
                </label>
                <input
                  type="url"
                  name="preview_url"
                  placeholder="https://example.com/preview.mp3"
                  className="w-full rounded-lg border border-border-default bg-surface-base px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
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
                  rows={12}
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
