"use client";

import { useState, useRef, useEffect } from "react";
import { useNotifications } from "@/lib/notification-context";
import { Bell, X, Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, deleteNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const displayedNotifications = notifications.slice(0, 5); // Show 5 most recent

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative p-2 rounded-lg transition-colors",
          "hover:bg-surface-secondary text-text-primary",
          "focus:outline-none focus:ring-2 focus:ring-primary"
        )}
        aria-label="Notifications"
      >
        <Bell size={20} />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <div
            className={cn(
              "absolute top-1 right-1 flex items-center justify-center",
              "w-5 h-5 rounded-full bg-destructive text-white text-xs font-bold"
            )}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </div>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={cn(
            "absolute right-0 top-12 w-80 rounded-lg shadow-lg",
            "bg-surface-secondary border border-surface-tertiary",
            "z-50 overflow-hidden"
          )}
        >
          {/* Header */}
          <div className="border-b border-surface-tertiary p-4 flex justify-between items-center">
            <h3 className="font-semibold text-text-primary">Notifications</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-surface-tertiary rounded transition-colors"
            >
              <X size={18} className="text-text-muted" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {displayedNotifications.length === 0 ? (
              <div className="p-6 text-center text-text-muted">
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              displayedNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 border-b border-surface-tertiary last:border-b-0",
                    "transition-colors hover:bg-surface-tertiary cursor-pointer",
                    !notification.is_read && "bg-surface-secondary/80"
                  )}
                >
                  <div className="flex gap-3">
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text-primary text-sm truncate">
                        {notification.message_short}
                      </p>
                      <p className="text-text-secondary text-xs mt-1 line-clamp-2">
                        {notification.message_medium}
                      </p>
                      <p className="text-text-muted text-xs mt-2">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1">
                      {!notification.is_read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          className={cn(
                            "p-1 rounded transition-colors",
                            "hover:bg-surface-secondary text-text-muted hover:text-primary"
                          )}
                          title="Mark as read"
                        >
                          <Check size={16} />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className={cn(
                          "p-1 rounded transition-colors",
                          "hover:bg-surface-secondary text-text-muted hover:text-destructive"
                        )}
                        title="Delete notification"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 5 && (
            <div className="border-t border-surface-tertiary p-3 text-center">
              <a
                href="/notifications"
                className={cn(
                  "text-sm font-medium text-primary",
                  "hover:text-primary-dark transition-colors"
                )}
              >
                View all notifications
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
