import * as z from "zod";

export const ProductPackageSchema = z.object({
    price: z.coerce.number().min(0, "Harga tidak boleh negatif"),
    qty: z.coerce.number().positive("Qty harus lebih dari 0"),
});

export const ProductSchema = z.object({
    name: z.string().min(1, "Nama produk wajib diisi").max(100),
    categoryId: z.string().optional().nullable(),
    costPrice: z.coerce.number().min(0, "HPP tidak boleh negatif"),
    packages: z.array(ProductPackageSchema).optional().default([]),
});
