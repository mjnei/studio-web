"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { History, Search, ArrowRight, RotateCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { listFlowJobs } from "@/lib/api/flow-client";
import type { FlowJobResponse } from "@/types/flow";

interface FlowJobHistoryProps {
  onSelectJob?: (job: FlowJobResponse) => void;
  currentJobId?: number;
}

export function FlowJobHistory({ onSelectJob, currentJobId }: FlowJobHistoryProps) {
  const router = useRouter();
  const [historyJobs, setHistoryJobs] = useState<FlowJobResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchJobId, setSearchJobId] = useState("");
  const [searchError, setSearchError] = useState<string | null>(null);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const jobs = await listFlowJobs(20);
      setHistoryJobs(jobs);
    } catch (err) {
      console.error("Failed to load flow jobs history:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      try {
        const jobs = await listFlowJobs(20);
        if (isMounted) setHistoryJobs(jobs);
      } catch (err) {
        console.error("Failed to load flow jobs history:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    void fetchHistory();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLookupJob = (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseInt(searchJobId.trim(), 10);
    if (isNaN(id) || id <= 0) {
      setSearchError("Please enter a valid positive numeric Job ID");
      return;
    }

    setSearchError(null);
    router.push(`/admin/flow/${id}`);
    setSearchJobId("");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Completed</Badge>;
      case "processing":
        return <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/20">Processing</Badge>;
      case "failed":
        return <Badge className="bg-red-500/10 text-red-400 border border-red-500/20">Failed</Badge>;
      default:
        return <Badge className="bg-surface-panel text-text-muted border border-border-default">Queued</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-accent-primary" />
          <h3 className="text-body font-semibold text-text-primary">
            Job Lookup & Recent Flow Jobs
          </h3>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={loadHistory}
          disabled={isLoading}
          className="text-caption text-text-muted hover:text-text-primary"
        >
          <RotateCw className={`mr-1.5 h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Lookup Form */}
      <form onSubmit={handleLookupJob} className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="number"
            placeholder="Enter Flow Job ID to inspect..."
            value={searchJobId}
            onChange={(e) => setSearchJobId(e.target.value)}
            className="text-caption h-9"
          />
        </div>
        <Button type="submit" size="sm" disabled={!searchJobId.trim()}>
          <Search className="h-4 w-4" />
          <span className="ml-1.5 hidden sm:inline">Inspect</span>
        </Button>
      </form>

      {searchError && (
        <div className="flex items-center gap-2 text-micro text-red-400 p-2 rounded-lg bg-red-950/20 border border-red-500/20">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{searchError}</span>
        </div>
      )}

      {/* History Table */}
      <div className="rounded-xl border border-border-default bg-surface-panel overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-caption text-text-muted flex items-center justify-center gap-2">
            <Spinner size="sm" /> Loading recent jobs...
          </div>
        ) : historyJobs.length === 0 ? (
          <div className="p-8 text-center text-caption text-text-muted">
            No Flow jobs recorded yet. Submit a new job above!
          </div>
        ) : (
          <div className="overflow-x-auto max-h-72">
            <table className="w-full text-left text-caption">
              <thead className="bg-surface-base border-b border-border-default text-text-secondary text-micro">
                <tr>
                  <th className="py-2.5 px-3">Job ID</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Phase</th>
                  <th className="py-2.5 px-3">Created</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {historyJobs.map((item) => {
                  const isSelected = item.id === currentJobId;
                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors hover:bg-surface-hover ${
                        isSelected ? "bg-accent-muted/20" : ""
                      }`}
                    >
                      <td className="py-2 px-3 font-mono font-bold text-text-primary">
                        #{item.id}
                      </td>
                      <td className="py-2 px-3">{getStatusBadge(item.lifecycle_status)}</td>
                      <td className="py-2 px-3 uppercase text-micro text-text-secondary font-mono">
                        {item.current_phase}
                      </td>
                      <td className="py-2 px-3 text-micro text-text-muted">
                        {new Date(item.created_at).toLocaleTimeString()}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <Link
                          href={`/admin/flow/${item.id}`}
                          onClick={() => onSelectJob?.(item)}
                          className="inline-flex items-center h-7 px-2.5 text-micro font-medium rounded-lg text-accent-primary hover:text-accent-secondary hover:bg-surface-hover transition-colors"
                        >
                          View <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
