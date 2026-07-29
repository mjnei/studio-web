"use client";

import React from "react";
import { Play, CheckCircle2, AlertTriangle, Video, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JobsSummary, JobStatusFilter } from "@/types/jobs";

interface StatusCardsProps {
  summary: JobsSummary;
  activeFilter: JobStatusFilter;
  onSelectFilter: (filter: JobStatusFilter) => void;
  onRetryAllFailed?: () => void;
}

export const StatusCards: React.FC<StatusCardsProps> = ({
  summary,
  activeFilter,
  onSelectFilter,
  onRetryAllFailed,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Active Jobs */}
      <Card
        variant="elevated"
        interactive
        onClick={() => onSelectFilter("active")}
        className={`relative overflow-hidden border-2 transition-all ${
          activeFilter === "active" ? "border-accent-primary shadow-glow" : "border-border-default"
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-text-secondary">Active Jobs</span>
              {summary.activeCount > 0 && (
                <Badge variant="info" className="animate-pulse flex items-center gap-1 text-[10px] py-0 px-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-ping" />
                  Live
                </Badge>
              )}
            </div>
            <p className="text-3xl font-bold text-text-primary">{summary.activeCount}</p>
            <p className="text-xs text-text-muted">
              {summary.activeCount > 0 ? "Currently rendering" : "No active jobs"}
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-md">
            <Play className="h-5.5 w-5.5 fill-current" />
          </div>
        </div>
      </Card>

      {/* Completed Jobs */}
      <Card
        variant="elevated"
        interactive
        onClick={() => onSelectFilter("completed")}
        className={`relative overflow-hidden border-2 transition-all ${
          activeFilter === "completed" ? "border-status-success shadow-glow" : "border-border-default"
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-sm font-medium text-text-secondary">Completed</span>
            <p className="text-3xl font-bold text-text-primary">{summary.completedCount}</p>
            <p className="text-xs text-status-success font-medium">
              {summary.successRate}% success rate
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md">
            <CheckCircle2 className="h-5.5 w-5.5" />
          </div>
        </div>
      </Card>

      {/* Failed Jobs */}
      <Card
        variant="elevated"
        interactive
        onClick={() => onSelectFilter("failed")}
        className={`relative overflow-hidden border-2 transition-all ${
          activeFilter === "failed" ? "border-status-failed shadow-glow" : "border-border-default"
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-sm font-medium text-text-secondary">Failed</span>
            <p className="text-3xl font-bold text-text-primary">{summary.failedCount}</p>
            {summary.failedCount > 0 && onRetryAllFailed ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onRetryAllFailed();
                }}
                className="h-6 px-1.5 text-xs text-status-failed hover:bg-status-failed/10 hover:text-status-failed flex items-center gap-1 -ml-1 mt-0.5"
              >
                <RotateCcw className="h-3 w-3" />
                Retry All
              </Button>
            ) : (
              <p className="text-xs text-text-muted">No failed attempts</p>
            )}
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-red-500 text-white shadow-md">
            <AlertTriangle className="h-5.5 w-5.5" />
          </div>
        </div>
      </Card>

      {/* Total Jobs */}
      <Card
        variant="elevated"
        interactive
        onClick={() => onSelectFilter("all")}
        className={`relative overflow-hidden border-2 transition-all ${
          activeFilter === "all" ? "border-accent-primary shadow-glow" : "border-border-default"
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-sm font-medium text-text-secondary">Total Jobs</span>
            <p className="text-3xl font-bold text-text-primary">{summary.totalCount}</p>
            <p className="text-xs text-text-muted">
              {summary.creditsUsed} credit{summary.creditsUsed !== 1 ? "s" : ""} used
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-md">
            <Video className="h-5.5 w-5.5" />
          </div>
        </div>
      </Card>
    </div>
  );
};
