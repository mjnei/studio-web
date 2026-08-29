"use client";

import { useState, useEffect } from "react";
import { Search, Film, Check, Star, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { MoviePoster } from "@/components/movie/MoviePoster";
import { useI18n } from "@/i18n";
import {
  getPopularMovies,
  searchMovies,
  type MovieResponse,
} from "@/lib/project-client";

export interface MovieSelectionItem {
  id: string;
  title: string;
  year: number;
  posterPath: string | null;
  rating: number;
  genre: string[];
  duration: string;
}

interface MovieSelectionProps {
  selectedMovie?: string;
  onSelect: (movie: MovieSelectionItem) => void;
}

const GENRE_OPTIONS = [
  "All",
  "Action",
  "Sci-Fi",
  "Drama",
  "Horror",
  "Animation",
  "Comedy",
  "Thriller",
  "Adventure",
] as const;

function formatRuntime(minutes: number | null | undefined, unknownLabel: string): string {
  if (!minutes) return unknownLabel;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function mapMovie(movie: MovieResponse, unknownLabel: string, uncategorizedLabel: string): MovieSelectionItem {
  const genres = movie.genres
    ?.map((genre) => ("name" in genre && typeof genre.name === "string" ? genre.name : undefined))
    .filter(Boolean) as string[] | undefined;

  return {
    id: String(movie.id),
    title: movie.title,
    year: movie.release_date ? new Date(movie.release_date).getUTCFullYear() : 0,
    posterPath: movie.poster_path ?? null,
    rating: movie.vote_average ?? 0,
    genre: genres?.length ? genres : [uncategorizedLabel],
    duration: formatRuntime(movie.runtime, unknownLabel),
  };
}

export function MovieSelection({ selectedMovie, onSelect }: MovieSelectionProps) {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("All");
  const [movies, setMovies] = useState<MovieSelectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const unknownLabel = t("project.common.unknown");
  const uncategorizedLabel = t("project.movieSelection.uncategorized");

  useEffect(() => {
    const controller = new AbortController();
    const fetchMovies = async () => {
      setLoading(true);
      setError(null);
      try {
        const query = searchQuery.trim();
        const results = query ? (await searchMovies(query, 24)).movies : await getPopularMovies(24);
        if (!controller.signal.aborted) {
          setMovies(results.map((movie) => mapMovie(movie, unknownLabel, uncategorizedLabel)));
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : t("project.movieSelection.unableToLoad"));
          setMovies([]);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    const timeout = window.setTimeout(fetchMovies, searchQuery.trim() ? 250 : 0);
    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [searchQuery, t, unknownLabel, uncategorizedLabel]);

  // Filter movies by genre if a specific genre chip is active
  const filteredMovies =
    selectedGenre === "All"
      ? movies
      : movies.filter((m) =>
          m.genre.some((g) => g.toLowerCase().includes(selectedGenre.toLowerCase()))
        );

  return (
    <div className="space-y-6 fade-in">
      {/* Search & Genre Filter Bar */}
      <div className="space-y-3">
        <div className="relative">
          <Input
            type="text"
            placeholder={t("project.movieSelection.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
        </div>

        {/* Horizontal Scrollable Genre Chips */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
          {GENRE_OPTIONS.map((genre) => {
            const isSelected = selectedGenre === genre;
            return (
              <button
                key={genre}
                type="button"
                onClick={() => setSelectedGenre(genre)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-caption font-medium transition-all duration-200 ${
                  isSelected
                    ? "bg-accent-primary text-white shadow-sm shadow-accent-primary/30 scale-105"
                    : "bg-surface-raised border border-border-default text-text-secondary hover:text-text-primary hover:border-border-strong"
                }`}
              >
                {genre}
              </button>
            );
          })}
        </div>
      </div>

      {/* Movie Grid - Pattern 1 (2 cols mobile up to 6 cols xl) */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {[...Array(12)].map((_, i) => (
            <Card key={i} variant="elevated" padding="none" className="overflow-hidden">
              <div className="aspect-[2/3]">
                <Skeleton height="100%" />
              </div>
              <div className="p-2.5 space-y-2">
                <Skeleton height={14} width="80%" />
                <Skeleton height={10} width="60%" />
              </div>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card variant="elevated" padding="lg">
          <EmptyState
            icon={<Film aria-hidden />}
            title={t("project.movieSelection.unableToLoad")}
            description={error}
          />
        </Card>
      ) : filteredMovies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filteredMovies.map((movie) => {
            const isSelected = selectedMovie === movie.id;
            return (
              <Card
                key={movie.id}
                variant="elevated"
                padding="none"
                interactive
                className={`group cursor-pointer overflow-hidden transition-all duration-200 ${
                  isSelected
                    ? "ring-2 ring-accent-primary shadow-glow scale-[1.02]"
                    : "hover:border-accent-primary/40 hover:scale-[1.01]"
                }`}
                onClick={() => onSelect(movie)}
              >
                {/* 2:3 Poster Frame */}
                <div className="relative aspect-[2/3] overflow-hidden bg-surface-hover">
                  <MoviePoster posterPath={movie.posterPath} title={movie.title} size="w500" />
                  {/* Subtle hover gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                  {/* Selected Indicator Badge */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-accent-primary text-white shadow-lg animate-in zoom-in-75 duration-200">
                      <Check className="h-4 w-4 stroke-[3]" />
                    </div>
                  )}

                  {/* TMDB Rating Pill */}
                  {movie.rating > 0 && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/75 backdrop-blur-md px-1.5 py-0.5 rounded-md text-micro font-semibold text-white">
                      <Star className="h-2.5 w-2.5 text-yellow-400 fill-yellow-400" />
                      <span>{movie.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                {/* Movie Information */}
                <CardContent className="p-2.5 space-y-1.5">
                  <Heading
                    variant="label"
                    as="h3"
                    className="text-text-primary text-caption font-semibold line-clamp-1 group-hover:text-accent-primary transition-colors"
                  >
                    {movie.title}
                  </Heading>
                  <div className="flex items-center gap-1.5 text-micro text-text-muted">
                    {movie.year > 0 && <span>{movie.year}</span>}
                    {movie.year > 0 && movie.duration && <span>•</span>}
                    <span>{movie.duration}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {movie.genre.slice(0, 1).map((genre) => (
                      <Badge
                        key={genre}
                        variant="default"
                        size="sm"
                        className="text-micro px-1.5 py-0"
                      >
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card variant="elevated" padding="lg">
          <EmptyState
            icon={<Film aria-hidden />}
            title={t("project.movieSelection.noMoviesFound", {
              query: searchQuery || selectedGenre,
            })}
            action={
              selectedGenre !== "All" ? (
                <Button variant="secondary" size="sm" onClick={() => setSelectedGenre("All")}>
                  {t("common.reset")}
                </Button>
              ) : undefined
            }
          />
        </Card>
      )}

      {/* Selected Movie Summary Confirmation */}
      {selectedMovie && (
        <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-accent-primary/10 border border-accent-primary/30 text-text-primary">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-primary text-white shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-caption font-medium text-text-secondary">
                {t("project.movieSelection.movieSelected")}
              </p>
              <p className="text-body font-semibold text-text-primary">
                {movies.find((m) => m.id === selectedMovie)?.title}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
