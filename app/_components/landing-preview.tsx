"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Tag,
  BarChart2,
  Settings,
  Users,
  Plus,
  Shield,
  CreditCard,
  History,
  BookOpen,
  EyeOff,
  Bell,
  Moon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  PlusCircle,
  TrendingUp,
  TrendingDown,
  Building2,
} from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import gsap from "gsap";

export function LandingPreview() {
  const { locale } = useLanguage();
  const isEn = locale === "en";

  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!previewRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        previewRef.current,
        {
          y: 60,
          opacity: 0,
          scale: 0.97,
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1.0,
          ease: "power3.out",
          delay: 0.35,
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <section id="preview" className="px-4 pt-2 max-w-6xl mx-auto relative pb-0 mt-auto w-full shrink-0">
      {/* ── Centerpiece Tablet Device Showcase (Half-Cropped 100vh Fold) ── */}
      <div
        ref={previewRef}
        className="relative max-h-[300px] sm:max-h-[380px] md:max-h-[440px] lg:max-h-[480px] rounded-t-[32px] sm:rounded-t-[44px] rounded-b-none border-t-[6px] border-x-[6px] sm:border-t-[8px] sm:border-x-[8px] border-b-0 border-[#092317] dark:border-zinc-800 shadow-[0_-15px_60px_-15px_rgba(0,76,41,0.2)] dark:shadow-[0_-15px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden bg-[#fbfcfb] dark:bg-[#0f1419] will-change-transform select-none"
      >
        {/* Soft bottom gradient fade */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#f4f6f3] via-[#f4f6f3]/80 to-transparent dark:from-[#090d11] dark:via-[#090d11]/80 pointer-events-none z-30" />

        {/* Real Dwitku Application UI Structure */}
        <div className="flex min-h-[720px] text-zinc-900 dark:text-zinc-100 font-sans text-xs">
          {/* ── Left Sidebar (Dwitku Real Sidebar) ── */}
          <aside className="w-52 bg-white dark:bg-[#161b22] border-r border-slate-200/80 dark:border-zinc-800 hidden md:flex flex-col justify-between p-3.5 shrink-0">
            <div className="space-y-4">
              {/* Brand Logo */}
              <div className="flex items-center gap-2.5 px-2 py-1">
                <Image
                  src="/icon-512.png"
                  alt="Dwitku"
                  width={24}
                  height={24}
                  className="w-6 h-6 rounded-lg object-contain shadow-xs"
                />
                <span className="font-extrabold text-sm tracking-tight text-zinc-950 dark:text-white">
                  Dwitku
                </span>
              </div>

              {/* Workspace Selector */}
              <div className="space-y-1">
                <div className="px-2 py-1 flex items-center justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  <span>WORKSPACE</span>
                  <LayoutDashboard className="w-3 h-3" />
                </div>

                <div className="px-2.5 py-1.5 rounded-xl border border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-[#004C29] dark:text-emerald-400 font-extrabold text-[10px] flex items-center justify-center">
                      KK
                    </span>
                    <span className="font-bold text-[11px] text-zinc-800 dark:text-zinc-200">
                      Keuangan Keluarga
                    </span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-zinc-400" />
                </div>
              </div>

              {/* Workspace Navigation Links */}
              <nav className="space-y-0.5">
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#004C29] text-white font-bold text-[11px] shadow-xs">
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Summary</span>
                </div>
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-zinc-600 dark:text-zinc-400 font-medium text-[11px]">
                  <ArrowLeftRight className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Transactions</span>
                </div>
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-zinc-600 dark:text-zinc-400 font-medium text-[11px]">
                  <Wallet className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Wallets</span>
                </div>
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-zinc-600 dark:text-zinc-400 font-medium text-[11px]">
                  <Tag className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Categories</span>
                </div>
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-zinc-600 dark:text-zinc-400 font-medium text-[11px]">
                  <BarChart2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Reports</span>
                </div>
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-zinc-600 dark:text-zinc-400 font-medium text-[11px]">
                  <Settings className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Settings</span>
                </div>
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-zinc-600 dark:text-zinc-400 font-medium text-[11px]">
                  <Users className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Members</span>
                </div>
                <div className="flex items-center gap-2 px-2.5 py-1.5 text-emerald-700 dark:text-emerald-400 font-semibold text-[11px]">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Workspace</span>
                </div>
              </nav>
            </div>

            {/* Sidebar Bottom Nav */}
            <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 space-y-1 text-[11px] text-zinc-500">
              <div className="flex items-center gap-2 px-2 py-1">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Subscription</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>User Guide</span>
              </div>
            </div>
          </aside>

          {/* ── Main Dashboard Canvas ── */}
          <main className="flex-1 p-4 sm:p-5 lg:p-6 space-y-4 overflow-x-hidden bg-[#fbfcfb] dark:bg-[#0f1419]">
            {/* Top Greeting Header */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-emerald-600 font-bold text-sm">✳</span>
                  <h2 className="text-base sm:text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    Good Afternoon, ROBBY
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-[#004C29] dark:text-emerald-400 border border-emerald-500/20">
                    Keuangan Keluarga
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Here is your financial summary today.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-3.5 py-2 bg-[#004C29] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Catat Transaksi</span>
                </button>
              </div>
            </div>

            {/* ── Big Signature Net Balance Banner (#004C29 Grid) ── */}
            <div className="bg-gradient-to-r from-[#00381e] via-[#004C29] to-[#005a31] text-white p-5 rounded-3xl shadow-lg border border-emerald-600/30 relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Mesh background grid lines */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

              <div className="relative z-10 space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/20 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                  <span>Net Balance (All-time)</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-bold text-emerald-200">Rp</span>
                  <span className="text-2xl sm:text-3xl font-extrabold tracking-tight font-mono">
                    84.037.793
                  </span>
                </div>
              </div>

              <div className="relative z-10 flex items-center gap-6 sm:border-l sm:border-emerald-600/40 sm:pl-6">
                <div>
                  <p className="text-[10px] text-emerald-200 font-semibold flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-emerald-300" /> Total Income
                  </p>
                  <p className="text-sm font-bold font-mono text-white mt-0.5">Rp 12.500.000</p>
                </div>
                <div>
                  <p className="text-[10px] text-red-200 font-semibold flex items-center gap-1">
                    <TrendingDown className="w-3 h-3 text-red-300" /> Total Expense
                  </p>
                  <p className="text-sm font-bold font-mono text-red-100 mt-0.5">Rp 4.350.000</p>
                </div>
              </div>
            </div>

            {/* ── Main 2 Column Grid (Calendar vs Activity) ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* ── Financial Calendar (7/8 Cols) ── */}
              <div className="lg:col-span-8 bg-white dark:bg-[#161b22] p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-emerald-500/10 text-[#004C29] dark:text-emerald-400">
                      <CalendarIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                        Financial Calendar
                      </h3>
                      <p className="text-[10px] text-zinc-400">
                        Track your daily cashflow visually (Surplus / Deficit).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] font-bold">
                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                      Today
                    </span>
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-zinc-700">
                      <ChevronLeft className="w-3 h-3 text-zinc-400" />
                      <span>August 2026</span>
                      <ChevronRight className="w-3 h-3 text-zinc-400" />
                    </div>
                  </div>
                </div>

                {/* Calendar Days Header */}
                <div className="grid grid-cols-7 text-center text-[10px] font-bold text-zinc-400 pt-1 border-t border-slate-100 dark:border-zinc-800">
                  {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((d) => (
                    <div key={d} className="py-1">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Calendar Cells Matrix */}
                <div className="grid grid-cols-7 gap-1.5">
                  {/* Row 1 */}
                  <div className="h-10 rounded-xl border border-slate-100 dark:border-zinc-800/50 p-1 flex flex-col justify-between opacity-30 text-[10px]">28</div>
                  <div className="h-10 rounded-xl border border-slate-100 dark:border-zinc-800/50 p-1 flex flex-col justify-between opacity-30 text-[10px]">29</div>
                  <div className="h-10 rounded-xl border border-slate-100 dark:border-zinc-800/50 p-1 flex flex-col justify-between opacity-30 text-[10px]">30</div>
                  <div className="h-10 rounded-xl border border-slate-100 dark:border-zinc-800/50 p-1 flex flex-col justify-between opacity-30 text-[10px]">31</div>
                  <div className="h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-1 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300">1</span>
                    <span className="text-[8px] font-bold font-mono text-emerald-700 dark:text-emerald-400 text-right">+4.5M</span>
                  </div>
                  <div className="h-10 rounded-xl bg-red-500/10 border border-red-500/20 p-1 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-red-800 dark:text-red-300">2</span>
                    <span className="text-[8px] font-bold font-mono text-red-600 dark:text-red-400 text-right">-654k</span>
                  </div>
                  <div className="h-10 rounded-xl bg-red-500/10 border border-red-500/20 p-1 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-red-800 dark:text-red-300">3</span>
                    <span className="text-[8px] font-bold font-mono text-red-600 dark:text-red-400 text-right">-3M</span>
                  </div>

                  {/* Row 2 */}
                  <div className="h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-1 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300">4</span>
                    <span className="text-[8px] font-bold font-mono text-emerald-700 dark:text-emerald-400 text-right">+1M</span>
                  </div>
                  <div className="h-10 rounded-xl bg-red-500/10 border border-red-500/20 p-1 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-red-800 dark:text-red-300">5</span>
                    <span className="text-[8px] font-bold font-mono text-red-600 dark:text-red-400 text-right">-180k</span>
                  </div>
                  <div className="h-10 rounded-xl bg-red-500/10 border border-red-500/20 p-1 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-red-800 dark:text-red-300">6</span>
                    <span className="text-[8px] font-bold font-mono text-red-600 dark:text-red-400 text-right">-534k</span>
                  </div>
                  <div className="h-10 rounded-xl bg-red-500/10 border border-red-500/20 p-1 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-red-800 dark:text-red-300">7</span>
                    <span className="text-[8px] font-bold font-mono text-red-600 dark:text-red-400 text-right">-900k</span>
                  </div>
                  <div className="h-10 rounded-xl border border-slate-100 dark:border-zinc-800 p-1 text-[10px] font-bold text-zinc-400">8</div>
                  <div className="h-10 rounded-xl border border-slate-100 dark:border-zinc-800 p-1 text-[10px] font-bold text-zinc-400">9</div>
                  <div className="h-10 rounded-xl border border-slate-100 dark:border-zinc-800 p-1 text-[10px] font-bold text-zinc-400">10</div>

                  {/* Row 3 */}
                  <div className="h-10 rounded-xl bg-red-500/10 border border-red-500/20 p-1 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-red-800 dark:text-red-300">11</span>
                    <span className="text-[8px] font-bold font-mono text-red-600 dark:text-red-400 text-right">-3.9M</span>
                  </div>
                  <div className="h-10 rounded-xl border border-slate-100 dark:border-zinc-800 p-1 text-[10px] font-bold text-zinc-400">12</div>
                  <div className="h-10 rounded-xl border border-slate-100 dark:border-zinc-800 p-1 text-[10px] font-bold text-zinc-400">13</div>
                  <div className="h-10 rounded-xl bg-red-500/10 border border-red-500/20 p-1 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-red-800 dark:text-red-300">14</span>
                    <span className="text-[8px] font-bold font-mono text-red-600 dark:text-red-400 text-right">-479k</span>
                  </div>
                  <div className="h-10 rounded-xl border border-slate-100 dark:border-zinc-800 p-1 text-[10px] font-bold text-zinc-400">15</div>
                  <div className="h-10 rounded-xl bg-red-500/10 border border-red-500/20 p-1 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-red-800 dark:text-red-300">16</span>
                    <span className="text-[8px] font-bold font-mono text-red-600 dark:text-red-400 text-right">-7.5M</span>
                  </div>
                  <div className="h-10 rounded-xl border border-slate-100 dark:border-zinc-800 p-1 text-[10px] font-bold text-zinc-400">17</div>

                  {/* Row 4 (Today Highlight) */}
                  <div className="h-10 rounded-xl bg-emerald-500/15 border-2 border-emerald-500 p-1 flex flex-col justify-between shadow-xs">
                    <span className="text-[10px] font-black text-[#004C29] dark:text-emerald-400">18 ●</span>
                    <span className="text-[8px] font-bold font-mono text-[#004C29] dark:text-emerald-400 text-right">+2.4M</span>
                  </div>
                  <div className="h-10 rounded-xl border border-slate-100 dark:border-zinc-800 p-1 text-[10px] font-bold text-zinc-400">19</div>
                  <div className="h-10 rounded-xl bg-red-500/10 border border-red-500/20 p-1 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-red-800 dark:text-red-300">20</span>
                    <span className="text-[8px] font-bold font-mono text-red-600 dark:text-red-400 text-right">-290k</span>
                  </div>
                  <div className="h-10 rounded-xl border border-slate-100 dark:border-zinc-800 p-1 text-[10px] font-bold text-zinc-400">21</div>
                  <div className="h-10 rounded-xl border border-slate-100 dark:border-zinc-800 p-1 text-[10px] font-bold text-zinc-400">22</div>
                  <div className="h-10 rounded-xl border border-slate-100 dark:border-zinc-800 p-1 text-[10px] font-bold text-zinc-400">23</div>
                  <div className="h-10 rounded-xl border border-slate-100 dark:border-zinc-800 p-1 text-[10px] font-bold text-zinc-400">24</div>
                </div>
              </div>

              {/* ── Right Column: Recent Transactions & Wallets (4/12 Cols) ── */}
              <div className="lg:col-span-4 space-y-3">
                {/* Recent Transactions Card */}
                <div className="bg-white dark:bg-[#161b22] p-4 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                        Recent Transactions
                      </h4>
                      <p className="text-[10px] text-zinc-400">Recently recorded transactions</p>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 cursor-pointer">
                      View all &gt;
                    </span>
                  </div>

                  <div className="space-y-2 divide-y divide-slate-100 dark:divide-zinc-800/80">
                    <div className="pt-1.5 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-[11px] text-zinc-800 dark:text-zinc-200">
                          Honor Project Web
                        </p>
                        <p className="text-[9px] text-zinc-400">[BCA Utama] Aug 20</p>
                      </div>
                      <span className="font-mono font-bold text-[11px] text-emerald-600 dark:text-emerald-400">
                        +Rp 4.500.000
                      </span>
                    </div>

                    <div className="pt-1.5 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-[11px] text-zinc-800 dark:text-zinc-200">
                          Belanja Bulanan
                        </p>
                        <p className="text-[9px] text-zinc-400">[BCA Utama] Aug 20</p>
                      </div>
                      <span className="font-mono font-bold text-[11px] text-red-500 dark:text-red-400">
                        -Rp 650.000
                      </span>
                    </div>

                    <div className="pt-1.5 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-[11px] text-zinc-800 dark:text-zinc-200">
                          Tagihan Listrik & WiFi
                        </p>
                        <p className="text-[9px] text-zinc-400">[BCA Utama] Aug 20</p>
                      </div>
                      <span className="font-mono font-bold text-[11px] text-red-500 dark:text-red-400">
                        -Rp 420.000
                      </span>
                    </div>

                    <div className="pt-1.5 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-[11px] text-zinc-800 dark:text-zinc-200">
                          Gaji Karyawan
                        </p>
                        <p className="text-[9px] text-zinc-400">[BCA Utama] Aug 18</p>
                      </div>
                      <span className="font-mono font-bold text-[11px] text-emerald-600 dark:text-emerald-400">
                        +Rp 2.377.727
                      </span>
                    </div>
                  </div>
                </div>

                {/* My Wallets Card */}
                <div className="bg-white dark:bg-[#161b22] p-4 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5 text-[#004C29] dark:text-emerald-400" />
                      <span>My Wallets</span>
                    </h4>
                    <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 cursor-pointer">
                      Manage &gt;
                    </span>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 font-mono">
                        BCA
                      </span>
                      <span className="font-bold text-xs">BCA Rekening Utama</span>
                    </div>
                    <span className="font-mono font-bold text-xs text-zinc-900 dark:text-zinc-100">
                      Rp 84.037.793
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </section>
  );
}
