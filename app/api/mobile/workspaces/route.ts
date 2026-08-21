import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, corsHeaders } from "@/lib/mobile-cors";
import { CreateWorkspaceSchema } from "@/lib/validations/workspace";
import { WorkspaceRole, WorkspaceType } from "@/generated/prisma/client";
import { seedDefaultCategories } from "@/app/actions/category";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(),
  });
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
      include: { user: true },
    });

    if (!session || session.expires < new Date()) {
      return jsonResponse({ error: "Session expired or invalid" }, 401);
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

    const formattedWorkspaces = workspaces.map((ws) => {
      const myMembership = ws.members.find((m) => m.userId === session.userId);
      return {
        ...ws,
        role: myMembership?.role || "VIEWER",
      };
    });

    return jsonResponse({ workspaces: formattedWorkspaces });
  } catch (error) {
    console.error("Mobile Get Workspaces Error:", error);
    return jsonResponse({ error: "Internal Server Error" }, 500);
  }
}

// ── POST: Buat Workspace Baru dari Mobile ────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.split(" ")[1];
    const session = await prisma.session.findUnique({
      where: { sessionToken: token },
      include: { user: true },
    });

    if (!session || session.expires < new Date()) {
      return jsonResponse({ error: "Session expired or invalid" }, 401);
    }

    const body = await req.json();
    const validated = CreateWorkspaceSchema.safeParse(body);

    if (!validated.success) {
      return jsonResponse({ error: "Data workspace tidak valid" }, 400);
    }

    const { name, description, currency, type } = validated.data;
    const workspaceType = type === "SALES" ? WorkspaceType.SALES : WorkspaceType.FINANCE;

    // Buat workspace baru dengan user sebagai OWNER
    const workspace = await prisma.workspace.create({
      data: {
        name,
        description: description || null,
        currency: currency || "IDR",
        type: workspaceType,
        isPersonal: false,
        members: {
          create: {
            userId: session.userId,
            role: WorkspaceRole.OWNER,
          },
        },
      },
    });

    // Auto-seed default categories untuk workspace baru
    await seedDefaultCategories(workspace.id);

    return jsonResponse(
      {
        success: true,
        workspace: {
          ...workspace,
          role: "OWNER",
        },
      },
      201
    );
  } catch (error: any) {
    console.error("Mobile Create Workspace Error:", error);
    return jsonResponse({ error: error.message || "Failed to create workspace" }, 500);
  }
}
