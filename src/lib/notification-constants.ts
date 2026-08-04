/**
 * Notification type configuration
 * Shared between notification preferences page and modal
 */

export interface NotificationTypeConfig {
  type: string;
  title: string;
  description: string;
  category: string;
}

export const NOTIFICATION_TYPE_CONFIG: NotificationTypeConfig[] = [
  {
    type: "video_job_queued",
    title: "Video Job Queued",
    description: "When your video generation job is queued for processing",
    category: "Video Jobs",
  },
  {
    type: "video_job_completed",
    title: "Video Job Completed",
    description: "When your video generation is successfully completed",
    category: "Video Jobs",
  },
  {
    type: "video_job_failed",
    title: "Video Job Failed",
    description: "When your video generation encounters an error",
    category: "Video Jobs",
  },
  {
    type: "low_credits",
    title: "Low Credits Warning",
    description: "When your credit balance is running low (below 100 credits)",
    category: "Account",
  },
  {
    type: "credit_transaction",
    title: "Credit Transaction",
    description: "When credits are added to or deducted from your account",
    category: "Account",
  },
  {
    type: "project_deleted",
    title: "Project Deleted",
    description: "When one of your projects is deleted",
    category: "Projects",
  },
  {
    type: "project_published",
    title: "Project Published",
    description: "When your project is successfully published",
    category: "Projects",
  },
];

export const NOTIFICATION_CATEGORIES = ["Video Jobs", "Account", "Projects"] as const;

/**
 * Convert array to record format (for modal compatibility)
 */
export const NOTIFICATION_TYPE_LABELS = NOTIFICATION_TYPE_CONFIG.reduce(
  (acc, { type, title, description }) => {
    acc[type] = { title, description };
    return acc;
  },
  {} as Record<string, { title: string; description: string }>
);
