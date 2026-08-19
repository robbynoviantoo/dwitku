"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { WalletSchema } from "@/lib/validations/wallet";
import { WorkspaceRole, WalletType, TransactionType } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import * as z from "zod";

export interface WalletWithBalance {
  id: string;
  workspaceId: string;
  name: string;
  type: WalletType;
  providerCode: string | null;
  accountNumber: string | null;
  holderName: string | null;
  color: string;
  initialBalance: number;
  isDefault: boolean;
  totalIncome: number;
  totalExpense: number;
  currentBalance: number;
  transactionsCount: number;
  createdBy: {
    id: string;
    name: string | null;
    image: string | null;
  };
  createdAt: Date;
  updatedAt: Date;
}

/** Ambil seluruh dompet di workspace beserta kalkulasi saldo real-time */
export async function getWallets(workspaceId: string): Promise<WalletWithBalance[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  const membership = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  });
  if (!membership) return [];

  const wallets = await prisma.wallet.findMany({
    where: { workspaceId },
    include: {
      createdBy: {
        select: { id: true, name: true, image: true },
      },
      transactions: {
        select: {
          amount: true,
          type: true,
        },
      },
    },
    orderBy: [
      { isDefault: "desc" },
      { createdAt: "asc" },
    ],
  });

  return wallets.map((w) => {
    let totalIncome = 0;
    let totalExpense = 0;

    for (const t of w.transactions) {
      const amt = Number(t.amount);
      if (t.type === TransactionType.INCOME) totalIncome += amt;
      else if (t.type === TransactionType.EXPENSE) totalExpense += amt;
    }

    const initBal = Number(w.initialBalance);
    const currentBalance = initBal + totalIncome - totalExpense;

    return {
      id: w.id,
      workspaceId: w.workspaceId,
      name: w.name,
      type: w.type,
      providerCode: w.providerCode,
      accountNumber: w.accountNumber,
      holderName: w.holderName,
      color: w.color,
      initialBalance: initBal,
      isDefault: w.isDefault,
      totalIncome,
      totalExpense,
      currentBalance,
      transactionsCount: w.transactions.length,
      createdBy: w.createdBy,
      createdAt: w.createdAt,
      updatedAt: w.updatedAt,
    };
  });
}

/** Ringkasan total kekayaan gabungan dari semua dompet */
export async function getWalletsTotalSummary(workspaceId: string) {
  const wallets = await getWallets(workspaceId);
  const totalBalance = wallets.reduce((sum, w) => sum + w.currentBalance, 0);
  const totalInitial = wallets.reduce((sum, w) => sum + w.initialBalance, 0);
  const totalIncome = wallets.reduce((sum, w) => sum + w.totalIncome, 0);
  const totalExpense = wallets.reduce((sum, w) => sum + w.totalExpense, 0);

  return {
    totalWallets: wallets.length,
    totalBalance,
    totalInitial,
    totalIncome,
    totalExpense,
  };
}

/** Buat dompet baru */
export async function createWallet(
  workspaceId: string,
  values: z.infer<typeof WalletSchema>
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Tidak terautentikasi" };

  const membership = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  });
  if (!membership || membership.role === WorkspaceRole.VIEWER) {
    return { error: "Tidak punya izin untuk membuat dompet" };
  }

  const validated = WalletSchema.safeParse(values);
  if (!validated.success) return { error: "Data dompet tidak valid" };

  const { name, type, providerCode, accountNumber, holderName, color, initialBalance, isDefault } = validated.data;

  // Jika dibuat sebagai default, nonaktifkan isDefault di dompet lain
  if (isDefault) {
    await prisma.wallet.updateMany({
      where: { workspaceId },
      data: { isDefault: false },
    });
  }

  const wallet = await prisma.wallet.create({
    data: {
      name,
      type: type as WalletType,
      providerCode: providerCode || null,
      accountNumber: accountNumber || null,
      holderName: holderName || null,
      color: color || "#16a34a",
      initialBalance: initialBalance || 0,
      isDefault: isDefault || false,
      workspaceId,
      createdById: session.user.id,
    },
  });

  revalidatePath("/wallets");
  revalidatePath("/transactions");
  revalidatePath("/dashboard");

  return { success: true, wallet };
}

/** Update dompet */
export async function updateWallet(
  walletId: string,
  workspaceId: string,
  values: z.infer<typeof WalletSchema>
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Tidak terautentikasi" };

  const membership = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  });
  if (!membership || membership.role === WorkspaceRole.VIEWER) {
    return { error: "Tidak punya izin untuk mengedit dompet" };
  }

  const validated = WalletSchema.safeParse(values);
  if (!validated.success) return { error: "Data dompet tidak valid" };

  const { name, type, providerCode, accountNumber, holderName, color, initialBalance, isDefault } = validated.data;

  if (isDefault) {
    await prisma.wallet.updateMany({
      where: { workspaceId, id: { not: walletId } },
      data: { isDefault: false },
    });
  }

  const wallet = await prisma.wallet.update({
    where: { id: walletId },
    data: {
      name,
      type: type as WalletType,
      providerCode: providerCode || null,
      accountNumber: accountNumber || null,
      holderName: holderName || null,
      color: color || "#16a34a",
      initialBalance: initialBalance || 0,
      isDefault: isDefault || false,
    },
  });

  revalidatePath("/wallets");
  revalidatePath("/transactions");
  revalidatePath("/dashboard");

  return { success: true, wallet };
}

/** Hapus dompet */
export async function deleteWallet(walletId: string, workspaceId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Tidak terautentikasi" };

  const membership = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  });
  if (!membership || membership.role === WorkspaceRole.VIEWER) {
    return { error: "Tidak punya izin untuk menghapus dompet" };
  }

  await prisma.wallet.delete({
    where: { id: walletId },
  });

  revalidatePath("/wallets");
  revalidatePath("/transactions");
  revalidatePath("/dashboard");

  return { success: true };
}
