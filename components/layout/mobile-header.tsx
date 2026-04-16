"use client";

import { Menu } from "lucide-react";
import { useSidebar } from "@/components/providers/sidebar-provider";

export function MobileHeader() {
  const { setMobileOpen } = useSidebar();

  return (
    <header className="md:hidden flex items-center justify-between h-14 px-4 sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-zinc-100 shadow-sm">
      {/* Hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="p-2 -ml-1 rounded-xl text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
        aria-label="Buka menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Logo */}
      <div className="flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src="/icon-192.png" 
          alt="Logo" 
          className="w-7 h-7 rounded-lg shadow-sm"
        />
        <span className="font-bold text-base text-zinc-900 tracking-tight">Dwitku</span>
      </div>

      {/* Spacer kanan (agar logo tetap center) */}
      <div className="w-9" />
    </header>
  );
}
