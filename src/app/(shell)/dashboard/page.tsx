"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Folder, Film, Mic, Plus, ArrowRight, Sparkles, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  listProjects,
  getPopularMovies,
  tmdbImageUrl,
  type ProjectResponse,
  type MovieResponse,
} from "@/lib/project-client";
import { useVoiceRecordings } from "@/lib/hooks/use-voice-recordings";
import { useAuth } from "@/lib/auth-context";

export default function DashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [popularMovies, setPopularMovies] = useState<MovieResponse[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);
  const { recordings } = useVoiceRecordings();

  // Check if user just completed onboarding (within last 5 minutes)
  useEffect(() => {
    const dismissedKey = "welcome-banner-dismissed";
    const dismissed = localStorage.getItem(dismissedKey);

    if (user?.onboarding_completed_at && !dismissed) {
      const completedAt = new Date(user.onboarding_completed_at).getTime();
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;

      if (now - completedAt < fiveMinutes) {
        setShowWelcomeBanner(true);
      }
    }
  }, [user]);

  const dismissWelcomeBanner = () => {
    localStorage.setItem("welcome-banner-dismissed", "true");
    setShowWelcomeBanner(false);
  };

  useEffect(() => {
    // Load projects
    listProjects(true)
      .then((data) => {
        // Show only the 3 most recent projects
        setProjects(data.slice(0, 3));
      })
      .catch((err) => {
        console.error("Failed to load projects:", err);
      })
      .finally(() => {
        setLoadingProjects(false);
      });

    // Load popular movies for recommendations
    getPopularMovies(6)
      .then((data) => {
        setPopularMovies(data);
      })
      .catch((err) => {
        console.error("Failed to load movies:", err);
      })
      .finally(() => {
        setLoadingMovies(false);
      });
  }, []);

  const stats = [
    {
      title: "Recent Projects",
      value: loadingProjects ? "..." : projects.length > 0 ? projects.length.toString() : "0",
      description: "Active projects",
      icon: <Folder className="w-6 h-6" />,
      gradient: "from-blue-500 to-cyan-500",
      href: "/projects",
    },
    {
      title: "Movie Library",
      value: loadingMovies ? "..." : popularMovies.length > 0 ? `${popularMovies.length}+` : "0",
      description: "Available movies",
      icon: <Film className="w-6 h-6" />,
      gradient: "from-purple-500 to-pink-500",
      href: "/movies",
    },
    {
      title: "My Voices",
      value: recordings.length.toString(),
      description: "Voice profiles",
      icon: <Mic className="w-6 h-6" />,
      gradient: "from-green-500 to-emerald-500",
      href: "/voices",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Banner for New Users */}
      {showWelcomeBanner && (
        <Card
          variant="elevated"
          padding="md"
          className="mb-6 fade-in bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-text-primary">
                  Welcome to Huavoi Studio!
                </h3>
              </div>
              <p className="text-text-secondary mb-4">
                Ready to create your first project? Click &quot;New Project&quot; to get started and
                bring your ideas to life.
              </p>
              <Link href="/project/new">
                <Button variant="primary" size="sm">
                  <Plus className="w-4 h-4" />
                  Create Your First Project
                </Button>
              </Link>
            </div>
            <button
              onClick={dismissWelcomeBanner}
              className="text-text-muted hover:text-text-primary transition-colors p-1"
              aria-label="Dismiss welcome banner"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </Card>
      )}

      {/* Header */}
      <div className="mb-8 fade-in">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Dashboard</h1>
        <p className="text-text-secondary">Welcome back! Here's your overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {stats.map((stat, index) => (
          <Link key={index} href={stat.href}>
            <Card
              variant="elevated"
              padding="md"
              interactive
              className="group fade-in h-full"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardHeader className="mb-3 p-0">
                    <CardDescription className="mb-1">{stat.title}</CardDescription>
                    <CardTitle className="text-4xl font-bold text-text-primary">
                      {stat.value}
                    </CardTitle>
                  </CardHeader>
                  <p className="text-xs text-text-muted">{stat.description}</p>
                </div>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} text-white shadow-md transition-all duration-300 ease-smooth group-hover:scale-110 group-hover:shadow-lg`}
                >
                  {stat.icon}
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <Card variant="elevated" padding="lg" className="mb-8 fade-in">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get started with these common tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/project/new">
              <Button
                variant="secondary"
                fullWidth
                className="justify-start hover:bg-surface-hover transition-all"
              >
                <Plus className="w-5 h-5" />
                New Project
              </Button>
            </Link>
            <Link href="/movies">
              <Button
                variant="secondary"
                fullWidth
                className="justify-start hover:bg-surface-hover transition-all"
              >
                <Film className="w-5 h-5" />
                Browse Movies
              </Button>
            </Link>
            <Link href="/voices">
              <Button
                variant="secondary"
                fullWidth
                className="justify-start hover:bg-surface-hover transition-all"
              >
                <Mic className="w-5 h-5" />
                Record Voice
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Projects */}
      {!loadingProjects && projects.length > 0 && (
        <Card variant="elevated" padding="lg" className="mb-8 fade-in">
          <CardHeader className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Projects</CardTitle>
                <CardDescription>Your latest work in progress</CardDescription>
              </div>
              <Link href="/projects">
                <Button variant="secondary" size="sm">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Link key={project.id} href={`/project/${project.id}/${project.last_step}`}>
                  <Card variant="elevated" padding="none" interactive className="overflow-hidden">
                    <div className="aspect-video bg-surface-raised relative">
                      {(project.thumbnail?.final_url ||
                        project.thumbnail?.custom_image_url ||
                        (project.thumbnail?.base_image_url &&
                          project.thumbnail?.base_image_status === "completed")) ? (
                        <img
                          src={
                            project.thumbnail?.final_url ||
                            project.thumbnail?.custom_image_url ||
                            project.thumbnail?.base_image_url ||
                            ""
                          }
                          alt={project.project_name || project.movie?.title || "Project thumbnail"}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            const backdropOrPoster =
                              project.movie?.backdrop_path ?? project.movie?.poster_path;
                            if (backdropOrPoster) {
                              const fallbackUrl = tmdbImageUrl(backdropOrPoster, "w780");
                              if (fallbackUrl) {
                                img.src = fallbackUrl;
                              }
                            }
                          }}
                        />
                      ) : project.movie?.backdrop_path || project.movie?.poster_path ? (
                        <img
                          src={
                            tmdbImageUrl(
                              project.movie.backdrop_path ?? project.movie.poster_path,
                              "w780"
                            ) || ""
                          }
                          alt={project.movie?.title ?? "Project movie"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Folder className="h-10 w-10 text-text-muted" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="font-semibold text-text-primary truncate">
                            {project.project_name || project.movie?.title || "Untitled project"}
                          </h2>
                          <p className="mt-1 text-xs text-text-muted">
                            Step: {project.last_step} • {project.status}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Popular Movies */}
      {!loadingMovies && popularMovies.length > 0 && (
        <Card variant="elevated" padding="lg" className="fade-in">
          <CardHeader className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent-primary" />
                  Popular Movies
                </CardTitle>
                <CardDescription>Trending movies to start your next project</CardDescription>
              </div>
              <Link href="/movies">
                <Button variant="secondary" size="sm">
                  Explore All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {popularMovies.map((movie) => (
                <Link
                  key={movie.id}
                  href={`/movies/${movie.id}`}
                  className="group overflow-hidden rounded-xl border border-border-default bg-surface-panel transition hover:border-accent-cyan/40 hover:shadow-lg"
                >
                  <div className="relative aspect-[2/3] overflow-hidden bg-surface-raised">
                    {movie.poster_path ? (
                      <img
                        src={tmdbImageUrl(movie.poster_path)}
                        alt={movie.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Film className="h-8 w-8 text-text-muted" />
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <h3 className="line-clamp-1 text-xs font-semibold text-text-primary group-hover:text-accent-cyan">
                      {movie.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State - Only show if no projects AND no movies */}
      {!loadingProjects &&
        !loadingMovies &&
        projects.length === 0 &&
        popularMovies.length === 0 && (
          <Card variant="elevated" padding="lg" className="fade-in">
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-hover border border-border-default">
                  <Folder className="w-8 h-8 text-text-muted" />
                </div>
                <p className="text-lg font-medium text-text-primary mb-2">
                  Welcome to Huavoi Studio
                </p>
                <p className="text-text-secondary mb-6 max-w-md">
                  Start by creating a new project to see your activity here.
                </p>
                <Link href="/project/new">
                  <Button variant="primary">Create Your First Project</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
