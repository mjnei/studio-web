"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useI18n } from "@/i18n";
import {
  Copy,
  Check,
  Users,
  Award,
  Gift,
  TrendingUp,
  Share2,
  Trophy,
  Sparkles,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Heading } from "@/components/ui/heading";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import {
  getMyReferralCode,
  getMyReferralHistory,
  getMyReferralStats,
  type Achievement,
  type ReferralCodeResponse,
  type ReferralHistoryItem,
  type ReferralStatsResponse,
} from "@/lib/api/referral-client";
import { getReferralRewardHistory, type CreditTransaction } from "@/lib/credit-client";
import { useToast } from "@/components/ui/toast";

export default function ReferralPage() {
  const { t } = useI18n();
  const toast = useToast();
  const [linkCopied, setLinkCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [codeData, setCodeData] = useState<ReferralCodeResponse | null>(null);
  const [stats, setStats] = useState<ReferralStatsResponse | null>(null);
  const [history, setHistory] = useState<ReferralHistoryItem[]>([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [rewardTransactions, setRewardTransactions] = useState<CreditTransaction[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [codeResponse, statsResponse, historyResponse, rewardsResponse] = await Promise.all([
          getMyReferralCode(),
          getMyReferralStats(),
          getMyReferralHistory({ limit: 10, offset: 0, sort_by: "date", order: "desc" }),
          getReferralRewardHistory(20),
        ]);

        setCodeData(codeResponse);
        setStats(statsResponse);
        setHistory(historyResponse.referrals);
        setHistoryTotal(historyResponse.total);
        setRewardTransactions(rewardsResponse);
      } catch (error) {
        console.error("Failed to load referral data:", error);
        toast.error(t("referral.errorTitle"), t("referral.errorLoadingData"));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [t, toast]);

  // TODO(backend): The API response `invite_link` reflects the request Host header,
  // which produces LAN IPs in dev (e.g. http://192.168.x.x:3020/...).
  // Fix: add a FRONTEND_BASE_URL env var on the backend and use it to construct
  // `invite_link` in GET /referrals/code. Once fixed, revert this to codeData.invite_link.
  const inviteLink = codeData
    ? `${window.location.origin}/invite?code=${codeData.referral_code}`
    : null;

  const handleCopyLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setLinkCopied(true);
      toast.success(t("referral.inviteCard.copied"), "");
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const handleCopyCode = () => {
    if (codeData?.referral_code) {
      navigator.clipboard.writeText(codeData.referral_code);
      setCodeCopied(true);
      toast.success(t("referral.inviteCard.copied"), "");
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getRewardLabel = (transaction: CreditTransaction) => {
    const key = `referral.rewardsActivity.transactionTypes.${transaction.transaction_type}`;
    const translated = t(key);
    return translated === key ? transaction.transaction_type : translated;
  };

  const getAchievementText = (achievement: Achievement, field: "name" | "description") => {
    const key = `referral.achievements.types.${achievement.type}.${field}`;
    const translated = t(key);
    return translated === key ? achievement[field] : translated;
  };

  const formatAmount = (amount: number) => (amount >= 0 ? `+${amount}` : `${amount}`);

  const getLevelBadgeVariant = (level: number) => {
    if (level === 1) return "success";
    if (level <= 3) return "warning";
    return "default";
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <PageHeader title={t("referral.title")} description={t("referral.description")} />
        <div className="flex items-center justify-center py-20">
          <Spinner size="md" className="text-accent-primary" />
        </div>
      </div>
    );
  }

  if (!codeData || !stats) {
    return (
      <div className="max-w-6xl mx-auto">
        <PageHeader title={t("referral.title")} description={t("referral.description")} />
        <Card variant="glass" padding="lg">
          <p className="text-center text-text-muted">{t("referral.errorLoadingData")}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title={t("referral.title")}
        description={t("referral.description")}
        action={
          <Link href="/referral/leaderboard">
            <Button variant="outline" size="md" leftIcon={<Trophy className="h-4 w-4" />}>
              {t("referral.viewLeaderboard")}
            </Button>
          </Link>
        }
      />

      {/* Referral Link Card */}
      <Card
        variant="glass"
        padding="lg"
        className="mb-6 border-accent-cyan/20 bg-gradient-to-br from-accent-cyan/10 via-accent-primary/10 to-accent-secondary/10 overflow-hidden relative"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/5 to-transparent" />
        <div className="relative">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-primary flex items-center justify-center flex-shrink-0">
                <Share2 className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2">
                  {t("referral.inviteCard.title")}
                  <Gift className="h-5 w-5 text-accent-cyan" />
                </CardTitle>
                <CardDescription>{t("referral.inviteCard.description")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {/* Referral Link */}
              <div className="flex items-center justify-between gap-3 rounded-lg border border-border-default bg-surface-raised px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-caption font-medium text-text-muted mb-1 truncate">
                    {t("referral.inviteCard.yourReferralLink")}
                  </p>
                  <p className="truncate text-body text-text-primary font-mono select-all">
                    {inviteLink}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover active:scale-95 transition-all shrink-0 focus-ring"
                  aria-label={
                    linkCopied ? t("referral.inviteCard.copied") : t("referral.inviteCard.copyLink")
                  }
                  title={
                    linkCopied ? t("referral.inviteCard.copied") : t("referral.inviteCard.copyLink")
                  }
                >
                  {linkCopied ? (
                    <Check className="h-5 w-5 text-[var(--status-success)]" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Referral Code */}
              <div className="flex items-center justify-between gap-3 rounded-lg border border-border-default bg-surface-raised px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-caption font-medium text-text-muted mb-1 truncate">
                    {t("referral.inviteCard.yourCode")}
                  </p>
                  <p className="truncate text-body text-accent-primary font-mono font-semibold select-all">
                    {codeData.referral_code}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover active:scale-95 transition-all shrink-0 focus-ring"
                  aria-label={
                    codeCopied ? t("referral.inviteCard.copied") : t("referral.inviteCard.copyCode")
                  }
                  title={
                    codeCopied ? t("referral.inviteCard.copied") : t("referral.inviteCard.copyCode")
                  }
                >
                  {codeCopied ? (
                    <Check className="h-5 w-5 text-[var(--status-success)]" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <Card
          variant="glass"
          padding="md"
          interactive
          className="group hover:border-accent-cyan/40 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body text-text-muted mb-1">
                {t("referral.stats.directReferrals")}
              </p>
              <Heading variant="metric" className="text-text-primary">
                {stats.total_direct_referrals}
              </Heading>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </Card>

        <Card
          variant="glass"
          padding="md"
          interactive
          className="group hover:border-accent-cyan/40 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body text-text-muted mb-1">{t("referral.stats.totalReferrals")}</p>
              <Heading variant="metric" className="text-text-primary">
                {stats.total_all_levels_referrals}
              </Heading>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
        </Card>

        <Card
          variant="glass"
          padding="md"
          interactive
          className="group hover:border-accent-cyan/40 transition-all col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-body text-text-muted mb-1">{t("referral.stats.rewardsEarned")}</p>
              <Heading variant="metric" className="text-accent-cyan">
                {stats.total_invite_rewards_earned}
              </Heading>
              <p className="text-caption text-text-muted mt-1">
                {t("referral.stats.referralRewards")}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award className="h-6 w-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Achievements */}
      {stats.achievements && stats.achievements.length > 0 && (
        <Card variant="glass" padding="lg" className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              {t("referral.achievements.title")}
            </CardTitle>
            <CardDescription>{t("referral.achievements.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {stats.achievements.map((achievement, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-border-default bg-surface-raised p-4 text-center hover:border-accent-cyan/40 transition-all"
                >
                  <Tooltip
                    content={getAchievementText(achievement, "description")}
                    position="top"
                  >
                    <div className="cursor-default">
                      {achievement.icon_url ? (
                        <Image
                          src={achievement.icon_url}
                          alt={getAchievementText(achievement, "name")}
                          className="w-12 h-12 mx-auto mb-2"
                          width={48}
                          height={48}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-2">
                          <Trophy className="h-6 w-6 text-white" />
                        </div>
                      )}
                      <p className="text-body font-semibold text-text-primary">
                        {getAchievementText(achievement, "name")}
                      </p>
                      <p className="text-caption text-text-secondary mt-1">
                        {formatDate(achievement.earned_at)}
                      </p>
                    </div>
                  </Tooltip>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rewards Activity (welcome bonus + invite earnings) */}
      <Card variant="glass" padding="lg" className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent-cyan" />
            {t("referral.rewardsActivity.title")}
          </CardTitle>
          <CardDescription>{t("referral.rewardsActivity.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          {rewardTransactions.length === 0 ? (
            <EmptyState
              icon={<Gift aria-hidden />}
              title={t("referral.rewardsActivity.noRewards")}
              description={t("referral.rewardsActivity.noRewardsDescription")}
            />
          ) : (
            <div className="space-y-3">
              {rewardTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-surface-raised border border-border-default"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-accent-cyan/10">
                      {transaction.transaction_type === "welcome_bonus" ? (
                        <Gift className="h-5 w-5 text-accent-cyan" />
                      ) : (
                        <Award className="h-5 w-5 text-accent-cyan" />
                      )}
                    </div>
                    <div>
                      <p className="text-body font-medium text-text-primary">
                        {getRewardLabel(transaction)}
                      </p>
                      <p className="text-caption text-text-muted">
                        {transaction.reason || t("referral.rewardsActivity.rewardTransaction")}
                      </p>
                      <Tooltip content={formatDateTime(transaction.created_at)} position="top">
                        <p className="text-caption text-text-muted mt-0.5 cursor-default w-fit">
                          {formatDate(transaction.created_at)}
                        </p>
                      </Tooltip>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-body font-semibold text-accent-cyan">
                      {formatAmount(transaction.amount)} {t("referral.stats.referralRewards")}
                    </p>
                    <p className="text-caption text-text-muted">
                      {t("referral.rewardsActivity.balance")} {transaction.balance_after}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Referral History */}
      <Card variant="glass" padding="lg">
        <CardHeader>
          <CardTitle>{t("referral.history.title")}</CardTitle>
          <CardDescription>
            {t("referral.history.description")} ({historyTotal} {t("referral.history.total")})
          </CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <EmptyState icon={<Users aria-hidden />} title={t("referral.history.noReferrals")} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-body">
                <thead>
                  <tr className="border-b border-border-default text-left">
                    <th className="pb-3 text-caption font-semibold text-text-secondary uppercase tracking-wider">
                      {t("referral.history.referee")}
                    </th>
                    <th className="pb-3 text-caption font-semibold text-text-secondary uppercase tracking-wider">
                      {t("referral.history.date")}
                    </th>
                    <th className="pb-3 text-caption font-semibold text-text-secondary uppercase tracking-wider">
                      {t("referral.history.level")}
                    </th>
                    <th className="pb-3 text-caption font-semibold text-text-secondary uppercase tracking-wider">
                      {t("referral.history.downstream")}
                    </th>
                    <th className="pb-3 text-caption font-semibold text-text-secondary uppercase tracking-wider text-right">
                      {t("referral.history.rewards")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-border-subtle hover:bg-surface-hover transition-colors"
                    >
                      <td className="py-3">
                        <p className="font-medium text-text-primary">{row.referee_name}</p>
                        <p className="text-caption text-text-muted">{row.referee_email}</p>
                      </td>
                      <td className="py-3 text-text-muted">{formatDate(row.created_at)}</td>
                      <td className="py-3">
                        <Badge variant={getLevelBadgeVariant(row.referral_level)}>
                          {t("referral.history.levelBadge", { level: row.referral_level })}
                        </Badge>
                      </td>
                      <td className="py-3 text-text-muted">{row.downstream_referral_count}</td>
                      <td className="py-3 text-right">
                        <span className="text-accent-cyan font-semibold">
                          +{row.rewards_earned} {t("referral.stats.referralRewards")}
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
