"use client";

import { cn } from "@/lib/utils/cn";
import { getUserInitials } from "@/lib/utils/avatar-gradient";
import { UserAvatarFallback } from "@/components/ui/UserAvatarFallback";

export interface UserAvatarProps {
  seed: string | number;
  name: string;
  email?: string;
  pictureUrl?: string | null;
  alt?: string;
  className?: string;
  imageClassName?: string;
  width: number;
  height: number;
  initialsLength?: 1 | 2;
  ringWidth?: 0 | 2 | 4;
}

export function UserAvatar({
  seed,
  name,
  email,
  pictureUrl,
  alt,
  className,
  imageClassName,
  width,
  height,
  initialsLength = 2,
  ringWidth = 2,
}: UserAvatarProps) {
  const displayAlt = alt ?? name;
  const initials = getUserInitials(name, email, initialsLength);

  if (pictureUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- presigned S3 URLs use dynamic hosts
      <img
        src={pictureUrl}
        alt={displayAlt}
        className={cn("shrink-0 object-cover", imageClassName ?? className)}
        width={width}
        height={height}
      />
    );
  }

  return (
    <UserAvatarFallback
      seed={String(seed)}
      initials={initials}
      label={displayAlt}
      ringWidth={ringWidth}
      className={className}
    />
  );
}
