import { AlertCircle, Check, Globe, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Heading } from "@/components/ui/heading";
import { RECORDING_LANGUAGES } from "../constants";
import type { TranslateFn } from "../types";

interface VoiceNamingFormProps {
  voiceName: string;
  language: string;
  nameError: boolean;
  isSaving: boolean;
  onVoiceNameChange: (value: string) => void;
  onLanguageChange: (value: string) => void;
  onGenerateName: () => void;
  onBack: () => void;
  onSave: () => void;
  translate: TranslateFn;
}

export function VoiceNamingForm({
  voiceName,
  language,
  nameError,
  isSaving,
  onVoiceNameChange,
  onLanguageChange,
  onGenerateName,
  onBack,
  onSave,
  translate: t,
}: VoiceNamingFormProps) {
  return (
    <div className="flex flex-col gap-5 py-4">
      <div className="text-center">
        <Heading variant="subsection" as="h3" className="text-text-primary mb-1">
          {t("voices.recording.nameTitle")}
        </Heading>
        <p className="text-body text-text-muted">{t("voices.recording.nameSubtitle")}</p>
      </div>

      <Input
        label={t("voices.recording.voiceName")}
        id="voice-name"
        type="text"
        value={voiceName}
        onChange={(e) => onVoiceNameChange(e.target.value)}
        placeholder={t("voices.recording.namePlaceholder")}
        error={nameError ? t("voices.recording.nameRequired") : undefined}
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter" && !isSaving) {
            onSave();
          }
        }}
        disabled={isSaving}
      />

      <div>
        <label
          htmlFor="voice-language"
          className="block text-body font-medium text-text-primary mb-2"
        >
          {t("voices.recording.language")}
        </label>
        <div className="relative">
          <Globe
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
            aria-hidden
          />
          <select
            id="voice-language"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="w-full rounded-xl border border-border-default bg-surface-raised pl-10 pr-4 py-3 text-text-primary transition-colors focus:border-accent-cyan focus:outline-none focus:ring-2 focus:ring-accent-cyan/20 disabled:opacity-50"
            disabled={isSaving}
          >
            {RECORDING_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {t(`voices.languages.${lang.code}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="md"
          onClick={onBack}
          disabled={isSaving}
          className="flex-1"
        >
          {t("voices.recording.back")}
        </Button>
        <Button variant="primary" size="md" onClick={onSave} disabled={isSaving} className="flex-1">
          {isSaving ? (
            <>
              <Spinner size="sm" className="mr-2 text-white" />
              {t("voices.recording.saving")}
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" aria-hidden />
              {t("voices.recording.saveVoice")}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
