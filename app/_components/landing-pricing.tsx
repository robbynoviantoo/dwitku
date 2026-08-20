"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

interface LandingPricingProps {
  dbPlans?: any[];
}

export function LandingPricing({ dbPlans }: LandingPricingProps) {
  const { locale } = useLanguage();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const isYearly = billingCycle === "yearly";

  // Ambil data plans dari database jika tersedia, atau fallback ke default
  const plans = (dbPlans && dbPlans.length > 0)
    ? dbPlans.map((p) => {
        const isFree = p.key === "free";
        const isBasic = p.key === "basic";
        const isPro = p.key === "pro";

        const currentPrice = isYearly ? p.priceYearly : p.priceMonthly;
        const formattedPrice = currentPrice === 0
          ? "Rp 0"
          : `Rp ${new Intl.NumberFormat("id-ID").format(currentPrice)}`;

        const period = currentPrice === 0
          ? (locale === "en" ? "forever" : "selamanya")
          : isYearly
          ? (locale === "en" ? "/ year" : "/ tahun")
          : (locale === "en" ? "/ month" : "/ bulan");

        const equivalentText = (isYearly && p.priceYearly > 0)
          ? (locale === "en"
              ? `Eqv. Rp ${new Intl.NumberFormat("id-ID").format(Math.round(p.priceYearly / 12))} / mo`
              : `Setara Rp ${new Intl.NumberFormat("id-ID").format(Math.round(p.priceYearly / 12))} / bulan`)
          : undefined;

        let name = p.name;
        if (isFree) name = locale === "en" ? "Free" : "Gratis";

        let desc = locale === "en" ? "Perfect for individual financial habits" : "Cocok untuk pencatatan keuangan pribadi harian";
        if (isBasic) desc = locale === "en" ? "For families, freelancers & micro businesses" : "Untuk keluarga, freelancer & UMKM mikro";
        if (isPro) desc = locale === "en" ? "For power users, communities & multi-business" : "Untuk power user, komunitas & multi-bisnis";

        let cta = isFree
          ? (locale === "en" ? "Start Free" : "Mulai Gratis")
          : isYearly
          ? (locale === "en" ? `Choose ${p.name} (Annual)` : `Pilih ${p.name} Tahunan`)
          : p.trialDays > 0
          ? (locale === "en" ? `Try ${p.trialDays} Days Free` : `Coba ${p.trialDays} Hari Gratis`)
          : (locale === "en" ? `Choose ${p.name}` : `Pilih ${p.name}`);

        const features = [
          p.maxWorkspaces === -1
            ? (locale === "en" ? "Unlimited Workspaces" : "Unlimited Workspace")
            : (locale === "en" ? `Up to ${p.maxWorkspaces} Workspaces` : `Hingga ${p.maxWorkspaces} Workspace`),
          p.maxTx === -1
            ? (locale === "en" ? "Unlimited Transactions" : "Unlimited Transaksi")
            : (locale === "en" ? `Max ${p.maxTx} transactions / month` : `Maksimal ${p.maxTx} transaksi / bulan`),
          p.maxMembers === -1
            ? (locale === "en" ? "Unlimited Team Members & Roles" : "Unlimited Anggota & Hak Akses Tim")
            : (locale === "en" ? `Collaborate up to ${p.maxMembers} Members` : `Kolaborasi hingga ${p.maxMembers} Anggota`),
          p.maxCategories === -1
            ? (locale === "en" ? "Unlimited Custom Categories & Wallets" : "Unlimited Kategori & Dompet")
            : (locale === "en" ? `${p.maxCategories} Custom categories` : `${p.maxCategories} Kategori kustom`),
        ];

        if (p.canExport) {
          features.push(locale === "en" ? "Excel & CSV data export" : "Ekspor data ke Excel & CSV (XLSX)");
        }
        if (p.canReport) {
          features.push(locale === "en" ? "Interactive monthly charts & analytics" : "Grafik & analitik keuangan bulanan");
        }
        if (p.canBudget) {
          features.push(locale === "en" ? "Budgeting & Financial Targets" : "Target & Anggaran Keuangan (Budget)");
        }
        if (isBasic) {
          features.push(locale === "en" ? "Sales & Cashier mode access" : "Akses mode penjualan / kasir (Sales)");
        }
        if (isPro) {
          features.push(locale === "en" ? "VIP Priority Support & Cloud Backup" : "Dukungan Prioritas VIP & Backup Cloud");
        }

        return {
          name,
          price: formattedPrice,
          period,
          equivalentText,
          desc,
          highlight: isBasic,
          badge: locale === "en" ? "POPULAR" : "POPULER",
          cta,
          ctaHref: isFree ? "/register" : `/register?plan=${p.key}&billing=${billingCycle}`,
          features,
        };
      })
    : [
        {
          name: locale === "en" ? "Free" : "Gratis",
          price: "Rp 0",
          period: locale === "en" ? "forever" : "selamanya",
          desc: locale === "en" ? "Perfect for testing & individual habit" : "Cocok untuk pencatatan keuangan pribadi harian",
          highlight: false,
          cta: locale === "en" ? "Start Free" : "Mulai Gratis",
          ctaHref: "/register",
          features: [
            locale === "en" ? "1 Personal Workspace" : "1 Workspace Pribadi",
            locale === "en" ? "Max 50 transactions / month" : "Maksimal 50 transaksi / bulan",
            locale === "en" ? "Up to 2 Wallets (Cash/Bank)" : "Manajemen 2 Dompet (Cash/Bank)",
            locale === "en" ? "3 Custom categories" : "Maksimal 3 kategori kustom",
            locale === "en" ? "Basic financial summary" : "Ringkasan keuangan dasar",
          ],
        },
        {
          name: "Basic",
          price: isYearly ? "Rp 240.000" : "Rp 25.000",
          period: isYearly ? (locale === "en" ? "/ year" : "/ tahun") : (locale === "en" ? "/ month" : "/ bulan"),
          equivalentText: isYearly ? (locale === "en" ? "Eqv. Rp 20,000 / mo" : "Setara Rp 20.000 / bulan") : undefined,
          desc: locale === "en" ? "For families, freelancers & micro businesses" : "Untuk keluarga, freelancer & UMKM mikro",
          highlight: true,
          badge: locale === "en" ? "POPULAR" : "POPULER",
          cta: isYearly
            ? (locale === "en" ? "Choose Basic (Annual)" : "Pilih Basic Tahunan")
            : (locale === "en" ? "Try 7 Days Free" : "Coba 7 Hari Gratis"),
          ctaHref: `/register?plan=basic&billing=${billingCycle}`,
          features: [
            locale === "en" ? "Up to 3 Workspaces" : "Hingga 3 Workspace",
            locale === "en" ? "Up to 500 transactions / month" : "Hingga 500 transaksi / bulan",
            locale === "en" ? "Collaborate up to 5 Members" : "Kolaborasi hingga 5 anggota tim",
            locale === "en" ? "15 Custom categories" : "15 Kategori kustom",
            locale === "en" ? "Excel & CSV data export" : "Ekspor data ke Excel & CSV (XLSX)",
            locale === "en" ? "Interactive monthly charts & analytics" : "Grafik & analitik keuangan bulanan",
            locale === "en" ? "Sales & Cashier mode access" : "Akses mode penjualan / kasir (Sales)",
          ],
        },
        {
          name: "Pro Unlimited",
          price: isYearly ? "Rp 470.000" : "Rp 49.000",
          period: isYearly ? (locale === "en" ? "/ year" : "/ tahun") : (locale === "en" ? "/ month" : "/ bulan"),
          equivalentText: isYearly ? (locale === "en" ? "Eqv. Rp 39,166 / mo" : "Setara Rp 39.166 / bulan") : undefined,
          desc: locale === "en" ? "For power users, communities & multi-business" : "Untuk power user, komunitas & multi-bisnis",
          highlight: false,
          cta: isYearly
            ? (locale === "en" ? "Choose Pro (Annual)" : "Pilih Pro Tahunan")
            : (locale === "en" ? "Upgrade to Pro" : "Pilih Paket Pro"),
          ctaHref: `/register?plan=pro&billing=${billingCycle}`,
          features: [
            locale === "en" ? "Unlimited Workspaces" : "Unlimited Workspace",
            locale === "en" ? "Unlimited Transactions" : "Unlimited Transaksi",
            locale === "en" ? "Unlimited Team Members & Roles" : "Unlimited Anggota & Hak Akses Tim",
            locale === "en" ? "Unlimited Custom Categories & Wallets" : "Unlimited Kategori & Dompet",
            locale === "en" ? "Deep Insights & Cashflow Projection" : "Deep Insights & Proyeksi Arus Kas",
            locale === "en" ? "Audit Log & Advanced Tax Summary" : "Audit Log & Rekap Laporan Pajak",
            locale === "en" ? "VIP Priority Support & Cloud Backup" : "Dukungan Prioritas VIP & Backup Cloud",
          ],
        },
      ];

  return (
    <section id="pricing" className="py-20 px-4 max-w-7xl mx-auto">
      <div className="text-center max-w-xl mx-auto mb-10">
        <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-widest mb-2">
          {locale === "en" ? "TRANSPARENT PRICING" : "PAKET BERLANGGANAN"}
        </p>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 dark:text-zinc-100 tracking-tight">
          {locale === "en"
            ? "Simple plans for every financial journey"
            : "Pilihan paket fleksibel dan terjangkau"}
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
          {locale === "en" ? "Upgrade or cancel anytime. No hidden fees." : "Upgrade atau batalkan kapan saja tanpa biaya tersembunyi."}
        </p>

        {/* Monthly vs Yearly Billing Toggle */}
        <div className="inline-flex items-center bg-slate-100 dark:bg-zinc-800 p-1 rounded-2xl border border-slate-200 dark:border-zinc-700 mt-6">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              billingCycle === "monthly"
                ? "bg-white dark:bg-[#161b22] text-zinc-900 dark:text-zinc-100 shadow-xs"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            {locale === "en" ? "Monthly" : "Bulanan"}
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("yearly")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              billingCycle === "yearly"
                ? "bg-green-600 text-white shadow-xs"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            <span>{locale === "en" ? "Yearly" : "Tahunan"}</span>
            <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
              billingCycle === "yearly" ? "bg-white/20 text-white" : "bg-green-500/15 text-green-700 dark:text-green-300"
            }`}>
              {locale === "en" ? "Save 20%" : "Hemat 20%"}
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
        {plans.map((plan, idx) => (
          <div
            key={idx}
            className={`rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all ${
              plan.highlight
                ? "bg-white dark:bg-[#161b22] border-2 border-green-600 dark:border-green-500 relative shadow-lg shadow-green-600/5"
                : "bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#21262d]"
            }`}
          >
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-green-600 text-white text-[10px] font-extrabold tracking-wider uppercase flex items-center gap-1 shadow-sm">
                <Sparkles className="w-3 h-3" />
                {plan.badge}
              </div>
            )}

            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {plan.name}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 mb-4 min-h-[32px]">
                {plan.desc}
              </p>

              <div className="mb-5 pb-5 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-black font-mono text-zinc-900 dark:text-zinc-100">
                    {plan.price}
                  </span>
                  <span className="text-xs font-semibold text-zinc-400">
                    {plan.period}
                  </span>
                </div>
                {plan.equivalentText && (
                  <p className="text-[11px] font-bold text-green-600 dark:text-green-400 mt-1">
                    {plan.equivalentText}
                  </p>
                )}
              </div>

              <div className="space-y-2.5 mb-6">
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
              className={`w-full py-2.5 text-center text-xs font-bold rounded-xl transition-all cursor-pointer ${
                plan.highlight
                  ? "bg-green-600 hover:bg-green-700 text-white active:scale-95 shadow-sm"
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

