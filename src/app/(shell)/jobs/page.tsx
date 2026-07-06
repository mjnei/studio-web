"use client";

import { useState } from "react";
import { Clock, CheckCircle2, XCircle, Loader2, Video, Filter } from "lucide-react";
import { Select } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/EmptyState";

type FilterTab = "all" | "pending" | "completed";

export default function JobsPage() {
  const [filter, setFilter] = useState<FilterTab>("all");

  const filterOptions = [
    { value: "all" as const, label: "All Jobs" },
    { value: "pending" as const, label: "Pending" },
    { value: "completed" as const, label: "Completed" },
  ];

  // Mock data - replace with actual data fetching
  const jobs: any[] = [];

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="My Jobs"
        description="Track your render jobs and video generation progress"
        action={
          <div className="w-full sm:w-48">
            <Select
              value={filter}
              onChange={(value) => setFilter(value as FilterTab)}
              options={filterOptions}
              placeholder="Filter jobs"
            />
          </div>
        }
      />

      {jobs.length === 0 ? (
        <EmptyState
          icon={<Video className="h-16 w-16" />}
          title="No render jobs yet"
          description="When you export a project, it will appear here so you can track progress and download your videos."
        />
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id} variant="elevated" padding="md" className="hover:border-accent-cyan/40 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-text-primary truncate">
                    {job.name}
                  </h3>
                  <p className="text-sm text-text-muted">{job.createdAt}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={job.status === "completed" ? "success" : job.status === "failed" ? "error" : "info"}>
                    {job.status === "processing" && <Loader2 className="w-3 h-3 animate-spin" />}
                    {job.status === "completed" && <CheckCircle2 className="w-3 h-3" />}
                    {job.status === "failed" && <XCircle className="w-3 h-3" />}
                    {job.status === "queued" && <Clock className="w-3 h-3" />}
                    {job.status}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
