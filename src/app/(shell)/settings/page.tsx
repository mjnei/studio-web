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
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useI18n } from "@/i18n";
import {
  AMBIENT_BACKGROUND_STYLES,
  useAmbientBackground,
  type AmbientBackgroundStyle,
} from "@/lib/ambient-background";

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
        <p className="text-body font-medium text-text-primary">{title}</p>
        {description && <p className="text-caption text-text-muted mt-1">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

const THEME_PREVIEW_CLASS: Record<AmbientBackgroundStyle, string> = {
  aurora: "theme-preview-aurora",
  mesh: "theme-preview-mesh",
  grid: "theme-preview-grid",
};

function BackgroundStylePicker() {
  const { t } = useI18n();
  const { style, setStyle } = useAmbientBackground();

  const labels: Record<AmbientBackgroundStyle, { title: string; description: string }> = {
    aurora: {
      title: t("settings.appearance.backgroundAurora"),
      description: t("settings.appearance.backgroundAuroraDesc"),
    },
    mesh: {
      title: t("settings.appearance.backgroundMesh"),
      description: t("settings.appearance.backgroundMeshDesc"),
    },
    grid: {
      title: t("settings.appearance.backgroundGrid"),
      description: t("settings.appearance.backgroundGridDesc"),
    },
  };

  return (
    <div className="space-y-3 pt-1 pb-3 border-b border-border-subtle">
      <div>
        <p className="text-body font-medium text-text-primary">
          {t("settings.appearance.backgroundStyle")}
        </p>
        <p className="text-caption text-text-muted mt-1">
          {t("settings.appearance.backgroundStyleDesc")}
        </p>
      </div>
      <div
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        role="radiogroup"
        aria-label={t("settings.appearance.backgroundStyle")}
      >
        {AMBIENT_BACKGROUND_STYLES.map((option) => {
          const selected = style === option;
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setStyle(option)}
              className={`group text-left rounded-xl border p-3 transition-all ${
                selected
                  ? "border-accent-primary bg-accent-primary/10 shadow-glow"
                  : "border-border-default bg-surface-raised/60 hover:border-accent-primary/40 hover:bg-surface-hover"
              }`}
            >
              <div
                className={`mb-3 h-16 w-full rounded-lg border border-border-subtle overflow-hidden bg-surface-base ${THEME_PREVIEW_CLASS[option]}`}
              />
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-body font-medium text-text-primary">{labels[option].title}</p>
                  <p className="text-caption text-text-muted mt-0.5">
                    {labels[option].description}
                  </p>
                </div>
                {selected && (
                  <Check className="h-4 w-4 shrink-0 text-accent-primary mt-0.5" aria-hidden />
                )}
              </div>
            </button>
          );
        })}
      </div>
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
          <Button
            variant="primary"
            size="md"
            onClick={handleSave}
            leftIcon={saved ? <Check className="h-4 w-4" /> : <SettingsIcon className="h-4 w-4" />}
          >
            {saved ? t("settings.saved") : t("settings.saveChanges")}
          </Button>
        }
      />

      <div className="space-y-4">
        <Link href="/settings/notifications" className="block group">
          <Card
            variant="glass"
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
                <ChevronRight
                  className="h-5 w-5 text-text-muted group-hover:text-accent-primary transition-colors"
                  aria-hidden
                />
              </div>
            </CardHeader>
          </Card>
        </Link>

        <Card variant="glass" padding="lg">
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
              <Select
                label={t("settings.projectDefaults.defaultVoice")}
                value={defaults.voice}
                onChange={(voice) => setDefaults((d) => ({ ...d, voice }))}
                options={[
                  { value: "none", label: t("settings.projectDefaults.voiceNone") },
                  { value: "voice-a", label: t("settings.projectDefaults.voiceA") },
                  { value: "voice-b", label: t("settings.projectDefaults.voiceB") },
                ]}
              />
              <Select
                label={t("settings.projectDefaults.resolution")}
                value={defaults.resolution}
                onChange={(resolution) => setDefaults((d) => ({ ...d, resolution }))}
                options={[
                  { value: "720p", label: t("settings.projectDefaults.resolution720p") },
                  { value: "1080p", label: t("settings.projectDefaults.resolution1080p") },
                  { value: "4k", label: t("settings.projectDefaults.resolution4k") },
                ]}
              />
              <Select
                label={t("settings.projectDefaults.frameRate")}
                value={defaults.fps}
                onChange={(fps) => setDefaults((d) => ({ ...d, fps }))}
                options={[
                  { value: "24", label: t("settings.projectDefaults.fps24") },
                  { value: "30", label: t("settings.projectDefaults.fps30") },
                  { value: "60", label: t("settings.projectDefaults.fps60") },
                ]}
              />
              <Select
                label={t("settings.projectDefaults.exportFormat")}
                value={defaults.exportFormat}
                onChange={(exportFormat) => setDefaults((d) => ({ ...d, exportFormat }))}
                options={[
                  { value: "mp4", label: t("settings.projectDefaults.exportMp4") },
                  { value: "webm", label: t("settings.projectDefaults.exportWebm") },
                  { value: "mov", label: t("settings.projectDefaults.exportMov") },
                ]}
              />
            </div>
          </CardContent>
        </Card>

        <Card variant="glass" padding="lg">
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
            <BackgroundStylePicker />
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

        <Card variant="glass" padding="lg">
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
              <Button variant="secondary" size="sm" leftIcon={<Download className="h-4 w-4" />}>
                {t("settings.dataPrivacy.requestExport")}
              </Button>
            </SettingRow>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
