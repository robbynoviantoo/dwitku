"use client";

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import {
    getSales, getSaleExpenses, getSalesSummary, deleteSale, deleteSaleExpense,
} from "@/app/actions/sale";
import { getProducts, deleteProduct } from "@/app/actions/product";
import { getCategories } from "@/app/actions/category";
import { formatCurrency } from "@/lib/utils";
import { usePrivacy } from "@/components/providers/privacy-provider";
import {
    Plus, Search, Pencil, Trash2, ShoppingBag, Receipt, TrendingUp, TrendingDown, Wallet,
    ChevronLeft, ChevronRight, Filter, X,
} from "lucide-react";
import { SaleFormDialog } from "./sale-form-dialog";
import { SaleExpenseDialog } from "./sale-expense-dialog";
import { ProductFormDialog } from "./product-form-dialog";
import Swal from "sweetalert2";

type Tab = "sales" | "expenses" | "products";

export function SalesClient({ userId, userEmail }: { userId: string; userEmail: string }) {
    const searchParams = useSearchParams();
    const workspaceId = searchParams.get("workspaceId") ?? "";
    const queryClient = useQueryClient();
    const { showAmount } = usePrivacy();

    const [tab, setTab] = useState<Tab>("sales");
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [categoryId, setCategoryId] = useState<string>("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [saleDialog, setSaleDialog] = useState<{ open: boolean; sale?: any }>({ open: false });
    const [expenseDialog, setExpenseDialog] = useState<{ open: boolean; expense?: any }>({ open: false });
    const [productDialog, setProductDialog] = useState<{ open: boolean; product?: any }>({ open: false });

    const filter = { page, search: search || undefined, categoryId: categoryId || undefined, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined };

    const { data: salesData, isLoading: loadingSales } = useQuery({
        queryKey: ["sales", workspaceId, filter],
        queryFn: () => getSales(workspaceId, filter),
        enabled: !!workspaceId && tab === "sales",
    });

    const { data: expensesData, isLoading: loadingExpenses } = useQuery({
        queryKey: ["sale-expenses", workspaceId, filter],
        queryFn: () => getSaleExpenses(workspaceId, filter),
        enabled: !!workspaceId && tab === "expenses",
    });

    const { data: productsData, isLoading: loadingProducts } = useQuery({
        queryKey: ["products", workspaceId, filter],
        queryFn: () => getProducts(workspaceId, filter),
        enabled: !!workspaceId && tab === "products",
    });

    const { data: summary } = useQuery({
        queryKey: ["sales-summary", workspaceId],
        queryFn: () => getSalesSummary(workspaceId),
        enabled: !!workspaceId,
    });

    const { data: categories = [] } = useQuery({
        queryKey: ["categories", workspaceId],
        queryFn: () => getCategories(workspaceId),
        enabled: !!workspaceId,
    });

    const deleteSaleMutation = useMutation({
        mutationFn: (id: string) => deleteSale(id, workspaceId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sales", workspaceId] });
            queryClient.invalidateQueries({ queryKey: ["sales-summary", workspaceId] });
        },
    });

    const deleteExpenseMutation = useMutation({
        mutationFn: (id: string) => deleteSaleExpense(id, workspaceId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sale-expenses", workspaceId] });
            queryClient.invalidateQueries({ queryKey: ["sales-summary", workspaceId] });
        },
    });

    const deleteProductMutation = useMutation({
        mutationFn: (id: string) => deleteProduct(id, workspaceId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products", workspaceId] });
        },
    });

    const handleDeleteSale = async (id: string) => {
        const result = await Swal.fire({
            title: "Hapus penjualan?",
            text: "Data tidak bisa dikembalikan.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#71717a",
            confirmButtonText: "Hapus",
            cancelButtonText: "Batal",
            customClass: { popup: "!rounded-2xl !font-[Inter,sans-serif]" },
        });
        if (result.isConfirmed) deleteSaleMutation.mutate(id);
    };

    const handleDeleteExpense = async (id: string) => {
        const result = await Swal.fire({
            title: "Hapus biaya?",
            text: "Data tidak bisa dikembalikan.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#71717a",
            confirmButtonText: "Hapus",
            cancelButtonText: "Batal",
            customClass: { popup: "!rounded-2xl !font-[Inter,sans-serif]" },
        });
        if (result.isConfirmed) deleteExpenseMutation.mutate(id);
    };

    const handleDeleteProduct = async (id: string) => {
        const result = await Swal.fire({
            title: "Hapus produk?",
            text: "Data produk ini akan dihapus permanen.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#71717a",
            confirmButtonText: "Hapus",
            cancelButtonText: "Batal",
            customClass: { popup: "!rounded-2xl !font-[Inter,sans-serif]" },
        });
        if (result.isConfirmed) deleteProductMutation.mutate(id);
    };

    const currency = "IDR";
    const summaryCards = [
        { label: "Omzet", value: summary?.omzet ?? 0, color: "green", icon: <TrendingUp className="w-4 h-4" /> },
        { label: "Laba Kotor", value: summary?.labaKotor ?? 0, color: "emerald", icon: <Wallet className="w-4 h-4" /> },
        { label: "Biaya Ops", value: summary?.biayaOperasional ?? 0, color: "red", icon: <Receipt className="w-4 h-4" /> },
        { label: "Laba Bersih", value: summary?.labaBersih ?? 0, color: (summary?.labaBersih ?? 0) >= 0 ? "blue" : "red", icon: <ShoppingBag className="w-4 h-4" /> },
    ];

    const colorMap: Record<string, string> = {
        green: "bg-green-50 text-green-700 border-green-100",
        emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
        blue: "bg-blue-50 text-blue-700 border-blue-100",
        red: "bg-red-50 text-red-600 border-red-100",
    };
    const iconColorMap: Record<string, string> = {
        green: "text-green-600", emerald: "text-emerald-600", blue: "text-blue-600", red: "text-red-500",
    };

    if (!workspaceId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                    <ShoppingBag className="w-8 h-8 text-blue-500" />
                </div>
                <h2 className="text-lg font-bold text-zinc-700 mb-1">Pilih workspace terlebih dahulu</h2>
                <p className="text-sm text-zinc-500 max-w-xs">Buka daftar workspace dan pilih workspace penjualan untuk melihat data.</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-7xl lg:max-w-full mx-auto space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {summaryCards.map((card) => (
                    <div key={card.label} className={`rounded-2xl border p-4 ${colorMap[card.color]}`}>
                        <div className="flex items-center gap-2 mb-1">
                            <span className={iconColorMap[card.color]}>{card.icon}</span>
                            <span className="text-xs font-medium opacity-80">{card.label}</span>
                        </div>
                        <p className="text-lg font-bold">
                            {showAmount ? formatCurrency(card.value, currency) : "••••••"}
                        </p>
                    </div>
                ))}
            </div>

            {/* Tabs + Actions */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex bg-zinc-100 rounded-xl p-1 overflow-x-auto hide-scrollbar max-w-full">
                    {([["sales", "🛎️ Penjualan"], ["expenses", "📋 Biaya Ops"], ["products", "📦 Produk"]] as [Tab, string][]).map(([t, label]) => (
                        <button
                            key={t}
                            onClick={() => { setTab(t); setPage(1); }}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === t ? "bg-white shadow text-zinc-900" : "text-zinc-500 hover:text-zinc-700"}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => tab === "sales" ? setSaleDialog({ open: true }) : tab === "expenses" ? setExpenseDialog({ open: true }) : setProductDialog({ open: true })}
                    className="flex shrink-0 items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-all shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    {tab === "sales" ? "Tambah Penjualan" : tab === "expenses" ? "Tambah Biaya" : "Tambah Produk"}
                </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder={tab === "sales" ? "Cari nama produk..." : "Cari nama biaya..."}
                        className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl border transition-colors ${showFilters ? "bg-green-600 text-white border-green-600" : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"}`}
                >
                    <Filter className="w-3.5 h-3.5" /> Filter
                </button>
                {(categoryId || dateFrom || dateTo) && (
                    <button
                        onClick={() => { setCategoryId(""); setDateFrom(""); setDateTo(""); setPage(1); }}
                        className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600"
                    >
                        <X className="w-3 h-3" /> Reset
                    </button>
                )}
            </div>

            {showFilters && (
                <div className="flex flex-wrap gap-3 bg-zinc-50 rounded-xl p-4 border border-zinc-100">
                    <div className="flex-1 min-w-[160px]">
                        <label className="text-xs font-medium text-zinc-500 mb-1 block">Kategori</label>
                        <select
                            value={categoryId}
                            onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
                            className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">Semua</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1 min-w-[140px]">
                        <label className="text-xs font-medium text-zinc-500 mb-1 block">Dari</label>
                        <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                            className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                    <div className="flex-1 min-w-[140px]">
                        <label className="text-xs font-medium text-zinc-500 mb-1 block">Sampai</label>
                        <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                            className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
                {tab === "sales" ? (
                    loadingSales ? (
                        <div className="py-16 text-center text-zinc-400 text-sm">Memuat data...</div>
                    ) : salesData?.items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
                            <ShoppingBag className="w-10 h-10 mb-3 opacity-20" />
                            <p className="text-sm font-medium">Belum ada penjualan</p>
                            <button onClick={() => setSaleDialog({ open: true })} className="mt-3 text-green-600 text-sm font-medium underline underline-offset-2">
                                Catat sekarang
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-zinc-50">
                                            {["Tanggal", "Produk", "Kategori", "Qty", "Omzet", "Total HPP", "Laba Bersih", "Aksi"].map((h) => (
                                                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wide">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-50">
                                        {salesData?.items.map((sale) => {
                                            const totalOmzet = Number(sale.sellingPrice);
                                            const totalHpp = Number(sale.costPrice);
                                            const labaBersih = totalOmzet - totalHpp;
                                            return (
                                                <tr key={sale.id} className="hover:bg-zinc-50/80 transition-colors">
                                                    <td className="px-4 py-3 text-zinc-500 whitespace-nowrap">
                                                        {new Date(sale.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                                                    </td>
                                                    <td className="px-4 py-3 font-medium text-zinc-900">
                                                        {sale.name}
                                                        {sale.note && <p className="text-xs text-zinc-400 truncate max-w-[120px]">{sale.note}</p>}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {sale.category ? (
                                                            <span className="text-xs px-2 py-1 rounded-full bg-zinc-100 text-zinc-600">
                                                                {sale.category.emoji} {sale.category.name}
                                                            </span>
                                                        ) : <span className="text-zinc-300">—</span>}
                                                    </td>
                                                    <td className="px-4 py-3 text-zinc-600">{Number(sale.qty)}</td>
                                                    <td className="px-4 py-3 font-medium text-green-700">
                                                        {showAmount ? formatCurrency(totalOmzet, currency) : "••••••"}
                                                    </td>
                                                    <td className="px-4 py-3 text-zinc-500">
                                                        {showAmount ? formatCurrency(totalHpp, currency) : "••••••"}
                                                    </td>
                                                    <td className={`px-4 py-3 font-semibold ${labaBersih >= 0 ? "text-green-600" : "text-red-500"}`}>
                                                        {showAmount ? formatCurrency(labaBersih, currency) : "••••••"}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex gap-1">
                                                            <button
                                                                onClick={() => setSaleDialog({ open: true, sale })}
                                                                className="p-1.5 text-zinc-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                            >
                                                                <Pencil className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteSale(sale.id)}
                                                                className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="md:hidden divide-y divide-zinc-50">
                                {salesData?.items.map((sale) => {
                                    const totalOmzet = Number(sale.sellingPrice);
                                    const totalHpp = Number(sale.costPrice);
                                    const labaBersih = totalOmzet - totalHpp;
                                    return (
                                        <div key={sale.id} className="p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-zinc-900 truncate">{sale.name}</p>
                                                    <p className="text-xs text-zinc-400 mt-0.5">
                                                        {new Date(sale.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                                                        {sale.category && <> · {sale.category.emoji} {sale.category.name}</>}
                                                    </p>
                                                    <div className="flex gap-3 mt-2 flex-wrap">
                                                        <span className="text-xs text-zinc-500">Qty: {Number(sale.qty)}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="font-bold text-green-700 text-sm">
                                                        {showAmount ? formatCurrency(totalOmzet, currency) : "••••••"}
                                                    </p>
                                                    <p className={`text-xs font-medium ${labaBersih >= 0 ? "text-green-600" : "text-red-500"}`}>
                                                        Laba: {showAmount ? formatCurrency(labaBersih, currency) : "••••"}
                                                    </p>
                                                    <div className="flex gap-1 mt-2 justify-end">
                                                        <button onClick={() => setSaleDialog({ open: true, sale })} className="p-1.5 text-zinc-400 hover:text-green-600 rounded-lg transition-colors">
                                                            <Pencil className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button onClick={() => handleDeleteSale(sale.id)} className="p-1.5 text-zinc-400 hover:text-red-600 rounded-lg transition-colors">
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )
                ) : tab === "expenses" ? (
                    /* Expenses Tab */
                    loadingExpenses ? (
                        <div className="py-16 text-center text-zinc-400 text-sm">Memuat data...</div>
                    ) : expensesData?.items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-zinc-400">
                            <Receipt className="w-10 h-10 mb-3 opacity-20" />
                            <p className="text-sm font-medium">Belum ada catatan biaya operasional</p>
                            <button onClick={() => setExpenseDialog({ open: true })} className="mt-3 text-green-600 text-sm font-medium underline underline-offset-2">
                                Tambah sekarang
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-zinc-50">
                                            {["Tanggal", "Nama Biaya", "Kategori", "Jumlah", "Catatan", "Aksi"].map((h) => (
                                                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wide">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-50">
                                        {expensesData?.items.map((expense) => (
                                            <tr key={expense.id} className="hover:bg-zinc-50/80 transition-colors">
                                                <td className="px-4 py-3 text-zinc-500 whitespace-nowrap">
                                                    {new Date(expense.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                                                </td>
                                                <td className="px-4 py-3 font-medium text-zinc-900">{expense.name}</td>
                                                <td className="px-4 py-3">
                                                    {expense.category ? (
                                                        <span className="text-xs px-2 py-1 rounded-full bg-zinc-100 text-zinc-600">
                                                            {expense.category.emoji} {expense.category.name}
                                                        </span>
                                                    ) : <span className="text-zinc-300">—</span>}
                                                </td>
                                                <td className="px-4 py-3 font-semibold text-red-600">
                                                    {showAmount ? formatCurrency(Number(expense.amount), currency) : "••••••"}
                                                </td>
                                                <td className="px-4 py-3 text-zinc-400 text-xs max-w-[150px] truncate">{expense.note || "—"}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-1">
                                                        <button onClick={() => setExpenseDialog({ open: true, expense })} className="p-1.5 text-zinc-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                                                            <Pencil className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button onClick={() => handleDeleteExpense(expense.id)} className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="md:hidden divide-y divide-zinc-50">
                                {expensesData?.items.map((expense) => (
                                    <div key={expense.id} className="p-4 flex items-center justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-zinc-900 truncate">{expense.name}</p>
                                            <p className="text-xs text-zinc-400 mt-0.5">
                                                {new Date(expense.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                                                {expense.category && <> · {expense.category.emoji} {expense.category.name}</>}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="font-bold text-red-600 text-sm">{showAmount ? formatCurrency(Number(expense.amount), currency) : "••••••"}</p>
                                            <div className="flex gap-1 mt-1 justify-end">
                                                <button onClick={() => setExpenseDialog({ open: true, expense })} className="p-1.5 text-zinc-400 hover:text-green-600 rounded-lg transition-colors">
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => handleDeleteExpense(expense.id)} className="p-1.5 text-zinc-400 hover:text-red-600 rounded-lg transition-colors">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )
                ) : (
                    /* Products Tab */
                    loadingProducts ? (
                        <div className="py-16 text-center text-zinc-400 text-sm">Memuat data...</div>
                    ) : productsData?.items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-zinc-400 p-4">
                            <ShoppingBag className="w-10 h-10 mb-3 opacity-20" />
                            <p className="text-sm font-medium">Belum ada daftar produk</p>
                            <p className="text-xs text-zinc-400 mt-1 max-w-sm text-center">Tambahkan produk agar pencatatan omzet bisa lebih cepat dan otomatis menghitung HPP</p>
                            <button onClick={() => setProductDialog({ open: true })} className="mt-4 px-4 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors">
                                Tambah Produk Pertama
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y divide-zinc-50">
                            {productsData?.items.map((prod) => (
                                <div key={prod.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50 transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-semibold text-zinc-900 truncate">{prod.name}</p>
                                            {prod.category && (
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 shrink-0">
                                                    {prod.category.emoji} {prod.category.name}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex gap-4 text-xs">
                                            <div><span className="text-zinc-400">HPP / pcs:</span> <span className="font-medium text-zinc-700">{formatCurrency(Number(prod.costPrice), currency)}</span></div>
                                            <div><span className="text-zinc-400">Paket Harga:</span> <span className="font-medium text-zinc-700">{(prod.packages as any[])?.length || 0} set</span></div>
                                        </div>
                                        
                                        {(prod.packages as any[])?.length > 0 && (
                                            <div className="flex gap-2 flex-wrap mt-2">
                                                {(prod.packages as any[]).map((pkg, idx) => (
                                                    <span key={idx} className="text-[10px] bg-green-50 text-green-700 px-2 py-1 rounded-md border border-green-100 font-medium whitespace-nowrap">
                                                        Rp {pkg.price.toLocaleString()} = {pkg.qty} pcs
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-1 sm:justify-end shrink-0">
                                        <button onClick={() => setProductDialog({ open: true, product: prod })} className="p-2 text-zinc-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-colors">
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDeleteProduct(prod.id)} className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}

                {/* Pagination */}
                {(() => {
                    const data = tab === "sales" ? salesData : tab === "expenses" ? expensesData : productsData;
                    if (!data || data.totalPages <= 1) return null;
                    return (
                        <div className="flex items-center justify-between px-5 py-4 border-t border-zinc-50">
                            <p className="text-xs text-zinc-400">
                                {data.total} data · Hal {page} dari {data.totalPages}
                            </p>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-1.5 rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50 disabled:opacity-40 transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                                    disabled={page === data.totalPages}
                                    className="p-1.5 rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50 disabled:opacity-40 transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    );
                })()}
            </div>

            {/* Dialogs */}
            <SaleFormDialog
                open={saleDialog.open}
                onClose={() => setSaleDialog({ open: false })}
                workspaceId={workspaceId}
                sale={saleDialog.sale}
                categories={categories}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ["sales", workspaceId] });
                    queryClient.invalidateQueries({ queryKey: ["sales-summary", workspaceId] });
                }}
            />

            <SaleExpenseDialog
                open={expenseDialog.open}
                onClose={() => setExpenseDialog({ open: false })}
                workspaceId={workspaceId}
                expense={expenseDialog.expense}
                categories={categories}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ["sale-expenses", workspaceId] });
                    queryClient.invalidateQueries({ queryKey: ["sales-summary", workspaceId] });
                }}
            />

            <ProductFormDialog
                open={productDialog.open}
                onClose={() => setProductDialog({ open: false })}
                workspaceId={workspaceId}
                product={productDialog.product}
                categories={categories}
                onSuccess={() => {
                    queryClient.invalidateQueries({ queryKey: ["products", workspaceId] });
                }}
            />
        </div>
    );
}
