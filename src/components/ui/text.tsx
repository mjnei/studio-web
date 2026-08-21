/**
 * Text — body / caption variant component.
 *
 * Safe to use in React Server Components (no hooks, no event handlers).
 * @see docs/TYPOGRAPHY.md
 */
import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { typography } from "./typography";

export type TextVariant = "body" | "bodyLg" | "caption";
export type TextTag = "p" | "span" | "div" | "label";

const defaultTag: Record<TextVariant, TextTag> = {
  body: "p",
  bodyLg: "p",
  caption: "span",
};

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TextVariant;
  as?: TextTag;
  children: React.ReactNode;
}

export function Text({ variant = "body", as, className, children, ...props }: TextProps) {
  const Tag = as ?? defaultTag[variant];
  return (
    <Tag className={cn(typography[variant], className)} {...props}>
      {children}
    </Tag>
  );
}
