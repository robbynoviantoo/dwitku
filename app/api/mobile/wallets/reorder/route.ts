import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, corsHeaders } from "@/lib/mobile-cors";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(),
  });
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
    const { workspaceId, orders } = body; // orders: Array<{ id: string; order: number }>

    if (!workspaceId || !Array.isArray(orders)) {
      return jsonResponse({ error: "Invalid payload" }, 400);
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
      return jsonResponse({ error: "Anda tidak memiliki izin mengubah urutan dompet" }, 403);
    }

    await prisma.$transaction(
      orders.map((item) =>
        prisma.wallet.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );

    return jsonResponse({ success: true, message: "Urutan dompet berhasil disimpan" });
  } catch (error) {
    console.error("Mobile Reorder Wallets Error:", error);
    return jsonResponse({ error: "Internal Server Error" }, 500);
  }
}
