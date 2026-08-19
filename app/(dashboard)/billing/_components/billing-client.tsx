"use client";

import { useState } from "react";
import { CheckCircle2, Crown, Zap, Star, Clock, AlertCircle, Lock, ChevronRight, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLAN_LIMITS, type PlanKey } from "@/lib/subscription-limits";
import { cancelSubscription, claimFreeTrial } from "@/app/actions/subscription";
import Swal from "sweetalert2";
import { useLanguage } from "@/components/providers/language-provider";

type SubStatus = "TRIAL" | "ACTIVE" | "EXPIRED" | "CANCELLED";

interface SubscriptionData {
  id: string;
  status: SubStatus;
  hasUsedTrial?: boolean;
  trialEndsAt?: string | null;
  currentPeriodEnd?: string | null;
  plan: { key: string; name: string; priceMonthly: number };
}

interface BillingClientProps {
  subscription: SubscriptionData | null;
  user: { name?: string | null; email?: string | null };
  dbPlans?: any[];
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

export function BillingClient({ subscription, user, dbPlans }: BillingClientProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState<PlanKey | null>(null);
  const [claimingTrial, setClaimingTrial] = useState(false);

  const { locale, t } = useLanguage();

  const getStatusLabel = (status: SubStatus) => {
    switch (status) {
      case "TRIAL": return t("billing.trialStatus");
      case "ACTIVE": return t("billing.activeStatus");
      case "EXPIRED": return t("billing.expiredStatus");
      case "CANCELLED": return t("billing.cancelledStatus");
      default: return status;
    }
  };

  const currentPlanKey = (subscription?.plan?.key as PlanKey) ?? "free";
  const subStatus = subscription?.status;
  const isBasicActive = currentPlanKey === "basic" && subStatus === "ACTIVE";
  const isProActive = currentPlanKey === "pro" && subStatus === "ACTIVE";

  const getPlanCardBadge = (key: PlanKey) => {
    if (key === "pro" && isBasicActive) return "Upgrade Hemat";
    if (key === "basic") return locale === "id" ? "Paling Populer" : "Most Popular";
    if (key === "pro") return "Power User";
    return undefined;
  };

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
        body: JSON.stringify({ planKey, billingCycle }),
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
            confirmButtonColor: "#004C29",
            confirmButtonText: "Lanjut",
            customClass: { popup: "!rounded-2xl" },
          }).then(() => window.location.reload());
        },
        onPending: async (result: any) => {
          Swal.fire({ title: t("billing.pendingTitle"), text: t("billing.pendingText"), icon: "info", confirmButtonColor: "#004C29", customClass: { popup: "!rounded-2xl" } });
        },
        onError: () => {
          Swal.fire({ title: t("billing.failedTitle"), text: t("billing.failedText"), icon: "error", confirmButtonColor: "#dc2626", customClass: { popup: "!rounded-2xl" } });
        },
      });
    } catch (e: any) {
      Swal.fire({ title: "Error", text: e.message, icon: "error", confirmButtonColor: "#dc2626", customClass: { popup: "!rounded-2xl" } });
    } finally {
      setLoading(null);
    }
  };

  const canClaimTrial =
    !subscription?.hasUsedTrial &&
    currentPlanKey === "free" &&
    subStatus !== "ACTIVE" &&
    subStatus !== "TRIAL";

  const handleClaimTrial = async () => {
    setClaimingTrial(true);
    const res = await claimFreeTrial("pro");
    setClaimingTrial(false);
    if (res?.success) {
      Swal.fire({
        title: "Trial Pro 7 Hari Aktif! 🎉",
        text: "Selamat menikmati seluruh fitur premium Dwitku secara gratis selama 7 hari.",
        icon: "success",
        confirmButtonColor: "#004C29",
        confirmButtonText: "Mulai Jelajahi",
        customClass: { popup: "!rounded-2xl" },
      }).then(() => window.location.reload());
    } else {
      Swal.fire({
        title: "Gagal Mengaktifkan Trial",
        text: res?.error || "Terjadi kesalahan.",
        icon: "error",
        confirmButtonColor: "#dc2626",
        customClass: { popup: "!rounded-2xl" },
      });
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl lg:max-w-full mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
          <Crown className="w-6 h-6 text-amber-500" />
          {t("billing.title")}
        </h1>
        <p className="text-zinc-500 text-sm mt-1">{t("billing.subtitle")}</p>
      </div>

      {/* Free Trial Claim Banner (Only visible if never claimed before) */}
      {canClaimTrial && (
        <div className="mb-8 p-6 rounded-3xl bg-linear-to-r from-emerald-900 via-green-900 to-emerald-950 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 border border-green-700/50">
          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold mb-2.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SPESIAL PENGGUNA BARU</span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold tracking-tight">
              Coba Semua Fitur Pro Gratis 7 Hari
            </h3>
            <p className="text-xs text-emerald-100/80 mt-1 leading-relaxed">
              Nikmati Unlimited Workspace, Ekspor Laporan Excel, Deep Insights, dan Kolaborasi Tim tanpa biaya & tanpa kartu kredit.
            </p>
          </div>
          <button
            onClick={handleClaimTrial}
            disabled={claimingTrial}
            className="relative z-10 px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-extrabold text-xs transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 shrink-0"
          >
            {claimingTrial ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                <span>Mengaktifkan...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-zinc-950" />
                <span>Klaim 7 Hari Trial Pro Sekarang →</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Current Plan Banner */}
      {subscription && (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                {subStatus === "ACTIVE" ? <Star className="w-5 h-5 text-amber-500" /> : <Clock className="w-5 h-5 text-green-600" />}
              </div>
              <div>
                <p className="font-bold text-zinc-900">{subscription.plan.name}</p>
                <p className="text-xs text-zinc-500">
                  {subStatus === "TRIAL" && subscription.trialEndsAt
                    ? `${t("billing.trialUntil")} ${new Date(subscription.trialEndsAt).toLocaleDateString("id-ID")}`
                    : subStatus === "ACTIVE" && subscription.currentPeriodEnd
                    ? `${t("billing.activeUntil")} ${new Date(subscription.currentPeriodEnd).toLocaleDateString("id-ID")}`
                    : "Tidak aktif"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {subStatus && (
                <span className={cn("flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full border", STATUS_CONFIG[subStatus].color)}>
                  {subStatus === "ACTIVE" && <CheckCircle2 className="w-3 h-3" />}
                  {getStatusLabel(subStatus)}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Plan Header & Billing Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-zinc-900">Pilih Paket Langganan</h2>
          <p className="text-xs text-zinc-500">Tingkatkan performa keuanganmu dengan fitur premium</p>
        </div>

        {/* Monthly vs Yearly Toggle */}
        <div className="flex items-center bg-slate-100 dark:bg-zinc-800 p-1 rounded-2xl border border-slate-200 dark:border-zinc-700 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={cn(
              "px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
              billingCycle === "monthly"
                ? "bg-white dark:bg-[#161b22] text-zinc-900 dark:text-zinc-100 shadow-xs"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
            )}
          >
            Bulanan
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("yearly")}
            className={cn(
              "px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5",
              billingCycle === "yearly"
                ? "bg-green-600 text-white shadow-xs"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
            )}
          >
            <span>Tahunan</span>
            <span className={cn(
              "text-[10px] font-extrabold px-1.5 py-0.2 rounded-full",
              billingCycle === "yearly" ? "bg-white/20 text-white" : "bg-green-500/15 text-green-700 dark:text-green-300"
            )}>
              Hemat 20%
            </span>
          </button>
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {PLAN_CARDS.map(({ key, badge, color, highlight }) => {
          const defaultLimits = PLAN_LIMITS[key];
          const dbPlan = dbPlans?.find((p) => p.key === key);

          const limits = {
            ...defaultLimits,
            ...(dbPlan
              ? {
                  displayName: dbPlan.name || defaultLimits.displayName,
                  priceMonthly: dbPlan.priceMonthly,
                  priceYearly:
                    dbPlan.priceYearly > 0
                      ? dbPlan.priceYearly
                      : defaultLimits.priceYearly > 0
                      ? defaultLimits.priceYearly
                      : dbPlan.priceMonthly * 10,
                  maxWorkspaces: dbPlan.maxWorkspaces,
                  maxMembers: dbPlan.maxMembers,
                  maxTx: dbPlan.maxTx,
                  maxCategories: dbPlan.maxCategories,
                  canExport: dbPlan.canExport,
                  canReport: dbPlan.canReport,
                }
              : {}),
          };

          const isCurrent = currentPlanKey === key && (subStatus === "ACTIVE" || subStatus === "TRIAL");
          const isYearly = billingCycle === "yearly";

          const rawDisplayPrice = isYearly
            ? limits.priceYearly === 0
              ? 0
              : limits.priceYearly
            : limits.priceMonthly;

          // Hitung Prorata Harian jika user aktif Basic dan ingin Upgrade ke Pro (Model 1)
          const isUpgradeToPro = isBasicActive && key === "pro";
          const basicDbPlan = dbPlans?.find((p) => p.key === "basic");

          let unusedCredit = 0;
          let daysRemaining = 0;

          if (isUpgradeToPro && subscription?.currentPeriodEnd) {
            const now = Date.now();
            const periodEndMs = new Date(subscription.currentPeriodEnd).getTime();
            const msRemaining = Math.max(0, periodEndMs - now);
            daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));

            const isBasicYearly = daysRemaining > 31;
            const basicDailyRate = isBasicYearly
              ? (basicDbPlan?.priceYearly > 0
                  ? basicDbPlan.priceYearly
                  : (basicDbPlan?.priceMonthly || 25000) * 10) / 365
              : (basicDbPlan?.priceMonthly || 25000) / 30;

            unusedCredit = Math.min(
              Math.round(daysRemaining * basicDailyRate),
              rawDisplayPrice - 1000
            );
          }

          const displayPrice = isUpgradeToPro
            ? Math.max(rawDisplayPrice - unusedCredit, 1000)
            : rawDisplayPrice;

          const monthlyEquivalent = isYearly && rawDisplayPrice > 0
            ? Math.round(rawDisplayPrice / 12)
            : limits.priceMonthly;

          return (
            <div
              key={key}
              className={cn(
                "bg-white rounded-2xl border-2 p-6 flex flex-col relative transition-all",
                color,
                (highlight || isUpgradeToPro) && "shadow-lg shadow-green-100",
                isUpgradeToPro && "border-amber-500 ring-2 ring-amber-500/20"
              )}
            >
              {badge && (
                <div
                  className={cn(
                    "absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 text-white text-[11px] font-bold rounded-full whitespace-nowrap shadow-xs",
                    isUpgradeToPro ? "bg-amber-500" : "bg-green-600"
                  )}
                >
                  {getPlanCardBadge(key)}
                </div>
              )}
              <div className="mb-4">
                <h3 className="font-bold text-lg text-zinc-900">{limits.displayName}</h3>
                <div className="flex items-baseline gap-1 mt-1">
                  {isUpgradeToPro && (
                    <span className="text-sm line-through text-zinc-400 font-mono mr-1">
                      Rp {rawDisplayPrice.toLocaleString("id-ID")}
                    </span>
                  )}
                  <span className="text-3xl font-extrabold text-zinc-900 font-mono">
                    {displayPrice === 0
                      ? locale === "id"
                        ? "Gratis"
                        : "Free"
                      : `Rp ${displayPrice.toLocaleString("id-ID")}`}
                  </span>
                  {displayPrice > 0 && (
                    <span className="text-xs text-zinc-400">
                      {isYearly ? "/ tahun" : t("billing.perMonth")}
                    </span>
                  )}
                </div>
                {isUpgradeToPro ? (
                  <p className="text-[11px] text-amber-700 font-bold mt-1.5 leading-snug">
                    ✨ Hemat Rp {unusedCredit.toLocaleString("id-ID")} dari sisa {daysRemaining} hari Basic. Langsung aktif {isYearly ? "1 Tahun" : "30 Hari"} Pro baru mulai hari ini!
                  </p>
                ) : isYearly && displayPrice > 0 ? (
                  <p className="text-[11px] text-green-700 font-bold mt-1">
                    Setara Rp {monthlyEquivalent.toLocaleString("id-ID")}/bulan (Hemat 2 bulan)
                  </p>
                ) : null}
              </div>

              {/* Gating features */}
              <ul className="space-y-2 mb-6 flex-1 text-sm">
                {[
                  limits.maxWorkspaces === -1 ? "Unlimited workspace" : `${limits.maxWorkspaces} workspace`,
                  limits.maxTx === -1 ? "Unlimited transaksi" : `${limits.maxTx} transaksi/bulan`,
                  limits.maxMembers === -1 ? "Unlimited anggota tim" : `${limits.maxMembers} anggota tim`,
                  limits.maxCategories === -1 ? "Unlimited kategori custom" : `${limits.maxCategories} kategori custom`,
                  ...(limits.canExport ? ["Export Excel & CSV"] : []),
                  ...(limits.canReport ? ["Laporan & grafik lanjutan"] : []),
                  ...(limits.canBudget ? ["Budgeting & notifikasi"] : []),
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-zinc-600 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <div className="w-full text-center py-2.5 rounded-xl text-sm font-semibold bg-green-50 text-green-700 border border-green-200">
                  {t("billing.activePlan")}
                </div>
              ) : key === "free" ? (
                <div className="w-full text-center py-2.5 rounded-xl text-sm font-medium text-zinc-400 bg-zinc-50">
                  {t("billing.freeForever")}
                </div>
              ) : isProActive && key === "basic" ? (
                <div className="w-full text-center py-2.5 rounded-xl text-xs font-semibold text-zinc-400 bg-zinc-100 dark:bg-zinc-800">
                  Sudah Memiliki Paket Pro
                </div>
              ) : (
                <button
                  onClick={() => handleSubscribe(key)}
                  disabled={loading === key}
                  className={cn(
                    "w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 shadow-sm",
                    isUpgradeToPro
                      ? "bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold"
                      : key === "basic"
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-purple-600 hover:bg-purple-700 text-white",
                    loading === key && "opacity-70",
                  )}
                >
                  {loading === key ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> {t("billing.processing")}
                    </>
                  ) : isUpgradeToPro ? (
                    <>
                      <Crown className="w-4 h-4" /> Upgrade ke Pro (Rp {displayPrice.toLocaleString("id-ID")})
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" /> {t("billing.select")} {limits.displayName}{" "}
                      {isYearly ? "(1 Tahun)" : ""}
                    </>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Info */}
      <div className="mt-8 p-4 bg-zinc-50 rounded-xl border border-zinc-100 text-sm text-zinc-500 flex items-start gap-2">
        <Lock className="w-4 h-4 mt-0.5 shrink-0 text-zinc-400" />
        <p>{t("billing.info")}</p>
      </div>
    </div>
  );
}
