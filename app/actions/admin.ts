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

export async function renameUser(userId: string, newName: string) {
  try {
    await requireAdmin();

    const trimmed = newName.trim();
    if (!trimmed || trimmed.length < 1) {
      throw new Error("Nama tidak boleh kosong.");
    }
    if (trimmed.length > 80) {
      throw new Error("Nama terlalu panjang (maks 80 karakter).");
    }

    await prisma.user.update({
      where: { id: userId },
      data: { name: trimmed },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Gagal mengubah nama pengguna." };
  }
}

export async function adminSendPasswordReset(userId: string) {
  try {
    await requireAdmin();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true, password: true },
    });

    if (!user) throw new Error("Pengguna tidak ditemukan.");
    if (!user.password) {
      throw new Error("User ini login via Google dan tidak punya password.");
    }

    // Generate token reset password
    const { generatePasswordResetToken } = await import("@/lib/tokens");
    const resetToken = await generatePasswordResetToken(user.email);

    const baseUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const resetLink = `${baseUrl}/new-password?token=${resetToken.token}`;

    const { resend } = await import("@/lib/resend");
    const { buildResetPasswordEmail } = await import("@/lib/email-templates");

    const { error: emailError } = await resend.emails.send({
      from: "Dwitku <onboarding@resend.dev>",
      to: user.email,
      subject: "Atur Ulang Password — Dwitku",
      html: buildResetPasswordEmail({
        userName: user.name || "Pengguna Dwitku",
        resetLink,
      }),
    });

    if (emailError) {
      console.error("[Admin] Reset password email gagal:", emailError);
      return { success: true, warning: `Email gagal dikirim. Reset link: ${resetLink}`, resetLink };
    }

    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Gagal mengirim email reset password." };
  }
}
