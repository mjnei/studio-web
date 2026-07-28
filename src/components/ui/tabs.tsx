"use client";

import * as React from "react";

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

const TabsContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
}>({
  value: "",
  onValueChange: () => {},
});

export function Tabs({ value, onValueChange, children, className = "" }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className = "" }: TabsListProps) {
  return (
    <div
      className={`inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground ${className}`}
      role="tablist"
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, className = "" }: TabsTriggerProps) {
  const context = React.useContext(TabsContext);
  const isActive = context.value === value;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => context.onValueChange(value)}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
        isActive
          ? "bg-background text-foreground shadow-sm"
          : "hover:bg-background/50 hover:text-foreground"
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className = "" }: TabsContentProps) {
  const context = React.useContext(TabsContext);
  const isActive = context.value === value;

  if (!isActive) return null;

  return <div className={className}>{children}</div>;
}
