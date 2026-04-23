"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SaleExpenseSchema } from "@/lib/validations/sale";
import { createSaleExpense, updateSaleExpense } from "@/app/actions/sale";
import * as z from "zod";
import { X, Loader2 } from "lucide-react";

interface SaleExpenseDialogProps {
    open: boolean;
    onClose: () => void;
    workspaceId: string;
    expense?: any;
    categories: any[];
    onSuccess: () => void;
}

export function SaleExpenseDialog({ open, onClose, workspaceId, expense, categories, onSuccess }: SaleExpenseDialogProps) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | undefined>();

    const form = useForm<z.infer<typeof SaleExpenseSchema>>({
        resolver: zodResolver(SaleExpenseSchema) as any,
        defaultValues: {
            date: new Date().toISOString().slice(0, 10),
            name: "",
            amount: 0,
            categoryId: "",
            note: "",
        },
    });

    useEffect(() => {
        if (expense) {
            form.reset({
                date: new Date(expense.date).toISOString().slice(0, 10),
                name: expense.name,
                amount: Number(expense.amount),
                categoryId: expense.categoryId ?? "",
                note: expense.note ?? "",
            });
        } else {
            form.reset({ date: new Date().toISOString().slice(0, 10), name: "", amount: 0, categoryId: "", note: "" });
        }
    }, [expense, open]);

    const onSubmit = (values: z.infer<typeof SaleExpenseSchema>) => {
        setError(undefined);
        startTransition(async () => {
            const result = expense
                ? await updateSaleExpense(expense.id, workspaceId, values)
                : await createSaleExpense(workspaceId, values);
            if (result.error) {
                setError(result.error);
            } else {
                onSuccess();
                onClose();
            }
        });
    };

    if (!open) return null;

    const expenseCategories = categories.filter(c => c.type === "EXPENSE");

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto overscroll-contain">
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-zinc-100">
                    <h2 className="font-semibold text-zinc-900">{expense ? "Edit Biaya Operasional" : "Tambah Biaya Operasional"}</h2>
                    <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-lg transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-4">
                    <div>
                        <label className="text-xs font-medium text-zinc-500 mb-1 block">Nama Biaya *</label>
                        <input
                            {...form.register("name")}
                            placeholder="Contoh: Gaji harian, Listrik..."
                            className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white"
                        />
                        {form.formState.errors.name && <p className="text-xs text-red-500 mt-1">{form.formState.errors.name.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium text-zinc-500 mb-1 block">Jumlah (Rp) *</label>
                            <input
                                {...form.register("amount")}
                                type="number"
                                min="0"
                                step="1"
                                placeholder="0"
                                className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            {form.formState.errors.amount && <p className="text-xs text-red-500 mt-1">{form.formState.errors.amount.message}</p>}
                        </div>
                        <div>
                            <label className="text-xs font-medium text-zinc-500 mb-1 block">Tanggal *</label>
                            <input
                                {...form.register("date")}
                                type="date"
                                className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-medium text-zinc-500 mb-1 block">Kategori</label>
                        <select
                            {...form.register("categoryId")}
                            className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">— Pilih —</option>
                            {expenseCategories.map((c) => (
                                <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-medium text-zinc-500 mb-1 block">Catatan</label>
                        <input
                            {...form.register("note")}
                            placeholder="Opsional..."
                            className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">{error}</div>}

                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm border border-zinc-200 rounded-xl text-zinc-600 hover:bg-zinc-50 transition-colors">
                            Batal
                        </button>
                        <button type="submit" disabled={isPending} className="flex-1 py-2.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                            {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : expense ? "Simpan" : "Tambah Biaya"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
