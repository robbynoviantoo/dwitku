"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, Eye, EyeOff, Sun, Moon } from "lucide-react";
import { useSidebar } from "@/components/providers/sidebar-provider";
import { usePrivacy } from "@/components/providers/privacy-provider";
import { useTheme } from "@/components/providers/theme-provider";

export function MobileHeader() {
  const { setMobileOpen } = useSidebar();
  const { showAmount, toggleShowAmount } = usePrivacy();
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="md:hidden flex items-center justify-between h-14 px-3.5 sticky top-0 z-30 bg-white/85 dark:bg-[#0d1117]/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-zinc-800/80 transition-colors">
      {/* Hamburger menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100/80 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-200 hover:bg-slate-200/90 dark:hover:bg-zinc-700/90 transition-all active:scale-95 cursor-pointer border border-slate-200/60 dark:border-zinc-700/50"
        aria-label="Buka menu"
      >
        <Menu className="w-4.5 h-4.5" />
      </button>

      {/* Brand logo & name */}
      <Link
        href="/dashboard"
        className="flex items-center gap-2 px-2 py-1 rounded-xl hover:opacity-85 transition-opacity"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icon-192.png"
          alt="Dwitku Logo"
          className="w-7 h-7 rounded-lg border border-slate-200/60 dark:border-zinc-700/60"
        />
        <span className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 tracking-tight">
          Dwitku
        </span>
      </Link>

      {/* Right side utility buttons: Privacy & Theme toggle */}
      <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-100/80 dark:bg-zinc-800/80 border border-slate-200/60 dark:border-zinc-700/50">
        <button
          onClick={toggleShowAmount}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-white dark:hover:bg-zinc-700 transition-all active:scale-95 cursor-pointer"
          aria-label={showAmount ? "Sembunyikan nominal" : "Tampilkan nominal"}
          title={showAmount ? "Sembunyikan nominal" : "Tampilkan nominal"}
        >
          {showAmount ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
        </button>

        <button
          onClick={toggleTheme}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-white dark:hover:bg-zinc-700 transition-all active:scale-95 cursor-pointer"
          aria-label="Ganti tema"
          title="Ganti tema"
        >
          {mounted && theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>
      </div>
    </header>
  );
}
