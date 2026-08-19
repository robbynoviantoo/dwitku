import { z } from "zod";

export const WalletTypeEnum = {
  BANK: "BANK",
  EWALLET: "EWALLET",
  CASH: "CASH",
  OTHER: "OTHER",
} as const;

export const WalletSchema = z.object({
  name: z.string().min(1, "Nama dompet / akun wajib diisi").max(60, "Nama terlalu panjang"),
  type: z.enum(["BANK", "EWALLET", "CASH", "OTHER"]).default("BANK"),
  providerCode: z.string().optional().nullable(),
  accountNumber: z.string().max(50, "Nomor rekening terlalu panjang").optional().nullable(),
  holderName: z.string().max(60, "Nama pemilik terlalu panjang").optional().nullable(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Format warna tidak valid").default("#16a34a"),
  initialBalance: z.coerce.number().min(0, "Saldo awal tidak boleh minus").default(0),
  isDefault: z.boolean().default(false),
});

export type WalletFormValues = z.infer<typeof WalletSchema>;
