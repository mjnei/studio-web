/**
 * Shared type-role class maps.
 *
 * TW4 automatically generates `text-{name}` and `leading-{name}` utility
 * classes from `--text-*` / `--leading-*` tokens defined in `@theme inline`
 * in globals.css. Editing a token there updates every component that uses
 * these strings — no per-component changes required.
 *
 * Prefer these (or Heading / Text) over ad-hoc text-* sizes.
 *
 * Legacy Tailwind → token mapping (do not use left column in new code):
 *   text-xs → text-caption   (12px)
 *   text-sm → text-body      (14px)
 *   text-base → text-body    (14px; was 16px pre-2026-08 scale)
 *   text-lg → text-metric     (18px)
 *   text-xl → text-page      (20px)
 *
 * @see docs/TYPOGRAPHY.md
 * @see docs/TYPOGRAPHY_REFACTOR.md
 */
export const typography = {
  display: "text-display sm:text-display-sm leading-display font-bold tracking-tight",
  page: "text-page sm:text-page-sm leading-page font-bold tracking-tight",
  section: "text-section leading-section font-semibold tracking-tight",
  subsection: "text-subsection leading-subsection font-semibold tracking-tight",
  label: "text-label leading-label font-semibold",
  metric: "text-metric leading-metric font-bold tabular-nums",
  body: "text-body leading-body font-normal",
  bodyLg: "text-body-lg leading-body font-normal",
  caption: "text-caption leading-caption font-normal",
} as const;

export type TypographyRole = keyof typeof typography;
