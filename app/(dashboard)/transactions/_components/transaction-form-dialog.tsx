"use client";

import { useState, useTransition, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { TransactionSchema } from "@/lib/validations/transaction";
import { createTransaction, updateTransaction } from "@/app/actions/transaction";
import { useQueryClient } from "@tanstack/react-query";
import { broadcastInvalidate } from "@/components/providers/query-provider";
import {
    TrendingUp,
    TrendingDown,
    X,
    Loader2,
    Search,
    ChevronDown,
    Wallet as WalletIcon,
    Tag,
    ArrowRightLeft,
    ScanLine,
    Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLenis } from "lenis/react";
import { CalendarPicker } from "@/components/ui/calendar-picker";
import { getWallets, WalletWithBalance } from "@/app/actions/wallet";
import { WalletLogo } from "@/components/ui/wallet-logo";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";
import { useLanguage } from "@/components/providers/language-provider";

import * as Popover from "@radix-ui/react-popover";

type Category = { id: string; name: string; emoji: string; color: string; type: string };

type Transaction = {
    id: string;
    amount: number;
    note: string | null;
    date: Date;
    type: string;
    categoryId?: string | null;
    walletId?: string | null;
    toWalletId?: string | null;
};

type Props = {
    workspaceId: string;
    categories: Category[];
    transaction?: Transaction;
    onClose: () => void;
    onSuccess: () => void;
};

// ── Format number with thousand separator (dot) ──────────────────────────────
function formatThousands(value: string): string {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function parseThousands(formatted: string): number {
    return Number(formatted.replace(/\./g, ""));
}

// ── Searchable Wallet Select Component (Radix Popover) ───────────────────────
function FormWalletSelect({
    wallets,
    value,
    onChange,
    excludeWalletId,
    placeholder,
    align = "start",
    error,
}: {
    wallets: WalletWithBalance[];
    value: string;
    onChange: (id: string) => void;
    excludeWalletId?: string;
    placeholder?: string;
    align?: "start" | "end" | "center";
    error?: string;
}) {
    const { t } = useLanguage();
    const defaultPlaceholder = placeholder || t("transactions.selectWallet");
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const availableWallets = useMemo(
        () => (excludeWalletId ? wallets.filter((w) => w.id !== excludeWalletId) : wallets),
        [wallets, excludeWalletId]
    );

    const selectedWallet = wallets.find((w) => w.id === value);

    const filtered = useMemo(
        () =>
            availableWallets.filter((w) =>
                w.name.toLowerCase().includes(search.toLowerCase()) ||
                (w.holderName && w.holderName.toLowerCase().includes(search.toLowerCase())) ||
                (w.accountNumber && w.accountNumber.includes(search))
            ),
        [availableWallets, search]
    );

    return (
        <div className="relative w-full">
            <Popover.Root open={open} onOpenChange={(v) => {
                setOpen(v);
                if (v) setTimeout(() => inputRef.current?.focus(), 80);
                else setSearch("");
            }}>
                <Popover.Trigger asChild>
                    <button
                        type="button"
                        className={cn(
                            "flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all cursor-pointer",
                            "bg-zinc-50 hover:bg-white border-zinc-200 focus:outline-hidden",
                            error ? "border-red-500 bg-red-50/30" : open ? "border-green-500 ring-2 ring-green-100 bg-white" : ""
                        )}
                    >
                        {selectedWallet ? (
                            <div className="flex items-center gap-2.5 min-w-0 text-left">
                                <WalletLogo providerCode={selectedWallet.providerCode} size="sm" />
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-zinc-900 truncate leading-tight">
                                        {selectedWallet.name}
                                    </p>
                                    <p className="text-[10px] text-zinc-400 truncate leading-tight">
                                        {selectedWallet.holderName ? `${selectedWallet.holderName} · ` : ""}
                                        {formatCurrency(selectedWallet.currentBalance, "IDR")}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-zinc-400 text-xs">
                                <WalletIcon className="w-4 h-4" />
                                <span className="truncate">{defaultPlaceholder}</span>
                            </div>
                        )}
                        <ChevronDown className={cn("w-4 h-4 text-zinc-400 transition-transform shrink-0", open && "rotate-180")} />
                    </button>
                </Popover.Trigger>

                <Popover.Portal>
                    <Popover.Content
                        align={align}
                        side="bottom"
                        sideOffset={6}
                        collisionPadding={12}
                        avoidCollisions={true}
                        className="w-[calc(100vw-2.5rem)] sm:w-[330px] max-w-[380px] bg-white border border-zinc-200 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-150 focus:outline-hidden"
                    >
                        <div className="p-2 border-b border-zinc-100 bg-zinc-50/70">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                                <input
                                    ref={inputRef}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder={t("transactions.searchWallet")}
                                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-green-400 bg-white"
                                />
                            </div>
                        </div>
                        <div className="max-h-[min(260px,50vh)] overflow-y-auto p-1.5 space-y-1 overscroll-contain" data-lenis-prevent>
                            {filtered.length === 0 ? (
                                <p className="text-center py-4 text-xs text-zinc-400">{t("transactions.walletNotFound")}</p>
                            ) : (
                                filtered.map((w) => {
                                    const active = w.id === value;
                                    return (
                                        <button
                                            key={w.id}
                                            type="button"
                                            onClick={() => {
                                                onChange(w.id);
                                                setOpen(false);
                                                setSearch("");
                                            }}
                                            className={cn(
                                                "flex items-center justify-between w-full p-2.5 rounded-xl text-left transition-colors cursor-pointer group",
                                                active
                                                    ? "bg-green-50/90 text-green-950 font-semibold border border-green-200/80"
                                                    : "hover:bg-zinc-50 text-zinc-700"
                                            )}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <WalletLogo providerCode={w.providerCode} size="md" className="shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-zinc-900 truncate leading-tight">
                                                        {w.name}
                                                    </p>
                                                    <p className="text-[10px] text-zinc-400 truncate leading-tight mt-0.5">
                                                        {w.holderName ? `${w.holderName}` : ""}
                                                        {w.holderName && w.accountNumber ? " · " : ""}
                                                        {w.accountNumber ? `${w.accountNumber}` : ""}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg shrink-0 ml-2 whitespace-nowrap">
                                                {formatCurrency(w.currentBalance, "IDR")}
                                            </span>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </Popover.Content>
                </Popover.Portal>
            </Popover.Root>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}

// ── Searchable Category Select Component (Radix Popover) ─────────────────────
function FormCategorySelect({
    categories,
    value,
    onChange,
    error,
}: {
    categories: Category[];
    value: string;
    onChange: (id: string) => void;
    error?: string;
}) {
    const { t } = useLanguage();
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedCat = categories.find((c) => c.id === value);
    const filtered = useMemo(
        () =>
            categories.filter((c) =>
                c.name.toLowerCase().includes(search.toLowerCase())
            ),
        [categories, search]
    );

    return (
        <div className="relative w-full">
            <Popover.Root open={open} onOpenChange={(v) => {
                setOpen(v);
                if (v) setTimeout(() => inputRef.current?.focus(), 80);
                else setSearch("");
            }}>
                <Popover.Trigger asChild>
                    <button
                        type="button"
                        className={cn(
                            "flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all cursor-pointer",
                            "bg-zinc-50 hover:bg-white border-zinc-200 focus:outline-hidden",
                            error ? "border-red-500 bg-red-50/30" : open ? "border-green-500 ring-2 ring-green-100 bg-white" : ""
                        )}
                    >
                        {selectedCat ? (
                            <div className="flex items-center gap-2 min-w-0 text-left">
                                <span className="text-base">{selectedCat.emoji}</span>
                                <span className="text-xs font-semibold text-zinc-900 truncate">{selectedCat.name}</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-zinc-400 text-xs">
                                <Tag className="w-4 h-4" />
                                <span>{t("transactions.selectCategory")}</span>
                            </div>
                        )}
                        <ChevronDown className={cn("w-4 h-4 text-zinc-400 transition-transform shrink-0", open && "rotate-180")} />
                    </button>
                </Popover.Trigger>

                <Popover.Portal>
                    <Popover.Content
                        side="bottom"
                        sideOffset={6}
                        collisionPadding={12}
                        avoidCollisions={true}
                        className="w-[calc(100vw-2.5rem)] sm:w-[380px] max-w-[420px] bg-white border border-zinc-200 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-150 focus:outline-hidden"
                    >
                        <div className="p-2 border-b border-zinc-100 bg-zinc-50/70">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                                <input
                                    ref={inputRef}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder={t("transactions.searchCategoryPlaceholder")}
                                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-green-400 bg-white"
                                />
                            </div>
                        </div>
                        <div className="max-h-[min(240px,45vh)] overflow-y-auto p-1.5 grid grid-cols-2 gap-1 overscroll-contain" data-lenis-prevent>
                            {filtered.length === 0 ? (
                                <p className="col-span-2 text-center py-4 text-xs text-zinc-400">{t("transactions.categoryNotFound")}</p>
                            ) : (
                                filtered.map((c) => {
                                    const active = c.id === value;
                                    return (
                                        <button
                                            key={c.id}
                                            type="button"
                                            onClick={() => {
                                                onChange(c.id);
                                                setOpen(false);
                                                setSearch("");
                                            }}
                                            className={cn(
                                                "flex items-center gap-2 p-2 rounded-xl text-left transition-colors cursor-pointer",
                                                active ? "bg-green-100 text-green-900 font-semibold" : "hover:bg-zinc-50 text-zinc-700"
                                            )}
                                        >
                                            <span className="text-base shrink-0">{c.emoji}</span>
                                            <span className="text-xs truncate">{c.name}</span>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </Popover.Content>
                </Popover.Portal>
            </Popover.Root>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}

// ── Amount Input ─────────────────────────────────────────────────────────────
function AmountInput({
    value,
    onChange,
    error,
}: {
    value: number | undefined;
    onChange: (v: number) => void;
    error?: string;
}) {
    const { t } = useLanguage();
    const [display, setDisplay] = useState(
        value && value > 0 ? formatThousands(String(value)) : ""
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        const formatted = formatThousands(raw);
        setDisplay(formatted);
        onChange(parseThousands(formatted) || 0);
    };

    // Sync display if value changes from outside (e.g. form reset)
    useEffect(() => {
        if (!value || value === 0) {
            setDisplay("");
        } else {
            setDisplay(formatThousands(String(value)));
        }
    }, [value]);

    return (
        <div>
            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                {t("transactions.nominal")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-bold select-none">
                    Rp
                </span>
                <input
                    type="text"
                    inputMode="numeric"
                    value={display}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full pl-9 pr-3.5 py-2.5 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 bg-zinc-50 focus:bg-white transition-colors text-zinc-900 text-right font-bold text-base tabular-nums"
                />
            </div>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}

// ── Main Dialog ───────────────────────────────────────────────────────────────
export function TransactionFormDialog({
    workspaceId,
    categories,
    transaction,
    onClose,
    onSuccess,
}: Props) {
    const { t } = useLanguage();
    const queryClient = useQueryClient();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | undefined>();
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState<{ confidence: number; items?: any[] } | null>(null);
    const scanInputRef = useRef<HTMLInputElement>(null);
    const isEdit = !!transaction;

    const { data: wallets = [] } = useQuery({
        queryKey: ["wallets", workspaceId],
        queryFn: () => getWallets(workspaceId),
        enabled: !!workspaceId,
    });

    // ── AI Receipt Scanner ───────────────────────────────────────────────────
    const handleScanReceipt = () => {
        scanInputRef.current?.click();
    };

    const processScannedImage = async (file: File) => {
        if (!file) return;
        setIsScanning(true);
        setError(undefined);
        try {
            const base64 = await fileToBase64(file);
            const res = await fetch("/api/ai/scan-receipt", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    imageBase64: base64,
                    mimeType: file.type,
                    workspaceId,
                }),
            });
            const json = await res.json();
            if (!res.ok || !json.success) {
                throw new Error(json.error || "Gagal memproses gambar");
            }
            const data = json.data;
            // Auto-fill form fields
            if (data.amount) form.setValue("amount", data.amount);
            if (data.note) form.setValue("note", data.note);
            if (data.type) form.setValue("type", data.type as "EXPENSE" | "INCOME" | "TRANSFER");
            if (data.date) form.setValue("date", data.date);
            if (data.matchedCategoryId) form.setValue("categoryId", data.matchedCategoryId);
            if (data.matchedWalletId) form.setValue("walletId", data.matchedWalletId);
            setScanResult({ confidence: data.confidence, items: data.items });
        } catch (err: any) {
            setError(err?.message || "Gagal scan struk");
        } finally {
            setIsScanning(false);
        }
    };

    function fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
        });
    }

    // Lock body scroll and pause Lenis smooth scroll while dialog is open
    const lenis = useLenis();
    useEffect(() => {
        lenis?.stop();
        const prevOverflow = document.body.style.overflow;
        const prevPaddingRight = document.body.style.paddingRight;
        
        const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
        if (scrollBarWidth > 0) {
            document.body.style.paddingRight = `${scrollBarWidth}px`;
        }
        document.body.style.overflow = "hidden";

        return () => {
            lenis?.start();
            document.body.style.overflow = prevOverflow;
            document.body.style.paddingRight = prevPaddingRight;
        };
    }, [lenis]);

    const defaultWallet = wallets.find((w) => w.isDefault) || wallets[0];

    const form = useForm<{
        amount: number;
        note?: string;
        date: string;
        type: "INCOME" | "EXPENSE" | "TRANSFER";
        categoryId?: string;
        walletId?: string;
        toWalletId?: string;
    }>({
        resolver: zodResolver(TransactionSchema) as any,
        defaultValues: {
            amount: transaction?.amount ?? (undefined as any),
            note: transaction?.note ?? "",
            date: transaction
                ? new Date(transaction.date).toISOString().split("T")[0]
                : new Date().toISOString().split("T")[0],
            type: (transaction?.type as "INCOME" | "EXPENSE" | "TRANSFER") ?? "EXPENSE",
            categoryId: transaction?.categoryId ?? "",
            walletId: transaction?.walletId ?? (defaultWallet?.id || ""),
            toWalletId: transaction?.toWalletId ?? "",
        },
    });

    const watchedType = form.watch("type");
    const watchedWalletId = form.watch("walletId");
    const filteredCategories = categories.filter((c) => c.type === watchedType);

    // Reset categoryId jika ganti tipe
    useEffect(() => {
        const sub = form.watch((value, { name }) => {
            if (name === "type") {
                if (value.type === "TRANSFER") {
                    form.setValue("categoryId", "");
                }
            }
        });
        return () => sub.unsubscribe();
    }, [form]);

    const onSubmit = (values: z.infer<typeof TransactionSchema>) => {
        setError(undefined);
        startTransition(async () => {
            const result = isEdit
                ? await updateTransaction(transaction!.id, workspaceId, values)
                : await createTransaction(workspaceId, values);

            if (result.error) {
                setError(result.error);
                return;
            }

            // Invalidate all transaction and summary queries (with immediate refetch)
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["transactions"] }),
                queryClient.invalidateQueries({ queryKey: ["transaction-summary"] }),
                queryClient.invalidateQueries({ queryKey: ["filtered-summary"] }),
                queryClient.invalidateQueries({ queryKey: ["calendar-transactions"] }),
                queryClient.invalidateQueries({ queryKey: ["wallets"] }),
                queryClient.invalidateQueries({ queryKey: ["wallets-summary"] }),
                queryClient.invalidateQueries({ queryKey: ["report-detailed-summary"] }),
                queryClient.invalidateQueries({ queryKey: ["report-monthly"] }),
                queryClient.invalidateQueries({ queryKey: ["report-category"] }),
                queryClient.invalidateQueries({ queryKey: ["report-top-transactions"] }),
                queryClient.invalidateQueries({ queryKey: ["report-wallet-distribution"] }),
                queryClient.invalidateQueries({ queryKey: ["report-comparison"] }),
                queryClient.invalidateQueries({ queryKey: ["workspaces"] }),
            ]);

            broadcastInvalidate(["transaction-summary", workspaceId]);
            broadcastInvalidate(["filtered-summary", workspaceId]);
            broadcastInvalidate(["calendar-transactions", workspaceId]);
            broadcastInvalidate(["transactions", workspaceId]);
            broadcastInvalidate(["wallets", workspaceId]);
            broadcastInvalidate(["wallets-summary", workspaceId]);
            broadcastInvalidate(["report-monthly", workspaceId]);

            onSuccess();
            onClose();
        });
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200" onClick={onClose} />

            {/* Modal Box */}
            <div className="relative bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 w-full max-w-md max-h-[calc(100dvh-1.5rem)] sm:max-h-[90vh] flex flex-col z-10 animate-in zoom-in-95 duration-200 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/50 shrink-0">
                    <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                        {isEdit ? t("transactions.editTransaction") : t("transactions.addTransaction")}
                    </h2>
                    <div className="flex items-center gap-1.5">
                        {/* AI Scan Receipt Button */}
                        {!isEdit && (
                            <>
                                <input
                                    ref={scanInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) processScannedImage(file);
                                        e.target.value = "";
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={handleScanReceipt}
                                    disabled={isScanning}
                                    title="Scan Struk / Screenshot dengan AI"
                                    className={cn(
                                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer border",
                                        isScanning
                                            ? "bg-violet-50 text-violet-400 border-violet-200 animate-pulse"
                                            : "bg-gradient-to-r from-violet-500 to-purple-600 text-white border-transparent hover:from-violet-600 hover:to-purple-700 shadow-sm"
                                    )}
                                >
                                    {isScanning ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <ScanLine className="w-3.5 h-3.5" />
                                    )}
                                    <span>{isScanning ? "Scanning..." : "Scan Struk"}</span>
                                </button>
                            </>
                        )}
                        <button
                            onClick={onClose}
                            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                {/* AI Scan Result Banner */}
                {scanResult && (
                    <div className="mx-4 mt-3 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 flex items-start gap-2.5">
                        <Sparkles className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-semibold text-violet-800">Struk berhasil dibaca AI ✨</p>
                            <p className="text-[10px] text-violet-600 mt-0.5">
                                Tingkat keyakinan: {Math.round(scanResult.confidence * 100)}%
                                {scanResult.items && scanResult.items.length > 0
                                    ? ` · ${scanResult.items.length} item terdeteksi`
                                    : ""}
                                . Periksa dan sesuaikan data di bawah sebelum simpan.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setScanResult(null)}
                            className="text-violet-400 hover:text-violet-600 transition-colors shrink-0"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}

                {/* Form area (Scrollable on mobile) */}
                <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 sm:p-5 space-y-3.5 flex-1 overflow-y-auto overscroll-contain">
                    {/* 1. Tipe Transaksi (Pengeluaran / Pemasukan / Transfer) */}
                    <div>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { value: "EXPENSE", label: t("transactions.expense"), icon: TrendingDown, color: "red" },
                                { value: "INCOME", label: t("transactions.income"), icon: TrendingUp, color: "green" },
                                { value: "TRANSFER", label: t("transactions.transfer"), icon: ArrowRightLeft, color: "blue" },
                            ].map((tItem) => {
                                const Icon = tItem.icon;
                                const active = watchedType === tItem.value;
                                return (
                                    <button
                                        key={tItem.value}
                                        type="button"
                                        onClick={() => form.setValue("type", tItem.value as any)}
                                        className={cn(
                                            "flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                                            active && tItem.color === "red"
                                                ? "border-red-500 bg-red-50 text-red-700 ring-2 ring-red-500/20"
                                                : active && tItem.color === "green"
                                                    ? "border-green-500 bg-green-50 text-green-700 ring-2 ring-green-500/20"
                                                    : active && tItem.color === "blue"
                                                        ? "border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-500/20"
                                                        : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                                        )}
                                    >
                                        <Icon className="w-3.5 h-3.5 shrink-0" />
                                        <span>{tItem.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 2. Amount Input */}
                    <Controller
                        name="amount"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <AmountInput
                                value={field.value}
                                onChange={field.onChange}
                                error={fieldState.error?.message}
                            />
                        )}
                    />

                    {/* 3. Input Dompet & Tanggal / Transfer Section */}
                    {watchedType === "TRANSFER" ? (
                        <>
                            {/* Transfer: Dari Dompet & Ke Dompet */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                                        {t("transactions.sourceWallet")} <span className="text-red-500">*</span>
                                    </label>
                                    <Controller
                                        name="walletId"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <FormWalletSelect
                                                wallets={wallets}
                                                value={field.value || ""}
                                                onChange={field.onChange}
                                                placeholder={t("transactions.selectSourceWallet")}
                                                error={fieldState.error?.message}
                                            />
                                        )}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                                        {t("transactions.destWallet")} <span className="text-red-500">*</span>
                                    </label>
                                    <Controller
                                        name="toWalletId"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <FormWalletSelect
                                                wallets={wallets}
                                                value={field.value || ""}
                                                excludeWalletId={watchedWalletId}
                                                onChange={field.onChange}
                                                placeholder={t("transactions.selectDestWallet")}
                                                align="end"
                                                error={fieldState.error?.message}
                                            />
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Tanggal Transfer */}
                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                                    {t("transactions.dateHeader")} <span className="text-red-500">*</span>
                                </label>
                                <Controller
                                    name="date"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <CalendarPicker
                                            value={field.value}
                                            onChange={field.onChange}
                                            error={fieldState.error?.message}
                                        />
                                    )}
                                />
                            </div>

                            {/* Info note */}
                            <div className="bg-blue-50/70 border border-blue-200/60 rounded-xl p-2.5 flex items-center gap-2 text-blue-800 text-[11px]">
                                <ArrowRightLeft className="w-4 h-4 text-blue-600 shrink-0" />
                                <span>{t("transactions.transferInfo")}</span>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Reguler: Dompet & Tanggal */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                                        {t("transactions.walletOrSource")}
                                    </label>
                                    <Controller
                                        name="walletId"
                                        control={form.control}
                                        render={({ field }) => (
                                            <FormWalletSelect
                                                wallets={wallets}
                                                value={field.value || ""}
                                                onChange={field.onChange}
                                                placeholder={t("transactions.selectWallet")}
                                            />
                                        )}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                                        {t("transactions.dateHeader")} <span className="text-red-500">*</span>
                                    </label>
                                    <Controller
                                        name="date"
                                        control={form.control}
                                        render={({ field, fieldState }) => (
                                            <CalendarPicker
                                                value={field.value}
                                                onChange={field.onChange}
                                                error={fieldState.error?.message}
                                            />
                                        )}
                                    />
                                </div>
                            </div>

                            {/* 4. Kategori */}
                            <div>
                                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                                    {t("transactions.categoryHeader")} <span className="text-red-500">*</span>
                                </label>
                                <Controller
                                    name="categoryId"
                                    control={form.control}
                                    render={({ field, fieldState }) => (
                                        <FormCategorySelect
                                            categories={filteredCategories}
                                            value={field.value || ""}
                                            onChange={field.onChange}
                                            error={fieldState.error?.message}
                                        />
                                    )}
                                />
                            </div>
                        </>
                    )}

                    {/* 5. Catatan */}
                    <div>
                        <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                            {t("transactions.notesHeader")} <span className="text-zinc-400 font-normal lowercase">({t("transactions.optional")})</span>
                        </label>
                        <input
                            type="text"
                            {...form.register("note")}
                            placeholder={t("transactions.notePlaceholder")}
                            className="w-full px-3.5 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 bg-zinc-50 focus:bg-white transition-colors text-xs text-zinc-900"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-3.5 py-2 rounded-xl text-xs">
                            {error}
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 border border-zinc-200 text-zinc-700 rounded-xl hover:bg-zinc-50 text-xs font-bold transition-colors cursor-pointer"
                        >
                            {t("transactions.cancelBtn")}
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-60",
                                watchedType === "TRANSFER"
                                    ? "bg-blue-600 hover:bg-blue-700"
                                    : watchedType === "INCOME"
                                        ? "bg-green-600 hover:bg-green-700"
                                        : "bg-red-500 hover:bg-red-600"
                            )}
                        >
                            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            {isEdit
                                ? t("transactions.saveChanges")
                                : watchedType === "TRANSFER"
                                    ? t("transactions.saveTransfer")
                                    : watchedType === "INCOME"
                                        ? t("transactions.saveIncome")
                                        : t("transactions.saveExpense")}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
