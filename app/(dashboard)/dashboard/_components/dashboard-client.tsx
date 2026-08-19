"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Building2, LayoutGrid } from "lucide-react";
import Swal from "sweetalert2";

import { getTransactionSummary, getTransactions } from "@/app/actions/transaction";
import { getWallets, getWalletsTotalSummary } from "@/app/actions/wallet";
import { getUserWorkspaces } from "@/app/actions/workspace";
import { Skeleton } from "@/components/ui/skeleton";
import { PullToRefreshWrapper } from "@/components/ui/pull-to-refresh-wrapper";
import { useLanguage } from "@/components/providers/language-provider";

import { DashboardHeader } from "./dashboard-header";
import { DashboardHero } from "./dashboard-hero";
import { DashboardCalendar } from "./dashboard-calendar";
import { DashboardRecentTransactions } from "./dashboard-recent-transactions";
import { DashboardQuickWallets } from "./dashboard-quick-wallets";

interface DashboardClientProps {
  initialUser:
    | {
        name?: string | null;
      }
    | undefined;
  isEmailVerified?: boolean;
}

export function DashboardClient({ initialUser, isEmailVerified }: DashboardClientProps) {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const workspaceId = searchParams.get("workspaceId");
  const { t } = useLanguage();

  const { data: allWorkspaces = [] } = useQuery({
    queryKey: ["workspaces"],
    queryFn: () => getUserWorkspaces(),
  });

  const activeWs = allWorkspaces.find((w) => w.id === workspaceId);
  const currency = activeWs?.currency ?? "IDR";

  const { data: summary, isLoading } = useQuery({
    queryKey: ["transaction-summary", workspaceId],
    queryFn: () =>
      workspaceId
        ? getTransactionSummary(workspaceId)
        : Promise.resolve({ income: 0, expense: 0, net: 0 }),
    enabled: !!workspaceId,
  });

  const { data: walletSummary } = useQuery({
    queryKey: ["wallets-summary", workspaceId],
    queryFn: () => (workspaceId ? getWalletsTotalSummary(workspaceId) : null),
    enabled: !!workspaceId,
  });

  const { data: wallets = [] } = useQuery({
    queryKey: ["wallets", workspaceId],
    queryFn: () => (workspaceId ? getWallets(workspaceId) : []),
    enabled: !!workspaceId,
  });

  const { data: recentTxResult } = useQuery({
    queryKey: ["transactions", workspaceId, "recent"],
    queryFn: () =>
      workspaceId
        ? getTransactions(workspaceId, { limit: 10 })
        : Promise.resolve({ items: [], total: 0, totalPages: 0 }),
    enabled: !!workspaceId,
  });

  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? t("greeting.morning")
      : hour < 15
      ? t("greeting.afternoon")
      : hour < 18
      ? t("greeting.evening")
      : t("greeting.night");

  const handleRefresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["workspaces"] }),
      queryClient.invalidateQueries({ queryKey: ["transaction-summary", workspaceId] }),
      queryClient.invalidateQueries({ queryKey: ["transactions", workspaceId, "recent"] }),
      queryClient.invalidateQueries({ queryKey: ["wallets", workspaceId] }),
      queryClient.invalidateQueries({ queryKey: ["wallets-summary", workspaceId] }),
      queryClient.invalidateQueries({ queryKey: ["calendar-transactions", workspaceId] }),
    ]);
  };

  // No workspace selected
  if (!workspaceId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center mb-4">
          <Building2 className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-lg font-bold text-zinc-700 mb-1">{t("dashboard.selectWorkspace")}</h2>
        <p className="text-sm text-zinc-500 mb-6 max-w-xs">
          {t("dashboard.selectWorkspaceDesc")}
        </p>
        <Link
          href="/workspaces"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-sm shadow-sm transition-all"
        >
          <LayoutGrid className="w-4 h-4" />
          {t("dashboard.viewWorkspace")}
        </Link>
      </div>
    );
  }

  if (isLoading && !summary) {
    return <DashboardSkeleton greeting={greeting} name={initialUser?.name} />;
  }

  const currentSummary = summary ?? { income: 0, expense: 0, net: 0 };
  const totalWalletBalance = walletSummary?.totalBalance ?? currentSummary.net;
  const recentTx = recentTxResult?.items ?? [];

  const handleCreateTx = (e: React.MouseEvent) => {
    if (isEmailVerified === false) {
      e.preventDefault();
      Swal.fire({
        title: "Perhatian",
        text: "Kamu harus memverifikasi alamat emailmu terlebih dahulu sebelum bisa mencatat transaksi baru. Silakan cek inbox emailmu atau klik Kirim Ulang pada banner di atas.",
        icon: "warning",
        confirmButtonColor: "#f59e0b",
        confirmButtonText: "Mengerti",
        customClass: { popup: "!rounded-2xl !font-[Inter,sans-serif]" },
      });
    }
  };

  return (
    <PullToRefreshWrapper onRefresh={handleRefresh}>
      <div className="p-3 md:p-5 max-w-7xl lg:max-w-full mx-auto space-y-3.5 min-h-0 lg:h-[calc(100vh-3.5rem)] flex flex-col lg:overflow-hidden pb-10 lg:pb-0">
        {/* ── 1. Top Header ────────────────────────────────────── */}
        <DashboardHeader
          greeting={greeting}
          userName={initialUser?.name}
          workspaceName={activeWs?.name}
          workspaceId={workspaceId}
          onCreateTx={handleCreateTx}
        />

        {/* ── 2. Grand Hero Card (Net Balance & In/Out) ───────── */}
        <DashboardHero
          totalWalletBalance={totalWalletBalance}
          income={currentSummary.income}
          expense={currentSummary.expense}
          currency={currency}
        />

        {/* ── 3. Main Grid: Calendar & Side Panel ────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 lg:flex-1 lg:min-h-0">
          {/* Kalender Keuangan (7/12) */}
          <div className="lg:col-span-7 lg:h-full lg:overflow-y-auto">
            <DashboardCalendar workspaceId={workspaceId} currency={currency} />
          </div>

          {/* Kolom Kanan: Transaksi Terbaru + Quick Wallets (5/12) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-3.5 lg:h-full lg:min-h-0 lg:overflow-hidden">
            <DashboardRecentTransactions
              transactions={recentTx as any}
              workspaceId={workspaceId}
              currency={currency}
            />

            <DashboardQuickWallets
              wallets={wallets}
              workspaceId={workspaceId}
              currency={currency}
            />
          </div>
        </div>
      </div>
    </PullToRefreshWrapper>
  );
}

function DashboardSkeleton({
  greeting,
  name,
}: {
  greeting: string;
  name?: string | null;
}) {
  const { t } = useLanguage();
  return (
    <div className="p-4 md:p-8 max-w-7xl lg:max-w-full mx-auto space-y-6">
      <div>
        <Skeleton className="h-4 w-32 mb-2" />
        <h1 className="text-2xl font-bold text-zinc-900">
          {greeting}, {name?.split(" ")[0] ?? t("greeting.friend")} 👋
        </h1>
        <Skeleton className="h-3 w-48 mt-2" />
      </div>
      <Skeleton className="h-40 rounded-2xl" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
