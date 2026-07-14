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
    <div className="w-[400px] max-h-[600px] bg-surface-panel rounded-xl border border-border-default shadow-2xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border-default bg-surface-raised flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-text-secondary" />
          <h3 className="text-sm font-semibold text-text-primary">Notifications</h3>
          {unreadCount > 0 && <span className="text-xs text-text-muted">({unreadCount} new)</span>}
        </div>
        <div className="flex items-center gap-1">
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="p-1.5 rounded-lg text-text-muted hover:bg-surface-hover hover:text-text-primary transition-all"
              title="Clear all notifications"
            >
              <CheckCheck size={16} />
            </button>
          )}
          <Link
            href="/settings/notifications"
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:bg-surface-hover hover:text-text-primary transition-all"
            title="Notification settings"
          >
            <Settings size={16} />
          </Link>
        </div>
      </div>

      {/* Notification List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-8 flex flex-col items-center justify-center text-text-muted">
            <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 flex flex-col items-center justify-center text-text-muted">
            <Bell size={48} className="mb-3 opacity-50" />
            <p className="text-sm font-medium">No notifications yet</p>
            <p className="text-xs mt-1">You'll see updates here when something happens</p>
          </div>
        ) : (
          <div className="divide-y divide-border-default">
            {notifications.slice(0, 10).map((notification) => (
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
        <div className="p-3 border-t border-border-default bg-surface-raised">
          <Link href="/notifications" onClick={onClose}>
            <Button variant="ghost" className="w-full text-sm" size="sm">
              View all notifications
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
