"use client";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { useState } from "react";
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
  const [status, setStatus] = useState<AdminProjectStatus>(project?.status ?? "draft");
  const [statusSource, setStatusSource] = useState(project);
  const [saving, setSaving] = useState(false);

  // Editable draft: re-initialize when the selected project identity/status changes.
  if (project !== statusSource) {
    setStatusSource(project);
    if (project) {
      setStatus(project.status);
    }
  }

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
    <Modal
      open={open}
      onClose={onClose}
      title={project.project_name || `Untitled #${project.id}`}
      description={`Project ID ${project.id}`}
      size="lg"
      scrollable
      closeOnOverlayClick={false}
      contentClassName="space-y-4 text-body"
      footer={
        <>
          {project.is_deleted ? (
            <Button type="button" variant="success" size="md" onClick={() => onRestore(project)}>
              Restore project
            </Button>
          ) : (
            <Button type="button" variant="danger" size="md" onClick={() => onDelete(project)}>
              Soft delete
            </Button>
          )}
          <Button type="button" variant="secondary" size="md" onClick={onClose}>
            Close
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-caption uppercase tracking-wider text-text-muted">Owner</p>
          <p className="mt-1 text-text-primary">{project.user_name || "—"}</p>
          <p className="text-text-secondary">{project.user_email || `User #${project.user_id}`}</p>
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
          <p className="mt-1 text-text-primary">{new Date(project.updated_at).toLocaleString()}</p>
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
          <p className="text-caption uppercase tracking-wider text-text-muted">Active TTS Job</p>
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
            <Select
              size="sm"
              value={status}
              onChange={(value) => setStatus(value as AdminProjectStatus)}
              options={STATUSES.map((s) => ({ value: s, label: s }))}
              className="min-w-[10rem]"
            />
            <Button
              type="button"
              size="md"
              disabled={saving || status === project.status}
              onClick={handleSaveStatus}
            >
              {saving ? "Saving…" : "Save status"}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
