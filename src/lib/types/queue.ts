/**
 * Queue Management Types
 *
 * Type definitions for the unified queue management system.
 */

export type QueueCategory = "tts" | "video" | "agnes" | "system";

export interface QueueMetadata {
  name: string;
  display_name: string;
  category: QueueCategory;
  description: string;
  is_job_queue: boolean;
  dlq_name: string | null;
  retention_hours: number | null;
  max_messages: number | null;
}

export interface QueueStats {
  queue_name: string;
  message_count: number;
  consumer_count: number;
  metadata?: QueueMetadata;
}

export interface QueuesListResponse {
  queues: Record<string, QueueStats>;
  total: number;
}

export interface QueuePurgeResponse {
  queue_name: string;
  status: "preview" | "purged";
  action: string;
  messages_before: number;
  messages_deleted: number | null;
}

export interface QueueHealth {
  status: "healthy" | "warning" | "critical";
  message: string;
}

/**
 * Helper function to determine queue health based on stats
 */
export function getQueueHealth(stats: QueueStats): QueueHealth {
  const { message_count, consumer_count, metadata } = stats;

  // Critical: No consumers and messages are piling up — nothing is processing them
  if (metadata?.is_job_queue && consumer_count === 0 && message_count > 0) {
    return {
      status: "critical",
      message: "No active consumers processing messages",
    };
  }

  // Warning: No consumers and no messages — queue is idle with no workers attached
  if (metadata?.is_job_queue && consumer_count === 0 && message_count === 0) {
    return {
      status: "warning",
      message: "No active consumers",
    };
  }

  // Warning: Queue backing up (>1000 messages)
  if (message_count > 1000) {
    return {
      status: "warning",
      message: `Queue has ${message_count.toLocaleString()} messages`,
    };
  }

  // Warning: Approaching max messages (if configured)
  if (metadata?.max_messages && message_count > metadata.max_messages * 0.8) {
    return {
      status: "warning",
      message: `Queue at ${Math.round((message_count / metadata.max_messages) * 100)}% capacity`,
    };
  }

  return {
    status: "healthy",
    message: "Operating normally",
  };
}

/**
 * Get color classes for queue health status
 */
export function getHealthColor(status: QueueHealth["status"]): {
  badge: string;
  icon: string;
} {
  switch (status) {
    case "critical":
      return {
        badge: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        icon: "text-red-600 dark:text-red-400",
      };
    case "warning":
      return {
        badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        icon: "text-yellow-600 dark:text-yellow-400",
      };
    case "healthy":
      return {
        badge: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        icon: "text-green-600 dark:text-green-400",
      };
  }
}

/**
 * Get display label for queue category
 */
export function getCategoryLabel(category: QueueCategory): string {
  switch (category) {
    case "tts":
      return "TTS";
    case "video":
      return "Video";
    case "agnes":
      return "Agnes AI";
    case "system":
      return "System";
  }
}
