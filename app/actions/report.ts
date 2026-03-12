"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TransactionType } from "@/generated/prisma/client";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import { id as localeId } from "date-fns/locale";

/** Data income vs expense per bulan (6 bulan terakhir) */
export async function getMonthlyChart(workspaceId: string) {
    const session = await auth();
    if (!session?.user?.id) return [];

    const months = Array.from({ length: 6 }, (_, i) => {
        const d = subMonths(new Date(), 5 - i);
        return {
            start: startOfMonth(d),
            end: endOfMonth(d),
            label: format(d, "MMM yyyy", { locale: localeId }),
        };
    });

    const results = await Promise.all(
        months.map(async ({ start, end, label }) => {
            const [incomeAgg, expenseAgg] = await Promise.all([
                prisma.transaction.aggregate({
                    where: { workspaceId, type: TransactionType.INCOME, date: { gte: start, lte: end } },
                    _sum: { amount: true },
                }),
                prisma.transaction.aggregate({
                    where: { workspaceId, type: TransactionType.EXPENSE, date: { gte: start, lte: end } },
                    _sum: { amount: true },
                }),
            ]);
            return {
                month: label,
                income: Number(incomeAgg._sum.amount ?? 0),
                expense: Number(expenseAgg._sum.amount ?? 0),
            };
        })
    );

    return results;
}

/** Pengeluaran per kategori (bulan ini) */
export async function getCategoryChart(workspaceId: string) {
    const session = await auth();
    if (!session?.user?.id) return [];

    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);

    const rows = await prisma.transaction.groupBy({
        by: ["categoryId"],
        where: {
            workspaceId,
            type: TransactionType.EXPENSE,
            date: { gte: start, lte: end },
        },
        _sum: { amount: true },
        orderBy: { _sum: { amount: "desc" } },
        take: 8, // top 8 kategori
    });

    const categoryIds = rows.map((r) => r.categoryId).filter(Boolean) as string[];
    const categories = await prisma.category.findMany({
        where: { id: { in: categoryIds } },
        select: { id: true, name: true, emoji: true, color: true },
    });

    const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));

    return rows.map((r) => ({
        name: catMap[r.categoryId!]?.name ?? "Lainnya",
        emoji: catMap[r.categoryId!]?.emoji ?? "📦",
        color: catMap[r.categoryId!]?.color ?? "#6366f1",
        value: Number(r._sum.amount ?? 0),
    }));
}

/** Summary saldo bulan berjalan vs bulan lalu */
export async function getMonthComparison(workspaceId: string) {
    const session = await auth();
    if (!session?.user?.id) return null;

    const [curStart, curEnd] = [startOfMonth(new Date()), endOfMonth(new Date())];
    const [prevStart, prevEnd] = [startOfMonth(subMonths(new Date(), 1)), endOfMonth(subMonths(new Date(), 1))];

    const aggregate = async (type: TransactionType, start: Date, end: Date) => {
        const res = await prisma.transaction.aggregate({
            where: { workspaceId, type, date: { gte: start, lte: end } },
            _sum: { amount: true },
        });
        return Number(res._sum.amount ?? 0);
    };

    const [curIncome, curExpense, prevIncome, prevExpense] = await Promise.all([
        aggregate(TransactionType.INCOME, curStart, curEnd),
        aggregate(TransactionType.EXPENSE, curStart, curEnd),
        aggregate(TransactionType.INCOME, prevStart, prevEnd),
        aggregate(TransactionType.EXPENSE, prevStart, prevEnd),
    ]);

    return {
        current: { income: curIncome, expense: curExpense, net: curIncome - curExpense },
        previous: { income: prevIncome, expense: prevExpense, net: prevIncome - prevExpense },
    };
}
