"use client";

import { useState, useMemo } from "react";
import Swal from "sweetalert2";
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  SortingState,
} from "@tanstack/react-table";
import { Pencil, Trash2, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { broadcastInvalidate } from "@/components/providers/query-provider";
import {
  deleteTransaction,
  getTransactions,
  getTransactionSummary,
  getFilteredSummary,
  type TransactionFilter,
} from "@/app/actions/transaction";
import { getCategories } from "@/app/actions/category";
import { getWallets } from "@/app/actions/wallet";
import { WalletLogo } from "@/components/ui/wallet-logo";
import { TransactionFormDialog } from "./transaction-form-dialog";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { usePrivacy } from "@/components/providers/privacy-provider";
import { useLanguage } from "@/components/providers/language-provider";
import * as XLSX from "xlsx";
import { Skeleton } from "@/components/ui/skeleton";
import { PullToRefreshWrapper } from "@/components/ui/pull-to-refresh-wrapper";

import { TransactionsHeader } from "./transactions-header";
import { TransactionsSummaryBar } from "./transactions-summary-bar";
import { TransactionsFilterPanel } from "./transactions-filter-panel";
import { TransactionsTable } from "./transactions-table";
import { TransactionsMobileList } from "./transactions-mobile-list";

type Transaction = {
  id: string;
  amount: number | any;
  note: string | null;
  date: Date | string;
  type: string;
  categoryId: string;
  category: { id: string; name: string; emoji: string; color: string };
  walletId?: string | null;
  wallet?: {
    id: string;
    name: string;
    providerCode: string | null;
    type: string;
    holderName: string | null;
    accountNumber: string | null;
    color: string;
  } | null;
  createdBy: { id: string; name: string | null; image: string | null };
};

type Props = {
  workspaceId: string;
  currency: string;
  canEdit: boolean;
  canExport?: boolean;
  planKey?: string;
  isEmailVerified?: boolean;
};

const PAGE_SIZE = 10;
const col = createColumnHelper<Transaction>();

export function TransactionsClient({
  workspaceId,
  currency,
  canEdit,
  canExport = false,
  isEmailVerified,
}: Props) {
  const queryClient = useQueryClient();
  const { showAmount } = usePrivacy();
  const { locale, t } = useLanguage();

  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<TransactionFilter>({});
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [dialog, setDialog] = useState<{
    open: boolean;
    transaction?: Transaction;
  }>({ open: false });

  // ── Queries ───────────────────────────────────────────────────────────────
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories", workspaceId],
    queryFn: () => getCategories(workspaceId),
    enabled: !!workspaceId,
  });

  const { data: wallets = [] } = useQuery({
    queryKey: ["wallets", workspaceId],
    queryFn: () => getWallets(workspaceId),
    enabled: !!workspaceId,
  });

  const { data: globalSummary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ["transaction-summary", workspaceId],
    queryFn: () => getTransactionSummary(workspaceId),
    enabled: !!workspaceId,
  });

  const hasActiveFilter = Boolean(
    filter.startDate ||
      filter.endDate ||
      filter.type ||
      filter.categoryId ||
      filter.walletId ||
      search
  );

  const { data: filteredSummary, isLoading: isLoadingFilteredSummary } = useQuery({
    queryKey: ["filtered-summary", workspaceId, filter, search],
    queryFn: () => getFilteredSummary(workspaceId, { ...filter, search: search || undefined }),
    enabled: hasActiveFilter && !!workspaceId,
  });

  const visibleSummary = hasActiveFilter ? filteredSummary : globalSummary;

  const currentSortBy = sorting[0]?.id as TransactionFilter["sortBy"] | undefined;
  const currentSortOrder = sorting[0]
    ? sorting[0].desc
      ? ("desc" as const)
      : ("asc" as const)
    : undefined;

  const { data: transactionData, isLoading: isLoadingTransactions, isPlaceholderData } = useQuery({
    queryKey: [
      "transactions",
      workspaceId,
      page,
      filter,
      search,
      currentSortBy,
      currentSortOrder,
    ],
    queryFn: () =>
      getTransactions(workspaceId, {
        ...filter,
        search: search || undefined,
        page,
        limit: PAGE_SIZE,
        sortBy: currentSortBy,
        sortOrder: currentSortOrder,
      }),
    placeholderData: keepPreviousData,
    enabled: !!workspaceId,
  });

  // ── Mutations ─────────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (txId: string) => deleteTransaction(txId, workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["transaction-summary", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["filtered-summary", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["wallets", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["wallets-summary", workspaceId] });
      broadcastInvalidate(["transactions", workspaceId]);
    },
    onError: (err: any) => setError(err.message || t("transactions.failedDelete")),
  });

  const items = transactionData?.items ?? [];
  const total = transactionData?.total ?? 0;
  const totalPages = transactionData?.totalPages ?? 1;

  const handleOpenDialog = (tx?: Transaction) => {
    if (!tx && isEmailVerified === false) {
      Swal.fire({
        title: "Perhatian",
        text: "Kamu harus memverifikasi alamat emailmu terlebih dahulu sebelum bisa mencatat transaksi baru.",
        icon: "warning",
        confirmButtonColor: "#f59e0b",
        confirmButtonText: "Mengerti",
        customClass: { popup: "!rounded-2xl !font-[Inter,sans-serif]" },
      });
      return;
    }
    setDialog({ open: true, transaction: tx });
  };

  const handleDelete = async (tx: Transaction) => {
    const result = await Swal.fire({
      title: t("transactions.deleteTitle"),
      html: `${t("transactions.deleteText")} <b>${formatCurrency(tx.amount, currency)}</b>?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("transactions.yesDelete"),
      cancelButtonText: t("transactions.cancel"),
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      reverseButtons: true,
      customClass: {
        popup: "!rounded-2xl !font-[Inter,sans-serif]",
        title: "!text-zinc-900 !text-lg !font-bold",
        htmlContainer: "!text-zinc-500 !text-sm",
        confirmButton: "!rounded-xl !text-sm !font-semibold !px-5 !py-2.5",
        cancelButton: "!rounded-xl !text-sm !font-medium !px-5 !py-2.5",
      },
    });

    if (!result.isConfirmed) return;
    deleteMutation.mutate(tx.id);
  };

  const handleFilterChange = (updates: Partial<TransactionFilter>) => {
    setFilter((prev) => ({ ...prev, ...updates }));
    setPage(1);
  };

  const handleSearch = (q: string) => {
    setSearch(q);
    setPage(1);
  };

  const handleReset = () => {
    setFilter({});
    setSearch("");
    setPage(1);
  };

  // ── Columns ───────────────────────────────────────────────────────────────
  const columns = useMemo(
    () => [
      col.accessor("date", {
        header: t("transactions.date"),
        enableSorting: true,
        cell: (info) => (
          <span className="text-zinc-500 dark:text-zinc-400 font-medium whitespace-nowrap">
            {formatDateShort(info.getValue())}
          </span>
        ),
      }),
      col.accessor("type", {
        header: t("transactions.type"),
        enableSorting: false,
        cell: (info) => {
          const isIncome = info.getValue() === "INCOME";
          return (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                isIncome
                  ? "bg-green-50 dark:bg-green-950/80 text-green-700 dark:text-green-300"
                  : "bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-300"
              }`}
            >
              {isIncome ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
              {isIncome ? t("transactions.income") : t("transactions.expense")}
            </span>
          );
        },
      }),
      col.accessor((row) => row.category?.name ?? "", {
        id: "category",
        header: t("sidebar.kategori"),
        enableSorting: true,
        cell: (info) => {
          const cat = info.row.original.category;
          return (
            <span className="inline-flex items-center gap-1.5 font-semibold text-zinc-800 dark:text-zinc-200">
              <span>{cat?.emoji}</span>
              <span className="truncate max-w-[120px]">{cat?.name}</span>
            </span>
          );
        },
      }),
      col.accessor((row) => row.wallet?.name ?? "", {
        id: "wallet",
        header: "Dompet",
        enableSorting: false,
        cell: (info) => {
          const w = info.row.original.wallet;
          if (!w) return <span className="text-zinc-400">-</span>;
          return (
            <span className="inline-flex items-center gap-1.5 font-bold text-zinc-700 dark:text-zinc-300">
              <WalletLogo providerCode={w.providerCode} size="sm" />
              <span className="truncate max-w-[110px]">{w.name}</span>
            </span>
          );
        },
      }),
      col.accessor("note", {
        header: t("transactions.note"),
        enableSorting: false,
        cell: (info) => (
          <span className="text-zinc-600 dark:text-zinc-300 truncate max-w-[160px] block" title={info.getValue() ?? ""}>
            {info.getValue() || <span className="text-zinc-400 italic">-</span>}
          </span>
        ),
      }),
      col.accessor("amount", {
        header: t("transactions.amount"),
        enableSorting: true,
        cell: (info) => {
          const isIncome = info.row.original.type === "INCOME";
          return (
            <span
              className={`font-mono font-extrabold text-xs whitespace-nowrap tabular-nums ${
                isIncome ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"
              }`}
            >
              {isIncome ? "+" : "-"}
              {showAmount ? formatCurrency(info.getValue(), currency) : "••••••"}
            </span>
          );
        },
      }),
      col.accessor((row) => row.createdBy?.name ?? "", {
        id: "createdBy",
        header: t("transactions.creator"),
        enableSorting: false,
        cell: (info) => {
          const user = info.row.original.createdBy;
          return (
            <div className="flex items-center gap-1.5">
              {user.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.image} alt="" className="w-4 h-4 rounded-full" />
              )}
              <span className="text-zinc-500 dark:text-zinc-400 text-xs truncate max-w-[100px]">{user.name}</span>
            </div>
          );
        },
      }),
      col.display({
        id: "actions",
        header: "",
        cell: (info) => {
          if (!canEdit) return null;
          return (
            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleOpenDialog(info.row.original)}
                className="p-1.5 text-zinc-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                title={t("transactions.edit")}
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(info.row.original)}
                disabled={deleteMutation.isPending}
                className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer"
                title={t("transactions.delete")}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        },
      }),
    ],
    [canEdit, currency, showAmount, t, deleteMutation.isPending]
  );

  const table = useReactTable({
    data: items,
    columns,
    state: { sorting },
    onSortingChange: (updater) => {
      const nextSorting = typeof updater === "function" ? updater(sorting) : updater;
      setSorting(nextSorting);
      setPage(1);
    },
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
    manualSorting: true,
  });

  const handleRefresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["transactions", workspaceId] }),
      queryClient.invalidateQueries({ queryKey: ["transaction-summary", workspaceId] }),
      queryClient.invalidateQueries({ queryKey: ["categories", workspaceId] }),
    ]);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const allData = await getTransactions(workspaceId, { ...filter, page: 1, limit: 99999 });
      const rows = allData.items.map((tx) => ({
        Tanggal: new Date(tx.date).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
        Tipe: tx.type === "INCOME" ? "Pemasukan" : "Pengeluaran",
        Kategori: `${tx.category.emoji} ${tx.category.name}`,
        Dompet: tx.wallet ? tx.wallet.name : "-",
        Catatan: tx.note ?? "-",
        Nominal: Number(tx.amount),
        "Mata Uang": currency,
        "Dibuat Oleh": tx.createdBy.name ?? "-",
      }));
      const ws = XLSX.utils.json_to_sheet(rows);
      ws["!cols"] = [
        { wch: 20 },
        { wch: 12 },
        { wch: 20 },
        { wch: 20 },
        { wch: 30 },
        { wch: 16 },
        { wch: 10 },
        { wch: 20 },
      ];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Transaksi");
      const today = new Date().toISOString().split("T")[0];
      XLSX.writeFile(wb, `transaksi-${today}.xlsx`);
    } catch (e) {
      setError("Gagal mengekspor data.");
    } finally {
      setIsExporting(false);
    }
  };

  const isLoading = isLoadingTransactions || isLoadingCategories || isLoadingSummary;
  if (isLoading && !transactionData) {
    return <TransactionsSkeleton canEdit={canEdit} />;
  }

  return (
    <PullToRefreshWrapper onRefresh={handleRefresh}>
      <div className="p-2.5 sm:p-4 md:p-5 max-w-7xl lg:max-w-full mx-auto h-[calc(100dvh-4.5rem)] md:h-[calc(100vh-3.5rem)] flex flex-col overflow-hidden space-y-2.5 sm:space-y-3">
        {/* ── 1. Header ────────────────────────────────────── */}
        <TransactionsHeader
          total={total}
          canExport={canExport}
          canEdit={canEdit}
          isExporting={isExporting}
          onExport={handleExport}
          onOpenAdd={() => handleOpenDialog()}
        />

        {/* ── 2. Summary Metric Bar ────────────────────────── */}
        <TransactionsSummaryBar
          income={visibleSummary?.income ?? 0}
          expense={visibleSummary?.expense ?? 0}
          net={visibleSummary?.net ?? 0}
          currency={currency}
          showAmount={showAmount}
          isLoading={hasActiveFilter ? isLoadingFilteredSummary : isLoadingSummary}
        />

        {/* ── 3. Filter Controls Panel ─────────────────────── */}
        <TransactionsFilterPanel
          filter={filter}
          search={search}
          categories={categories}
          wallets={wallets}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
          onReset={handleReset}
        />

        {/* Error Alert */}
        {error && (
          <div className="shrink-0 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-2.5 rounded-xl text-xs flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError(undefined)} className="underline cursor-pointer font-bold">
              Tutup
            </button>
          </div>
        )}

        {/* ── 4. Desktop Table Viewport ────────────────────── */}
        <TransactionsTable
          table={table}
          items={items}
          columnsLength={columns.length}
          total={total}
          page={page}
          totalPages={totalPages}
          isPlaceholderData={isPlaceholderData}
          isPendingDelete={deleteMutation.isPending}
          canEdit={canEdit}
          onPageChange={(p) => setPage(p)}
          onOpenAdd={() => handleOpenDialog()}
        />

        {/* ── 5. Mobile List Viewport ──────────────────────── */}
        <TransactionsMobileList
          items={items}
          total={total}
          page={page}
          totalPages={totalPages}
          currency={currency}
          canEdit={canEdit}
          isPlaceholderData={isPlaceholderData}
          isPendingDelete={deleteMutation.isPending}
          onPageChange={(p) => setPage(p)}
          onEdit={(tx) => handleOpenDialog(tx)}
          onDelete={(tx) => handleDelete(tx)}
        />

        {/* Modal Form Dialog */}
        {dialog.open && (
          <TransactionFormDialog
            workspaceId={workspaceId}
            categories={categories}
            transaction={dialog.transaction as any}
            onClose={() => setDialog({ open: false })}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ["transactions", workspaceId] });
              queryClient.invalidateQueries({ queryKey: ["transaction-summary", workspaceId] });
              queryClient.invalidateQueries({ queryKey: ["filtered-summary", workspaceId] });
              queryClient.invalidateQueries({ queryKey: ["wallets", workspaceId] });
              queryClient.invalidateQueries({ queryKey: ["wallets-summary", workspaceId] });
            }}
          />
        )}
      </div>
    </PullToRefreshWrapper>
  );
}

function TransactionsSkeleton({ canEdit }: { canEdit: boolean }) {
  const { t } = useLanguage();
  return (
    <div className="p-4 md:p-6 w-full mx-auto space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <Skeleton className="w-6 h-6 rounded-lg" />
            {t("sidebar.transaksi")}
          </h1>
          <Skeleton className="h-4 w-32 mt-2" />
        </div>
        {canEdit && <Skeleton className="h-10 w-28 rounded-xl" />}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-16 rounded-2xl" />
      </div>

      <Skeleton className="h-12 rounded-2xl" />
      <Skeleton className="h-96 rounded-2xl" />
    </div>
  );
}
