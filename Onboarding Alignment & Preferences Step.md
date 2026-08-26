# Walkthrough: Onboarding Alignment & Preferences Step (Locale Picker + Theme Switcher)

Reviewed and refactored the Onboarding flow into a unified 5-step journey that aligns with the Huavoi Studio design system, fixes responsiveness and button layouts across all screens, and adds a dedicated Preferences step for Locale and Theme selection.

## Changes

### 1. Dedicated Preferences Step (Language & Theme)
- Created [`PreferencesStep.tsx`](file:///d:/runway/git/studio-web/src/components/onboarding/PreferencesStep.tsx):
  - **Interface Language Picker**: Interactive grid of 8 supported languages (`en`, `chs`, `cht`, `ja`, `ko`, `de`, `fr`, `es`) with instant live locale switching.
  - **Theme Color Switcher**: Interactive 3-card theme selector (`aurora` Teal Studio, `mesh` Amber Workflow, `grid` Blue Infrastructure) with live swatch previews and instant ambient glow/accent color switching.
  - Added complete translations across all 8 locale files in `public/locales/*/onboarding.json`.

### 2. Standardized Layout & Button Alignment Across All Steps
- **Step 1: Welcome** ([`WelcomeStep.tsx`](file:///d:/runway/git/studio-web/src/components/onboarding/WelcomeStep.tsx))
  - Replaced ad-hoc button with `<Button size="lg" variant="primary">` with theme glow.
  - Standardized feature pills with `bg-surface-elevated/70 border-border-default`.
- **Step 2: Preferences** ([`PreferencesStep.tsx`](file:///d:/runway/git/studio-web/src/components/onboarding/PreferencesStep.tsx))
  - Unified bottom action buttons: Secondary `Back` on left, Primary `Continue` on right.
- **Step 3: Workflow** ([`WorkflowStep.tsx`](file:///d:/runway/git/studio-web/src/components/onboarding/WorkflowStep.tsx))
  - Responsive 2-column mobile and 4-column tablet/desktop grid.
  - Updated card surfaces with `bg-surface-raised/60`, theme gradient badges, and standardized secondary/primary buttons.
- **Step 4: Password** ([`PasswordStep.tsx`](file:///d:/runway/git/studio-web/src/components/onboarding/PasswordStep.tsx))
  - Replaced ad-hoc inputs with design system `PasswordInput` and labels.
  - Unified bottom navigation: Secondary `Back` on left; Ghost `Skip for Now` + Primary `Set Password` on right.
- **Step 5: Completion** ([`CompletionStep.tsx`](file:///d:/runway/git/studio-web/src/components/onboarding/CompletionStep.tsx))
  - Standardized primary `Go to Dashboard` and error `Try Again` buttons using `<Button size="lg" variant="primary">`.
  - Feature badges and countdown spinner integrated into design system surfaces.

### 3. Responsive Page Shell & Progress Indicator
- Updated [`page.tsx`](file:///d:/runway/git/studio-web/src/app/(auth)/onboarding/page.tsx):
  - 5-step flow: `Welcome -> Preferences -> Workflow -> Password -> Completion`.
  - Full viewport safety: `safe-area-x safe-area-y min-h-dvh flex flex-col justify-between overflow-x-hidden`.
  - Glassmorphic card container: `bg-surface-panel/85 backdrop-blur-xl border border-border-default shadow-2xl`.
  - Dynamic ambient glows that automatically shift color when the user switches themes.
  - Step dots with checkmarks for completed steps and mobile progress bar.

### 4. Shared Theme Switcher
- Created [`ThemeSwitcher.tsx`](src/components/shared/ThemeSwitcher.tsx) as a reusable select control.
  - **Status:** currently **unused** (no imports). Live pickers are Settings → Appearance and onboarding `PreferencesStep`. Wire up or delete in a follow-up.
