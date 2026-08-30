"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/i18n";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Heading } from "@/components/ui/heading";
import { Badge } from "@/components/ui/badge";
import {
  getLeaderboard,
  type LeaderboardEntry,
  type LeaderboardResponse,
} from "@/lib/api/referral-client";
import { useToast } from "@/components/ui/toast";

export default function LeaderboardPage() {
  const { t } = useI18n();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [cacheUpdatedAt, setCacheUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        setLoading(true);
        const response: LeaderboardResponse = await getLeaderboard(100, 0);
        setLeaderboard(response.leaderboard);
        setCacheUpdatedAt(response.cache_updated_at);
      } catch (error) {
        console.error("Failed to load leaderboard:", error);
        toast.error(t("referral.leaderboard.errorTitle"), t("referral.leaderboard.errorMessage"));
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, [t, toast]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-amber-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-slate-400" />;
    if (rank === 3) return <Award className="h-6 w-6 text-amber-700" />;
    return null;
  };

  const getRankBadgeVariant = (rank: number): "warning" | "default" => {
    if (rank === 1) return "warning";
    return "default";
  };

  const formatCacheTime = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title={t("referral.leaderboard.title")}
          description={t("referral.leaderboard.description")}
        />
        <div className="flex items-center justify-center py-20">
          <Spinner size="md" className="text-accent-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title={t("referral.leaderboard.title")}
        description={t("referral.leaderboard.description")}
      />

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <div className="mb-8 grid grid-cols-3 gap-4">
          {/* 2nd Place */}
          <Card
            variant="elevated"
            padding="lg"
            className="border-slate-400/30 bg-gradient-to-br from-slate-500/10 to-slate-600/5"
          >
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <UserAvatar
                  seed={leaderboard[1].user_name}
                  name={leaderboard[1].user_name}
                  pictureUrl={leaderboard[1].avatar_url}
                  width={80}
                  height={80}
                  ringWidth={2}
                  className="w-20 h-20 rounded-full text-section"
                  imageClassName="w-full h-full rounded-full object-cover"
                />
              </div>
              <Badge variant="default" className="mb-2">
                #{leaderboard[1].rank}
              </Badge>
              <Heading variant="subsection" as="p" className="mb-1 text-text-primary">
                {leaderboard[1].user_name}
              </Heading>
              <div className="mt-3 flex items-center justify-center gap-4 text-body text-text-muted">
                <div>
                  <p className="text-caption">{t("referral.leaderboard.referrals")}</p>
                  <Heading variant="subsection" as="p" className="text-text-primary">
                    {leaderboard[1].total_all_levels_referrals}
                  </Heading>
                </div>
                <div>
                  <p className="text-caption">{t("referral.leaderboard.rewards")}</p>
                  <Heading variant="subsection" as="p" className="text-accent-cyan">
                    {leaderboard[1].total_invite_rewards_earned}
                  </Heading>
                </div>
              </div>
            </div>
          </Card>

          {/* 1st Place (Center, Larger) */}
          <Card
            variant="elevated"
            padding="lg"
            className="border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-amber-600/5 transform scale-105"
          >
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <UserAvatar
                  seed={leaderboard[0].user_name}
                  name={leaderboard[0].user_name}
                  pictureUrl={leaderboard[0].avatar_url}
                  width={96}
                  height={96}
                  ringWidth={2}
                  className="w-24 h-24 rounded-full text-page"
                  imageClassName="w-full h-full rounded-full object-cover"
                />
              </div>
              <Badge variant="warning" className="mb-2">
                👑 #{leaderboard[0].rank}
              </Badge>
              <Heading variant="section" as="p" className="mb-1 text-text-primary">
                {leaderboard[0].user_name}
              </Heading>
              <div className="mt-3 flex items-center justify-center gap-4 text-body text-text-muted">
                <div>
                  <p className="text-caption">{t("referral.leaderboard.referrals")}</p>
                  <Heading variant="metric" as="p" className="text-text-primary">
                    {leaderboard[0].total_all_levels_referrals}
                  </Heading>
                </div>
                <div>
                  <p className="text-caption">{t("referral.leaderboard.rewards")}</p>
                  <Heading variant="metric" as="p" className="text-accent-cyan">
                    {leaderboard[0].total_invite_rewards_earned}
                  </Heading>
                </div>
              </div>
            </div>
          </Card>

          {/* 3rd Place */}
          <Card
            variant="elevated"
            padding="lg"
            className="border-amber-700/30 bg-gradient-to-br from-amber-700/10 to-amber-800/5"
          >
            <div className="text-center">
              <div className="flex justify-center mb-3">
                <UserAvatar
                  seed={leaderboard[2].user_name}
                  name={leaderboard[2].user_name}
                  pictureUrl={leaderboard[2].avatar_url}
                  width={80}
                  height={80}
                  ringWidth={2}
                  className="w-20 h-20 rounded-full text-section"
                  imageClassName="w-full h-full rounded-full object-cover"
                />
              </div>
              <Badge variant="default" className="mb-2">
                #{leaderboard[2].rank}
              </Badge>
              <Heading variant="subsection" as="p" className="mb-1 text-text-primary">
                {leaderboard[2].user_name}
              </Heading>
              <div className="mt-3 flex items-center justify-center gap-4 text-body text-text-muted">
                <div>
                  <p className="text-caption">{t("referral.leaderboard.referrals")}</p>
                  <Heading variant="subsection" as="p" className="text-text-primary">
                    {leaderboard[2].total_all_levels_referrals}
                  </Heading>
                </div>
                <div>
                  <p className="text-caption">{t("referral.leaderboard.rewards")}</p>
                  <Heading variant="subsection" as="p" className="text-accent-cyan">
                    {leaderboard[2].total_invite_rewards_earned}
                  </Heading>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Full Leaderboard */}
      <Card variant="elevated" padding="lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("referral.leaderboard.fullList")}</CardTitle>
              <CardDescription>
                {leaderboard.length > 0
                  ? `Top ${leaderboard.length} referrers`
                  : t("referral.leaderboard.noData")}
              </CardDescription>
            </div>
            {cacheUpdatedAt && (
              <div className="text-caption text-text-muted">
                {t("referral.leaderboard.lastUpdated")}: {formatCacheTime(cacheUpdatedAt)}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 text-text-muted mx-auto mb-4" />
              <p className="text-text-muted">{t("referral.leaderboard.noData")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-body">
                <thead>
                  <tr className="border-b border-border-default text-left">
                    <th className="pb-3 text-caption font-semibold text-text-secondary uppercase tracking-wider w-16">
                      {t("referral.leaderboard.rank")}
                    </th>
                    <th className="pb-3 text-caption font-semibold text-text-secondary uppercase tracking-wider">
                      {t("referral.leaderboard.user")}
                    </th>
                    <th className="pb-3 text-caption font-semibold text-text-secondary uppercase tracking-wider text-right">
                      {t("referral.leaderboard.direct")}
                    </th>
                    <th className="pb-3 text-caption font-semibold text-text-secondary uppercase tracking-wider text-right">
                      {t("referral.leaderboard.total")}
                    </th>
                    <th className="pb-3 text-caption font-semibold text-text-secondary uppercase tracking-wider text-right">
                      {t("referral.leaderboard.rewards")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry) => (
                    <tr
                      key={entry.rank}
                      className="border-b border-border-subtle hover:bg-surface-hover transition-colors"
                    >
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          {getRankIcon(entry.rank)}
                          <Badge variant={getRankBadgeVariant(entry.rank)}>#{entry.rank}</Badge>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            seed={entry.user_name}
                            name={entry.user_name}
                            pictureUrl={entry.avatar_url}
                            width={40}
                            height={40}
                            ringWidth={0}
                            className="w-10 h-10 rounded-full text-caption"
                            imageClassName="w-10 h-10 rounded-full object-cover"
                          />
                          <p className="font-medium text-text-primary">{entry.user_name}</p>
                        </div>
                      </td>
                      <td className="py-3 text-right text-text-muted">
                        {entry.total_direct_referrals}
                      </td>
                      <td className="py-3 text-right font-semibold text-text-primary">
                        {entry.total_all_levels_referrals}
                      </td>
                      <td className="py-3 text-right">
                        <span className="text-accent-cyan font-semibold">
                          {entry.total_invite_rewards_earned}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
