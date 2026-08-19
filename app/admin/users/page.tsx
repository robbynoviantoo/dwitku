import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UsersTableClient } from "./_components/users-table-client";
import { Users, Shield } from "lucide-react";

export const metadata = { title: "Admin — Kelola Pengguna — Dwitku" };

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const me = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!me?.isAdmin) redirect("/workspaces");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      subscription: { include: { plan: true } },
      accounts: { select: { provider: true } },
      _count: { select: { memberships: true, transactions: true } },
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
          <Users className="w-6 h-6 text-green-600" />
          <span>Direktori & Manajemen Pengguna</span>
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Pantau seluruh pengguna terdaftar, atur hak akses Super Admin, berikan paket langganan secara fleksibel, dan kelola akun.
        </p>
      </div>

      {/* Interactive Users Table with Search and Filters */}
      <UsersTableClient users={users as any} currentUserId={me.id} />
    </div>
  );
}

