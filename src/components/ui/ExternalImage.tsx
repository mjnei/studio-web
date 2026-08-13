import Image from "next/image";
import { CSSProperties } from "react";

interface ExternalImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  priority?: boolean;
  style?: CSSProperties;
  onError?: () => void;
}

/**
 * Wrapper for external images (e.g., TMDB, CDN URLs, custom thumbnails)
 * Uses unoptimized to skip Next.js optimization for external sources
 * Still gets lazy loading and responsive sizing benefits
 *
 * @example
 * // TMDB poster with responsive sizing
 * <ExternalImage
 *   src={tmdbImageUrl(movie.poster_path, "w500")}
 *   alt={movie.title}
 *   fill
 *   sizes="(max-width: 768px) 100vw, 50vw"
 * />
 *
 * @example
 * // Fixed-size profile image
 * <ExternalImage
 *   src={tmdbImageUrl(actor.profile_path, "w185")}
 *   alt={actor.name}
 *   width={48}
 *   height={48}
 * />
 */
export function ExternalImage({
  src,
  alt,
  fill,
  width,
  height,
  sizes,
  className,
  priority,
  style,
  onError,
}: ExternalImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={width}
      height={height}
      sizes={sizes}
      className={className}
      priority={priority}
      style={style}
      unoptimized // External images skip optimization
      loading={priority ? undefined : "lazy"}
      onError={onError}
    />
  );
}
