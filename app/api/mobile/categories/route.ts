import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, corsHeaders } from "@/lib/mobile-cors";
import { CategorySchema } from "@/lib/validations/transaction";
import { WorkspaceRole, TransactionType } from "@/generated/prisma/client";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

// ── GET: List Kategori Workspace ─────────────────────────────────────────────
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
    const type = searchParams.get("type"); // "INCOME" | "EXPENSE"

    if (!workspaceId) {
      return jsonResponse({ error: "workspaceId is required" }, 400);
    }

    // Pastikan user anggota workspace
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: session.userId,
        },
      },
    });

    if (!membership) {
      return jsonResponse({ error: "Forbidden: Not a member of this workspace" }, 403);
    }

    const categories = await prisma.category.findMany({
      where: {
        workspaceId,
        ...(type ? { type: type as TransactionType } : {}),
      },
      include: {
        _count: {
          select: { transactions: true },
        },
      },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    });

    return jsonResponse({
      success: true,
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        emoji: c.emoji,
        color: c.color,
        type: c.type,
        isDefault: c.isDefault,
        transactionCount: c._count.transactions,
      })),
      canEdit: membership.role !== WorkspaceRole.VIEWER,
    });
  } catch (error: any) {
    console.error("GET Mobile Categories Error:", error);
    return jsonResponse({ error: error.message || "Failed to fetch categories" }, 500);
  }
}

// ── POST: Buat Kategori Baru ──────────────────────────────────────────────────
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
    const { workspaceId, name, emoji, color, type } = body;

    if (!workspaceId) {
      return jsonResponse({ error: "workspaceId is required" }, 400);
    }

    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: session.userId,
        },
      },
    });

    if (!membership || membership.role === WorkspaceRole.VIEWER) {
      return jsonResponse({ error: "Tidak memiliki hak akses untuk membuat kategori" }, 403);
    }

    const validated = CategorySchema.safeParse({ name, emoji, color, type });
    if (!validated.success) {
      return jsonResponse({ error: "Data kategori tidak valid" }, 400);
    }

    const category = await prisma.category.create({
      data: {
        ...validated.data,
        workspaceId,
        isDefault: false,
      },
    });

    return jsonResponse({
      success: true,
      category,
    }, 201);
  } catch (error: any) {
    console.error("POST Mobile Category Error:", error);
    return jsonResponse({ error: error.message || "Failed to create category" }, 500);
  }
}
