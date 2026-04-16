"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PLAN_LIMITS, type PlanKey } from "@/lib/subscription-limits";
import { revalidatePath } from "next/cache";

/** Ambil subscription aktif user (bersama data plan) */
export async function getUserSubscription() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const sub = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
    include: { plan: true },
  });

  return sub;
}

/** Cek batas sesuai plan — kembalikan planKey dan limits */
export async function getUserPlanKey(): Promise<PlanKey> {
  const sub = await getUserSubscription();
  if (!sub) return "free";

  const now = new Date();

  // Langganan aktif
  if (
    sub.status === "ACTIVE" &&
    sub.currentPeriodEnd &&
    sub.currentPeriodEnd > now
  ) {
    return sub.plan.key as PlanKey;
  }

  return "free";
}

/** Ambil batasan limit secara Native dari Database untuk keperluan Gating. Jika Admin, return unlimited. */
export async function getUserPlanLimits() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.isAdmin) {
    return {
      maxWorkspaces: -1,
      maxMembers: -1,
      maxTx: -1,
      maxCategories: -1,
      canExport: true,
      canReport: true,
      canBudget: true,
    };
  }

  const sub = await getUserSubscription();
  const now = new Date();

  // Jika langganan aktif
  if (sub?.status === "ACTIVE" && sub.currentPeriodEnd && sub.currentPeriodEnd > now) {
    return {
      maxWorkspaces: sub.plan.maxWorkspaces,
      maxMembers: sub.plan.maxMembers,
      maxTx: sub.plan.maxTx,
      maxCategories: sub.plan.maxCategories,
      canExport: sub.plan.canExport,
      canReport: sub.plan.canReport,
      canBudget: true, // budget can be tied to pro manually or added to db
    };
  }

  // Jatuh ke default free (bisa lookup dari db juga)
  const freePlan = await prisma.plan.findUnique({ where: { key: "free" } });
  if (freePlan) {
    return {
      maxWorkspaces: freePlan.maxWorkspaces,
      maxMembers: freePlan.maxMembers,
      maxTx: freePlan.maxTx,
      maxCategories: freePlan.maxCategories,
      canExport: freePlan.canExport,
      canReport: freePlan.canReport,
      canBudget: false,
    };
  }

  // Failsafe
  return {
    maxWorkspaces: 2,
    maxMembers: 5,
    maxTx: 200,
    maxCategories: 1,
    canExport: false,
    canReport: false,
    canBudget: false,
  };
}

/** Seed plan ke database jika belum ada */
export async function seedPlans() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.isAdmin) return { error: "Admin only" };

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

  return { success: true };
}


/** Batalkan subscription */
export async function cancelSubscription() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const sub = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });
  if (!sub) return { error: "Tidak ada subscription aktif" };

  await prisma.subscription.update({
    where: { id: sub.id },
    data: { status: "CANCELLED", cancelledAt: new Date() },
  });

  revalidatePath("/billing");
  return { success: true };
}
