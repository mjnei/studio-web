import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface RatingBadgeProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  showStar?: boolean;
  className?: string;
}

export const RatingBadge: React.FC<RatingBadgeProps> = ({
  rating,
  size = "md",
  showStar = true,
  className,
}) => {
  if (!rating || rating <= 0) {
    return null;
  }

  const sizeClasses = {
    sm: {
      container: "px-1.5 py-0.5",
      icon: "h-3 w-3",
      text: "text-caption",
    },
    md: {
      container: "px-2 py-1",
      icon: "h-3.5 w-3.5",
      text: "text-caption",
    },
    lg: {
      container: "px-2.5 py-1.5",
      icon: "h-4 w-4",
      text: "text-body",
    },
  };

  const sizeConfig = sizeClasses[size];

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-full bg-black/70 backdrop-blur-sm",
        sizeConfig.container,
        className
      )}
    >
      {showStar && <Star className={cn("fill-yellow-400 text-yellow-400", sizeConfig.icon)} />}
      <span className={cn("font-semibold text-white", sizeConfig.text)}>{rating.toFixed(1)}</span>
    </div>
  );
};
