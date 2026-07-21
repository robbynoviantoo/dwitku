import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const session = await prisma.session.findUnique({
      where: { sessionToken: token },
      include: { user: true },
    });

    if (!session || session.expires < new Date()) {
      return NextResponse.json({ error: "Session expired or invalid" }, { status: 401 });
    }

    const workspaces = await prisma.workspace.findMany({
      where: {
        members: {
          some: { userId: session.userId },
        },
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, image: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ workspaces });
  } catch (error) {
    console.error("Mobile Get Workspaces Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
