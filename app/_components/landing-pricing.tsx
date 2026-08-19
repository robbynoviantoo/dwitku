"use client";

import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

export function LandingPricing() {
  const { locale } = useLanguage();

  const plans = [
    {
      name: locale === "en" ? "Starter" : "Gratis",
      price: "Rp 0",
      period: locale === "en" ? "forever" : "selamanya",
      desc: locale === "en" ? "Perfect for testing & individual habit" : "Cocok untuk mencatat pribadi harian",
      highlight: false,
      cta: locale === "en" ? "Start Free" : "Mulai Gratis",
      ctaHref: "/register",
      features: [
        locale === "en" ? "Up to 2 Workspaces" : "Maksimal 2 Workspace",
        locale === "en" ? "Unlimited standard transactions" : "Pencatatan transaksi standar",
        locale === "en" ? "Multi-wallet management" : "Manajemen multi-dompet",
        locale === "en" ? "Basic financial reports" : "Laporan ringkasan dasar",
      ],
    },
    {
      name: "Pro Unlimited",
      price: "Rp 25.000",
      period: locale === "en" ? "/ month" : "/ bulan",
      desc: locale === "en" ? "For power users & collaborative teams" : "Untuk keluarga, bisnis, dan power user",
      highlight: true,
      cta: locale === "en" ? "Try 7 Days Free" : "Coba 7 Hari Gratis",
      ctaHref: "/register?plan=pro",
      features: [
        locale === "en" ? "Unlimited Workspaces & Members" : "Unlimited Workspace & Anggota Tim",
        locale === "en" ? "Futuristic Area & Donut Charts" : "Grafik & Analitik Keuangan Futuristik",
        locale === "en" ? "Instant Excel & CSV Data Export" : "Ekspor Data ke Excel & CSV",
        locale === "en" ? "Role-based access permissions" : "Hak akses Owner, Editor, Viewer",
        locale === "en" ? "Priority Cloud Backup & Support" : "Backup Cloud & Dukungan Prioritas",
      ],
    },
  ];

  return (
    <section id="pricing" className="py-20 px-4 max-w-5xl mx-auto">
      <div className="text-center max-w-xl mx-auto mb-14">
        <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-widest mb-2">
          {locale === "en" ? "TRANSPARENT PRICING" : "PAKET BERLANGGANAN"}
        </p>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 dark:text-zinc-100 tracking-tight">
          {locale === "en"
            ? "Simple plans for every financial journey"
            : "Pilihan paket fleksibel dan terjangkau"}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto items-stretch">
        {plans.map((plan, idx) => (
          <div
            key={idx}
            className={`rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all ${
              plan.highlight
                ? "bg-white dark:bg-[#161b22] border-2 border-green-600 dark:border-green-500 relative"
                : "bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#21262d]"
            }`}
          >
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-green-600 text-white text-[10px] font-extrabold tracking-wider uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {locale === "en" ? "MOST POPULAR" : "REKOMENDASI"}
              </div>
            )}

            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {plan.name}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-5">
                {plan.desc}
              </p>

              <div className="flex items-baseline gap-1.5 mb-6">
                <span className="text-3xl sm:text-4xl font-black font-mono text-zinc-900 dark:text-zinc-100">
                  {plan.price}
                </span>
                <span className="text-xs font-semibold text-zinc-400">
                  {plan.period}
                </span>
              </div>

              <div className="space-y-2.5 mb-8">
                {plan.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                    <div className="w-4 h-4 rounded-full bg-green-50 dark:bg-green-950/60 flex items-center justify-center text-green-600 shrink-0">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href={plan.ctaHref}
              className={`w-full py-3 text-center text-xs font-bold rounded-xl transition-all cursor-pointer ${
                plan.highlight
                  ? "bg-green-600 hover:bg-green-700 text-white active:scale-95"
                  : "bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700"
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
