"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { Modal } from "./modal";
import { Heading } from "./heading";
import { typography } from "./typography";

export const AlertDialog = Modal;
export const AlertDialogContent = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const AlertDialogHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-4">{children}</div>
);
export const AlertDialogFooter = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center justify-end gap-3 mt-6">{children}</div>
);
export const AlertDialogTitle = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <Heading variant="section" as="h2" className={cn("text-text-primary", className)}>
    {children}
  </Heading>
);
export const AlertDialogDescription = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={cn(typography.body, "text-text-secondary mt-2", className)}>{children}</div>;
export const AlertDialogAction = ({
  children,
  onClick,
  disabled,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${className}`}
  >
    {children}
  </button>
);
export const AlertDialogCancel = ({
  children,
  onClick,
  disabled,
}: {
  children?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="px-4 py-2 rounded-lg font-medium border border-border-default hover:bg-surface-hover transition-colors disabled:opacity-50"
  >
    {children || "Cancel"}
  </button>
);
