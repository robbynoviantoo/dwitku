"use client";

import { useState, useTransition, useCallback } from "react";
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper,
    getPaginationRowModel,
} from "@tanstack/react-table";
import {
    Plus,
    Pencil,
    Trash2,
    Loader2,
    Search,
    TrendingUp,
    TrendingDown,
    Minus,
    ChevronLeft,
    ChevronRight,
    ArrowLeftRight,
    X,
} from "lucide-react";
import { deleteTransaction, getTransactions, type TransactionFilter } from "@/app/actions/transaction";
import { TransactionFormDialog } from "@/components/transactions/transaction-form-dialog";
import { formatCurrency, formatDateShort, cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";

type Category = { id: string; name: string; emoji: string; color: string; type: string };

type Transaction = {
    id: string;
    amount: number | any;
    note: string | null;
    date: Date;
    type: string;
    categoryId: string;
    category: { id: string; name: string; emoji: string; color: string };
    createdBy: { id: string; name: string | null; image: string | null };
};

type Summary = { income: number; expense: number; net: number };

type Props = {
    workspaceId: string;
    currency: string;
    categories: Category[];
    initialTransactions: Transaction[];
    initialTotal: number;
    summary: Summary;
    canEdit: boolean;
};

const PAGE_SIZE = 20;
const col = createColumnHelper<Transaction>();

export function TransactionsClient({
    workspaceId,
    currency,
    categories,
    initialTransactions,
    initialTotal,
    summary,
    canEdit,
}: Props) {
    const [transactions, setTransactions] = useState(initialTransactions);
    const [total, setTotal] = useState(initialTotal);
    const [isPending, startTransition] = useTransition();
    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState<TransactionFilter>({});
    const [search, setSearch] = useState("");
    const [dialog, setDialog] = useState<{ open: boolean; transaction?: Transaction }>({ open: false });
    const [error, setError] = useState<string | undefined>();

    const totalPages = Math.ceil(total / PAGE_SIZE);

    // Fetch with current filters
    const fetchData = useCallback(
        (newFilter: TransactionFilter, newPage: number) => {
            startTransition(async () => {
                const result = await getTransactions(workspaceId, {
                    ...newFilter,
                    page: newPage,
                    limit: PAGE_SIZE,
                });
                setTransactions(result.items as any);
                setTotal(result.total);
            });
        },
        [workspaceId]
    );

    const handleFilterChange = (updates: Partial<TransactionFilter>) => {
        const newFilter = { ...filter, ...updates };
        setFilter(newFilter);
        setPage(1);
        fetchData(newFilter, 1);
    };

    const handleSearch = (val: string) => {
        setSearch(val);
        handleFilterChange({ search: val || undefined });
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        fetchData(filter, newPage);
    };

    const handleDelete = (tx: Transaction) => {
        if (!confirm("Hapus transaksi ini?")) return;
        startTransition(async () => {
            const result = await deleteTransaction(tx.id, workspaceId);
            if (result.error) {
                setError(result.error);
            } else {
                fetchData(filter, page);
            }
        });
    };

    const handleSuccess = () => {
        fetchData(filter, page);
    };

    const columns = [
        col.accessor("date", {
            header: "Tanggal",
            cell: (info) => (
                <span className="text-sm text-zinc-600 whitespace-nowrap">
                    {formatDateShort(info.getValue())}
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
                            : "bg-red-100 text-red-600"
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
                            tx.type === "INCOME" ? "text-green-600" : "text-red-500"
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
                            disabled={isPending}
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
        data: transactions,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        pageCount: totalPages,
    });

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
                        <ArrowLeftRight className="w-6 h-6 text-indigo-500" />
                        Transaksi
                    </h1>
                    <p className="text-zinc-500 text-sm mt-1">{total} transaksi ditemukan</p>
                </div>
                {canEdit && (
                    <button
                        onClick={() => setDialog({ open: true })}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah
                    </button>
                )}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                    {
                        label: "Total Pemasukan",
                        value: summary.income,
                        icon: TrendingUp,
                        color: "text-green-600",
                        bg: "bg-green-50 border-green-100",
                    },
                    {
                        label: "Total Pengeluaran",
                        value: summary.expense,
                        icon: TrendingDown,
                        color: "text-red-500",
                        bg: "bg-red-50 border-red-100",
                    },
                    {
                        label: "Saldo Bersih",
                        value: summary.net,
                        icon: Minus,
                        color: summary.net >= 0 ? "text-indigo-600" : "text-red-500",
                        bg: "bg-indigo-50 border-indigo-100",
                    },
                ].map((card) => {
                    const Icon = card.icon;
                    return (
                        <div key={card.label} className={`bg-white rounded-xl border shadow-sm p-4 ${card.bg}`}>
                            <div className="flex items-center gap-2 mb-1">
                                <Icon className={`w-4 h-4 ${card.color}`} />
                                <p className="text-xs font-medium text-zinc-500">{card.label}</p>
                            </div>
                            <p className={`text-xl font-bold ${card.color}`}>
                                {formatCurrency(card.value, currency)}
                            </p>
                        </div>
                    );
                })}
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
                    onChange={(e) => handleFilterChange({ type: (e.target.value as any) || undefined })}
                    className="px-3 py-2 border border-zinc-200 rounded-lg text-sm text-zinc-700 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                    <option value="">Semua Tipe</option>
                    <option value="INCOME">Pemasukan</option>
                    <option value="EXPENSE">Pengeluaran</option>
                </select>

                {/* Category filter */}
                <select
                    value={filter.categoryId ?? ""}
                    onChange={(e) => handleFilterChange({ categoryId: e.target.value || undefined })}
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
                    onChange={(e) => handleFilterChange({ dateFrom: e.target.value || undefined })}
                    className="px-3 py-2 border border-zinc-200 rounded-lg text-sm text-zinc-700 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <input
                    type="date"
                    value={filter.dateTo ?? ""}
                    onChange={(e) => handleFilterChange({ dateTo: e.target.value || undefined })}
                    className="px-3 py-2 border border-zinc-200 rounded-lg text-sm text-zinc-700 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />

                {/* Reset filter */}
                {(filter.type || filter.categoryId || filter.dateFrom || filter.dateTo || search) && (
                    <button
                        onClick={() => {
                            setFilter({});
                            setSearch("");
                            setPage(1);
                            fetchData({}, 1);
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
                    <button onClick={() => setError(undefined)} className="ml-2 underline">tutup</button>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-xl border border-zinc-100 shadow-sm overflow-hidden">
                {isPending && (
                    <div className="flex items-center justify-center py-4 gap-2 text-sm text-zinc-400 border-b border-zinc-50">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Memuat...
                    </div>
                )}
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
                            {table.getRowModel().rows.length === 0 ? (
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
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page <= 1 || isPending}
                                className="p-1.5 rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50 disabled:opacity-40 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                const p = i + Math.max(1, page - 2);
                                if (p > totalPages) return null;
                                return (
                                    <button
                                        key={p}
                                        onClick={() => handlePageChange(p)}
                                        disabled={isPending}
                                        className={cn(
                                            "w-8 h-8 rounded-lg text-sm font-medium transition-colors",
                                            p === page
                                                ? "bg-indigo-600 text-white"
                                                : "border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                                        )}
                                    >
                                        {p}
                                    </button>
                                );
                            })}
                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page >= totalPages || isPending}
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
                    transaction={dialog.transaction}
                    onClose={() => setDialog({ open: false })}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
}
