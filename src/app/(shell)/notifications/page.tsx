"use client";

import { useState } from "react";
import { useNotifications } from "@/lib/notification-context";
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
  const { notifications, unreadCount, isLoading, markAllAsRead, refreshNotifications } =
    useNotifications();

  const [filter, setFilter] = useState("all");
  const [showPreferences, setShowPreferences] = useState(false);

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n) => !n.is_read);
    if (unreadNotifications.length === 0) {
      return;
    }

    if (
      window.confirm(
        `Mark ${unreadNotifications.length} notification${unreadNotifications.length !== 1 ? "s" : ""} as read?`
      )
    ) {
      await markAllAsRead();
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
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="Notifications"
        description={`${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`}
      />

      <div className="mb-6">
        {/* Actions Bar */}
        <div className="flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
          {/* Filters */}
          <div className="w-full sm:w-auto">
            {/* Mobile: Dropdown */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full sm:hidden rounded-lg border border-border-default bg-surface-panel px-3 py-2 text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
            >
              {NOTIFICATION_FILTERS.map((filterOption) => (
                <option key={filterOption.value} value={filterOption.value}>
                  {filterOption.label}
                </option>
              ))}
            </select>

            {/* Desktop: Button group */}
            <div className="hidden sm:flex items-center gap-2 flex-wrap">
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
                  aria-label={`Filter by ${filterOption.label}`}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="gap-2 flex-1 sm:flex-none"
                aria-label="Mark all notifications as read"
              >
                <CheckCheck size={16} />
                <span>Mark All as Read</span>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreferences(true)}
              className="gap-2 flex-1 sm:flex-none"
              aria-label="Open notification preferences"
            >
              <Settings size={16} />
              <span>Preferences</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-surface-panel rounded-xl border border-border-default overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-2 border-accent-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm text-text-muted">Loading notifications...</p>
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
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={refreshNotifications} size="sm">
            Load More
          </Button>
        </div>
      )}

      {/* Preferences Modal */}
      <NotificationPreferencesModal
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
      />
    </div>
  );
}
