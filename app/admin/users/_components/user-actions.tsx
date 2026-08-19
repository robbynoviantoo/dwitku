"use client";

import { useState, useRef, useEffect } from "react";
import {
  MoreVertical,
  ShieldAlert,
  ShieldCheck,
  Crown,
  Ban,
  KeyRound,
  Pencil,
  ArrowUpRight,
  Loader2,
  Copy,
  Check,
  Trash2,
  Sparkles,
} from "lucide-react";
import {
  toggleAdminStatus,
  revokeSubscription,
  resetTrialStatus,
  renameUser,
  adminSendPasswordReset,
  deleteUser,
} from "@/app/actions/admin";
import { GrantSubscriptionModal } from "./grant-subscription-modal";
import Swal from "sweetalert2";

interface UserActionsProps {
  userId: string;
  userName: string | null;
  userEmail: string;
  isAdmin: boolean;
  isMe: boolean;
  hasActiveSubscription: boolean;
  hasUsedTrial?: boolean;
  hasPassword: boolean;
}

export function UserActions({
  userId,
  userName,
  userEmail,
  isAdmin,
  isMe,
  hasActiveSubscription,
  hasUsedTrial,
  hasPassword,
}: UserActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);
  const [resetLink, setResetLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const close = () => setIsOpen(false);

  const handleAction = async (
    actionFn: () => Promise<{ success?: boolean; error?: string; warning?: string; resetLink?: string }>,
    confirmMessage: string,
    confirmColor = "#004C29"
  ) => {
    close();
    const confirm = await Swal.fire({
      title: "Konfirmasi Tindakan",
      text: confirmMessage,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: confirmColor,
      cancelButtonColor: "#71717a",
      confirmButtonText: "Ya, lanjutkan!",
      cancelButtonText: "Batal",
      customClass: { popup: "!rounded-2xl" },
    });

    if (!confirm.isConfirmed) return;

    setLoading(true);
    const res = await actionFn();
    setLoading(false);

    if (res.error) {
      Swal.fire({
        title: "Gagal",
        text: res.error,
        icon: "error",
        confirmButtonColor: "#ef4444",
        customClass: { popup: "!rounded-2xl" },
      });
    } else if (res.warning && res.resetLink) {
      setResetLink(res.resetLink);
      Swal.fire({
        title: "Perhatian",
        text: res.warning,
        icon: "warning",
        confirmButtonColor: "#004C29",
        customClass: { popup: "!rounded-2xl" },
      });
    } else {
      Swal.fire({
        title: "Berhasil!",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        customClass: { popup: "!rounded-2xl" },
      });
    }
  };

  const handleRename = async () => {
    close();
    const { value: newName } = await Swal.fire({
      title: "Ganti Nama Pengguna",
      input: "text",
      inputValue: userName ?? "",
      inputPlaceholder: "Nama baru...",
      showCancelButton: true,
      confirmButtonColor: "#004C29",
      cancelButtonColor: "#71717a",
      confirmButtonText: "Simpan",
      cancelButtonText: "Batal",
      inputValidator: (value) => {
        if (!value || !value.trim()) return "Nama tidak boleh kosong!";
        if (value.trim().length > 80) return "Nama terlalu panjang!";
      },
      customClass: { popup: "!rounded-2xl", input: "!rounded-xl !border-zinc-300" },
    });

    if (!newName) return;

    setLoading(true);
    const res = await renameUser(userId, newName);
    setLoading(false);

    if (res.error) {
      Swal.fire({
        title: "Gagal",
        text: res.error,
        icon: "error",
        confirmButtonColor: "#ef4444",
        customClass: { popup: "!rounded-2xl" },
      });
    } else {
      Swal.fire({
        title: "Nama diperbarui!",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        customClass: { popup: "!rounded-2xl" },
      });
    }
  };

  const copyLink = () => {
    if (!resetLink) return;
    navigator.clipboard.writeText(resetLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="flex items-center gap-2 justify-end">
        {/* Reset link inline display */}
        {resetLink && (
          <div className="flex items-center gap-1 max-w-[240px]">
            <code className="text-[10px] bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded truncate max-w-[180px]">
              {resetLink}
            </code>
            <button
              onClick={copyLink}
              title="Salin link"
              className="p-1 rounded text-amber-600 hover:bg-amber-100 transition-colors"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        )}

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            disabled={loading}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreVertical className="w-4 h-4" />}
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-1 w-56 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#21262d] shadow-xl rounded-2xl py-1 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Grant Subscription Button */}
              <button
                onClick={() => {
                  close();
                  setIsGrantModalOpen(true);
                }}
                className="w-full px-3.5 py-2 text-left text-xs font-bold flex items-center gap-2 hover:bg-green-50 dark:hover:bg-green-950/40 text-green-700 dark:text-green-300 transition-colors cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                <span>Atur / Beri Langganan</span>
              </button>

              <div className="border-t border-slate-100 dark:border-zinc-800 my-1" />

              {/* Rename */}
              <button
                onClick={handleRename}
                className="w-full px-3.5 py-2 text-left text-xs font-medium flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5 text-zinc-400" />
                <span>Ganti Nama User</span>
              </button>

              {/* Reset password */}
              {hasPassword && (
                <button
                  onClick={() =>
                    handleAction(
                      () => adminSendPasswordReset(userId),
                      `Kirim email link reset password ke ${userEmail}?`
                    )
                  }
                  className="w-full px-3.5 py-2 text-left text-xs font-medium flex items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-600 dark:text-blue-400 transition-colors cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Kirim Reset Password</span>
                </button>
              )}

              {/* Toggle admin */}
              {!isMe && (
                <button
                  onClick={() =>
                    handleAction(
                      () => toggleAdminStatus(userId, !isAdmin),
                      `${isAdmin ? "Cabut hak Super Admin dari" : "Jadikan Super Admin untuk"} user ini?`,
                      isAdmin ? "#ef4444" : "#004C29"
                    )
                  }
                  className="w-full px-3.5 py-2 text-left text-xs font-medium flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                >
                  {isAdmin ? (
                    <>
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                      <span>Cabut Hak Admin</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Jadikan Super Admin</span>
                    </>
                  )}
                </button>
              )}

              {/* Revoke subscription */}
              {hasActiveSubscription && (
                <>
                  <div className="border-t border-slate-100 dark:border-zinc-800 my-1" />
                  <button
                    onClick={() =>
                      handleAction(
                        () => revokeSubscription(userId),
                        "Cabut akses langganan berbayar user ini dan kembalikan ke paket Gratis?",
                        "#ef4444"
                      )
                    }
                    className="w-full px-3.5 py-2 text-left text-xs font-medium flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 transition-colors cursor-pointer"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Cabut Langganan (Free)</span>
                  </button>
                </>
              )}

              {/* Reset Trial */}
              {hasUsedTrial && (
                <button
                  onClick={() =>
                    handleAction(
                      () => resetTrialStatus(userId),
                      `Reset status kuota trial untuk ${userName || userEmail}? Pengguna ini akan dapat mengklaim trial gratis 7 hari kembali di halaman billing.`,
                      "#004C29"
                    )
                  }
                  className="w-full px-3.5 py-2 text-left text-xs font-medium flex items-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-700 dark:text-purple-300 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                  <span>Reset Kuota Trial (Bisa Trial Lagi)</span>
                </button>
              )}

              {/* Delete User */}
              {!isMe && (
                <>
                  <div className="border-t border-slate-100 dark:border-zinc-800 my-1" />
                  <button
                    onClick={() =>
                      handleAction(
                        () => deleteUser(userId),
                        `Hapus pengguna ${userName || userEmail} secara permanen? Semua data yang terkait akan dihapus dan tindakan ini tidak dapat dibatalkan.`,
                        "#dc2626"
                      )
                    }
                    className="w-full px-3.5 py-2 text-left text-xs font-bold flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Pengguna</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {isGrantModalOpen && (
        <GrantSubscriptionModal
          userId={userId}
          userName={userName}
          userEmail={userEmail}
          onClose={() => setIsGrantModalOpen(false)}
        />
      )}
    </>
  );
}

