import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, corsHeaders } from "@/lib/mobile-cors";
import { CategorySchema } from "@/lib/validations/transaction";
import { WorkspaceRole } from "@/generated/prisma/client";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

// ── PUT: Update Kategori ───────────────────────────────────────────────────────
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

    const { id: categoryId } = await params;
    const body = await req.json();
    const { name, emoji, color, type } = body;

    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      return jsonResponse({ error: "Kategori tidak ditemukan" }, 404);
    }

    if (existingCategory.isDefault) {
      return jsonResponse({ error: "Kategori bawaan sistem tidak bisa diubah" }, 400);
    }

    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: existingCategory.workspaceId,
          userId: session.userId,
        },
      },
    });

    if (!membership || membership.role === WorkspaceRole.VIEWER) {
      return jsonResponse({ error: "Tidak memiliki hak akses untuk mengubah kategori" }, 403);
    }

    const validated = CategorySchema.safeParse({ name, emoji, color, type });
    if (!validated.success) {
      return jsonResponse({ error: "Data kategori tidak valid" }, 400);
    }

    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: validated.data,
    });

    return jsonResponse({
      success: true,
      category: updatedCategory,
    });
  } catch (error: any) {
    console.error("PUT Mobile Category Error:", error);
    return jsonResponse({ error: error.message || "Failed to update category" }, 500);
  }
}

// ── DELETE: Hapus Kategori ─────────────────────────────────────────────────────
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

    const { id: categoryId } = await params;

    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      return jsonResponse({ error: "Kategori tidak ditemukan" }, 404);
    }

    if (existingCategory.isDefault) {
      return jsonResponse({ error: "Kategori bawaan sistem tidak bisa dihapus" }, 400);
    }

    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: existingCategory.workspaceId,
          userId: session.userId,
        },
      },
    });

    if (!membership || membership.role === WorkspaceRole.VIEWER) {
      return jsonResponse({ error: "Tidak memiliki hak akses untuk menghapus kategori" }, 403);
    }

    // Cek apakah kategori masih dipakai oleh transaksi
    const txCount = await prisma.transaction.count({
      where: { categoryId },
    });

    if (txCount > 0) {
      return jsonResponse(
        { error: `Kategori ini masih digunakan oleh ${txCount} transaksi. Pindahkan transaksi terlebih dahulu.` },
        400
      );
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });

    return jsonResponse({
      success: true,
      message: "Kategori berhasil dihapus",
    });
  } catch (error: any) {
    console.error("DELETE Mobile Category Error:", error);
    return jsonResponse({ error: error.message || "Failed to delete category" }, 500);
  }
}
