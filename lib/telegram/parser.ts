import { TransactionType } from "@/generated/prisma/client";

export interface ParsedTransactionInput {
  type: TransactionType;
  amount: number;
  note?: string;
  isQuickReport: boolean;
}

/**
 * Parsing nominal fleksibel (cth: "10000", "50.000", "50k", "2.5jt", "100rb", "1.5m")
 */
export function parseAmountString(rawAmount: string): number | null {
  if (!rawAmount) return null;
  let clean = rawAmount.trim().toLowerCase().replace(/rp/g, "").trim();

  // Multipliers
  let multiplier = 1;
  if (clean.endsWith("k") || clean.endsWith("rb") || clean.endsWith("ribu")) {
    multiplier = 1000;
    clean = clean.replace(/k|rb|ribu/g, "").trim();
  } else if (clean.endsWith("jt") || clean.endsWith("juta") || clean.endsWith("m") || clean.endsWith("mil")) {
    multiplier = 1000000;
    clean = clean.replace(/jt|juta|m|mil/g, "").trim();
  } else if (clean.endsWith("b") || clean.endsWith("miliar") || clean.endsWith("milyar")) {
    multiplier = 1000000000;
    clean = clean.replace(/b|miliar|milyar/g, "").trim();
  }

  // Handle titik / koma desimal
  if (clean.includes(",") && clean.includes(".")) {
    clean = clean.replace(/\./g, "").replace(",", ".");
  } else if (clean.includes(",") && !clean.includes(".")) {
    clean = clean.replace(",", ".");
  } else if (clean.includes(".")) {
    // Jika ada titik dan multiplier bukan 1, kemungkinan cth "1.5jt" -> 1.5
    if (multiplier > 1) {
      clean = clean.replace(/,/g, ".");
    } else {
      // Nominal biasa cth "50.000" -> 50000
      clean = clean.replace(/\./g, "");
    }
  }

  const parsed = parseFloat(clean);
  if (isNaN(parsed) || parsed <= 0) return null;

  return Math.round(parsed * multiplier);
}

/**
 * Deteksi pesan transaksi dari teks bebas user
 * Cth:
 * - "lapor pengeluaran 10000"
 * - "pengeluaran 50000 beli kopi"
 * - "keluar 25k makan bakso"
 * - "beli makan 15000"
 * - "lapor pemasukan 2.5jt freelance"
 * - "masuk 100000 transfer teman"
 */
export function parseTransactionText(text: string): ParsedTransactionInput | null {
  if (!text || typeof text !== "string") return null;
  const trimmed = text.trim();

  // Abaikan slash command
  if (trimmed.startsWith("/")) return null;

  const lower = trimmed.toLowerCase();

  // 1. Deteksi Tipe (Pemasukan vs Pengeluaran vs Transfer/Tarik)
  const isIncome =
    lower.startsWith("lapor pemasukan") ||
    lower.startsWith("pemasukan") ||
    lower.startsWith("masuk") ||
    lower.startsWith("terima") ||
    lower.startsWith("dapat") ||
    lower.startsWith("gaji");

  const isExpense =
    lower.startsWith("lapor pengeluaran") ||
    lower.startsWith("pengeluaran") ||
    lower.startsWith("keluar") ||
    lower.startsWith("bayar") ||
    lower.startsWith("beli") ||
    lower.startsWith("belanja") ||
    lower.startsWith("biaya") ||
    lower.startsWith("ongkos");

  const isTransfer =
    lower.startsWith("tarik tunai") ||
    lower.startsWith("tarik") ||
    lower.startsWith("transfer") ||
    lower.startsWith("tf") ||
    lower.startsWith("pindah saldo") ||
    lower.startsWith("pindah") ||
    lower.startsWith("topup") ||
    lower.startsWith("top up") ||
    lower.startsWith("kirim uang") ||
    lower.startsWith("mutasi");

  if (!isIncome && !isExpense && !isTransfer) return null;

  let type: TransactionType;
  if (isIncome) type = TransactionType.INCOME;
  else if (isExpense) type = TransactionType.EXPENSE;
  else type = TransactionType.TRANSFER;

  // 2. Ekstrak kata-kata untuk mencari token nominal
  // Regex mencari token angka dengan opsional suffix k, rb, jt, dll.
  const amountRegex = /(?:rp\s*)?(\d+(?:[.,]\d+)?\s*(?:k|rb|ribu|jt|juta|m|mil|b|miliar)?)/i;

  // Bersihkan keyword pembuka
  let remaining = trimmed
    .replace(/^lapor\s+(?:pengeluaran|pemasukan|transfer|pindah\s+saldo)/i, "")
    .replace(/^(?:tarik\s+tunai|tarik|transfer|tf|pindah\s+saldo|pindah|topup|top\s+up|kirim\s+uang|mutasi|pengeluaran|pemasukan|keluar|masuk|bayar|beli|terima|dapat|gaji|belanja|biaya|ongkos)/i, "")
    .trim();

  const match = remaining.match(amountRegex);
  if (!match) return null;

  const rawAmountToken = match[0];
  const amount = parseAmountString(rawAmountToken);
  if (!amount) return null;

  // Catatan adalah sisa kalimat tanpa nominal
  let note = remaining.replace(rawAmountToken, "").trim();
  // Hapus karakter pemisah yang tersisa seperti ":" atau "-"
  note = note.replace(/^[:\-–—\s]+/, "").trim();

  return {
    type,
    amount,
    note: note || undefined,
    isQuickReport: true,
  };
}
