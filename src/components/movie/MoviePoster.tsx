import React from "react";
import { Film } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { ExternalImage } from "@/components/ui/ExternalImage";

interface MoviePosterProps {
  posterPath?: string | null;
  title: string;
  size?: "w342" | "w500" | "w780";
  aspectRatio?: "poster" | "backdrop";
  className?: string;
  priority?: boolean;
}

export const MoviePoster: React.FC<MoviePosterProps> = ({
  posterPath,
  title,
  size = "w500",
  aspectRatio = "poster",
  className,
  priority = false,
}) => {
  const getImageUrl = (path: string | null | undefined, imageSize: string = "w500") => {
    if (!path) return null;
    return `https://image.tmdb.org/t/p/${imageSize}${path}`;
  };

  const imageUrl = getImageUrl(posterPath, size);

  const aspectClasses = {
    poster: "aspect-[2/3]",
    backdrop: "aspect-video",
  };

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-surface-raised",
        aspectClasses[aspectRatio],
        className
      )}
    >
      {imageUrl ? (
        <ExternalImage
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
          priority={priority}
        />
      ) : (
        <div className="flex h-full items-center justify-center">
          <Film className="h-16 w-16 text-text-muted opacity-50" />
        </div>
      )}
    </div>
  );
};
