"use client";

import { RefreshCw, Download } from "lucide-react";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { formatRefreshTime } from "./formatters";
import type { ReactNode } from "react";

interface TTSJobsPageHeaderProps {
  icon: ReactNode;
  iconGradientClassName: string;
  title: string;
  description: string;
  autoRefresh: boolean;
  isLoading: boolean;
  lastRefresh: Date;
  exportDisabled: boolean;
  onToggleAutoRefresh: () => void;
  onRefresh: () => void;
  onExport: () => void;
}

export function TTSJobsPageHeader({
  icon,
  iconGradientClassName,
  title,
  description,
  autoRefresh,
  isLoading,
  lastRefresh,
  exportDisabled,
  onToggleAutoRefresh,
  onRefresh,
  onExport,
}: TTSJobsPageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-xl shadow-lg ${iconGradientClassName}`}
            >
              {icon}
            </div>
            <Heading variant="page" className="text-text-primary">
              {title}
            </Heading>
          </div>
          <p className="text-text-secondary">{description}</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="md"
            variant={autoRefresh ? "success" : "secondary"}
            onClick={onToggleAutoRefresh}
            leftIcon={<RefreshCw className={`h-4 w-4 ${autoRefresh ? "animate-spin" : ""}`} />}
          >
            Auto-refresh {autoRefresh ? "ON" : "OFF"}
          </Button>

          <Button
            size="md"
            variant="secondary"
            onClick={onRefresh}
            disabled={isLoading}
            leftIcon={<RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />}
          >
            Refresh
          </Button>

          <Button
            size="md"
            onClick={onExport}
            disabled={exportDisabled}
            leftIcon={<Download className="h-4 w-4" />}
          >
            Export CSV
          </Button>
        </div>
      </div>

      <p className="text-caption text-text-muted">
        Last refreshed: {formatRefreshTime(lastRefresh)} {autoRefresh && "(auto-refresh every 5s)"}
      </p>
    </div>
  );
}
