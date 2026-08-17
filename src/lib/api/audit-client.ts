import { request } from "@/lib/api-client";
import type {
  AuditLog,
  AuditStats,
  AuditLogsResponse,
  AuditFilter,
} from "@/types/admin";

/**
 * Audit Logs Client
 * Provides functions for viewing and filtering audit logs for compliance.
 */

/**
 * Get audit logs with pagination.
 */
export async function getAuditLogs(
  limit: number = 50,
  offset: number = 0
): Promise<AuditLogsResponse> {
  return request<AuditLogsResponse>(`/audit-analytics?limit=${limit}&offset=${offset}`);
}

/**
 * Get audit log statistics (actions breakdown, active users, etc.).
 */
export async function getAuditStats(): Promise<AuditStats> {
  return request<AuditStats>("/audit-analytics/stats");
}

/**
 * Filter audit logs by various criteria.
 */
export async function filterAuditLogs(filter: AuditFilter): Promise<AuditLogsResponse> {
  const params = new URLSearchParams();

  if (filter.action) params.append("action", filter.action);
  if (filter.user_id) params.append("user_id", filter.user_id.toString());
  if (filter.resource_type) params.append("resource_type", filter.resource_type);
  if (filter.resource_id) params.append("resource_id", filter.resource_id);
  if (filter.date_from) params.append("date_from", filter.date_from);
  if (filter.date_to) params.append("date_to", filter.date_to);

  const limit = filter.limit || 50;
  const offset = filter.offset || 0;
  params.append("limit", limit.toString());
  params.append("offset", offset.toString());

  return request<AuditLogsResponse>(`/audit-analytics?${params.toString()}`);
}

/**
 * Get audit logs for a specific user.
 */
export async function getUserAuditLogs(
  userId: number,
  limit: number = 50,
  offset: number = 0
): Promise<AuditLogsResponse> {
  return filterAuditLogs({ user_id: userId, limit, offset });
}

/**
 * Get audit logs for a specific resource.
 */
export async function getResourceAuditLogs(
  resourceType: string,
  resourceId: string,
  limit: number = 50,
  offset: number = 0
): Promise<AuditLogsResponse> {
  return filterAuditLogs({ resource_type: resourceType, resource_id: resourceId, limit, offset });
}

/**
 * Get audit logs by action type.
 */
export async function getActionAuditLogs(
  action: string,
  limit: number = 50,
  offset: number = 0
): Promise<AuditLogsResponse> {
  return filterAuditLogs({ action, limit, offset });
}

/**
 * Get audit logs within a date range.
 */
export async function getAuditLogsByDateRange(
  dateFrom: string,
  dateTo: string,
  limit: number = 50,
  offset: number = 0
): Promise<AuditLogsResponse> {
  return filterAuditLogs({ date_from: dateFrom, date_to: dateTo, limit, offset });
}

/**
 * Export audit logs as CSV (if backend supports it).
 * Note: This endpoint may not exist yet in backend.
 */
export async function exportAuditLogsCSV(filter?: AuditFilter): Promise<Blob> {
  const params = new URLSearchParams();

  if (filter?.action) params.append("action", filter.action);
  if (filter?.user_id) params.append("user_id", filter.user_id.toString());
  if (filter?.resource_type) params.append("resource_type", filter.resource_type);
  if (filter?.resource_id) params.append("resource_id", filter.resource_id);
  if (filter?.date_from) params.append("date_from", filter.date_from);
  if (filter?.date_to) params.append("date_to", filter.date_to);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8020/api/v1"}/audit-analytics/export?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to export audit logs: ${response.statusText}`);
  }

  return response.blob();
}
