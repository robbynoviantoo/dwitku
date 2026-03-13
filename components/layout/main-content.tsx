"use client";

import { useSidebar } from "@/components/providers/sidebar-provider";
import { cn } from "@/lib/utils";
import { MobileHeader } from "./mobile-header";

export function MainContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <main
      style={{
        transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)",
        backgroundColor: "var(--bg-main)",
        minHeight: "100vh",
      }}
      className={cn(
        "flex-1 overflow-y-auto",
        "ml-0 ", // Default mobile
        collapsed
          ? "md:ml-(--sidebar-collapsed-width)"
          : "md:ml-(--sidebar-width)"
      )}
    >
      <MobileHeader />
      {children}
    </main>
  );
}
