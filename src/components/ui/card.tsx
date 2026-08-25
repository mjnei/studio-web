import React from "react";
import { cn } from "@/lib/utils/cn";
import { Heading } from "./heading";
import { Text } from "./text";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "interactive" | "gradient";
  padding?: "none" | "sm" | "md" | "lg";
  interactive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    { className, variant = "default", padding = "md", interactive = false, children, ...props },
    ref
  ) => {
    const variants = {
      default: "bg-[var(--surface-raised)] border border-[var(--border-default)]",
      elevated:
        "bg-[var(--surface-elevated)] border border-[var(--border-default)] shadow-[var(--shadow-md)]",
      interactive:
        "bg-[var(--surface-raised)] border border-[var(--border-default)] hover:bg-[var(--surface-hover)] hover:border-[var(--border-strong)] transition-all duration-200 cursor-pointer",
      gradient:
        "bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] border-0 text-white",
    };

    const paddings = {
      none: "p-0",
      sm: "p-3 sm:p-4",
      md: "p-4 sm:p-6",
      lg: "p-6 sm:p-8",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl",
          interactive && !variant.includes("interactive")
            ? variants.interactive
            : variants[variant],
          paddings[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("card-header flex flex-col space-y-1.5", className)} {...props} />
  )
);

CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <Heading
    ref={ref as React.Ref<HTMLElement>}
    variant="section"
    as="h3"
    className={cn("leading-none", className)}
    {...props}
  >
    {children}
  </Heading>
));

CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => (
  <Text
    ref={ref as React.Ref<HTMLElement>}
    variant="body"
    as="p"
    className={cn("text-[var(--text-secondary)]", className)}
    {...props}
  >
    {children}
  </Text>
));

CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("pt-0 [.card-header+&]:pt-6", className)} {...props} />
  )
);

CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center pt-4", className)} {...props} />
  )
);

CardFooter.displayName = "CardFooter";
