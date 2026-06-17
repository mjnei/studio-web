export const PIPELINE_STAGES = ["source", "script", "voice", "compose"] as const;
export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export const PROJECT_STATUSES = [
  "Draft",
  "Script Ready",
  "Voice Ready",
  "Composing",
  "Rendering",
  "Completed",
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const JOB_STATUSES = ["queued", "processing", "failed", "completed"] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];
