"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CategorySchema, TransactionType } from "@/lib/validations/transaction";
import { createCategory, updateCategory } from "@/app/actions/category";
import { EmojiPickerButton } from "@/components/ui/emoji-picker";
import { X, Loader2, Palette } from "lucide-react";
import { broadcastInvalidate } from "@/components/providers/query-provider";
import { useQueryClient } from "@tanstack/react-query";

const PRESET_COLORS = [
    "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
    "#f97316", "#f59e0b", "#22c55e", "#14b8a6",
    "#3b82f6", "#06b6d4", "#84cc16", "#64748b",
];

type Category = {
    id: string;
    name: string;
    emoji: string;
    color: string;
    type: string;
    isDefault: boolean;
};

type Props = {
    workspaceId: string;
    category?: Category;
    onClose: () => void;
    onSuccess: () => void;
};

export function CategoryFormDialog({ workspaceId, category, onClose, onSuccess }: Props) {
    const queryClient = useQueryClient();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | undefined>();
    const isEdit = !!category;

    const form = useForm<{
        name: string;
        emoji: string;
        color: string;
        type: "INCOME" | "EXPENSE";
    }>({
        resolver: zodResolver(CategorySchema) as any,
        defaultValues: {
            name: category?.name ?? "",
            emoji: category?.emoji ?? "📁",
            color: category?.color ?? "#6366f1",
            type: (category?.type as "INCOME" | "EXPENSE") ?? "EXPENSE",
        },
    });

    const watchedEmoji = form.watch("emoji");
    const watchedColor = form.watch("color");

    const onSubmit = (values: z.infer<typeof CategorySchema>) => {
        setError(undefined);
        startTransition(async () => {
            const result = isEdit
                ? await updateCategory(category!.id, workspaceId, values)
                : await createCategory(workspaceId, values);

            if (result.error) {
                setError(result.error);
            } else {
                await queryClient.invalidateQueries({ queryKey: ["categories", workspaceId] });
                // Broadcast ke tab lain
                broadcastInvalidate(["categories", workspaceId]);
                onSuccess();
                onClose();
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
                    <h2 className="text-lg font-semibold text-zinc-900">
                        {isEdit ? "Edit Kategori" : "Buat Kategori Baru"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-5">
                    {/* Preview */}
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-50 border border-zinc-100">
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm"
                            style={{ backgroundColor: watchedColor + "20", border: `2px solid ${watchedColor}40` }}
                        >
                            {watchedEmoji}
                        </div>
                        <div>
                            <p className="font-semibold text-zinc-900">{form.watch("name") || "Nama Kategori"}</p>
                            <p className="text-xs text-zinc-400">
                                {form.watch("type") === "INCOME" ? "Pemasukan" : "Pengeluaran"}
                            </p>
                        </div>
                    </div>

                    {/* Type */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-2">Tipe</label>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { value: "EXPENSE", label: "🔴 Pengeluaran" },
                                { value: "INCOME", label: "🟢 Pemasukan" },
                            ].map((t) => (
                                <label
                                    key={t.value}
                                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer text-sm font-medium transition-colors ${form.watch("type") === t.value
                                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                                        : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        className="sr-only"
                                        value={t.value}
                                        {...form.register("type")}
                                    />
                                    {t.label}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Emoji + Name */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-2">
                            Emoji & Nama
                        </label>
                        <div className="flex gap-3">
                            <EmojiPickerButton
                                value={watchedEmoji}
                                onChange={(e) => form.setValue("emoji", e)}
                            />
                            <div className="flex-1">
                                <input
                                    {...form.register("name")}
                                    placeholder="Nama kategori..."
                                    className="w-full h-12 px-4 border-2 border-zinc-200 rounded-xl focus:outline-none focus:border-indigo-400 bg-zinc-50 focus:bg-white transition-colors text-zinc-900"
                                />
                                {form.formState.errors.name && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {form.formState.errors.name.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Color */}
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-2 flex items-center gap-1.5">
                            <Palette className="w-3.5 h-3.5" />
                            Warna
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {PRESET_COLORS.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => form.setValue("color", c)}
                                    className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
                                    style={{
                                        backgroundColor: c,
                                        borderColor: watchedColor === c ? "#1e1b4b" : "transparent",
                                        transform: watchedColor === c ? "scale(1.2)" : undefined,
                                    }}
                                />
                            ))}
                        </div>
                        <div className="flex items-center gap-2">
                            <div
                                className="w-8 h-8 rounded-full border border-zinc-200 shrink-0"
                                style={{ backgroundColor: watchedColor }}
                            />
                            <input
                                type="color"
                                value={watchedColor}
                                onChange={(e) => form.setValue("color", e.target.value)}
                                className="w-full h-8 rounded-lg cursor-pointer border border-zinc-200"
                                title="Pilih warna custom"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-zinc-200 text-zinc-700 rounded-xl hover:bg-zinc-50 text-sm font-medium transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
                        >
                            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isEdit ? "Simpan" : "Buat Kategori"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
