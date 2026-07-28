import React from "react";
import { cn } from "@/lib/utils/cn";

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
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
                {title}
              </h1>
              {description && (
                <p className="mt-2 text-sm sm:text-base text-[var(--text-secondary)]">
                  {description}
                </p>
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
