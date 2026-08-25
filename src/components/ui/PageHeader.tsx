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
    <div className={cn("mb-4 sm:mb-8", className)}>
      {breadcrumbs && <div className="mb-4">{breadcrumbs}</div>}
      <div className="flex flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
        <div className="min-w-0 flex-1">
          {isStringTitle ? (
            <>
              <Heading variant="page" className="text-[var(--text-primary)]">
                {title}
              </Heading>
              {(description || meta) && (
                <div className="mt-1 sm:mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                  {description && (
                    <Text
                      variant="body"
                      as="span"
                      className="text-[var(--text-secondary)] line-clamp-2 sm:line-clamp-none"
                    >
                      {description}
                    </Text>
                  )}
                  {meta &&
                    (isStringMeta ? (
                      <span className="inline-flex shrink-0 rounded-full bg-accent-cyan/10 px-3 py-1.5 text-caption font-medium text-accent-cyan whitespace-nowrap">
                        {meta}
                      </span>
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
        {action && (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5 sm:gap-2 pt-0.5">
            {action}
          </div>
        )}
      </div>
    </div>
  );
};
