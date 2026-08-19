"use client";

import { useState } from "react";
import { X, Crown, Sparkles, Check, Clock } from "lucide-react";
import { grantPremium } from "@/app/actions/admin";
import Swal from "sweetalert2";

interface GrantSubscriptionModalProps {
  userId: string;
  userName: string | null;
  userEmail: string;
  onClose: () => void;
}

export function GrantSubscriptionModal({
  userId,
  userName,
  userEmail,
  onClose,
}: GrantSubscriptionModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"basic" | "pro">("pro");
  const [selectedDuration, setSelectedDuration] = useState<number>(12); // months (-1 = lifetime)
  const [sendNotificationEmail, setSendNotificationEmail] = useState<boolean>(true);

  const durations = [
    { label: "1 Bulan", value: 1 },
    { label: "3 Bulan", value: 3 },
    { label: "6 Bulan", value: 6 },
    { label: "1 Tahun", value: 12 },
    { label: "Seumur Hidup (Lifetime)", value: -1 },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await grantPremium(
      userId,
      selectedPlan,
      selectedDuration,
      sendNotificationEmail
    );
    setLoading(false);

    if (res.success) {
      Swal.fire({
        title: "Akses Berhasil Diberikan!",
        text: `Paket ${selectedPlan.toUpperCase()} telah diaktifkan untuk ${userName || userEmail}.${sendNotificationEmail ? " Email notifikasi telah dikirim ke pengguna." : ""}`,
        icon: "success",
        confirmButtonColor: "#004C29",
        customClass: { popup: "!rounded-2xl" },
      });
      onClose();
    } else {
      Swal.fire({
        title: "Gagal",
        text: res.error,
        icon: "error",
        confirmButtonColor: "#ef4444",
        customClass: { popup: "!rounded-2xl" },
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#161b22] rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-[#21262d] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                Atur Paket Langganan Manual
              </h2>
              <p className="text-[11px] text-zinc-400">
                Untuk: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{userName || userEmail}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Plan Choice */}
          <div>
            <label className="font-bold text-zinc-700 dark:text-zinc-300 mb-2 block">
              Pilih Paket Langganan
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedPlan("basic")}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedPlan === "basic"
                    ? "border-green-600 bg-green-50/50 dark:bg-green-950/30 text-green-900 dark:text-green-200 ring-2 ring-green-600/20"
                    : "border-slate-200 dark:border-zinc-700 hover:border-slate-300 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-xs">BASIC</span>
                  {selectedPlan === "basic" && <Check className="w-3.5 h-3.5 text-green-600" />}
                </div>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  3 Workspace • 500 Tx/bln • 5 Members • Export Excel
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPlan("pro")}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedPlan === "pro"
                    ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/20"
                    : "border-slate-200 dark:border-zinc-700 hover:border-slate-300 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-extrabold text-xs flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" /> PRO
                  </span>
                  {selectedPlan === "pro" && <Check className="w-3.5 h-3.5 text-amber-500" />}
                </div>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  Unlimited Workspace • Unlimited Tx & Members • Deep Insights
                </p>
              </button>
            </div>
          </div>

          {/* Duration Choice */}
          <div>
            <label className="font-bold text-zinc-700 dark:text-zinc-300 mb-2 block flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span>Durasi Akses Aktif</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {durations.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setSelectedDuration(d.value)}
                  className={`px-3 py-2 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                    selectedDuration === d.value
                      ? "border-green-600 bg-green-600 text-white shadow-xs"
                      : "border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 hover:bg-slate-100"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Email Notification Option */}
          <div className="pt-2">
            <label className="flex items-center gap-2.5 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={sendNotificationEmail}
                onChange={(e) => setSendNotificationEmail(e.target.checked)}
                className="w-4 h-4 rounded text-green-600 focus:ring-green-500 border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800"
              />
              <span>Kirim email notifikasi aktivasi langganan ke pengguna</span>
            </label>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl font-bold text-zinc-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-70 cursor-pointer active:scale-95"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>{loading ? "Memproses..." : "Aktifkan Langganan"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
