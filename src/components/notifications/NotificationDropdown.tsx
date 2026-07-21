"use client";

import { useNotifications } from "@/lib/notification-context";
import { NotificationItem } from "./NotificationItem";
import { Settings, CheckCheck, Bell } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface NotificationDropdownProps {
  onClose: () => void;
}

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const { notifications, unreadCount, isLoading, clearAllNotifications } = useNotifications();

  const handleClearAll = async () => {
    if (window.confirm("Clear all notifications? This action cannot be undone.")) {
      await clearAllNotifications();
    }
  };

  return (
    <div className="w-[calc(100vw-16px)] sm:w-96 md:w-[450px] max-h-[85vh] sm:max-h-[600px] bg-surface-panel rounded-t-xl sm:rounded-xl border border-border-default shadow-2xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-border-default bg-surface-raised flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <Bell size={16} className="text-text-secondary sm:hidden shrink-0" />
          <Bell size={18} className="text-text-secondary hidden sm:block shrink-0" />
          <h3 className="text-xs sm:text-sm font-semibold text-text-primary truncate">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span className="text-[10px] sm:text-xs text-text-muted shrink-0">
              ({unreadCount} new)
            </span>
          )}
        </div>
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="p-1.5 sm:p-2 rounded-lg text-text-muted hover:bg-surface-hover hover:text-text-primary active:bg-surface-hover transition-all touch-manipulation"
              title="Clear all notifications"
              aria-label="Clear all notifications"
            >
              <CheckCheck size={14} className="sm:hidden" />
              <CheckCheck size={16} className="hidden sm:block" />
            </button>
          )}
          <Link
            href="/settings/notifications"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-lg text-text-muted hover:bg-surface-hover hover:text-text-primary active:bg-surface-hover transition-all touch-manipulation"
            title="Notification settings"
            aria-label="Notification settings"
          >
            <Settings size={14} className="sm:hidden" />
            <Settings size={16} className="hidden sm:block" />
          </Link>
        </div>
      </div>

      {/* Notification List */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {isLoading ? (
          <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-text-muted">
            <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin mb-2 sm:mb-3" />
            <p className="text-xs sm:text-sm">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-text-muted">
            <Bell size={40} className="mb-2 sm:mb-3 opacity-50 sm:hidden" />
            <Bell size={48} className="mb-3 opacity-50 hidden sm:block" />
            <p className="text-xs sm:text-sm font-medium">No notifications yet</p>
            <p className="text-[10px] sm:text-xs mt-1 text-center px-4">
              You'll see updates here when something happens
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border-default">
            {notifications.slice(0, 5).map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClose={onClose}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-2 sm:p-3 border-t border-border-default bg-surface-raised">
          <Link href="/notifications" onClick={onClose}>
            <Button variant="ghost" className="w-full text-xs sm:text-sm" size="sm">
              View all notifications
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
