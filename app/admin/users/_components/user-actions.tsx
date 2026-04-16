"use client";

import { useState } from "react";
import { MoreVertical, ShieldAlert, ShieldCheck, Crown, Ban } from "lucide-react";
import { toggleAdminStatus, grantPremium, revokeSubscription } from "@/app/actions/admin";
import Swal from "sweetalert2";

interface UserActionsProps {
  userId: string;
  isAdmin: boolean;
  isMe: boolean;
  hasActiveSubscription: boolean;
}

export function UserActions({ userId, isAdmin, isMe, hasActiveSubscription }: UserActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const close = () => setIsOpen(false);

  const handleAction = async (actionFn: () => Promise<{ success?: boolean; error?: string }>, confirmMessage: string) => {
    close();
    const result = await Swal.fire({
      title: "Konfirmasi",
      text: confirmMessage,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, lanjutkan!",
      cancelButtonText: "Batal",
      customClass: { popup: "!rounded-2xl" },
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    const res = await actionFn();
    setLoading(false);

    if (res.success) {
      Swal.fire({
        title: "Berhasil",
        icon: "success",
        confirmButtonColor: "#16a34a",
        customClass: { popup: "!rounded-2xl" },
      });
    } else {
      Swal.fire({
        title: "Gagal",
        text: res.error,
        icon: "error",
        confirmButtonColor: "#16a34a",
        customClass: { popup: "!rounded-2xl" },
      });
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="p-1 rounded-md text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors disabled:opacity-50"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white border border-zinc-100 shadow-xl rounded-xl py-1 z-50 overflow-hidden">
          {!isMe && (
            <button
              onClick={() => handleAction(() => toggleAdminStatus(userId, !isAdmin), `Apakah Anda yakin ingin ${isAdmin ? 'mencabut' : 'menjadikan'} user ini Admin?`)}
              className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-zinc-50 transition-colors text-zinc-700"
            >
              {isAdmin ? <ShieldAlert className="w-4 h-4 text-amber-500" /> : <ShieldCheck className="w-4 h-4 text-emerald-500" />}
              {isAdmin ? "Cabut Hak Admin" : "Jadikan Admin"}
            </button>
          )}

          <button
            onClick={() => handleAction(() => grantPremium(userId, "basic"), "Berikan paket premium BASIC secara gratis selama 1 tahun ke user ini?")}
            className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-green-50 transition-colors text-green-600"
          >
            <Crown className="w-4 h-4" /> Beri Premium (Basic)
          </button>

          <button
            onClick={() => handleAction(() => grantPremium(userId, "pro"), "Berikan paket premium PRO secara gratis selama 1 tahun ke user ini?")}
            className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-emerald-50 transition-colors text-emerald-600"
          >
            <Crown className="w-4 h-4" /> Beri Premium (Pro)
          </button>

          {hasActiveSubscription && (
            <button
              onClick={() => handleAction(() => revokeSubscription(userId), "Cabut akses langganan premium user ini (turun ke Expired/Free)?")}
              className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-red-50 transition-colors text-red-600"
            >
              <Ban className="w-4 h-4" /> Cabut Langganan
            </button>
          )}
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={close} />
      )}
    </div>
  );
}
