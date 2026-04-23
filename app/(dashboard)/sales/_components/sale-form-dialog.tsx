"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SaleSchema } from "@/lib/validations/sale";
import { createSale, updateSale } from "@/app/actions/sale";
import { getProducts } from "@/app/actions/product";
import { useQuery } from "@tanstack/react-query";
import * as z from "zod";
import { X, Loader2, Calculator, PackageSearch, Tag } from "lucide-react";

interface SaleFormDialogProps {
    open: boolean;
    onClose: () => void;
    workspaceId: string;
    sale?: any;
    categories: any[];
    onSuccess: () => void;
}

export function SaleFormDialog({ open, onClose, workspaceId, sale, categories, onSuccess }: SaleFormDialogProps) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | undefined>();

    const form = useForm<z.infer<typeof SaleSchema>>({
        resolver: zodResolver(SaleSchema) as any,
        defaultValues: {
            date: new Date().toISOString().slice(0, 10),
            name: "",
            qty: 1,
            sellingPrice: 0,
            costPrice: 0,
            categoryId: "",
            note: "",
        },
    });

    const watched = form.watch();
    const labaPerUnit = (watched.sellingPrice ?? 0) - (watched.costPrice ?? 0);
    const totalOmzet = (watched.qty ?? 0) * (watched.sellingPrice ?? 0);
    const totalLaba = (watched.qty ?? 0) * labaPerUnit;

    const { data: productsData } = useQuery({
        queryKey: ["products", workspaceId, { limit: 100 }],
        queryFn: () => getProducts(workspaceId, { limit: 100 }),
        enabled: open && !!workspaceId,
    });
    const products = productsData?.items || [];

    useEffect(() => {
        if (sale) {
            form.reset({
                date: new Date(sale.date).toISOString().slice(0, 10),
                productId: sale.productId ?? "",
                name: sale.name,
                qty: Number(sale.qty),
                sellingPrice: Number(sale.sellingPrice),
                costPrice: Number(sale.costPrice),
                categoryId: sale.categoryId ?? "",
                note: sale.note ?? "",
            });
        } else {
            form.reset({
                date: new Date().toISOString().slice(0, 10),
                productId: "",
                name: "",
                qty: 1,
                sellingPrice: 0,
                costPrice: 0,
                categoryId: "",
                note: "",
            });
        }
    }, [sale, open, form]);

    const handleProductSelect = (productId: string) => {
        form.setValue("productId", productId);
        const prod = products.find(p => p.id === productId);
        if (prod) {
            form.setValue("name", prod.name);
            form.setValue("categoryId", prod.categoryId || "");
            form.setValue("costPrice", Number(prod.costPrice) * Number(form.getValues("qty") || 1));
        } else {
            form.setValue("name", "");
            form.setValue("categoryId", "");
            form.setValue("costPrice", 0);
        }
    };

    const handlePackageClick = (price: number, qty: number) => {
        form.setValue("sellingPrice", price);
        form.setValue("qty", qty);
        
        const prod = products.find(p => p.id === form.getValues("productId"));
        if (prod) {
            form.setValue("costPrice", Number(prod.costPrice) * qty);
        }
    };

    const selectedProduct = products.find(p => p.id === watched.productId);

    const onSubmit = (values: z.infer<typeof SaleSchema>) => {
        setError(undefined);
        startTransition(async () => {
            const result = sale
                ? await updateSale(sale.id, workspaceId, values)
                : await createSale(workspaceId, values);
            if (result.error) {
                setError(result.error);
            } else {
                onSuccess();
                onClose();
            }
        });
    };

    if (!open) return null;

    const productCategories = categories.filter(c => c.type === "INCOME");

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto overscroll-contain">
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-zinc-100">
                    <h2 className="font-semibold text-zinc-900">{sale ? "Edit Penjualan" : "Tambah Penjualan"}</h2>
                    <button onClick={onClose} className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-lg transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="text-xs font-medium text-zinc-500 mb-1 block">Pilih Produk (Opsional tapi disarankan)</label>
                            <select
                                value={watched.productId || ""}
                                onChange={(e) => handleProductSelect(e.target.value)}
                                className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <option value="">— Input Manual / Tanpa Produk —</option>
                                {products.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        {selectedProduct && Array.isArray(selectedProduct.packages) && selectedProduct.packages.length > 0 && (
                            <div className="col-span-2 p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2">
                                <div className="text-xs font-medium text-zinc-600 flex items-center gap-1.5 mb-2">
                                    <PackageSearch className="w-4 h-4" /> Paket Cepat
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {selectedProduct.packages.map((pkg: any, idx: number) => (
                                        <button
                                            type="button"
                                            key={idx}
                                            onClick={() => handlePackageClick(Number(pkg.price), Number(pkg.qty))}
                                            className="px-3 py-1.5 bg-white border border-green-200 hover:border-green-500 hover:bg-green-50 text-green-700 rounded-lg text-xs font-semibold transition-colors flex flex-col items-start shadow-sm"
                                        >
                                            <span>Rp {Number(pkg.price).toLocaleString("id-ID")}</span>
                                            <span className="text-[10px] text-green-600/80 font-normal">{pkg.qty} pcs</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="col-span-2">
                            <label className="text-xs font-medium text-zinc-500 mb-1 block">Nama Barang / Produk *</label>
                            <input
                                {...form.register("name")}
                                placeholder="Nama produk atau item"
                                className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white"
                            />
                            {form.formState.errors.name && <p className="text-xs text-red-500 mt-1">{form.formState.errors.name.message}</p>}
                        </div>

                        <div>
                            <label className="text-xs font-medium text-zinc-500 mb-1 block">Kategori</label>
                            <select
                                {...form.register("categoryId")}
                                className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <option value="">— Pilih —</option>
                                {productCategories.map((c) => (
                                    <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-zinc-500 mb-1 block">Tanggal *</label>
                            <input
                                {...form.register("date")}
                                type="date"
                                className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-medium text-zinc-500 mb-1 flex items-center justify-between">
                                Harga Jual (Total) * 
                                <span className="text-[10px] bg-zinc-100 px-1 py-0.5 rounded text-zinc-400 font-normal cursor-help" title="Omzet dari transaksi ini">Omzet</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-medium text-zinc-400 text-sm">Rp</span>
                                <input
                                    {...form.register("sellingPrice")}
                                    type="number"
                                    min="0"
                                    step="1"
                                    placeholder="0"
                                    className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-zinc-500 mb-1 flex items-center justify-between">
                                Qty (Total) *
                                {selectedProduct && Number(selectedProduct.costPrice) > 0 && watched.qty > 0 && (
                                    <span className="text-[10px] text-zinc-400 font-normal truncate max-w-[80px]">
                                        x {Number(selectedProduct.costPrice).toLocaleString("id-ID")}
                                    </span>
                                )}
                            </label>
                            <input
                                {...form.register("qty")}
                                type="number"
                                min="0.001"
                                step="0.001"
                                placeholder="1"
                                onChange={(e) => {
                                    form.setValue("qty", Number(e.target.value));
                                    const prod = products.find(p => p.id === form.getValues("productId"));
                                    if (prod) {
                                        form.setValue("costPrice", Number(e.target.value) * Number(prod.costPrice));
                                    }
                                }}
                                className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="text-xs font-medium text-zinc-500 mb-1 block">HPP (Total Modal)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-medium text-zinc-400 text-sm">Rp</span>
                                <input
                                    {...form.register("costPrice")}
                                    type="number"
                                    min="0"
                                    step="1"
                                    placeholder="0"
                                    className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                        </div>

                        <div className="col-span-2">
                            <label className="text-xs font-medium text-zinc-500 mb-1 block">Catatan</label>
                            <input
                                {...form.register("note")}
                                placeholder="Opsional..."
                                className="w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                    </div>

                    {/* Live preview */}
                    {(watched.sellingPrice > 0 || watched.costPrice > 0 || watched.qty > 0) && (
                        <div className="rounded-xl bg-linear-to-br from-green-50 to-emerald-50 border border-green-100 px-4 py-3 space-y-1.5">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-green-700 mb-2">
                                <Calculator className="w-3.5 h-3.5" /> Kalkulasi
                            </div>
                            {[
                                { label: "Total Omzet", value: `Rp ${Number(watched.sellingPrice).toLocaleString("id-ID")}`, bold: true },
                                { label: "Total HPP", value: `Rp ${Number(watched.costPrice).toLocaleString("id-ID")}` },
                                { label: "Laba Kotor", value: `Rp ${((watched.sellingPrice || 0) - (watched.costPrice || 0)).toLocaleString("id-ID")}`, color: ((watched.sellingPrice || 0) - (watched.costPrice || 0)) >= 0 ? "text-green-700" : "text-red-600" },
                            ].map(({ label, value, bold, color }) => (
                                <div key={label} className="flex justify-between text-xs">
                                    <span className="text-zinc-500">{label}</span>
                                    <span className={`font-medium ${bold ? "text-zinc-900" : color}`}>{value}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">{error}</div>}

                    <div className="flex gap-3 pt-1">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm border border-zinc-200 rounded-xl text-zinc-600 hover:bg-zinc-50 transition-colors">
                            Batal
                        </button>
                        <button type="submit" disabled={isPending} className="flex-1 py-2.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                            {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : sale ? "Simpan Perubahan" : "Tambah Penjualan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
