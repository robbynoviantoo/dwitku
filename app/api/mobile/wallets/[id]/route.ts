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
    const { name, type, providerCode, accountNumber, holderName, color, initialBalance, isDefault } = body;

    const existingWallet = await prisma.wallet.findUnique({
      where: { id },
      include: { workspace: { include: { members: true } } },
    });

    if (!existingWallet) {
      return jsonResponse({ error: "Dompet tidak ditemukan" }, 404);
    }

    const member = existingWallet.workspace.members.find((m) => m.userId === session.userId);
    if (!member || member.role === "VIEWER") {
      return jsonResponse({ error: "Anda tidak memiliki izin mengedit dompet ini" }, 403);
    }

    if (isDefault) {
      await prisma.wallet.updateMany({
        where: { workspaceId: existingWallet.workspaceId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.wallet.update({
      where: { id },
      data: {
        name: name || existingWallet.name,
        type: type || existingWallet.type,
        providerCode: providerCode !== undefined ? providerCode : existingWallet.providerCode,
        accountNumber: accountNumber !== undefined ? accountNumber : existingWallet.accountNumber,
        holderName: holderName !== undefined ? holderName : existingWallet.holderName,
        color: color || existingWallet.color,
        initialBalance: initialBalance !== undefined ? Number(initialBalance) : existingWallet.initialBalance,
        isDefault: isDefault !== undefined ? isDefault : existingWallet.isDefault,
      },
    });

    return jsonResponse({ wallet: updated });
  } catch (error) {
    console.error("Mobile Update Wallet Error:", error);
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

    const existingWallet = await prisma.wallet.findUnique({
      where: { id },
      include: { workspace: { include: { members: true } } },
    });

    if (!existingWallet) {
      return jsonResponse({ error: "Dompet tidak ditemukan" }, 404);
    }

    const member = existingWallet.workspace.members.find((m) => m.userId === session.userId);
    if (!member || member.role === "VIEWER") {
      return jsonResponse({ error: "Anda tidak memiliki izin menghapus dompet ini" }, 403);
    }

    await prisma.wallet.delete({
      where: { id },
    });

    return jsonResponse({ success: true, message: "Dompet berhasil dihapus" });
  } catch (error) {
    console.error("Mobile Delete Wallet Error:", error);
    return jsonResponse({ error: "Internal Server Error" }, 500);
  }
}
