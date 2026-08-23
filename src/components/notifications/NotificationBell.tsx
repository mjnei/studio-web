"use client";

import { Bell } from "lucide-react";
import { useNotifications } from "@/lib/notification-context";
import { NotificationDropdown } from "./NotificationDropdown";
import { useState, useRef, useEffect } from "react";
import { useI18n } from "@/i18n";

export function NotificationBell() {
  const { unreadCount, isSSEConnected } = useNotifications();
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const displayCount = unreadCount > 99 ? "99+" : unreadCount.toString();

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative h-9 w-9 rounded-md text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-all focus-ring group flex items-center justify-center"
        aria-label={
          unreadCount > 0
            ? t("notifications.unreadWithCount", { count: displayCount })
            : t("notifications.title")
        }
        title={t("notifications.title")}
      >
        <Bell
          className="h-4 w-4 group-hover:scale-110 transition-transform duration-200"
          aria-hidden
        />

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-status-failed text-white text-micro font-semibold flex items-center justify-center leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}

        {/* Connection indicator */}
        {isSSEConnected && (
          <span className="absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full bg-status-success" />
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div ref={dropdownRef} className="absolute right-0 top-full mt-2 z-50">
          <NotificationDropdown onClose={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  );
}
