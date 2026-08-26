# Walkthrough: Onboarding Alignment & Preferences Steps

Reviewed and refactored the Onboarding flow into a unified 6-step journey that aligns with the Huavoi Studio design system, keeps step card height and Continue position stable, and splits language vs theme into dedicated steps.

## Changes

### 1. Language & Theme Steps (split from Preferences)
- [`LanguageStep.tsx`](src/components/onboarding/LanguageStep.tsx): 8-language grid with live locale switching.
- [`ThemeStep.tsx`](src/components/onboarding/ThemeStep.tsx): 3-card theme selector (`aurora` / `mesh` / `grid`) with live ambient switching.
- Translations in `public/locales/*/onboarding.json` under `onboarding.language` and `onboarding.theme`.

### 2. Fixed-height shell & pinned actions
- [`OnboardingLayout.tsx`](src/components/onboarding/OnboardingLayout.tsx): fixed card height; step body scrolls; footer stays put.
- All steps use the same footer slot so Continue stays in a stable viewport position.

### 3. Flow
`Welcome → Language → Theme → Workflow → Password → Completion`

### 4. Shared Theme Switcher
- [`ThemeSwitcher.tsx`](src/components/shared/ThemeSwitcher.tsx) remains unused; live pickers are Settings → Appearance and onboarding `ThemeStep`.
