import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, corsHeaders } from "@/lib/mobile-cors";
import { TransactionType } from "@/generated/prisma/client";
import { startOfMonth, endOfMonth, format } from "date-fns";

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
    const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()), 10);
    const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1), 10); // 1-12

    if (!workspaceId) {
      return jsonResponse({ error: "workspaceId is required" }, 400);
    }

    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: session.userId,
        },
      },
    });

    if (!membership) {
      return jsonResponse({ error: "Forbidden: Not a member of this workspace" }, 403);
    }

    const targetDate = new Date(year, month - 1, 1);
    const start = startOfMonth(targetDate);
    const end = endOfMonth(targetDate);

    // Ambil SEMUA transaksi pada bulan tersebut (tanpa filter walletId / limit)
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
        wallet: { select: { id: true, name: true, providerCode: true } },
        toWallet: { select: { id: true, name: true, providerCode: true } },
      },
      orderBy: { date: "asc" },
    });

    const days: Record<string, {
      date: string;
      day: number;
      income: number;
      expense: number;
      net: number;
      items: any[];
    }> = {};

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
          items: [],
        };
      }

      if (tx.type === TransactionType.INCOME) {
        days[dateKey].income += amountNum;
        totalIncome += amountNum;
      } else if (tx.type === TransactionType.EXPENSE) {
        days[dateKey].expense += amountNum;
        totalExpense += amountNum;
      }
      days[dateKey].net = days[dateKey].income - days[dateKey].expense;
      days[dateKey].items.push(tx);
    }

    return jsonResponse({
      success: true,
      year,
      month,
      totalIncome,
      totalExpense,
      days,
    });
  } catch (error: any) {
    console.error("GET Mobile Calendar API Error:", error);
    return jsonResponse({ error: error.message || "Failed to fetch calendar transactions" }, 500);
  }
}
