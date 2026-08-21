/**
 * Shared type-role class maps. Prefer these (or Heading / Text) over ad-hoc text-* sizes.
 * @see docs/guides/TYPOGRAPHY.md
 */
export const typography = {
  display: "text-3xl sm:text-4xl font-bold tracking-tight",
  page: "text-2xl sm:text-3xl font-bold tracking-tight",
  section: "text-xl font-semibold tracking-tight",
  subsection: "text-lg font-semibold tracking-tight",
  label: "text-sm font-semibold",
  metric: "text-2xl font-bold",
  body: "text-sm font-normal",
  bodyLg: "text-base font-normal",
  caption: "text-xs font-normal",
} as const;

export type TypographyRole = keyof typeof typography;
