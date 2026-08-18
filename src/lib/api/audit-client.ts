import { request } from "@/lib/api-client";
import type { AuditLog, AuditStats, AuditLogsResponse, AuditFilter } from "@/types/admin";

/**
 * Audit Analytics Client
 * Provides functions for viewing audit logs via Axiom.co integration.
 * Backend uses Axiom for audit storage, not database.
 */

/**
 * Get audit statistics from PostgreSQL (fallback when Axiom is unavailable).
 * Faster and works without external dependencies.
 */
export async function getAuditStatsPostgres(hours: number = 24): Promise<AuditStats> {
  const response = await request<{
    period_hours: number;
    total_events: number;
    actions: Record<string, number>;
    unique_users: number;
  }>(`/audit/stats/postgres?hours=${hours}`);

  // Transform backend response to frontend format
  return {
    total_logs: response.total_events,
    users_active: response.unique_users,
    actions_by_type: response.actions,
    date_range: {
      start: new Date(Date.now() - hours * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString(),
    },
  };
}

/**
 * Get action summary statistics (aggregated audit data).
 * Uses PostgreSQL endpoint as primary source (fast, reliable).
 * Falls back to Axiom if PostgreSQL fails.
 * @param hours - Number of hours to look back (default: 24)
 */
export async function getAuditStats(hours: number = 24): Promise<AuditStats> {
  try {
    // Try PostgreSQL endpoint first (fast, no external dependency)
    return await getAuditStatsPostgres(hours);
  } catch (error) {
    console.warn("PostgreSQL stats endpoint failed, trying Axiom fallback...", error);

    // Fallback to Axiom-based stats
    const response = await request<{
      period_hours: number;
      total_events: number;
      actions: Record<string, number>;
    }>(`/audit/summary?hours=${hours}`);

    // Transform backend response to frontend format
    return {
      total_logs: response.total_events,
      users_active: 0, // Not provided by Axiom endpoint
      actions_by_type: response.actions,
      date_range: {
        start: new Date(Date.now() - hours * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
      },
    };
  }
}

/**
 * Get audit trail for a specific user.
 * @param userId - User ID to get audit trail for
 * @param days - Number of days to look back (default: 7)
 */
export async function getUserAuditTrail(userId: number, days: number = 7): Promise<AuditLog[]> {
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
  }>(`/audit/user/${userId}/trail?days=${days}`);

  // Transform backend events to frontend format
  return response.events.map((event, index) => ({
    id: index, // Axiom events don't have IDs, use index
    user_id: event.user_id,
    action: event.action,
    resource_type: event.detail?.resource_type || null,
    resource_id: event.detail?.resource_id || null,
    changes: event.detail || {},
    created_at: event.timestamp,
    ip_address: event.ip_address,
    source: "axiom" as const, // Mark source
  }));
}

/**
 * Get error logs (failed actions).
 * @param hours - Number of hours to look back (default: 24)
 */
export async function getErrorLogs(hours: number = 24): Promise<AuditLog[]> {
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
  }>(`/audit/errors?hours=${hours}`);

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
    source: "axiom" as const, // Mark source
  }));
}

/**
 * Execute a custom APL query for advanced filtering.
 * Note: This requires knowledge of Axiom Query Language (APL).
 * @param apl - APL query string
 * @param limit - Maximum results (default: 1000)
 */
export async function executeAuditQuery(apl: string, limit: number = 1000): Promise<any[]> {
  const response = await request<{
    query: string;
    result_count: number;
    data: any[];
  }>(`/audit/query?apl=${encodeURIComponent(apl)}&limit=${limit}`);

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
 * Get audit logs from PostgreSQL (operational queries).
 * Best for: Pagination, list all, recent data (30-90 days), user filters.
 * Faster and works without external dependencies.
 */
export async function getAuditLogsPostgres(
  limit: number = 50,
  offset: number = 0,
  filters?: { user_id?: number; action?: string }
): Promise<AuditLogsResponse> {
  const params = new URLSearchParams({
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
  }>(`/audit/logs/postgres?${params.toString()}`);

  return {
    items: response.items.map((event, index) => ({
      id: offset + index, // Use offset + index for unique IDs across pages
      user_id: event.user_id,
      action: event.action,
      resource_type: event.detail?.resource_type || null,
      resource_id: event.detail?.resource_id || null,
      changes: event.detail || {},
      created_at: event.timestamp,
      ip_address: event.ip_address,
      source: "postgres" as const, // Mark source
    })),
    total: response.total,
    limit: response.limit,
    offset: response.offset,
  };
}

/**
 * Get audit logs with pagination.
 * Uses PostgreSQL endpoint as primary source (fast, reliable).
 * Falls back to Axiom-based queries if PostgreSQL fails.
 */
export async function getAuditLogs(
  limit: number = 50,
  offset: number = 0,
  filter?: AuditFilter
): Promise<AuditLogsResponse> {
  try {
    // Try PostgreSQL endpoint first (fast, no external dependency)
    return await getAuditLogsPostgres(
      limit,
      offset,
      filter
        ? {
            user_id: filter.user_id,
            action: filter.action,
          }
        : undefined
    );
  } catch (error) {
    console.warn("PostgreSQL endpoint failed, trying Axiom fallback...", error);

    // Fallback to Axiom-based queries
    if (filter?.user_id) {
      const logs = await getUserAuditTrail(filter.user_id, 30);
      return {
        items: logs.slice(offset, offset + limit),
        total: logs.length,
        limit,
        offset,
      };
    }

    // If all else fails, get error logs (limited data)
    const logs = await getErrorLogs(24);
    return {
      items: logs.slice(offset, offset + limit),
      total: logs.length,
      limit,
      offset,
    };
  }
}

/**
 * Filter audit logs by various criteria.
 * Note: Backend uses APL queries, so this is limited.
 */
export async function filterAuditLogs(filter: AuditFilter): Promise<AuditLogsResponse> {
  return getAuditLogs(filter.limit || 50, filter.offset || 0, filter);
}

/**
 * Get audit logs for a specific user (alias for getUserAuditTrail).
 */
export async function getUserAuditLogs(
  userId: number,
  limit: number = 50,
  offset: number = 0
): Promise<AuditLogsResponse> {
  const logs = await getUserAuditTrail(userId, 30);
  return {
    items: logs.slice(offset, offset + limit),
    total: logs.length,
    limit,
    offset,
  };
}

/**
 * Get audit logs for a specific resource.
 * Note: Requires custom APL query.
 */
export async function getResourceAuditLogs(
  resourceType: string,
  resourceId: string,
  limit: number = 50,
  offset: number = 0
): Promise<AuditLogsResponse> {
  // Use APL query to filter by resource
  const apl = `['studio-back'] | where detail.resource_type == "${resourceType}" and detail.resource_id == "${resourceId}" | limit ${limit}`;
  const data = await executeAuditQuery(apl, limit);

  const logs: AuditLog[] = data.map((item: any, index: number) => ({
    id: index,
    user_id: item.user_id,
    action: item.action,
    resource_type: item.detail?.resource_type || null,
    resource_id: item.detail?.resource_id || null,
    changes: item.detail || {},
    created_at: item.timestamp,
    ip_address: item.ip_address,
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
 * Note: Requires custom APL query.
 */
export async function getActionAuditLogs(
  action: string,
  limit: number = 50,
  offset: number = 0
): Promise<AuditLogsResponse> {
  const apl = `['studio-back'] | where action == "${action}" | limit ${limit}`;
  const data = await executeAuditQuery(apl, limit);

  const logs: AuditLog[] = data.map((item: any, index: number) => ({
    id: index,
    user_id: item.user_id,
    action: item.action,
    resource_type: item.detail?.resource_type || null,
    resource_id: item.detail?.resource_id || null,
    changes: item.detail || {},
    created_at: item.timestamp,
    ip_address: item.ip_address,
  }));

  return {
    items: logs,
    total: logs.length,
    limit,
    offset: 0,
  };
}

/**
 * Get audit logs within a date range.
 * Note: Requires custom APL query.
 */
export async function getAuditLogsByDateRange(
  dateFrom: string,
  dateTo: string,
  limit: number = 50,
  offset: number = 0
): Promise<AuditLogsResponse> {
  const apl = `['studio-back'] | where timestamp >= datetime("${dateFrom}") and timestamp <= datetime("${dateTo}") | limit ${limit}`;
  const data = await executeAuditQuery(apl, limit);

  const logs: AuditLog[] = data.map((item: any, index: number) => ({
    id: index,
    user_id: item.user_id,
    action: item.action,
    resource_type: item.detail?.resource_type || null,
    resource_id: item.detail?.resource_id || null,
    changes: item.detail || {},
    created_at: item.timestamp,
    ip_address: item.ip_address,
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
 * Backend doesn't provide CSV export endpoint.
 */
export async function exportAuditLogsCSV(filter?: AuditFilter): Promise<Blob> {
  // Get logs using filter
  const response = await filterAuditLogs(filter || {});

  // Generate CSV client-side
  const headers = ["Timestamp", "User ID", "Action", "Resource Type", "Resource ID", "IP Address"];
  const rows = response.items.map((log) => [
    new Date(log.created_at).toLocaleString(),
    log.user_id?.toString() || "N/A",
    log.action,
    log.resource_type || "N/A",
    log.resource_id || "N/A",
    log.ip_address || "N/A",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  return new Blob([csvContent], { type: "text/csv" });
}
