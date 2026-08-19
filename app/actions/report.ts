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
export async function getCategoryChart(workspaceId: string, dateFrom?: string, dateTo?: string) {
    const session = await auth();
    if (!session?.user?.id) return [];

    let start: Date;
    let end: Date;

    if (dateFrom || dateTo) {
        start = dateFrom ? new Date(dateFrom) : new Date(0);
        end = dateTo ? new Date(dateTo + "T23:59:59") : new Date();
    } else {
        const now = new Date();
        start = startOfMonth(now);
        end = endOfMonth(now);
    }

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
        color: catMap[r.categoryId!]?.color ?? "#004C29",
        value: Number(r._sum.amount ?? 0),
    }));
}

/** Distribusi Saldo / Pengeluaran per Dompet */
export async function getWalletDistribution(workspaceId: string, dateFrom?: string, dateTo?: string) {
    const session = await auth();
    if (!session?.user?.id) return [];

    const dateFilter =
        dateFrom || dateTo
            ? {
                date: {
                    ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
                    ...(dateTo ? { lte: new Date(dateTo + "T23:59:59") } : {}),
                },
            }
            : {};

    const rows = await prisma.transaction.groupBy({
        by: ["walletId"],
        where: {
            workspaceId,
            type: TransactionType.EXPENSE,
            walletId: { not: null },
            ...dateFilter,
        },
        _sum: { amount: true },
        orderBy: { _sum: { amount: "desc" } },
        take: 6,
    });

    const walletIds = rows.map((r) => r.walletId).filter(Boolean) as string[];
    const wallets = await prisma.wallet.findMany({
        where: { id: { in: walletIds } },
        select: { id: true, name: true, providerCode: true, color: true },
    });

    const walletMap = Object.fromEntries(wallets.map((w) => [w.id, w]));

    return rows.map((r) => ({
        name: walletMap[r.walletId!]?.name ?? "Lainnya",
        providerCode: walletMap[r.walletId!]?.providerCode ?? null,
        color: walletMap[r.walletId!]?.color ?? "#004C29",
        value: Number(r._sum.amount ?? 0),
    }));
}

/** Top 5 Pengeluaran Terbesar pada Periode Ini */
export async function getTopTransactions(workspaceId: string, dateFrom?: string, dateTo?: string) {
    const session = await auth();
    if (!session?.user?.id) return [];

    const dateFilter =
        dateFrom || dateTo
            ? {
                date: {
                    ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
                    ...(dateTo ? { lte: new Date(dateTo + "T23:59:59") } : {}),
                },
            }
            : {};

    const items = await prisma.transaction.findMany({
        where: {
            workspaceId,
            type: TransactionType.EXPENSE,
            ...dateFilter,
        },
        include: {
            category: { select: { name: true, emoji: true, color: true } },
            wallet: { select: { name: true, providerCode: true } },
        },
        orderBy: { amount: "desc" },
        take: 5,
    });

    return items.map((tx) => ({
        id: tx.id,
        note: tx.note || tx.category?.name || "Pengeluaran",
        category: tx.category,
        wallet: tx.wallet,
        date: tx.date,
        amount: Number(tx.amount),
    }));
}


/** Detailed Financial Report Metrics */
export async function getDetailedReportSummary(
    workspaceId: string,
    dateFrom?: string,
    dateTo?: string
) {
    const session = await auth();
    if (!session?.user?.id) return null;

    const membership = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
    });
    if (!membership) return null;

    const dateFilter =
        dateFrom || dateTo
            ? {
                date: {
                    ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
                    ...(dateTo ? { lte: new Date(dateTo + "T23:59:59") } : {}),
                },
            }
            : {};

    const [incomeAgg, expenseAgg, incomeCount, expenseCount] = await Promise.all([
        prisma.transaction.aggregate({
            where: { workspaceId, type: TransactionType.INCOME, ...dateFilter },
            _sum: { amount: true },
            _avg: { amount: true },
            _max: { amount: true },
        }),
        prisma.transaction.aggregate({
            where: { workspaceId, type: TransactionType.EXPENSE, ...dateFilter },
            _sum: { amount: true },
            _avg: { amount: true },
            _max: { amount: true },
        }),
        prisma.transaction.count({
            where: { workspaceId, type: TransactionType.INCOME, ...dateFilter },
        }),
        prisma.transaction.count({
            where: { workspaceId, type: TransactionType.EXPENSE, ...dateFilter },
        }),
    ]);

    const totalIncome = Number(incomeAgg._sum.amount ?? 0);
    const totalExpense = Number(expenseAgg._sum.amount ?? 0);
    const netCashflow = totalIncome - totalExpense;

    // Savings Rate percentage
    const savingsRate = totalIncome > 0 ? Math.round((netCashflow / totalIncome) * 100) : 0;

    // Days in range for daily average calculation
    let daySpan = 30;
    if (dateFrom && dateTo) {
        const d1 = new Date(dateFrom).getTime();
        const d2 = new Date(dateTo).getTime();
        daySpan = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)) + 1);
    }

    return {
        totalIncome,
        totalExpense,
        netCashflow,
        savingsRate,
        incomeCount,
        expenseCount,
        totalTransactions: incomeCount + expenseCount,
        avgIncome: Number(incomeAgg._avg.amount ?? 0),
        avgExpense: Number(expenseAgg._avg.amount ?? 0),
        maxIncome: Number(incomeAgg._max.amount ?? 0),
        maxExpense: Number(expenseAgg._max.amount ?? 0),
        dailyAvgExpense: totalExpense / daySpan,
        dailyAvgIncome: totalIncome / daySpan,
        daySpan,
    };
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

export type CalendarDayData = {
    date: string; // YYYY-MM-DD
    day: number;
    income: number;
    expense: number;
    net: number;
    transactions: {
        id: string;
        amount: number;
        type: TransactionType;
        note: string | null;
        category: {
            id: string;
            name: string;
            emoji: string;
            color: string;
        } | null;
    }[];
};

export type CalendarMonthData = {
    year: number;
    month: number;
    totalIncome: number;
    totalExpense: number;
    totalNet: number;
    days: Record<string, CalendarDayData>;
};

/** Ambil transaksi & ringkasan harian per bulan untuk Kalender Keuangan */
export async function getCalendarTransactions(
    workspaceId: string,
    year: number,
    month: number // 1 - 12
): Promise<CalendarMonthData | null> {
    const session = await auth();
    if (!session?.user?.id) return null;

    const membership = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
    });
    if (!membership) return null;

    const targetDate = new Date(year, month - 1, 1);
    const start = startOfMonth(targetDate);
    const end = endOfMonth(targetDate);

    const transactions = await prisma.transaction.findMany({
        where: {
            workspaceId,
            date: {
                gte: start,
                lte: end,
            },
        },
        include: {
            category: { select: { id: true, name: true, emoji: true, color: true } },
        },
        orderBy: { date: "asc" },
    });

    const days: Record<string, CalendarDayData> = {};
    let totalIncome = 0;
    let totalExpense = 0;

    for (const tx of transactions) {
        const dateKey = format(tx.date, "yyyy-MM-dd");
        const dayNum = tx.date.getDate();
        const amountNum = Number(tx.amount);

        if (!days[dateKey]) {
            days[dateKey] = {
                date: dateKey,
                day: dayNum,
                income: 0,
                expense: 0,
                net: 0,
                transactions: [],
            };
        }

        if (tx.type === TransactionType.INCOME) {
            days[dateKey].income += amountNum;
            totalIncome += amountNum;
        } else {
            days[dateKey].expense += amountNum;
            totalExpense += amountNum;
        }
        days[dateKey].net = days[dateKey].income - days[dateKey].expense;

        days[dateKey].transactions.push({
            id: tx.id,
            amount: amountNum,
            type: tx.type,
            note: tx.note,
            category: tx.category,
        });
    }

    return {
        year,
        month,
        totalIncome,
        totalExpense,
        totalNet: totalIncome - totalExpense,
        days,
    };
}

