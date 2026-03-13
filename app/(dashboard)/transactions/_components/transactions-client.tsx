"use client";

import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronLeft,
  ChevronRight,
  ArrowLeftRight,
  X,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { broadcastInvalidate } from "@/components/providers/query-provider";
import {
  deleteTransaction,
  getTransactions,
  getTransactionSummary,
  type TransactionFilter,
} from "@/app/actions/transaction";
import { getCategories } from "@/app/actions/category";
import { TransactionFormDialog } from "./transaction-form-dialog";
import { formatCurrency, formatDateShort, cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

type Category = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  type: string;
};

type Transaction = {
  id: string;
  amount: number | any;
  note: string | null;
  date: Date | string;
  type: string;
  categoryId: string;
  category: { id: string; name: string; emoji: string; color: string };
  createdBy: { id: string; name: string | null; image: string | null };
};

type Props = {
  workspaceId: string;
  currency: string;
  canEdit: boolean;
};

const PAGE_SIZE = 10;
const col = createColumnHelper<Transaction>();

export function TransactionsClient({ workspaceId, currency, canEdit }: Props) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<TransactionFilter>({});
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState<{
    open: boolean;
    transaction?: Transaction;
  }>({ open: false });
  const [error, setError] = useState<string | undefined>();

  // Queries
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories", workspaceId],
    queryFn: () => getCategories(workspaceId),
  });

  const {
    data: transactionData,
    isLoading: isLoadingTransactions,
    isPlaceholderData,
  } = useQuery({
    queryKey: ["transactions", workspaceId, { ...filter, page }],
    queryFn: () =>
      getTransactions(workspaceId, { ...filter, page, limit: PAGE_SIZE }),
    placeholderData: keepPreviousData,
  });

  const { data: summary, isLoading: isLoadingSummary } = useQuery({
    queryKey: [
      "transaction-summary",
      workspaceId,
      filter.dateFrom,
      filter.dateTo,
    ],
    queryFn: () =>
      getTransactionSummary(workspaceId, filter.dateFrom, filter.dateTo),
  });

  // Mutation
  const deleteMutation = useMutation({
    mutationFn: (transactionId: string) =>
      deleteTransaction(transactionId, workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["transaction-summary", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["report-monthly", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["report-category", workspaceId] });
      queryClient.invalidateQueries({ queryKey: ["report-comparison", workspaceId] });

      broadcastInvalidate(["transactions", workspaceId]);
      broadcastInvalidate(["transaction-summary", workspaceId]);
      broadcastInvalidate(["report-monthly", workspaceId]);
      broadcastInvalidate(["report-category", workspaceId]);
      broadcastInvalidate(["report-comparison", workspaceId]);
    },
    onError: (err: any) => setError(err.message || "Gagal menghapus transaksi"),
  });

  const items = transactionData?.items ?? [];
  const total = transactionData?.total ?? 0;
  const totalPages = transactionData?.totalPages ?? 0;

  const handleFilterChange = (updates: Partial<TransactionFilter>) => {
    setFilter((prev) => ({ ...prev, ...updates }));
    setPage(1);
  };

  const handleSearch = (val: string) => {
    setSearch(val);
    handleFilterChange({ search: val || undefined });
  };

  const handleDelete = (tx: Transaction) => {
    if (!confirm("Hapus transaksi ini?")) return;
    deleteMutation.mutate(tx.id);
  };

  const columns = [
    col.accessor("date", {
      header: "Tanggal",
      cell: (info) => (
        <span className="text-sm text-zinc-600 whitespace-nowrap">
          {formatDateShort(new Date(info.getValue()))}
        </span>
      ),
    }),
    col.accessor("type", {
      header: "Tipe",
      cell: (info) => (
        <span
          className={cn(
            "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium",
            info.getValue() === "INCOME"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-600",
          )}
        >
          {info.getValue() === "INCOME" ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {info.getValue() === "INCOME" ? "Masuk" : "Keluar"}
        </span>
      ),
    }),
    col.accessor("category", {
      header: "Kategori",
      cell: (info) => {
        const cat = info.getValue();
        return (
          <span className="flex items-center gap-1.5 text-sm">
            <span>{cat.emoji}</span>
            <span className="text-zinc-700">{cat.name}</span>
          </span>
        );
      },
    }),
    col.accessor("note", {
      header: "Catatan",
      cell: (info) => (
        <span className="text-sm text-zinc-500 max-w-48 truncate block">
          {info.getValue() ?? "—"}
        </span>
      ),
    }),
    col.accessor("amount", {
      header: "Nominal",
      cell: (info) => {
        const tx = info.row.original;
        return (
          <span
            className={cn(
              "text-sm font-semibold whitespace-nowrap",
              tx.type === "INCOME" ? "text-green-600" : "text-red-500",
            )}
          >
            {tx.type === "INCOME" ? "+" : "-"}
            {formatCurrency(Number(info.getValue()), currency)}
          </span>
        );
      },
    }),
    col.accessor("createdBy", {
      header: "Dibuat oleh",
      cell: (info) => {
        const u = info.getValue();
        return (
          <span className="flex items-center gap-1.5 text-sm text-zinc-500">
            {u.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={u.image} alt="" className="w-5 h-5 rounded-full" />
            )}
            {u.name ?? "—"}
          </span>
        );
      },
    }),
    col.display({
      id: "actions",
      header: "",
      cell: (info) => {
        const tx = info.row.original;
        if (!canEdit) return null;
        return (
          <div className="flex gap-1 justify-end">
            <button
              onClick={() => setDialog({ open: true, transaction: tx })}
              className="p-1.5 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleDelete(tx)}
              disabled={deleteMutation.isPending}
              className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: items as any[],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

  const isLoading =
    isLoadingTransactions || isLoadingCategories || isLoadingSummary;

  if (isLoading && !transactionData) {
    return <TransactionsSkeleton canEdit={canEdit} />;
  }

  const currentSummary = summary ?? { income: 0, expense: 0, net: 0 };

  return (
    <div className="p-4 md:p-8 max-w-7xl lg:max-w-full mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <ArrowLeftRight className="w-6 h-6 text-indigo-500" />
            Transaksi
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            {total} transaksi ditemukan
          </p>
        </div>
        {canEdit && (
          <button
            onClick={() => setDialog({ open: true })}
            className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Tambah
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-zinc-100 shadow-sm p-4 mb-4 flex flex-wrap gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Cari catatan..."
            className="w-full pl-9 pr-4 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-zinc-50 focus:bg-white transition-colors"
          />
        </div>

        {/* Type filter */}
        <select
          value={filter.type ?? ""}
          onChange={(e) =>
            handleFilterChange({ type: (e.target.value as any) || undefined })
          }
          className="px-3 py-2 border border-zinc-200 rounded-lg text-sm text-zinc-700 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">Semua Tipe</option>
          <option value="INCOME">Pemasukan</option>
          <option value="EXPENSE">Pengeluaran</option>
        </select>

        {/* Category filter */}
        <select
          value={filter.categoryId ?? ""}
          onChange={(e) =>
            handleFilterChange({ categoryId: e.target.value || undefined })
          }
          className="px-3 py-2 border border-zinc-200 rounded-lg text-sm text-zinc-700 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <option value="">Semua Kategori</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.emoji} {c.name}
            </option>
          ))}
        </select>

        {/* Date range */}
        <input
          type="date"
          value={filter.dateFrom ?? ""}
          onChange={(e) =>
            handleFilterChange({ dateFrom: e.target.value || undefined })
          }
          className="px-3 py-2 border border-zinc-200 rounded-lg text-sm text-zinc-700 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <input
          type="date"
          value={filter.dateTo ?? ""}
          onChange={(e) =>
            handleFilterChange({ dateTo: e.target.value || undefined })
          }
          className="px-3 py-2 border border-zinc-200 rounded-lg text-sm text-zinc-700 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />

        {/* Reset filter */}
        {(filter.type ||
          filter.categoryId ||
          filter.dateFrom ||
          filter.dateTo ||
          search) && (
            <button
              onClick={() => {
                setFilter({});
                setSearch("");
                setPage(1);
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-zinc-500 hover:text-zinc-700 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
          {error}
          <button
            onClick={() => setError(undefined)}
            className="ml-2 underline"
          >
            tutup
          </button>
        </div>
      )}

      {/* Table */}
      <div
        className={cn(
          "bg-white rounded-xl border border-zinc-100 shadow-sm overflow-hidden",
          (isPlaceholderData || deleteMutation.isPending) &&
          "opacity-50 pointer-events-none transition-opacity",
        )}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b border-zinc-100 bg-zinc-50">
                  {hg.headers.map((h) => (
                    <th
                      key={h.id}
                      className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-center py-16 text-zinc-400 text-sm"
                  >
                    <ArrowLeftRight className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    Belum ada transaksi.{" "}
                    {canEdit && (
                      <button
                        onClick={() => setDialog({ open: true })}
                        className="text-indigo-600 underline"
                      >
                        Tambah sekarang
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-zinc-50 hover:bg-zinc-50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-100">
            <p className="text-sm text-zinc-500">
              Halaman {page} dari {totalPages} · {total} transaksi
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1 || isPlaceholderData}
                className="p-1.5 rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  setPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={page >= totalPages || isPlaceholderData}
                className="p-1.5 rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dialog */}
      {dialog.open && (
        <TransactionFormDialog
          workspaceId={workspaceId}
          categories={categories}
          transaction={dialog.transaction as any}
          onClose={() => setDialog({ open: false })}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["transactions", workspaceId] });
            queryClient.invalidateQueries({ queryKey: ["transaction-summary", workspaceId] });
            queryClient.invalidateQueries({ queryKey: ["report-monthly", workspaceId] });
            queryClient.invalidateQueries({ queryKey: ["report-category", workspaceId] });
            queryClient.invalidateQueries({ queryKey: ["report-comparison", workspaceId] });
          }}
        />
      )}
    </div>
  );
}

function TransactionsSkeleton({ canEdit }: { canEdit: boolean }) {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <ArrowLeftRight className="w-6 h-6 text-indigo-500" />
            Transaksi
          </h1>
          <Skeleton className="h-4 w-32 mt-2" />
        </div>
        {canEdit && <Skeleton className="h-10 w-24 rounded-xl" />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>

      <div className="bg-white rounded-xl border border-zinc-100 shadow-sm p-4 mb-4 flex gap-3">
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>

      <div className="bg-white rounded-xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="h-12 bg-zinc-50 border-b border-zinc-100" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-16 border-b border-zinc-50 px-4 flex items-center gap-4"
          >
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
