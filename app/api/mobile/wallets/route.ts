import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, corsHeaders } from "@/lib/mobile-cors";
import { TransactionType } from "@/generated/prisma/client";

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

    if (!workspaceId) {
      return jsonResponse({ error: "workspaceId is required" }, 400);
    }

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

    // Ambil seluruh dompet di workspace beserta transaksinya
    const wallets = await prisma.wallet.findMany({
      where: { workspaceId },
      include: {
        transactions: {
          select: {
            amount: true,
            type: true,
          },
        },
        receivedTransfers: {
          select: {
            amount: true,
            type: true,
          },
        },
      },
      orderBy: [
        { isDefault: "desc" },
        { order: "asc" },
        { createdAt: "asc" },
      ],
    });

    let totalWalletIncome = 0;
    let totalWalletExpense = 0;
    let totalWalletBalance = 0;

    const walletsWithBalance = wallets.map((wallet) => {
      let walletIncome = 0;
      let walletExpense = 0;

      // Transaksi keluar / reguler dari dompet ini
      for (const t of wallet.transactions) {
        const amt = Number(t.amount);
        if (t.type === "INCOME") {
          walletIncome += amt;
        } else if (t.type === "EXPENSE") {
          walletExpense += amt;
        } else if (t.type === "TRANSFER") {
          walletExpense += amt;
        }
      }

      // Transfer masuk ke dompet ini
      for (const t of wallet.receivedTransfers) {
        const amt = Number(t.amount);
        if (t.type === "TRANSFER") {
          walletIncome += amt;
        }
      }

      const initial = Number(wallet.initialBalance);
      const currentBalance = initial + walletIncome - walletExpense;

      // Akumulasi summary dompet persis seperti di web getWalletsTotalSummary
      totalWalletIncome += walletIncome;
      totalWalletExpense += walletExpense;
      totalWalletBalance += currentBalance;

      return {
        id: wallet.id,
        workspaceId: wallet.workspaceId,
        name: wallet.name,
        type: wallet.type,
        providerCode: wallet.providerCode,
        accountNumber: wallet.accountNumber,
        holderName: wallet.holderName,
        color: wallet.color,
        initialBalance: initial,
        isDefault: wallet.isDefault,
        order: wallet.order,
        totalIncome: walletIncome,
        totalExpense: walletExpense,
        currentBalance,
        transactionsCount: wallet.transactions.length + wallet.receivedTransfers.length,
      };
    });

    return jsonResponse({
      wallets: walletsWithBalance,
      summary: {
        totalWalletBalance,
        totalIncome: totalWalletIncome,
        totalExpense: totalWalletExpense,
        walletsCount: wallets.length,
      },
    });
  } catch (error) {
    console.error("Mobile Get Wallets Error:", error);
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
    const { workspaceId, name, type, providerCode, accountNumber, holderName, color, initialBalance, isDefault } = body;

    if (!workspaceId || !name || !type) {
      return jsonResponse({ error: "Nama dan tipe dompet wajib diisi" }, 400);
    }

    // Verify workspace access
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: session.userId,
        },
      },
    });

    if (!member || member.role === "VIEWER") {
      return jsonResponse({ error: "Anda tidak memiliki izin menambah dompet" }, 403);
    }

    // If setting as default, remove default from existing
    if (isDefault) {
      await prisma.wallet.updateMany({
        where: { workspaceId, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Count wallets for ordering
    const count = await prisma.wallet.count({ where: { workspaceId } });

    const newWallet = await prisma.wallet.create({
      data: {
        workspaceId,
        name,
        type,
        providerCode: providerCode || "cash",
        accountNumber: accountNumber || null,
        holderName: holderName || null,
        color: color || "#16a34a",
        initialBalance: Number(initialBalance) || 0,
        isDefault: !!isDefault || count === 0,
        order: count,
        createdById: session.userId,
      },
    });

    return jsonResponse({ wallet: newWallet }, 201);
  } catch (error) {
    console.error("Mobile Create Wallet Error:", error);
    return jsonResponse({ error: "Internal Server Error" }, 500);
  }
}
