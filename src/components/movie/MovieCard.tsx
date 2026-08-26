"use client";

import React from "react";
import Link from "next/link";
import { MoviePoster } from "./MoviePoster";
import { RatingBadge } from "./RatingBadge";
import { MovieMetadata } from "./MovieMetadata";
import { cn } from "@/lib/utils/cn";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { useI18n } from "@/i18n";

export interface MovieCardData {
  id: number;
  title: string;
  original_title?: string | null;
  overview?: string | null;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string | null;
  runtime?: number | null;
  vote_average?: number | null;
  genres?: Array<{ id?: number; name?: string } | Record<string, unknown>> | string[] | null;
  directors?: string[];
  topCast?: string[];
}

interface MovieCardProps {
  movie: MovieCardData;
  layout?: "grid-sm" | "grid-md" | "list";
  href?: string;
  className?: string;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  layout = "grid-md",
  href,
  className,
}) => {
  const { t } = useI18n();
  const linkHref = href || `/movies/${movie.id}`;

  // List layout
  if (layout === "list") {
    return (
      <Link
        href={linkHref}
        className={cn(
          "group flex gap-4 overflow-hidden rounded-xl glass-card p-4 transition-all hover:border-accent-cyan/50 hover:bg-surface-raised hover:shadow-lg hover:shadow-accent-cyan/5",
          className
        )}
      >
        {/* Poster Thumbnail */}
        <div className="relative h-36 w-24 flex-shrink-0 overflow-hidden rounded-lg shadow-md">
          <MoviePoster
            posterPath={movie.poster_path}
            title={movie.title}
            size="w342"
            className="rounded-lg"
          />
          {movie.vote_average && movie.vote_average > 0 && (
            <div className="absolute right-1.5 top-1.5">
              <RatingBadge rating={movie.vote_average} size="sm" />
            </div>
          )}
        </div>

        {/* Movie Info */}
        <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
          <div>
            <Heading
              variant="subsection"
              as="h3"
              className="mb-1.5 text-text-primary transition-colors group-hover:text-accent-cyan"
            >
              {movie.title}
            </Heading>

            <MovieMetadata releaseDate={movie.release_date} runtime={movie.runtime} />

            {/* Genres */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="mb-2 mt-2 flex flex-wrap gap-1.5">
                {movie.genres.map((genre, idx) => {
                  const genreName =
                    typeof genre === "string" ? genre : (genre as { name?: string })?.name || "";
                  if (!genreName) return null;
                  return (
                    <span
                      key={typeof genre === "string" ? genre : idx}
                      className="rounded-md bg-accent-cyan/10 px-2 py-0.5 text-caption font-medium text-accent-cyan"
                    >
                      {genreName}
                    </span>
                  );
                })}
              </div>
            )}

            {/* Overview */}
            {movie.overview && (
              <Text
                variant="body"
                className="mb-2 line-clamp-2 leading-relaxed text-text-secondary"
              >
                {movie.overview}
              </Text>
            )}
          </div>

          {/* Cast & Crew */}
          <div className="space-y-1.5 text-caption">
            {movie.directors && movie.directors.length > 0 && (
              <div className="flex items-start gap-2">
                <span className="font-medium text-text-muted">{t("movies.director")}:</span>
                <span className="text-text-secondary">{movie.directors.join(", ")}</span>
              </div>
            )}
            {movie.topCast && movie.topCast.length > 0 && (
              <div className="flex items-start gap-2">
                <span className="font-medium text-text-muted">{t("movies.cast")}:</span>
                <span className="line-clamp-1 text-text-secondary">{movie.topCast.join(", ")}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // Grid layout (grid-sm or grid-md)
  return (
    <Link
      href={linkHref}
      className={cn(
        "group relative overflow-hidden rounded-xl glass-card transition-all duration-300 hover:border-accent-cyan/50 hover:shadow-xl hover:shadow-accent-cyan/10",
        className
      )}
    >
      {/* Poster */}
      <div className="relative overflow-hidden bg-surface-raised">
        <MoviePoster posterPath={movie.poster_path} title={movie.title} size="w500" />

        {/* Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Rating Badge */}
        {movie.vote_average && movie.vote_average > 0 && (
          <div className="absolute right-2 top-2">
            <RatingBadge rating={movie.vote_average} size="md" />
          </div>
        )}

        {/* Hover Content - Cast & Crew */}
        <div className="absolute inset-x-0 bottom-0 space-y-2 p-3 transition-transform duration-300 translate-y-full group-hover:translate-y-0">
          {/* Genres */}
          {movie.genres && movie.genres.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {movie.genres.slice(0, 2).map((genre, idx) => {
                const genreName =
                  typeof genre === "string" ? genre : (genre as { name?: string })?.name || "";
                if (!genreName) return null;
                return (
                  <span
                    key={typeof genre === "string" ? genre : idx}
                    className="rounded bg-white/20 px-2 py-0.5 text-micro font-semibold text-white backdrop-blur-sm"
                  >
                    {genreName}
                  </span>
                );
              })}
            </div>
          )}

          {/* Director */}
          {movie.directors && movie.directors.length > 0 && (
            <div className="text-micro leading-tight text-white">
              <span className="font-semibold">{t("movies.director")}: </span>
              <span className="text-gray-200">{movie.directors[0]}</span>
            </div>
          )}

          {/* Top Cast */}
          {movie.topCast && movie.topCast.length > 0 && (
            <div className="text-micro leading-tight text-white">
              <span className="font-semibold">{t("movies.cast")}: </span>
              <span className="line-clamp-2 text-gray-200">{movie.topCast.join(", ")}</span>
            </div>
          )}

          {/* Overview fallback if no cast data yet */}
          {!movie.directors && !movie.topCast && movie.overview && (
            <p className="line-clamp-3 text-micro leading-relaxed text-gray-200">
              {movie.overview}
            </p>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="p-3">
        <Heading
          variant="label"
          as="h3"
          className="mb-1 line-clamp-1 text-text-primary transition-colors group-hover:text-accent-cyan"
        >
          {movie.title}
        </Heading>
        <MovieMetadata releaseDate={movie.release_date} runtime={movie.runtime} size="sm" />
      </div>
    </Link>
  );
};
