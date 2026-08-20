import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getTelegramConfig,
  sendTelegramMessage,
  editTelegramMessageText,
  answerTelegramCallbackQuery,
  savePendingTelegramTx,
  getPendingTelegramTx,
  deletePendingTelegramTx,
} from "@/lib/telegram/bot";
import { parseTransactionText } from "@/lib/telegram/parser";
import { TransactionType } from "@/generated/prisma/client";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

/** Format angka ribuan dengan pemisah titik */
function formatNumber(num: number): string {
  return new Intl.NumberFormat("id-ID").format(num);
}

/** Health-check & status endpoint untuk verifikasi di browser */
export async function GET() {
  try {
    const config = await getTelegramConfig();
    return NextResponse.json({
      status: "Dwitku Telegram Webhook is active",
      botConfigured: !!config.botToken,
      botUsername: config.botUsername || "Belum diisi",
      hasSecret: !!config.webhookSecret,
      appUrl: config.appUrl || "Belum diisi",
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: "Error", error: err?.message || "Internal error" },
      { status: 500 }
    );
  }
}

/** Ambil workspace utama user */
async function getUserActiveWorkspace(userId: string) {
  // Cek apakah ada preferensi workspace aktif
  try {
    const activeSetting = await prisma.systemSetting.findUnique({
      where: { key: `telegram_active_ws_${userId}` },
    });

    if (activeSetting?.value) {
      const membership = await prisma.workspaceMember.findFirst({
        where: { userId, workspaceId: activeSetting.value },
        include: {
          workspace: {
            include: {
              categories: true,
              wallets: {
                orderBy: [{ isDefault: "desc" }, { order: "asc" }, { createdAt: "asc" }],
              },
            },
          },
        },
      });

      if (membership?.workspace) {
        return membership.workspace;
      }
    }
  } catch (e) {
    // ignore
  }

  const membership = await prisma.workspaceMember.findFirst({
    where: { userId },
    include: {
      workspace: {
        include: {
          categories: true,
          wallets: {
            orderBy: [{ isDefault: "desc" }, { order: "asc" }, { createdAt: "asc" }],
          },
        },
      },
    },
    orderBy: { joinedAt: "asc" },
  });

  return membership?.workspace || null;
}

export async function POST(req: NextRequest) {
  try {
    const config = await getTelegramConfig();

    // Verifikasi Secret Token jika dikonfigurasi
    if (config.webhookSecret) {
      const secretHeader = req.headers.get("x-telegram-bot-api-secret-token");
      if (secretHeader !== config.webhookSecret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const body = await req.json();

    // ── 1. Handle Callback Query (Interaksi Tombol) ──────────────────────────
    if (body.callback_query) {
      const cq = body.callback_query;
      const cqId = cq.id;
      const fromId = String(cq.from.id);
      const chatId = cq.message?.chat?.id;
      const messageId = cq.message?.message_id;
      const data = cq.data as string;

      // ── Step A: Kategori Dipilih -> Munculkan Pilihan Dompet ────────────────
      if (data && data.startsWith("c:")) {
        await answerTelegramCallbackQuery(cqId, "Kategori dipilih, silakan pilih dompet...");

        const parts = data.split(":");
        const categoryId = parts[1];

        const user = await prisma.user.findUnique({
          where: { telegramChatId: fromId },
        });

        if (!user || !chatId || !messageId) {
          return NextResponse.json({ ok: true });
        }

        const workspace = await getUserActiveWorkspace(user.id);
        if (!workspace) return NextResponse.json({ ok: true });

        // Ambil data pending transaksi
        let pending = await getPendingTelegramTx(chatId, messageId);

        // Fallback jika fallback payload format lama ada (c:catId:type:amount:note)
        if (!pending && parts.length >= 4) {
          const typeChar = parts[2];
          const amount = Number(parts[3]);
          const note = parts[4] ? decodeURIComponent(parts[4]) : undefined;
          pending = {
            type: typeChar === "I" ? "INCOME" : "EXPENSE",
            amount,
            note,
            createdAt: Date.now(),
          };
        }

        const amount = pending?.amount || 0;
        const type = (pending?.type || "EXPENSE") as TransactionType;
        const note = pending?.note;

        // Simpan categoryId ke pending store
        await savePendingTelegramTx(chatId, messageId, {
          type: type === TransactionType.INCOME ? "INCOME" : "EXPENSE",
          amount,
          note,
          categoryId,
        });

        const category = workspace.categories.find((c: any) => c.id === categoryId);
        const isIncome = type === TransactionType.INCOME;
        const typeEmoji = isIncome ? "📈" : "💸";
        const typeLabel = isIncome ? "Pemasukan" : "Pengeluaran";

        // Hitung saldo masing-masing dompet untuk label tombol
        const wallets = workspace.wallets;
        if (wallets.length === 0) {
          await editTelegramMessageText(
            chatId,
            messageId,
            "⚠️ Belum ada dompet di workspace ini. Silakan buat dompet terlebih dahulu di web."
          );
          return NextResponse.json({ ok: true });
        }

        // Susun tombol pilihan dompet (1 tombol per baris, callback_data pendek aman 64-byte)
        const walletButtons = [];
        for (const w of wallets) {
          const allTxs = await prisma.transaction.findMany({
            where: { walletId: w.id },
            select: { amount: true, type: true },
          });
          const received = await prisma.transaction.findMany({
            where: { toWalletId: w.id, type: TransactionType.TRANSFER },
            select: { amount: true },
          });

          let inc = 0;
          let exp = 0;
          for (const tx of allTxs) {
            if (tx.type === TransactionType.INCOME) inc += Number(tx.amount);
            else if (tx.type === TransactionType.EXPENSE || tx.type === TransactionType.TRANSFER) exp += Number(tx.amount);
          }
          for (const tx of received) inc += Number(tx.amount);
          const bal = Number(w.initialBalance) + inc - exp;
          const holderStr = w.holderName ? ` • ${w.holderName}` : "";
          walletButtons.push([
            {
              text: `💳 ${w.name}${holderStr} (Rp ${formatNumber(bal)})`,
              callback_data: `w:${w.id}`,
            },
          ]);
        }

        // Tambahkan tombol Cancel di baris paling bawah
        walletButtons.push([
          {
            text: "❌ Batalkan",
            callback_data: "cancel",
          },
        ]);

        const promptWalletMsg =
          `${typeEmoji} <b>Catat ${typeLabel}: Rp ${formatNumber(amount)}</b>\n` +
          `📁 <b>Kategori:</b> ${category?.emoji || "🏷️"} ${category?.name || "-"}\n` +
          `📝 <b>Catatan:</b> ${note || "-"}\n\n` +
          `💳 <i>Silakan pilih dompet yang digunakan:</i>`;

        await editTelegramMessageText(chatId, messageId, promptWalletMsg, {
          reply_markup: { inline_keyboard: walletButtons },
        });

        return NextResponse.json({ ok: true });
      }

      // ── Step B: Dompet Dipilih -> Simpan Transaksi & Tampilkan Konfirmasi Sukses
      if (data && data.startsWith("w:")) {
        await answerTelegramCallbackQuery(cqId, "Menyimpan transaksi...");

        const parts = data.split(":");
        const walletId = parts[1];

        const user = await prisma.user.findUnique({
          where: { telegramChatId: fromId },
        });

        if (!user || !chatId || !messageId) {
          return NextResponse.json({ ok: true });
        }

        const workspace = await getUserActiveWorkspace(user.id);
        if (!workspace) return NextResponse.json({ ok: true });

        // Ambil data pending transaksi
        const pending = await getPendingTelegramTx(chatId, messageId);

        let amount = pending?.amount || 0;
        let type = (pending?.type || "EXPENSE") as TransactionType;
        let categoryId = pending?.categoryId;
        let note = pending?.note;

        // Fallback jika format lama
        if (!pending && parts.length >= 5) {
          categoryId = parts[2];
          const typeChar = parts[3];
          amount = Number(parts[4]);
          note = parts[5] ? decodeURIComponent(parts[5]) : undefined;
          type = typeChar === "I" ? TransactionType.INCOME : TransactionType.EXPENSE;
        }

        const category = workspace.categories.find((c: any) => c.id === categoryId);
        const selectedWallet = workspace.wallets.find((w: any) => w.id === walletId) || workspace.wallets[0];

        // Buat transaksi di database
        await prisma.transaction.create({
          data: {
            workspaceId: workspace.id,
            createdById: user.id,
            type,
            amount,
            date: new Date(),
            categoryId: category?.id || null,
            walletId: selectedWallet?.id || null,
            note: note || null,
          },
        });

        // Hapus pending data
        await deletePendingTelegramTx(chatId, messageId);

        // Hitung saldo dompet setelah transaksi
        let walletCurrentBalance = selectedWallet ? Number(selectedWallet.initialBalance) : 0;
        if (selectedWallet) {
          const allWalletTxs = await prisma.transaction.findMany({
            where: { walletId: selectedWallet.id },
            select: { amount: true, type: true },
          });
          const receivedTransfers = await prisma.transaction.findMany({
            where: { toWalletId: selectedWallet.id, type: TransactionType.TRANSFER },
            select: { amount: true },
          });

          let inc = 0;
          let exp = 0;
          for (const tx of allWalletTxs) {
            if (tx.type === TransactionType.INCOME) inc += Number(tx.amount);
            else if (tx.type === TransactionType.EXPENSE || tx.type === TransactionType.TRANSFER) exp += Number(tx.amount);
          }
          for (const tx of receivedTransfers) {
            inc += Number(tx.amount);
          }
          walletCurrentBalance = Number(selectedWallet.initialBalance) + inc - exp;
        }

        const isIncome = type === TransactionType.INCOME;
        const typeEmoji = isIncome ? "📈" : "💸";
        const typeLabel = isIncome ? "Pemasukan" : "Pengeluaran";
        const dateStr = new Date().toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });

        const walletHolderStr = selectedWallet?.holderName ? ` (${selectedWallet.holderName})` : "";
        const successMessage =
          `✅ <b>Transaksi Berhasil Dicatat!</b>\n\n` +
          `${typeEmoji} <b>Tipe:</b> ${typeLabel}\n` +
          `💰 <b>Nominal:</b> Rp ${formatNumber(amount)}\n` +
          `📁 <b>Kategori:</b> ${category?.emoji || "🏷️"} ${category?.name || "-"}\n` +
          `💳 <b>Dompet:</b> ${selectedWallet?.name || "Utama"}${walletHolderStr}\n` +
          `📝 <b>Catatan:</b> ${note || "-"}\n` +
          `📅 <b>Tanggal:</b> ${dateStr}\n\n` +
          (selectedWallet
            ? `💳 <i>Sisa saldo ${selectedWallet.name}:</i> <b>Rp ${formatNumber(walletCurrentBalance)}</b>`
            : "");

        await editTelegramMessageText(chatId, messageId, successMessage, {
          reply_markup: undefined, // Hapus tombol inline
        });

        return NextResponse.json({ ok: true });
      }

      // ── Step C: Batalkan Transaksi ─────────────────────────────────────────
      if (data === "cancel" || data.startsWith("cancel")) {
        await answerTelegramCallbackQuery(cqId, "Pencatatan dibatalkan.");
        if (chatId && messageId) {
          await deletePendingTelegramTx(chatId, messageId);
          await editTelegramMessageText(
            chatId,
            messageId,
            "❌ <i>Pencatatan transaksi dibatalkan.</i>",
            { reply_markup: undefined }
          );
        }
        return NextResponse.json({ ok: true });
      }

      // ── Step D: Switch Workspace ──────────────────────────────────────────
      if (data && data.startsWith("sw:")) {
        const targetWsId = data.replace("sw:", "");
        const user = await prisma.user.findUnique({
          where: { telegramChatId: fromId },
        });

        if (!user || !chatId || !messageId) {
          return NextResponse.json({ ok: true });
        }

        const membership = await prisma.workspaceMember.findFirst({
          where: { userId: user.id, workspaceId: targetWsId },
          include: { workspace: true },
        });

        if (!membership) {
          await answerTelegramCallbackQuery(cqId, "Workspace tidak ditemukan.");
          return NextResponse.json({ ok: true });
        }

        await answerTelegramCallbackQuery(cqId, `Workspace aktif: ${membership.workspace.name}`);

        await prisma.systemSetting.upsert({
          where: { key: `telegram_active_ws_${user.id}` },
          update: { value: membership.workspace.id },
          create: { key: `telegram_active_ws_${user.id}`, value: membership.workspace.id },
        });

        await editTelegramMessageText(
          chatId,
          messageId,
          `✅ <b>Workspace Aktif Diubah!</b>\n\n🏢 <b>${membership.workspace.name}</b> (${membership.role})\n\nSemua transaksi yang kamu laporkan sekarang akan otomatis dicatat ke workspace ini.`,
          { reply_markup: undefined }
        );

        return NextResponse.json({ ok: true });
      }

      // ── Step E: Transfer - Dompet Asal Dipilih -> Munculkan Dompet Tujuan ────
      if (data && data.startsWith("tsrc:")) {
        await answerTelegramCallbackQuery(cqId, "Dompet asal dipilih, pilih dompet tujuan...");
        const srcWalletId = data.replace("tsrc:", "");
        const user = await prisma.user.findUnique({ where: { telegramChatId: fromId } });
        if (!user || !chatId || !messageId) return NextResponse.json({ ok: true });
        const workspace = await getUserActiveWorkspace(user.id);
        if (!workspace) return NextResponse.json({ ok: true });

        const pending = await getPendingTelegramTx(chatId, messageId);
        const amount = pending?.amount || 0;
        const note = pending?.note;

        await savePendingTelegramTx(chatId, messageId, {
          type: "TRANSFER",
          amount,
          note,
          walletId: srcWalletId,
        });

        const srcWallet = workspace.wallets.find((w: any) => w.id === srcWalletId);
        const destWallets = workspace.wallets.filter((w: any) => w.id !== srcWalletId);

        const destButtons = [];
        for (const w of destWallets) {
          const allTxs = await prisma.transaction.findMany({
            where: { walletId: w.id },
            select: { amount: true, type: true },
          });
          const received = await prisma.transaction.findMany({
            where: { toWalletId: w.id, type: TransactionType.TRANSFER },
            select: { amount: true },
          });
          let inc = 0;
          let exp = 0;
          for (const tx of allTxs) {
            if (tx.type === TransactionType.INCOME) inc += Number(tx.amount);
            else if (tx.type === TransactionType.EXPENSE || tx.type === TransactionType.TRANSFER) exp += Number(tx.amount);
          }
          for (const tx of received) inc += Number(tx.amount);
          const bal = Number(w.initialBalance) + inc - exp;
          const holderStr = w.holderName ? ` • ${w.holderName}` : "";

          destButtons.push([
            {
              text: `📥 ${w.name}${holderStr} (Rp ${formatNumber(bal)})`,
              callback_data: `tdst:${w.id}`,
            },
          ]);
        }

        destButtons.push([
          {
            text: "❌ Batalkan",
            callback_data: "cancel",
          },
        ]);

        const srcHolderStr = srcWallet?.holderName ? ` (${srcWallet.holderName})` : "";
        const promptDstMsg =
          `🔄 <b>Pindah Saldo / Transfer: Rp ${formatNumber(amount)}</b>\n` +
          `📤 <b>Dari Dompet:</b> ${srcWallet?.name || "Asal"}${srcHolderStr}\n` +
          `📝 <b>Catatan:</b> ${note || "Pindah Saldo"}\n\n` +
          `📥 <i>Silakan pilih dompet TUJUAN:</i>`;

        await editTelegramMessageText(chatId, messageId, promptDstMsg, {
          reply_markup: { inline_keyboard: destButtons },
        });

        return NextResponse.json({ ok: true });
      }

      // ── Step F: Transfer - Dompet Tujuan Dipilih -> Simpan & Konfirmasi ─────
      if (data && data.startsWith("tdst:")) {
        await answerTelegramCallbackQuery(cqId, "Memproses transfer saldo...");
        const dstWalletId = data.replace("tdst:", "");
        const user = await prisma.user.findUnique({ where: { telegramChatId: fromId } });
        if (!user || !chatId || !messageId) return NextResponse.json({ ok: true });
        const workspace = await getUserActiveWorkspace(user.id);
        if (!workspace) return NextResponse.json({ ok: true });

        const pending = await getPendingTelegramTx(chatId, messageId);
        const amount = pending?.amount || 0;
        const note = pending?.note;
        const srcWalletId = pending?.walletId;

        const srcWallet = workspace.wallets.find((w: any) => w.id === srcWalletId) || workspace.wallets[0];
        const dstWallet = workspace.wallets.find((w: any) => w.id === dstWalletId) || workspace.wallets[1];

        // Buat transaksi transfer di database
        await prisma.transaction.create({
          data: {
            workspaceId: workspace.id,
            createdById: user.id,
            type: TransactionType.TRANSFER,
            amount,
            date: new Date(),
            walletId: srcWallet.id,
            toWalletId: dstWallet.id,
            note: note || "Pindah Saldo",
          },
        });

        await deletePendingTelegramTx(chatId, messageId);

        // Hitung saldo dompet asal
        const allSrcTxs = await prisma.transaction.findMany({
          where: { walletId: srcWallet.id },
          select: { amount: true, type: true },
        });
        const recSrcTxs = await prisma.transaction.findMany({
          where: { toWalletId: srcWallet.id, type: TransactionType.TRANSFER },
          select: { amount: true },
        });
        let sInc = 0;
        let sExp = 0;
        for (const tx of allSrcTxs) {
          if (tx.type === TransactionType.INCOME) sInc += Number(tx.amount);
          else if (tx.type === TransactionType.EXPENSE || tx.type === TransactionType.TRANSFER) sExp += Number(tx.amount);
        }
        for (const tx of recSrcTxs) sInc += Number(tx.amount);
        const srcBal = Number(srcWallet.initialBalance) + sInc - sExp;

        // Hitung saldo dompet tujuan
        const allDstTxs = await prisma.transaction.findMany({
          where: { walletId: dstWallet.id },
          select: { amount: true, type: true },
        });
        const recDstTxs = await prisma.transaction.findMany({
          where: { toWalletId: dstWallet.id, type: TransactionType.TRANSFER },
          select: { amount: true },
        });
        let dInc = 0;
        let dExp = 0;
        for (const tx of allDstTxs) {
          if (tx.type === TransactionType.INCOME) dInc += Number(tx.amount);
          else if (tx.type === TransactionType.EXPENSE || tx.type === TransactionType.TRANSFER) dExp += Number(tx.amount);
        }
        for (const tx of recDstTxs) dInc += Number(tx.amount);
        const dstBal = Number(dstWallet.initialBalance) + dInc - dExp;

        const dateStr = new Date().toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });

        const srcHolder = srcWallet.holderName ? ` (${srcWallet.holderName})` : "";
        const dstHolder = dstWallet.holderName ? ` (${dstWallet.holderName})` : "";

        const successMessage =
          `✅ <b>Transfer Saldo Berhasil Dicatat!</b>\n\n` +
          `🔄 <b>Tipe:</b> Pindah Saldo / Transfer\n` +
          `💰 <b>Nominal:</b> Rp ${formatNumber(amount)}\n` +
          `📤 <b>Dari Dompet:</b> ${srcWallet.name}${srcHolder}\n` +
          `📥 <b>Ke Dompet:</b> ${dstWallet.name}${dstHolder}\n` +
          `📝 <b>Catatan:</b> ${note || "-"}\n` +
          `📅 <b>Tanggal:</b> ${dateStr}\n\n` +
          `💳 <i>Sisa ${srcWallet.name}:</i> <b>Rp ${formatNumber(srcBal)}</b>\n` +
          `💳 <i>Total ${dstWallet.name}:</i> <b>Rp ${formatNumber(dstBal)}</b>`;

        await editTelegramMessageText(chatId, messageId, successMessage, {
          reply_markup: undefined,
        });

        return NextResponse.json({ ok: true });
      }

      return NextResponse.json({ ok: true });
    }

    // ── 2. Handle Message (Teks Biasa / Perintah) ─────────────────────────────
    if (body.message && body.message.text) {
      const message = body.message;
      const chatId = message.chat.id;
      const text = (message.text as string).trim();
      const fromUsername = message.from?.username;
      const fromName = [message.from?.first_name, message.from?.last_name].filter(Boolean).join(" ");
      const telegramUserId = String(message.from?.id);

      // A. Perintah /start [token]
      if (text.startsWith("/start")) {
        const parts = text.split(/\s+/);
        const payload = parts[1]?.trim();

        if (payload) {
          const cleanToken = payload.replace(/^link_/, "");
          const linkToken = await prisma.telegramLinkToken.findUnique({
            where: { token: cleanToken },
            include: { user: true },
          });

          if (!linkToken || linkToken.expiresAt < new Date()) {
            await sendTelegramMessage(
              chatId,
              "❌ <b>Tautan Tidak Valid atau Sudah Kedaluwarsa.</b>\n\nSilakan generate tautan baru dari menu Pengaturan di aplikasi web Dwitku."
            );
            return NextResponse.json({ ok: true });
          }

          // Hubungkan User
          await prisma.user.update({
            where: { id: linkToken.userId },
            data: {
              telegramChatId: telegramUserId,
              telegramUsername: fromUsername || null,
              telegramLinkedAt: new Date(),
            },
          });

          // Hapus token yang sudah dipakai
          await prisma.telegramLinkToken.delete({
            where: { id: linkToken.id },
          }).catch(() => {});

          await sendTelegramMessage(
            chatId,
            `🎉 <b>Selamat datang, ${linkToken.user.name || fromName}!</b>\n\n` +
              `Akun Dwitku kamu sekarang sudah <b>terhubung</b> dengan Telegram.\n\n` +
              `💡 <b>Cara Mencatat Transaksi Instan:</b>\n` +
              `• <code>lapor pengeluaran 15000 beli kopi</code>\n` +
              `• <code>keluar 50k makan siang</code>\n` +
              `• <code>lapor pemasukan 2.5jt gaji freelance</code>\n` +
              `• <code>masuk 100rb</code>\n\n` +
              `📌 <b>Perintah Menu:</b>\n` +
              `/saldo - Cek saldo dompet\n` +
              `/laporan - Ringkasan keuangan bulan ini\n` +
              `/bantuan - Panduan format pencatatan`
          );
          return NextResponse.json({ ok: true });
        }

        // Cek apakah user sudah terhubung
        const existingUser = await prisma.user.findUnique({
          where: { telegramChatId: telegramUserId },
        });

        if (existingUser) {
          await sendTelegramMessage(
            chatId,
            `👋 <b>Halo, ${existingUser.name || fromName}!</b>\n\n` +
              `Akun kamu sudah terhubung dengan Dwitku.\n\n` +
              `Ketik kalimat seperti:\n` +
              `👉 <code>lapor pengeluaran 10000</code>\n` +
              `👉 <code>keluar 50k bensin</code>\n` +
              `👉 <code>masuk 1jt freelance</code>\n\n` +
              `Gunakan /saldo untuk cek saldo dompet atau /laporan untuk ringkasan bulan ini.`
          );
        } else {
          await sendTelegramMessage(
            chatId,
            `👋 <b>Halo ${fromName}!</b>\n\n` +
              `Bot ini digunakan untuk mencatat transaksi dan memantau keuangan di <b>Dwitku</b>.\n\n` +
              `Untuk menghubungkan akun kamu:\n` +
              `1. Login ke aplikasi Dwitku di web\n` +
              `2. Buka menu <b>Pengaturan (Settings)</b>\n` +
              `3. Klik <b>Hubungkan Telegram</b>\n` +
              `4. Tekan tombol Mulai di bot ini`
          );
        }
        return NextResponse.json({ ok: true });
      }

      // Cek apakah user sudah terhubung untuk perintah berikutnya
      const user = await prisma.user.findUnique({
        where: { telegramChatId: telegramUserId },
      });

      if (!user) {
        await sendTelegramMessage(
          chatId,
          `⚠️ <b>Akun Telegram belum terhubung ke Dwitku.</b>\n\n` +
            `Silakan buka aplikasi Dwitku di web -> menu <b>Pengaturan</b> -> klik <b>Hubungkan Telegram</b>.`
        );
        return NextResponse.json({ ok: true });
      }

      const workspace = await getUserActiveWorkspace(user.id);
      if (!workspace) {
        await sendTelegramMessage(
          chatId,
          `⚠️ Kamu belum memiliki workspace aktif di Dwitku. Silakan buat workspace terlebih dahulu di web.`
        );
        return NextResponse.json({ ok: true });
      }

      // B. Perintah /saldo
      if (text === "/saldo") {
        const wallets = workspace.wallets;
        if (wallets.length === 0) {
          await sendTelegramMessage(
            chatId,
            `Belum ada dompet di workspace <b>${workspace.name}</b>.`
          );
          return NextResponse.json({ ok: true });
        }

        let totalSaldo = 0;
        let walletLines = [];

        for (const w of wallets) {
          const allTxs = await prisma.transaction.findMany({
            where: { walletId: w.id },
            select: { amount: true, type: true },
          });
          const received = await prisma.transaction.findMany({
            where: { toWalletId: w.id, type: TransactionType.TRANSFER },
            select: { amount: true },
          });

          let inc = 0;
          let exp = 0;
          for (const tx of allTxs) {
            if (tx.type === TransactionType.INCOME) inc += Number(tx.amount);
            else if (tx.type === TransactionType.EXPENSE || tx.type === TransactionType.TRANSFER) exp += Number(tx.amount);
          }
          for (const tx of received) inc += Number(tx.amount);

          const bal = Number(w.initialBalance) + inc - exp;
          totalSaldo += bal;
          const holderStr = w.holderName ? ` • <i>${w.holderName}</i>` : "";
          walletLines.push(
            `💳 <b>${w.name}</b>${holderStr}${w.isDefault ? " ⭐" : ""}: <code>Rp ${formatNumber(bal)}</code>`
          );
        }

        const msg =
          `💰 <b>Ringkasan Saldo Dompet (${workspace.name})</b>\n\n` +
          walletLines.join("\n") +
          `\n\n━━━━━━━━━━━━━━━━━━━━\n` +
          `💵 <b>Total Saldo:</b> <code>Rp ${formatNumber(totalSaldo)}</code>`;

        await sendTelegramMessage(chatId, msg);
        return NextResponse.json({ ok: true });
      }

      // C. Perintah /laporan
      if (text === "/laporan" || text === "/summary") {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        const txs = await prisma.transaction.findMany({
          where: {
            workspaceId: workspace.id,
            date: { gte: startOfMonth, lte: endOfMonth },
          },
          select: { amount: true, type: true },
        });

        let totalIncome = 0;
        let totalExpense = 0;
        for (const tx of txs) {
          if (tx.type === TransactionType.INCOME) totalIncome += Number(tx.amount);
          else if (tx.type === TransactionType.EXPENSE) totalExpense += Number(tx.amount);
        }
        const netCashflow = totalIncome - totalExpense;
        const monthName = now.toLocaleDateString("id-ID", { month: "long", year: "numeric" });

        const msg =
          `📊 <b>Laporan Keuangan Bulan ${monthName}</b>\n` +
          `Workspace: <i>${workspace.name}</i>\n\n` +
          `📈 <b>Pemasukan:</b> <code>Rp ${formatNumber(totalIncome)}</code>\n` +
          `📉 <b>Pengeluaran:</b> <code>Rp ${formatNumber(totalExpense)}</code>\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `💰 <b>Saldo Bersih:</b> <code>Rp ${formatNumber(netCashflow)}</code>`;

        await sendTelegramMessage(chatId, msg);
        return NextResponse.json({ ok: true });
      }

      // D. Perintah /workspace (Ganti Workspace Aktif)
      if (text === "/workspace" || text === "/switch") {
        const memberships = await prisma.workspaceMember.findMany({
          where: { userId: user.id },
          include: { workspace: true },
          orderBy: { joinedAt: "asc" },
        });

        if (memberships.length === 0) {
          await sendTelegramMessage(chatId, "⚠️ Kamu belum memiliki workspace di Dwitku.");
          return NextResponse.json({ ok: true });
        }

        const activeWs = await getUserActiveWorkspace(user.id);

        const buttons = memberships.map((m) => {
          const isCurrent = m.workspace.id === activeWs?.id;
          return [
            {
              text: `${isCurrent ? "⭐ " : ""}${m.workspace.name} (${m.role})${isCurrent ? " [Aktif]" : ""}`,
              callback_data: `sw:${m.workspace.id}`,
            },
          ];
        });

        buttons.push([
          {
            text: "❌ Tutup",
            callback_data: "cancel",
          },
        ]);

        await sendTelegramMessage(
          chatId,
          `🏢 <b>Pilih Workspace Aktif:</b>\n\n` +
            `Workspace saat ini: <b>${activeWs?.name || "-"}</b>\n` +
            `<i>Silakan pilih workspace yang ingin digunakan untuk pencatatan transaksi:</i>`,
          { reply_markup: { inline_keyboard: buttons } }
        );

        return NextResponse.json({ ok: true });
      }

      // E. Perintah /bantuan atau /help
      if (text === "/bantuan" || text === "/help") {
        await sendTelegramMessage(
          chatId,
          `📖 <b>Panduan Penggunaan Dwitku Bot:</b>\n\n` +
            `1️⃣ <b>Mencatat Pengeluaran:</b>\n` +
            `• <code>lapor pengeluaran 10000</code>\n` +
            `• <code>keluar 50k makan siang</code>\n` +
            `• <code>beli bensin 25000</code>\n\n` +
            `2️⃣ <b>Mencatat Pemasukan:</b>\n` +
            `• <code>lapor pemasukan 2.5jt gaji freelance</code>\n` +
            `• <code>masuk 100rb</code>\n` +
            `• <code>terima 500k bonus</code>\n\n` +
            `3️⃣ <b>Pindah Saldo / Tarik Tunai:</b>\n` +
            `• <code>tarik 50000</code>\n` +
            `• <code>transfer 100k</code>\n` +
            `• <code>pindah saldo 200rb</code>\n\n` +
            `4️⃣ <b>Perintah Menu:</b>\n` +
            `• /saldo - Cek rincian saldo semua dompet\n` +
            `• /laporan - Ringkasan kas bulan ini\n` +
            `• /workspace - Ganti workspace aktif\n` +
            `• /bantuan - Menampilkan panduan ini`
        );
        return NextResponse.json({ ok: true });
      }

      // E. Natural Language / Teks Transaksi Bebas ("lapor pengeluaran 10000", "keluar 50k", dll.)
      const parsed = parseTransactionText(text);
      if (parsed) {
        const { type, amount, note } = parsed;
        // ── KASUS 1: TRANSAKSI TRANSFER / TARIK SALDO ───────────────────────
        if (type === TransactionType.TRANSFER) {
          const wallets = workspace.wallets;
          if (wallets.length < 2) {
            await sendTelegramMessage(
              chatId,
              `⚠️ Untuk pindah saldo / transfer, workspace kamu harus memiliki minimal 2 dompet.`
            );
            return NextResponse.json({ ok: true });
          }

          const walletButtons = [];
          for (const w of wallets) {
            const allTxs = await prisma.transaction.findMany({
              where: { walletId: w.id },
              select: { amount: true, type: true },
            });
            const received = await prisma.transaction.findMany({
              where: { toWalletId: w.id, type: TransactionType.TRANSFER },
              select: { amount: true },
            });
            let inc = 0;
            let exp = 0;
            for (const tx of allTxs) {
              if (tx.type === TransactionType.INCOME) inc += Number(tx.amount);
              else if (tx.type === TransactionType.EXPENSE || tx.type === TransactionType.TRANSFER) exp += Number(tx.amount);
            }
            for (const tx of received) inc += Number(tx.amount);
            const bal = Number(w.initialBalance) + inc - exp;
            const holderStr = w.holderName ? ` • ${w.holderName}` : "";

            walletButtons.push([
              {
                text: `📤 ${w.name}${holderStr} (Rp ${formatNumber(bal)})`,
                callback_data: `tsrc:${w.id}`,
              },
            ]);
          }

          walletButtons.push([
            {
              text: "❌ Batalkan",
              callback_data: "cancel",
            },
          ]);

          const promptMessage =
            `🔄 <b>Pindah Saldo / Transfer: Rp ${formatNumber(amount)}</b>\n` +
            `📝 <b>Catatan:</b> ${note || "Pindah Saldo"}\n\n` +
            `📤 <i>Silakan pilih dompet ASAL (Sumber Dana):</i>`;

          const sent = await sendTelegramMessage(chatId, promptMessage, {
            reply_markup: { inline_keyboard: walletButtons },
          });

          if (sent?.ok && sent?.result?.message_id) {
            await savePendingTelegramTx(chatId, sent.result.message_id, {
              type: "TRANSFER",
              amount,
              note,
            });
          }

          return NextResponse.json({ ok: true });
        }

        // ── KASUS 2: PEMASUKAN / PENGELUARAN ────────────────────────────────
        const isIncome = type === TransactionType.INCOME;
        const typeEmoji = isIncome ? "📈" : "💸";
        const typeLabel = isIncome ? "Pemasukan" : "Pengeluaran";

        // Filter kategori berdasarkan tipe transaksi
        const categories = workspace.categories.filter((c: any) => c.type === type);

        if (categories.length === 0) {
          await sendTelegramMessage(
            chatId,
            `⚠️ Belum ada kategori ${typeLabel.toLowerCase()} di workspace kamu. Silakan buat kategori di menu Kategori pada web.`
          );
          return NextResponse.json({ ok: true });
        }

        // Susun inline keyboard tombol kategori (grid 2 kolom, short callback data aman 64 byte)
        const inlineKeyboard = [];
        for (let i = 0; i < categories.length; i += 2) {
          const row = [];
          const cat1 = categories[i];
          row.push({
            text: `${cat1.emoji || "🏷️"} ${cat1.name}`,
            callback_data: `c:${cat1.id}`,
          });

          if (i + 1 < categories.length) {
            const cat2 = categories[i + 1];
            row.push({
              text: `${cat2.emoji || "🏷️"} ${cat2.name}`,
              callback_data: `c:${cat2.id}`,
            });
          }
          inlineKeyboard.push(row);
        }

        // Tambahkan tombol Batalkan di baris bawah
        inlineKeyboard.push([
          {
            text: "❌ Batalkan",
            callback_data: "cancel",
          },
        ]);

        const promptMessage =
          `${typeEmoji} <b>Catat ${typeLabel}: Rp ${formatNumber(amount)}</b>\n` +
          `📝 <b>Catatan:</b> ${note || "-"}\n\n` +
          `<i>Silakan pilih kategori di bawah ini:</i>`;

        const sent = await sendTelegramMessage(chatId, promptMessage, {
          reply_markup: { inline_keyboard: inlineKeyboard },
        });

        if (sent?.ok && sent?.result?.message_id) {
          await savePendingTelegramTx(chatId, sent.result.message_id, {
            type: isIncome ? "INCOME" : "EXPENSE",
            amount,
            note,
          });
        }

        return NextResponse.json({ ok: true });
      }

      // Jika teks tidak dikenali
      await sendTelegramMessage(
        chatId,
        `🤔 Format pesan belum dikenali.\n\n` +
          `💡 <i>Contoh yang bisa kamu kirim:</i>\n` +
          `• <code>lapor pengeluaran 15000</code>\n` +
          `• <code>keluar 50k makan siang</code>\n` +
          `• <code>masuk 100rb</code>\n\n` +
          `Ketik /bantuan untuk melihat panduan lengkap.`
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Telegram Webhook Error:", error);
    return NextResponse.json({ ok: true, error: error?.message || "Internal error" });
  }
}
