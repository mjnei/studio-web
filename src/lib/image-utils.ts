/**
 * Image URL utility for handling media from backend storage (S3 or local)
 *
 * This utility ensures consistent image URL handling across the application.
 * Backend returns fully qualified URLs (presigned S3 URLs or /uploads/* paths),
 * so frontend should use them as-is.
 *
 * Use cases:
 * - Display thumbnails from projects
 * - Display video posters
 * - Display voice recording thumbnails
 * - Any media served from backend storage
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8020";

export class ImageUrlUtils {
  /**
   * Get a display-ready URL for an image from backend storage.
   *
   * Backend returns either:
   * 1. Presigned S3 URLs (when using S3) - fully qualified, ready to use
   * 2. Relative paths like "/uploads/..." (when using local storage) - need base URL
   *
   * @param imageUrl - URL returned from backend API (can be null/undefined)
   * @param fallbackUrl - Optional fallback URL if imageUrl is invalid
   * @returns Ready-to-use image URL or undefined if not available
   */
  static getImageUrl(
    imageUrl: string | null | undefined,
    fallbackUrl?: string
  ): string | undefined {
    // Return undefined if no URL provided
    if (!imageUrl) {
      return fallbackUrl;
    }

    // If it's already a full URL (http:// or https://), use as-is (S3 presigned URLs)
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }

    // If it starts with /uploads/, prepend API base URL (local storage)
    if (imageUrl.startsWith("/uploads/")) {
      return `${API_BASE_URL}${imageUrl}`;
    }

    // If it's a relative path without leading slash, assume it's an uploads path
    if (!imageUrl.startsWith("/")) {
      return `${API_BASE_URL}/uploads/${imageUrl}`;
    }

    // For any other path format, prepend API base URL
    return `${API_BASE_URL}${imageUrl}`;
  }

  /**
   * Get multiple image URLs in a batch.
   *
   * @param imageUrls - Array of URLs from backend
   * @returns Array of display-ready URLs (null entries are filtered out)
   */
  static getImageUrls(imageUrls: (string | null | undefined)[]): string[] {
    return imageUrls
      .map((url) => this.getImageUrl(url))
      .filter((url): url is string => url !== undefined);
  }

  /**
   * Get a thumbnail URL with optional fallback to project thumbnail.
   *
   * Common pattern: video thumbnails fall back to project thumbnail
   *
   * @param thumbnailUrl - Primary thumbnail URL
   * @param fallbackThumbnailUrl - Fallback thumbnail URL
   * @returns First available thumbnail URL or undefined
   */
  static getThumbnailUrl(
    thumbnailUrl: string | null | undefined,
    fallbackThumbnailUrl?: string | null | undefined
  ): string | undefined {
    return this.getImageUrl(thumbnailUrl, this.getImageUrl(fallbackThumbnailUrl));
  }

  /**
   * Check if a URL is valid and accessible.
   * Note: This doesn't perform network requests, just URL validation.
   *
   * @param imageUrl - URL to validate
   * @returns true if URL appears valid
   */
  static isValidImageUrl(imageUrl: string | null | undefined): boolean {
    if (!imageUrl) return false;

    try {
      // Try to parse as URL
      if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
        new URL(imageUrl);
        return true;
      }

      // Valid if it's a path (starts with / or is relative)
      return imageUrl.startsWith("/") || !imageUrl.includes("://");
    } catch {
      return false;
    }
  }

  /**
   * Get srcSet for responsive images (if backend provides multiple sizes).
   * Future enhancement placeholder.
   *
   * @param baseUrl - Base image URL
   * @returns srcSet string for responsive images
   */
  static getSrcSet(baseUrl: string | null | undefined): string | undefined {
    // Placeholder for future enhancement
    // Backend could provide multiple sizes: thumbnail_small, thumbnail_medium, thumbnail_large
    const url = this.getImageUrl(baseUrl);
    return url;
  }
}

/**
 * React hook for using image URLs with automatic error handling.
 * Can be extended in the future for retry logic, loading states, etc.
 */
export function useImageUrl(
  imageUrl: string | null | undefined,
  fallbackUrl?: string
): string | undefined {
  return ImageUrlUtils.getImageUrl(imageUrl, fallbackUrl);
}

/**
 * Convenience export for common usage
 */
export const { getImageUrl, getThumbnailUrl, isValidImageUrl } = ImageUrlUtils;
