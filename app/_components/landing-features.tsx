"use client";

import { useRef, useEffect } from "react";
import {
  Sparkles,
  ChevronDown,
  TrendingUp,
  Wallet,
  Calendar,
  Building2,
  CreditCard,
  Smartphone,
  Banknote,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import gsap from "gsap";

export function LandingFeatures() {
  const { locale } = useLanguage();
  const isEn = locale === "en";

  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      // 1. Header Animation
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current.children,
          {
            y: 30,
            opacity: 0,
            filter: "blur(6px)",
          },
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.85,
            stagger: 0.1,
            ease: "power3.out",
            delay: 0.1,
          }
        );
      }

      // 2. Bento Cards Entrance Animation
      if (cardsRef.current) {
        gsap.fromTo(
          cardsRef.current.children,
          {
            y: 45,
            opacity: 0,
            scale: 0.97,
          },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.9,
            stagger: 0.15,
            ease: "power3.out",
            delay: 0.25,
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [locale]);

  return (
    <section
      ref={sectionRef}
      id="features"
      className="py-20 md:py-28 px-4 max-w-6xl mx-auto relative overflow-hidden"
    >
      {/* ── Section Header ────────────────────────────────────────── */}
      <div ref={headerRef} className="text-center max-w-3xl mx-auto mb-16 space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-[11px] font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider will-change-transform">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>{isEn ? "OUR FEATURES" : "FITUR UNGGULAN"}</span>
        </div>

        <h2 className="text-2xl sm:text-4xl md:text-[44px] font-medium tracking-tight text-zinc-950 dark:text-zinc-50 leading-tight will-change-transform">
          {isEn ? (
            <>
              All the Tools Finance Managers Require <br />
              <span className="font-extrabold text-[#004C29] dark:text-emerald-400">
                for Better Decision-Making
              </span>
            </>
          ) : (
            <>
              Seluruh Fitur Pembukuan Finansial <br />
              <span className="font-extrabold text-[#004C29] dark:text-emerald-400">
                untuk Pengambilan Keputusan Lebih Baik
              </span>
            </>
          )}
        </h2>

        <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto font-normal will-change-transform">
          {isEn
            ? "Optimize finances with real-time multi-wallet tracking and visual cashflow calendar."
            : "Optimalkan keuangan pribadi dan tim dengan pencatatan multi-dompet dan kalender arus kas visual."}
        </p>
      </div>

      {/* ── 2 Large Dribbble Glass Bento Cards ────────────────────── */}
      <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* ── Card 1: Multi-Dompet & Rekening Bank ── */}
        <div className="bg-white/90 dark:bg-[#161b22]/90 p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] border border-slate-200/90 dark:border-zinc-800 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] flex flex-col justify-between gap-8 backdrop-blur-xl group hover:border-emerald-500/40 transition-all hover:shadow-[0_25px_70px_-15px_rgba(0,76,41,0.12)]">
          {/* Inner UI Preview */}
          <div className="bg-slate-50 dark:bg-[#0f1419] p-5 rounded-3xl border border-slate-100 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400 font-medium">
                  {isEn ? "Total Balance (All Wallets)" : "Total Saldo (Semua Dompet)"}
                </p>
                <p className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white mt-1 font-mono">
                  Rp 84.037.793
                </p>
                <p className="text-[11px] text-[#004C29] dark:text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" />
                  <span>{isEn ? "12.4% vs last month" : "12.4% vs bulan lalu"}</span>
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-800 px-3 py-1 rounded-full text-xs font-bold text-zinc-700 dark:text-zinc-300 shadow-xs border border-slate-100 dark:border-zinc-700">
                <span>🇮🇩 IDR</span>
                <ChevronDown className="w-3 h-3 text-zinc-400" />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200/60 dark:border-zinc-800">
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  {isEn ? "My Wallets & Accounts" : "Daftar Rekening & Dompet"}
                </span>
                <span className="text-[#004C29] dark:text-emerald-400 font-semibold cursor-pointer">
                  {isEn ? "See all" : "Lihat semua"}
                </span>
              </div>

              {/* 4 Realistic Dwitku Wallets */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-2xl bg-white dark:bg-zinc-800/80 border border-slate-100 dark:border-zinc-700/60 space-y-1 shadow-xs hover:border-emerald-500/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500" /> BCA Utama
                    </span>
                    <span className="text-[9px] text-emerald-700 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded-full">
                      Active
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold font-mono text-zinc-900 dark:text-zinc-100">
                    Rp 45.200.000
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-white dark:bg-zinc-800/80 border border-slate-100 dark:border-zinc-700/60 space-y-1 shadow-xs hover:border-emerald-500/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-yellow-500" /> Bank Mandiri
                    </span>
                    <span className="text-[9px] text-emerald-700 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded-full">
                      Active
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold font-mono text-zinc-900 dark:text-zinc-100">
                    Rp 28.500.000
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-white dark:bg-zinc-800/80 border border-slate-100 dark:border-zinc-700/60 space-y-1 shadow-xs hover:border-emerald-500/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-500" /> GoPay e-Wallet
                    </span>
                    <span className="text-[9px] text-emerald-700 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded-full">
                      Active
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold font-mono text-zinc-900 dark:text-zinc-100">
                    Rp 2.850.000
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-white dark:bg-zinc-800/80 border border-slate-100 dark:border-zinc-700/60 space-y-1 shadow-xs hover:border-emerald-500/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> Kas Tunai (Cash)
                    </span>
                    <span className="text-[9px] text-emerald-700 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded-full">
                      Active
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold font-mono text-zinc-900 dark:text-zinc-100">
                    Rp 7.487.793
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2 text-center">
            <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-zinc-50">
              {isEn ? "Multi-Wallet Management" : "Manajemen Multi-Dompet & Rekening"}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-md mx-auto font-normal">
              {isEn
                ? "Manage bank accounts, digital wallets, and petty cash seamlessly in one central workspace."
                : "Kelola berbagai rekening bank, e-wallet, dan pos kas dalam satu workspace terpusat tanpa batas."}
            </p>
          </div>
        </div>

        {/* ── Card 2: Kalender Finansial & Surplus Defisit Matrix ── */}
        <div className="bg-white/90 dark:bg-[#161b22]/90 p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] border border-slate-200/90 dark:border-zinc-800 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] flex flex-col justify-between gap-8 backdrop-blur-xl group hover:border-emerald-500/40 transition-all hover:shadow-[0_25px_70px_-15px_rgba(0,76,41,0.12)]">
          {/* Inner UI Preview */}
          <div className="bg-slate-50 dark:bg-[#0f1419] p-5 rounded-3xl border border-slate-100 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400 font-medium">
                  {isEn ? "Monthly Cashflow Status" : "Status Arus Kas Bulan Ini"}
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#004C29] dark:text-emerald-400 font-mono">
                    +Rp 8.150.000
                  </span>
                  <span className="text-xs text-emerald-700 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    Surplus
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-800 px-3 py-1 rounded-full text-xs font-bold text-zinc-700 dark:text-zinc-300 shadow-xs border border-slate-100 dark:border-zinc-700">
                <span>{isEn ? "Monthly" : "Bulanan"}</span>
                <ChevronDown className="w-3 h-3 text-zinc-400" />
              </div>
            </div>

            {/* Heatmap Activity Matrix */}
            <div className="pt-3 border-t border-slate-200/60 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300">
                  {isEn ? "Daily Cashflow Intensity" : "Intensitas Arus Kas Harian"}
                </span>
                <div className="flex items-center gap-3 text-[10px] font-mono">
                  <span className="flex items-center gap-1 text-[#004C29] dark:text-emerald-400 font-bold">
                    <span className="w-2 h-2 rounded bg-[#004C29] dark:bg-emerald-400" /> Surplus
                  </span>
                  <span className="flex items-center gap-1 text-red-500 font-bold">
                    <span className="w-2 h-2 rounded bg-red-400" /> Defisit
                  </span>
                </div>
              </div>

              {/* 4x12 Cashflow Intensity Grid */}
              <div className="grid grid-cols-12 gap-1.5 sm:gap-2">
                {Array.from({ length: 48 }).map((_, i) => {
                  const pattern = (i * 7 + 3) % 6;
                  let bgClass = "bg-slate-200 dark:bg-zinc-800";
                  if (pattern === 1) bgClass = "bg-[#004C29] dark:bg-emerald-500";
                  if (pattern === 2) bgClass = "bg-[#00703c] dark:bg-emerald-600";
                  if (pattern === 3) bgClass = "bg-red-400/80 dark:bg-red-500/80";
                  if (pattern === 4) bgClass = "bg-emerald-300 dark:bg-emerald-700";
                  if (pattern === 5) bgClass = "bg-red-300 dark:bg-red-900/50";

                  return (
                    <div
                      key={i}
                      className={`h-5 sm:h-6 rounded-lg ${bgClass} transition-transform hover:scale-125 cursor-pointer shadow-2xs`}
                    />
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 pt-1">
                {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(
                  (m) => (
                    <span key={m}>{m}</span>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2 text-center">
            <h3 className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-zinc-50">
              {isEn ? "Cashflow Calendar & Insights" : "Kalender Finansial & Arus Kas"}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-md mx-auto font-normal">
              {isEn
                ? "Track daily surplus and deficit at a glance with visual matrix calendars for smarter budgeting."
                : "Pantau surplus dan defisit harian secara visual untuk mengontrol pengeluaran dan merencanakan tabungan lebih cerdas."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
