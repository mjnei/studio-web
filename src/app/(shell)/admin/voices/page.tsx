"use client";

import { useState } from "react";
import { Mic, Plus, Upload, Trash2, Power, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  adminCreateVoice,
  adminUpdateVoice,
  adminToggleVoiceAvailability,
  adminDeleteVoice,
  adminBulkImportVoices,
} from "@/lib/api/admin";
import type { VoiceCreateRequest } from "@/lib/types/api";

type Toast = {
  id: number;
  type: "success" | "error";
  message: string;
};

export default function AdminVoicesPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (type: "success" | "error", message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const handleCreateVoice = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
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
      setIsCreateOpen(false);
      e.currentTarget.reset();
    } catch (error: any) {
      showToast("error", error.message || "Failed to create voice");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkImport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
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
    } catch (error: any) {
      showToast("error", error.message || "Failed to bulk import voices");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
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
            <h1 className="text-3xl font-bold text-text-primary">Voices Management</h1>
          </div>
          <p className="text-text-secondary">Create, update, and manage voices in the catalog</p>
        </div>
        <div className="flex gap-3">
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
        </div>
      </div>

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
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-lg border border-border-default px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-hover"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-lg bg-accent-primary px-4 py-2 text-sm font-medium text-white hover:bg-accent-primary/90 disabled:opacity-50"
                >
                  {isLoading ? "Creating..." : "Create"}
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
                  disabled={isLoading}
                  className="rounded-lg bg-accent-primary px-4 py-2 text-sm font-medium text-white hover:bg-accent-primary/90 disabled:opacity-50"
                >
                  {isLoading ? "Importing..." : "Import"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Info Panel */}
      <div className="rounded-2xl border border-border-default bg-surface-panel p-6">
        <h3 className="mb-4 text-lg font-semibold text-text-primary">Usage Guide</h3>
        <div className="space-y-3 text-sm text-text-secondary">
          <p>
            <strong className="text-text-primary">Create Voice:</strong> Add a single voice to the
            catalog. Voice ID, Provider, and Name are required.
          </p>
          <p>
            <strong className="text-text-primary">Bulk Import:</strong> Import multiple voices at
            once using a JSON array. Each item must have at least id, provider, and name.
          </p>
          <p>
            <strong className="text-text-primary">Toggle Availability:</strong> Use the PATCH
            endpoint to soft enable/disable voices without deleting them.
          </p>
          <p className="text-xs text-text-muted">
            Note: Additional voice management features (update, delete, list) can be added as
            needed.
          </p>
        </div>
      </div>
    </div>
  );
}
