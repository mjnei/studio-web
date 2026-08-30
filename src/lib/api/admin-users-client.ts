import { request } from "@/lib/api-client";
import type {
  AdminPasswordResetResponse,
  AdminUser,
  AdminUserDeleteResponse,
  AdminUserFilter,
  AdminUserListResponse,
  AdminUserPictureRemoveResponse,
  AdminUserRole,
  AdminUserStats,
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

export async function getAdminUserStats(): Promise<AdminUserStats> {
  return request<AdminUserStats>("/admin/users/stats");
}

export async function getAdminUsers(
  page = 1,
  pageSize = 20,
  filters: AdminUserFilter = {}
): Promise<AdminUserListResponse> {
  const query = buildQuery({
    page,
    page_size: pageSize,
    q: filters.q,
    role: filters.role,
    is_active: filters.is_active,
    include_deleted: filters.include_deleted,
    deleted_only: filters.deleted_only,
  });
  return request<AdminUserListResponse>(`/admin/users${query}`);
}

export async function getAdminUser(userId: number, includeDeleted = false): Promise<AdminUser> {
  const query = buildQuery({ include_deleted: includeDeleted || undefined });
  return request<AdminUser>(`/admin/users/${userId}${query}`);
}

export async function updateAdminUserRole(userId: number, role: AdminUserRole): Promise<AdminUser> {
  return request<AdminUser>(`/admin/users/${userId}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

export async function updateAdminUserStatus(userId: number, isActive: boolean): Promise<AdminUser> {
  return request<AdminUser>(`/admin/users/${userId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ is_active: isActive }),
  });
}

export async function setAdminUserPassword(userId: number, password: string): Promise<AdminUser> {
  return request<AdminUser>(`/admin/users/${userId}/set-password`, {
    method: "POST",
    body: JSON.stringify({ password }),
  });
}

export async function resetAdminUserPassword(userId: number): Promise<AdminPasswordResetResponse> {
  return request<AdminPasswordResetResponse>(`/admin/users/${userId}/reset-password`, {
    method: "POST",
  });
}

export async function removeAdminUserPicture(
  userId: number
): Promise<AdminUserPictureRemoveResponse> {
  return request<AdminUserPictureRemoveResponse>(`/admin/users/${userId}/picture`, {
    method: "DELETE",
  });
}

export async function deleteAdminUser(userId: number): Promise<AdminUserDeleteResponse> {
  return request<AdminUserDeleteResponse>(`/admin/users/${userId}`, {
    method: "DELETE",
  });
}
