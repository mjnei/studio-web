/**
 * Queue Management Admin API Client
 *
 * Generic queue management endpoints for monitoring and managing all queue types
 * (TTS, Video, Agnes, etc).
 */

import { request } from "@/lib/api-client";
import type {
  QueuesListResponse,
  QueueStats,
  QueuePurgeResponse,
  QueueHistory,
} from "@/lib/types/queue";

/**
 * List all registered queues with current statistics.
 * Requires admin role.
 */
export async function listAllQueues(): Promise<QueuesListResponse> {
  return request<QueuesListResponse>("/queues");
}

/**
 * Get current statistics for a specific queue.
 * Requires admin role.
 *
 * @param queueName - Queue name (e.g., 'tts_jobs', 'video_jobs')
 */
export async function getQueueStats(queueName: string): Promise<QueueStats> {
  return request<QueueStats>(`/queues/${queueName}/stats`);
}

/**
 * Get sampled activity history for a queue (Valkey ZSET time series).
 * Requires admin role.
 *
 * @param queueName - Queue name (e.g., 'tts_jobs')
 * @param rangeSeconds - Lookback window (30–18000); default 18000 (5 hours)
 */
export async function getQueueHistory(
  queueName: string,
  rangeSeconds: number = 18000
): Promise<QueueHistory> {
  return request<QueueHistory>(`/queues/${queueName}/history?range_seconds=${rangeSeconds}`);
}

/**
 * Purge all messages from a queue.
 *
 * ⚠️ WARNING: This permanently deletes all queued messages and cannot be undone.
 * Always use dry_run=true first to preview the action.
 *
 * Requires admin role.
 *
 * @param queueName - Queue to purge
 * @param dryRun - If true (default), only preview. If false, actually purge.
 */
export async function purgeQueue(
  queueName: string,
  dryRun: boolean = true
): Promise<QueuePurgeResponse> {
  return request<QueuePurgeResponse>(`/queues/${queueName}/purge?dry_run=${dryRun}`, {
    method: "POST",
  });
}

/**
 * Get statistics for a queue's dead-letter queue (DLQ).
 * DLQ holds messages that failed processing.
 *
 * Requires admin role.
 *
 * @param queueName - Parent queue name (must have a configured DLQ)
 */
export async function getQueueDLQStats(queueName: string): Promise<QueueStats> {
  return request<QueueStats>(`/queues/${queueName}/dlq`);
}

/**
 * Peek at a message in the queue without removing it.
 * Returns the first message available in the queue.
 *
 * Requires admin role.
 *
 * @param queueName - Queue name to peek into
 * @returns Message data or null if queue is empty
 */
export async function peekQueueMessage(
  queueName: string
): Promise<{ body: string; headers?: Record<string, string>; timestamp?: string } | null> {
  return request<{ body: string; headers?: Record<string, string>; timestamp?: string } | null>(
    `/queues/${queueName}/peek`
  );
}
