import { useState, useTransition, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductSchema } from "@/lib/validations/product";
import { createProduct, updateProduct } from "@/app/actions/product";
import * as z from "zod";
import { X, Loader2, Plus, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ProductFormDialogProps {
    open: boolean;
    onClose: () => void;
    workspaceId: string;
    product?: any;
    categories: any[];
    onSuccess: () => void;
}

export function ProductFormDialog({ open, onClose, workspaceId, product, categories, onSuccess }: ProductFormDialogProps) {
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof ProductSchema>>({
        resolver: zodResolver(ProductSchema) as any,
        defaultValues: {
            name: "",
            categoryId: "",
            costPrice: 0,
            packages: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "packages",
    });

    useEffect(() => {
        if (open) {
            if (product) {
                form.reset({
                    name: product.name,
                    categoryId: product.categoryId || "",
                    costPrice: Number(product.costPrice),
                    packages: Array.isArray(product.packages) ? product.packages : [],
                });
            } else {
                form.reset({
                    name: "",
                    categoryId: "",
                    costPrice: 0,
                    packages: [],
                });
            }
        }
    }, [open, product, form]);

    if (!open) return null;

    const onSubmit = (values: z.infer<typeof ProductSchema>) => {
        startTransition(async () => {
            const data = { ...values, categoryId: values.categoryId || null };
            const res = product
                ? await updateProduct(product.id, workspaceId, data)
                : await createProduct(workspaceId, data);
            
            if (res.success) {
                onSuccess();
                onClose();
            } else {
                alert(res.error || "Terjadi kesalahan");
            }
        });
    };

    return (
        <div className="fixed inset-0 z-60 flex items-end sm:items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto overscroll-contain">
                <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 flex items-center justify-between px-6 pt-6 pb-4 border-b border-zinc-100">
                    <h2 className="font-semibold text-zinc-900">{product ? "Edit Produk" : "Tambah Produk"}</h2>
                    <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-5">
                    <div>
                        <label className="text-sm font-medium text-zinc-700 block mb-1.5">Nama Produk <span className="text-red-500">*</span></label>
                        <input
                            {...form.register("name")}
                            className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-shadow"
                            placeholder="Contoh: Tahu Walik"
                        />
                        {form.formState.errors.name && (
                            <p className="text-red-500 text-xs mt-1">{form.formState.errors.name.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-zinc-700 block mb-1.5">Kategori</label>
                            <select
                                {...form.register("categoryId")}
                                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-shadow"
                            >
                                <option value="">Tanpa Kategori</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-zinc-700 block mb-1.5">HPP Satuan (Opsional)</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">Rp</span>
                                <input
                                    type="number"
                                    step="any"
                                    min="0"
                                    {...form.register("costPrice")}
                                    className="w-full pl-10 pr-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="500"
                                />
                            </div>
                            <p className="text-xs text-zinc-400 mt-1">Harga modal 1 pcs</p>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-zinc-100">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h3 className="font-medium text-zinc-800 text-sm">Paket Harga (Pre-set)</h3>
                                <p className="text-xs text-zinc-400">Untuk pilihan cepat saat jualan</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => append({ price: 0, qty: 1 })}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 text-xs font-medium rounded-lg transition-colors"
                            >
                                <Plus className="w-3.5 h-3.5" /> Tambah
                            </button>
                        </div>

                        <div className="space-y-3">
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex items-start gap-2 bg-zinc-50 p-3 rounded-xl border border-zinc-100 relative">
                                    <div className="flex-1">
                                        <label className="text-xs font-medium text-zinc-500 flex mb-1">Harga (Rp)</label>
                                        <input
                                            type="number"
                                            {...form.register(`packages.${index}.price`)}
                                            className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                            placeholder="5000"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-xs font-medium text-zinc-500 flex mb-1">Qty (Pcs)</label>
                                        <input
                                            type="number"
                                            {...form.register(`packages.${index}.qty`)}
                                            className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                            placeholder="7"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => remove(index)}
                                        className="mt-6 p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {fields.length === 0 && (
                                <div className="text-center py-4 border border-dashed border-zinc-200 rounded-xl text-zinc-400 text-xs">
                                    Belum ada paket harga. Tambahkan agar lebih cepat saat mencatat jualan.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-zinc-100 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 font-medium rounded-xl transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex-1 px-4 py-2.5 text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                        >
                            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                            Simpan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
