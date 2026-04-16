"use client";

import { useState } from "react";
import { CheckCircle2, Crown, Zap, Star, Clock, AlertCircle, Lock, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLAN_LIMITS, type PlanKey } from "@/lib/subscription-limits";
import { cancelSubscription } from "@/app/actions/subscription";
import Swal from "sweetalert2";

type SubStatus = "TRIAL" | "ACTIVE" | "EXPIRED" | "CANCELLED";

interface SubscriptionData {
  id: string;
  status: SubStatus;
  trialEndsAt?: string | null;
  currentPeriodEnd?: string | null;
  plan: { key: string; name: string; priceMonthly: number };
}

interface BillingClientProps {
  subscription: SubscriptionData | null;
  user: { name?: string | null; email?: string | null };
}

const PLAN_CARDS: { key: PlanKey; badge?: string; color: string; highlight?: boolean }[] = [
  { key: "free", color: "border-zinc-200" },
  { key: "basic", badge: "Paling Populer", color: "border-green-500", highlight: true },
  { key: "pro", badge: "Power User", color: "border-purple-400" },
];

const STATUS_CONFIG: Record<SubStatus, { label: string; color: string; icon: any }> = {
  TRIAL: { label: "Trial Aktif", color: "text-emerald-600 bg-emerald-50 border-emerald-200", icon: Clock },
  ACTIVE: { label: "Aktif", color: "text-green-600 bg-green-50 border-green-200", icon: CheckCircle2 },
  EXPIRED: { label: "Kadaluarsa", color: "text-red-600 bg-red-50 border-red-200", icon: AlertCircle },
  CANCELLED: { label: "Dibatalkan", color: "text-zinc-600 bg-zinc-50 border-zinc-200", icon: AlertCircle },
};

export function BillingClient({ subscription, user }: BillingClientProps) {
  const [loading, setLoading] = useState<PlanKey | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const currentPlanKey = (subscription?.plan?.key as PlanKey) ?? "free";
  const subStatus = subscription?.status;

  const loadMidtransScript = (): Promise<void> =>
    new Promise((resolve) => {
      if ((window as any).snap) { resolve(); return; }
      const script = document.createElement("script");
      script.src = process.env.NODE_ENV === "production"
        ? "https://app.midtrans.com/snap/snap.js"
        : "https://app.sandbox.midtrans.com/snap/snap.js";
      script.setAttribute("data-client-key", process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? "");
      script.onload = () => resolve();
      document.head.appendChild(script);
    });

  const handleSubscribe = async (planKey: PlanKey) => {
    if (planKey === "free") return;
    setLoading(planKey);
    try {
      await loadMidtransScript();
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planKey }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      (window as any).snap.pay(data.token, {
        onSuccess: async (result: any) => {
          Swal.fire({
            title: "Menyiapkan Akun... ⏳",
            text: "Sedang mensinkronisasi data langgananmu.",
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
          });
          
          await fetch("/api/payment/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: result.order_id }),
          });

          Swal.fire({
            title: "Pembayaran Berhasil! 🎉",
            text: "Langgananmu sudah aktif. Selamat menikmati fitur premium!",
            icon: "success",
            confirmButtonColor: "#16a34a",
            confirmButtonText: "Lanjut",
            customClass: { popup: "!rounded-2xl" },
          }).then(() => window.location.reload());
        },
        onPending: async (result: any) => {
          Swal.fire({ title: "Menunggu Pembayaran", text: "Kami akan mengaktifkan akunmu setelah pembayaran dikonfirmasi.", icon: "info", confirmButtonColor: "#16a34a", customClass: { popup: "!rounded-2xl" } });
        },
        onError: () => {
          Swal.fire({ title: "Pembayaran Gagal", text: "Silakan coba kembali.", icon: "error", confirmButtonColor: "#16a34a", customClass: { popup: "!rounded-2xl" } });
        },
      });
    } catch (e: any) {
      Swal.fire({ title: "Error", text: e.message, icon: "error", confirmButtonColor: "#16a34a", customClass: { popup: "!rounded-2xl" } });
    } finally {
      setLoading(null);
    }
  };

  const handleCancel = async () => {
    const result = await Swal.fire({
      title: "Batalkan Langganan?",
      text: "Kamu masih bisa menggunakan fitur premium hingga akhir periode ini.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Batalkan",
      cancelButtonText: "Tidak",
      confirmButtonColor: "#dc2626",
      customClass: { popup: "!rounded-2xl" },
    });
    if (!result.isConfirmed) return;
    setCancelling(true);
    const res = await cancelSubscription();
    setCancelling(false);
    if (res?.success) {
      Swal.fire({ title: "Berhasil", text: "Langganan dibatalkan.", icon: "success", confirmButtonColor: "#16a34a", customClass: { popup: "!rounded-2xl" } })
        .then(() => window.location.reload());
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl lg:max-w-full mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
          <Crown className="w-6 h-6 text-amber-500" />
          Billing & Langganan
        </h1>
        <p className="text-zinc-500 text-sm mt-1">Kelola paket langganan dan pembayaranmu.</p>
      </div>

      {/* Current Plan Banner */}
      {subscription && (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                {subStatus === "ACTIVE" ? <Star className="w-5 h-5 text-amber-500" /> : <Clock className="w-5 h-5 text-emerald-500" />}
              </div>
              <div>
                <p className="font-bold text-zinc-900">{subscription.plan.name}</p>
                <p className="text-xs text-zinc-500">
                  {subStatus === "TRIAL" && subscription.trialEndsAt
                    ? `Trial hingga ${new Date(subscription.trialEndsAt).toLocaleDateString("id-ID")}`
                    : subStatus === "ACTIVE" && subscription.currentPeriodEnd
                    ? `Aktif hingga ${new Date(subscription.currentPeriodEnd).toLocaleDateString("id-ID")}`
                    : "Tidak aktif"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {subStatus && (
                <span className={cn("flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full border", STATUS_CONFIG[subStatus].color)}>
                  {subStatus === "ACTIVE" && <CheckCircle2 className="w-3 h-3" />}
                  {STATUS_CONFIG[subStatus].label}
                </span>
              )}
              {(subStatus === "ACTIVE" || subStatus === "TRIAL") && (
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="text-xs text-red-500 hover:text-red-700 font-medium px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
                >
                  {cancelling ? "..." : "Batalkan"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Plan cards */}
      <h2 className="text-base font-bold text-zinc-700 mb-4">Pilih Paket</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {PLAN_CARDS.map(({ key, badge, color, highlight }) => {
          const limits = PLAN_LIMITS[key];
          const isCurrent = currentPlanKey === key && (subStatus === "ACTIVE" || subStatus === "TRIAL");
          return (
            <div key={key} className={cn("bg-white rounded-2xl border-2 p-6 flex flex-col relative", color, highlight && "shadow-lg shadow-green-100")}>
              {badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-green-600 text-white text-[11px] font-bold rounded-full whitespace-nowrap">
                  {badge}
                </div>
              )}
              <div className="mb-4">
                <h3 className="font-bold text-lg text-zinc-900">{limits.displayName}</h3>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-extrabold text-zinc-900">
                    {limits.priceMonthly === 0 ? "Gratis" : `Rp ${limits.priceMonthly.toLocaleString("id-ID")}`}
                  </span>
                  {limits.priceMonthly > 0 && <span className="text-xs text-zinc-400">/ bulan</span>}
                </div>
              </div>

              {/* Gating features */}
              <ul className="space-y-2 mb-6 flex-1 text-sm">
                {[
                  limits.maxWorkspaces === -1 ? "Unlimited workspace" : `${limits.maxWorkspaces} workspace`,
                  limits.maxTx === -1 ? "Unlimited transaksi" : `${limits.maxTx} transaksi`,
                  limits.maxCategories === -1 ? "Unlimited kategori custom" : `${limits.maxCategories} kategori custom`,
                  ...(limits.canExport ? ["Export Excel & CSV"] : []),
                  ...(limits.canReport ? ["Laporan & grafik lanjutan"] : []),
                  ...(limits.canBudget ? ["Budgeting & notifikasi"] : []),
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-zinc-600">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <div className="w-full text-center py-2.5 rounded-xl text-sm font-semibold bg-green-50 text-green-700 border border-green-200">
                  ✓ Paket Aktif
                </div>
              ) : key === "free" ? (
                <div className="w-full text-center py-2.5 rounded-xl text-sm font-medium text-zinc-400 bg-zinc-50">
                  Gratis Selamanya
                </div>
              ) : (
                <button
                  onClick={() => handleSubscribe(key)}
                  disabled={loading === key}
                  className={cn(
                    "w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all",
                    key === "basic" ? "bg-green-600 hover:bg-green-700 text-white shadow-sm" : "bg-purple-600 hover:bg-purple-700 text-white shadow-sm",
                    loading === key && "opacity-70",
                  )}
                >
                  {loading === key
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>
                    : <><Zap className="w-4 h-4" /> Pilih {limits.displayName}</>}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Info */}
      <div className="mt-8 p-4 bg-zinc-50 rounded-xl border border-zinc-100 text-sm text-zinc-500 flex items-start gap-2">
        <Lock className="w-4 h-4 mt-0.5 shrink-0 text-zinc-400" />
        <p>Pembayaran diproses dengan aman melalui Midtrans. Kami tidak menyimpan data kartu kredit atau rekening bankmu.</p>
      </div>
    </div>
  );
}
