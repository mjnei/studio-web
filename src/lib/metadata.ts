import type { Metadata } from "next";

export const SITE_TITLE = "Huavoi Studio";

export function createPageMetadata(title: string, description?: string): Metadata {
  const metadata: Metadata = { title };

  if (description) {
    metadata.description = description;
  }

  return metadata;
}

export function createAdminMetadata(title: string, description?: string): Metadata {
  return createPageMetadata(`${title} - Admin`, description);
}
