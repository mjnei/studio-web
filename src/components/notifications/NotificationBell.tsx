"use client";

import { Bell } from "lucide-react";
import { useNotifications } from "@/lib/notification-context";
import { NotificationDropdown } from "./NotificationDropdown";
import { useState, useRef, useEffect } from "react";

export function NotificationBell() {
  const { unreadCount, isSSEConnected } = useNotifications();
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
        className="relative rounded-lg p-2 text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-all focus-ring group"
        aria-label={`Notifications${unreadCount > 0 ? ` (${displayCount} unread)` : ""}`}
        title="Notifications"
      >
        <Bell size={20} className="group-hover:scale-110 transition-transform duration-200" />
        
        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-status-failed text-white text-[10px] font-semibold flex items-center justify-center leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
        
        {/* Connection indicator */}
        {isSSEConnected && (
          <span className="absolute bottom-1 right-1 h-2 w-2 rounded-full bg-status-success" />
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
