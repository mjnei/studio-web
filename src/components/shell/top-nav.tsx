"use client";

import Link from "next/link";
import { PanelLeft, Search, Plus, Bell, ChevronDown } from "lucide-react";
import { useSidebar } from "@/components/shell/sidebar-context";
import { Button } from "@/components/ui/button";

export function TopNav() {
  const { toggle, isNarrow } = useSidebar();

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border-default bg-surface-panel/80 backdrop-blur-xl px-4 md:px-6 sticky top-0 z-40 transition-all duration-200">
        {/* Mobile Hamburger Menu - Only on mobile */}
        {isNarrow && (
          <button
            onClick={toggle}
            className="rounded-lg p-2 text-text-muted hover:bg-surface-hover hover:text-text-secondary transition-all active:scale-95 focus-ring"
            aria-label="Open navigation menu"
            title="Open navigation menu"
          >
            <PanelLeft size={24} />
          </button>
        )}

        <div className="ml-auto flex items-center gap-2 md:gap-3">
          {/* Search Bar */}
          <div className="hidden lg:block relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search projects..."
              className="w-64 rounded-lg border border-border-default bg-surface-raised pl-10 pr-4 py-2 text-sm text-text-primary placeholder-text-muted focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/20 focus:outline-none transition-all hover:border-border-strong"
            />
          </div>

          {/* New Project Button */}
          <Link href="/project/new" className="hidden sm:inline-flex">
            <Button
              variant="primary"
              size="md"
              className="group"
              icon={
                <Plus
                  size={18}
                  className="transition-transform group-hover:rotate-90 duration-300"
                />
              }
            >
              New Project
            </Button>
          </Link>

          {/* Mobile New Project Button */}
          <Link href="/project/new" className="sm:hidden">
            <Button variant="primary" size="md" iconOnly icon={<Plus size={18} />} />
          </Link>

          {/* Notifications */}
          <button className="relative rounded-lg p-2 text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-all focus-ring group">
            <Bell size={20} className="group-hover:scale-110 transition-transform duration-200" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-status-failed pulse-soft" />
          </button>
        </div>
      </header>
    </>
  );
}
