"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { useAuth } from "./auth-context";
import { request, getAccessToken } from "@/lib/api-client";

export interface Notification {
  id: string;
  user_id: string;
  notification_type: string;
  message_short: string;
  message_medium: string;
  message_extended?: string;
  project_id?: number;
  related_resource_type?: string;
  related_resource_id?: number;
  action_url?: string;
  is_read: boolean;
  read_at?: string;
  is_deleted: boolean;
  created_at: string;
  updated_at?: string;
}

export interface NotificationPreferences {
  [key: string]: {
    in_app: boolean;
  };
}

export interface BackendPreference {
  notification_type: string;
  enabled_in_app: boolean;
}

export interface BackendPreferencesResponse {
  preferences: BackendPreference[];
}

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  preferences: NotificationPreferences | null;
  preferencesLoading: boolean;
  isSSEConnected: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
  fetchPreferences: () => Promise<void>;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [preferencesLoading, setPreferencesLoading] = useState(false);
  const [isSSEConnected, setIsSSEConnected] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttemptsRef = useRef(5);
  const reconnectDelayRef = useRef(1000); // Start at 1 second

  // Fetch notifications list
  const refreshNotifications = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      const response = await request<{ notifications: Notification[] }>(
        "/notifications?limit=50&offset=0"
      );
      setNotifications(response.notifications || []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch unread count
  const refreshUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await request<{ count: number }>("/notifications/unread-count");
      setUnreadCount(response.count || 0);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  }, [isAuthenticated]);

  // Mark notification as read
  const markAsRead = useCallback(
    async (id: string) => {
      try {
        await request<void>(`/notifications/${id}/read`, { method: "PATCH" });
        // Optimistically update UI
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
          )
        );
        await refreshUnreadCount();
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    },
    [refreshUnreadCount]
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.is_read);

      // Mark all unread notifications as read
      await Promise.all(unreadNotifications.map((n) => markAsRead(n.id)));

      // Refresh the list and count
      await refreshNotifications();
      await refreshUnreadCount();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  }, [notifications, markAsRead, refreshNotifications, refreshUnreadCount]);

  // Delete notification
  const deleteNotification = useCallback(
    async (id: string) => {
      try {
        await request<void>(`/notifications/${id}`, { method: "DELETE" });
        // Optimistically update UI
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        await refreshUnreadCount();
      } catch (error) {
        console.error("Failed to delete notification:", error);
      }
    },
    [refreshUnreadCount]
  );

  // Fetch preferences
  const fetchPreferences = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setPreferencesLoading(true);
      const response = await request<BackendPreferencesResponse>("/notifications/preferences");

      // Transform backend format to frontend format
      const transformed: NotificationPreferences = {};
      response.preferences.forEach((pref) => {
        transformed[pref.notification_type] = {
          in_app: pref.enabled_in_app,
        };
      });

      setPreferences(transformed);
    } catch (error) {
      console.error("Failed to fetch preferences:", error);
    } finally {
      setPreferencesLoading(false);
    }
  }, [isAuthenticated]);

  // Update preferences
  const updatePreferences = useCallback(async (updates: Partial<NotificationPreferences>) => {
    try {
      // Transform each preference update to backend format and send individually
      const updatePromises = Object.entries(updates).map(([notificationType, pref]) => {
        if (!pref) {
          return Promise.resolve();
        }
        return request<void>("/notifications/preferences", {
          method: "PATCH",
          body: JSON.stringify({
            notification_type: notificationType,
            enabled_in_app: pref.in_app,
          }),
        });
      });

      await Promise.all(updatePromises);

      // Update local state - filter out undefined values
      setPreferences((prev) => {
        const filtered = Object.entries(updates).reduce((acc, [key, value]) => {
          if (value !== undefined) {
            acc[key] = value;
          }
          return acc;
        }, {} as NotificationPreferences);
        return { ...(prev || {}), ...filtered };
      });
    } catch (error) {
      console.error("Failed to update preferences:", error);
      throw error;
    }
  }, []);

  // Connect to SSE stream
  const connectSSE = useCallback(() => {
    console.log("[SSE] connectSSE called, isAuthenticated:", isAuthenticated);

    if (!isAuthenticated) {
      console.log("[SSE] Not authenticated, skipping connection");
      return;
    }

    // Get the current access token
    const accessToken = getAccessToken();
    console.log("[SSE] Retrieved access token:", accessToken ? "present" : "missing");

    if (!accessToken) {
      console.warn("[SSE] Cannot connect to SSE: no access token available");
      return;
    }

    // Skip if already connected and healthy
    if (eventSourceRef.current && eventSourceRef.current.readyState !== EventSource.CLOSED) {
      console.log("[SSE] Connection already exists and is active, skipping reconnect");
      return;
    }

    try {
      // Close existing connection if it exists
      if (eventSourceRef.current) {
        console.log("[SSE] Closing existing connection before reconnecting");
        eventSourceRef.current.close();
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8020/api/v1";

      // EventSource doesn't support custom headers — pass access token as ?token=
      // Notifications SSE contract: studio-backend/docs/SSE (Server-Sent Events).md
      const url = new URL(`${apiUrl}/notifications/stream`);
      url.searchParams.set("token", accessToken);

      console.log(
        "[SSE] Connecting to SSE stream:",
        url.toString().replace(/token=[^&]+/, "token=***")
      );

      const eventSource = new EventSource(url.toString());

      // Handle connection confirmation
      eventSource.addEventListener("connected", (event) => {
        console.log("[SSE] ✅ SSE connected:", event.data);
        setIsSSEConnected(true);
        reconnectAttemptsRef.current = 0;
      });

      // Handle incoming notifications
      eventSource.addEventListener("notification", (event) => {
        try {
          console.log("📩 SSE notification received:", event.data);
          const notification = JSON.parse(event.data) as Notification;
          console.log("📩 Parsed notification:", notification);
          // Add to the beginning of the list
          setNotifications((prev) => {
            console.log("📩 Adding notification to list, current count:", prev.length);
            return [notification, ...prev];
          });
          // Increment unread count
          setUnreadCount((prev) => {
            console.log("📩 Incrementing unread count from", prev, "to", prev + 1);
            return prev + 1;
          });
        } catch (error) {
          console.error("Failed to parse notification:", error);
        }
      });

      // Handle ping/heartbeat
      eventSource.addEventListener("ping", () => {
        // Connection is alive
        console.debug("SSE ping received");
      });

      // Handle errors
      eventSource.onerror = (error) => {
        console.error("[SSE] ⚠️ SSE connection error:", error);
        console.warn("[SSE] SSE connection error, will attempt to reconnect");
        eventSource.close();
        setIsSSEConnected(false);

        // Attempt to reconnect with exponential backoff
        if (reconnectAttemptsRef.current < maxReconnectAttemptsRef.current) {
          reconnectAttemptsRef.current++;
          const delay = Math.min(
            reconnectDelayRef.current * Math.pow(2, reconnectAttemptsRef.current - 1),
            30000
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            // eslint-disable-next-line react-hooks/immutability
            connectSSE();
          }, delay);
        } else {
          console.error("Max SSE reconnection attempts reached");
        }
      };

      eventSourceRef.current = eventSource;

      console.log("[SSE] ✅ SSE connection established, waiting for events");

      return () => {
        eventSource.close();
      };
    } catch (error) {
      console.error("[SSE] ❌ Failed to connect to SSE stream:", error);
      setIsSSEConnected(false);
    }
  }, [isAuthenticated]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  // Connect to SSE when authenticated
  useEffect(() => {
    console.log("[SSE] useEffect triggered - isAuthenticated:", isAuthenticated);
    if (isAuthenticated) {
      const accessToken = getAccessToken();
      console.log(
        "[SSE] Calling connectSSE from useEffect, token:",
        accessToken ? "present" : "missing"
      );

      // Only attempt connection if token is available
      if (accessToken) {
        connectSSE();
      } else {
        console.warn("[SSE] Token not yet available, will retry when token is set");
        // Retry after a short delay to allow token to be set
        const retryTimer = setTimeout(() => {
          const retryToken = getAccessToken();
          if (retryToken) {
            console.log("[SSE] Token now available, connecting SSE");
            connectSSE();
          } else {
            console.error("[SSE] Token still not available after delay");
          }
        }, 500);

        return () => clearTimeout(retryTimer);
      }
    } else {
      console.log("[SSE] Not authenticated, cleaning up existing connection");
      // Cleanup when logged out
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        setIsSSEConnected(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]); // Only depend on isAuthenticated, not connectSSE to avoid reconnection loops

  // Initial data fetch when authenticated

  useEffect(() => {
    if (isAuthenticated) {
      refreshNotifications();
      refreshUnreadCount();
      fetchPreferences();
    }
  }, [isAuthenticated, refreshNotifications, refreshUnreadCount, fetchPreferences]);

  // Set up periodic polling for unread count (fallback if SSE fails)
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      refreshUnreadCount();
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, refreshUnreadCount]);

  const value: NotificationContextValue = {
    notifications,
    unreadCount,
    isLoading,
    preferences,
    preferencesLoading,
    isSSEConnected,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
    refreshUnreadCount,
    fetchPreferences,
    updatePreferences,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return ctx;
}
