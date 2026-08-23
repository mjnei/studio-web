"use client";

import { useNotifications } from "@/lib/notification-context";
import { NotificationItem } from "./NotificationItem";
import { Settings, CheckCheck, Bell } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { useI18n } from "@/i18n";

interface NotificationDropdownProps {
  onClose: () => void;
}

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const { notifications, unreadCount, isLoading, markAllAsRead } = useNotifications();
  const { t } = useI18n();

  const handleMarkAllAsRead = async () => {
    const count = notifications.filter((n) => !n.is_read).length;
    if (count === 0) return;

    if (window.confirm(t("notifications.markAllConfirm", { count }))) {
      await markAllAsRead();
    }
  };

  return (
    <div className="w-[calc(100vw-16px)] sm:w-96 md:w-[450px] max-h-[85vh] sm:max-h-[600px] bg-surface-panel rounded-t-xl sm:rounded-xl border border-border-default shadow-2xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-border-default bg-surface-raised flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <Bell className="h-4 w-4 text-text-secondary sm:hidden shrink-0" aria-hidden />
          <Bell className="hidden h-[18px] w-[18px] text-text-secondary sm:block shrink-0" aria-hidden />
          <Heading variant="label" as="h3" className="text-text-primary truncate">
            {t("notifications.title")}
          </Heading>
          {unreadCount > 0 && (
            <span className="text-[10px] sm:text-xs text-text-muted shrink-0">
              {t("notifications.newCount", { count: unreadCount })}
            </span>
          )}
        </div>
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="p-2 min-w-[44px] min-h-[44px] rounded-lg text-text-muted hover:bg-surface-hover hover:text-text-primary active:bg-surface-hover transition-all touch-manipulation flex items-center justify-center"
              title={t("notifications.markAllAsRead")}
              aria-label={t("notifications.markAllAsRead")}
            >
              <CheckCheck className="h-[18px] w-[18px]" aria-hidden />
            </button>
          )}
          <Link
            href="/settings/notifications"
            onClick={onClose}
            className="p-2 min-w-[44px] min-h-[44px] rounded-lg text-text-muted hover:bg-surface-hover hover:text-text-primary active:bg-surface-hover transition-all touch-manipulation flex items-center justify-center"
            title={t("notifications.notificationSettings")}
            aria-label={t("notifications.notificationSettings")}
          >
            <Settings className="h-[18px] w-[18px]" aria-hidden />
          </Link>
        </div>
      </div>

      {/* Notification List */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {isLoading ? (
          <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-text-muted">
            <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin mb-2 sm:mb-3" />
            <p className="text-xs sm:text-sm">{t("notifications.loading")}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-6 sm:p-8 flex flex-col items-center justify-center text-text-muted">
            <Bell className="h-10 w-10 mb-2 sm:mb-3 opacity-50 sm:hidden" aria-hidden />
            <Bell className="hidden h-12 w-12 mb-3 opacity-50 sm:block" aria-hidden />
            <p className="text-xs sm:text-sm font-medium">
              {t("notifications.noNotificationsYet")}
            </p>
            <p className="text-[10px] sm:text-xs mt-1 text-center px-4">
              {t("notifications.noNotificationsHint")}
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
              {t("notifications.viewAll")}
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
