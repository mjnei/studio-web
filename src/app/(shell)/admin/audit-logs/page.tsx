"use client";

import { Heading } from "@/components/ui/heading";

import { useEffect, useState } from "react";
import { ArrowLeft, Cloud, Database, Download, Info } from "lucide-react";
import Link from "next/link";
import { getAuditLogs, getAuditStats, exportAuditLogsCSV } from "@/lib/api/audit-client";
import type { AuditLog, AuditStats, AuditFilter } from "@/types/admin";
import { useToast } from "@/lib/hooks/use-toast";
import AuditStatsCard from "./components/AuditStatsCard";
import AuditLogsTable from "./components/AuditLogsTable";
import AuditFilters from "./components/AuditFilters";

export default function AuditLogsPage() {
  const { toast } = useToast();
  const [dataSource, setDataSource] = useState<"postgres" | "axiom">("postgres");
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
  }, [pagination.page, filters, dataSource]);

  async function loadData() {
    setIsLoading(true);
    try {
      const [logsResponse, statsData] = await Promise.all([
        getAuditLogs(
          dataSource,
          pagination.pageSize,
          (pagination.page - 1) * pagination.pageSize,
          filters
        ),
        getAuditStats(dataSource),
      ]);

      setLogs(logsResponse.items);
      setPagination((prev) => ({ ...prev, total: logsResponse.total }));
      setStats(statsData);
    } catch (error) {
      console.error("Failed to load audit logs:", error);
      toast({
        title: "Error",
        description: `Failed to load audit logs from ${dataSource}`,
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
      const headers = [
        "Timestamp",
        "User ID",
        "Action",
        "Resource Type",
        "Resource ID",
        "IP Address",
        "Source",
      ];
      const rows = logs.map((log) => [
        new Date(log.created_at).toLocaleString(),
        log.user_id?.toString() || "N/A",
        log.action,
        log.resource_type || "N/A",
        log.resource_id || "N/A",
        log.ip_address || "N/A",
        log.source || dataSource,
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-logs-${dataSource}-${new Date().toISOString().split("T")[0]}.csv`;
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
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-border bg-surface-panel hover:bg-surface-raised transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <Heading variant="page" className="text-text-primary">
                  Audit Logs
                </Heading>
                <p className="text-body text-text-muted">View and filter system activity logs</p>
              </div>
            </div>

            <button
              onClick={handleExportCSV}
              disabled={logs.length === 0}
              className="flex items-center gap-2 rounded-xl border-2 border-border bg-surface-panel px-4 py-2 text-body font-medium hover:bg-surface-raised disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>

          {/* Data Source Toggle */}
          <div className="flex items-center gap-3">
            <span className="text-body font-medium text-text-primary">Data Source:</span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setDataSource("postgres");
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className={`flex items-center gap-2 rounded-xl border-2 px-4 py-2 text-body font-medium transition-colors ${
                  dataSource === "postgres"
                    ? "border-blue-500 bg-blue-500/10 text-blue-500"
                    : "border-border bg-surface-panel text-text-secondary hover:bg-surface-raised"
                }`}
              >
                <Database className="h-4 w-4" />
                PostgreSQL
              </button>
              <button
                onClick={() => {
                  setDataSource("axiom");
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className={`flex items-center gap-2 rounded-xl border-2 px-4 py-2 text-body font-medium transition-colors ${
                  dataSource === "axiom"
                    ? "border-purple-500 bg-purple-500/10 text-purple-500"
                    : "border-border bg-surface-panel text-text-secondary hover:bg-surface-raised"
                }`}
              >
                <Cloud className="h-4 w-4" />
                Axiom
              </button>
            </div>
          </div>
        </div>

        {/* Data Source Info Banner */}
        <div className="mb-6 rounded-xl border-2 border-blue-500/20 bg-blue-500/5 p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500/20">
                <Info className="h-4 w-4 text-blue-500" aria-hidden />
              </div>
            </div>
            <div className="flex-1">
              <Heading variant="label" as="h3" className="text-text-primary mb-1">
                Currently viewing: <span className="capitalize">{dataSource}</span>
              </Heading>
              <p className="text-body text-text-muted mb-2">
                {dataSource === "postgres"
                  ? "Fast operational queries for recent audit logs (30-90 days). Best for quick lookups and filtering."
                  : "Powerful analytics engine with long-term compliance data (years). Best for detailed analysis and aggregations."}
              </p>
              <div className="text-caption text-text-muted">
                {dataSource === "postgres"
                  ? "💡 Tip: Use PostgreSQL for recent activity, fast pagination, and user/action filtering."
                  : "💡 Tip: Use Axiom for historical analysis, custom APL queries, and compliance reports."}
              </div>
            </div>
          </div>
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
