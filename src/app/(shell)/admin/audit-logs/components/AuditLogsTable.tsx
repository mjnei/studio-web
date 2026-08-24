"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Copy, FileText } from "lucide-react";
import type { AuditLog } from "@/types/admin";
import { useToast } from "@/lib/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import ActionBadge from "./ActionBadge";
import SourceBadge from "./SourceBadge";

interface AuditLogsTableProps {
  logs: AuditLog[];
  isLoading: boolean;
  pagination: {
    total: number;
    page: number;
    pageSize: number;
  };
  onPageChange: (page: number) => void;
}

type SortField = "created_at" | "action" | "user_id";
type SortDirection = "asc" | "desc";

function SortIcon({
  field,
  sortField,
  sortDirection,
}: {
  field: SortField;
  sortField: SortField;
  sortDirection: SortDirection;
}) {
  if (sortField !== field) return null;
  return sortDirection === "asc" ? (
    <ChevronUp className="h-4 w-4" aria-hidden />
  ) : (
    <ChevronDown className="h-4 w-4" aria-hidden />
  );
}

export default function AuditLogsTable({
  logs,
  isLoading,
  pagination,
  onPageChange,
}: AuditLogsTableProps) {
  const { toast } = useToast();
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const totalPages = Math.ceil(pagination.total / pagination.pageSize);

  function toggleRow(logId: number) {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  }

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`,
      variant: "success",
    });
  }

  function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return date.toLocaleDateString();
  }

  const sortedLogs = [...logs].sort((a, b) => {
    let aVal: any = a[sortField];
    let bVal: any = b[sortField];

    if (sortField === "created_at") {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }

    if (sortDirection === "asc") {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  if (isLoading) {
    return (
      <div className="rounded-xl border-2 border-border bg-surface-panel p-8">
        <div className="flex items-center justify-center">
          <Spinner size="md" className="text-primary" />
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <EmptyState
        size="md"
        className="rounded-xl border-2 border-border bg-surface-panel"
        icon={<FileText aria-hidden />}
        title="No audit logs found"
        description="Audit events will appear here once activity is recorded."
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-hidden rounded-xl border-2 border-border bg-surface-panel">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-border bg-surface-raised">
                <th
                  className="cursor-pointer px-4 py-3 text-left text-caption font-bold uppercase tracking-wider text-text-muted hover:text-text-primary transition-colors"
                  onClick={() => handleSort("created_at")}
                >
                  <div className="flex items-center gap-1">
                    Timestamp
                    <SortIcon field="created_at" sortField={sortField} sortDirection={sortDirection} />
                  </div>
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-left text-caption font-bold uppercase tracking-wider text-text-muted hover:text-text-primary transition-colors"
                  onClick={() => handleSort("user_id")}
                >
                  <div className="flex items-center gap-1">
                    User
                    <SortIcon field="user_id" sortField={sortField} sortDirection={sortDirection} />
                  </div>
                </th>
                <th
                  className="cursor-pointer px-4 py-3 text-left text-caption font-bold uppercase tracking-wider text-text-muted hover:text-text-primary transition-colors"
                  onClick={() => handleSort("action")}
                >
                  <div className="flex items-center gap-1">
                    Action
                    <SortIcon field="action" sortField={sortField} sortDirection={sortDirection} />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-caption font-bold uppercase tracking-wider text-text-muted">
                  Resource
                </th>
                <th className="px-4 py-3 text-left text-caption font-bold uppercase tracking-wider text-text-muted">
                  IP Address
                </th>
                <th className="px-4 py-3 text-left text-caption font-bold uppercase tracking-wider text-text-muted">
                  Source
                </th>
                <th className="px-4 py-3 text-left text-caption font-bold uppercase tracking-wider text-text-muted">
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedLogs.map((log) => (
                <>
                  <tr
                    key={log.id}
                    className="border-b border-border hover:bg-surface-raised transition-colors"
                  >
                    <td className="px-4 py-3 text-body">
                      <div className="flex flex-col">
                        <span className="font-medium text-text-primary">
                          {formatRelativeTime(log.created_at)}
                        </span>
                        <span className="text-caption text-text-muted">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-body">
                      <div className="flex items-center gap-1">
                        <span className="text-text-primary">{log.user_id || "System"}</span>
                        {log.user_id && (
                          <button
                            onClick={() => copyToClipboard(log.user_id!.toString(), "User ID")}
                            className="text-text-muted hover:text-text-primary transition-colors"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-body">
                      <ActionBadge action={log.action} />
                    </td>
                    <td className="px-4 py-3 text-body">
                      <div className="flex flex-col">
                        <span className="font-medium text-text-primary">
                          {log.resource_type || "N/A"}
                        </span>
                        {log.resource_id && (
                          <div className="flex items-center gap-1">
                            <span className="text-caption text-text-muted truncate max-w-[150px]">
                              {log.resource_id}
                            </span>
                            <button
                              onClick={() => copyToClipboard(log.resource_id!, "Resource ID")}
                              className="text-text-muted hover:text-text-primary transition-colors"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-body text-text-muted">
                      {log.ip_address || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-body">
                      <SourceBadge source={log.source} />
                    </td>
                    <td className="px-4 py-3 text-body">
                      {log.changes && Object.keys(log.changes).length > 0 && (
                        <button
                          onClick={() => toggleRow(log.id)}
                          className="text-primary hover:text-primary-hover font-medium transition-colors"
                        >
                          {expandedRows.has(log.id) ? "Hide" : "Show"}
                        </button>
                      )}
                    </td>
                  </tr>
                  {expandedRows.has(log.id) && log.changes && (
                    <tr className="border-b border-border bg-surface-raised">
                      <td colSpan={7} className="px-4 py-3">
                        <div className="rounded-lg bg-background p-3">
                          <p className="mb-2 text-caption font-bold uppercase text-text-muted">
                            Changes:
                          </p>
                          <pre className="overflow-x-auto text-caption text-text-primary">
                            {JSON.stringify(log.changes, null, 2)}
                          </pre>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {sortedLogs.map((log) => (
          <div
            key={log.id}
            className="rounded-xl border-2 border-border bg-surface-panel p-4 space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <ActionBadge action={log.action} />
                  <SourceBadge source={log.source} />
                </div>
                <p className="text-body text-text-muted">{formatRelativeTime(log.created_at)}</p>
              </div>
            </div>

            <div className="space-y-2 text-body">
              <div>
                <span className="text-text-muted">User: </span>
                <span className="text-text-primary font-medium">{log.user_id || "System"}</span>
              </div>

              {log.resource_type && (
                <div>
                  <span className="text-text-muted">Resource: </span>
                  <span className="text-text-primary font-medium">{log.resource_type}</span>
                </div>
              )}

              {log.resource_id && (
                <div className="flex items-center gap-1">
                  <span className="text-text-muted">ID: </span>
                  <span className="text-text-primary text-caption truncate flex-1">
                    {log.resource_id}
                  </span>
                  <button
                    onClick={() => copyToClipboard(log.resource_id!, "Resource ID")}
                    className="text-text-muted hover:text-text-primary transition-colors"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              )}

              {log.ip_address && (
                <div>
                  <span className="text-text-muted">IP: </span>
                  <span className="text-text-primary">{log.ip_address}</span>
                </div>
              )}
            </div>

            {log.changes && Object.keys(log.changes).length > 0 && (
              <div>
                <button
                  onClick={() => toggleRow(log.id)}
                  className="text-body text-primary hover:text-primary-hover font-medium transition-colors"
                >
                  {expandedRows.has(log.id) ? "Hide Details" : "Show Details"}
                </button>
                {expandedRows.has(log.id) && (
                  <div className="mt-2 rounded-lg bg-background p-3">
                    <pre className="overflow-x-auto text-caption text-text-primary">
                      {JSON.stringify(log.changes, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between rounded-xl border-2 border-border bg-surface-panel px-4 py-3">
        <p className="text-body text-text-muted">
          Showing {(pagination.page - 1) * pagination.pageSize + 1} to{" "}
          {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total}{" "}
          logs
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-border bg-surface-raised hover:bg-surface-panel disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <span className="text-body font-medium text-text-primary">
            Page {pagination.page} of {totalPages}
          </span>

          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= totalPages}
            className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-border bg-surface-raised hover:bg-surface-panel disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
