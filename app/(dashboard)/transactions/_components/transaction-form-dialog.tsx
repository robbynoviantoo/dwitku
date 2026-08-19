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
    Check,
    Wallet as WalletIcon,
    Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLenis } from "lenis/react";
import { CalendarPicker } from "@/components/ui/calendar-picker";
import { getWallets, WalletWithBalance } from "@/app/actions/wallet";
import { WalletLogo } from "@/components/ui/wallet-logo";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";

type Category = { id: string; name: string; emoji: string; color: string; type: string };

type Transaction = {
    id: string;
    amount: number;
    note: string | null;
    date: Date;
    type: string;
    categoryId: string;
    walletId?: string | null;
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

// ── Searchable Wallet Select Component ───────────────────────────────────────
function FormWalletSelect({
    wallets,
    value,
    onChange,
}: {
    wallets: WalletWithBalance[];
    value: string;
    onChange: (id: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const ref = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedWallet = wallets.find((w) => w.id === value);

    const filtered = useMemo(
        () =>
            wallets.filter((w) =>
                w.name.toLowerCase().includes(search.toLowerCase()) ||
                (w.holderName && w.holderName.toLowerCase().includes(search.toLowerCase())) ||
                (w.accountNumber && w.accountNumber.includes(search))
            ),
        [wallets, search]
    );

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
                setSearch("");
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleOpen = () => {
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    return (
        <div ref={ref} className="relative z-30">
            <button
                type="button"
                onClick={open ? () => { setOpen(false); setSearch(""); } : handleOpen}
                className={cn(
                    "flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all cursor-pointer",
                    "bg-zinc-50 hover:bg-white border-zinc-200 focus:outline-none",
                    open && "border-green-500 ring-2 ring-green-100 bg-white"
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
                        <span>Pilih Dompet / Sumber</span>
                    </div>
                )}
                <ChevronDown className={cn("w-4 h-4 text-zinc-400 transition-transform shrink-0", open && "rotate-180")} />
            </button>

            {open && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-2 border-b border-zinc-100 bg-zinc-50/70">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                            <input
                                ref={inputRef}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari dompet, pemilik, rekening..."
                                className="w-full pl-8 pr-3 py-1.5 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                            />
                        </div>
                    </div>
                    <div className="max-h-52 overflow-y-auto p-1 space-y-0.5" data-lenis-prevent>
                        {filtered.length === 0 ? (
                            <p className="text-center py-4 text-xs text-zinc-400">Dompet tidak ditemukan</p>
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
                                            "w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer",
                                            active ? "bg-green-50 text-green-800" : "hover:bg-zinc-50 text-zinc-700"
                                        )}
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <WalletLogo providerCode={w.providerCode} size="sm" />
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold truncate leading-tight">{w.name}</p>
                                                <p className="text-[10px] text-zinc-400 truncate leading-tight">
                                                    {w.holderName ? `${w.holderName} · ` : ""}
                                                    {formatCurrency(w.currentBalance, "IDR")}
                                                </p>
                                            </div>
                                        </div>
                                        {active && <Check className="w-4 h-4 text-green-600 shrink-0 ml-2" />}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Searchable Category Select Component ─────────────────────────────────────
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
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const ref = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedCat = categories.find((c) => c.id === value);

    const filtered = useMemo(
        () =>
            categories.filter((c) =>
                c.name.toLowerCase().includes(search.toLowerCase()) ||
                c.emoji.includes(search)
            ),
        [categories, search]
    );

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
                setSearch("");
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleOpen = () => {
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    return (
        <div ref={ref} className="relative z-20">
            <button
                type="button"
                onClick={open ? () => { setOpen(false); setSearch(""); } : handleOpen}
                className={cn(
                    "flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all cursor-pointer",
                    "bg-zinc-50 hover:bg-white border-zinc-200 focus:outline-none",
                    open && "border-green-500 ring-2 ring-green-100 bg-white",
                    error && "border-red-400 bg-red-50/20"
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
                        <span>Pilih Kategori Transaksi</span>
                    </div>
                )}
                <ChevronDown className={cn("w-4 h-4 text-zinc-400 transition-transform shrink-0", open && "rotate-180")} />
            </button>

            {open && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-2 border-b border-zinc-100 bg-zinc-50/70">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                            <input
                                ref={inputRef}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama kategori..."
                                className="w-full pl-8 pr-3 py-1.5 text-xs border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                            />
                        </div>
                    </div>
                    <div className="max-h-52 overflow-y-auto p-1.5 grid grid-cols-2 gap-1" data-lenis-prevent>
                        {filtered.length === 0 ? (
                            <p className="col-span-2 text-center py-4 text-xs text-zinc-400">Kategori tidak ditemukan</p>
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
                </div>
            )}
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
                Nominal <span className="text-red-500">*</span>
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
    const queryClient = useQueryClient();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | undefined>();
    const isEdit = !!transaction;

    const { data: wallets = [] } = useQuery({
        queryKey: ["wallets", workspaceId],
        queryFn: () => getWallets(workspaceId),
        enabled: !!workspaceId,
    });

    // Lock body scroll and pause Lenis smooth scroll while dialog is open
    const lenis = useLenis();
    useEffect(() => {
        lenis?.stop();
        const prevOverflow = document.body.style.overflow;
        const prevPaddingRight = document.body.style.paddingRight;
        
        // Prevent layout shift from scrollbar disappearing
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
        type: "INCOME" | "EXPENSE";
        categoryId: string;
        walletId?: string;
    }>({
        resolver: zodResolver(TransactionSchema) as any,
        defaultValues: {
            amount: transaction?.amount ?? (undefined as any),
            note: transaction?.note ?? "",
            date: transaction
                ? new Date(transaction.date).toISOString().split("T")[0]
                : new Date().toISOString().split("T")[0],
            type: (transaction?.type as "INCOME" | "EXPENSE") ?? "EXPENSE",
            categoryId: transaction?.categoryId ?? "",
            walletId: transaction?.walletId ?? (defaultWallet?.id || ""),
        },
    });

    const watchedType = form.watch("type");
    const filteredCategories = categories.filter((c) => c.type === watchedType);

    // Reset categoryId jika ganti tipe
    useEffect(() => {
        const sub = form.watch((value, { name }) => {
            if (name === "type") {
                form.setValue("categoryId", "");
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

            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ["transaction-summary", workspaceId] }),
                queryClient.invalidateQueries({ queryKey: ["report-monthly", workspaceId] }),
                queryClient.invalidateQueries({ queryKey: ["report-category", workspaceId] }),
                queryClient.invalidateQueries({ queryKey: ["report-comparison", workspaceId] }),
                queryClient.invalidateQueries({ queryKey: ["transactions", workspaceId] }),
                queryClient.invalidateQueries({ queryKey: ["wallets", workspaceId] }),
                queryClient.invalidateQueries({ queryKey: ["wallets-summary", workspaceId] }),
            ]);

            broadcastInvalidate(["transaction-summary", workspaceId]);
            broadcastInvalidate(["report-monthly", workspaceId]);
            broadcastInvalidate(["report-category", workspaceId]);
            broadcastInvalidate(["report-comparison", workspaceId]);
            broadcastInvalidate(["transactions", workspaceId]);
            broadcastInvalidate(["wallets", workspaceId]);

            if (result.error) {
                setError(result.error);
            } else {
                onSuccess();
                onClose();
            }
        });
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200" onClick={onClose} />

            {/* Modal Box */}
            <div className="relative bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 w-full max-w-md flex flex-col z-10 animate-in zoom-in-95 duration-200">
                {/* Header — compact */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/50 rounded-t-3xl shrink-0">
                    <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                        {isEdit ? "Edit Transaksi" : "Tambah Transaksi"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Form area — compact 0-scroll layout */}
                <form onSubmit={form.handleSubmit(onSubmit)} className="p-5 space-y-3.5 flex-1">
                    {/* 1. Tipe Transaksi (Pemasukan / Pengeluaran) */}
                    <div>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { value: "EXPENSE", label: "Pengeluaran", icon: TrendingDown, color: "red" },
                                { value: "INCOME", label: "Pemasukan", icon: TrendingUp, color: "green" },
                            ].map((t) => {
                                const Icon = t.icon;
                                const active = watchedType === t.value;
                                return (
                                    <button
                                        key={t.value}
                                        type="button"
                                        onClick={() => form.setValue("type", t.value as any)}
                                        className={cn(
                                            "flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                                            active && t.color === "red"
                                                ? "border-red-500 bg-red-50 text-red-700 ring-2 ring-red-500/20"
                                                : active && t.color === "green"
                                                    ? "border-green-500 bg-green-50 text-green-700 ring-2 ring-green-500/20"
                                                    : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                                        )}
                                    >
                                        <Icon className="w-3.5 h-3.5" />
                                        {t.label}
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

                    {/* 3. Sumber Dana / Dompet & Tanggal (2 Kolom berdampingan) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {/* Sumber Dana / Dompet */}
                        <div>
                            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                                Dompet / Sumber
                            </label>
                            <Controller
                                name="walletId"
                                control={form.control}
                                render={({ field }) => (
                                    <FormWalletSelect
                                        wallets={wallets}
                                        value={field.value || ""}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                        </div>

                        {/* Tanggal */}
                        <div>
                            <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                                Tanggal <span className="text-red-500">*</span>
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

                    {/* 4. Kategori (Searchable dropdown) */}
                    <div>
                        <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                            Kategori <span className="text-red-500">*</span>
                        </label>
                        <Controller
                            name="categoryId"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <FormCategorySelect
                                    categories={filteredCategories}
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={fieldState.error?.message}
                                />
                            )}
                        />
                    </div>

                    {/* 5. Catatan */}
                    <div>
                        <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                            Catatan <span className="text-zinc-400 font-normal lowercase">(opsional)</span>
                        </label>
                        <input
                            type="text"
                            {...form.register("note")}
                            placeholder="Keterangan transaksi..."
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
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-1.5 py-2.5 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-60",
                                watchedType === "INCOME"
                                    ? "bg-green-600 hover:bg-green-700"
                                    : "bg-red-500 hover:bg-red-600"
                            )}
                        >
                            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            {isEdit ? "Simpan Perubahan" : `Simpan ${watchedType === "INCOME" ? "Pemasukan" : "Pengeluaran"}`}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
