import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, corsHeaders } from "@/lib/mobile-cors";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(),
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await req.json();
    const { amount, note, date, type, categoryId, walletId, toWalletId } = body;

    const existingTx = await prisma.transaction.findUnique({
      where: { id },
      include: { workspace: { include: { members: true } } },
    });

    if (!existingTx) {
      return jsonResponse({ error: "Transaksi tidak ditemukan" }, 404);
    }

    // Verify member permissions
    const member = existingTx.workspace.members.find(
      (m) => m.userId === session.userId
    );
    if (!member || member.role === "VIEWER") {
      return jsonResponse({ error: "Anda tidak memiliki izin mengedit transaksi ini" }, 403);
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        amount: Number(amount),
        note: note !== undefined ? note : existingTx.note,
        date: date ? new Date(date) : existingTx.date,
        type: type || existingTx.type,
        categoryId: type === "TRANSFER" ? null : categoryId !== undefined ? categoryId : existingTx.categoryId,
        walletId: walletId !== undefined ? walletId : existingTx.walletId,
        toWalletId: type === "TRANSFER" ? toWalletId : null,
      },
      include: {
        category: true,
        wallet: true,
        toWallet: true,
      },
    });

    return jsonResponse({ transaction: updated });
  } catch (error) {
    console.error("Mobile Update Transaction Error:", error);
    return jsonResponse({ error: "Internal Server Error" }, 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    const existingTx = await prisma.transaction.findUnique({
      where: { id },
      include: { workspace: { include: { members: true } } },
    });

    if (!existingTx) {
      return jsonResponse({ error: "Transaksi tidak ditemukan" }, 404);
    }

    const member = existingTx.workspace.members.find(
      (m) => m.userId === session.userId
    );
    if (!member || member.role === "VIEWER") {
      return jsonResponse({ error: "Anda tidak memiliki izin menghapus transaksi ini" }, 403);
    }

    await prisma.transaction.delete({
      where: { id },
    });

    return jsonResponse({ success: true, message: "Transaksi berhasil dihapus" });
  } catch (error) {
    console.error("Mobile Delete Transaction Error:", error);
    return jsonResponse({ error: "Internal Server Error" }, 500);
  }
}
