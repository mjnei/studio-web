import React from "react";
import { cn } from "@/lib/utils/cn";
import { Heading } from "./heading";
import { Text } from "./text";

interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Count or other status text under the title — not action chrome. */
  meta?: React.ReactNode;
  action?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  meta,
  action,
  breadcrumbs,
  className,
}) => {
  const isStringTitle = typeof title === "string";
  const isStringMeta = typeof meta === "string";

  return (
    <div className={cn("mb-6 sm:mb-8", className)}>
      {breadcrumbs && <div className="mb-4">{breadcrumbs}</div>}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          {isStringTitle ? (
            <>
              <Heading variant="page" className="text-[var(--text-primary)]">
                {title}
              </Heading>
              {(description || meta) && (
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                  {description && (
                    <Text variant="body" as="span" className="text-[var(--text-secondary)]">
                      {description}
                    </Text>
                  )}
                  {meta &&
                    (isStringMeta ? (
                      <Text variant="caption" as="span" className="text-[var(--text-muted)]">
                        {meta}
                      </Text>
                    ) : (
                      <span className="inline-flex shrink-0">{meta}</span>
                    ))}
                </div>
              )}
            </>
          ) : (
            <div>{title}</div>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  );
};
