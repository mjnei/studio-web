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
  label: "h3",
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
