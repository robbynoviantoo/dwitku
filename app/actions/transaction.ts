"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TransactionSchema } from "@/lib/validations/transaction";
import { WorkspaceRole, TransactionType } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import * as z from "zod";

export type TransactionFilter = {
    type?: "INCOME" | "EXPENSE";
    categoryId?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
};

/** Ambil transaksi dengan filter + pagination */
export async function getTransactions(workspaceId: string, filter: TransactionFilter = {}) {
    const session = await auth();
    if (!session?.user?.id) return { items: [], total: 0, totalPages: 0 };

    const membership = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
    });
    if (!membership) return { items: [], total: 0, totalPages: 0 };

    const { type, categoryId, search, dateFrom, dateTo, page = 1, limit = 20 } = filter;

    const where = {
        workspaceId,
        ...(type ? { type: type as TransactionType } : {}),
        ...(categoryId ? { categoryId } : {}),
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
                createdBy: { select: { id: true, name: true, image: true } },
            },
            orderBy: { date: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.transaction.count({ where }),
    ]);

    return {
        items,
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

    const { amount, note, date, type, categoryId } = validated.data;

    const transaction = await prisma.transaction.create({
        data: {
            amount,
            note,
            date: new Date(date),
            type: type as TransactionType,
            workspaceId,
            categoryId,
            createdById: session.user.id,
        },
    });

    revalidatePath("/transactions");
    revalidatePath("/dashboard");
    return { success: true, transaction };
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

    const { amount, note, date, type, categoryId } = validated.data;

    const transaction = await prisma.transaction.update({
        where: { id: transactionId },
        data: {
            amount,
            note,
            date: new Date(date),
            type: type as TransactionType,
            categoryId,
        },
    });

    revalidatePath("/transactions");
    return { success: true, transaction };
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
    revalidatePath("/dashboard");
    return { success: true };
}
