import React from "react";
import { cn } from "@/lib/utils/cn";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "error"
    | "destructive"
    | "info"
    | "outline";
  size?: "sm" | "md" | "lg";
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "md", children, ...props }, ref) => {
    const variants = {
      default:
        "bg-[var(--surface-elevated)] text-[var(--text-secondary)] border border-[var(--border-default)]",
      primary: "bg-[var(--accent-muted)] text-[var(--accent-primary)] border-0",
      secondary: "bg-purple-500/20 text-purple-400 border-0",
      success: "bg-green-500/20 text-green-400 border-0",
      warning: "bg-yellow-500/20 text-yellow-400 border-0",
      error: "bg-red-500/20 text-red-400 border-0",
      destructive: "bg-red-500/20 text-red-400 border-0",
      info: "bg-blue-500/20 text-blue-400 border-0",
      outline: "bg-transparent text-[var(--text-secondary)] border border-[var(--border-default)]",
    };

    const sizes = {
      sm: "px-1.5 py-0.5 text-caption",
      md: "px-2 py-0.5 text-caption",
      lg: "px-2.5 py-1 text-body",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-full font-medium whitespace-nowrap",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
