"use client";

import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  Sparkles,
  CreditCard,
  Building2,
} from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

export function LandingPreview() {
  const { locale } = useLanguage();

  return (
    <section id="preview" className="px-4 pb-24 max-w-6xl mx-auto">
      {/* Device Browser Frame with flat border */}
      <div className="bg-white dark:bg-[#161b22] rounded-3xl border border-slate-200 dark:border-[#21262d] overflow-hidden">
        {/* Frame Window Topbar */}
        <div className="h-10 bg-slate-50 dark:bg-zinc-800/60 border-b border-slate-100 dark:border-[#21262d] flex items-center px-4 gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 text-center font-mono text-[11px] text-zinc-400 select-none">
            https://dwitku.id/dashboard
          </div>
        </div>

        {/* Mock Application UI */}
        <div className="p-4 sm:p-6 lg:p-8 bg-slate-50/50 dark:bg-[#0d1117]/60 space-y-4">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200 dark:border-[#21262d] p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-50 dark:bg-green-950/60 flex items-center justify-center text-green-600 dark:text-green-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  {locale === "en" ? "Family Finance Workspace" : "Workspace Keuangan Keluarga"}
                </p>
                <p className="text-[10px] text-zinc-400">
                  {locale === "en" ? "4 active members · Synchronized" : "4 anggota aktif · Tersinkronisasi"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-green-50 dark:bg-green-950/60 text-green-700 dark:text-green-300 text-[10px] font-bold border border-green-200 dark:border-green-800">
                ● Live Sync
              </span>
            </div>
          </div>

          {/* 3 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200 dark:border-[#21262d] p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  {locale === "en" ? "Total Income" : "Total Pemasukan"}
                </span>
                <div className="w-6 h-6 rounded-lg bg-green-50 dark:bg-green-950/60 flex items-center justify-center text-green-600">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-lg font-extrabold font-mono text-green-600 dark:text-green-400">
                Rp 24.500.000
              </p>
            </div>

            <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200 dark:border-[#21262d] p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  {locale === "en" ? "Total Expense" : "Total Pengeluaran"}
                </span>
                <div className="w-6 h-6 rounded-lg bg-red-50 dark:bg-red-950/60 flex items-center justify-center text-red-500">
                  <TrendingDown className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-lg font-extrabold font-mono text-red-500 dark:text-red-400">
                Rp 8.750.000
              </p>
            </div>

            <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200 dark:border-[#21262d] p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  {locale === "en" ? "Net Cashflow" : "Arus Kas Bersih"}
                </span>
                <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
                  <Wallet className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-lg font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                +Rp 15.750.000
              </p>
            </div>
          </div>

          {/* Quick Wallets & Recent Stream */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Wallets */}
            <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200 dark:border-[#21262d] p-4">
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5 text-green-600" />
                {locale === "en" ? "Active Wallets" : "Dompet & Rekening"}
              </p>
              <div className="space-y-2">
                {[
                  { name: "Bank BCA Rekening Utama", bal: "Rp 12.450.000", tag: "Bank" },
                  { name: "Bank Mandiri Operasional", bal: "Rp 6.800.000", tag: "Bank" },
                  { name: "GoPay & e-Wallet", bal: "Rp 1.500.000", tag: "E-Wallet" },
                ].map((w) => (
                  <div
                    key={w.name}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-[#21262d] bg-slate-50/50 dark:bg-zinc-800/20"
                  >
                    <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                      {w.name}
                    </span>
                    <span className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {w.bal}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Transactions stream */}
            <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200 dark:border-[#21262d] p-4">
              <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-green-600" />
                {locale === "en" ? "Recent Activity" : "Aktivitas Transaksi"}
              </p>
              <div className="divide-y divide-slate-100 dark:divide-[#21262d]">
                {[
                  { name: "Honor Project Web Design", time: "10:30", amount: "+Rp 4.500.000", isInc: true },
                  { name: "Belanja Bulanan Supermarket", time: "08:15", amount: "-Rp 650.000", isInc: false },
                  { name: "Tagihan Listrik & WiFi", time: "Kemarin", amount: "-Rp 420.000", isInc: false },
                ].map((tx) => (
                  <div key={tx.name} className="py-2 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-zinc-800 dark:text-zinc-200">{tx.name}</p>
                      <p className="text-[10px] text-zinc-400">{tx.time}</p>
                    </div>
                    <span
                      className={`font-mono font-bold tabular-nums ${
                        tx.isInc ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"
                      }`}
                    >
                      {tx.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
