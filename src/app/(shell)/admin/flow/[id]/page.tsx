"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, AlertCircle, RotateCw } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { FlowJobMonitor } from "../components/FlowJobMonitor";
import { FlowResultsPreview } from "../components/FlowResultsPreview";
import { FlowJobHistory } from "../components/FlowJobHistory";
import { getFlowJob } from "@/lib/api/flow-client";
import type { FlowJobResponse } from "@/types/flow";

export default function FlowJobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const idParam = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";
  const jobId = parseInt(idParam, 10);

  const isInvalidId = isNaN(jobId) || jobId <= 0;
  const [job, setJob] = useState<FlowJobResponse | null>(null);
  const [isLoading, setIsLoading] = useState(!isInvalidId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isInvalidId) return;

    let isMounted = true;
    const loadJob = async () => {
      try {
        const data = await getFlowJob(jobId);
        if (isMounted) {
          setJob(data);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : "Failed to load flow job";
          setError(msg);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadJob();
    return () => {
      isMounted = false;
    };
  }, [jobId, isInvalidId]);

  const handleManualRetry = async () => {
    if (isInvalidId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getFlowJob(jobId);
      setJob(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load flow job";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const displayError = isInvalidId ? "Invalid Job ID" : error;

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-16">
      {/* Navigation Header */}
      <div className="flex items-center justify-between gap-4 mb-2">
        <Link
          href="/admin/flow"
          className="inline-flex items-center gap-1.5 text-caption text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Flow Jobs
        </Link>
        <Link
          href="/admin/flow"
          className="inline-flex items-center gap-1.5 text-caption text-accent-primary hover:text-accent-secondary font-medium transition-colors"
        >
          <Plus className="h-3.5 w-3.5" /> Create New Job
        </Link>
      </div>

      {isLoading ? (
        <Card variant="glass" padding="lg">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
            <Spinner size="lg" />
            <p className="text-caption text-text-muted">Loading Flow Job #{jobId}...</p>
          </CardContent>
        </Card>
      ) : displayError || !job ? (
        <Card variant="glass" padding="lg">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <div className="rounded-full bg-red-950/40 border border-red-500/30 p-3 text-red-400">
              <AlertCircle className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h2 className="text-body font-semibold text-text-primary">
                Unable to Load Flow Job
              </h2>
              <p className="text-caption text-text-muted max-w-md">
                {displayError || `Flow Job #${jobId} could not be found.`}
              </p>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <Button variant="outline" size="sm" onClick={() => void handleManualRetry()}>
                <RotateCw className="mr-1.5 h-3.5 w-3.5" /> Try Again
              </Button>
              <Button size="sm" onClick={() => router.push("/admin/flow")}>
                Return to Flow Admin
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <PageHeader
            title={`Flow Job #${job.id}`}
            description={`Created at ${new Date(job.created_at).toLocaleString()} • Phase: ${job.current_phase.toUpperCase()} • Status: ${job.lifecycle_status.toUpperCase()}`}
          />

          {/* Active Job Phase Monitor */}
          <Card variant="glass" padding="lg" className="border-accent-primary/30">
            <CardContent>
              <FlowJobMonitor job={job} onUpdateJob={setJob} />
            </CardContent>
          </Card>

          {/* Media Player & Results Preview */}
          <Card variant="glass" padding="lg">
            <CardContent>
              <FlowResultsPreview job={job} />
            </CardContent>
          </Card>

          {/* Recent Jobs History */}
          <Card variant="glass" padding="lg">
            <CardContent>
              <FlowJobHistory currentJobId={job.id} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
