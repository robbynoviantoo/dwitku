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
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

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

        <div className="flex items-center gap-2.5">
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
    </div>
  );
}

