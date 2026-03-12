"use client";

import { useQuery } from "@tanstack/react-query";
import { getUserWorkspaces } from "@/app/actions/workspace";
import { getTransactionSummary } from "@/app/actions/transaction";
import {
  Building2,
  Users,
  ArrowLeftRight,
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams } from "next/navigation";

interface DashboardClientProps {
  initialUser:
    | {
        name?: string | null;
      }
    | undefined;
}

export function DashboardClient({ initialUser }: DashboardClientProps) {
  const searchParams = useSearchParams();
  const workspaceId = searchParams.get("workspaceId");

  // Query for workspaces
  const { data: allWorkspaces = [], isLoading: isLoadingWorkspaces } = useQuery(
    {
      queryKey: ["workspaces"],
      queryFn: () => getUserWorkspaces(),
    },
  );

  const personalWorkspace = allWorkspaces.find((w) => w.isPersonal);
  const sharedWorkspaces = allWorkspaces.filter((w) => !w.isPersonal);

  // activeWsId: from query param or personal
  const activeWsId = workspaceId ?? personalWorkspace?.id;
  const activeWs =
    allWorkspaces.find((w) => w.id === activeWsId) ?? personalWorkspace;

  // Query for summary
  const { data: summary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ["transaction-summary", activeWsId],
    queryFn: () =>
      activeWsId
        ? getTransactionSummary(activeWsId)
        : Promise.resolve({ income: 0, expense: 0, net: 0 }),
    enabled: !!activeWsId,
  });

  const isLoading = isLoadingWorkspaces || isLoadingSummary;
  const currency = activeWs?.currency ?? "IDR";

  // Greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? "Selamat Pagi"
      : hour < 15
        ? "Selamat Siang"
        : hour < 18
          ? "Selamat Sore"
          : "Selamat Malam";

  if (isLoading && !summary) {
    return <DashboardSkeleton greeting={greeting} name={initialUser?.name} />;
  }

  const currentSummary = summary ?? { income: 0, expense: 0, net: 0 };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">
          {greeting}, {initialUser?.name?.split(" ")[0] ?? "teman"} 👋
        </h1>
        <p className="text-zinc-500 mt-1 text-sm">
          {activeWs?.isPersonal
            ? "Catatan keuangan pribadi kamu."
            : `Ringkasan workspace "${activeWs?.name}".`}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          {
            label: "Pemasukan",
            value: currentSummary.income,
            icon: TrendingUp,
            color: "text-green-600",
            bg: "bg-green-50 border-green-100",
          },
          {
            label: "Pengeluaran",
            value: currentSummary.expense,
            icon: TrendingDown,
            color: "text-red-500",
            bg: "bg-red-50 border-red-100",
          },
          {
            label: "Saldo Bersih",
            value: currentSummary.net,
            icon: Wallet,
            color: currentSummary.net >= 0 ? "text-indigo-600" : "text-red-500",
            bg: "bg-indigo-50 border-indigo-100",
          },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`bg-white rounded-xl border shadow-sm p-5 ${card.bg}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${card.color}`} />
                <p className="text-xs font-medium text-zinc-500">
                  {card.label}
                </p>
              </div>
              <p className={`text-2xl font-bold ${card.color}`}>
                {formatCurrency(card.value, currency)}
              </p>
            </div>
          );
        })}
      </div>

      {/* Quick Links */}
      <div className="flex gap-3 mb-10">
        <Link
          href={`/transactions?workspaceId=${activeWsId}`}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
        >
          <ArrowLeftRight className="w-4 h-4" />
          Lihat Transaksi
        </Link>
        <Link
          href={`/categories?workspaceId=${activeWsId}`}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-sm font-medium rounded-xl transition-colors"
        >
          Kelola Kategori
        </Link>
      </div>

      {/* Shared Workspace Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-zinc-400" />
            Workspace Bersama
          </h2>
          <Link
            href="/onboarding"
            className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            Buat / Gabung
          </Link>
        </div>

        {sharedWorkspaces.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-dashed border-zinc-200 p-8 text-center">
            <Building2 className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
            <p className="text-sm text-zinc-500 mb-1">
              Belum ada workspace bersama.
            </p>
            <p className="text-xs text-zinc-400 mb-4">
              Buat workspace untuk mencatat keuangan bareng keluarga, tim, atau
              komunitas.
            </p>
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium border border-indigo-200 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Buat Workspace
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sharedWorkspaces.map((ws) => (
              <div
                key={ws.id}
                className="bg-white rounded-xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-zinc-900 truncate">
                      {ws.name}
                    </h3>
                    <p className="text-xs text-zinc-400 capitalize">
                      {ws.role.toLowerCase()}
                    </p>
                  </div>
                </div>
                {ws.description && (
                  <p className="text-xs text-zinc-500 line-clamp-2">
                    {ws.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {(ws as any)._count?.members ?? 0} anggota
                  </span>
                  <span className="flex items-center gap-1">
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    {(ws as any)._count?.transactions ?? 0} transaksi
                  </span>
                </div>
                <div className="flex gap-2 mt-auto">
                  <Link
                    href={`/transactions?workspaceId=${ws.id}`}
                    className="flex-1 text-center text-xs font-medium py-1.5 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors"
                  >
                    Transaksi
                  </Link>
                  <Link
                    href={`/settings/members?workspaceId=${ws.id}`}
                    className="flex-1 text-center text-xs font-medium py-1.5 px-3 rounded-lg bg-zinc-50 hover:bg-zinc-100 text-zinc-600 transition-colors"
                  >
                    Anggota
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DashboardSkeleton({
  greeting,
  name,
}: {
  greeting: string;
  name?: string | null;
}) {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">
          {greeting}, {name?.split(" ")[0] ?? "teman"} 👋
        </h1>
        <Skeleton className="h-4 w-48 mt-2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>

      <div className="flex gap-3 mb-10">
        <Skeleton className="h-10 w-32 rounded-xl" />
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
