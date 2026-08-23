import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
} as const;

type SpinnerSize = keyof typeof sizeClasses;

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
  "aria-hidden"?: boolean;
}

export function Spinner({ size, className, "aria-hidden": ariaHidden = true }: SpinnerProps) {
  return (
    <Loader2
      className={cn(
        "animate-spin motion-reduce:animate-none motion-reduce:opacity-80",
        size && sizeClasses[size],
        className
      )}
      aria-hidden={ariaHidden}
    />
  );
}
