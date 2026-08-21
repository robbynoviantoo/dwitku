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

  // Langganan aktif atau trial yang masih berlaku
  if (
    (sub.status === "ACTIVE" || sub.status === "TRIAL") &&
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

  // Jika langganan aktif atau trial yang masih berlaku
  if (
    (sub?.status === "ACTIVE" || sub?.status === "TRIAL") &&
    sub.currentPeriodEnd &&
    sub.currentPeriodEnd > now
  ) {
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
    maxWorkspaces: 1,
    maxMembers: 1,
    maxTx: 50,
    maxCategories: 3,
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
        priceYearly: limits.priceYearly,
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
        priceYearly: limits.priceYearly,
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

/** Klaim masa uji coba (Free Trial) */
export async function claimFreeTrial(planKey: string = "pro") {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const userId = session.user.id;

  // Cek apakah user sudah pernah klaim trial
  const existingSub = await prisma.subscription.findUnique({
    where: { userId },
    include: { plan: true },
  });

  if (existingSub?.hasUsedTrial) {
    return { error: "Akun Anda sudah pernah menggunakan masa uji coba (trial) gratis." };
  }

  // Jika sedang aktif paket berbayar
  const now = new Date();
  if (
    existingSub &&
    existingSub.status === "ACTIVE" &&
    existingSub.currentPeriodEnd &&
    existingSub.currentPeriodEnd > now
  ) {
    return { error: "Anda sedang memiliki paket langganan aktif." };
  }

  const plan = await prisma.plan.findUnique({
    where: { key: planKey },
  });

  if (!plan) {
    return { error: "Paket trial tidak ditemukan." };
  }

  const trialDays = plan.trialDays > 0 ? plan.trialDays : 7;
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);

  await prisma.subscription.upsert({
    where: { userId },
    update: {
      planId: plan.id,
      status: "TRIAL",
      trialEndsAt,
      currentPeriodEnd: trialEndsAt,
      hasUsedTrial: true,
      cancelledAt: null,
    },
    create: {
      userId,
      planId: plan.id,
      status: "TRIAL",
      trialEndsAt,
      currentPeriodEnd: trialEndsAt,
      hasUsedTrial: true,
    },
  });

  revalidatePath("/billing");
  revalidatePath("/dashboard");
  revalidatePath("/workspaces");

  return { success: true, trialDays, planName: plan.name };
}

