/**
 * Heading — role-based heading component.
 *
 * Safe to use in React Server Components (no hooks, no event handlers).
 *
 * - `variant` controls visual size/weight (from typography.ts token map).
 * - `as`      controls the HTML element emitted (for a11y / document outline).
 *
 * The `label` variant defaults to `<p>` — it is intentionally NOT a heading
 * element by default because its visual size (text-sm) is often used for
 * dense UI chrome where the heading level should be explicit. Pass `as="h2"`
 * (or any level) when the label needs to appear in the document outline.
 *
 * @see docs/guides/TYPOGRAPHY.md
 */
import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { typography } from "./typography";

export type HeadingVariant = "display" | "page" | "section" | "subsection" | "label" | "metric";
export type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";

const defaultTag: Record<HeadingVariant, HeadingTag> = {
  display: "h1",
  page: "h1",
  section: "h2",
  subsection: "h3",
  // label intentionally defaults to <p>; add as="h2"|"h3" when heading
  // semantics are needed (see JSDoc above).
  label: "p",
  metric: "p",
};

export interface HeadingProps extends React.HTMLAttributes<HTMLElement> {
  variant?: HeadingVariant;
  as?: HeadingTag;
  children: React.ReactNode;
}

export function Heading({ variant = "section", as, className, children, ...props }: HeadingProps) {
  const Tag = as ?? defaultTag[variant];
  return (
    <Tag className={cn(typography[variant], className)} {...props}>
      {children}
    </Tag>
  );
}
