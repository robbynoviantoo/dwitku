"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TransactionSchema } from "@/lib/validations/transaction";
import { WorkspaceRole, TransactionType, Prisma } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import * as z from "zod";
import { getUserPlanLimits } from "./subscription";
import { sendPushToWorkspace } from "./web-push";

export type TransactionFilter = {
    type?: "INCOME" | "EXPENSE";
    categoryId?: string;
    walletId?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
};

/** Ambil transaksi dengan filter + pagination */
export async function getTransactions(workspaceId: string, filter: TransactionFilter = {}) {
    const session = await auth();
    if (!session?.user?.id) return { items: [], total: 0, totalPages: 0 };

    const membership = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
    });
    if (!membership) return { items: [], total: 0, totalPages: 0 };

    const { type, categoryId, walletId, search, dateFrom, dateTo, page = 1, limit = 20, sortBy, sortOrder } = filter;

    const where = {
        workspaceId,
        ...(type ? { type: type as TransactionType } : {}),
        ...(categoryId ? { categoryId } : {}),
        ...(walletId ? { walletId } : {}),
        ...(search
            ? { note: { contains: search, mode: "insensitive" as const } }
            : {}),
        ...(dateFrom || dateTo
            ? {
                date: {
                    ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
                    ...(dateTo ? { lte: new Date(dateTo + "T23:59:59") } : {}),
                },
            }
            : {}),
    };

    const [items, total] = await Promise.all([
        prisma.transaction.findMany({
            where,
            include: {
                category: { select: { id: true, name: true, emoji: true, color: true } },
                wallet: { select: { id: true, name: true, providerCode: true, type: true, holderName: true, accountNumber: true, color: true } },
                createdBy: { select: { id: true, name: true, image: true } },
            },
            orderBy: (() => {
                const list = [];
                if (sortBy && sortOrder) {
                    if (sortBy === "category") {
                        list.push({ category: { name: sortOrder as Prisma.SortOrder } });
                    } else if (sortBy === "createdBy") {
                        list.push({ createdBy: { name: sortOrder as Prisma.SortOrder } });
                    } else {
                        list.push({ [sortBy]: sortOrder as Prisma.SortOrder } as Prisma.TransactionOrderByWithRelationInput);
                    }
                } else {
                    list.push({ date: "desc" as Prisma.SortOrder });
                }
                list.push({ createdAt: "desc" as Prisma.SortOrder });
                return list;
            })(),
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.transaction.count({ where }),
    ]);

    const safeItems = items.map((t) => ({
        ...t,
        amount: Number(t.amount),
    }));

    return {
        items: safeItems,
        total,
        totalPages: Math.ceil(total / limit),
    };
}

/** Ringkasan saldo: total income, expense, net */
export async function getTransactionSummary(
    workspaceId: string,
    dateFrom?: string,
    dateTo?: string
) {
    const session = await auth();
    if (!session?.user?.id) return { income: 0, expense: 0, net: 0 };

    const membership = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
    });
    if (!membership) return { income: 0, expense: 0, net: 0 };

    const dateFilter =
        dateFrom || dateTo
            ? {
                date: {
                    ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
                    ...(dateTo ? { lte: new Date(dateTo + "T23:59:59") } : {}),
                },
            }
            : {};

    const [incomeAgg, expenseAgg] = await Promise.all([
        prisma.transaction.aggregate({
            where: { workspaceId, type: TransactionType.INCOME, ...dateFilter },
            _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
            where: { workspaceId, type: TransactionType.EXPENSE, ...dateFilter },
            _sum: { amount: true },
        }),
    ]);

    const income = Number(incomeAgg._sum.amount ?? 0);
    const expense = Number(expenseAgg._sum.amount ?? 0);

    return { income, expense, net: income - expense };
}

/** Ringkasan berdasarkan filter lengkap: income, expense, net */
export async function getFilteredSummary(
    workspaceId: string,
    filter: Omit<TransactionFilter, "page" | "limit"> = {}
) {
    const session = await auth();
    if (!session?.user?.id) return { income: 0, expense: 0, net: 0 };

    const membership = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
    });
    if (!membership) return { income: 0, expense: 0, net: 0 };

    const { type, categoryId, walletId, search, dateFrom, dateTo } = filter;

    const baseWhere = {
        workspaceId,
        ...(categoryId ? { categoryId } : {}),
        ...(walletId ? { walletId } : {}),
        ...(search ? { note: { contains: search, mode: "insensitive" as const } } : {}),
        ...(dateFrom || dateTo
            ? {
                date: {
                    ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
                    ...(dateTo ? { lte: new Date(dateTo + "T23:59:59") } : {}),
                },
            }
            : {}),
    };

    const [incomeAgg, expenseAgg] = await Promise.all([
        type === "EXPENSE"
            ? Promise.resolve({ _sum: { amount: 0 } })
            : prisma.transaction.aggregate({
                where: { ...baseWhere, type: TransactionType.INCOME },
                _sum: { amount: true },
            }),
        type === "INCOME"
            ? Promise.resolve({ _sum: { amount: 0 } })
            : prisma.transaction.aggregate({
                where: { ...baseWhere, type: TransactionType.EXPENSE },
                _sum: { amount: true },
            }),
    ]);

    const income = Number(incomeAgg._sum.amount ?? 0);
    const expense = Number(expenseAgg._sum.amount ?? 0);

    return { income, expense, net: income - expense };
}

/** Buat transaksi baru */
export async function createTransaction(
    workspaceId: string,
    values: z.infer<typeof TransactionSchema>
) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Tidak terautentikasi" };

    const membership = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
    });
    if (!membership || membership.role === WorkspaceRole.VIEWER) {
        return { error: "Tidak punya akses untuk menambah transaksi" };
    }

    const validated = TransactionSchema.safeParse(values);
    if (!validated.success) return { error: "Data tidak valid" };

    const limits = await getUserPlanLimits();
    if (limits && limits.maxTx !== -1) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const count = await prisma.transaction.count({
            where: {
                workspaceId,
                date: { gte: startOfMonth }
            }
        });
        if (count >= limits.maxTx) {
            return { error: `Batas transaksi tercapai (Maksimal ${limits.maxTx} transaksi/bulan untuk paket saat ini). Silakan upgrade paket langganan.` };
        }
    }

    const { amount, note, date, type, categoryId, walletId } = validated.data;

    const transaction = await prisma.transaction.create({
        data: {
            amount,
            note,
            date: new Date(date),
            type: type as TransactionType,
            workspaceId,
            categoryId,
            walletId: walletId || null,
            createdById: session.user.id,
        },
    });

    const amountStr = Number(amount).toLocaleString('id-ID');
    sendPushToWorkspace(
        workspaceId,
        session.user.id,
        {
            title: "Transaksi Baru",
            body: `${session.user.name || "Seseorang"} menambahkan transaksi ${type === "INCOME" ? "Pemasukan" : "Pengeluaran"} sebesar Rp${amountStr}`,
            url: `/transactions`
        }
    );

    revalidatePath("/transactions");
    revalidatePath("/workspaces");
    revalidatePath("/reports");
    revalidatePath("/wallets");
    revalidatePath("/dashboard");
    return {
        success: true,
        transaction: {
            ...transaction,
            amount: Number(transaction.amount),
        },
    };
}

/** Update transaksi */
export async function updateTransaction(
    transactionId: string,
    workspaceId: string,
    values: z.infer<typeof TransactionSchema>
) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Tidak terautentikasi" };

    const membership = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
    });
    if (!membership || membership.role === WorkspaceRole.VIEWER) {
        return { error: "Tidak punya akses untuk mengubah transaksi" };
    }

    const validated = TransactionSchema.safeParse(values);
    if (!validated.success) return { error: "Data tidak valid" };

    const { amount, note, date, type, categoryId, walletId } = validated.data;

    const transaction = await prisma.transaction.update({
        where: { id: transactionId },
        data: {
            amount,
            note,
            date: new Date(date),
            type: type as TransactionType,
            categoryId,
            walletId: walletId || null,
        },
    });

    revalidatePath("/transactions");
    revalidatePath("/workspaces");
    revalidatePath("/reports");
    revalidatePath("/wallets");
    revalidatePath("/dashboard");
    return {
        success: true,
        transaction: {
            ...transaction,
            amount: Number(transaction.amount),
        },
    };
}

/** Hapus transaksi */
export async function deleteTransaction(transactionId: string, workspaceId: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Tidak terautentikasi" };

    const membership = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
    });
    if (!membership || membership.role === WorkspaceRole.VIEWER) {
        return { error: "Tidak punya akses untuk menghapus transaksi" };
    }

    await prisma.transaction.delete({ where: { id: transactionId } });

    revalidatePath("/transactions");
    revalidatePath("/workspaces");
    revalidatePath("/reports");
    revalidatePath("/wallets");
    revalidatePath("/dashboard");
    return { success: true };
}
