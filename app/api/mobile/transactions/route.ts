import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const session = await prisma.session.findUnique({
      where: { sessionToken: token },
    });

    if (!session || session.expires < new Date()) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
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
      return NextResponse.json({ error: "Akses ke workspace ini dilarang" }, { status: 403 });
    }

    const transactions = await prisma.transaction.findMany({
      where: { workspaceId },
      include: {
        category: true,
        createdBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { date: "desc" },
    });

    const categories = await prisma.category.findMany({
      where: { workspaceId },
      orderBy: { name: "asc" },
    });

    // Summary calculation
    const summary = transactions.reduce(
      (acc, tx) => {
        const amt = Number(tx.amount);
        if (tx.type === "INCOME") acc.income += amt;
        if (tx.type === "EXPENSE") acc.expense += amt;
        return acc;
      },
      { income: 0, expense: 0 }
    );

    return NextResponse.json({
      transactions,
      categories,
      summary: {
        totalIncome: summary.income,
        totalExpense: summary.expense,
        balance: summary.income - summary.expense,
      },
    });
  } catch (error) {
    console.error("Mobile Get Transactions Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const session = await prisma.session.findUnique({
      where: { sessionToken: token },
    });

    if (!session || session.expires < new Date()) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    const body = await req.json();
    const { amount, note, date, type, workspaceId, categoryId } = body;

    if (!amount || !workspaceId || !categoryId || !type) {
      return NextResponse.json({ error: "Field wajib tidak lengkap" }, { status: 400 });
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount: Number(amount),
        note,
        date: date ? new Date(date) : new Date(),
        type,
        workspaceId,
        categoryId,
        createdById: session.userId,
      },
      include: {
        category: true,
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error) {
    console.error("Mobile Create Transaction Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
