"use client";

import { useState } from "react";
import { Copy, Check, Users, Award, Gift, TrendingUp, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Grid } from "@/components/ui/Grid";

export default function ReferralPage() {
  const referralCode = "HUAVOI-ABC123";
  const referralLink = `https://huavoi.studio/r/${referralCode}`;
  const [copied, setCopied] = useState(false);

  const history = [
    { email: "j***@gmail.com", date: "Jun 10, 2026", status: "Signed up" },
    { email: "s***@outlook.com", date: "May 28, 2026", status: "Signed up" },
    { email: "m***@yahoo.com", date: "May 15, 2026", status: "Pending" },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader title="Referral Program" description="Invite friends and earn credits together" />

      {/* Referral Link Card */}
      <Card
        variant="elevated"
        padding="lg"
        className="mb-6 border-accent-cyan/20 bg-gradient-to-br from-accent-cyan/10 via-accent-primary/10 to-accent-secondary/10 overflow-hidden relative"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/5 to-transparent" />
        <div className="relative">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-primary flex items-center justify-center flex-shrink-0">
                <Share2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2">
                  Invite friends, earn credits
                  <Gift className="w-5 h-5 text-accent-cyan" />
                </CardTitle>
                <CardDescription>
                  Share your referral link. When someone signs up using your link, you both earn
                  free render credits.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 rounded-lg border border-border-default bg-surface-raised px-4 py-3">
                  <p className="text-xs font-medium text-text-muted mb-1">Your referral link</p>
                  <p className="truncate text-sm text-text-primary font-mono">{referralLink}</p>
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleCopy}
                  leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  className="shrink-0"
                >
                  {copied ? "Copied!" : "Copy Link"}
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-text-muted">Your code:</span>
                <code className="rounded-lg bg-accent-muted px-3 py-1.5 text-sm font-mono text-accent-primary font-semibold">
                  {referralCode}
                </code>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Stats Grid */}
      <Grid cols={3} gap="md" className="mb-6">
        <Card
          variant="elevated"
          padding="md"
          className="group hover:border-accent-cyan/40 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted mb-1">Total Referrals</p>
              <p className="text-3xl font-bold text-text-primary">3</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card
          variant="elevated"
          padding="md"
          className="group hover:border-accent-cyan/40 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted mb-1">Credits Earned</p>
              <p className="text-3xl font-bold text-accent-cyan">6</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card
          variant="elevated"
          padding="md"
          className="group hover:border-accent-cyan/40 transition-all"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted mb-1">Pending</p>
              <p className="text-3xl font-bold text-text-primary">1</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      </Grid>

      {/* Referral History */}
      <Card variant="elevated" padding="lg">
        <CardHeader>
          <CardTitle>Referral History</CardTitle>
          <CardDescription>Track your referrals and rewards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-sm">
              <thead>
                <tr className="border-b border-border-default text-left">
                  <th className="pb-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Referred
                  </th>
                  <th className="pb-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Date
                  </th>
                  <th className="pb-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Status
                  </th>
                  <th className="pb-3 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">
                    Credits
                  </th>
                </tr>
              </thead>
              <tbody>
                {history.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-border-subtle hover:bg-surface-hover transition-colors"
                  >
                    <td className="py-3 text-text-primary font-medium">{row.email}</td>
                    <td className="py-3 text-text-muted">{row.date}</td>
                    <td className="py-3">
                      <Badge variant={row.status === "Signed up" ? "success" : "default"}>
                        {row.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-right">
                      <span className="text-accent-cyan font-semibold">+2</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
