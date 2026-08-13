"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Search, Film, Check, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getPopularMovies,
  searchMovies,
  tmdbImageUrl,
  type MovieResponse,
} from "@/lib/project-client";

interface Movie {
  id: string;
  title: string;
  year: number;
  poster: string;
  rating: number;
  genre: string[];
  duration: string;
}

interface MovieSelectionProps {
  selectedMovie?: string;
  onSelect: (movie: Movie) => void;
}

function formatRuntime(minutes?: number | null): string {
  if (!minutes) return "Unknown";
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function mapMovie(movie: MovieResponse): Movie {
  const genres = movie.genres
    ?.map((genre) => ("name" in genre && typeof genre.name === "string" ? genre.name : undefined))
    .filter(Boolean) as string[] | undefined;

  return {
    id: String(movie.id),
    title: movie.title,
    year: movie.release_date ? new Date(movie.release_date).getUTCFullYear() : 0,
    poster: tmdbImageUrl(movie.poster_path) ?? "",
    rating: movie.vote_average ?? 0,
    genre: genres?.length ? genres : ["Uncategorized"],
    duration: formatRuntime(movie.runtime),
  };
}

export function MovieSelection({ selectedMovie, onSelect }: MovieSelectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchMovies = async () => {
      setLoading(true);
      setError(null);
      try {
        const query = searchQuery.trim();
        const results = query ? (await searchMovies(query, 20)).movies : await getPopularMovies(20);
        if (!controller.signal.aborted) setMovies(results.map(mapMovie));
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : "Unable to load movies");
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
  }, [searchQuery]);

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-secondary to-accent-tertiary shadow-lg">
            <Film className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">Select a Movie</h2>
        <p className="text-text-secondary">
          Choose a movie to create a voice-over project. You can search by title or genre.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto">
        <Input
          type="text"
          placeholder="Search movies by title or genre..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search className="w-5 h-5" />}
        />
      </div>

      {/* Movie Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} variant="elevated" padding="none">
              <Skeleton height={350} />
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card variant="elevated" padding="lg">
          <div className="text-center py-12">
            <Film className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <p className="text-text-secondary">{error}</p>
          </div>
        </Card>
      ) : movies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {movies.map((movie) => (
            <Card
              key={movie.id}
              variant="elevated"
              padding="none"
              interactive
              className={`
                group cursor-pointer overflow-hidden transition-all duration-300
                ${
                  selectedMovie === movie.id
                    ? "ring-2 ring-accent-primary shadow-lg shadow-accent-primary/20"
                    : ""
                }
              `}
              onClick={() => onSelect(movie)}
            >
              {/* Poster */}
              <div className="relative aspect-[2/3] overflow-hidden bg-surface-hover">
                <Image
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Selected Badge */}
                {selectedMovie === movie.id && (
                  <div className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-accent-primary shadow-lg">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                )}

                {/* Rating */}
                <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-xs font-semibold text-white">{movie.rating}</span>
                </div>
              </div>

              {/* Info */}
              <CardContent className="p-3 space-y-2">
                <h3 className="font-semibold text-text-primary text-sm line-clamp-2 group-hover:text-accent-primary transition-colors">
                  {movie.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <span>{movie.year}</span>
                  <span>•</span>
                  <span>{movie.duration}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {movie.genre.slice(0, 2).map((genre) => (
                    <Badge key={genre} variant="default" size="sm">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card variant="elevated" padding="lg">
          <div className="text-center py-12">
            <Film className="w-12 h-12 text-text-muted mx-auto mb-4" />
            <p className="text-text-secondary">No movies found matching "{searchQuery}"</p>
          </div>
        </Card>
      )}

      {/* Selected Movie Info */}
      {selectedMovie && (
        <Card variant="elevated" padding="md" className="border-accent-primary/30">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-primary/20">
              <Check className="w-5 h-5 text-accent-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">Movie Selected</p>
              <p className="text-xs text-text-secondary">
                {movies.find((m) => m.id === selectedMovie)?.title}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
