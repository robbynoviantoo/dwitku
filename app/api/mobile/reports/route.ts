import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, corsHeaders } from "@/lib/mobile-cors";

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

    if (!workspaceId) {
      return jsonResponse({ error: "workspaceId is required" }, 400);
    }

    const transactions = await prisma.transaction.findMany({
      where: { workspaceId },
      include: { category: true },
      orderBy: { date: "desc" },
    });

    // Ringkasan Laporan per Kategori
    const categoryTotals: Record<string, { name: string; emoji: string; color: string; amount: number; type: string }> = {};

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((tx) => {
      const amt = Number(tx.amount);
      if (tx.type === "INCOME") totalIncome += amt;
      if (tx.type === "EXPENSE") totalExpense += amt;

      const catId = tx.categoryId;
      if (!categoryTotals[catId]) {
        categoryTotals[catId] = {
          name: tx.category.name,
          emoji: tx.category.emoji,
          color: tx.category.color,
          amount: 0,
          type: tx.type,
        };
      }
      categoryTotals[catId].amount += amt;
    });

    return jsonResponse({
      summary: {
        totalIncome,
        totalExpense,
        netBalance: totalIncome - totalExpense,
      },
      categoryReport: Object.values(categoryTotals),
    });
  } catch (error) {
    console.error("Mobile Report Error:", error);
    return jsonResponse({ error: "Internal Server Error" }, 500);
  }
}
