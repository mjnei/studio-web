import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const sizeClasses = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-8 w-8",
} as const;

type IconSize = keyof typeof sizeClasses;

const SIZE_CLASS_PATTERN = /\b(h|w)-[\d.]+/;

interface IconProps extends Omit<React.ComponentPropsWithoutRef<LucideIcon>, "size"> {
  icon: LucideIcon;
  /** Size token (`xs`–`xl`). Omit when passing explicit `h-N w-N` in `className` (token is skipped). */
  size?: IconSize;
  className?: string;
}

export function Icon({
  icon: IconComponent,
  size = "sm",
  className,
  "aria-hidden": ariaHidden = true,
  ...props
}: IconProps) {
  const hasExplicitSize = SIZE_CLASS_PATTERN.test(className ?? "");

  return (
    <IconComponent
      className={cn(!hasExplicitSize && sizeClasses[size], className)}
      aria-hidden={ariaHidden}
      {...props}
    />
  );
}
