"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getTransactionSummary } from "@/app/actions/transaction";
import {
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  Wallet,
  Building2,
  LayoutGrid,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams } from "next/navigation";
import { PullToRefreshWrapper } from "@/components/ui/pull-to-refresh-wrapper";
import { usePrivacy } from "@/components/providers/privacy-provider";
import { getUserWorkspaces } from "@/app/actions/workspace";

interface DashboardClientProps {
  initialUser:
    | {
        name?: string | null;
      }
    | undefined;
}

export function DashboardClient({ initialUser }: DashboardClientProps) {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const workspaceId = searchParams.get("workspaceId");

  const { data: allWorkspaces = [] } = useQuery({
    queryKey: ["workspaces"],
    queryFn: () => getUserWorkspaces(),
  });

  const activeWs = allWorkspaces.find((w) => w.id === workspaceId);
  const currency = activeWs?.currency ?? "IDR";
  const { showAmount } = usePrivacy();

  const { data: summary, isLoading } = useQuery({
    queryKey: ["transaction-summary", workspaceId],
    queryFn: () =>
      workspaceId
        ? getTransactionSummary(workspaceId)
        : Promise.resolve({ income: 0, expense: 0, net: 0 }),
    enabled: !!workspaceId,
  });

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Selamat Pagi" : hour < 15 ? "Selamat Siang" : hour < 18 ? "Selamat Sore" : "Selamat Malam";

  const handleRefresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["workspaces"] }),
      queryClient.invalidateQueries({ queryKey: ["transaction-summary", workspaceId] }),
    ]);
  };

  // No workspace selected
  if (!workspaceId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
          <Building2 className="w-8 h-8 text-indigo-400" />
        </div>
        <h2 className="text-lg font-bold text-zinc-700 mb-1">Pilih workspace terlebih dahulu</h2>
        <p className="text-sm text-zinc-500 mb-6 max-w-xs">
          Buka daftar workspace dan pilih salah satu untuk melihat ringkasan keuangan.
        </p>
        <Link
          href="/workspaces"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-sm transition-all"
        >
          <LayoutGrid className="w-4 h-4" />
          Lihat Workspace
        </Link>
      </div>
    );
  }

  if (isLoading && !summary) {
    return <DashboardSkeleton greeting={greeting} name={initialUser?.name} />;
  }

  const currentSummary = summary ?? { income: 0, expense: 0, net: 0 };

  return (
    <PullToRefreshWrapper onRefresh={handleRefresh}>
      <div className="p-4 md:p-8 max-w-7xl lg:max-w-full mx-auto">
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900">
            {greeting}, {initialUser?.name?.split(" ")[0] ?? "teman"} 👋
          </h1>
          <p className="text-zinc-500 mt-1 text-sm">
            Ringkasan workspace <span className="font-medium text-indigo-600">&quot;{activeWs?.name ?? "..."}&quot;</span>.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Pemasukan", value: currentSummary.income, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50 border-green-100" },
            { label: "Pengeluaran", value: currentSummary.expense, icon: TrendingDown, color: "text-red-500", bg: "bg-red-50 border-red-100" },
            { label: "Saldo Bersih", value: currentSummary.net, icon: Wallet, color: currentSummary.net >= 0 ? "text-indigo-600" : "text-red-500", bg: "bg-indigo-50 border-indigo-100" },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className={`bg-white rounded-xl border shadow-sm p-5 ${card.bg}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 ${card.color}`} />
                  <p className="text-xs font-medium text-zinc-500">{card.label}</p>
                </div>
                <p className={`text-2xl font-bold ${card.color}`}>
                  {showAmount
                    ? formatCurrency(card.value, currency)
                    : <span className="tracking-widest">••••••</span>}
                </p>
              </div>
            );
          })}
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/transactions?workspaceId=${workspaceId}`}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
          >
            <ArrowLeftRight className="w-4 h-4" />
            Lihat Transaksi
          </Link>
          <Link
            href={`/categories?workspaceId=${workspaceId}`}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-sm font-medium rounded-xl transition-colors"
          >
            Kelola Kategori
          </Link>
          <Link
            href={`/reports?workspaceId=${workspaceId}`}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-sm font-medium rounded-xl transition-colors"
          >
            Lihat Laporan
          </Link>
        </div>
      </div>
    </PullToRefreshWrapper>
  );
}

function DashboardSkeleton({ greeting, name }: { greeting: string; name?: string | null }) {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">{greeting}, {name?.split(" ")[0] ?? "teman"} 👋</h1>
        <Skeleton className="h-4 w-48 mt-2" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (<Skeleton key={i} className="h-28 rounded-xl" />))}
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-10 w-36 rounded-xl" />
        <Skeleton className="h-10 w-36 rounded-xl" />
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>
    </div>
  );
}
