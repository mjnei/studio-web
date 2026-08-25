"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Folder, Film, Mic, Plus, ArrowRight, Sparkles, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Heading } from "@/components/ui/heading";
import { ExternalImage } from "@/components/ui/ExternalImage";
import { ProjectCard } from "@/components/project/ProjectCard";
import {
  listProjects,
  getPopularMovies,
  tmdbImageUrl,
  type ProjectResponse,
  type MovieResponse,
} from "@/lib/project-client";
import { useVoices } from "@/lib/hooks/use-voices";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/i18n";

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [popularMovies, setPopularMovies] = useState<MovieResponse[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);
  const { voices } = useVoices();

  // Check if user just completed onboarding (within last 5 minutes)
  useEffect(() => {
    const checkWelcomeBanner = async () => {
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
    };

    checkWelcomeBanner();
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
      title: t("dashboard.stats.recentProjects.title"),
      value: loadingProjects ? "..." : projects.length > 0 ? projects.length.toString() : "0",
      description: t("dashboard.stats.recentProjects.description"),
      icon: <Folder className="h-6 w-6" aria-hidden />,
      gradient: "from-blue-500 to-cyan-500",
      href: "/projects",
    },
    {
      title: t("dashboard.stats.movieLibrary.title"),
      value: loadingMovies ? "..." : popularMovies.length > 0 ? `${popularMovies.length}+` : "0",
      description: t("dashboard.stats.movieLibrary.description"),
      icon: <Film className="h-6 w-6" aria-hidden />,
      gradient: "from-purple-500 to-pink-500",
      href: "/movies",
    },
    {
      title: t("dashboard.stats.myVoices.title"),
      value: voices.length.toString(),
      description: t("dashboard.stats.myVoices.description"),
      icon: <Mic className="h-6 w-6" aria-hidden />,
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
                <Sparkles className="h-5 w-5 text-blue-500" aria-hidden />
                <Heading variant="subsection" as="h3" className="text-text-primary">
                  {t("dashboard.welcomeBanner.title")}
                </Heading>
              </div>
              <p className="text-text-secondary mb-4">{t("dashboard.welcomeBanner.message")}</p>
              <Link href="/project/new">
                <Button variant="primary" size="md">
                  <Plus className="h-4 w-4" aria-hidden />
                  {t("dashboard.welcomeBanner.cta")}
                </Button>
              </Link>
            </div>
            <button
              onClick={dismissWelcomeBanner}
              className="text-text-muted hover:text-text-primary transition-colors p-1"
              aria-label={t("dashboard.welcomeBanner.dismissAriaLabel")}
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </Card>
      )}

      <PageHeader title={t("dashboard.title")} description={t("dashboard.description")} />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
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
                    <Heading variant="metric" className="text-text-primary">
                      {stat.value}
                    </Heading>
                  </CardHeader>
                  <p className="text-caption text-text-muted">{stat.description}</p>
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
      <Card variant="elevated" padding="lg" className="mb-6 fade-in">
        <CardHeader>
          <CardTitle>{t("dashboard.quickActions.title")}</CardTitle>
          <CardDescription>{t("dashboard.quickActions.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Link href="/project/new">
              <Button
                variant="secondary"
                size="md"
                fullWidth
                className="justify-start hover:bg-surface-hover transition-all"
              >
                <Plus className="h-5 w-5" aria-hidden />
                {t("dashboard.quickActions.newProject")}
              </Button>
            </Link>
            <Link href="/movies">
              <Button
                variant="secondary"
                size="md"
                fullWidth
                className="justify-start hover:bg-surface-hover transition-all"
              >
                <Film className="h-5 w-5" aria-hidden />
                {t("dashboard.quickActions.browseMovies")}
              </Button>
            </Link>
            <Link href="/voices">
              <Button
                variant="secondary"
                size="md"
                fullWidth
                className="justify-start hover:bg-surface-hover transition-all"
              >
                <Mic className="h-5 w-5" aria-hidden />
                {t("dashboard.quickActions.recordVoice")}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Projects */}
      {(loadingProjects || projects.length > 0) && (
        <Card variant="elevated" padding="lg" className="mb-6 fade-in">
          <CardHeader className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t("dashboard.recentProjects.title")}</CardTitle>
                <CardDescription>{t("dashboard.recentProjects.description")}</CardDescription>
              </div>
              {!loadingProjects && projects.length > 0 && (
                <Link href="/projects">
                  <Button variant="secondary" size="sm">
                    {t("dashboard.recentProjects.viewAll")}
                    <ArrowRight className="h-4 w-4 ml-1" aria-hidden />
                  </Button>
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loadingProjects ? (
              <LoadingSkeleton variant="grid" count={3} />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((project, index) => (
                  <ProjectCard key={project.id} project={project} priority={index < 3} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Popular Movies */}
      {(loadingMovies || popularMovies.length > 0) && (
        <Card variant="elevated" padding="lg" className="fade-in">
          <CardHeader className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-accent-primary" aria-hidden />
                  {t("dashboard.popularMovies.title")}
                </CardTitle>
                <CardDescription>{t("dashboard.popularMovies.description")}</CardDescription>
              </div>
              {!loadingMovies && popularMovies.length > 0 && (
                <Link href="/movies">
                  <Button variant="secondary" size="sm">
                    {t("dashboard.popularMovies.exploreAll")}
                    <ArrowRight className="h-4 w-4 ml-1" aria-hidden />
                  </Button>
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loadingMovies ? (
              <LoadingSkeleton
                variant="poster"
                count={6}
                className="grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
              />
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                {popularMovies.map((movie) => (
                  <Link
                    key={movie.id}
                    href={`/movies/${movie.id}`}
                    className="group overflow-hidden rounded-xl border border-border-default bg-surface-panel transition hover:border-accent-cyan/40 hover:shadow-lg"
                  >
                    <div className="relative aspect-[2/3] w-full overflow-hidden bg-surface-raised">
                      {movie.poster_path && tmdbImageUrl(movie.poster_path) ? (
                        <ExternalImage
                          src={tmdbImageUrl(movie.poster_path)!}
                          alt={movie.title}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Film className="h-8 w-8 text-text-muted" aria-hidden />
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <Heading
                        variant="label"
                        as="h3"
                        className="line-clamp-1 text-caption text-text-primary group-hover:text-accent-cyan"
                      >
                        {movie.title}
                      </Heading>
                    </div>
                  </Link>
                ))}
              </div>
            )}
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
              <EmptyState
                size="lg"
                icon={<Folder aria-hidden />}
                title={t("dashboard.empty.title")}
                description={t("dashboard.empty.message")}
                action={
                  <Link href="/project/new">
                    <Button variant="primary" size="md">
                      {t("dashboard.empty.cta")}
                    </Button>
                  </Link>
                }
              />
            </CardContent>
          </Card>
        )}
    </div>
  );
}
