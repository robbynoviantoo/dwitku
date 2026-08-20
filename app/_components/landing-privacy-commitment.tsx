"use client";

import Link from "next/link";
import {
  ShieldCheck,
  EyeOff,
  Server,
  Cpu,
  Lock,
  ArrowRight,
  Shield,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

export function LandingPrivacyCommitment() {
  const { locale } = useLanguage();
  const isEn = locale === "en";

  const pillars = [
    {
      icon: EyeOff,
      badge: isEn ? "ZERO HUMAN INSPECTION" : "LARANGAN MENGINTIP",
      badgeColor: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
      title: isEn
        ? "Zero Human Inspection Policy"
        : "Larangan Mengintip (Zero Human Inspection)",
      desc: isEn
        ? "Platform owners, developers, and Dwitku admin staff will NEVER read, inspect, monitor, or analyze your transaction details, wallet balances, or personal expense descriptions."
        : "Pemilik platform, pengembang, maupun staf admin Dwitku TIDAK AKAN PERNAH membaca, memeriksa, memantau, atau menganalisis rincian transaksi, saldo dompet, maupun nama-nama pengeluaran pribadi Anda.",
    },
    {
      icon: Server,
      badge: isEn ? "ACCESS ISOLATION" : "PEMISAHAN AKSES",
      badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      title: isEn
        ? "Architectural Access Separation"
        : "Pemisahan Akses Arsitektural",
      desc: isEn
        ? "The Dwitku admin console is strictly designed for server telemetry, subscription statuses, and account maintenance. There is zero menu or interface in the admin panel capable of viewing user financial records."
        : "Panel admin Dwitku hanya berfungsi untuk memantau performa server, status langganan, dan pemeliharaan akun. Tidak ada menu atau antarmuka di panel admin yang menampilkan daftar catatan transaksi pengguna.",
    },
    {
      icon: Cpu,
      badge: isEn ? "AUTOMATED ALGORITHM" : "SISTEM OTOMATIS",
      badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      title: isEn
        ? "Pure Machine & Algorithmic Processing"
        : "Pemrosesan Otomatis Murni",
      desc: isEn
        ? "All balance calculations, cashflow charts, and category grouping are computed purely by automated machine algorithms without any human intervention."
        : "Seluruh kalkulasi saldo, pembuatan grafik arus kas, dan pengelompokan kategori diproses secara murni oleh sistem algoritma mesin tanpa campur tangan manusia.",
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-b from-slate-50/50 via-white to-slate-50/60 dark:from-[#0d1117] dark:via-[#11161d] dark:to-[#0d1117] relative overflow-hidden border-t border-slate-200/80 dark:border-zinc-800/80">
      {/* Background glowing aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* ── Section Header ────────────────────────────────────────── */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{isEn ? "100% Guaranteed Financial Privacy" : "Komitmen Keamanan & Privasi Terjamin"}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight uppercase">
            {isEn
              ? "OUR COMMITMENT TO YOUR FINANCIAL PRIVACY"
              : "KOMITMEN PERLINDUNGAN PRIVASI FINANSIAL ANDA"}
          </h2>

          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
            {isEn
              ? "We deeply understand that your financial figures, expense logs, and wallet balances are strictly confidential. Therefore, we enforce these uncompromising protection principles:"
              : "Kami sangat memahami bahwa nominal uang, catatan pengeluaran, dan saldo dompet Anda adalah informasi yang sangat rahasia. Oleh karena itu, kami menetapkan prinsip perlindungan ketat berikut:"}
          </p>
        </div>

        {/* ── 3 Core Privacy Pillars ────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="relative bg-white dark:bg-[#161b22] p-6 sm:p-8 rounded-3xl border border-slate-200/90 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between gap-6 group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border uppercase tracking-wider ${pillar.badgeColor}`}
                    >
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                    {pillar.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{isEn ? "Strictly Enforced" : "Diterapkan Tanpa Kompromi"}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Trust Banner & CTA ────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-emerald-900 via-[#004C29] to-emerald-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8 border border-emerald-700/40">
          {/* Decorative watermark */}
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-12 translate-y-12">
            <Shield className="w-80 h-80 text-white" />
          </div>

          <div className="space-y-3 max-w-2xl text-center lg:text-left relative z-10">
            <div className="flex items-center justify-center lg:justify-start gap-2 text-emerald-300 font-bold text-xs uppercase tracking-wider">
              <Lock className="w-4 h-4" />
              <span>{isEn ? "Enterprise Grade Encryption" : "Enkripsi Standar Perbankan"}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">
              {isEn
                ? "Your Financial Privacy is Non-Negotiable"
                : "Keuangan Anda adalah Rahasia Pribadi Anda Sepenuhnya"}
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100/85 leading-relaxed">
              {isEn
                ? "Experience complete peace of mind while tracking income, expenses, and managing collaborative workspaces."
                : "Nikmati ketenangan penuh saat mencatat pemasukan, mengontrol pengeluaran, dan berkolaborasi tanpa rasa khawatir data Anda bocor atau dipantau."}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 relative z-10 w-full lg:w-auto">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-emerald-950 hover:bg-emerald-50 text-xs sm:text-sm font-bold shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <span>{isEn ? "Start with Peace of Mind" : "Mulai dengan Tenang"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/privacy"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-emerald-800/60 hover:bg-emerald-800/90 text-white border border-emerald-600/40 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>{isEn ? "Privacy Policy" : "Kebijakan Privasi"}</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
