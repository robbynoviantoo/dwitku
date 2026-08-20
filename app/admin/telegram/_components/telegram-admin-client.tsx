"use client";

import { useState, useTransition } from "react";
import {
  saveAdminTelegramSettings,
  setAdminTelegramWebhook,
  deleteAdminTelegramWebhook,
  getAdminTelegramSettings,
} from "@/app/actions/telegram";
import {
  Bot,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Globe,
  Key,
  ShieldCheck,
  Send,
  Users,
  Eye,
  EyeOff,
  Sparkles,
  ExternalLink,
  HelpCircle,
  Radio,
} from "lucide-react";
import Swal from "sweetalert2";
import { cn } from "@/lib/utils";

interface TelegramAdminClientProps {
  initialData: {
    config: {
      botToken: string | null;
      botUsername: string | null;
      webhookSecret: string | null;
      appUrl: string | null;
    };
    botInfo: any;
    webhookInfo: any;
    errorMsg: string | null;
    linkedUsersCount: number;
  };
}

export function TelegramAdminClient({ initialData }: TelegramAdminClientProps) {
  const [data, setData] = useState(initialData);
  const [isPending, startTransition] = useTransition();

  // Form State
  const [botToken, setBotToken] = useState(data.config.botToken || "");
  const [botUsername, setBotUsername] = useState(data.config.botUsername || "");
  const [webhookSecret, setWebhookSecret] = useState(data.config.webhookSecret || "");
  const [appUrl, setAppUrl] = useState(data.config.appUrl || "");
  const [showToken, setShowToken] = useState(false);

  const isConnected = !!data.botInfo?.id && !data.errorMsg;
  const isWebhookActive = !!data.webhookInfo?.url;

  const refreshStatus = async () => {
    startTransition(async () => {
      const res = await getAdminTelegramSettings();
      if (!("error" in res)) {
        setData(res as any);
        if (res.config.botToken) setBotToken(res.config.botToken);
        if (res.config.botUsername) setBotUsername(res.config.botUsername);
        if (res.config.webhookSecret) setWebhookSecret(res.config.webhookSecret);
        if (res.config.appUrl) setAppUrl(res.config.appUrl);
      }
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!botToken.trim() || !botUsername.trim()) {
      Swal.fire({
        title: "Perhatian",
        text: "Token Bot dan Username Bot wajib diisi.",
        icon: "warning",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    startTransition(async () => {
      const res = await saveAdminTelegramSettings({
        botToken,
        botUsername,
        webhookSecret,
        appUrl,
      });

      if (res.error) {
        Swal.fire("Gagal", res.error, "error");
      } else {
        Swal.fire({
          title: "Berhasil!",
          text: "Konfigurasi bot Telegram berhasil disimpan ke sistem.",
          icon: "success",
          confirmButtonColor: "#16a34a",
        });
        refreshStatus();
      }
    });
  };

  const handleRegisterWebhook = async () => {
    startTransition(async () => {
      const res = await setAdminTelegramWebhook(appUrl || undefined);
      if (res.error) {
        Swal.fire("Gagal Mendaftarkan Webhook", res.error, "error");
      } else {
        Swal.fire({
          title: "Webhook Aktif!",
          text: `Webhook berhasil didaftarkan ke Telegram API:\n${res.webhookUrl}`,
          icon: "success",
          confirmButtonColor: "#16a34a",
        });
        refreshStatus();
      }
    });
  };

  const handleDeleteWebhook = async () => {
    startTransition(async () => {
      const res = await deleteAdminTelegramWebhook();
      if (res.error) {
        Swal.fire("Gagal Menghapus Webhook", res.error, "error");
      } else {
        Swal.fire({
          title: "Webhook Dinonaktifkan",
          text: "Webhook berhasil dihapus dari Telegram.",
          icon: "info",
          confirmButtonColor: "#16a34a",
        });
        refreshStatus();
      }
    });
  };

  const generateSecret = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setWebhookSecret(result);
  };

  return (
    <div className="space-y-6">
      {/* ── Top Header ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
            <Bot className="w-7 h-7 text-sky-500" />
            <span>Manajemen Integrasi Telegram Bot</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Konfigurasi token bot, sinkronisasi webhook otomatis, dan pantau pengguna yang terhubung.
          </p>
        </div>

        <button
          type="button"
          onClick={refreshStatus}
          disabled={isPending}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-[#161b22] border border-slate-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/80 transition-colors shadow-xs cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", isPending && "animate-spin")} />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* ── Status Metrics Bar ──────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Bot Connection */}
        <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#21262d] rounded-2xl p-4.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Status Bot</span>
            <span className={cn(
              "w-2.5 h-2.5 rounded-full",
              isConnected ? "bg-emerald-500 animate-pulse" : "bg-red-500"
            )} />
          </div>
          <div className="mt-3">
            <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              {isConnected ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span>Online / Valid</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-500" />
                  <span>Belum Terhubung</span>
                </>
              )}
            </p>
            <p className="text-[11px] text-zinc-400 mt-0.5 truncate">
              {data.botInfo?.first_name ? `${data.botInfo.first_name} (@${data.botInfo.username})` : "Token belum valid"}
            </p>
          </div>
        </div>

        {/* 2. Webhook Status */}
        <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#21262d] rounded-2xl p-4.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Status Webhook</span>
            <Radio className={cn("w-4 h-4", isWebhookActive ? "text-emerald-500" : "text-zinc-400")} />
          </div>
          <div className="mt-3">
            <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {isWebhookActive ? "Aktif (Menerima Event)" : "Belum Didaftarkan"}
            </p>
            <p className="text-[11px] text-zinc-400 mt-0.5 truncate">
              {data.webhookInfo?.url || "Klik tombol Set Webhook di bawah"}
            </p>
          </div>
        </div>

        {/* 3. Pending Updates */}
        <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#21262d] rounded-2xl p-4.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Antrian Pesan</span>
            <Send className="w-4 h-4 text-sky-500" />
          </div>
          <div className="mt-3">
            <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100 font-mono">
              {data.webhookInfo?.pending_update_count ?? 0}
            </p>
            <p className="text-[11px] text-zinc-400 mt-0.5">Pending updates di Telegram</p>
          </div>
        </div>

        {/* 4. Linked Users */}
        <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#21262d] rounded-2xl p-4.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Pengguna Terhubung</span>
            <Users className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3">
            <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100 font-mono">
              {data.linkedUsersCount} Akun
            </p>
            <p className="text-[11px] text-zinc-400 mt-0.5">Siap mencatat via Telegram</p>
          </div>
        </div>
      </div>

      {/* ── Main Form & Guide Section ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Settings */}
        <div className="lg:col-span-2 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#21262d] rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800/80 mb-5">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Pengaturan Kredensial Bot
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Kredensial tersimpan di database sistem dan dapat di-override melalui file <code>.env</code>.
              </p>
            </div>
            <Key className="w-5 h-5 text-zinc-400" />
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {/* 1. Bot Token */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                Telegram Bot Token <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showToken ? "text" : "password"}
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  placeholder="Contoh: 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                  className="w-full pl-3.5 pr-10 py-2.5 text-xs font-mono border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 focus:bg-white dark:focus:bg-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-sky-400 transition-colors text-zinc-900 dark:text-zinc-100"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                >
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                Dapatkan token ini dari chat <b>@BotFather</b> di Telegram saat membuat bot baru.
              </p>
            </div>

            {/* 2. Bot Username */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                Username Bot (tanpa @) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-bold select-none">
                  @
                </span>
                <input
                  type="text"
                  value={botUsername}
                  onChange={(e) => setBotUsername(e.target.value.replace(/^@/, ""))}
                  placeholder="dwitku_bot"
                  className="w-full pl-8 pr-3.5 py-2.5 text-xs border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 focus:bg-white dark:focus:bg-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-sky-400 transition-colors text-zinc-900 dark:text-zinc-100 font-medium"
                />
              </div>
            </div>

            {/* 3. Webhook Secret */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                  Webhook Secret Token
                </label>
                <button
                  type="button"
                  onClick={generateSecret}
                  className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline font-semibold cursor-pointer"
                >
                  + Generate Acak
                </button>
              </div>
              <input
                type="text"
                value={webhookSecret}
                onChange={(e) => setWebhookSecret(e.target.value)}
                placeholder="Secret acak untuk validasi header x-telegram-bot-api-secret-token"
                className="w-full px-3.5 py-2.5 text-xs font-mono border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 focus:bg-white dark:focus:bg-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-sky-400 transition-colors text-zinc-900 dark:text-zinc-100"
              />
            </div>

            {/* 4. App URL */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                URL Domain Aplikasi (HTTPS)
              </label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="url"
                  value={appUrl}
                  onChange={(e) => setAppUrl(e.target.value)}
                  placeholder="https://dwitku.domainanda.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs border border-zinc-200 dark:border-zinc-700 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 focus:bg-white dark:focus:bg-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-sky-400 transition-colors text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                Domain publik server VPS Anda. Endpoint webhook akan otomatis mengarah ke: <code>{appUrl || "https://domain.com"}/api/telegram/webhook</code>
              </p>
            </div>

            {/* Form Actions */}
            <div className="pt-3 flex flex-wrap gap-2.5">
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                Simpan Konfigurasi
              </button>

              <button
                type="button"
                onClick={handleRegisterWebhook}
                disabled={isPending || !botToken}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Daftarkan Webhook</span>
              </button>

              {isWebhookActive && (
                <button
                  type="button"
                  onClick={handleDeleteWebhook}
                  disabled={isPending}
                  className="px-4 py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  Hapus Webhook
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Quick Instructions & Interactive Preview */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#21262d] rounded-2xl p-5 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mb-3">
              <HelpCircle className="w-4 h-4 text-sky-500" />
              <span>Cara Menyiapkan Bot:</span>
            </h3>
            <ol className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-300 list-decimal pl-4">
              <li>
                Buka Telegram dan cari <b>@BotFather</b>.
              </li>
              <li>
                Ketik <code>/newbot</code> dan ikuti instruksi penamaan bot.
              </li>
              <li>
                Salin <b>HTTP API Token</b> yang diberikan dan tempel pada form di samping.
              </li>
              <li>
                Isi <b>Username Bot</b> dan <b>URL Domain Aplikasi</b> (harus HTTPS).
              </li>
              <li>
                Klik <b>Simpan Konfigurasi</b> lalu klik <b>Daftarkan Webhook</b>.
              </li>
            </ol>

            {data.config.botUsername && (
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800/80">
                <a
                  href={`https://t.me/${data.config.botUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 rounded-xl text-xs font-bold hover:bg-sky-100 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Buka Bot di Telegram</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* Format Chat Cheat-Sheet */}
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 text-white rounded-2xl p-5 border border-zinc-800 shadow-md">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-2.5">
              <Sparkles className="w-4 h-4" />
              <span>Contoh Format Pesan:</span>
            </h3>
            <div className="space-y-2 text-[11px] font-mono bg-black/40 p-3 rounded-xl border border-white/10 text-zinc-300">
              <p>• <code>lapor pengeluaran 10000</code></p>
              <p>• <code>keluar 50k makan siang</code></p>
              <p>• <code>beli bensin 25.000</code></p>
              <p>• <code>lapor pemasukan 2.5jt gaji</code></p>
              <p>• <code>masuk 500rb bonus project</code></p>
              <p>• <code>/saldo</code> (cek saldo dompet)</p>
              <p>• <code>/laporan</code> (laporan bulan ini)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
