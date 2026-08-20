"use client";

import { useState, useEffect, useTransition } from "react";
import {
  getTelegramWorkspaceStatus,
  generateTelegramLinkToken,
  unlinkTelegramAccount,
} from "@/app/actions/telegram";
import {
  Bot,
  CheckCircle2,
  ExternalLink,
  Send,
  Unlink,
  Loader2,
  Sparkles,
  Users,
  Shield,
  UserCheck,
  UserX,
} from "lucide-react";
import Swal from "sweetalert2";
import { cn } from "@/lib/utils";

interface SettingsTelegramCardProps {
  workspaceId?: string;
}

export function SettingsTelegramCard({ workspaceId }: SettingsTelegramCardProps) {
  const [status, setStatus] = useState<{
    isLinked: boolean;
    telegramUsername: string | null;
    telegramLinkedAt: Date | null;
    botUsername: string | null;
    isBotConfigured: boolean;
    members: Array<{
      id: string;
      name: string | null;
      email: string;
      role: string;
      isLinked: boolean;
      telegramUsername: string | null;
      telegramLinkedAt: Date | null;
    }>;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const fetchStatus = async () => {
    setIsLoading(true);
    const res = await getTelegramWorkspaceStatus(workspaceId);
    setStatus(res);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStatus();
  }, [workspaceId]);

  const handleConnect = async () => {
    startTransition(async () => {
      const res = await generateTelegramLinkToken();
      if (res.error) {
        Swal.fire({
          title: "Gagal Menghubungkan",
          text: res.error,
          icon: "warning",
          confirmButtonColor: "#f59e0b",
        });
      } else if (res.linkUrl) {
        // Buka chat Telegram di tab baru
        window.open(res.linkUrl, "_blank");

        Swal.fire({
          title: "Membuka Telegram...",
          text: "Silakan tekan tombol 'START' atau 'Mulai' di bot Telegram untuk menyelesaikan penghubungan.",
          icon: "info",
          confirmButtonColor: "#0284c7",
          confirmButtonText: "Saya Sudah Menekan Start",
        }).then(() => {
          fetchStatus();
        });
      }
    });
  };

  const handleUnlink = async () => {
    const result = await Swal.fire({
      title: "Putuskan Sambungan Telegram?",
      text: "Setelah diputuskan, kamu tidak dapat mencatat transaksi lewat Telegram sampai menghubungkannya kembali.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, Putuskan",
      cancelButtonText: "Batal",
      reverseButtons: true,
      customClass: { popup: "!rounded-2xl !font-[Inter,sans-serif]" },
    });

    if (!result.isConfirmed) return;

    startTransition(async () => {
      const res = await unlinkTelegramAccount();
      if (res.error) {
        Swal.fire("Error", res.error, "error");
      } else {
        Swal.fire({
          title: "Terputus",
          text: "Akun Telegram berhasil diputuskan.",
          icon: "success",
          confirmButtonColor: "#16a34a",
        });
        fetchStatus();
      }
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200 dark:border-[#21262d] p-6 animate-pulse">
        <div className="h-5 w-44 bg-zinc-200 dark:bg-zinc-800 rounded-md mb-2" />
        <div className="h-4 w-72 bg-zinc-100 dark:bg-zinc-800/60 rounded-md" />
      </div>
    );
  }

  const linkedMembersCount = status?.members.filter((m) => m.isLinked).length ?? 0;

  return (
    <div className="bg-white dark:bg-[#161b22] rounded-2xl border border-slate-200 dark:border-[#21262d] p-6 space-y-6 shadow-xs">
      {/* ── Top Header ────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Bot className="w-5 h-5 text-sky-500" />
            <span>Integrasi Bot Telegram Workspace</span>
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Setiap anggota workspace dapat menghubungkan akun Telegram masing-masing untuk mencatat pengeluaran & pemasukan secara kolaboratif.
          </p>
        </div>

        {status?.isLinked && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-bold shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Akun Terhubung</span>
          </span>
        )}
      </div>

      {/* ── 1. Your Personal Connection Status ──────────────── */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Status Akun Anda
        </h3>

        {status?.isLinked ? (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <p className="text-zinc-500 dark:text-zinc-400">Telegram Anda:</p>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-0.5 font-mono">
                {status.telegramUsername ? `@${status.telegramUsername}` : "ID Chat Aktif"}
              </p>
              {status.telegramLinkedAt && (
                <p className="text-[10px] text-zinc-400 mt-0.5">
                  Terhubung sejak {new Date(status.telegramLinkedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {status.botUsername && (
                <a
                  href={`https://t.me/${status.botUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-bold hover:bg-sky-100 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Buka Chat</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}

              <button
                type="button"
                onClick={handleUnlink}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                <Unlink className="w-3.5 h-3.5" />
                <span>Putuskan</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-800/30 border border-slate-200/80 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                Akun Telegram Anda belum terhubung
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Hubungkan sekarang untuk dapat mencatat transaksi langsung dari chat Telegram.
              </p>
            </div>

            {status?.isBotConfigured ? (
              <button
                type="button"
                onClick={handleConnect}
                disabled={isPending}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Hubungkan Telegram Saya</span>
              </button>
            ) : (
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                Bot belum dikonfigurasi admin
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── 2. Workspace Members Telegram Status List ───────── */}
      {status?.members && status.members.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-zinc-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                Anggota Workspace ({status.members.length})
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
              {linkedMembersCount} dari {status.members.length} terhubung Telegram
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-zinc-800/80 border border-slate-200/80 dark:border-zinc-800 rounded-xl overflow-hidden text-xs">
            {status.members.map((member) => (
              <div
                key={member.id}
                className="p-3 bg-white dark:bg-zinc-900/40 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300 font-bold text-xs flex items-center justify-center shrink-0">
                    {member.name?.[0]?.toUpperCase() || member.email[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {member.name || member.email}
                      </p>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 uppercase">
                        {member.role}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 truncate">{member.email}</p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  {member.isLinked ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{member.telegramUsername ? `@${member.telegramUsername}` : "Terhubung"}</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-zinc-400">
                      Belum terhubung
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-zinc-400 leading-normal">
            💡 <i>Setiap anggota tim yang sudah menghubungkan akun Telegram dapat langsung mencatat transaksi secara real-time ke workspace ini.</i>
          </p>
        </div>
      )}

      {/* ── 3. Quick Command Cheat-Sheet ────────────────────── */}
      <div className="bg-sky-50/60 dark:bg-sky-950/20 border border-sky-200/70 dark:border-sky-800/40 rounded-xl p-3.5 text-xs text-sky-900 dark:text-sky-200 space-y-1">
        <p className="font-semibold flex items-center gap-1.5 text-sky-800 dark:text-sky-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Perintah Bot di Telegram:</span>
        </p>
        <p className="font-mono text-[11px] text-sky-700 dark:text-sky-300 leading-relaxed">
          • <code>lapor pengeluaran 15000 beli kertas HVS</code><br />
          • <code>keluar 50k makan siang</code><br />
          • <code>/workspace</code> (ganti workspace aktif jika punya lebih dari 1)<br />
          • <code>/saldo</code> (cek saldo dompet) | <code>/laporan</code> (rekap kas bulan ini)
        </p>
      </div>
    </div>
  );
}
