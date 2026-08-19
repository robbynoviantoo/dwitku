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
        priceYearly: parseInt(data.priceYearly ?? "0"),
        maxWorkspaces: parseInt(data.maxWorkspaces),
        maxTx: parseInt(data.maxTx),
        maxMembers: parseInt(data.maxMembers ?? "-1"),
        maxCategories: parseInt(data.maxCategories ?? "-1"),
        trialDays: parseInt(data.trialDays ?? "0"),
        canExport: data.canExport === true || data.canExport === "true",
        canReport: data.canReport === true || data.canReport === "true",
        isActive: data.isActive === true || data.isActive === "true",
      },
    });

    revalidatePath("/admin/plans");
    revalidatePath("/admin");
    revalidatePath("/billing");
    return { success: true, plan };
  } catch (error: any) {
    return { error: error.message || "Gagal memperbarui paket." };
  }
}

export async function resetDefaultPlans() {
  try {
    await requireAdmin();
    const { seedPlans } = await import("./subscription");
    const res = await seedPlans();
    revalidatePath("/admin/plans");
    revalidatePath("/billing");
    return res;
  } catch (error: any) {
    return { error: error.message || "Gagal mereset default plans." };
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
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Gagal mengubah role admin." };
  }
}

export async function grantPremium(
  userId: string,
  planKey: string = "pro",
  durationMonths: number = 12,
  sendNotificationEmail: boolean = true
) {
  try {
    await requireAdmin();

    const [plan, targetUser] = await Promise.all([
      prisma.plan.findUnique({ where: { key: planKey } }),
      prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } }),
    ]);

    if (!plan) throw new Error("Paket tidak ditemukan");
    if (!targetUser) throw new Error("Pengguna tidak ditemukan");

    // Force expired existing pending payment
    await prisma.payment.updateMany({
      where: { subscription: { userId }, status: "PENDING" },
      data: { status: "FAILED" },
    });

    const currentPeriodEnd = new Date();
    let durationLabel = `${durationMonths} Bulan`;
    let expiryDateStr: string | undefined = undefined;

    if (durationMonths === -1) {
      // Lifetime access (100 tahun)
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 100);
      durationLabel = "Akses Seumur Hidup (Lifetime)";
    } else {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + durationMonths);
      if (durationMonths === 1) durationLabel = "1 Bulan";
      else if (durationMonths === 3) durationLabel = "3 Bulan";
      else if (durationMonths === 6) durationLabel = "6 Bulan";
      else if (durationMonths === 12) durationLabel = "1 Tahun (12 Bulan)";

      expiryDateStr = currentPeriodEnd.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }

    await prisma.subscription.upsert({
      where: { userId },
      update: {
        planId: plan.id,
        status: "ACTIVE",
        currentPeriodEnd,
        trialEndsAt: null,
        cancelledAt: null,
      },
      create: {
        userId,
        planId: plan.id,
        status: "ACTIVE",
        currentPeriodEnd,
      },
    });

    // Kirim email notifikasi aktivasi langganan jika diaktifkan admin
    if (sendNotificationEmail) {
      try {
        const { sendEmail } = await import("@/lib/resend");
        const { buildSubscriptionActivatedEmail } = await import("@/lib/email-templates");

        const baseUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
        const dashboardLink = `${baseUrl}/dashboard`;

        await sendEmail({
          to: targetUser.email,
          subject: `👑 Paket ${plan.name} Kamu Telah Aktif! — Dwitku`,
          html: buildSubscriptionActivatedEmail({
            userName: targetUser.name || "Pengguna Dwitku",
            planName: plan.name,
            planKey: plan.key,
            durationLabel,
            expiryDate: expiryDateStr,
            dashboardLink,
          }),
        });
      } catch (emailErr) {
        console.warn("[Admin] Gagal mengirim email notifikasi langganan ke user:", emailErr);
      }
    }

    revalidatePath("/admin/users");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Gagal memberikan akses paket langganan." };
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

export async function resetTrialStatus(userId: string) {
  try {
    await requireAdmin();

    const freePlan = await prisma.plan.findUnique({ where: { key: "free" } });

    await prisma.subscription.upsert({
      where: { userId },
      update: {
        hasUsedTrial: false,
      },
      create: {
        userId,
        planId: freePlan?.id || "",
        status: "EXPIRED",
        hasUsedTrial: false,
      },
    });

    revalidatePath("/admin/users");
    revalidatePath("/billing");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Gagal mereset status trial pengguna." };
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

    const { sendEmail } = await import("@/lib/resend");
    const { buildResetPasswordEmail } = await import("@/lib/email-templates");

    const sendRes = await sendEmail({
      to: user.email,
      subject: "Atur Ulang Password — Dwitku",
      html: buildResetPasswordEmail({
        userName: user.name || "Pengguna Dwitku",
        resetLink,
      }),
    });

    if (sendRes.error) {
      console.error("[Admin] Reset password email gagal:", sendRes.error);
      return { success: true, warning: `Email gagal dikirim (${sendRes.error}). Reset link: ${resetLink}`, resetLink };
    }

    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Gagal mengirim email reset password." };
  }
}

export async function deleteUser(userId: string) {
  try {
    const me = await requireAdmin();

    if (userId === me.id) {
      throw new Error("Anda tidak dapat menghapus akun Anda sendiri.");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: {
          include: {
            workspace: {
              include: {
                members: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error("Pengguna tidak ditemukan.");
    }

    // Workspaces where this user is the only member
    const soloWorkspaces = user.memberships
      .filter((m) => m.workspace.members.length === 1)
      .map((m) => m.workspaceId);

    if (soloWorkspaces.length > 0) {
      await prisma.workspace.deleteMany({
        where: { id: { in: soloWorkspaces } },
      });
    }

    // Delete user
    await prisma.user.delete({
      where: { id: userId },
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Gagal menghapus pengguna." };
  }
}
