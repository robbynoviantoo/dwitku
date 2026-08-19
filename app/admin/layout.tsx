import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminNav } from "./_components/admin-nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.isAdmin) redirect("/workspaces");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0d1117] transition-colors">
      <AdminNav user={user} />
      <main className="max-w-7xl lg:max-w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
