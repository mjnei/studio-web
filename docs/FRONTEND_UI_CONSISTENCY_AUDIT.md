# Frontend UI Consistency Audit

**Date:** August 24, 2026  
**Scope:** icons, buttons, inputs, labels, and adjacent size/style conventions across `src/app/`, `src/components/ui/`, and shared app components  
**Method:** code audit only. This report does **not** include browser screenshots or visual QA at breakpoints.

## Executive summary

The frontend is **partially standardized**:

- **Typography and button sizing are mostly aligned** with the current token-based design system.
- **Icons are visually consistent in many places**, but icon usage is **not centralized**. The `Icon` wrapper is only used in a small number of files, while most of the app imports Lucide icons directly.
- **Form controls are the least consistent area**. The project has reusable `Input`, `TextArea`, and `Select` primitives, but many pages still use raw `<input>`, `<textarea>`, `<select>`, and `<label>` elements with duplicated styles.
- Existing documentation is **directionally correct**, but it currently **overstates how consistently the shared primitives are adopted**.

## Documents cross-checked

This audit was compared against:

- `docs/TYPOGRAPHY.md`
- `docs/guides/DESIGN_SYSTEM.md`
- `AGENTS.md`

## What is consistent today

### Typography tokens are broadly adopted

The codebase generally follows the role/token system documented in `docs/TYPOGRAPHY.md`:

- `text-body`, `text-caption`, and `text-micro` are widely used.
- Shared primitives such as `Button`, `Input`, `TextArea`, `Select`, `LoadingSpinner`, and `EmptyState` already encode token-based text sizes.
- The allowlisted arbitrary text sizes still match the docs:
  - `src/components/queue/HealthIndicator.tsx` uses `text-[14px]` and `text-[8px]` for SVG chart labels.
  - Decorative large glyphs remain in places like `src/components/onboarding/CompletionStep.tsx` and `src/app/(shell)/profile/page.tsx`.

### Button sizing rules are mostly coherent

`src/components/ui/button.tsx` defines a clear size scale:

- `sm`: `h-8 px-3 text-body`
- `md`: `h-9 px-3.5 text-body`
- `lg`: `h-10 px-5 text-body`
- `icon`: `h-9 w-9 p-0`

This matches the intent described in `docs/guides/DESIGN_SYSTEM.md`:

- `md` is commonly used for page actions and modal footers.
- `sm` is commonly used for dense surfaces like filters and compact cards.
- Inline button icons are usually `h-4 w-4`, which is consistent with the documented standard tier.

### Spinner guidance is implemented correctly

`docs/guides/DESIGN_SYSTEM.md` says spinners should go through `Spinner` / `LoadingSpinner`, not ad-hoc Lucide loading icons. The primitive implementation matches that guidance:

- `src/components/ui/spinner.tsx`
- `src/components/ui/LoadingSpinner.tsx`
- `src/components/ui/button.tsx` uses `<Spinner size="sm" />` for loading state.

## Findings

### High priority

#### 1. Form controls are not standardized around the shared primitives

The largest consistency gap is forms. The codebase has reusable primitives:

- `src/components/ui/input.tsx`
- `src/components/ui/select.tsx`

But many screens still use raw controls with hand-authored classes instead of shared components.

Examples (remaining after Aug 24, 2026 migrations):

- Raw `<select>` instead of shared `Select`
  - `src/components/shared/LanguageSwitcher.tsx` (compact top-nav chrome)
  - `src/components/project/ThumbnailEditorModal.tsx` (toolbar font/color)

- Raw `<input>` instead of shared `Input`
  - password-reveal fields (`src/components/onboarding/PasswordStep.tsx`)
  - checkboxes / file / range / color (intentionally native)

- Raw `<textarea>` instead of shared `TextArea`
  - `src/components/project/script-generation.tsx` (script editor)
  - `src/app/project/new/script/page.tsx`
  - `src/app/project/[projectId]/script/page.tsx`
  - `src/components/project/ThumbnailEditorModal.tsx`

Impact:

- Padding, heights, focus styles, and border treatments can drift over time.
- Label/helper/error patterns are reimplemented instead of inherited.
- A future global form-density change would still require many manual edits.

#### 2. Shared `Select` exists, but raw selects use a different visual scale

The shared `Select` component uses:

- `sm`: `px-3 py-1.5 text-body`
- `md`: `px-3.5 py-2 text-body`
- `lg`: `px-4 py-2.5 text-body`

Several raw `<select>` implementations used a different height. Settings, notifications, and admin project filters now use shared `Select`. Remaining native selects:

- `src/components/shared/LanguageSwitcher.tsx` uses `h-9 px-2.5 pr-7`
- `src/components/project/ThumbnailEditorModal.tsx` uses compact toolbar styling

The product standard is the shared `Select` padding scale (`sm` / `md` / `lg`). Native `<select>` is only for tiny chrome.

#### 3. Label strategy is inconsistent across the app

`Label` (`src/components/ui/label.tsx`) now exists with `field` and `meta` tones. `Input` / `TextArea` / `Select` and TTS job detail modals use it. Remaining mix:

- checkbox/toggle rows that wrap a native `<input type="checkbox">`
- a few auth/signup field labels still hand-rolled (candidate for `Input`’s built-in `label`)

Examples:

- body-style labels still raw in places
  - `src/app/(auth)/signup/page.tsx` (OTP / invite fields)

- checkbox/toggle labels
  - `src/components/notifications/NotificationPreferencesModal.tsx`
  - `src/app/(shell)/profile/page.tsx`
  - `src/app/(shell)/admin/projects/components/ProjectFilters.tsx`

The styles are often reasonable in context, but the implementation is not unified enough to guarantee consistency.

### Medium priority

#### 4. Icon usage is visually decent, but the `Icon` wrapper is under-adopted

The icon documentation says `@/components/ui/icon` should be used for nav and repeated dense-UI patterns. In practice:

- `src/components/shell/drawer-content.tsx` uses the wrapper correctly.
- Many repeated dense-UI contexts still use direct Lucide imports and raw `className="h-N w-N"` sizing.

Examples:

- `src/components/jobs/FiltersBar.tsx`
- `src/components/project/script-generation.tsx`
- `src/app/(shell)/settings/page.tsx`
- `src/app/(shell)/billing/page.tsx`
- `src/app/(shell)/referral/page.tsx`

This is not inherently wrong, because `docs/guides/DESIGN_SYSTEM.md` explicitly allows direct Lucide usage. But it does reduce the practical value of the wrapper as a standardization tool.

#### 5. Icon sizes are mostly standardized, but there are several density tiers in active use

Observed common sizes:

- `h-4 w-4`: dominant standard for button icons, inline actions, form decorations
- `h-5 w-5`: section accents, select/search adornments, card accents
- `h-6 w-6`: larger decorative icons
- `h-3` / `h-3.5`: compact row actions and dense controls
- `h-8`, `h-12`, `h-16`: hero/decorative usage

This generally aligns with the documented icon scale. Search adornments are standardized to `h-4 w-4`. Compact row actions may still mix `h-3` and `h-3.5` (allowed fractional density).

#### 6. Some button surfaces use raw `<button>` intentionally, but styling is duplicated

There are many raw `<button>` elements across the app. Some are justified:

- custom dropdown/select internals in `src/components/ui/select.tsx`
- pagination/tab/toggle-like controls
- icon-only shell controls in `src/components/shell/drawer-content.tsx`

However, those raw buttons often restate sizing and hover/focus conventions that the shared `Button` primitive already standardizes.

Examples:

- `src/components/shell/drawer-content.tsx`
- `src/components/ui/Pagination.tsx`
- `src/components/ui/LayoutToggle.tsx`
- `src/components/notifications/NotificationBell.tsx`
- `src/components/shared/version-switcher.tsx`

This is not a defect by itself, but it is a maintenance risk.

### Low priority

#### 7. Decorative large glyphs remain on the typography allowlist

Allowlisted decorative exceptions remain:

- `src/components/onboarding/CompletionStep.tsx` uses `text-3xl` for emoji
- `src/app/(shell)/profile/page.tsx` uses `text-4xl` for avatar initials

Referral stats now use `<Heading variant="metric">`. ESLint bans `text-2xl`–`text-5xl` outside the allowlist.

## Documentation accuracy check

### Accurate

The following documentation is accurate based on the current code:

- `docs/TYPOGRAPHY.md`
  - role-based type scale is implemented
  - `text-micro` allowlist language matches the remaining code
  - `Heading` / `Text` direction is correct

- `docs/guides/DESIGN_SYSTEM.md` icon size tiers and spinner rules
  - the dominant icon sizes in code match the documented `xs`/`sm`/`md`/`lg`/`xl` scale

### Partially inaccurate or outdated (resolved)

1. ~~`AGENTS.md` icon pointer~~ — now points at `docs/guides/DESIGN_SYSTEM.md` § Icons.
2. ~~`DESIGN_SYSTEM.md` overstated adoption~~ — v2.4 documents adoption gaps and remaining raw controls.
3. ~~Button variants missing `destructive`~~ — documented.
4. `Icon` wrapper adoption remains sparse outside nav (still accurate).

## Recommended next steps

### Phase 1: document reality clearly

1. ~~Update `AGENTS.md` to point at `docs/guides/DESIGN_SYSTEM.md` instead of `docs/ICONS.md`.~~ Done.
2. ~~Update `docs/guides/DESIGN_SYSTEM.md`~~ Done in v2.4+.

### Phase 2: reduce real UI drift

1. ~~Standardize selects~~ — settings, notifications, admin filters, locale pickers, voice naming use shared `Select`. Remaining: `LanguageSwitcher`, thumbnail toolbar.
2. ~~TextArea for ordinary forms~~ — playground TTS migrated; script editors stay custom.
3. ~~`Label` primitive~~ — `field` / `meta` tones; wired into `Input` / `TextArea` / `Select`.
4. ~~Search adornments~~ — standardized to `h-4 w-4`.
5. ~~Referral stats~~ — `<Heading variant="metric">`.

### Still open

- Optionally migrate `LanguageSwitcher` to shared `Select` without breaking top-nav density.
- Broader `Icon` wrapper adoption outside the sidebar.
- Checkbox/toggle rows still use native `<label>` wrappers (acceptable).
- Human visual QA at 375px / 1280px (see [TYPOGRAPHY.md](./TYPOGRAPHY.md)).

## Bottom line

Typography, button sizing, search adornments, and most form fields are aligned with shared primitives. Remaining drift is concentrated in **intentional editors** (script textareas), **compact chrome** (`LanguageSwitcher`, thumbnail toolbar), **checkbox/meta label rows**, and **partial `Icon` wrapper adoption**.
