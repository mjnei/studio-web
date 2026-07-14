"use client";

import { type Notification } from "@/lib/notification-context";
import { useNotifications } from "@/lib/notification-context";
import { formatDistanceToNow } from "date-fns";
import { X, CheckCircle, AlertCircle, Info, Trash2 } from "lucide-react";
import Link from "next/link";

interface NotificationItemProps {
  notification: Notification;
  onClose?: () => void;
}

const iconMap = {
  video_job_completed: CheckCircle,
  video_job_failed: AlertCircle,
  video_job_queued: Info,
  low_credits: AlertCircle,
  credit_transaction: CheckCircle,
  project_deleted: Info,
  project_published: CheckCircle,
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
  const iconColor = colorMap[notification.notification_type as keyof typeof colorMap] || "text-text-muted";

  const timeAgo = formatDistanceToNow(new Date(notification.created_at), { addSuffix: true });

  // Extract action URL from notification if it exists
  const actionUrl = notification.action_url;

  const content = (
    <div
      className={`p-4 hover:bg-surface-hover transition-all cursor-pointer group ${
        !notification.is_read ? "bg-accent-primary/5" : ""
      }`}
      onClick={handleMarkAsRead}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 ${iconColor} mt-0.5`}>
          <Icon size={18} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-medium text-text-primary line-clamp-1">
              {notification.message_short}
            </h4>
            {!notification.is_read && (
              <span className="flex-shrink-0 h-2 w-2 rounded-full bg-accent-primary mt-1.5" />
            )}
          </div>
          <p className="text-xs text-text-secondary mt-1 line-clamp-2">
            {notification.message_medium}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-text-muted">{timeAgo}</span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {!notification.is_read && (
                <button
                  onClick={handleMarkAsRead}
                  className="p-1 rounded text-text-muted hover:text-accent-primary hover:bg-surface-raised transition-all"
                  title="Mark as read"
                >
                  <CheckCircle size={14} />
                </button>
              )}
              <button
                onClick={handleDelete}
                className="p-1 rounded text-text-muted hover:text-status-failed hover:bg-surface-raised transition-all"
                title="Delete notification"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Wrap in Link if action URL exists
  if (actionUrl) {
    return (
      <Link href={actionUrl} onClick={onClose}>
        {content}
      </Link>
    );
  }

  return content;
}
