import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { UserActions } from "./_components/user-actions";

export const metadata = { title: "Admin — Pengguna — Dwitku" };

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const me = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!me?.isAdmin) redirect("/workspaces");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      subscription: { include: { plan: true } },
      _count: { select: { memberships: true, transactions: true } },
    },
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl lg:max-w-full mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin" className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-500 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Kelola Pengguna</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{users.length} pengguna terdaftar</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm">
        <div className="overflow-x-auto pb-48">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-zinc-500 bg-zinc-50 border-b border-zinc-100">
                <th className="text-left px-6 py-3 font-medium">Pengguna</th>
                <th className="text-left px-6 py-3 font-medium">Langganan</th>
                <th className="text-left px-6 py-3 font-medium">Workspace</th>
                <th className="text-left px-6 py-3 font-medium">Transaksi</th>
                <th className="text-left px-6 py-3 font-medium">Bergabung</th>
                <th className="text-left px-6 py-3 font-medium">Role</th>
                <th className="text-left px-6 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {users.map((u) => {
                const sub = u.subscription;
                const planName = sub?.plan?.name ?? "Gratis";
                const subStatus = sub?.status;
                const STATUS_COLOR: Record<string, string> = {
                  TRIAL: "text-blue-600 bg-blue-50",
                  ACTIVE: "text-green-600 bg-green-50",
                  EXPIRED: "text-zinc-400 bg-zinc-50",
                  CANCELLED: "text-red-500 bg-red-50",
                };
                return (
                  <tr key={u.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2.5">
                        {u.image
                          // eslint-disable-next-line @next/next/no-img-element
                          ? <img src={u.image} alt="" className="w-8 h-8 rounded-full object-cover" />
                          : <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-700">{u.name?.charAt(0) ?? "?"}</div>}
                        <div>
                          <p className="font-medium text-zinc-900">{u.name ?? "-"}</p>
                          <p className="text-xs text-zinc-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-zinc-700">{planName}</span>
                        {subStatus && (
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full w-fit ${STATUS_COLOR[subStatus] ?? ""}`}>
                            {subStatus}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3 text-zinc-600">{u._count.memberships}</td>
                    <td className="px-6 py-3 text-zinc-600">{u._count.transactions.toLocaleString("id-ID")}</td>
                    <td className="px-6 py-3 text-zinc-500 text-xs">
                      {u.createdAt.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-6 py-3">
                      {u.isAdmin
                        ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">ADMIN</span>
                        : <span className="text-[10px] text-zinc-400">User</span>}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <UserActions 
                        userId={u.id} 
                        isAdmin={u.isAdmin} 
                        isMe={me?.id === u.id} 
                        hasActiveSubscription={!!subStatus && subStatus !== "EXPIRED" && subStatus !== "CANCELLED"}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
