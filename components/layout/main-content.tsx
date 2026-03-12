"use client";

import { useSidebar } from "@/components/providers/sidebar-provider";

export function MainContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <main
      style={{
        marginLeft: collapsed
          ? "var(--sidebar-collapsed-width)"
          : "var(--sidebar-width)",
        transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)",
        backgroundColor: "var(--bg-main)",
        minHeight: "100vh",
      }}
      className="flex-1 overflow-y-auto"
    >
      {children}
    </main>
  );
}
