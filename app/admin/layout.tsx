import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.isAdmin) redirect("/workspaces");

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Admin top bar */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2">
        <span className="text-amber-600 text-xs font-bold">⚡ ADMIN MODE</span>
        <span className="text-amber-500 text-xs">Panel admin Dwitku — hati-hati dengan perubahan yang kamu buat.</span>
      </div>
      {children}
    </div>
  );
}
