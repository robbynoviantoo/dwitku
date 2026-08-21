import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, corsHeaders } from "@/lib/mobile-cors";
import { getTelegramConfig } from "@/lib/telegram/bot";
import { randomBytes } from "crypto";

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

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        telegramChatId: true,
        telegramUsername: true,
        telegramLinkedAt: true,
      },
    });

    const config = await getTelegramConfig();

    let members: any[] = [];
    if (workspaceId) {
      const wsMembers = await prisma.workspaceMember.findMany({
        where: { workspaceId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              telegramChatId: true,
              telegramUsername: true,
              telegramLinkedAt: true,
            },
          },
        },
        orderBy: { joinedAt: "asc" },
      });

      members = wsMembers.map((m) => ({
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
        role: m.role,
        isLinked: !!m.user.telegramChatId,
        telegramUsername: m.user.telegramUsername,
        telegramLinkedAt: m.user.telegramLinkedAt,
      }));
    }

    return jsonResponse({
      isLinked: !!user?.telegramChatId,
      telegramUsername: user?.telegramUsername || null,
      telegramLinkedAt: user?.telegramLinkedAt || null,
      botUsername: config.botUsername || null,
      isBotConfigured: !!config.botToken,
      members,
    });
  } catch (error) {
    console.error("Mobile Get Telegram Status Error:", error);
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

    const body = await req.json().catch(() => ({}));
    const action = body.action || "generateToken";

    if (action === "unlink") {
      await prisma.user.update({
        where: { id: session.userId },
        data: {
          telegramChatId: null,
          telegramUsername: null,
          telegramLinkedAt: null,
        },
      });
      return jsonResponse({ success: true, message: "Telegram account unlinked" });
    }

    // Default: generate token & deep link
    const config = await getTelegramConfig();
    if (!config.botToken || !config.botUsername) {
      return jsonResponse({ error: "Bot Telegram belum dikonfigurasi" }, 400);
    }

    // Hapus token lama jika ada
    await prisma.telegramLinkToken.deleteMany({
      where: { userId: session.userId },
    }).catch(() => {});

    const linkToken = randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 menit

    await prisma.telegramLinkToken.create({
      data: {
        token: linkToken,
        userId: session.userId,
        expiresAt,
      },
    });

    const linkUrl = `https://t.me/${config.botUsername}?start=${linkToken}`;

    return jsonResponse({
      linkToken,
      linkUrl,
      expiresAt,
      botUsername: config.botUsername,
    });
  } catch (error) {
    console.error("Mobile Telegram Action Error:", error);
    return jsonResponse({ error: "Internal Server Error" }, 500);
  }
}
