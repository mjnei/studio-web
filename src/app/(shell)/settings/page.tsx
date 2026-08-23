"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Palette,
  FileText,
  Shield,
  Download,
  Settings as SettingsIcon,
  Check,
  ChevronRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/PageHeader";
import { useI18n } from "@/i18n";

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-all duration-200 ${
        checked
          ? "bg-gradient-to-r from-accent-primary to-accent-cyan shadow-glow"
          : "bg-surface-elevated border border-border-default"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white transition-transform duration-200 ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

interface SettingRowProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

function SettingRow({ title, description, children }: SettingRowProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3 border-b border-border-subtle last:border-0">
      <div className="flex-1">
        <p className="text-sm font-medium text-text-primary">{title}</p>
        {description && <p className="text-xs text-text-muted mt-1">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { t } = useI18n();
  const [defaults, setDefaults] = useState({
    voice: "none",
    resolution: "1080p",
    fps: "30",
    exportFormat: "mp4",
    scriptTone: "standard",
    scriptLength: "standard",
  });

  const [appearance, setAppearance] = useState({
    compactMode: false,
    autoPlayPreviews: true,
    waveformAnimation: true,
  });

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader
        title={t("settings.title")}
        description={t("settings.description")}
        action={
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent-primary hover:bg-accent-secondary text-white rounded-lg font-medium transition-all shadow-glow hover:shadow-glow-hover"
          >
            {saved ? (
              <>
                <Check className="h-4 w-4" aria-hidden />
                {t("settings.saved")}
              </>
            ) : (
              <>
                <SettingsIcon className="h-4 w-4" aria-hidden />
                {t("settings.saveChanges")}
              </>
            )}
          </button>
        }
      />

      <div className="space-y-4">
        {/* Notifications Card - Link to dedicated page */}
        <Link href="/settings/notifications" className="block group">
          <Card
            variant="elevated"
            padding="lg"
            className="cursor-pointer transition-all group-hover:shadow-lg group-hover:border-accent-primary/50"
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
                    <Bell className="h-5 w-5 text-white" aria-hidden />
                  </div>
                  <div>
                    <CardTitle>{t("settings.notifications.title")}</CardTitle>
                    <CardDescription>{t("settings.notifications.description")}</CardDescription>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-text-muted group-hover:text-accent-primary transition-colors" aria-hidden />
              </div>
            </CardHeader>
          </Card>
        </Link>

        {/* Project Defaults Card */}
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" aria-hidden />
              </div>
              <div>
                <CardTitle>{t("settings.projectDefaults.title")}</CardTitle>
                <CardDescription>{t("settings.projectDefaults.description")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-text-primary">
                  {t("settings.projectDefaults.defaultVoice")}
                </label>
                <select
                  value={defaults.voice}
                  onChange={(e) => setDefaults((d) => ({ ...d, voice: e.target.value }))}
                  className="w-full h-11 rounded-lg border border-border-default bg-surface-raised px-4 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary transition-all"
                >
                  <option value="none">{t("settings.projectDefaults.voiceNone")}</option>
                  <option value="voice-a">{t("settings.projectDefaults.voiceA")}</option>
                  <option value="voice-b">{t("settings.projectDefaults.voiceB")}</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-text-primary">
                  {t("settings.projectDefaults.resolution")}
                </label>
                <select
                  value={defaults.resolution}
                  onChange={(e) => setDefaults((d) => ({ ...d, resolution: e.target.value }))}
                  className="w-full h-11 rounded-lg border border-border-default bg-surface-raised px-4 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary transition-all"
                >
                  <option value="720p">{t("settings.projectDefaults.resolution720p")}</option>
                  <option value="1080p">{t("settings.projectDefaults.resolution1080p")}</option>
                  <option value="4k">{t("settings.projectDefaults.resolution4k")}</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-text-primary">
                  {t("settings.projectDefaults.frameRate")}
                </label>
                <select
                  value={defaults.fps}
                  onChange={(e) => setDefaults((d) => ({ ...d, fps: e.target.value }))}
                  className="w-full h-11 rounded-lg border border-border-default bg-surface-raised px-4 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary transition-all"
                >
                  <option value="24">{t("settings.projectDefaults.fps24")}</option>
                  <option value="30">{t("settings.projectDefaults.fps30")}</option>
                  <option value="60">{t("settings.projectDefaults.fps60")}</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-text-primary">
                  {t("settings.projectDefaults.exportFormat")}
                </label>
                <select
                  value={defaults.exportFormat}
                  onChange={(e) => setDefaults((d) => ({ ...d, exportFormat: e.target.value }))}
                  className="w-full h-11 rounded-lg border border-border-default bg-surface-raised px-4 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary transition-all"
                >
                  <option value="mp4">{t("settings.projectDefaults.exportMp4")}</option>
                  <option value="webm">{t("settings.projectDefaults.exportWebm")}</option>
                  <option value="mov">{t("settings.projectDefaults.exportMov")}</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Card */}
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Palette className="h-5 w-5 text-white" aria-hidden />
              </div>
              <div>
                <CardTitle>{t("settings.appearance.title")}</CardTitle>
                <CardDescription>{t("settings.appearance.description")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <SettingRow
              title={t("settings.appearance.compactMode")}
              description={t("settings.appearance.compactModeDesc")}
            >
              <Toggle
                checked={appearance.compactMode}
                onChange={() => setAppearance((a) => ({ ...a, compactMode: !a.compactMode }))}
              />
            </SettingRow>
            <SettingRow
              title={t("settings.appearance.autoPlayPreviews")}
              description={t("settings.appearance.autoPlayPreviewsDesc")}
            >
              <Toggle
                checked={appearance.autoPlayPreviews}
                onChange={() =>
                  setAppearance((a) => ({ ...a, autoPlayPreviews: !a.autoPlayPreviews }))
                }
              />
            </SettingRow>
            <SettingRow
              title={t("settings.appearance.waveformAnimations")}
              description={t("settings.appearance.waveformAnimationsDesc")}
            >
              <Toggle
                checked={appearance.waveformAnimation}
                onChange={() =>
                  setAppearance((a) => ({ ...a, waveformAnimation: !a.waveformAnimation }))
                }
              />
            </SettingRow>
          </CardContent>
        </Card>

        {/* Data & Privacy Card */}
        <Card variant="elevated" padding="lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" aria-hidden />
              </div>
              <div>
                <CardTitle>{t("settings.dataPrivacy.title")}</CardTitle>
                <CardDescription>{t("settings.dataPrivacy.description")}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <SettingRow
              title={t("settings.dataPrivacy.usageAnalytics")}
              description={t("settings.dataPrivacy.usageAnalyticsDesc")}
            >
              <Toggle checked={true} onChange={() => {}} />
            </SettingRow>
            <SettingRow
              title={t("settings.dataPrivacy.exportMyData")}
              description={t("settings.dataPrivacy.exportMyDataDesc")}
            >
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border-default bg-surface-raised text-sm font-medium text-text-primary hover:bg-surface-hover transition-all">
                <Download className="h-4 w-4" aria-hidden />
                {t("settings.dataPrivacy.requestExport")}
              </button>
            </SettingRow>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
