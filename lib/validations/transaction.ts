import { z } from "zod";

export const TransactionType = {
    INCOME: "INCOME",
    EXPENSE: "EXPENSE",
} as const;
export type TransactionTypeValue = (typeof TransactionType)[keyof typeof TransactionType];

export const CategorySchema = z.object({
    name: z.string().min(1, "Nama kategori wajib diisi").max(50, "Nama terlalu panjang"),
    emoji: z.string().default("📁"),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Warna tidak valid").default("#6366f1"),
    type: z.enum(["INCOME", "EXPENSE"]).default("EXPENSE"),
});

export const TransactionSchema = z.object({
    amount: z.coerce.number().positive("Nominal harus lebih dari 0"),
    note: z.string().max(300, "Catatan terlalu panjang").optional(),
    date: z.string().min(1, "Tanggal wajib diisi"),
    type: z.enum(["INCOME", "EXPENSE"]),
    categoryId: z.string().min(1, "Kategori wajib dipilih"),
});
