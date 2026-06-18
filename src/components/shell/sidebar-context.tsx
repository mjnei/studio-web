"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

type SidebarContextValue = {
  collapsed: boolean;
  mobileOpen: boolean;
  toggle: () => void;
  setMobileOpen: (open: boolean) => void;
  isNarrow: boolean;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

const LG_BREAKPOINT = 1024;

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isNarrow, setIsNarrow] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${LG_BREAKPOINT - 1}px)`);
    const onChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const narrow = e.matches;
      setIsNarrow(narrow);
      if (!narrow) {
        setMobileOpen(false);
      }
    };
    onChange(mql);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  const toggle = useCallback(() => {
    if (isNarrow) {
      setMobileOpen((o) => !o);
    } else {
      setCollapsed((c) => !c);
    }
  }, [isNarrow]);

  return (
    <SidebarContext.Provider
      value={{ collapsed, mobileOpen, toggle, setMobileOpen, isNarrow }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
  return ctx;
}
