import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, CreditCard, Sparkles, ShieldCheck } from "lucide-react";
import { PlanCardClient } from "./_components/plan-card-client";
import { SyncDefaultPlansButton } from "./_components/sync-default-plans-button";

export const metadata = { title: "Admin — Kelola Paket — Dwitku" };

export default async function AdminPlansPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const me = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!me?.isAdmin) redirect("/workspaces");

  const plans = await prisma.plan.findMany({
    orderBy: { priceMonthly: "asc" },
    include: { _count: { select: { subscriptions: true } } },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-green-600" />
            <span>Kelola Paket & Batasan Fitur</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Konfigurasi harga, batas maksimal workspace, kuota transaksi bulanan, dan hak akses fitur per paket.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <SyncDefaultPlansButton />
        </div>
      </div>

      {/* Info Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 flex items-start gap-3 text-xs">
        <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-emerald-900 dark:text-emerald-200">
            Sistem Gating Otomatis Aktif
          </p>
          <p className="text-emerald-700/80 dark:text-emerald-300/80 mt-0.5 leading-relaxed">
            Perubahan pada konfigurasi paket di bawah ini akan langsung berlaku pada seluruh user yang terdaftar di paket tersebut secara real-time. Kuota <strong>-1</strong> berarti Unlimited.
          </p>
        </div>
      </div>

      {/* Plan Cards Grid */}
      {plans.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#161b22] rounded-3xl border border-slate-200 dark:border-zinc-800 text-zinc-400">
          <p className="mb-4">Belum ada paket langganan yang tersimpan di database.</p>
          <SyncDefaultPlansButton />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <PlanCardClient key={plan.id} plan={plan} />
          ))}
        </div>
      )}
    </div>
  );
}
