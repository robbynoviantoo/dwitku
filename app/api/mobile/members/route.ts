import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, corsHeaders } from "@/lib/mobile-cors";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
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

    const { workspaceId, email, role } = await req.json();

    if (!workspaceId || !email) {
      return jsonResponse({ error: "Email wajib diisi" }, 400);
    }

    const targetUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!targetUser) {
      return jsonResponse({ error: "Pengguna dengan email ini tidak ditemukan" }, 404);
    }

    // Tambahkan langsung pengguna ke workspace
    const member = await prisma.workspaceMember.upsert({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: targetUser.id,
        },
      },
      update: { role: role || "EDITOR" },
      create: {
        workspaceId,
        userId: targetUser.id,
        role: role || "EDITOR",
      },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
    });

    return jsonResponse({ member }, 201);
  } catch (error) {
    console.error("Mobile Add Member Error:", error);
    return jsonResponse({ error: "Internal Server Error" }, 500);
  }
}
