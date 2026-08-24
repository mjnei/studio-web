import { Check, Globe, Sparkles } from "lucide-react";
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

      <div>
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
        <button
          type="button"
          onClick={onGenerateName}
          disabled={isSaving}
          className="mt-3 flex items-center gap-2 text-body text-accent-cyan hover:text-accent-cyan/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles className="h-4 w-4" aria-hidden />
          {t("voices.recording.generateRandom")}
        </button>
      </div>

      <Select
        label={t("voices.recording.language")}
        value={language}
        onChange={onLanguageChange}
        disabled={isSaving}
        icon={<Globe className="h-4 w-4" aria-hidden />}
        options={RECORDING_LANGUAGES.map((lang) => ({
          value: lang.code,
          label: t(`voices.languages.${lang.code}`),
        }))}
      />

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
