"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import { getAuditLogs, getAuditStats } from "@/lib/api/audit-client";
import type { AuditLog, AuditStats, AuditFilter } from "@/types/admin";
import { useToast } from "@/lib/hooks/use-toast";
import AuditStatsCard from "./components/AuditStatsCard";
import AuditLogsTable from "./components/AuditLogsTable";
import AuditFilters from "./components/AuditFilters";

export default function AuditLogsPage() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize: 50,
  });
  const [filters, setFilters] = useState<AuditFilter>({});

  useEffect(() => {
    loadData();
  }, [pagination.page, filters]);

  async function loadData() {
    setIsLoading(true);
    try {
      const [logsResponse, statsData] = await Promise.all([
        getAuditLogs(pagination.pageSize, (pagination.page - 1) * pagination.pageSize, filters),
        getAuditStats(),
      ]);

      setLogs(logsResponse.items);
      setPagination((prev) => ({ ...prev, total: logsResponse.total }));
      setStats(statsData);
    } catch (error) {
      console.error("Failed to load audit logs:", error);
      toast({
        title: "Error",
        description: "Failed to load audit logs",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function handleFilterChange(newFilters: AuditFilter) {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
  }

  function handlePageChange(page: number) {
    setPagination((prev) => ({ ...prev, page }));
  }

  function handleExportCSV() {
    try {
      const headers = ["Timestamp", "User ID", "Action", "Resource Type", "Resource ID", "IP Address"];
      const rows = logs.map((log) => [
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

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "CSV exported successfully",
        variant: "success",
      });
    } catch (error) {
      console.error("Failed to export CSV:", error);
      toast({
        title: "Error",
        description: "Failed to export CSV",
        variant: "error",
      });
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1400px]">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-border bg-surface-panel hover:bg-surface-raised transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Audit Logs</h1>
              <p className="text-sm text-text-muted">
                View and filter system activity logs
              </p>
            </div>
          </div>

          <button
            onClick={handleExportCSV}
            disabled={logs.length === 0}
            className="flex items-center gap-2 rounded-xl border-2 border-border bg-surface-panel px-4 py-2 text-sm font-medium hover:bg-surface-raised disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>

        {/* Stats Cards */}
        {stats && <AuditStatsCard stats={stats} />}

        {/* Filters */}
        <AuditFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClear={() => handleFilterChange({})}
        />

        {/* Logs Table */}
        <AuditLogsTable
          logs={logs}
          isLoading={isLoading}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
