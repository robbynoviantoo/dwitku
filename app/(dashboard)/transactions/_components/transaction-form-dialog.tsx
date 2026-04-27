"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TransactionSchema } from "@/lib/validations/transaction";
import { createTransaction, updateTransaction } from "@/app/actions/transaction";
import { X, Loader2, TrendingUp, TrendingDown, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { broadcastInvalidate } from "@/components/providers/query-provider";
import { useLenis } from "lenis/react";

type Category = { id: string; name: string; emoji: string; color: string; type: string };

type Transaction = {
    id: string;
    amount: number;
    note: string | null;
    date: Date;
    type: string;
    categoryId: string;
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
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Nominal <span className="text-red-500">*</span>
            </label>
            <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-semibold select-none">
                    Rp
                </span>
                <input
                    type="text"
                    inputMode="numeric"
                    value={display}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-2.5 border-2 border-zinc-200 rounded-xl focus:outline-none focus:border-green-400 bg-zinc-50 focus:bg-white transition-colors text-zinc-900 text-right font-semibold text-lg tabular-nums tracking-tight"
                />
            </div>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            {display && (
                <p className="text-xs text-zinc-400 mt-1 text-right">
                    = Rp {display}
                </p>
            )}
        </div>
    );
}

// ── Mini Calendar Picker ──────────────────────────────────────────────────────
const MONTHS = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];
const DAYS_SHORT = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function CalendarPicker({
    value,        // "YYYY-MM-DD"
    onChange,
    error,
}: {
    value: string;
    onChange: (v: string) => void;
    error?: string;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const parsedDate = value ? new Date(value + "T00:00:00") : new Date();
    const [viewYear, setViewYear] = useState(parsedDate.getFullYear());
    const [viewMonth, setViewMonth] = useState(parsedDate.getMonth());

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const selectedDate = value ? new Date(value + "T00:00:00") : null;

    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    const selectDay = (day: number) => {
        const mm = String(viewMonth + 1).padStart(2, "0");
        const dd = String(day).padStart(2, "0");
        onChange(`${viewYear}-${mm}-${dd}`);
        setOpen(false);
    };

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    };

    const today = new Date();
    const isToday = (day: number) =>
        today.getFullYear() === viewYear &&
        today.getMonth() === viewMonth &&
        today.getDate() === day;
    const isSelected = (day: number) =>
        selectedDate &&
        selectedDate.getFullYear() === viewYear &&
        selectedDate.getMonth() === viewMonth &&
        selectedDate.getDate() === day;

    // Formatted display
    const displayText = selectedDate
        ? selectedDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
        : "Pilih tanggal";

    return (
        <div ref={ref} className="relative">
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Tanggal <span className="text-red-500">*</span>
            </label>
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen(v => !v)}
                className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 border-2 rounded-xl text-sm transition-all text-left",
                    open
                        ? "border-green-400 bg-white"
                        : "border-zinc-200 bg-zinc-50 hover:border-zinc-300",
                    !value && "text-zinc-400",
                    value && "text-zinc-900 font-medium",
                )}
            >
                <Calendar className="w-4 h-4 text-zinc-400 shrink-0" />
                <span className="flex-1">{displayText}</span>
            </button>

            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

            {/* Calendar dropdown */}
            {open && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-zinc-200 rounded-2xl shadow-2xl z-[60] overflow-hidden">
                    {/* Nav */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
                        <button
                            type="button"
                            onClick={prevMonth}
                            className="p-1 rounded-lg hover:bg-zinc-100 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4 text-zinc-500" />
                        </button>
                        <span className="text-sm font-semibold text-zinc-800">
                            {MONTHS[viewMonth]} {viewYear}
                        </span>
                        <button
                            type="button"
                            onClick={nextMonth}
                            className="p-1 rounded-lg hover:bg-zinc-100 transition-colors"
                        >
                            <ChevronRight className="w-4 h-4 text-zinc-500" />
                        </button>
                    </div>

                    {/* Days header */}
                    <div className="grid grid-cols-7 px-3 pt-2 pb-1">
                        {DAYS_SHORT.map(d => (
                            <div key={d} className="text-center text-[10px] font-bold text-zinc-400 uppercase py-1">
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Day cells */}
                    <div className="grid grid-cols-7 gap-y-1 px-3 pb-3">
                        {cells.map((day, i) =>
                            day === null ? (
                                <div key={`e-${i}`} />
                            ) : (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => selectDay(day)}
                                    className={cn(
                                        "mx-auto flex items-center justify-center w-8 h-8 rounded-full text-sm transition-all",
                                        isSelected(day)
                                            ? "bg-green-600 text-white font-bold shadow-sm"
                                            : isToday(day)
                                                ? "bg-green-50 text-green-600 font-semibold ring-1 ring-green-200"
                                                : "text-zinc-700 hover:bg-zinc-100",
                                    )}
                                >
                                    {day}
                                </button>
                            )
                        )}
                    </div>

                    {/* Quick: Hari ini */}
                    <div className="px-3 pb-3">
                        <button
                            type="button"
                            onClick={() => {
                                const t = new Date();
                                const mm = String(t.getMonth() + 1).padStart(2, "0");
                                const dd = String(t.getDate()).padStart(2, "0");
                                onChange(`${t.getFullYear()}-${mm}-${dd}`);
                                setOpen(false);
                            }}
                            className="w-full py-1.5 text-xs font-medium text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-green-100"
                        >
                            Hari ini
                        </button>
                    </div>
                </div>
            )}
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

    // Pause Lenis smooth scroll while dialog is open so background doesn't scroll
    const lenis = useLenis();
    useEffect(() => {
        lenis?.stop();
        return () => { lenis?.start(); };
    }, [lenis]);


    const form = useForm<{
        amount: number;
        note?: string;
        date: string;
        type: "INCOME" | "EXPENSE";
        categoryId: string;
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
            ]);

            broadcastInvalidate(["transaction-summary", workspaceId]);
            broadcastInvalidate(["report-monthly", workspaceId]);
            broadcastInvalidate(["report-category", workspaceId]);
            broadcastInvalidate(["report-comparison", workspaceId]);
            broadcastInvalidate(["transactions", workspaceId]);

            if (result.error) {
                setError(result.error);
            } else {
                onSuccess();
                onClose();
            }
        });
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
                {/* Header — fixed, never scrolls */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-white rounded-t-2xl shrink-0">
                    <h2 className="text-lg font-bold text-zinc-900 tracking-tight">
                        {isEdit ? "Edit Transaksi" : "Tambah Transaksi"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Scrollable form area */}
                <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-5 overflow-y-auto overscroll-contain flex-1" data-lenis-prevent>
                    {/* Type Toggle */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-2">Tipe Transaksi</label>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { value: "EXPENSE", label: "Pengeluaran", icon: TrendingDown, color: "red" },
                                { value: "INCOME", label: "Pemasukan", icon: TrendingUp, color: "green" },
                            ].map((t) => {
                                const Icon = t.icon;
                                const active = watchedType === t.value;
                                return (
                                    <label
                                        key={t.value}
                                        className={cn(
                                            "flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border-2 cursor-pointer text-sm font-medium transition-colors",
                                            active && t.color === "red"
                                                ? "border-red-400 bg-red-50 text-red-700"
                                                : active && t.color === "green"
                                                    ? "border-green-400 bg-green-50 text-green-700"
                                                    : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                                        )}
                                    >
                                        <input type="radio" className="sr-only" value={t.value} {...form.register("type")} />
                                        <Icon className="w-4 h-4" />
                                        {t.label}
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {/* Amount — formatted with thousand separator */}
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

                    {/* Date — custom calendar picker */}
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

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                            Kategori <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto overscroll-contain pr-1" data-lenis-prevent>
                            {filteredCategories.length === 0 ? (
                                <p className="col-span-3 text-xs text-zinc-400 py-4 text-center">
                                    Belum ada kategori untuk tipe ini.
                                </p>
                            ) : (
                                filteredCategories.map((cat) => {
                                    const selected = form.watch("categoryId") === cat.id;
                                    return (
                                        <label
                                            key={cat.id}
                                            className={cn(
                                                "flex flex-col items-center gap-1 p-2 rounded-xl border-2 cursor-pointer transition-colors text-center",
                                                selected
                                                    ? "border-green-500 bg-green-50"
                                                    : "border-zinc-200 hover:border-zinc-300"
                                            )}
                                        >
                                            <input
                                                type="radio"
                                                className="sr-only"
                                                value={cat.id}
                                                {...form.register("categoryId")}
                                            />
                                            <span className="text-xl">{cat.emoji}</span>
                                            <span className="text-xs text-zinc-600 leading-tight line-clamp-2">
                                                {cat.name}
                                            </span>
                                        </label>
                                    );
                                })
                            )}
                        </div>
                        {form.formState.errors.categoryId && (
                            <p className="text-xs text-red-500 mt-1">{form.formState.errors.categoryId.message}</p>
                        )}
                    </div>

                    {/* Note */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                            Catatan <span className="text-zinc-400 font-normal">(opsional)</span>
                        </label>
                        <textarea
                            {...form.register("note")}
                            rows={2}
                            placeholder="Keterangan transaksi..."
                            className="w-full px-4 py-2.5 border-2 border-zinc-200 rounded-xl focus:outline-none focus:border-green-400 bg-zinc-50 focus:bg-white transition-colors resize-none text-sm"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border-2 border-zinc-200 text-zinc-700 rounded-xl hover:bg-zinc-50 text-sm font-medium transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60",
                                watchedType === "INCOME"
                                    ? "bg-green-600 hover:bg-green-700"
                                    : "bg-red-500 hover:bg-red-600"
                            )}
                        >
                            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isEdit ? "Simpan" : `Tambah ${watchedType === "INCOME" ? "Pemasukan" : "Pengeluaran"}`}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
