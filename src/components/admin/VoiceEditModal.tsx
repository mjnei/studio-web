"use client";

import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { Heading } from "@/components/ui/heading";
import { locales, localeNames, type Locale } from "@/i18n";
import { adminUpdateVoice } from "@/lib/api/admin";
import type { VoiceWithCreator } from "@/lib/types/api";

interface VoiceEditModalProps {
  open: boolean;
  voice: VoiceWithCreator | null;
  onClose: () => void;
  onSaved: (updated: VoiceWithCreator) => void;
}

const LANGUAGE_OPTIONS = locales.map((code) => ({
  value: code,
  label: `${localeNames[code].name} (${code})`,
}));

export function VoiceEditModal({ open, voice, onClose, onSaved }: VoiceEditModalProps) {
  const [name, setName] = useState("");
  const [language, setLanguage] = useState<Locale>("en");
  const [isShared, setIsShared] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !voice) return;
    setName(voice.name);
    const lang = (locales.includes(voice.language as Locale) ? voice.language : "en") as Locale;
    setLanguage(lang || "en");
    setIsShared(voice.is_shared);
    setError(null);
  }, [open, voice]);

  const handleSave = async () => {
    if (!voice || isSaving) return;
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Name is required");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const updated = await adminUpdateVoice(voice.id, {
        name: trimmed,
        language,
        is_shared: isShared,
      });
      onSaved(updated);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update voice");
    } finally {
      setIsSaving(false);
    }
  };

  if (!voice) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      closeOnOverlayClick={!isSaving}
      closeOnEscape={!isSaving}
      header={
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-primary/15">
            <Pencil className="h-5 w-5 text-accent-primary" />
          </div>
          <div>
            <Heading variant="section" as="h2" className="text-text-primary">
              Edit Voice
            </Heading>
            <p className="text-caption text-text-muted">@{voice.creator_username}</p>
          </div>
        </div>
      }
      footer={
        <>
          <Button variant="secondary" size="md" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button variant="primary" size="md" onClick={handleSave} loading={isSaving}>
            Save
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSaving}
          maxLength={255}
        />

        <Select
          label="Language"
          value={language}
          onChange={(value) => setLanguage(value as Locale)}
          options={LANGUAGE_OPTIONS}
          disabled={isSaving}
        />

        <Toggle
          checked={isShared}
          onChange={setIsShared}
          disabled={isSaving}
          label="Shared with community"
          description={
            isShared
              ? "Visible for admin approval / public catalog"
              : "Private to the owner. Turning off also revokes approval."
          }
        />

        {error ? <p className="text-caption text-red-600">{error}</p> : null}
      </div>
    </Modal>
  );
}
