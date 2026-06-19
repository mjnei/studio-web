"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

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
    <div>
      <h1 className="mb-6 text-2xl font-bold">Referral</h1>
      <div className="space-y-6">
        <section className="rounded-lg border border-border-default bg-surface-panel p-4 md:p-6">
          <h2 className="mb-2 text-lg font-semibold">Invite friends, earn credits</h2>
          <p className="mb-4 text-sm text-text-muted">
            Share your referral link. When someone signs up using your link, you both earn free
            render credits.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1 rounded-md border border-border-default bg-surface-raised px-3 py-2">
              <p className="text-xs text-text-muted">Your referral link</p>
              <p className="truncate text-sm text-text-primary">{referralLink}</p>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={handleCopy}
              className="shrink-0"
            >
              {copied ? "Copied!" : "Copy link"}
            </Button>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-text-muted">Your code:</span>
            <code className="rounded bg-surface-raised px-2 py-0.5 text-xs font-mono text-accent-cyan">
              {referralCode}
            </code>
          </div>
        </section>

        <section className="rounded-lg border border-border-default bg-surface-panel p-4 md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your stats</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-md bg-surface-raised p-4">
              <p className="text-sm text-text-muted">Total referrals</p>
              <p className="mt-1 text-xl font-bold">3</p>
            </div>
            <div className="rounded-md bg-surface-raised p-4">
              <p className="text-sm text-text-muted">Credits earned</p>
              <p className="mt-1 text-xl font-bold text-accent-cyan">6</p>
            </div>
            <div className="rounded-md bg-surface-raised p-4">
              <p className="text-sm text-text-muted">Pending</p>
              <p className="mt-1 text-xl font-bold">1</p>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-border-default bg-surface-panel p-4 md:p-6">
          <h2 className="mb-4 text-lg font-semibold">Referral history</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-sm">
              <thead>
                <tr className="border-b border-border-default text-left text-xs text-text-muted">
                  <th className="pb-2 font-medium">Referred</th>
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium">Credits</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row, i) => (
                  <tr key={i} className="border-b border-border-subtle">
                    <td className="py-2.5 text-text-secondary">{row.email}</td>
                    <td className="py-2.5 text-text-muted">{row.date}</td>
                    <td className="py-2.5">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          row.status === "Signed up"
                            ? "bg-status-completed/15 text-status-completed"
                            : "bg-status-queued/15 text-status-queued"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-accent-cyan">+2</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
