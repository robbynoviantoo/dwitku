"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, Zap, Users2 } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

export function LandingHero() {
  const { locale } = useLanguage();

  return (
    <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 px-4 overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-green-500/10 dark:bg-green-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto text-center">
        {/* Floating Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-green-50 dark:bg-green-950/60 border border-green-200/80 dark:border-green-800/60 text-green-700 dark:text-green-300 text-xs font-bold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-green-600" />
          <span>
            {locale === "en"
              ? "Next-Gen Multi-Workspace Finance Platform"
              : "Platform Keuangan Multi-Workspace Generasi Baru"}
          </span>
        </div>

        {/* Hero Title with High-Impact Typography */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-zinc-950 dark:text-zinc-50 leading-[1.08] mb-6 font-sans">
          {locale === "en" ? (
            <>
              Master your wealth, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#004C29] via-green-600 to-emerald-500 dark:from-green-400 dark:to-emerald-300">
                seamlessly & collaborative.
              </span>
            </>
          ) : (
            <>
              Kelola uangmu, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#004C29] via-green-600 to-emerald-500 dark:from-green-400 dark:to-emerald-300">
                bersama & tanpa batas.
              </span>
            </>
          )}
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base md:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-9 leading-relaxed font-normal">
          {locale === "en"
            ? "Unified tracking for cashflows, smart multi-wallet balances, and real-time collaborative workspaces with zero clutter."
            : "Catat arus kas masuk & keluar, pantau saldo multi-dompet real-time, dan undang pasangan atau tim untuk mencatat bersama tanpa ribet."}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
          <Link
            href="/register"
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all active:scale-95 text-xs cursor-pointer shadow-none"
          >
            <span>{locale === "en" ? "Start Free Now" : "Mulai Gratis Sekarang"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#21262d] text-zinc-800 dark:text-zinc-200 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all text-xs cursor-pointer"
          >
            {locale === "en" ? "Sign In" : "Masuk ke Akun"}
          </Link>
        </div>

        {/* Trust Points */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-zinc-400 text-xs font-semibold">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            {locale === "en" ? "Bank-Grade Encryption" : "Enkripsi Aman"}
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-green-600" />
            {locale === "en" ? "Ultra Fast UI" : "Super Cepat & Ringan"}
          </span>
          <span className="flex items-center gap-1.5">
            <Users2 className="w-4 h-4 text-green-600" />
            {locale === "en" ? "Multi-Member Ready" : "Kolaborasi Instan"}
          </span>
        </div>
      </div>
    </section>
  );
}
