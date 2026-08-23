"use client";

import { Heading } from "@/components/ui/heading";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import type { AdminProject, AdminProjectStatus } from "@/types/admin";

interface ProjectDetailModalProps {
  project: AdminProject | null;
  open: boolean;
  onClose: () => void;
  onStatusChange: (projectId: number, status: AdminProjectStatus) => Promise<void>;
  onDelete: (project: AdminProject) => void;
  onRestore: (project: AdminProject) => void;
}

const STATUSES: AdminProjectStatus[] = ["draft", "in-progress", "completed"];

export function ProjectDetailModal({
  project,
  open,
  onClose,
  onStatusChange,
  onDelete,
  onRestore,
}: ProjectDetailModalProps) {
  const [status, setStatus] = useState<AdminProjectStatus>("draft");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (project) setStatus(project.status);
  }, [project]);

  if (!open || !project) return null;

  async function handleSaveStatus() {
    if (!project || status === project.status) return;
    setSaving(true);
    try {
      await onStatusChange(project.id, status);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border-default bg-surface-panel shadow-xl">
        <div className="flex items-start justify-between border-b border-border-default px-5 py-4">
          <div>
            <Heading variant="section" as="h2" className="text-text-primary">
              {project.project_name || `Untitled #${project.id}`}
            </Heading>
            <p className="mt-1 text-body text-text-muted">Project ID {project.id}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-text-muted hover:bg-surface-hover hover:text-text-primary"
            aria-label="Close"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4 text-body">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-caption uppercase tracking-wider text-text-muted">Owner</p>
              <p className="mt-1 text-text-primary">{project.user_name || "—"}</p>
              <p className="text-text-secondary">
                {project.user_email || `User #${project.user_id}`}
              </p>
            </div>
            <div>
              <p className="text-caption uppercase tracking-wider text-text-muted">Movie</p>
              <p className="mt-1 text-text-primary">{project.movie?.title || "—"}</p>
            </div>
            <div>
              <p className="text-caption uppercase tracking-wider text-text-muted">Step</p>
              <p className="mt-1 text-text-primary">{project.last_step}</p>
            </div>
            <div>
              <p className="text-caption uppercase tracking-wider text-text-muted">Updated</p>
              <p className="mt-1 text-text-primary">
                {new Date(project.updated_at).toLocaleString()}
              </p>
            </div>
          </div>

          {project.script_summary && (
            <div>
              <p className="text-caption uppercase tracking-wider text-text-muted">Summary</p>
              <p className="mt-1 text-text-secondary">{project.script_summary}</p>
            </div>
          )}

          {project.active_tts_job && (
            <div>
              <p className="text-caption uppercase tracking-wider text-text-muted">
                Active TTS Job
              </p>
              <p className="mt-1 text-text-primary">
                #{project.active_tts_job.id} · {project.active_tts_job.status}
              </p>
              {project.active_tts_job.error_message && (
                <p className="mt-1 text-red-600">{project.active_tts_job.error_message}</p>
              )}
            </div>
          )}

          {!project.is_deleted && (
            <div className="rounded-xl border border-border-default bg-surface-raised p-4">
              <p className="mb-2 text-caption font-semibold uppercase tracking-wider text-text-muted">
                Status override
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as AdminProjectStatus)}
                  className="rounded-lg border border-border-default bg-surface-panel px-3 py-2 text-body text-text-primary"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={saving || status === project.status}
                  onClick={handleSaveStatus}
                  className="rounded-lg bg-accent-primary px-4 py-2 text-body font-medium text-white disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save status"}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-border-default px-5 py-4">
          {project.is_deleted ? (
            <button
              type="button"
              onClick={() => onRestore(project)}
              className="rounded-lg bg-green-600 px-4 py-2 text-body font-medium text-white hover:opacity-90"
            >
              Restore project
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onDelete(project)}
              className="rounded-lg bg-red-600 px-4 py-2 text-body font-medium text-white hover:opacity-90"
            >
              Soft delete
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border-default px-4 py-2 text-body text-text-primary hover:bg-surface-hover"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
