import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env / .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const LOCAL_WEBHOOK_URL = process.env.LOCAL_WEBHOOK_URL || "http://localhost:3000/api/telegram/webhook";
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || "";

if (!BOT_TOKEN) {
  console.error("❌ ERROR: TELEGRAM_BOT_TOKEN belum diset di file .env");
  console.log("ℹ️  Silakan tambahkan TELEGRAM_BOT_TOKEN di .env terlebih dahulu.");
  process.exit(1);
}

console.log("==================================================");
console.log("🤖 DWITKU TELEGRAM BOT - LOCAL POLLER DEV SERVER");
console.log("==================================================");
console.log(`🌐 Meneruskan pesan ke: ${LOCAL_WEBHOOK_URL}`);
console.log("⏳ Memeriksa dan menghapus webhook lama agar polling aktif...");

async function setupAndStartPolling() {
  try {
    // 1. Hapus webhook aktif di Telegram agar getUpdates bisa berjalan
    const delRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook?drop_pending_updates=false`);
    const delData = await delRes.json();
    if (delData.ok) {
      console.log("✅ Webhook dinonaktifkan sementara untuk pengujian lokal.");
    }

    // 2. Ambil info bot
    const meRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
    const meData = await meRes.json();
    if (meData.ok) {
      console.log(`🤖 Bot Terhubung: ${meData.result.first_name} (@${meData.result.username})`);
      console.log("🟢 Polling aktif! Kamu sekarang bisa chat langsung dengan bot di Telegram.");
      console.log("   (Tekan Ctrl+C untuk berhenti)\n");
    } else {
      console.error("❌ Gagal terhubung ke bot Telegram:", meData.description);
      process.exit(1);
    }

    let offset = 0;

    // 3. Loop Long-Polling
    while (true) {
      try {
        const url = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${offset}&timeout=25`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.ok && Array.isArray(data.result)) {
          for (const update of data.result) {
            offset = update.update_id + 1;

            const fromUser = update.message?.from?.username || update.callback_query?.from?.username || "user";
            const textContent = update.message?.text || `[Button Callback: ${update.callback_query?.data}]`;
            console.log(`📩 [Update #${update.update_id}] dari @${fromUser}: "${textContent}"`);

            // Forward update ke endpoint Next.js lokal (mencoba port 3000 atau 3001)
            try {
              const headers: Record<string, string> = {
                "Content-Type": "application/json",
              };
              if (WEBHOOK_SECRET) {
                headers["x-telegram-bot-api-secret-token"] = WEBHOOK_SECRET;
              }

              const candidatePorts = [process.env.PORT, "3000", "3001", "3002"].filter(Boolean);
              let forwarded = false;

              for (const p of candidatePorts) {
                const url = process.env.LOCAL_WEBHOOK_URL || `http://localhost:${p}/api/telegram/webhook`;
                try {
                  const forwardRes = await fetch(url, {
                    method: "POST",
                    headers,
                    body: JSON.stringify(update),
                  });
                  if (forwardRes.ok) {
                    forwarded = true;
                    break;
                  }
                } catch {
                  // Coba port berikutnya
                }
              }

              if (!forwarded) {
                console.warn(`   ⚠️ Tidak dapat meneruskan ke localhost (mencoba port 3000/3001). Pastikan 'npm run dev' aktif.`);
              }
            } catch (err: any) {
              console.error(`   ❌ Gagal meneruskan ke localhost:`, err.message);
            }
          }
        }
      } catch (pollErr: any) {
        // Abaikan timeout koneksi biasa saat polling
        if (!pollErr.message?.includes("fetch failed")) {
          console.error("Polling error:", pollErr.message);
        }
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
  } catch (err: any) {
    console.error("Fatal Error:", err);
  }
}

setupAndStartPolling();
