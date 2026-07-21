"use client";

import { useState } from "react";
import {
  useNotifications,
  type Notification as NotificationType,
} from "@/lib/notification-context";
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
  const { notifications, unreadCount, isLoading, clearAllNotifications, refreshNotifications } =
    useNotifications();

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

      <div className="max-w-5xl mx-auto px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6 space-y-4 sm:space-y-5 md:space-y-6">
        {/* Actions Bar */}
        <div className="flex items-start sm:items-center justify-between gap-3 sm:gap-4 flex-col sm:flex-row">
          {/* Filters */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap w-full sm:w-auto">
            <Filter size={14} className="text-text-muted sm:hidden" />
            <Filter size={16} className="text-text-muted hidden sm:block" />
            {NOTIFICATION_FILTERS.map((filterOption) => (
              <button
                key={filterOption.value}
                onClick={() => setFilter(filterOption.value)}
                className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all touch-manipulation ${
                  filter === filterOption.value
                    ? "bg-accent-primary text-white"
                    : "bg-surface-raised text-text-secondary hover:bg-surface-hover hover:text-text-primary active:bg-surface-hover border border-border-default"
                }`}
                aria-label={`Filter by ${filterOption.label}`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="gap-1.5 sm:gap-2 flex-1 sm:flex-none touch-manipulation"
                aria-label="Clear all notifications"
              >
                <CheckCheck size={14} className="sm:hidden" />
                <CheckCheck size={16} className="hidden sm:block" />
                <span className="text-xs sm:text-sm">Clear All</span>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreferences(true)}
              className="gap-1.5 sm:gap-2 flex-1 sm:flex-none touch-manipulation"
              aria-label="Open notification preferences"
            >
              <Settings size={14} className="sm:hidden" />
              <Settings size={16} className="hidden sm:block" />
              <span className="text-xs sm:text-sm">Preferences</span>
            </Button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-surface-panel rounded-lg sm:rounded-xl border border-border-default overflow-hidden">
          {isLoading ? (
            <div className="p-8 sm:p-10 md:p-12 flex flex-col items-center justify-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-accent-primary border-t-transparent rounded-full animate-spin mb-3 sm:mb-4" />
              <p className="text-xs sm:text-sm text-text-muted">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 sm:p-10 md:p-12 flex flex-col items-center justify-center text-center">
              <Bell size={48} className="text-text-muted opacity-50 mb-3 sm:mb-4 sm:hidden" />
              <Bell size={64} className="text-text-muted opacity-50 mb-4 hidden sm:block" />
              <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-1.5 sm:mb-2">
                {filter === "all" ? "No notifications yet" : `No ${filter} notifications`}
              </h3>
              <p className="text-xs sm:text-sm text-text-muted max-w-md px-4">
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
          <div className="flex justify-center pt-2 sm:pt-4">
            <Button
              variant="outline"
              onClick={refreshNotifications}
              className="touch-manipulation"
              size="sm"
            >
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
