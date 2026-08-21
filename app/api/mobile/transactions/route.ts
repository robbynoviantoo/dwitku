import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, corsHeaders } from "@/lib/mobile-cors";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(),
  });
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
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offsetParam = searchParams.get("offset");
    const skip = offsetParam !== null ? parseInt(offsetParam, 10) : (page - 1) * limit;

    if (!workspaceId) {
      return jsonResponse({ error: "workspaceId is required" }, 400);
    }

    // Verify membership
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: session.userId,
        },
      },
    });

    if (!member) {
      return jsonResponse({ error: "Akses ke workspace ini dilarang" }, 403);
    }

    // Build where clause
    const whereClause: any = {
      workspaceId,
    };

    const categoryId = searchParams.get("categoryId");
    const walletId = searchParams.get("walletId");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    if (type && type !== "ALL") {
      whereClause.type = type;
    }

    if (categoryId && categoryId !== "ALL") {
      whereClause.categoryId = categoryId;
    }

    if (walletId && walletId !== "ALL") {
      whereClause.OR = [
        { walletId: walletId },
        { toWalletId: walletId },
      ];
    }

    if (dateFrom || dateTo) {
      whereClause.date = {
        ...(dateFrom ? { gte: new Date(dateFrom + "T00:00:00") } : {}),
        ...(dateTo ? { lte: new Date(dateTo + "T23:59:59") } : {}),
      };
    }

    if (search) {
      whereClause.OR = [
        { note: { contains: search, mode: "insensitive" } },
        { category: { name: { contains: search, mode: "insensitive" } } },
        { wallet: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [transactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where: whereClause,
        include: {
          category: true,
          wallet: true,
          toWallet: true,
          createdBy: { select: { id: true, name: true, email: true } },
        },
        orderBy: { date: "desc" },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where: whereClause }),
    ]);

    const categories = await prisma.category.findMany({
      where: { workspaceId },
      orderBy: { name: "asc" },
    });

    // Summary calculation (all transactions in workspace)
    const allTxs = await prisma.transaction.findMany({
      where: { workspaceId },
      select: { amount: true, type: true },
    });

    const summary = allTxs.reduce(
      (acc, tx) => {
        const amt = Number(tx.amount);
        if (tx.type === "INCOME") acc.income += amt;
        if (tx.type === "EXPENSE") acc.expense += amt;
        return acc;
      },
      { income: 0, expense: 0 }
    );

    return jsonResponse({
      transactions,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
      categories,
      summary: {
        totalIncome: summary.income,
        totalExpense: summary.expense,
        balance: summary.income - summary.expense,
      },
    });
  } catch (error) {
    console.error("Mobile Get Transactions Error:", error);
    return jsonResponse({ error: "Internal Server Error" }, 500);
  }
}

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { amount, note, date, type, workspaceId, categoryId, walletId, toWalletId } = body;

    if (!amount || !workspaceId || !type) {
      return jsonResponse({ error: "Field wajib tidak lengkap" }, 400);
    }

    if (type !== "TRANSFER" && !categoryId) {
      return jsonResponse({ error: "Kategori wajib dipilih" }, 400);
    }

    if (type === "TRANSFER" && (!walletId || !toWalletId)) {
      return jsonResponse({ error: "Dompet asal dan tujuan wajib dipilih" }, 400);
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount: Number(amount),
        note,
        date: date ? new Date(date) : new Date(),
        type,
        workspaceId,
        categoryId: type === "TRANSFER" ? null : categoryId,
        walletId: walletId || null,
        toWalletId: type === "TRANSFER" ? toWalletId : null,
        createdById: session.userId,
      },
      include: {
        category: true,
        wallet: true,
        toWallet: true,
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    return jsonResponse({ transaction }, 201);
  } catch (error) {
    console.error("Mobile Create Transaction Error:", error);
    return jsonResponse({ error: "Internal Server Error" }, 500);
  }
}
