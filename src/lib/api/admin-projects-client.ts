import { request } from "@/lib/api-client";
import type {
  AdminProject,
  AdminProjectFilter,
  AdminProjectListResponse,
  AdminProjectStats,
  AdminProjectUpdate,
} from "@/types/admin";

function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === "") continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function getAdminProjectStats(): Promise<AdminProjectStats> {
  return request<AdminProjectStats>("/admin/projects/stats");
}

export async function getAdminProjects(
  page = 1,
  pageSize = 20,
  filters: AdminProjectFilter = {}
): Promise<AdminProjectListResponse> {
  const query = buildQuery({
    page,
    page_size: pageSize,
    status: filters.status,
    step: filters.step,
    user_id: filters.user_id,
    q: filters.q,
    include_deleted: filters.include_deleted,
    deleted_only: filters.deleted_only,
  });
  return request<AdminProjectListResponse>(`/admin/projects${query}`);
}

export async function getAdminProject(
  projectId: number,
  includeDeleted = false
): Promise<AdminProject> {
  const query = buildQuery({ include_deleted: includeDeleted || undefined });
  return request<AdminProject>(`/admin/projects/${projectId}${query}`);
}

export async function updateAdminProject(
  projectId: number,
  data: AdminProjectUpdate
): Promise<AdminProject> {
  return request<AdminProject>(`/admin/projects/${projectId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteAdminProject(projectId: number, permanent = false): Promise<void> {
  const query = buildQuery({ permanent: permanent || undefined });
  await request<void>(`/admin/projects/${projectId}${query}`, {
    method: "DELETE",
  });
}

export async function restoreAdminProject(projectId: number): Promise<AdminProject> {
  return request<AdminProject>(`/admin/projects/${projectId}/restore`, {
    method: "POST",
  });
}
