"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";
import { Spinner } from "@/components/ui/spinner";
import { useI18n } from "@/i18n";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success" | "destructive";
  size?: "icon" | "sm" | "md" | "lg";
  isLoading?: boolean;
  loading?: boolean; // Alias for isLoading
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const { t } = useI18n();
    const isLoadingState = isLoading || loading;

    const variants = {
      primary:
        "bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-white shadow-glow hover:shadow-glow-hover disabled:opacity-50 disabled:cursor-not-allowed",
      secondary:
        "bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] text-[var(--text-primary)] border border-[var(--border-default)] hover:border-[var(--border-strong)]",
      outline:
        "border-2 border-[var(--accent-primary)] text-[var(--accent-primary)] hover:bg-[var(--accent-muted)] disabled:opacity-50",
      ghost:
        "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]",
      danger:
        "bg-[var(--status-error)] hover:bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed",
      destructive:
        "bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed",
      success:
        "bg-[var(--status-success)] hover:bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed",
    };

    const sizes = {
      icon: "h-10 w-10 p-0",
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-base",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus-ring disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className
        )}
        disabled={disabled || isLoadingState}
        aria-busy={isLoadingState || undefined}
        aria-disabled={disabled || isLoadingState || undefined}
        {...props}
      >
        {isLoadingState ? (
          <>
            <Spinner size="sm" />
            <span>{t("common.loading")}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
