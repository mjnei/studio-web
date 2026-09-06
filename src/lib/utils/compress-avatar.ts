/** Max edge length stored for community voice avatars (covers 64px UI at 4× DPR). */
export const AVATAR_MAX_SIZE_PX = 256;

/** JPEG quality for compressed avatars (0–1). */
export const AVATAR_JPEG_QUALITY = 0.85;

const ACCEPTED_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

/**
 * Center-crop to square and resize to avatar dimensions, then encode as JPEG.
 * Keeps S3 objects small while remaining sharp on retina displays.
 */
export async function compressAvatarImage(
  file: File,
  maxSizePx: number = AVATAR_MAX_SIZE_PX
): Promise<File> {
  const type = (file.type || "").split(";")[0].trim().toLowerCase();
  if (!ACCEPTED_TYPES.has(type)) {
    throw new Error("Invalid file type. Must be JPEG, PNG, or WebP.");
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadHtmlImage(objectUrl);
    const width = img.naturalWidth;
    const height = img.naturalHeight;
    if (width <= 0 || height <= 0) {
      throw new Error("Invalid image dimensions");
    }

    const side = Math.min(width, height);
    const sx = Math.floor((width - side) / 2);
    const sy = Math.floor((height - side) / 2);
    const outputSize = Math.min(side, maxSizePx);

    const canvas = document.createElement("canvas");
    canvas.width = outputSize;
    canvas.height = outputSize;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas is not available");
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, sx, sy, side, side, 0, 0, outputSize, outputSize);

    const blob = await canvasToJpegBlob(canvas, AVATAR_JPEG_QUALITY);
    const baseName = file.name.replace(/\.[^.]+$/, "") || "avatar";
    return new File([blob], `${baseName}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to decode image"));
    img.src = src;
  });
}

function canvasToJpegBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to compress image"));
          return;
        }
        resolve(blob);
      },
      "image/jpeg",
      quality
    );
  });
}
