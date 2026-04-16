"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/** Middleware / helper untuk mengecek role admin */
async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const me = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!me?.isAdmin) throw new Error("Akses ditolak: Membutuhkan Hak Admin.");

  return me;
}

// ─── MANAJEMEN PAKET (PLAN) ──────────────────────────────────────────────────

export async function updatePlan(planId: string, data: any) {
  try {
    await requireAdmin();

    const plan = await prisma.plan.update({
      where: { id: planId },
      data: {
        name: data.name,
        priceMonthly: parseInt(data.priceMonthly),
        maxWorkspaces: parseInt(data.maxWorkspaces),
        maxTx: parseInt(data.maxTx),
        canExport: data.canExport === true || data.canExport === "true",
        canReport: data.canReport === true || data.canReport === "true",
        isActive: data.isActive === true || data.isActive === "true",
      },
    });

    revalidatePath("/admin/plans");
    revalidatePath("/billing");
    return { success: true, plan };
  } catch (error: any) {
    return { error: error.message || "Gagal memperbarui paket." };
  }
}

// ─── MANAJEMEN PENGGUNA ──────────────────────────────────────────────────────

export async function toggleAdminStatus(userId: string, isNowAdmin: boolean) {
  try {
    const me = await requireAdmin();

    if (userId === me.id) {
      throw new Error("Anda tidak dapat mengubah status admin diri sendiri.");
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isAdmin: isNowAdmin },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Gagal mengubah role admin." };
  }
}

export async function grantPremium(userId: string, planKey: string = "pro") {
  try {
    await requireAdmin();

    const plan = await prisma.plan.findUnique({ where: { key: planKey } });
    if (!plan) throw new Error("Paket tidak ditemukan");

    // Force expired existing payment if any
    await prisma.payment.updateMany({
      where: { subscription: { userId }, status: "PENDING" },
      data: { status: "FAILED" }
    });

    // 1 Tahun
    const currentPeriodEnd = new Date();
    currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);

    await prisma.subscription.upsert({
      where: { userId },
      update: {
        planId: plan.id,
        status: "ACTIVE",
        currentPeriodEnd,
        trialEndsAt: null,
      },
      create: {
        userId,
        planId: plan.id,
        status: "ACTIVE",
        currentPeriodEnd,
      },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Gagal memberikan akses premium." };
  }
}

export async function revokeSubscription(userId: string) {
  try {
    await requireAdmin();

    await prisma.subscription.update({
      where: { userId },
      data: {
        status: "EXPIRED",
        currentPeriodEnd: new Date(), // make it expired now
        cancelledAt: new Date(),
      },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Gagal mencabut langganan." };
  }
}
