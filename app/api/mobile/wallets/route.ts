import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, corsHeaders } from "@/lib/mobile-cors";
import { getWallets } from "@/app/actions/wallet";

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

    const walletsWithBalance = wallets.map((wallet) => {
      let income = 0;
      let expense = 0;

      wallet.transactions.forEach((t) => {
        const amt = Number(t.amount);
        if (t.type === "INCOME") income += amt;
        else if (t.type === "EXPENSE" || t.type === "TRANSFER") expense += amt;
      });

      wallet.receivedTransfers.forEach((t) => {
        const amt = Number(t.amount);
        if (t.type === "TRANSFER") income += amt;
      });

      const initial = Number(wallet.initialBalance);
      const currentBalance = initial + income - expense;

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
        currentBalance,
      };
    });

    return jsonResponse({ wallets: walletsWithBalance });
  } catch (error) {
    console.error("Mobile Get Wallets Error:", error);
    return jsonResponse({ error: "Internal Server Error" }, 500);
  }
}
