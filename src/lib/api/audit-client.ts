import { request } from "@/lib/api-client";
import type { AuditLog, AuditStats, AuditLogsResponse, AuditFilter } from "@/types/admin";

/**
 * Audit Analytics Client
 * Provides functions for viewing audit logs via Axiom.co integration.
 * Backend uses Axiom for audit storage, not database.
 */

/**
 * Get action summary statistics from a specified data source.
 * Requires mandatory source parameter: 'postgres' or 'axiom'
 * @param source - Data source: 'postgres' or 'axiom' (mandatory)
 * @param hours - Number of hours to look back (default: 24)
 */
export async function getAuditStats(
  source: "postgres" | "axiom",
  hours: number = 24
): Promise<AuditStats> {
  const response = await request<{
    period_hours: number;
    total_events: number;
    actions: Record<string, number>;
    unique_users?: number;
  }>(`/audit/stats?source=${source}&hours=${hours}`);

  // Transform backend response to frontend format
  return {
    total_logs: response.total_events,
    unique_users: response.unique_users || 0,
    actions_by_type: response.actions,
    resources_by_type: {},
    date_range: {
      start: new Date(Date.now() - hours * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString(),
    },
  };
}

/**
 * Get audit trail for a specific user.
 * Requires mandatory source parameter: 'postgres' or 'axiom'
 * @param userId - User ID to get audit trail for
 * @param source - Data source: 'postgres' or 'axiom' (mandatory)
 * @param days - Number of days to look back (default: 7)
 */
export async function getUserAuditTrail(
  userId: number,
  source: "postgres" | "axiom",
  days: number = 7
): Promise<AuditLog[]> {
  const response = await request<{
    user_id: number;
    event_count: number;
    events: Array<{
      timestamp: string;
      user_id: number | null;
      action: string;
      detail: Record<string, any> | null;
      ip_address: string | null;
      environment: string;
      service: string;
    }>;
  }>(`/audit/user/${userId}/trail?source=${source}&days=${days}`);

  // Transform backend events to frontend format
  return response.events.map((event, index) => ({
    id: index, // Events don't have IDs, use index
    user_id: event.user_id,
    action: event.action,
    resource_type: event.detail?.resource_type || null,
    resource_id: event.detail?.resource_id || null,
    changes: event.detail || {},
    created_at: event.timestamp,
    ip_address: event.ip_address,
    source: source as const, // Mark source
  }));
}

/**
 * Get error logs from a specified data source.
 * Requires mandatory source parameter: 'postgres' or 'axiom'
 * @param source - Data source: 'postgres' or 'axiom' (mandatory)
 * @param hours - Number of hours to look back (default: 24)
 */
export async function getErrorLogs(
  source: "postgres" | "axiom",
  hours: number = 24
): Promise<AuditLog[]> {
  const response = await request<{
    period_hours: number;
    total_errors: number;
    errors: Array<{
      timestamp: string;
      user_id: number | null;
      action: string;
      detail: Record<string, any> | null;
      ip_address: string | null;
      environment: string;
      service: string;
    }>;
  }>(`/audit/errors?source=${source}&hours=${hours}`);

  // Transform backend errors to frontend format
  return response.errors.map((event, index) => ({
    id: index,
    user_id: event.user_id,
    action: event.action,
    resource_type: event.detail?.resource_type || null,
    resource_id: event.detail?.resource_id || null,
    changes: event.detail || {},
    created_at: event.timestamp,
    ip_address: event.ip_address,
    source: source as const, // Mark source
  }));
}

/**
 * Execute a custom query against audit logs.
 * Requires mandatory source parameter: currently only 'axiom' is supported.
 * Note: This requires knowledge of Axiom Query Language (APL).
 * @param apl - APL query string
 * @param source - Data source (only 'axiom' supported)
 * @param limit - Maximum results (default: 1000)
 */
export async function executeAuditQuery(
  apl: string,
  source: "postgres" | "axiom" = "axiom",
  limit: number = 1000
): Promise<any[]> {
  const response = await request<{
    query: string;
    result_count: number;
    data: any[];
  }>(`/audit/query?apl=${encodeURIComponent(apl)}&source=${source}&limit=${limit}`);

  return response.data;
}

/**
 * Get Axiom service health status.
 */
export async function getAuditHealth(): Promise<{
  status: string;
  enabled: boolean;
  queued_events: number;
  last_flush: string | null;
}> {
  return request(`/audit/health`);
}

/**
 * Get audit logs with pagination and filtering.
 * Requires mandatory source parameter: 'postgres' or 'axiom'
 * @param source - Data source: 'postgres' or 'axiom' (mandatory)
 * @param limit - Number of logs per page (default: 50)
 * @param offset - Pagination offset (default: 0)
 * @param filters - Optional filters (user_id, action)
 */
export async function getAuditLogs(
  source: "postgres" | "axiom",
  limit: number = 50,
  offset: number = 0,
  filters?: { user_id?: number; action?: string }
): Promise<AuditLogsResponse> {
  const params = new URLSearchParams({
    source: source,
    limit: limit.toString(),
    offset: offset.toString(),
  });

  if (filters?.user_id) {
    params.append("user_id", filters.user_id.toString());
  }
  if (filters?.action) {
    params.append("action", filters.action);
  }

  const response = await request<{
    items: Array<{
      timestamp: string;
      user_id: number | null;
      action: string;
      detail: Record<string, any> | null;
      ip_address: string | null;
      environment: string;
      service: string;
    }>;
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  }>(`/audit/logs?${params.toString()}`);

  return {
    items: response.items.map((event, index) => ({
      id: offset + index,
      user_id: event.user_id,
      action: event.action,
      resource_type: event.detail?.resource_type || null,
      resource_id: event.detail?.resource_id || null,
      changes: event.detail || {},
      created_at: event.timestamp,
      ip_address: event.ip_address,
      source: source as const, // Mark source
    })),
    total: response.total,
    limit: response.limit,
    offset: response.offset,
  };
}

/**
 * Filter audit logs by various criteria.
 * Requires mandatory source parameter: 'postgres' or 'axiom'
 */
export async function filterAuditLogs(
  source: "postgres" | "axiom",
  filter: AuditFilter
): Promise<AuditLogsResponse> {
  return getAuditLogs(source, filter.limit || 50, filter.offset || 0, filter);
}

/**
 * Get audit logs for a specific user.
 * Requires mandatory source parameter: 'postgres' or 'axiom'
 */
export async function getUserAuditLogs(
  userId: number,
  source: "postgres" | "axiom",
  limit: number = 50,
  offset: number = 0
): Promise<AuditLogsResponse> {
  const logs = await getUserAuditTrail(userId, source, 30);
  return {
    items: logs.slice(offset, offset + limit),
    total: logs.length,
    limit,
    offset,
  };
}

/**
 * Get audit logs for a specific resource.
 * Requires mandatory source parameter: 'postgres' or 'axiom'
 * Note: Requires custom APL query (Axiom only).
 */
export async function getResourceAuditLogs(
  resourceType: string,
  resourceId: string,
  source: "postgres" | "axiom",
  limit: number = 50,
  offset: number = 0
): Promise<AuditLogsResponse> {
  if (source === "postgres") {
    throw new Error("Resource filtering requires Axiom. Use source='axiom'.");
  }

  // Use APL query to filter by resource
  const apl = `['studio-back'] | where detail.resource_type == "${resourceType}" and detail.resource_id == "${resourceId}" | limit ${limit}`;
  const data = await executeAuditQuery(apl, source, limit);

  const logs: AuditLog[] = data.map((item: any, index: number) => ({
    id: index,
    user_id: item.user_id,
    action: item.action,
    resource_type: item.detail?.resource_type || null,
    resource_id: item.detail?.resource_id || null,
    changes: item.detail || {},
    created_at: item.timestamp,
    ip_address: item.ip_address,
    source: source as const,
  }));

  return {
    items: logs,
    total: logs.length,
    limit,
    offset: 0,
  };
}

/**
 * Get audit logs by action type.
 * Requires mandatory source parameter: 'postgres' or 'axiom'
 * Note: For PostgreSQL, use getAuditLogs with action filter instead.
 */
export async function getActionAuditLogs(
  action: string,
  source: "postgres" | "axiom",
  limit: number = 50,
  offset: number = 0
): Promise<AuditLogsResponse> {
  return getAuditLogs(source, limit, offset, { action });
}

/**
 * Get audit logs within a date range.
 * Requires mandatory source parameter: 'postgres' or 'axiom'
 * Note: Requires custom APL query (Axiom only for date ranges).
 */
export async function getAuditLogsByDateRange(
  dateFrom: string,
  dateTo: string,
  source: "postgres" | "axiom",
  limit: number = 50,
  offset: number = 0
): Promise<AuditLogsResponse> {
  if (source === "postgres") {
    throw new Error("Date range queries require Axiom. Use source='axiom'.");
  }

  const apl = `['studio-back'] | where timestamp >= datetime("${dateFrom}") and timestamp <= datetime("${dateTo}") | limit ${limit}`;
  const data = await executeAuditQuery(apl, source, limit);

  const logs: AuditLog[] = data.map((item: any, index: number) => ({
    id: index,
    user_id: item.user_id,
    action: item.action,
    resource_type: item.detail?.resource_type || null,
    resource_id: item.detail?.resource_id || null,
    changes: item.detail || {},
    created_at: item.timestamp,
    ip_address: item.ip_address,
    source: source as const,
  }));

  return {
    items: logs,
    total: logs.length,
    limit,
    offset: 0,
  };
}

/**
 * Export audit logs as CSV (client-side generation).
 * Requires mandatory source parameter: 'postgres' or 'axiom'
 */
export async function exportAuditLogsCSV(
  source: "postgres" | "axiom",
  filter?: AuditFilter
): Promise<Blob> {
  // Get logs using filter
  const response = await filterAuditLogs(source, filter || {});

  // Generate CSV client-side
  const headers = [
    "Timestamp",
    "User ID",
    "Action",
    "Resource Type",
    "Resource ID",
    "IP Address",
    "Source",
  ];
  const rows = response.items.map((log) => [
    new Date(log.created_at).toLocaleString(),
    log.user_id?.toString() || "N/A",
    log.action,
    log.resource_type || "N/A",
    log.resource_id || "N/A",
    log.ip_address || "N/A",
    log.source || source,
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  return new Blob([csvContent], { type: "text/csv" });
}
