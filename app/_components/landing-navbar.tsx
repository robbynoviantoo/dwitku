"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/components/providers/language-provider";

export function LandingNavbar() {
  const { locale, setLocale } = useLanguage();
  const isEn = locale === "en";

  return (
    <div className="fixed top-5 left-0 right-0 z-50 px-4 pointer-events-none flex justify-center">
      <header className="pointer-events-auto w-full max-w-3xl bg-white/90 dark:bg-[#121619]/90 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 rounded-full py-2 px-3 sm:px-5 shadow-[0_12px_32px_-10px_rgba(0,0,0,0.12)] flex items-center justify-between transition-all">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group pl-1">
          <Image
            src="/icon-512.png"
            alt="Dwitku Logo"
            width={28}
            height={28}
            className="w-7 h-7 rounded-lg object-contain group-hover:scale-105 transition-transform"
            priority
          />
          <span className="font-extrabold text-sm sm:text-base tracking-tight text-zinc-950 dark:text-white font-sans">
            Dwitku<span className="text-[#004C29] dark:text-emerald-400">.</span>
          </span>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
          <a
            href="#preview"
            className="hover:text-[#004C29] dark:hover:text-white transition-colors"
          >
            {isEn ? "Dashboard" : "Dashboard"}
          </a>
          <a
            href="#features"
            className="hover:text-[#004C29] dark:hover:text-white transition-colors"
          >
            {isEn ? "Assets" : "Dompet & Aset"}
          </a>
          <a
            href="#pricing"
            className="hover:text-[#004C29] dark:hover:text-white transition-colors"
          >
            {isEn ? "Pricing" : "Paket Harga"}
          </a>
          <Link
            href="/guide"
            className="hover:text-[#004C29] dark:hover:text-white transition-colors"
          >
            {isEn ? "Guide" : "Panduan"}
          </Link>
        </nav>

        {/* Right Action & Language Switch */}
        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <button
            onClick={() => setLocale(locale === "id" ? "en" : "id")}
            className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full border border-slate-200 dark:border-white/15 bg-slate-100/80 dark:bg-white/5 text-zinc-700 dark:text-zinc-200 hover:bg-slate-200/80 transition-colors cursor-pointer"
          >
            {locale.toUpperCase()}
          </button>

          <Link
            href="/login"
            className="hidden sm:inline-flex px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors"
          >
            {isEn ? "Sign In" : "Masuk"}
          </Link>

          <Link
            href="/register"
            className="px-4 py-1.5 bg-[#004C29] hover:bg-[#003d21] text-white text-xs font-bold rounded-full transition-all active:scale-95 shadow-sm cursor-pointer"
          >
            <span>{isEn ? "Launch App" : "Buka App"}</span>
          </Link>
        </div>
      </header>
    </div>
  );
}
