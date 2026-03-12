"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TransactionSchema } from "@/lib/validations/transaction";
import { createTransaction, updateTransaction } from "@/app/actions/transaction";
import { X, Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import * as z from "zod";

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

export function TransactionFormDialog({
    workspaceId,
    categories,
    transaction,
    onClose,
    onSuccess,
}: Props) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | undefined>();
    const isEdit = !!transaction;

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

            if (result.error) {
                setError(result.error);
            } else {
                onSuccess();
                onClose();
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 sticky top-0 bg-white z-10">
                    <h2 className="text-lg font-semibold text-zinc-900">
                        {isEdit ? "Edit Transaksi" : "Tambah Transaksi"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-5">
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

                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                            Nominal <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-medium">
                                Rp
                            </span>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                {...form.register("amount", { valueAsNumber: true })}
                                placeholder="0"
                                className="w-full pl-10 pr-4 py-2.5 border-2 border-zinc-200 rounded-xl focus:outline-none focus:border-indigo-400 bg-zinc-50 focus:bg-white transition-colors text-zinc-900 text-right font-medium text-lg"
                            />
                        </div>
                        {form.formState.errors.amount && (
                            <p className="text-xs text-red-500 mt-1">{form.formState.errors.amount.message}</p>
                        )}
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                            Tanggal <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            {...form.register("date")}
                            className="w-full px-4 py-2.5 border-2 border-zinc-200 rounded-xl focus:outline-none focus:border-indigo-400 bg-zinc-50 focus:bg-white transition-colors text-zinc-900"
                        />
                        {form.formState.errors.date && (
                            <p className="text-xs text-red-500 mt-1">{form.formState.errors.date.message}</p>
                        )}
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                            Kategori <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
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
                                                    ? "border-indigo-500 bg-indigo-50"
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
                            className="w-full px-4 py-2.5 border-2 border-zinc-200 rounded-xl focus:outline-none focus:border-indigo-400 bg-zinc-50 focus:bg-white transition-colors resize-none text-sm"
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
                            className="flex-1 px-4 py-2.5 border border-zinc-200 text-zinc-700 rounded-xl hover:bg-zinc-50 text-sm font-medium"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60",
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
        </div>
    );
}
