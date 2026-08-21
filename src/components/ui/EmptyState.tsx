import React from "react";
import { cn } from "@/lib/utils/cn";
import { Heading, type HeadingVariant } from "./heading";
import { Text, type TextVariant } from "./text";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  variant?: "default" | "bordered" | "elevated";
  size?: "sm" | "md" | "lg";
}

const sizeClasses: Record<
  NonNullable<EmptyStateProps["size"]>,
  {
    container: string;
    icon: string;
    titleVariant: HeadingVariant;
    descriptionVariant: TextVariant;
  }
> = {
  sm: {
    container: "py-8 px-4",
    icon: "h-10 w-10 mb-3",
    titleVariant: "label",
    descriptionVariant: "caption",
  },
  md: {
    container: "py-12 px-4",
    icon: "h-12 w-12 mb-4",
    titleVariant: "subsection",
    descriptionVariant: "body",
  },
  lg: {
    container: "py-16 px-4",
    icon: "h-16 w-16 mb-4",
    titleVariant: "section",
    descriptionVariant: "body",
  },
};

const variantClasses = {
  default: "",
  bordered: "rounded-2xl border border-dashed border-border-default bg-surface-panel/50",
  elevated: "rounded-2xl border border-border-default bg-surface-panel shadow-sm",
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
  variant = "default",
  size = "md",
}) => {
  const sizeConfig = sizeClasses[size];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        sizeConfig.container,
        variantClasses[variant],
        className
      )}
    >
      {icon && (
        <div
          className={cn(
            "flex items-center justify-center rounded-full bg-surface-raised text-text-muted opacity-50",
            sizeConfig.icon
          )}
        >
          {icon}
        </div>
      )}
      <Heading variant={sizeConfig.titleVariant} as="h3" className="text-text-primary mb-2">
        {title}
      </Heading>
      {description && (
        <Text variant={sizeConfig.descriptionVariant} className="text-text-secondary max-w-md mb-6">
          {description}
        </Text>
      )}
      {action && <div>{action}</div>}
    </div>
  );
};
