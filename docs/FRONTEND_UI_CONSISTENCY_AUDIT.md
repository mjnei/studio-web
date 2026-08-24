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
- `docs/TYPOGRAPHY_REFACTOR.md`
- `docs/LOADING_TODO.md`
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

`docs/LOADING_TODO.md` says spinners should go through `Spinner` / `LoadingSpinner`, not ad-hoc Lucide loading icons. The primitive implementation matches that guidance:

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

Examples:

- Raw `<select>` instead of shared `Select`
  - `src/app/(shell)/settings/page.tsx`
  - `src/app/(shell)/notifications/page.tsx`
  - `src/app/(shell)/admin/projects/components/ProjectFilters.tsx`
  - `src/components/shared/LanguageSwitcher.tsx`
  - `src/components/project/ThumbnailEditorModal.tsx`
  - `src/components/shared/voice-recording-modal/components/voice-naming-form.tsx`

- Raw `<input>` instead of shared `Input`
  - `src/app/(shell)/admin/projects/components/ProjectFilters.tsx`
  - `src/app/(shell)/admin/audit-logs/components/AuditFilters.tsx`
  - `src/components/ui/modal.tsx`
  - `src/components/shared/voice-recording-modal/components/voice-naming-form.tsx`
  - `src/app/(shell)/admin/movies/components/MovieLibraryView.tsx`
  - `src/components/shell/top-nav.tsx`

- Raw `<textarea>` instead of shared `TextArea`
  - `src/components/project/script-generation.tsx`
  - `src/app/project/new/script/page.tsx`
  - `src/app/project/[projectId]/script/page.tsx`
  - `src/components/project/ThumbnailEditorModal.tsx`
  - `src/app/(shell)/admin/playground/components/PlaygroundForm.tsx`

Impact:

- Padding, heights, focus styles, and border treatments can drift over time.
- Label/helper/error patterns are reimplemented instead of inherited.
- A future global form-density change would still require many manual edits.

#### 2. Shared `Select` exists, but raw selects use a different visual scale

The shared `Select` component uses:

- `sm`: `px-3 py-1.5 text-body`
- `md`: `px-3.5 py-2 text-body`
- `lg`: `px-4 py-2.5 text-body`

Several raw `<select>` implementations are taller and styled differently, for example:

- `src/app/(shell)/settings/page.tsx` uses `h-11 px-4`
- `src/components/shared/LanguageSwitcher.tsx` uses `h-9 px-2.5 pr-7`
- `src/app/(shell)/notifications/page.tsx` uses `px-3 py-2`
- `src/app/(shell)/admin/projects/components/ProjectFilters.tsx` uses `px-3 py-2`

This means the project currently has **at least three select silhouettes** in active use:

1. shared `Select`
2. raw compact selects
3. taller settings-page selects

That is a real style inconsistency, not just an implementation detail.

#### 3. Label strategy is inconsistent across the app

There is no dedicated `Label` primitive. Labels are implemented using a mix of:

- `Text as="label"` in shared primitives like `Input` and `Select`
- raw `<label>` with `text-body font-medium`
- raw `<label>` with `text-caption font-medium uppercase tracking-wider`
- raw `<span>` next to checkbox inputs

Examples:

- body-style labels
  - `src/app/(shell)/settings/page.tsx`
  - `src/components/shared/voice-recording-modal/components/voice-naming-form.tsx`
  - `src/app/(auth)/signup/page.tsx`

- caption/metadata labels
  - `src/app/(shell)/admin/studio-tts-jobs/components/JobDetailModal.tsx`
  - `src/app/(shell)/admin/playground-tts-jobs/components/PlaygroundJobDetailModal.tsx`
  - `src/app/(shell)/admin/audit-logs/components/AuditFilters.tsx`

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

This generally aligns with the documented icon scale, but there are a few places where similar UI patterns use different sizes:

- search adornments vary between `h-4 w-4` and `h-5 w-5`
  - `src/app/(shell)/movies/page.tsx`: `h-4 w-4`
  - `src/app/(shell)/admin/movies/components/MovieLibraryView.tsx`: `h-5 w-5`
  - `src/app/(shell)/admin/playground/components/VoiceSelector.tsx`: `h-4 w-4`
  - `src/app/(shell)/admin/movies/components/TmdbImportView.tsx`: both `h-5 w-5` and `h-4 w-4`

- a few compact action areas mix `h-3` and `h-3.5`
  - `src/app/project/[projectId]/compose/page.tsx`
  - `src/app/project/[projectId]/details/page.tsx`
  - `src/components/jobs/CompletedJobCard.tsx`
  - `src/app/(shell)/profile/page.tsx`

These are relatively small inconsistencies, but they are visible in dense admin and project workflow UIs.

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

#### 7. A few screens still hardcode large text utilities where role-based primitives would be clearer

The typography docs strongly prefer `Heading` roles over large one-off text utilities. Most of the app already follows that, but a few remaining cases stand out:

- `src/app/(shell)/referral/page.tsx`
  - stats use `text-2xl` directly on `<p>` elements
- allowlisted decorative exceptions remain:
  - `src/components/onboarding/CompletionStep.tsx` uses `text-3xl` for emoji
  - `src/app/(shell)/profile/page.tsx` uses `text-4xl` for avatar initials

The decorative cases match the docs. The referral stat cards are the clearest remaining non-allowlisted drift and would be better expressed with `Heading variant="metric"` or a shared stat-number style.

## Documentation accuracy check

### Accurate

The following documentation is accurate based on the current code:

- `docs/TYPOGRAPHY.md`
  - role-based type scale is implemented
  - `text-micro` allowlist language matches the remaining code
  - `Heading` / `Text` direction is correct

- `docs/TYPOGRAPHY_REFACTOR.md`
  - the remaining arbitrary text-size exceptions still match the documented allowlist

- `docs/LOADING_TODO.md`
  - spinner guidance matches `Spinner`, `LoadingSpinner`, and `Button`

- `docs/guides/DESIGN_SYSTEM.md` icon size tiers
  - the dominant icon sizes in code match the documented `xs`/`sm`/`md`/`lg`/`xl` scale

### Partially inaccurate or outdated

#### 1. `AGENTS.md` icon pointer is outdated

`AGENTS.md` says icon conventions live in `docs/ICONS.md`, but the actual icon guidance lives in:

- `docs/guides/DESIGN_SYSTEM.md`

No `docs/ICONS.md` file exists in the repo at the time of this audit.

#### 2. `docs/guides/DESIGN_SYSTEM.md` overstates component-library consistency

The document is useful as a standard, but several parts read more like a target state than the current implementation:

- It presents the UI library as the canonical component path.
- In practice, many app surfaces still use raw form elements and bespoke labels.
- It describes `Input & TextArea` and `Button` well, but does not reflect the extent of raw `<input>`, `<textarea>`, and `<select>` usage still present in route code.

#### 3. `docs/guides/DESIGN_SYSTEM.md` button variant list is outdated

The docs list:

- `primary`
- `secondary`
- `outline`
- `ghost`
- `danger`
- `success`

But `src/components/ui/button.tsx` currently also supports:

- `destructive`

#### 4. The docs imply stronger `Icon` wrapper adoption than the code shows

The icon section is technically correct that `Icon` is for nav and repeated dense-UI patterns, but the current implementation uses it only sparingly outside navigation-related surfaces. The wrapper exists and works, but it is **not yet the dominant pattern**.

## Recommended next steps

### Phase 1: document reality clearly

1. ~~Update `AGENTS.md` to point at `docs/guides/DESIGN_SYSTEM.md` instead of `docs/ICONS.md`.~~ Done (Aug 24, 2026).
2. ~~Update `docs/guides/DESIGN_SYSTEM.md`~~ Done in v2.4 (`destructive`, adoption gaps, token values).

### Phase 2: reduce real UI drift

1. Standardize selects first.
   - Replace repeated raw `<select>` implementations with the shared `Select` where practical.
   - Decide whether the product standard should be 36px-ish (`h-9`) or 44px-ish (`h-11`) for settings/forms.

2. Standardize textarea usage.
   - Create a clear rule for when to use shared `TextArea` versus intentionally custom editor-like textareas.
   - Likely exceptions: large script editors in project workflow pages.

3. Introduce a dedicated `Label` primitive or explicit label utility.
   - This would reduce repeated `text-body font-medium ...` and `text-caption uppercase ...` patterns.

4. Normalize search-field adornment sizes.
   - Pick one default for search inputs (`h-4 w-4` or `h-5 w-5`) and apply it consistently.

5. Migrate remaining stat-number one-offs to typography roles.
   - Start with `src/app/(shell)/referral/page.tsx`.

## Bottom line

The frontend is in **good shape on typography and general button sizing**, but **forms remain fragmented** and **icon standardization is only partially enforced**. The current documentation is mostly sound as a design target, but it should be updated to better reflect the real level of primitive adoption in the codebase today.
