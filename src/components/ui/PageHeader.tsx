import React from "react";
import { cn } from "@/lib/utils/cn";
import { Heading } from "./heading";
import { Text } from "./text";

interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  action,
  breadcrumbs,
  className,
}) => {
  const isStringTitle = typeof title === "string";

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
              {description && (
                <Text variant="body" className="mt-2 text-[var(--text-secondary)]">
                  {description}
                </Text>
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
