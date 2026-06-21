"use client";

import { useState, useEffect } from "react";
import { Film, Plus, Upload, Trash2, Edit2, AlertCircle, CheckCircle2, Search, Loader } from "lucide-react";
import {
  adminGetMovies,
  adminCreateMovie,
  adminUpdateMovie,
  adminDeleteMovie,
  adminBulkImportMovies,
} from "@/lib/api/admin";
import type { MovieResponse, MovieCreateRequest, MovieUpdateRequest } from "@/lib/types/api";

type Toast = {
  id: number;
  type: "success" | "error";
  message: string;
};

type EditingMovie = {
  id: string;
  title: string;
  overview?: string;
  release_date?: string;
  vote_average?: number;
};

export default function AdminMoviesPage() {
  const [movies, setMovies] = useState<MovieResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<EditingMovie | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    loadMovies();
  }, []);

  const loadMovies = async () => {
    setIsLoading(true);
    try {
      const data = await adminGetMovies();
      setMovies(data.movies);
    } catch (error: any) {
      showToast("error", error.message || "Failed to load movies");
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

  const handleCreateMovie = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsCreating(false);
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
      await loadMovies();
      e.currentTarget.reset();
    } catch (error: any) {
      showToast("error", error.message || "Failed to create movie");
      setIsCreating(true);
    }
  };

  const handleDeleteMovie = async (movieId: string) => {
    if (!confirm("Delete this movie? This action cannot be undone.")) return;
    try {
      await adminDeleteMovie(parseInt(movieId));
      showToast("success", "Movie deleted successfully");
      await loadMovies();
    } catch (error: any) {
      showToast("error", error.message || "Failed to delete movie");
    }
  };

  const handleUpdateMovie = async () => {
    if (!editingData) return;
    try {
      const updateData: MovieUpdateRequest = {
        title: editingData.title,
        overview: editingData.overview,
        release_date: editingData.release_date,
        vote_average: editingData.vote_average,
      };
      await adminUpdateMovie(parseInt(editingData.id), updateData);
      showToast("success", "Movie updated successfully");
      setEditingId(null);
      setEditingData(null);
      await loadMovies();
    } catch (error: any) {
      showToast("error", error.message || "Failed to update movie");
    }
  };

  const handleBulkImport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.currentTarget);
      const jsonText = formData.get("json") as string;
      const items = JSON.parse(jsonText) as MovieCreateRequest[];
      const result = await adminBulkImportMovies({ items });
      showToast(
        "success",
        `Bulk import completed: ${result.success_count} succeeded, ${result.failure_count} failed`
      );
      setIsBulkOpen(false);
      e.currentTarget.reset();
      await loadMovies();
    } catch (error: any) {
      showToast("error", error.message || "Failed to bulk import movies");
    }
  };

  const filteredMovies = movies.filter((m) =>
    m.title.toLowerCase().includes(searchTerm.toLowerCase())
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
            <Film className="h-8 w-8 text-accent-primary" />
            <h1 className="text-3xl font-bold text-text-primary">Manage Movies</h1>
          </div>
          <p className="text-text-secondary">Browse, create, edit, and delete movies</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setIsCreating(true)}
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

      {/* Search Bar */}
      <div className="mb-6 flex items-center gap-2 rounded-lg border border-border-default bg-surface-panel px-3 py-2">
        <Search className="h-5 w-5 text-text-muted" />
        <input
          type="text"
          placeholder="Search movies by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-transparent text-text-primary placeholder-text-muted focus:outline-none"
        />
      </div>

      {/* Movies List */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader className="h-8 w-8 animate-spin text-accent-primary" />
            <p className="text-sm text-text-muted">Loading movies...</p>
          </div>
        </div>
      ) : filteredMovies.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border-default">
          <p className="text-sm text-text-muted">No movies found. Create or import one to get started.</p>
        </div>
      ) : (
        <div className="space-y-2 rounded-2xl border border-border-default bg-surface-panel overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 border-b border-border-default bg-surface-raised/50 px-6 py-3 text-sm font-semibold text-text-secondary">
            <div className="col-span-4">Title</div>
            <div className="col-span-2">Release Date</div>
            <div className="col-span-2">Rating</div>
            <div className="col-span-4">Actions</div>
          </div>

          {/* Table Rows */}
          {filteredMovies.map((movie) => (
            <div key={movie.id} className="border-b border-border-default last:border-0 hover:bg-surface-raised/50 transition-colors">
              {editingId === movie.id && editingData ? (
                <div className="grid grid-cols-12 gap-4 px-6 py-4">
                  <input
                    type="text"
                    value={editingData.title}
                    onChange={(e) => setEditingData({ ...editingData, title: e.target.value })}
                    className="col-span-4 rounded-lg border border-border-default bg-surface-base px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                  />
                  <input
                    type="date"
                    value={editingData.release_date || ""}
                    onChange={(e) => setEditingData({ ...editingData, release_date: e.target.value })}
                    className="col-span-2 rounded-lg border border-border-default bg-surface-base px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                  />
                  <input
                    type="number"
                    step="0.1"
                    value={editingData.vote_average || ""}
                    onChange={(e) => setEditingData({ ...editingData, vote_average: parseFloat(e.target.value) })}
                    className="col-span-2 rounded-lg border border-border-default bg-surface-base px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
                  />
                  <div className="col-span-4 flex items-center gap-2">
                    <button
                      onClick={handleUpdateMovie}
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
                  <div className="col-span-4">
                    <p className="text-sm font-medium text-text-primary">{movie.title}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-text-secondary">{movie.release_date || "N/A"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-text-secondary">{movie.rating?.toString() || "N/A"}</p>
                  </div>
                  <div className="col-span-4 flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingId(movie.id.toString());
                        setEditingData({
                          id: movie.id.toString(),
                          title: movie.title,
                          overview: "",
                          release_date: movie.release_date || undefined,
                          vote_average: (movie.rating as unknown as number) || undefined,
                        });
                      }}
                      className="flex items-center gap-1 rounded-lg border border-border-default bg-surface-base px-3 py-2 text-sm font-medium text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-all"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteMovie(movie.id.toString())}
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

      {/* Create Movie Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-border-default bg-surface-panel p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
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
            <h2 className="mb-4 text-xl font-semibold text-text-primary">Bulk Import Movies</h2>
            <form onSubmit={handleBulkImport} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-text-secondary">
                  JSON Array *
                </label>
                <textarea
                  name="json"
                  required
                  rows={12}
                  placeholder='[{"id": 550, "title": "Fight Club", "release_date": "1999-10-15"}]'
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
