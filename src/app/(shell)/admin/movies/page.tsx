"use client";

import { useState } from "react";
import { Film, Plus, Upload, Trash2, Edit, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  adminCreateMovie,
  adminUpdateMovie,
  adminDeleteMovie,
  adminBulkImportMovies,
} from "@/lib/api/admin";
import type { MovieCreateRequest, MovieUpdateRequest } from "@/lib/types/api";

type Toast = {
  id: number;
  type: "success" | "error";
  message: string;
};

export default function AdminMoviesPage() {
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

  const handleCreateMovie = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const data: MovieCreateRequest = {
        id: parseInt(formData.get("id") as string),
        title: formData.get("title") as string,
        original_title: formData.get("original_title") as string,
        overview: formData.get("overview") as string,
        release_date: formData.get("release_date") as string,
        poster_path: formData.get("poster_path") as string,
        backdrop_path: formData.get("backdrop_path") as string,
      };
      await adminCreateMovie(data);
      showToast("success", "Movie created successfully");
      setIsCreateOpen(false);
      e.currentTarget.reset();
    } catch (error: any) {
      showToast("error", error.message || "Failed to create movie");
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
      const items = JSON.parse(jsonText) as MovieCreateRequest[];
      const result = await adminBulkImportMovies({ items });
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
      showToast("error", error.message || "Failed to bulk import movies");
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
            <Film className="h-8 w-8 text-accent-primary" />
            <h1 className="text-3xl font-bold text-text-primary">Movies Management</h1>
          </div>
          <p className="text-text-secondary">Create, update, and delete movies in the catalog</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-accent-primary px-4 py-2 text-sm font-medium text-white hover:bg-accent-primary/90 transition-all"
          >
            <Plus className="h-4 w-4" />
            Create Movie
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

      {/* Create Movie Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-border-default bg-surface-panel p-6 shadow-2xl">
            <h2 className="mb-4 text-xl font-semibold text-text-primary">Create Movie</h2>
            <form onSubmit={handleCreateMovie} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-text-secondary">
                    TMDB ID *
                  </label>
                  <input
                    type="number"
                    name="id"
                    required
                    className="w-full rounded-lg border border-border-default bg-surface-base px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-text-secondary">
                    Release Date
                  </label>
                  <input
                    type="date"
                    name="release_date"
                    className="w-full rounded-lg border border-border-default bg-surface-base px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text-secondary">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  className="w-full rounded-lg border border-border-default bg-surface-base px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text-secondary">
                  Original Title
                </label>
                <input
                  type="text"
                  name="original_title"
                  className="w-full rounded-lg border border-border-default bg-surface-base px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text-secondary">
                  Overview
                </label>
                <textarea
                  name="overview"
                  rows={3}
                  className="w-full rounded-lg border border-border-default bg-surface-base px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text-secondary">
                  Poster Path
                </label>
                <input
                  type="text"
                  name="poster_path"
                  placeholder="/path/to/poster.jpg"
                  className="w-full rounded-lg border border-border-default bg-surface-base px-3 py-2 text-text-primary focus:border-accent-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text-secondary">
                  Backdrop Path
                </label>
                <input
                  type="text"
                  name="backdrop_path"
                  placeholder="/path/to/backdrop.jpg"
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
            <h2 className="mb-4 text-xl font-semibold text-text-primary">Bulk Import Movies</h2>
            <form onSubmit={handleBulkImport} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-text-secondary">
                  JSON Array *
                </label>
                <textarea
                  name="json"
                  required
                  rows={15}
                  placeholder='[{"id": 550, "title": "Fight Club", "overview": "...", "release_date": "1999-10-15"}]'
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
            <strong className="text-text-primary">Create Movie:</strong> Add a single movie to the
            catalog. TMDB ID and Title are required.
          </p>
          <p>
            <strong className="text-text-primary">Bulk Import:</strong> Import multiple movies at
            once using a JSON array. Each item must have at least an id and title.
          </p>
          <p className="text-xs text-text-muted">
            Note: Additional movie management features (update, delete, list) can be added as
            needed.
          </p>
        </div>
      </div>
    </div>
  );
}
