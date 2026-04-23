import * as z from "zod";

export const SaleSchema = z.object({
    date: z.string().min(1, "Tanggal wajib diisi"),
    productId: z.string().optional().nullable(),
    name: z.string().min(1, "Nama produk wajib diisi").max(100),
    qty: z.coerce.number().positive("Qty harus lebih dari 0"),
    sellingPrice: z.coerce.number().min(0, "Harga jual tidak boleh negatif"),
    costPrice: z.coerce.number().min(0, "HPP tidak boleh negatif"),
    categoryId: z.string().optional().nullable(),
    note: z.string().optional().nullable(),
});

export const SaleExpenseSchema = z.object({
    date: z.string().min(1, "Tanggal wajib diisi"),
    name: z.string().min(1, "Nama biaya wajib diisi").max(100),
    amount: z.coerce.number().positive("Jumlah harus lebih dari 0"),
    categoryId: z.string().optional().nullable(),
    note: z.string().optional().nullable(),
});
