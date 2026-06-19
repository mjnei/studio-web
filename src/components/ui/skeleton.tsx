import { HTMLAttributes, forwardRef } from "react";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular" | "rounded";
  width?: string | number;
  height?: string | number;
  className?: string;
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ variant = "text", width, height, className = "", ...props }, ref) => {
    const baseStyles =
      "shimmer bg-gradient-to-r from-surface-hover via-surface-elevated to-surface-hover bg-surface-hover animate-pulse";

    const variants = {
      text: "h-4 rounded",
      circular: "rounded-full",
      rectangular: "rounded",
      rounded: "rounded-lg",
    };

    const customStyles = {
      width: width ? (typeof width === "number" ? `${width}px` : width) : "100%",
      height: height ? (typeof height === "number" ? `${height}px` : height) : undefined,
    };

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        style={customStyles}
        {...props}
      />
    );
  }
);

Skeleton.displayName = "Skeleton";
