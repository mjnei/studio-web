"use client";

import { type Notification } from "@/lib/notification-context";
import { useNotifications } from "@/lib/notification-context";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle2, AlertCircle, Info, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n";

interface NotificationItemProps {
  notification: Notification;
  onClose?: () => void;
}

const iconMap = {
  video_job_completed: CheckCircle2,
  video_job_failed: AlertCircle,
  video_job_queued: Info,
  low_credits: AlertCircle,
  credit_transaction: CheckCircle2,
  project_deleted: Info,
  project_published: CheckCircle2,
};

const colorMap = {
  video_job_completed: "text-status-success",
  video_job_failed: "text-status-failed",
  video_job_queued: "text-accent-primary",
  low_credits: "text-status-warning",
  credit_transaction: "text-status-success",
  project_deleted: "text-text-muted",
  project_published: "text-status-success",
};

export function NotificationItem({ notification, onClose }: NotificationItemProps) {
  const { markAsRead, deleteNotification } = useNotifications();
  const router = useRouter();
  const { t } = useI18n();

  const handleClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    // Don't navigate if clicking on action buttons
    const target = e.target as HTMLElement;
    if (target.closest("button")) {
      return;
    }

    // Mark as read if unread
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // Close dropdown if provided
    if (onClose) {
      onClose();
    }

    // Navigate if action URL exists
    const actionUrl = notification.action_url;
    if (actionUrl) {
      router.push(actionUrl);
    }
  };

  const handleMarkAsRead = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await deleteNotification(notification.id);
  };

  const Icon = iconMap[notification.notification_type as keyof typeof iconMap] || Info;
  const iconColor =
    colorMap[notification.notification_type as keyof typeof colorMap] || "text-text-muted";

  const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true });

  return (
    <div
      className={`p-3 sm:p-4 hover:bg-surface-hover active:bg-surface-hover transition-all cursor-pointer group ${
        !notification.is_read ? "bg-accent-primary/5" : ""
      }`}
      onClick={handleClick}
    >
      <div className="flex gap-2 sm:gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 ${iconColor} mt-0.5`}>
          <Icon className="h-4 w-4" aria-hidden />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-caption font-medium text-text-primary line-clamp-1">
              {notification.message_short}
            </h4>
            {!notification.is_read && (
              <span className="flex-shrink-0 h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-accent-primary mt-1 sm:mt-1.5" />
            )}
          </div>
          <p className="text-micro sm:text-caption text-text-secondary mt-1 line-clamp-2">
            {notification.message_medium}
          </p>
          <div className="flex items-center justify-between mt-1.5 sm:mt-2">
            <span className="text-micro sm:text-caption text-text-muted">{timeAgo}</span>
            <div className="flex items-center gap-0.5 sm:gap-1 opacity-0 group-hover:opacity-100 sm:group-hover:opacity-100 group-active:opacity-100 transition-opacity">
              {!notification.is_read && (
                <button
                  onClick={handleMarkAsRead}
                  className="p-1 sm:p-1 rounded text-text-muted hover:text-accent-primary hover:bg-surface-raised active:bg-surface-raised transition-all touch-manipulation"
                  title={t("notifications.markAsRead")}
                  aria-label={t("notifications.markAsRead")}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                </button>
              )}
              <button
                onClick={handleDelete}
                className="p-1 sm:p-1 rounded text-text-muted hover:text-status-failed hover:bg-surface-raised active:bg-surface-raised transition-all touch-manipulation"
                title={t("notifications.deleteNotification")}
                aria-label={t("notifications.deleteNotification")}
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
