import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PLAN_LIMITS } from "@/lib/subscription-limits";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.isAdmin) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  for (const [key, limits] of Object.entries(PLAN_LIMITS)) {
    await prisma.plan.upsert({
      where: { key },
      update: {
        name: limits.displayName,
        priceMonthly: limits.priceMonthly,
        maxWorkspaces: limits.maxWorkspaces,
        maxMembers: limits.maxMembers,
        maxTx: limits.maxTx,
        maxCategories: limits.maxCategories,
        canExport: limits.canExport,
        canReport: limits.canReport,
        trialDays: limits.trialDays,
        isActive: true,
      },
      create: {
        key,
        name: limits.displayName,
        priceMonthly: limits.priceMonthly,
        maxWorkspaces: limits.maxWorkspaces,
        maxMembers: limits.maxMembers,
        maxTx: limits.maxTx,
        maxCategories: limits.maxCategories,
        canExport: limits.canExport,
        canReport: limits.canReport,
        trialDays: limits.trialDays,
        isActive: true,
      },
    });
  }

  return NextResponse.json({ success: true, seeded: Object.keys(PLAN_LIMITS) });
}
