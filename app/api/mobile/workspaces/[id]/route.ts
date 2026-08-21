import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonResponse, corsHeaders } from "@/lib/mobile-cors";

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

// Update workspace details (Name, Description, Currency)
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

    const { id: workspaceId } = await params;
    const body = await req.json();
    const { name, description, currency } = body;

    if (!name || name.trim().length === 0) {
      return jsonResponse({ error: "Nama workspace wajib diisi" }, 400);
    }

    // Verify owner role
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: session.userId,
        },
      },
    });

    if (!member || member.role !== "OWNER") {
      return jsonResponse({ error: "Hanya pemilik workspace yang dapat mengubah pengaturan" }, 403);
    }

    const updatedWorkspace = await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        name: name.trim(),
        description: description !== undefined ? description : undefined,
        currency: currency || "IDR",
      },
    });

    return jsonResponse({ workspace: updatedWorkspace });
  } catch (error) {
    console.error("Mobile Update Workspace Error:", error);
    return jsonResponse({ error: "Internal Server Error" }, 500);
  }
}
