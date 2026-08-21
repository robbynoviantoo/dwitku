import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Users,
  CreditCard,
  BarChart3,
  Building2,
  Crown,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Clock,
  XCircle,
  ScanLine,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

import { DatabaseExportModal } from "./_components/database-export-modal";

export const metadata = {
  title: "Admin Dashboard — Dwitku",
};

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.isAdmin) redirect("/workspaces");

  const [
    totalUsers,
    totalWorkspaces,
    totalTx,
    plans,
    subscriptions,
    successfulPayments,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.workspace.count(),
    prisma.transaction.count(),
    prisma.plan.findMany({
      include: {
        _count: {
          select: {
            subscriptions: {
              where: { status: "ACTIVE" },
            },
          },
        },
      },
      orderBy: { priceMonthly: "asc" },
    }),
    prisma.subscription.findMany({
      include: {
        plan: true,
        user: { select: { id: true, name: true, email: true, image: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 15,
    }),
    prisma.payment.aggregate({
      where: { status: "SUCCESS" },
      _sum: { amount: true },
      _count: { id: true },
    }),
  ]);

  // Calculate MRR (Monthly Recurring Revenue) from active paid subscriptions
  const activePaidSubs = subscriptions.filter(
    (s) => s.status === "ACTIVE" && s.plan.priceMonthly > 0
  );
  
  const mrr = plans.reduce((acc, p) => {
    return acc + (p.priceMonthly * (p._count?.subscriptions || 0));
  }, 0);

  const activeSubsCount = subscriptions.filter((s) => s.status === "ACTIVE").length;
  const trialSubsCount = subscriptions.filter((s) => s.status === "TRIAL").length;
  const totalRevenue = successfulPayments._sum.amount ?? 0;

  // AI OCR Config
  const aiOcrProvider = process.env.AI_OCR_PROVIDER || null;
  const geminiKey = process.env.GEMINI_API_KEY ? "configured" : null;
  const openaiKey = process.env.OPENAI_API_KEY ? "configured" : null;
  const groqKey = process.env.GROQ_API_KEY ? "configured" : null;
  const geminiModel = process.env.GEMINI_OCR_MODEL || "gemini-2.5-flash";
  const openaiModel = process.env.OPENAI_OCR_MODEL || "gpt-4o-mini";
  const groqModel = process.env.GROQ_OCR_MODEL || "llama-3.2-11b-vision-preview";

  const PROVIDER_META = {
    gemini: { label: "Google Gemini", badge: "Gratis", docsUrl: "https://aistudio.google.com/", keyConfigured: !!geminiKey, model: geminiModel },
    openai: { label: "OpenAI GPT", badge: "Berbayar", docsUrl: "https://platform.openai.com/", keyConfigured: !!openaiKey, model: openaiModel },
    groq: { label: "Groq (LLaVA)", badge: "Beta", docsUrl: "https://console.groq.com/", keyConfigured: !!groqKey, model: groqModel },
  } as const;

  type ProviderKey = keyof typeof PROVIDER_META;
  const currentMeta = aiOcrProvider ? PROVIDER_META[aiOcrProvider as ProviderKey] : null;

  const STATUS_CONFIG: Record<
    string,
    { label: string; bg: string; text: string; icon: any }
  > = {
    ACTIVE: {
      label: "Aktif",
      bg: "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800",
      text: "text-emerald-700 dark:text-emerald-300",
      icon: CheckCircle2,
    },
    TRIAL: {
      label: "Trial",
      bg: "bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800",
      text: "text-blue-700 dark:text-blue-300",
      icon: Clock,
    },
    EXPIRED: {
      label: "Expired",
      bg: "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700",
      text: "text-zinc-600 dark:text-zinc-400",
      icon: XCircle,
    },
    CANCELLED: {
      label: "Cancelled",
      bg: "bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800",
      text: "text-red-700 dark:text-red-300",
      icon: XCircle,
    },
  };

  return (
    <div className="space-y-6">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
            <Crown className="w-6 h-6 text-amber-500" />
            <span>Ringkasan Eksekutif Admin</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Pantau pertumbuhan pengguna, pendapatan langganan (MRR), dan metrik sistem secara real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <DatabaseExportModal variant="button" />

          <Link
            href="/admin/plans"
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all flex items-center gap-1.5 shadow-xs"
          >
            <CreditCard className="w-3.5 h-3.5 text-green-600" />
            <span>Kelola Paket</span>
          </Link>
          <Link
            href="/admin/users"
            className="px-3.5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Kelola Pengguna</span>
          </Link>
        </div>
      </div>

      {/* Top 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MRR */}
        <div className="bg-white dark:bg-[#161b22] p-5 rounded-2xl border border-slate-200 dark:border-[#21262d] shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Estimasi MRR
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black font-mono text-zinc-900 dark:text-zinc-100 tracking-tight">
            {formatCurrency(mrr, "IDR")}
          </p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Berdasarkan active subscribers</span>
          </p>
        </div>

        {/* Total Users */}
        <div className="bg-white dark:bg-[#161b22] p-5 rounded-2xl border border-slate-200 dark:border-[#21262d] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Total Pengguna
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black font-mono text-zinc-900 dark:text-zinc-100 tracking-tight">
            {totalUsers.toLocaleString("id-ID")}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">
            Terdaftar di sistem Dwitku
          </p>
        </div>

        {/* Workspaces */}
        <div className="bg-white dark:bg-[#161b22] p-5 rounded-2xl border border-slate-200 dark:border-[#21262d] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Total Workspace
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black font-mono text-zinc-900 dark:text-zinc-100 tracking-tight">
            {totalWorkspaces.toLocaleString("id-ID")}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">
            Finance & Sales workspaces
          </p>
        </div>

        {/* Total Transactions */}
        <div className="bg-white dark:bg-[#161b22] p-5 rounded-2xl border border-slate-200 dark:border-[#21262d] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Total Transaksi
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black font-mono text-zinc-900 dark:text-zinc-100 tracking-tight">
            {totalTx.toLocaleString("id-ID")}
          </p>
          <p className="text-[11px] text-zinc-400 mt-1">
            Dicatat oleh semua pengguna
          </p>
        </div>
      </div>

      {/* Plan Breakdown Quick Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-green-600" />
            <span>Distribusi Paket Langganan</span>
          </h2>
          <Link
            href="/admin/plans"
            className="text-xs font-bold text-green-600 dark:text-green-400 hover:underline flex items-center gap-1"
          >
            <span>Ubah Konfigurasi Paket</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const isFree = plan.key === "free";
            const isBasic = plan.key === "basic";
            const isPro = plan.key === "pro";

            return (
              <div
                key={plan.id}
                className="bg-white dark:bg-[#161b22] p-5 rounded-2xl border border-slate-200 dark:border-[#21262d] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                        isPro
                          ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          : isBasic
                          ? "bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/20"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      {plan.name}
                    </span>
                    <span className="text-xs font-black font-mono text-zinc-900 dark:text-zinc-100">
                      {plan.priceMonthly === 0 ? "Gratis" : `${formatCurrency(plan.priceMonthly, "IDR")}/bln`}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300 mb-4">
                    <p className="flex items-center justify-between">
                      <span className="text-zinc-400">Max Workspace:</span>
                      <span className="font-bold">{plan.maxWorkspaces === -1 ? "Unlimited" : plan.maxWorkspaces}</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="text-zinc-400">Max Transaksi/bln:</span>
                      <span className="font-bold">{plan.maxTx === -1 ? "Unlimited" : plan.maxTx}</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="text-zinc-400">Ekspor Excel:</span>
                      <span className="font-bold">{plan.canExport ? "✅ Ya" : "❌ Tidak"}</span>
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-[#21262d] flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Subscriber Aktif:</span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                    {plan._count?.subscriptions || 0} akun
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Database Management & Backup Card */}
      <div className="bg-white dark:bg-[#161b22] p-5 rounded-2xl border border-slate-200 dark:border-[#21262d] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Database Maintenance
            </span>
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Neon Postgres</span>
          </div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            Cadangkan & Ekspor Seluruh Database
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
            Unduh salinan lengkap data Dwitku (Users, Workspaces, Wallets, Transaksi, Penjualan, Subscriptions) dalam format JSON Snapshot atau SQL Dump yang siap di-restore sewaktu-waktu.
          </p>
        </div>

        <DatabaseExportModal variant="button" buttonClassName="shrink-0 font-bold bg-green-600 hover:bg-green-700" />
      </div>

      {/* Recent Subscriptions Table */}
      <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200 dark:border-[#21262d] shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-[#21262d] flex items-center justify-between">
          <div>
            <h2 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
              Aktivitas Langganan Terbaru
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Daftar akun dengan riwayat aktivasi / perubahan langganan
            </p>
          </div>
          <Link
            href="/admin/users"
            className="text-xs font-semibold text-green-600 dark:text-green-400 hover:underline"
          >
            Lihat Semua Pengguna →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-zinc-400 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30">
                <th className="px-6 py-3 font-semibold">Pengguna</th>
                <th className="px-6 py-3 font-semibold">Paket</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Mulai</th>
                <th className="px-6 py-3 font-semibold">Berakhir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {subscriptions.map((sub) => {
                const statusInfo = STATUS_CONFIG[sub.status] ?? {
                  label: sub.status,
                  bg: "bg-zinc-100 text-zinc-600 border-zinc-200",
                  text: "text-zinc-600",
                  icon: Clock,
                };
                const StatusIcon = statusInfo.icon;

                return (
                  <tr
                    key={sub.id}
                    className="hover:bg-slate-50 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-green-500/10 text-green-700 dark:text-green-300 font-bold flex items-center justify-center text-[10px] shrink-0">
                          {sub.user.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-zinc-900 dark:text-zinc-100 truncate">
                            {sub.user.name || "Tanpa Nama"}
                          </p>
                          <p className="text-[10px] text-zinc-400 truncate">
                            {sub.user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">
                        {sub.plan.name}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusInfo.bg} ${statusInfo.text}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        <span>{statusInfo.label}</span>
                      </span>
                    </td>
                    <td className="px-6 py-3 text-zinc-500 font-mono">
                      {new Date(sub.startedAt).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-6 py-3 text-zinc-500 font-mono">
                      {sub.currentPeriodEnd
                        ? new Date(sub.currentPeriodEnd).toLocaleDateString("id-ID")
                        : sub.trialEndsAt
                        ? `Trial s/d ${new Date(sub.trialEndsAt).toLocaleDateString("id-ID")}`
                        : "Selamanya"}
                    </td>
                  </tr>
                );
              })}

              {subscriptions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-zinc-400">
                    Belum ada riwayat langganan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── AI OCR Config Section ── */}
      <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200 dark:border-[#21262d] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-[#21262d] bg-gradient-to-r from-violet-50/80 to-purple-50/60 dark:from-violet-950/20 dark:to-purple-950/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
              <ScanLine className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Konfigurasi AI Receipt Scanner</h2>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-violet-100 text-violet-700 border border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  AI Powered
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Pilih provider AI untuk fitur scan struk otomatis di Web &amp; Mobile. Dikonfigurasi via file .env</p>
            </div>
          </div>
          {/* Status Badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
            currentMeta?.keyConfigured
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
              : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
          }`}>
            {currentMeta?.keyConfigured
              ? <><CheckCircle2 className="w-3.5 h-3.5" /> Aktif</>  
              : <><AlertCircle className="w-3.5 h-3.5" /> Belum Dikonfigurasi</>}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Provider Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(Object.entries(PROVIDER_META) as [ProviderKey, (typeof PROVIDER_META)[ProviderKey]][]).map(([key, meta]) => {
              const isActive = aiOcrProvider === key;
              return (
                <div
                  key={key}
                  className={`relative p-4 rounded-xl border-2 transition-all ${
                    isActive
                      ? "border-violet-500 bg-violet-50/70 dark:bg-violet-950/20"
                      : "border-slate-200 dark:border-[#21262d] bg-slate-50/50 dark:bg-[#21262d]/30"
                  }`}
                >
                  {isActive && (
                    <span className="absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-violet-500 text-white">AKTIF</span>
                  )}
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      key === "gemini" ? "text-emerald-700 bg-emerald-50 border-emerald-200" :
                      key === "openai" ? "text-amber-700 bg-amber-50 border-amber-200" :
                      "text-purple-700 bg-purple-50 border-purple-200"
                    }`}>{meta.badge}</span>
                    <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">{meta.label}</span>
                  </div>
                  {/* API Key Status */}
                  <div className={`flex items-center gap-1.5 text-[10.5px] font-medium mb-3 ${
                    meta.keyConfigured ? "text-emerald-600" : "text-zinc-400"
                  }`}>
                    {meta.keyConfigured
                      ? <><CheckCircle2 className="w-3 h-3" /> API Key terpasang</>
                      : <><AlertCircle className="w-3 h-3" /> API Key belum diisi</>
                    }
                  </div>
                  {/* Model */}
                  <code className="block text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-1.5 rounded-lg text-violet-700 dark:text-violet-400 mb-3 truncate">
                    {meta.model}
                  </code>
                  <a
                    href={meta.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10.5px] text-violet-600 dark:text-violet-400 hover:text-violet-800 font-semibold transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Dapatkan API Key
                  </a>
                </div>
              );
            })}
          </div>

          {/* .env Config Reference */}
          <div className="bg-zinc-950 dark:bg-zinc-900 rounded-xl p-4 space-y-1.5">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3"># Konfigurasi di file .env</p>
            {[
              { key: "AI_OCR_PROVIDER", value: aiOcrProvider || "gemini", comment: "# gemini | openai | groq", configured: !!aiOcrProvider },
              { key: "GEMINI_API_KEY", value: geminiKey ? "*****" : "(belum diisi)", comment: "# Gratis di aistudio.google.com", configured: !!geminiKey },
              { key: "GEMINI_OCR_MODEL", value: geminiModel, comment: "# gemini-2.5-flash / gemini-1.5-flash", configured: true },
              { key: "OPENAI_API_KEY", value: openaiKey ? "*****" : "(opsional)", comment: "# Jika provider=openai", configured: !!openaiKey },
              { key: "GROQ_API_KEY", value: groqKey ? "*****" : "(opsional)", comment: "# Jika provider=groq", configured: !!groqKey },
            ].map((item) => (
              <div key={item.key} className="flex items-start gap-2 font-mono text-[11px]">
                <span className={item.configured ? "text-emerald-400" : "text-zinc-500"}>{item.key}</span>
                <span className="text-zinc-600">=</span>
                <span className={item.configured ? "text-amber-300" : "text-zinc-600"}>&#34;{item.value}&#34;</span>
                <span className="text-zinc-600 ml-2">{item.comment}</span>
              </div>
            ))}
          </div>

          {/* Capability List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              "📄 Struk belanja minimarket (Indomaret, Alfamart)",
              "🍽️ Nota restoran & kafe",
              "🏦 Screenshot mutasi m-banking (BCA, Mandiri, BRI, BNI)",
              "💳 Bukti transfer e-wallet (GoPay, OVO, ShopeePay, DANA)",
              "🧾 Struk kasir POS & invoice",
              "📱 Screenshot Shopee, Tokopedia, dll",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-[11.5px] text-zinc-600 dark:text-zinc-400 bg-slate-50 dark:bg-[#21262d] rounded-lg px-3 py-2">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
