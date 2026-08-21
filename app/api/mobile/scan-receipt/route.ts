import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, corsHeaders } from "@/lib/mobile-cors";
import { parseReceiptWithAI } from "@/lib/ai/receipt-parser";

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

    const body = await req.json();
    const { imageBase64, mimeType, workspaceId } = body;

    if (!imageBase64) {
      return jsonResponse({ error: "Gambar struk (imageBase64) wajib dikirimkan." }, 400);
    }

    if (!workspaceId) {
      return jsonResponse({ error: "workspaceId wajib diisi." }, 400);
    }

    // Ambil daftar kategori dan dompet untuk matching cerdas
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

    // Matching category ID dan wallet ID
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

    return jsonResponse({
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
    console.error("OCR Scan API Error:", error);
    return jsonResponse(
      { error: error?.message || "Gagal memproses struk dengan AI" },
      500
    );
  }
}
