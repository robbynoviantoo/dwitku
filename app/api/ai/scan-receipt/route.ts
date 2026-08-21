import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parseReceiptWithAI } from "@/lib/ai/receipt-parser";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { imageBase64, mimeType, workspaceId } = body;

    if (!imageBase64) {
      return NextResponse.json({ error: "imageBase64 wajib diisi." }, { status: 400 });
    }
    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId wajib diisi." }, { status: 400 });
    }

    // Pastikan user adalah anggota workspace
    const membership = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: session.user.id,
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Ambil data kategori & dompet workspace untuk matching cerdas
    const [categories, wallets] = await Promise.all([
      prisma.category.findMany({
        where: { workspaceId },
        select: { id: true, name: true, emoji: true, color: true },
      }),
      prisma.wallet.findMany({
        where: { workspaceId },
        select: { id: true, name: true, type: true },
      }),
    ]);

    const parsedData = await parseReceiptWithAI(
      imageBase64,
      mimeType || "image/jpeg",
      {
        categories: categories.map((c) => ({ id: c.id, name: c.name })),
        wallets: wallets.map((w) => ({ id: w.id, name: w.name })),
      }
    );

    // Matching IDs
    let matchedCategory = null;
    if (parsedData.categoryName) {
      matchedCategory =
        categories.find(
          (c) => c.name.toLowerCase() === parsedData.categoryName?.toLowerCase()
        ) ||
        categories.find((c) =>
          parsedData.categoryName?.toLowerCase().includes(c.name.toLowerCase())
        );
    }

    let matchedWallet = null;
    if (parsedData.walletName) {
      matchedWallet =
        wallets.find(
          (w) => w.name.toLowerCase() === parsedData.walletName?.toLowerCase()
        ) ||
        wallets.find((w) =>
          parsedData.walletName?.toLowerCase().includes(w.name.toLowerCase())
        );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...parsedData,
        matchedCategoryId: matchedCategory?.id || null,
        matchedCategory,
        matchedWalletId: matchedWallet?.id || null,
        matchedWallet,
      },
    });
  } catch (error: any) {
    console.error("Web OCR Scan API Error:", error);
    return NextResponse.json(
      { error: error?.message || "Gagal memproses gambar struk dengan AI" },
      { status: 500 }
    );
  }
}
