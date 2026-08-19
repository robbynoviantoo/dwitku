"use client";

import { useState } from "react";
import { RefreshCw, Sparkles } from "lucide-react";
import { resetDefaultPlans } from "@/app/actions/admin";
import Swal from "sweetalert2";

export function SyncDefaultPlansButton() {
  const [loading, setLoading] = useState(false);

  const handleSync = async () => {
    const confirm = await Swal.fire({
      title: "Sinkronisasi Default Plans?",
      text: "Konfigurasi bawaan (Gratis 1 ws/50 tx, Basic, Pro) akan di-update ke database.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Sinkronkan",
      cancelButtonText: "Batal",
      confirmButtonColor: "#004C29",
      customClass: { popup: "!rounded-2xl" },
    });

    if (!confirm.isConfirmed) return;

    setLoading(true);
    const res = await resetDefaultPlans();
    setLoading(false);

    if ("success" in res && res.success) {
      Swal.fire({
        title: "Berhasil Disinkronkan!",
        text: "Semua paket berhasil disesuaikan dengan konfigurasi sistem.",
        icon: "success",
        confirmButtonColor: "#004C29",
        customClass: { popup: "!rounded-2xl" },
      });
    } else {
      Swal.fire({
        title: "Gagal",
        text: res.error || "Gagal sinkronisasi.",
        icon: "error",
        confirmButtonColor: "#ef4444",
        customClass: { popup: "!rounded-2xl" },
      });
    }
  };

  return (
    <button
      onClick={handleSync}
      disabled={loading}
      className="px-3.5 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
    >
      <RefreshCw className={`w-3.5 h-3.5 text-green-600 ${loading ? "animate-spin" : ""}`} />
      <span>{loading ? "Menyinkronkan..." : "Sinkronkan Default Plans"}</span>
    </button>
  );
}
