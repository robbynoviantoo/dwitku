import { prisma } from "@/lib/prisma";

export interface TelegramConfig {
  botToken: string | null;
  botUsername: string | null;
  webhookSecret: string | null;
  appUrl: string | null;
}

/** Ambil konfigurasi Telegram dari Database (SystemSetting) dengan fallback ke process.env */
export async function getTelegramConfig(): Promise<TelegramConfig> {
  try {
    const settings = await prisma.systemSetting.findMany({
      where: {
        key: {
          in: [
            "TELEGRAM_BOT_TOKEN",
            "TELEGRAM_BOT_USERNAME",
            "TELEGRAM_WEBHOOK_SECRET",
            "APP_URL",
          ],
        },
      },
    });

    const settingsMap = new Map(settings.map((s) => [s.key, s.value]));

    const botToken =
      settingsMap.get("TELEGRAM_BOT_TOKEN") ||
      process.env.TELEGRAM_BOT_TOKEN ||
      null;

    const botUsername =
      settingsMap.get("TELEGRAM_BOT_USERNAME") ||
      process.env.TELEGRAM_BOT_USERNAME ||
      null;

    const webhookSecret =
      settingsMap.get("TELEGRAM_WEBHOOK_SECRET") ||
      process.env.TELEGRAM_WEBHOOK_SECRET ||
      null;

    const appUrl =
      settingsMap.get("APP_URL") ||
      process.env.APP_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      null;

    return { botToken, botUsername, webhookSecret, appUrl };
  } catch (error) {
    return {
      botToken: process.env.TELEGRAM_BOT_TOKEN || null,
      botUsername: process.env.TELEGRAM_BOT_USERNAME || null,
      webhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET || null,
      appUrl: process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || null,
    };
  }
}

/** Kirim request langsung ke Telegram Bot API */
export async function callTelegramApi(
  method: string,
  payload: Record<string, any> = {},
  customToken?: string
) {
  let token = customToken;
  if (!token) {
    const config = await getTelegramConfig();
    token = config.botToken || undefined;
  }

  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN belum dikonfigurasi.");
  }

  const url = `https://api.telegram.org/bot${token}/${method}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const data = await response.json();
  return data;
}

/** Kirim pesan teks ke chat */
export async function sendTelegramMessage(
  chatId: string | number,
  text: string,
  extra: {
    parse_mode?: "HTML" | "Markdown" | "MarkdownV2";
    reply_markup?: any;
    disable_web_page_preview?: boolean;
  } = {}
) {
  return callTelegramApi("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: extra.parse_mode || "HTML",
    reply_markup: extra.reply_markup,
    disable_web_page_preview: extra.disable_web_page_preview ?? true,
  });
}

/** Edit teks pesan yang sudah ada (misal setelah tombol inline diklik) */
export async function editTelegramMessageText(
  chatId: string | number,
  messageId: number,
  text: string,
  extra: {
    parse_mode?: "HTML" | "Markdown" | "MarkdownV2";
    reply_markup?: any;
    disable_web_page_preview?: boolean;
  } = {}
) {
  return callTelegramApi("editMessageText", {
    chat_id: chatId,
    message_id: messageId,
    text,
    parse_mode: extra.parse_mode || "HTML",
    reply_markup: extra.reply_markup,
    disable_web_page_preview: extra.disable_web_page_preview ?? true,
  });
}

/** Hapus pesan di chat */
export async function deleteTelegramMessage(chatId: string | number, messageId: number) {
  return callTelegramApi("deleteMessage", {
    chat_id: chatId,
    message_id: messageId,
  });
}

/** Jawab callback query dari tombol inline agar loading icon hilang di aplikasi Telegram */
export async function answerTelegramCallbackQuery(
  callbackQueryId: string,
  text?: string,
  showAlert: boolean = false
) {
  return callTelegramApi("answerCallbackQuery", {
    callback_query_id: callbackQueryId,
    text,
    show_alert: showAlert,
  });
}

/** Cek identitas Bot (getMe) */
export async function getTelegramBotMe(customToken?: string) {
  return callTelegramApi("getMe", {}, customToken);
}

/** Cek status Webhook saat ini */
export async function getTelegramWebhookInfo(customToken?: string) {
  return callTelegramApi("getWebhookInfo", {}, customToken);
}

/** Daftarkan Webhook Telegram ke endpoint backend Dwitku */
export async function registerTelegramWebhook(webhookUrl: string, secretToken?: string, customToken?: string) {
  const payload: Record<string, any> = {
    url: webhookUrl,
    allowed_updates: ["message", "callback_query"],
    drop_pending_updates: true,
  };

  if (secretToken) {
    payload.secret_token = secretToken;
  }

  return callTelegramApi("setWebhook", payload, customToken);
}

/** Hapus Webhook Telegram */
export async function removeTelegramWebhook(customToken?: string) {
  return callTelegramApi("deleteWebhook", { drop_pending_updates: true }, customToken);
}

// ─── PENDING TRANSACTIONS STORE (Tahan Limit 64-Byte Telegram Callback) ────────

export interface PendingTelegramTx {
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  amount: number;
  note?: string;
  categoryId?: string;
  walletId?: string;
  toWalletId?: string;
  createdAt: number;
}

const memoryPendingTx = new Map<string, PendingTelegramTx>();

export async function savePendingTelegramTx(
  chatId: string | number,
  messageId: number,
  data: Omit<PendingTelegramTx, "createdAt">
) {
  const key = `tx_pending_${chatId}_${messageId}`;
  const payload: PendingTelegramTx = { ...data, createdAt: Date.now() };
  memoryPendingTx.set(key, payload);

  try {
    await prisma.systemSetting.upsert({
      where: { key },
      update: { value: JSON.stringify(payload) },
      create: { key, value: JSON.stringify(payload) },
    });
  } catch (e) {
    // Ignore DB error
  }
}

export async function getPendingTelegramTx(
  chatId: string | number,
  messageId: number
): Promise<PendingTelegramTx | null> {
  const key = `tx_pending_${chatId}_${messageId}`;
  if (memoryPendingTx.has(key)) {
    return memoryPendingTx.get(key)!;
  }

  try {
    const record = await prisma.systemSetting.findUnique({ where: { key } });
    if (record?.value) {
      const parsed = JSON.parse(record.value) as PendingTelegramTx;
      memoryPendingTx.set(key, parsed);
      return parsed;
    }
  } catch (e) {
    // ignore
  }

  return null;
}

export async function deletePendingTelegramTx(
  chatId: string | number,
  messageId: number
) {
  const key = `tx_pending_${chatId}_${messageId}`;
  memoryPendingTx.delete(key);
  try {
    await prisma.systemSetting.delete({ where: { key } }).catch(() => {});
  } catch (e) {
    // ignore
  }
}

