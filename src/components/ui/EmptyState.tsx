import React from "react";
import { cn } from "@/lib/utils/cn";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  variant?: "default" | "bordered" | "elevated";
  size?: "sm" | "md" | "lg";
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
  variant = "default",
  size = "md",
}) => {
  const sizeClasses = {
    sm: {
      container: "py-8 px-4",
      icon: "h-10 w-10 mb-3",
      title: "text-sm",
      description: "text-xs",
    },
    md: {
      container: "py-12 px-4",
      icon: "h-12 w-12 mb-4",
      title: "text-base",
      description: "text-sm",
    },
    lg: {
      container: "py-16 px-4",
      icon: "h-16 w-16 mb-4",
      title: "text-lg",
      description: "text-sm",
    },
  };

  const variantClasses = {
    default: "",
    bordered: "rounded-2xl border border-dashed border-border-default bg-surface-panel/50",
    elevated: "rounded-2xl border border-border-default bg-surface-panel shadow-sm",
  };

  const sizeConfig = sizeClasses[size];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        sizeConfig.container,
        variantClasses[variant],
        className
      )}
    >
      {icon && (
        <div
          className={cn(
            "flex items-center justify-center rounded-full bg-surface-raised text-text-muted opacity-50",
            sizeConfig.icon
          )}
        >
          {icon}
        </div>
      )}
      <h3 className={cn("font-semibold text-text-primary mb-2", sizeConfig.title)}>{title}</h3>
      {description && (
        <p className={cn("text-text-secondary max-w-md mb-6", sizeConfig.description)}>
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
};
