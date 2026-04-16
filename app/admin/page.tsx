import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Users, CreditCard, BarChart2, Building2, Crown, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export const metadata = {
  title: "Admin Dashboard — Dwitku",
};

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.isAdmin) redirect("/workspaces");

  const [totalUsers, totalWorkspaces, totalTx, subscriptions] = await Promise.all([
    prisma.user.count(),
    prisma.workspace.count(),
    prisma.transaction.count(),
    prisma.subscription.findMany({
      include: { plan: true, user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const activeSubs = subscriptions.filter((s) => s.status === "ACTIVE").length;
  const trialSubs = subscriptions.filter((s) => s.status === "TRIAL").length;

  const STATUS_COLOR: Record<string, string> = {
    ACTIVE: "text-green-600 bg-green-50",
    TRIAL: "text-blue-600 bg-blue-50",
    EXPIRED: "text-zinc-400 bg-zinc-50",
    CANCELLED: "text-red-500 bg-red-50",
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl lg:max-w-full mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
          <Crown className="w-6 h-6 text-amber-500" />
          Admin Dashboard
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Panel admin — hanya bisa diakses oleh super admin.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Pengguna", value: totalUsers, icon: Users, color: "text-green-600", bg: "bg-green-50" },
          { label: "Total Workspace", value: totalWorkspaces, icon: Building2, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Total Transaksi", value: totalTx.toLocaleString("id-ID"), icon: BarChart2, color: "text-green-600", bg: "bg-green-50" },
          { label: "Subscriber Aktif", value: activeSubs, icon: CreditCard, color: "text-amber-600", bg: "bg-amber-50" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl border border-zinc-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${s.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-zinc-900">{s.value}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Nav links */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link href="/admin/users" className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors">
          <Users className="w-4 h-4" /> Kelola Pengguna
        </Link>
        <Link href="/admin/plans" className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors">
          <CreditCard className="w-4 h-4" /> Kelola Paket
        </Link>
      </div>

      {/* Recent subscriptions */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100">
          <h2 className="font-bold text-zinc-900">Langganan Terbaru</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-zinc-500 border-b border-zinc-100">
                <th className="text-left px-6 py-3 font-medium">Pengguna</th>
                <th className="text-left px-6 py-3 font-medium">Paket</th>
                <th className="text-left px-6 py-3 font-medium">Status</th>
                <th className="text-left px-6 py-3 font-medium">Mulai</th>
                <th className="text-left px-6 py-3 font-medium">Berakhir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {subscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="px-6 py-3">
                    <p className="font-medium text-zinc-900">{sub.user.name ?? "-"}</p>
                    <p className="text-xs text-zinc-400">{sub.user.email}</p>
                  </td>
                  <td className="px-6 py-3 font-medium">{sub.plan.name}</td>
                  <td className="px-6 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[sub.status] ?? ""}`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-zinc-500">{sub.startedAt.toLocaleDateString("id-ID")}</td>
                  <td className="px-6 py-3 text-zinc-500">
                    {sub.currentPeriodEnd
                      ? sub.currentPeriodEnd.toLocaleDateString("id-ID")
                      : sub.trialEndsAt
                      ? `Trial s/d ${sub.trialEndsAt.toLocaleDateString("id-ID")}`
                      : "-"}
                  </td>
                </tr>
              ))}
              {subscriptions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-zinc-400">Belum ada subscriber.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
