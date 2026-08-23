type JobStatus = "queued" | "processing" | "failed" | "completed";

const statusConfig: Record<JobStatus, { label: string; color: string }> = {
  queued: { label: "Queued", color: "bg-status-queued" },
  processing: { label: "Processing", color: "bg-status-processing" },
  failed: { label: "Failed", color: "bg-status-failed" },
  completed: { label: "Completed", color: "bg-status-completed" },
};

export function JobStatusBadge({ status }: { status: JobStatus }) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-caption font-medium text-white ${config.color}`}
    >
      {status === "processing" && (
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
      )}
      {config.label}
    </span>
  );
}
