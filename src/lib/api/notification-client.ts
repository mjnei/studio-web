import { request } from "@/lib/api-client";
import type {
  NotificationPreference,
  PreferencesListResponse,
  Channels,
  UpdatePreferenceRequest,
  BulkUpdatePreferencesRequest,
} from "@/types/admin";

/**
 * Notification Preferences Client
 * Provides functions for managing user notification preferences.
 */

/**
 * Get all notification preferences for the current user.
 */
export async function getNotificationPreferences(): Promise<PreferencesListResponse> {
  return request<PreferencesListResponse>("/notifications/preferences");
}

/**
 * Update a single notification preference.
 */
export async function updateNotificationPreference(
  notificationType: string,
  enabled: boolean,
  channels: Channels
): Promise<NotificationPreference> {
  const body: UpdatePreferenceRequest = {
    notification_type: notificationType,
    enabled,
    ...channels,
  };

  return request<NotificationPreference>("/notifications/preferences", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

/**
 * Bulk update multiple notification preferences.
 * Useful for "enable all" or "disable all" functionality.
 */
export async function updateAllNotificationPreferences(
  updates: Partial<NotificationPreference>[]
): Promise<PreferencesListResponse> {
  const body: BulkUpdatePreferencesRequest = {
    preferences: updates,
  };

  return request<PreferencesListResponse>("/notifications/preferences/bulk", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

/**
 * Enable all notifications for all channels.
 */
export async function enableAllNotifications(): Promise<PreferencesListResponse> {
  // First get all preferences
  const prefs = await getNotificationPreferences();

  // Update all to enabled with all channels
  const updates = prefs.items.map((pref) => ({
    notification_type: pref.notification_type,
    enabled: true,
    email: true,
    in_app: true,
    push: true,
  }));

  return updateAllNotificationPreferences(updates);
}

/**
 * Disable all notifications.
 */
export async function disableAllNotifications(): Promise<PreferencesListResponse> {
  // First get all preferences
  const prefs = await getNotificationPreferences();

  // Update all to disabled
  const updates = prefs.items.map((pref) => ({
    notification_type: pref.notification_type,
    enabled: false,
    email: false,
    in_app: false,
    push: false,
  }));

  return updateAllNotificationPreferences(updates);
}

/**
 * Enable/disable a specific channel across all notification types.
 */
export async function updateChannelForAll(
  channel: "email" | "in_app" | "push",
  enabled: boolean
): Promise<PreferencesListResponse> {
  // First get all preferences
  const prefs = await getNotificationPreferences();

  // Update the specific channel for all preferences
  const updates = prefs.items.map((pref) => ({
    notification_type: pref.notification_type,
    [channel]: enabled,
  }));

  return updateAllNotificationPreferences(updates);
}

/**
 * Reset notification preferences to defaults.
 * Note: This endpoint may not exist yet in backend.
 */
export async function resetNotificationPreferences(): Promise<PreferencesListResponse> {
  return request<PreferencesListResponse>("/notifications/preferences/reset", {
    method: "POST",
  });
}

/**
 * Get available notification types (for displaying in UI).
 * Note: This endpoint may not exist yet in backend, fallback to hardcoded list.
 */
export async function getNotificationTypes(): Promise<string[]> {
  try {
    return request<string[]>("/notifications/types");
  } catch {
    // Fallback to common notification types
    return [
      "tts_complete",
      "video_ready",
      "project_complete",
      "system_alert",
      "maintenance_notice",
      "credit_low",
      "subscription_renewal",
    ];
  }
}
