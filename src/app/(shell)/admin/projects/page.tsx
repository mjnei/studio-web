"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Folder, RefreshCw } from "lucide-react";
import { Heading } from "@/components/ui/heading";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useToast } from "@/components/ui/toast";
import {
  deleteAdminProject,
  getAdminProjectStats,
  getAdminProjects,
  restoreAdminProject,
  updateAdminProject,
} from "@/lib/api/admin-projects-client";
import type {
  AdminProject,
  AdminProjectFilter,
  AdminProjectStats,
  AdminProjectStatus,
} from "@/types/admin";
import { ProjectDetailModal } from "./components/ProjectDetailModal";
import { ProjectFilters } from "./components/ProjectFilters";
import { ProjectStatsCard } from "./components/ProjectStatsCard";
import { ProjectsTable } from "./components/ProjectsTable";

export default function AdminProjectsPage() {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<AdminProjectStats | null>(null);
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [filters, setFilters] = useState<AdminProjectFilter>({});
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 });
  const [selected, setSelected] = useState<AdminProject | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsData, listData] = await Promise.all([
        getAdminProjectStats(),
        getAdminProjects(pagination.page, pagination.pageSize, filters),
      ]);
      setStats(statsData);
      setProjects(listData.projects);
      setPagination((prev) => ({ ...prev, total: listData.total }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An error occurred";
      toast.error("Failed to load projects", message);
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination.page, pagination.pageSize, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleFilterChange(next: AdminProjectFilter) {
    setFilters(next);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }

  function handleClearFilters() {
    setFilters({});
    setPagination((prev) => ({ ...prev, page: 1 }));
  }

  async function handleStatusChange(projectId: number, status: AdminProjectStatus) {
    try {
      const updated = await updateAdminProject(projectId, { status });
      setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, ...updated } : p)));
      setSelected(updated);
      toast.success("Status updated", `Project #${projectId} set to ${status}`);
      const statsData = await getAdminProjectStats();
      setStats(statsData);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An error occurred";
      toast.error("Failed to update status", message);
      throw error;
    }
  }

  async function handleDelete(project: AdminProject) {
    if (
      !confirm(
        `Soft-delete project "${project.project_name || project.id}"? The owner can no longer see it; you can restore it later.`
      )
    ) {
      return;
    }
    try {
      await deleteAdminProject(project.id);
      toast.success("Project deleted", `Project #${project.id} soft-deleted`);
      setModalOpen(false);
      setSelected(null);
      await loadData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An error occurred";
      toast.error("Failed to delete project", message);
    }
  }

  async function handleRestore(project: AdminProject) {
    try {
      await restoreAdminProject(project.id);
      toast.success("Project restored", `Project #${project.id} restored`);
      setModalOpen(false);
      setSelected(null);
      await loadData();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An error occurred";
      toast.error("Failed to restore project", message);
    }
  }

  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.pageSize));

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="mb-3 inline-flex items-center gap-1.5 text-body text-text-muted hover:text-text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
              <Folder className="h-5 w-5 text-white" />
            </div>
            <div>
              <Heading variant="page" as="h1" className="text-text-primary">
                Projects
              </Heading>
              <p className="text-body text-text-secondary">
                Cross-user project list, status override, and soft-delete
              </p>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={loadData}
          className="inline-flex items-center gap-2 rounded-lg border border-border-default px-3 py-2 text-body text-text-primary hover:bg-surface-hover"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {stats ? <ProjectStatsCard stats={stats} /> : <LoadingSpinner />}

      <ProjectFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      <ProjectsTable
        projects={projects}
        isLoading={isLoading && projects.length === 0}
        onView={(project) => {
          setSelected(project);
          setModalOpen(true);
        }}
        onDelete={handleDelete}
        onRestore={handleRestore}
      />

      {pagination.total > 0 && (
        <div className="flex items-center justify-between text-body text-text-secondary">
          <span>
            Page {pagination.page} of {totalPages} · {pagination.total} projects
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              className="rounded-lg border border-border-default px-3 py-1.5 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={pagination.page >= totalPages}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              className="rounded-lg border border-border-default px-3 py-1.5 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <ProjectDetailModal
        project={selected}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelected(null);
        }}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
        onRestore={handleRestore}
      />
    </div>
  );
}
