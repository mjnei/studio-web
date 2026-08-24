import type { LabelHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";
import { typography } from "./typography";

export type LabelTone = "field" | "meta";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /** `field` = form labels (body, primary). `meta` = dense filter / definition labels (caption, muted). */
  tone?: LabelTone;
}

export function Label({ tone = "field", className, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        "block font-medium",
        tone === "meta"
          ? `${typography.caption} mb-1 text-text-muted`
          : `${typography.body} mb-2 text-text-primary`,
        className
      )}
      {...props}
    />
  );
}
