import { z } from "zod";

export const TransactionType = {
    INCOME: "INCOME",
    EXPENSE: "EXPENSE",
    TRANSFER: "TRANSFER",
} as const;
export type TransactionTypeValue = (typeof TransactionType)[keyof typeof TransactionType];

export const CategorySchema = z.object({
    name: z.string().min(1, "Nama kategori wajib diisi").max(50, "Nama terlalu panjang"),
    emoji: z.string().default("📁"),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Warna tidak valid").default("#6366f1"),
    type: z.enum(["INCOME", "EXPENSE"]).default("EXPENSE"),
});

export const TransactionSchema = z
    .object({
        amount: z.coerce.number().positive("Nominal harus lebih dari 0"),
        note: z.string().max(300, "Catatan terlalu panjang").optional(),
        date: z.string().min(1, "Tanggal wajib diisi"),
        type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
        categoryId: z.string().optional().nullable(),
        walletId: z.string().optional().nullable(),
        toWalletId: z.string().optional().nullable(),
    })
    .refine(
        (data) => {
            if (data.type !== "TRANSFER") {
                return !!data.categoryId && data.categoryId.trim().length > 0;
            }
            return true;
        },
        {
            message: "Kategori wajib dipilih",
            path: ["categoryId"],
        }
    )
    .refine(
        (data) => {
            if (data.type === "TRANSFER") {
                return !!data.walletId && data.walletId.trim().length > 0;
            }
            return true;
        },
        {
            message: "Dompet asal wajib dipilih untuk transfer",
            path: ["walletId"],
        }
    )
    .refine(
        (data) => {
            if (data.type === "TRANSFER") {
                return !!data.toWalletId && data.toWalletId.trim().length > 0;
            }
            return true;
        },
        {
            message: "Dompet tujuan wajib dipilih untuk transfer",
            path: ["toWalletId"],
        }
    )
    .refine(
        (data) => {
            if (data.type === "TRANSFER" && data.walletId && data.toWalletId) {
                return data.walletId !== data.toWalletId;
            }
            return true;
        },
        {
            message: "Dompet asal dan tujuan tidak boleh sama",
            path: ["toWalletId"],
        }
    );
