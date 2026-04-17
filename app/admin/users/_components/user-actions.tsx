"use client";

import { useState, useRef, useEffect } from "react";
import {
  MoreVertical, ShieldAlert, ShieldCheck, Crown, Ban,
  KeyRound, Pencil, ArrowUpRight, Loader2, Copy, Check
} from "lucide-react";
import {
  toggleAdminStatus, grantPremium, revokeSubscription,
  renameUser, adminSendPasswordReset
} from "@/app/actions/admin";
import Swal from "sweetalert2";

interface UserActionsProps {
  userId: string;
  userName: string | null;
  userEmail: string;
  isAdmin: boolean;
  isMe: boolean;
  hasActiveSubscription: boolean;
  hasPassword: boolean;
}

export function UserActions({
  userId, userName, userEmail, isAdmin, isMe, hasActiveSubscription, hasPassword
}: UserActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
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
    confirmColor = "#16a34a"
  ) => {
    close();
    const confirm = await Swal.fire({
      title: "Konfirmasi",
      text: confirmMessage,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: confirmColor,
      cancelButtonColor: "#71717a",
      confirmButtonText: "Ya, lanjutkan!",
      cancelButtonText: "Batal",
      customClass: { popup: "!rounded-2xl !font-[Inter,sans-serif]" },
    });

    if (!confirm.isConfirmed) return;

    setLoading(true);
    const res = await actionFn();
    setLoading(false);

    if (res.error) {
      Swal.fire({ title: "Gagal", text: res.error, icon: "error", confirmButtonColor: "#16a34a", customClass: { popup: "!rounded-2xl" } });
    } else if (res.warning && res.resetLink) {
      setResetLink(res.resetLink);
      Swal.fire({ title: "Perhatian", text: res.warning, icon: "warning", confirmButtonColor: "#16a34a", customClass: { popup: "!rounded-2xl" } });
    } else {
      Swal.fire({ title: "Berhasil!", icon: "success", timer: 1500, showConfirmButton: false, customClass: { popup: "!rounded-2xl" } });
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
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#71717a",
      confirmButtonText: "Simpan",
      cancelButtonText: "Batal",
      inputValidator: (value) => {
        if (!value || !value.trim()) return "Nama tidak boleh kosong!";
        if (value.trim().length > 80) return "Nama terlalu panjang!";
      },
      customClass: { popup: "!rounded-2xl !font-[Inter,sans-serif]", input: "!rounded-lg !border-zinc-200" },
    });

    if (!newName) return;

    setLoading(true);
    const res = await renameUser(userId, newName);
    setLoading(false);

    if (res.error) {
      Swal.fire({ title: "Gagal", text: res.error, icon: "error", confirmButtonColor: "#16a34a", customClass: { popup: "!rounded-2xl" } });
    } else {
      Swal.fire({ title: "Nama diperbarui!", icon: "success", timer: 1500, showConfirmButton: false, customClass: { popup: "!rounded-2xl" } });
    }
  };

  const copyLink = () => {
    if (!resetLink) return;
    navigator.clipboard.writeText(resetLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 justify-end">
      {/* Reset link inline display */}
      {resetLink && (
        <div className="flex items-center gap-1 max-w-[240px]">
          <code className="text-[10px] bg-amber-50 border border-amber-200 text-amber-700 px-1.5 py-0.5 rounded truncate max-w-[180px]">
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
          className="p-1 rounded-md text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreVertical className="w-5 h-5" />}
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-1 w-52 bg-white border border-zinc-100 shadow-xl rounded-xl py-1 z-50 overflow-hidden">
            {/* Open user profile in user view */}
            <a
              href={`/workspaces`}
              target="_blank"
              className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-zinc-50 transition-colors text-zinc-500"
            >
              <ArrowUpRight className="w-4 h-4" /> Lihat sebagai User
            </a>

            <div className="border-t border-zinc-50 my-1" />

            {/* Rename */}
            <button
              onClick={handleRename}
              className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-zinc-50 transition-colors text-zinc-700"
            >
              <Pencil className="w-4 h-4 text-zinc-400" /> Ganti Nama
            </button>

            {/* Reset password - only for users with password */}
            {hasPassword && (
              <button
                onClick={() => handleAction(
                  () => adminSendPasswordReset(userId),
                  `Kirim email reset password ke ${userEmail}?`
                )}
                className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-blue-50 transition-colors text-blue-600"
              >
                <KeyRound className="w-4 h-4" /> Reset Password
              </button>
            )}

            <div className="border-t border-zinc-50 my-1" />

            {/* Toggle admin */}
            {!isMe && (
              <button
                onClick={() => handleAction(
                  () => toggleAdminStatus(userId, !isAdmin),
                  `${isAdmin ? "Cabut hak Admin dari" : "Jadikan Admin untuk"} user ini?`,
                  isAdmin ? "#ef4444" : "#16a34a"
                )}
                className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-zinc-50 transition-colors text-zinc-700"
              >
                {isAdmin
                  ? <><ShieldAlert className="w-4 h-4 text-amber-500" /> Cabut Hak Admin</>
                  : <><ShieldCheck className="w-4 h-4 text-emerald-500" /> Jadikan Admin</>}
              </button>
            )}

            {/* Grant premium */}
            <button
              onClick={() => handleAction(
                () => grantPremium(userId, "basic"),
                "Berikan paket premium BASIC gratis 1 tahun?"
              )}
              className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-green-50 transition-colors text-green-600"
            >
              <Crown className="w-4 h-4" /> Beri Premium (Basic)
            </button>

            <button
              onClick={() => handleAction(
                () => grantPremium(userId, "pro"),
                "Berikan paket premium PRO gratis 1 tahun?"
              )}
              className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-emerald-50 transition-colors text-emerald-600"
            >
              <Crown className="w-4 h-4" /> Beri Premium (Pro)
            </button>

            {/* Revoke subscription */}
            {hasActiveSubscription && (
              <>
                <div className="border-t border-zinc-50 my-1" />
                <button
                  onClick={() => handleAction(
                    () => revokeSubscription(userId),
                    "Cabut akses langganan premium user ini?",
                    "#ef4444"
                  )}
                  className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-red-50 transition-colors text-red-600"
                >
                  <Ban className="w-4 h-4" /> Cabut Langganan
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
