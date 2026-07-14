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
import { request } from "@/lib/api-client";
import { isPushNotificationsSupported, setupPushNotifications } from "./push-notifications";

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
    push: boolean;
  };
}

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  preferences: NotificationPreferences | null;
  preferencesLoading: boolean;
  isSubscribedToPush: boolean;
  isSSEConnected: boolean;
  markAsRead: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
  fetchPreferences: () => Promise<void>;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
  subscribeToPush: () => Promise<boolean>;
  unsubscribeFromPush: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { isAuthenticated, accessToken } = useAuth() as any;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [preferencesLoading, setPreferencesLoading] = useState(false);
  const [isSubscribedToPush, setIsSubscribedToPush] = useState(false);
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

  // Clear all notifications
  const clearAllNotifications = useCallback(async () => {
    try {
      await request<void>("/notifications/clear-all", { method: "POST" });
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to clear notifications:", error);
    }
  }, []);

  // Fetch preferences
  const fetchPreferences = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setPreferencesLoading(true);
      const response = await request<NotificationPreferences>("/notifications/preferences");
      setPreferences(response);
    } catch (error) {
      console.error("Failed to fetch preferences:", error);
    } finally {
      setPreferencesLoading(false);
    }
  }, [isAuthenticated]);

  // Update preferences
  const updatePreferences = useCallback(
    async (updates: Partial<NotificationPreferences>) => {
      try {
        const newPrefs = { ...(preferences || {}), ...updates } as NotificationPreferences;
        await request<void>("/notifications/preferences", {
          method: "PATCH",
          body: JSON.stringify(newPrefs),
        });
        setPreferences(newPrefs);
      } catch (error) {
        console.error("Failed to update preferences:", error);
        throw error;
      }
    },
    [preferences]
  );

  // Subscribe to push notifications
  const subscribeToPush = useCallback(async () => {
    if (!isPushNotificationsSupported()) {
      console.warn("Push notifications not supported");
      return false;
    }

    try {
      const success = await setupPushNotifications();
      if (success) {
        setIsSubscribedToPush(true);
      }
      return success;
    } catch (error) {
      console.error("Failed to subscribe to push notifications:", error);
      return false;
    }
  }, []);

  // Unsubscribe from push notifications
  const unsubscribeFromPush = useCallback(async () => {
    try {
      await request<void>("/notifications/unsubscribe-push", {
        method: "POST",
        body: JSON.stringify({}),
      });
      setIsSubscribedToPush(false);
      return true;
    } catch (error) {
      console.error("Failed to unsubscribe from push notifications:", error);
      return false;
    }
  }, []);

  // Connect to SSE stream
  const connectSSE = useCallback(() => {
    if (!isAuthenticated || !accessToken) return;

    try {
      // Close existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8020/api/v1";

      // EventSource doesn't support custom headers, so we pass the token as a query parameter
      // The backend needs to be updated to accept token from query params for SSE endpoint
      const url = new URL(`${apiUrl}/notifications/stream`);
      url.searchParams.set("token", accessToken);

      const eventSource = new EventSource(url.toString());

      // Handle connection confirmation
      eventSource.addEventListener("connected", (event) => {
        console.log("SSE connected:", event.data);
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
      eventSource.onerror = () => {
        console.warn("SSE connection error, will attempt to reconnect");
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
            connectSSE();
          }, delay);
        } else {
          console.error("Max SSE reconnection attempts reached");
        }
      };

      eventSourceRef.current = eventSource;

      console.log("SSE connection established");

      return () => {
        eventSource.close();
      };
    } catch (error) {
      console.error("Failed to connect to SSE stream:", error);
      setIsSSEConnected(false);
    }
  }, [isAuthenticated, accessToken]);

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
    if (isAuthenticated) {
      connectSSE();
    } else {
      // Cleanup when logged out
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        setIsSSEConnected(false);
      }
    }
  }, [isAuthenticated, connectSSE]);

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
    isSubscribedToPush,
    isSSEConnected,
    markAsRead,
    deleteNotification,
    clearAllNotifications,
    refreshNotifications,
    refreshUnreadCount,
    fetchPreferences,
    updatePreferences,
    subscribeToPush,
    unsubscribeFromPush,
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
