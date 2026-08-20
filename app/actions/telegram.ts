"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  getTelegramConfig,
  getTelegramBotMe,
  getTelegramWebhookInfo,
  registerTelegramWebhook,
  removeTelegramWebhook,
} from "@/lib/telegram/bot";
import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";

/** Ambil status integrasi Telegram untuk user yang sedang login beserta anggota workspace */
export async function getTelegramWorkspaceStatus(workspaceId?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      isLinked: false,
      telegramUsername: null,
      telegramLinkedAt: null,
      botUsername: null,
      isBotConfigured: false,
      members: [],
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      telegramChatId: true,
      telegramUsername: true,
      telegramLinkedAt: true,
    },
  });

  const config = await getTelegramConfig();

  let members: any[] = [];
  if (workspaceId) {
    const wsMembers = await prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            telegramChatId: true,
            telegramUsername: true,
            telegramLinkedAt: true,
          },
        },
      },
      orderBy: { joinedAt: "asc" },
    });

    members = wsMembers.map((m) => ({
      id: m.user.id,
      name: m.user.name,
      email: m.user.email,
      role: m.role,
      isLinked: !!m.user.telegramChatId,
      telegramUsername: m.user.telegramUsername,
      telegramLinkedAt: m.user.telegramLinkedAt,
    }));
  }

  return {
    isLinked: !!user?.telegramChatId,
    telegramUsername: user?.telegramUsername || null,
    telegramLinkedAt: user?.telegramLinkedAt || null,
    botUsername: config.botUsername || null,
    isBotConfigured: !!config.botToken,
    members,
  };
}

/** Ambil status integrasi Telegram untuk user yang sedang login */
export async function getTelegramUserStatus() {
  return getTelegramWorkspaceStatus();
}

/** Buat token unik untuk deep link menghubungkan Telegram */
export async function generateTelegramLinkToken() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Tidak terautentikasi" };

  const config = await getTelegramConfig();
  if (!config.botToken || !config.botUsername) {
    return { error: "Bot Telegram belum dikonfigurasi oleh Administrator." };
  }

  // Hapus token lama user jika ada
  await prisma.telegramLinkToken.deleteMany({
    where: { userId: session.user.id },
  }).catch(() => {});

  // Generate 8-character hex token
  const token = randomBytes(8).toString("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 menit

  await prisma.telegramLinkToken.create({
    data: {
      token,
      userId: session.user.id,
      expiresAt,
    },
  });

  const linkUrl = `https://t.me/${config.botUsername}?start=link_${token}`;

  return {
    success: true,
    token,
    botUsername: config.botUsername,
    linkUrl,
    expiresAt,
  };
}

/** Putuskan sambungan akun Telegram */
export async function unlinkTelegramAccount() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Tidak terautentikasi" };

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      telegramChatId: null,
      telegramUsername: null,
      telegramLinkedAt: null,
    },
  });

  revalidatePath("/settings");

  return { success: true };
}

/** [ADMIN] Ambil seluruh setting & status Telegram Bot */
export async function getAdminTelegramSettings() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Tidak terautentikasi" };
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.isAdmin) {
    return { error: "Akses ditolak: Hanya untuk Super Admin" };
  }

  const config = await getTelegramConfig();

  let botInfo = null;
  let webhookInfo = null;
  let errorMsg = null;

  if (config.botToken) {
    try {
      const meRes = await getTelegramBotMe(config.botToken);
      if (meRes.ok) {
        botInfo = meRes.result;
      } else {
        errorMsg = meRes.description || "Token bot tidak valid";
      }

      const whRes = await getTelegramWebhookInfo(config.botToken);
      if (whRes.ok) {
        webhookInfo = whRes.result;
      }
    } catch (e: any) {
      errorMsg = e.message || "Gagal menghubungi Telegram API";
    }
  }

  const linkedUsersCount = await prisma.user.count({
    where: { telegramChatId: { not: null } },
  });

  return {
    config,
    botInfo,
    webhookInfo,
    errorMsg,
    linkedUsersCount,
  };
}

/** [ADMIN] Simpan konfigurasi Telegram Bot */
export async function saveAdminTelegramSettings(data: {
  botToken: string;
  botUsername: string;
  webhookSecret?: string;
  appUrl?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Tidak terautentikasi" };
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.isAdmin) {
    return { error: "Akses ditolak: Hanya untuk Super Admin" };
  }

  const { botToken, botUsername, webhookSecret, appUrl } = data;

  // Simpan ke SystemSetting table
  const settingsToUpsert = [
    { key: "TELEGRAM_BOT_TOKEN", value: botToken.trim() },
    { key: "TELEGRAM_BOT_USERNAME", value: botUsername.replace(/^@/, "").trim() },
  ];

  if (webhookSecret !== undefined) {
    settingsToUpsert.push({ key: "TELEGRAM_WEBHOOK_SECRET", value: webhookSecret.trim() });
  }

  if (appUrl) {
    const cleanUrl = appUrl.trim().replace(/\/$/, "");
    settingsToUpsert.push({ key: "APP_URL", value: cleanUrl });
  }

  for (const s of settingsToUpsert) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: { key: s.key, value: s.value },
    });
  }

  revalidatePath("/admin/telegram");
  revalidatePath("/settings");

  return { success: true };
}

/** [ADMIN] Daftarkan / perbarui Webhook Telegram */
export async function setAdminTelegramWebhook(customAppUrl?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Tidak terautentikasi" };
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.isAdmin) {
    return { error: "Akses ditolak" };
  }

  const config = await getTelegramConfig();
  if (!config.botToken) {
    return { error: "Token Bot belum diatur" };
  }

  const domain = customAppUrl || config.appUrl || process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  if (!domain) {
    return { error: "App URL (domain publik HTTPS) belum diisi" };
  }

  const cleanDomain = domain.replace(/\/$/, "");
  const webhookUrl = `${cleanDomain}/api/telegram/webhook`;

  const res = await registerTelegramWebhook(webhookUrl, config.webhookSecret || undefined, config.botToken);

  if (!res.ok) {
    return { error: res.description || "Gagal mendaftarkan webhook ke Telegram" };
  }

  revalidatePath("/admin/telegram");
  return { success: true, description: res.description, webhookUrl };
}

/** [ADMIN] Hapus Webhook Telegram */
export async function deleteAdminTelegramWebhook() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Tidak terautentikasi" };
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.isAdmin) {
    return { error: "Akses ditolak" };
  }

  const config = await getTelegramConfig();
  if (!config.botToken) {
    return { error: "Token Bot belum diatur" };
  }

  const res = await removeTelegramWebhook(config.botToken);

  if (!res.ok) {
    return { error: res.description || "Gagal menghapus webhook" };
  }

  revalidatePath("/admin/telegram");
  return { success: true, description: res.description };
}
