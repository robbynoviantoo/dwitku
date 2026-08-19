"use client";

import {
  BarChart3,
  Users,
  ShieldCheck,
  Smartphone,
  Download,
  Zap,
  PiggyBank,
  Layers,
} from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

export function LandingFeatures() {
  const { locale } = useLanguage();

  const features = [
    {
      icon: BarChart3,
      title: locale === "en" ? "Futuristic Analytics" : "Analitik & Grafik Futuristik",
      desc:
        locale === "en"
          ? "Interactive area charts, cashflow trend flows, and automatic daily burn rate metrics."
          : "Grafik aliran kas interaktif, tren 6 bulan, dan penghitungan rasio tabungan otomatis.",
    },
    {
      icon: Users,
      title: locale === "en" ? "Collaborative Workspaces" : "Workspace Kolaboratif",
      desc:
        locale === "en"
          ? "Invite your partner or team with flexible roles: Owner, Editor, or Viewer."
          : "Ajak pasangan, keluarga, atau rekan tim dengan peran Owner, Editor, atau Viewer.",
    },
    {
      icon: Layers,
      title: locale === "en" ? "Multi-Account Wallets" : "Multi-Dompet & Rekening",
      desc:
        locale === "en"
          ? "Manage BCA, Mandiri, BRI, e-Wallets, or cash in one unified overview."
          : "Kelola bank BCA, Mandiri, BRI, e-Wallet, hingga kas tunai dalam satu layar.",
    },
    {
      icon: Smartphone,
      title: locale === "en" ? "PWA & Offline Ready" : "Mobile First & PWA",
      desc:
        locale === "en"
          ? "Install on iOS & Android just like a native app with ultra smooth pull-to-refresh."
          : "Pasang di ponsel layaknya aplikasi native dengan interaksi gesture dan pull-to-refresh.",
    },
    {
      icon: Download,
      title: locale === "en" ? "Instant Data Export" : "Ekspor Excel & CSV",
      desc:
        locale === "en"
          ? "Download comprehensive transaction records anytime with a single tap."
          : "Unduh seluruh riwayat pembukuan ke format Excel kapanpun kamu membutuhkannya.",
    },
    {
      icon: ShieldCheck,
      title: locale === "en" ? "Zero Shadow Clean UI" : "Estetika Modern & Flat",
      desc:
        locale === "en"
          ? "Designed for productivity with clean borders, vibrant accents, and dark mode."
          : "Dirancang bersih, cepat, tanpa bayangan kotor, dan nyaman di mata (Dark Mode ready).",
    },
  ];

  return (
    <section id="features" className="py-20 px-4 bg-slate-50/50 dark:bg-[#0d1117]/40 border-y border-slate-200/80 dark:border-[#21262d]">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-widest mb-2">
            {locale === "en" ? "POWERFUL CAPABILITIES" : "FITUR UTAMA"}
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 dark:text-zinc-100 tracking-tight">
            {locale === "en"
              ? "Everything you need to master your money"
              : "Semua alat yang kamu butuhkan dalam satu genggaman"}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-2">
            {locale === "en"
              ? "Designed for high-speed tracking and seamless team coordination."
              : "Tidak ada lagi spreadsheet rumit atau catatan manual yang berserakan."}
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200 dark:border-[#21262d] p-6 hover:border-green-600/40 dark:hover:border-green-500/40 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-950/60 border border-green-200/60 dark:border-green-800/40 flex items-center justify-center text-green-600 dark:text-green-400 mb-4 group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1.5">
                  {f.title}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
