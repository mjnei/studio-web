# Internationalization (i18n)

This directory contains translation files for the Huavoi Studio application.

## Supported Languages

- **English (en)**: Default language
- **Simplified Chinese (zh-CN)**: 简体中文
- **Traditional Chinese (zh-TW)**: 繁體中文 (Taiwan UI phrasing)
- **Japanese (ja)**: 日本語
- **Korean (ko)**: 한국어
- **German (de)**: Deutsch
- **French (fr)**: Français
- **Spanish (es)**: Español

Locale codes are BCP-47 throughout (UI, API, TMDB, voices, TTS job metadata). Helpers: `getDateLocale`, `resolveTtsLanguage` in `src/i18n/config.ts`.

## Structure

Each language has its own directory with namespace files (17 total — see `translationFiles` in `src/i18n/context.tsx`):

```
locales/
├── en/
│   ├── common.json
│   ├── auth.json
│   ├── onboarding.json
│   ├── dashboard.json
│   ├── projects.json
│   ├── project.json
│   ├── jobs.json
│   ├── voices.json
│   ├── settings.json
│   ├── shell.json
│   ├── profile.json
│   ├── help.json
│   ├── pricing.json
│   ├── billing.json
│   ├── referral.json
│   ├── notifications.json
│   └── movies.json
└── zh-CN/
    └── (same namespaces)
```

## Usage

Import the `useI18n` hook in your components:

```tsx
import { useI18n } from "@/i18n";

function MyComponent() {
  const { t, locale, setLocale } = useI18n();
  
  return (
    <div>
      <h1>{t("common.save")}</h1>
      <p>Current locale: {locale}</p>
    </div>
  );
}
```

## Adding New Translations

1. Add the key-value pair to the appropriate namespace file in `en/`
2. Add the corresponding translation to the same namespace file in `zh-CN/` (and other locales)
3. Use the translation key with the `t()` function in your component

Example:
```json
// en/common.json
{
  "common": {
    "newKey": "New Text"
  }
}

// zh-CN/common.json
{
  "common": {
    "newKey": "新文本"
  }
}
```

## Language Switcher

Use the `LanguageSwitcher` component to allow users to change languages:

```tsx
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";

function Header() {
  return (
    <header>
      <LanguageSwitcher />
    </header>
  );
}
```

The selected language is persisted in `localStorage` under key `"locale"` using BCP-47 codes (`zh-CN`, `zh-TW`, etc.). Legacy values (`chs`, `cht`) are migrated automatically on load.

## ⚠️ Admin Pages

Admin pages **do NOT require i18n or translation**. English is acceptable for all administrative interfaces.
