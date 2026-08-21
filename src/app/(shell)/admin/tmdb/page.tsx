"use client";

import { Heading } from "@/components/ui/heading";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader, ArrowRight, Database } from "lucide-react";

/**
 * Legacy TMDB Import Page - Redirects to Unified Movies Page
 *
 * This page has been merged with the admin movies page.
 * Redirecting to /admin/movies with the import tab active.
 */
export default function AdminTMDBPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the unified movies page after a short delay
    const timer = setTimeout(() => {
      router.push("/admin/movies");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <Database className="h-16 w-16 text-accent-primary" />
              <Loader className="absolute -right-2 -top-2 h-6 w-6 animate-spin text-accent-primary" />
            </div>
          </div>

          <Heading variant="page" className="mb-3 text-text-primary">
            Page Moved
          </Heading>

          <p className="mb-2 text-text-secondary">TMDB import has been merged with TMDB Movies</p>

          <p className="mb-6 text-sm text-text-muted">
            Redirecting you to the unified movies page...
          </p>

          <div className="flex items-center justify-center gap-2 rounded-lg border border-border-default bg-surface-panel px-4 py-2 text-sm text-text-muted">
            <span>/admin/tmdb</span>
            <ArrowRight className="h-4 w-4" />
            <span className="font-medium text-accent-primary">/admin/movies</span>
          </div>

          <div className="mt-8">
            <button
              onClick={() => router.push("/admin/movies")}
              className="rounded-lg bg-accent-primary px-6 py-2 text-sm font-medium text-white hover:bg-accent-primary/90 transition-all"
            >
              Go to Movies Page Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
