"use client";

import Link from "next/link";
import { Film, Mic, ShieldCheck, Database } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="h-8 w-8 text-accent-primary" />
          <h1 className="text-3xl font-bold text-text-primary">Admin Dashboard</h1>
        </div>
        <p className="text-text-secondary">
          Manage movies and voices catalog for the Huavoi platform
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Movies Management Card */}
        <Link
          href="/admin/movies"
          className="group relative overflow-hidden rounded-2xl border border-border-default bg-surface-panel p-6 transition-all hover:border-accent-primary/50 hover:shadow-lg"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 to-accent-secondary/5 opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="relative">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20">
              <Film className="h-6 w-6 text-accent-primary" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-text-primary">Movies</h2>
            <p className="text-sm text-text-secondary">
              Create, update, delete, and bulk import movies to the catalog
            </p>
          </div>
        </Link>

        {/* Voices Management Card */}
        <Link
          href="/admin/voices"
          className="group relative overflow-hidden rounded-2xl border border-border-default bg-surface-panel p-6 transition-all hover:border-accent-primary/50 hover:shadow-lg"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 to-accent-secondary/5 opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="relative">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20">
              <Mic className="h-6 w-6 text-accent-primary" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-text-primary">Voices</h2>
            <p className="text-sm text-text-secondary">Manage voices and recordings</p>
          </div>
        </Link>

        {/* TMDB Import Card */}
        <Link
          href="/admin/tmdb"
          className="group relative overflow-hidden rounded-2xl border border-border-default bg-surface-panel p-6 transition-all hover:border-accent-primary/50 hover:shadow-lg"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 to-accent-secondary/5 opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="relative">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent-primary/20 to-accent-secondary/20">
              <Database className="h-6 w-6 text-accent-primary" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-text-primary">TMDB Import</h2>
            <p className="text-sm text-text-secondary">
              Search and import movies from The Movie Database with full metadata
            </p>
          </div>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="mt-8 rounded-2xl border border-border-default bg-surface-panel p-6">
        <h3 className="mb-4 text-lg font-semibold text-text-primary">Admin Features</h3>
        <ul className="space-y-2 text-sm text-text-secondary">
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-primary" />
            Manage movies and TMDB imports with full cast, crew, and translations
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-primary" />
            Manage voices and recordings
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-primary" />
            Enable/disable voices
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-primary" />
            All operations logged for audit trail
          </li>
        </ul>
      </div>
    </div>
  );
}
