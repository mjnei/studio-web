/**
 * Example usage of MediaImage component and ImageUrlUtils
 *
 * This file demonstrates the different ways to display images from backend storage.
 * Remove or move to a different location if not needed.
 */

import Image from "next/image";
import { MediaImage } from "@/components/ui/MediaImage";
import { ImageUrlUtils } from "@/lib/image-utils";

export function MediaImageExample() {
  // Example data structures (would come from API in real usage)
  const project = {
    finalThumbnailUrl: "/uploads/thumbnails/final/project_123.jpg",
    thumbnailUrl: "/uploads/thumbnails/project_123.jpg",
  };

  const video = {
    thumbnail_url: "/uploads/thumbnails/final/video_456.jpg",
    video_url: "https://example.com/video.mp4",
  };

  return (
    <div className="space-y-8 p-8">
      <section>
        <h2 className="mb-4 text-xl font-semibold">1. MediaImage Component (Recommended)</h2>
        <p className="mb-4 text-sm text-text-muted">
          Best for production use - includes error handling, loading states, and fallbacks
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Basic usage */}
          <div>
            <h3 className="mb-2 text-sm font-medium">Basic Usage</h3>
            <MediaImage
              src={project.finalThumbnailUrl}
              alt="Project thumbnail"
              className="aspect-video w-full rounded-lg object-cover"
            />
          </div>

          {/* With fallback */}
          <div>
            <h3 className="mb-2 text-sm font-medium">With Fallback</h3>
            <MediaImage
              src={video.thumbnail_url}
              fallbackSrc={project.finalThumbnailUrl}
              alt="Video thumbnail"
              className="aspect-video w-full rounded-lg object-cover"
            />
          </div>

          {/* With loading state */}
          <div>
            <h3 className="mb-2 text-sm font-medium">With Loading State</h3>
            <MediaImage
              src={project.thumbnailUrl}
              alt="Project preview"
              showLoadingState
              className="aspect-video w-full rounded-lg object-cover"
            />
          </div>

          {/* With custom error handler */}
          <div>
            <h3 className="mb-2 text-sm font-medium">Custom Error Handler</h3>
            <MediaImage
              src={project.finalThumbnailUrl}
              alt="Custom error example"
              onError={() => console.log("Image failed to load")}
              className="aspect-video w-full rounded-lg object-cover"
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">2. ImageUrlUtils (Direct Usage)</h2>
        <p className="mb-4 text-sm text-text-muted">
          For cases where you need the URL directly (e.g., video poster, background images)
        </p>

        <div className="space-y-4">
          {/* Simple URL conversion */}
          <div>
            <h3 className="mb-2 text-sm font-medium">Simple URL Conversion</h3>
            <code className="block rounded bg-surface-raised p-2 text-xs">
              {ImageUrlUtils.getImageUrl(project.finalThumbnailUrl)}
            </code>
          </div>

          {/* Thumbnail with fallback */}
          <div>
            <h3 className="mb-2 text-sm font-medium">Thumbnail with Fallback</h3>
            <code className="block rounded bg-surface-raised p-2 text-xs">
              {ImageUrlUtils.getThumbnailUrl(video.thumbnail_url, project.finalThumbnailUrl)}
            </code>
          </div>

          {/* URL validation */}
          <div>
            <h3 className="mb-2 text-sm font-medium">URL Validation</h3>
            <code className="block rounded bg-surface-raised p-2 text-xs">
              isValid: {ImageUrlUtils.isValidImageUrl(project.finalThumbnailUrl).toString()}
            </code>
          </div>

          {/* Video with poster */}
          <div>
            <h3 className="mb-2 text-sm font-medium">Video with Poster (Using getThumbnailUrl)</h3>
            <video
              src={video.video_url}
              poster={ImageUrlUtils.getThumbnailUrl(video.thumbnail_url, project.finalThumbnailUrl)}
              controls
              className="aspect-video w-full rounded-lg"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">
          3. Direct Usage (When Backend Returns Full URL)
        </h2>
        <p className="mb-4 text-sm text-text-muted">
          If backend already returns properly formatted URLs, use them directly
        </p>

        <div>
          <Image
            src={project.finalThumbnailUrl}
            alt="Direct usage"
            className="aspect-video w-full rounded-lg object-cover"
            width={500}
            height={280}
          />
        </div>
      </section>

      <section className="rounded-lg border border-accent-cyan/30 bg-accent-cyan/5 p-4">
        <h2 className="mb-2 text-lg font-semibold text-accent-cyan">Best Practices</h2>
        <ul className="space-y-2 text-sm text-text-muted">
          <li>✅ Use MediaImage component for robustness (error handling, loading states)</li>
          <li>✅ Use ImageUrlUtils.getThumbnailUrl() for video posters with fallbacks</li>
          <li>✅ Use ImageUrlUtils.getImageUrl() when you need URL directly</li>
          <li>✅ Provide fallback images for better UX</li>
          <li>❌ Don&apos;t manually construct paths like /uploads/imagePath</li>
          <li>❌ Don&apos;t assume all images are from local storage (could be S3)</li>
        </ul>
      </section>
    </div>
  );
}
