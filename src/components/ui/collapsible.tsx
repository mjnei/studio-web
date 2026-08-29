"use client";

import React, { useState, useId } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface CollapsibleProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  variant?: "default" | "elevated" | "surface" | "bordered" | "ghost";
}

export function Collapsible({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  title,
  subtitle,
  icon,
  badge,
  headerAction,
  children,
  className,
  headerClassName,
  contentClassName,
  variant = "elevated",
}: CollapsibleProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;
  const contentId = useId();

  const handleToggle = () => {
    const nextOpen = !isOpen;
    if (!isControlled) {
      setUncontrolledOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  const variantStyles = {
    elevated: "bg-surface-panel border border-border-default shadow-sm rounded-xl overflow-hidden",
    default: "bg-surface-raised border border-border-default rounded-xl overflow-hidden",
    surface: "bg-surface-base border border-border-default rounded-xl overflow-hidden",
    bordered: "bg-transparent border border-border-default rounded-xl overflow-hidden",
    ghost: "bg-transparent border-0 rounded-xl overflow-hidden",
  };

  return (
    <div className={cn(variantStyles[variant], className)}>
      <div
        className={cn(
          "flex items-center justify-between gap-3 p-3.5 sm:p-4 text-left transition-colors cursor-pointer select-none",
          isOpen ? "bg-surface-raised/40" : "hover:bg-surface-raised/60",
          headerClassName
        )}
        onClick={handleToggle}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-controls={contentId}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleToggle();
          }
        }}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {icon && (
            <div className="shrink-0 flex items-center justify-center text-accent-cyan">{icon}</div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-body text-text-primary truncate">{title}</span>
              {badge}
            </div>
            {subtitle && <p className="text-caption text-text-muted mt-0.5 truncate">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {headerAction && <div onClick={(e) => e.stopPropagation()}>{headerAction}</div>}
          <div
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-raised transition-transform duration-200",
              isOpen ? "rotate-180 text-text-primary" : ""
            )}
          >
            <ChevronDown className="h-4 w-4" aria-hidden />
          </div>
        </div>
      </div>

      <div
        id={contentId}
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className={cn("border-t border-border-default/60 p-3.5 sm:p-4", contentClassName)}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export interface CollapsibleSectionProps {
  title: React.ReactNode;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function CollapsibleSection({
  title,
  badge,
  icon,
  defaultOpen = false,
  children,
  className,
}: CollapsibleSectionProps) {
  return (
    <Collapsible
      title={title}
      badge={badge}
      icon={icon}
      defaultOpen={defaultOpen}
      variant="bordered"
      className={className}
    >
      {children}
    </Collapsible>
  );
}
