import { HTMLAttributes, forwardRef } from "react";

export interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md" | "lg";
}

export const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ variant = "default", size = "md", className = "", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 ease-smooth";

    const variants = {
      default: "bg-surface-raised text-text-secondary border border-border-default",
      primary: "bg-accent-primary/15 text-accent-primary border border-accent-primary/30",
      success: "bg-status-success/15 text-status-success border border-status-success/30",
      warning: "bg-status-warning/15 text-status-warning border border-status-warning/30",
      danger: "bg-status-failed/15 text-status-failed border border-status-failed/30",
      info: "bg-status-info/15 text-status-info border border-status-info/30",
    };

    const sizes = {
      sm: "px-2 py-1 text-xs",
      md: "px-3 py-1.5 text-sm",
      lg: "px-4 py-2 text-base",
    };

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Badge.displayName = "Badge";
