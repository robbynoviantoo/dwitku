import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PlanCardClient } from "./_components/plan-card-client";

export const metadata = { title: "Admin — Paket — Dwitku" };

export default async function AdminPlansPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const me = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!me?.isAdmin) redirect("/workspaces");

  const plans = await prisma.plan.findMany({ orderBy: { priceMonthly: "asc" }, include: { _count: { select: { subscriptions: true } } } });

  return (
    <div className="p-4 md:p-8 max-w-7xl lg:max-w-full mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/admin" className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-500 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Kelola Paket</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Konfigurasi paket langganan Dwitku</p>
        </div>
      </div>

      {plans.length === 0 ? (
        <div className="text-center py-16 text-zinc-400">
          <p className="mb-4">Belum ada plan di database.</p>
          <form action="/api/admin/seed-plans" method="POST">
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors">
              Seed Default Plans
            </button>
          </form>
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
