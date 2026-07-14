"use client";

import { useState } from "react";
import { useNotifications, type Notification as NotificationType } from "@/lib/notification-context";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { NotificationPreferencesModal } from "@/components/notifications/NotificationPreferencesModal";
import { Bell, Settings, CheckCheck, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";

const NOTIFICATION_FILTERS = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "video_job_completed", label: "Completed Jobs" },
  { value: "video_job_failed", label: "Failed Jobs" },
  { value: "low_credits", label: "Credit Warnings" },
];

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    isLoading,
    clearAllNotifications,
    refreshNotifications,
  } = useNotifications();

  const [filter, setFilter] = useState("all");
  const [showPreferences, setShowPreferences] = useState(false);

  const handleClearAll = async () => {
    if (window.confirm("Clear all notifications? This action cannot be undone.")) {
      await clearAllNotifications();
      await refreshNotifications();
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.is_read;
    return notification.notification_type === filter;
  });

  return (
    <div className="min-h-screen bg-surface-base">
      <PageHeader
        title="Notifications"
        subtitle={`${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`}
        icon={Bell}
      />

      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Actions Bar */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={16} className="text-text-muted" />
            {NOTIFICATION_FILTERS.map((filterOption) => (
              <button
                key={filterOption.value}
                onClick={() => setFilter(filterOption.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filter === filterOption.value
                    ? "bg-accent-primary text-white"
                    : "bg-surface-raised text-text-secondary hover:bg-surface-hover hover:text-text-primary border border-border-default"
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="gap-2"
              >
                <CheckCheck size={16} />
                Clear All
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreferences(true)}
              className="gap-2"
            >
              <Settings size={16} />
              Preferences
            </Button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-surface-panel rounded-xl border border-border-default overflow-hidden">
          {isLoading ? (
            <div className="p-12 flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-2 border-accent-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-text-muted">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <Bell size={64} className="text-text-muted opacity-50 mb-4" />
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                {filter === "all" ? "No notifications yet" : `No ${filter} notifications`}
              </h3>
              <p className="text-sm text-text-muted max-w-md">
                {filter === "all"
                  ? "You'll see updates here when something happens with your projects."
                  : "Try selecting a different filter to see other notifications."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border-default">
              {filteredNotifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </div>
          )}
        </div>

        {/* Load More (if needed in future) */}
        {filteredNotifications.length >= 50 && (
          <div className="flex justify-center">
            <Button variant="outline" onClick={refreshNotifications}>
              Load More
            </Button>
          </div>
        )}
      </div>

      {/* Preferences Modal */}
      <NotificationPreferencesModal
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
      />
    </div>
  );
}
