import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, corsHeaders } from "@/lib/mobile-cors";
import { TransactionType } from "@/generated/prisma/client";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";
import { id as localeId } from "date-fns/locale";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.split(" ")[1];
    const session = await prisma.session.findUnique({
      where: { sessionToken: token },
    });

    if (!session || session.expires < new Date()) {
      return jsonResponse({ error: "Session expired" }, 401);
    }

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    if (!workspaceId) {
      return jsonResponse({ error: "workspaceId is required" }, 400);
    }

    // Filter range tanggal jika ada
    const dateFilter =
      dateFrom || dateTo
        ? {
            date: {
              ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
              ...(dateTo ? { lte: new Date(dateTo + "T23:59:59") } : {}),
            },
          }
        : {};

    // 1. Detailed Metric Aggregate
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
    const savingsRate = totalIncome > 0 ? Math.round((netCashflow / totalIncome) * 100) : 0;

    let daySpan = 30;
    if (dateFrom && dateTo) {
      const d1 = new Date(dateFrom).getTime();
      const d2 = new Date(dateTo).getTime();
      daySpan = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)) + 1);
    }

    const summary = {
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

    // 2. Monthly Trend Chart (6 Bulan Terakhir)
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = subMonths(new Date(), 5 - i);
      return {
        start: startOfMonth(d),
        end: endOfMonth(d),
        label: format(d, "MMM", { locale: localeId }),
        fullLabel: format(d, "MMM yyyy", { locale: localeId }),
      };
    });

    const monthlyTrend = await Promise.all(
      months.map(async ({ start, end, label, fullLabel }) => {
        const [incAgg, expAgg] = await Promise.all([
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
          fullLabel,
          income: Number(incAgg._sum.amount ?? 0),
          expense: Number(expAgg._sum.amount ?? 0),
        };
      })
    );

    // 3. Category Breakdown (Top 6 Kategori Pengeluaran)
    const categoryRows = await prisma.transaction.groupBy({
      by: ["categoryId"],
      where: {
        workspaceId,
        type: TransactionType.EXPENSE,
        ...dateFilter,
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
      take: 6,
    });

    const categoryIds = categoryRows.map((r) => r.categoryId).filter(Boolean) as string[];
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true, emoji: true, color: true },
    });
    const catMap = Object.fromEntries(categories.map((c) => [c.id, c]));

    const categoryBreakdown = categoryRows.map((r) => ({
      name: catMap[r.categoryId!]?.name ?? "Lainnya",
      emoji: catMap[r.categoryId!]?.emoji ?? "📦",
      color: catMap[r.categoryId!]?.color ?? "#004C29",
      value: Number(r._sum.amount ?? 0),
    }));

    // 4. Top 5 Largest Expenses of Selected Period
    const topTxRaw = await prisma.transaction.findMany({
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

    const topTransactions = topTxRaw.map((tx) => ({
      id: tx.id,
      note: tx.note || tx.category?.name || "Pengeluaran",
      category: tx.category,
      wallet: tx.wallet,
      date: tx.date,
      amount: Number(tx.amount),
    }));

    // 5. Expense Breakdown by Wallet
    const walletRows = await prisma.transaction.groupBy({
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

    const walletIds = walletRows.map((r) => r.walletId).filter(Boolean) as string[];
    const wallets = await prisma.wallet.findMany({
      where: { id: { in: walletIds } },
      select: { id: true, name: true, providerCode: true, color: true },
    });
    const walletMap = Object.fromEntries(wallets.map((w) => [w.id, w]));

    const walletDistribution = walletRows.map((r) => ({
      name: walletMap[r.walletId!]?.name ?? "Lainnya",
      providerCode: walletMap[r.walletId!]?.providerCode ?? null,
      color: walletMap[r.walletId!]?.color ?? "#004C29",
      value: Number(r._sum.amount ?? 0),
    }));

    return jsonResponse({
      summary,
      monthlyTrend,
      categoryBreakdown,
      topTransactions,
      walletDistribution,
    });
  } catch (error) {
    console.error("Mobile Detailed Report Error:", error);
    return jsonResponse({ error: "Internal Server Error" }, 500);
  }
}
