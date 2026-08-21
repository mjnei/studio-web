/**
 * Shared type-role class maps.
 *
 * TW4 automatically generates `text-{name}` and `leading-{name}` utility
 * classes from `--text-*` / `--leading-*` tokens defined in `@theme inline`
 * in globals.css. Editing a token there updates every component that uses
 * these strings — no per-component changes required.
 *
 * Prefer these (or Heading / Text) over ad-hoc text-* sizes.
 * @see docs/TYPOGRAPHY.md
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
