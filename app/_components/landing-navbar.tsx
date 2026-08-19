"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

export function LandingNavbar() {
  const { locale, setLocale } = useLanguage();

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#0d1117]/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-[#21262d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-[#004C29] flex items-center justify-center font-black text-white text-sm">
            D
          </div>
          <span className="font-extrabold text-lg tracking-tight text-zinc-900 dark:text-zinc-100 font-sans">
            Dwitku<span className="text-green-600 dark:text-green-400">.</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-7">
          <a
            href="#features"
            className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            {locale === "en" ? "Features" : "Fitur Unggulan"}
          </a>
          <a
            href="#preview"
            className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            {locale === "en" ? "App Interface" : "Tampilan"}
          </a>
          <a
            href="#pricing"
            className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            {locale === "en" ? "Pricing" : "Paket Harga"}
          </a>
          <a
            href="#testimonials"
            className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            {locale === "en" ? "Reviews" : "Testimoni"}
          </a>
        </nav>

        {/* Action & Language Toggle */}
        <div className="flex items-center gap-2.5">
          {/* Language Switcher */}
          <button
            onClick={() => setLocale(locale === "id" ? "en" : "id")}
            className="px-2.5 py-1 text-[11px] font-bold uppercase rounded-lg border border-slate-200 dark:border-[#21262d] bg-slate-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {locale.toUpperCase()}
          </button>

          <Link
            href="/login"
            className="hidden sm:inline-flex px-3.5 py-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            {locale === "en" ? "Sign In" : "Masuk"}
          </Link>

          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-95 shadow-none"
          >
            <span>{locale === "en" ? "Get Started" : "Mulai Gratis"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
