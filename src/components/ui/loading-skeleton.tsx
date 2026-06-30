"use client";

import { cn } from "@/lib/utils/cn";

interface LoadingSkeletonProps {
  className?: string;
  variant?: "card" | "text" | "grid" | "list" | "poster";
  count?: number;
}

/**
 * LoadingSkeleton - Standard loading skeleton component
 * Provides consistent loading states across the application
 */
export function LoadingSkeleton({ className, variant = "card", count = 1 }: LoadingSkeletonProps) {
  const skeletons = Array.from({ length: count });

  // Base skeleton pulse animation
  const baseClasses = "animate-pulse bg-surface-raised rounded-lg";

  // Card skeleton - for content cards
  if (variant === "card") {
    return (
      <div className={cn("space-y-4", className)}>
        {skeletons.map((_, i) => (
          <div key={i} className={cn(baseClasses, "h-32 w-full")} />
        ))}
      </div>
    );
  }

  // Text skeleton - for text lines
  if (variant === "text") {
    return (
      <div className={cn("space-y-2", className)}>
        {skeletons.map((_, i) => (
          <div key={i} className={cn(baseClasses, "h-4 w-full")} />
        ))}
      </div>
    );
  }

  // Grid skeleton - for grid layouts (voices, suggestions)
  if (variant === "grid") {
    return (
      <div className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-3", className)}>
        {skeletons.map((_, i) => (
          <div key={i} className={cn(baseClasses, "h-32")} />
        ))}
      </div>
    );
  }

  // List skeleton - for list items
  if (variant === "list") {
    return (
      <div className={cn("space-y-2", className)}>
        {skeletons.map((_, i) => (
          <div key={i} className={cn(baseClasses, "h-16 w-full")} />
        ))}
      </div>
    );
  }

  // Poster skeleton - for movie posters
  if (variant === "poster") {
    return (
      <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", className)}>
        {skeletons.map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className={cn(baseClasses, "aspect-[2/3] w-full")} />
            <div className={cn(baseClasses, "h-4 w-3/4")} />
            <div className={cn(baseClasses, "h-3 w-1/2")} />
          </div>
        ))}
      </div>
    );
  }

  // Default card skeleton
  return (
    <div className={cn("space-y-4", className)}>
      {skeletons.map((_, i) => (
        <div key={i} className={cn(baseClasses, "h-32 w-full")} />
      ))}
    </div>
  );
}

/**
 * PageLoadingSkeleton - Full page loading state
 * Used for initial page loads
 */
export function PageLoadingSkeleton({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-accent-cyan border-r-transparent" />
        <p className="text-text-secondary">{message}</p>
      </div>
    </div>
  );
}

/**
 * InlineLoadingSkeleton - Inline loading indicator
 * Used for inline loading states (e.g., generating AI suggestions)
 */
export function InlineLoadingSkeleton({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-8 text-text-muted text-sm border border-dashed border-border-default rounded-lg bg-surface-base/50">
      <div className="inline-block h-5 w-5 animate-spin rounded-full border-3 border-solid border-accent-cyan border-r-transparent mr-2" />
      {message}
    </div>
  );
}
