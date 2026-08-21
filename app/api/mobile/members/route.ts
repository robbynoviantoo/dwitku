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

    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: {
        user: { select: { id: true, name: true, email: true, image: true, telegramUsername: true } },
      },
      orderBy: { joinedAt: "asc" },
    });

    return jsonResponse({ members });
  } catch (error) {
    console.error("Mobile Get Members Error:", error);
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

    const { workspaceId, email, role } = await req.json();

    if (!workspaceId || !email) {
      return jsonResponse({ error: "Email wajib diisi" }, 400);
    }

    // Verify caller role
    const caller = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: session.userId,
        },
      },
    });

    if (!caller || caller.role === "VIEWER") {
      return jsonResponse({ error: "Anda tidak memiliki izin mengundang anggota" }, 403);
    }

    const targetUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!targetUser) {
      return jsonResponse({ error: "Pengguna dengan email ini belum terdaftar di Dwitku" }, 404);
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

export async function DELETE(req: NextRequest) {
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
    const memberUserId = searchParams.get("userId");

    if (!workspaceId || !memberUserId) {
      return jsonResponse({ error: "workspaceId dan userId wajib diisi" }, 400);
    }

    // Verify owner
    const caller = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: session.userId,
        },
      },
    });

    if (!caller || caller.role !== "OWNER") {
      return jsonResponse({ error: "Hanya pemilik workspace yang dapat menghapus anggota" }, 403);
    }

    if (memberUserId === session.userId) {
      return jsonResponse({ error: "Pemilik workspace tidak dapat menghapus dirinya sendiri" }, 400);
    }

    await prisma.workspaceMember.delete({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: memberUserId,
        },
      },
    });

    return jsonResponse({ success: true });
  } catch (error) {
    console.error("Mobile Delete Member Error:", error);
    return jsonResponse({ error: "Internal Server Error" }, 500);
  }
}
