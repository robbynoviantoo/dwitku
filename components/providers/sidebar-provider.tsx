"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface SidebarContextValue {
  collapsed: boolean;
  toggleCollapsed: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextValue>({
  collapsed: false,
  toggleCollapsed: () => { },
  mobileOpen: false,
  setMobileOpen: () => { },
});

export function SidebarProvider({
  children,
  defaultCollapsed = false,
}: {
  children: React.ReactNode;
  defaultCollapsed?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const match = document.cookie.match(/(^| )sidebar_collapsed=([^;]+)/);
    if (match) {
      const val = match[2] === "1" || match[2] === "true";
      if (val !== collapsed) setCollapsed(val);
    } else {
      const stored = localStorage.getItem("sidebar-collapsed");
      if (stored === "true" || stored === "false") {
        const val = stored === "true";
        if (val !== collapsed) {
          setCollapsed(val);
          document.cookie = `sidebar_collapsed=${val ? "1" : "0"}; path=/; max-age=31536000; SameSite=Lax`;
        }
      }
    }
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar-collapsed", String(next));
      document.cookie = `sidebar_collapsed=${next ? "1" : "0"}; path=/; max-age=31536000; SameSite=Lax`;
      return next;
    });
  };

  return (
    <SidebarContext.Provider
      value={{ collapsed, toggleCollapsed, mobileOpen, setMobileOpen }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
