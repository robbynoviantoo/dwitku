"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CreditCard, Users, Shield, ArrowLeft, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

import { DatabaseExportModal } from "./database-export-modal";

interface AdminNavProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function AdminNav({ user }: AdminNavProps) {
  const pathname = usePathname();

  const navItems = [
    { href: "/admin", label: "Ringkasan", icon: LayoutDashboard, exact: true },
    { href: "/admin/plans", label: "Kelola Paket", icon: CreditCard },
    { href: "/admin/users", label: "Pengguna & Hak Akses", icon: Users },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/85 dark:bg-[#0d1117]/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-zinc-800/80 transition-colors">
      {/* Top Banner Alert */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-amber-500/20 px-4 py-1.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-semibold">
          <Shield className="w-3.5 h-3.5 text-amber-500" />
          <span>SUPER ADMIN CONSOLE</span>
          <span className="hidden sm:inline text-amber-600/75 dark:text-amber-400/70 font-normal">
            — Akses tingkat tinggi untuk manajemen sistem & langganan Dwitku
          </span>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300 hover:text-green-600 dark:hover:text-green-400 font-medium transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke App</span>
        </Link>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl lg:max-w-full mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link href="/admin" className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icon-192.png"
              alt="Dwitku"
              className="w-7 h-7 rounded-lg border border-slate-200 dark:border-zinc-700"
            />
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm text-zinc-900 dark:text-zinc-100 tracking-tight">
                Dwitku
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase tracking-wide">
                Admin
              </span>
            </div>
          </Link>

          {/* Nav Tabs */}
          <nav className="hidden sm:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                    isActive
                      ? "bg-green-600 text-white shadow-sm"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800/80"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Section: Database Export + User Info */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <DatabaseExportModal variant="nav" />

          <div className="text-right hidden md:block border-l border-slate-200 dark:border-zinc-800 pl-3">
            <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-none">
              {user.name || "Administrator"}
            </p>
            <p className="text-[10px] text-zinc-400 mt-0.5">{user.email}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold ring-2 ring-green-600/20 shrink-0">
            {user.name?.charAt(0).toUpperCase() || "A"}
          </div>
        </div>
      </div>

      {/* Mobile Nav Tabs */}
      <div className="sm:hidden flex items-center gap-1 px-3 py-1.5 border-t border-slate-100 dark:border-zinc-800/80 overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all shrink-0",
                isActive
                  ? "bg-green-600 text-white"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
              )}
            >
              <Icon className="w-3 h-3" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
}
