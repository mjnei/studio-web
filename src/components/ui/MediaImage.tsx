/**
 * MediaImage - A robust image component for displaying backend storage media
 *
 * Features:
 * - Automatic URL handling for S3 and local storage
 * - Fallback image support
 * - Error handling with retry logic
 * - Loading states
 */

import * as React from "react";
import { ImageUrlUtils } from "@/lib/image-utils";

interface MediaImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string | null | undefined;
  fallbackSrc?: string | null | undefined;
  alt: string;
  onError?: () => void;
  showLoadingState?: boolean;
}

export function MediaImage({
  src,
  fallbackSrc,
  alt,
  onError,
  showLoadingState = false,
  className,
  ...props
}: MediaImageProps) {
  const [imageError, setImageError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(showLoadingState);

  // Calculate URL immediately from props (no effect needed)
  const displayUrl = React.useMemo(
    () => ImageUrlUtils.getThumbnailUrl(src, fallbackSrc),
    [src, fallbackSrc]
  );

  const [currentSrc, setCurrentSrc] = React.useState<string | undefined>(displayUrl);
  const [attemptedFallback, setAttemptedFallback] = React.useState(false);

  // Reset states when source URL changes
  /* eslint-disable react-hooks/set-state-in-effect */
  React.useEffect(() => {
    setCurrentSrc(displayUrl);
    setImageError(false);
    setAttemptedFallback(false);
    setIsLoading(showLoadingState);
  }, [displayUrl, showLoadingState]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleError = () => {
    console.warn(`Failed to load image: ${currentSrc}`);
    setIsLoading(false);

    // Try fallback if available and not already attempted
    if (fallbackSrc && !attemptedFallback) {
      const fallbackUrl = ImageUrlUtils.getImageUrl(fallbackSrc);
      if (fallbackUrl && fallbackUrl !== currentSrc) {
        console.log(`Trying fallback image: ${fallbackUrl}`);
        setCurrentSrc(fallbackUrl);
        setAttemptedFallback(true);
        return;
      }
    }

    setImageError(true);
    onError?.();
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // Show placeholder if no valid URL
  if (!currentSrc || imageError) {
    return (
      <div
        className={`flex items-center justify-center bg-surface-raised text-text-muted ${className}`}
        {...props}
      >
        <svg
          className="h-12 w-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
          />
        </svg>
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div
          className={`flex items-center justify-center bg-surface-raised ${className}`}
          {...props}
        >
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-cyan border-t-transparent" />
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={currentSrc}
        alt={alt}
        onError={handleError}
        onLoad={handleLoad}
        className={className}
        style={isLoading ? { display: "none" } : undefined}
        {...props}
      />
    </>
  );
}
