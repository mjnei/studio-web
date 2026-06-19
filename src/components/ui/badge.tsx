import { HTMLAttributes, forwardRef } from "react";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md" | "lg";
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    { variant = "default", size = "md", className = "", children, ...props },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all rounded-full";

    const variants = {
      default: "bg-surface-raised text-text-secondary border border-border-default",
      primary:
        "bg-gradient-to-r from-accent-secondary/20 to-accent-primary/20 text-accent-primary border border-accent-primary/30",
      success: "bg-status-completed/10 text-status-completed border border-status-completed/30",
      warning: "bg-status-warning/10 text-status-warning border border-status-warning/30",
      danger: "bg-status-failed/10 text-status-failed border border-status-failed/30",
      info: "bg-status-processing/10 text-status-processing border border-status-processing/30",
    };

    const sizes = {
      sm: "px-2 py-0.5 text-xs",
      md: "px-2.5 py-1 text-xs",
      lg: "px-3 py-1.5 text-sm",
    };

    return (
      <span
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
