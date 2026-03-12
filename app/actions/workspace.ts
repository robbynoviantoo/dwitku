"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CreateWorkspaceSchema, UpdateWorkspaceSchema } from "@/lib/validations/workspace";
import { WorkspaceRole } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import * as z from "zod";

/** Ambil semua workspace yang dimiliki/diikuti user */
export async function getUserWorkspaces() {
    const session = await auth();
    if (!session?.user?.id) return [];

    const memberships = await prisma.workspaceMember.findMany({
        where: { userId: session.user.id },
        include: {
            workspace: {
                include: {
                    _count: { select: { members: true, transactions: true } },
                },
            },
        },
        orderBy: { joinedAt: "asc" },
    });

    return memberships.map((m) => ({
        ...m.workspace,
        role: m.role,
    }));
}

/** Ambil detail satu workspace (hanya jika user adalah member) */
export async function getWorkspace(workspaceId: string) {
    const session = await auth();
    if (!session?.user?.id) return null;

    const membership = await prisma.workspaceMember.findUnique({
        where: {
            workspaceId_userId: {
                workspaceId,
                userId: session.user.id,
            },
        },
        include: {
            workspace: {
                include: {
                    members: {
                        include: { user: { select: { id: true, name: true, email: true, image: true } } },
                        orderBy: { joinedAt: "asc" },
                    },
                    invites: {
                        where: { status: "PENDING" },
                        include: {
                            sender: { select: { name: true, image: true } },
                        },
                        orderBy: { createdAt: "desc" },
                    },
                    _count: { select: { transactions: true, categories: true } },
                },
            },
        },
    });

    if (!membership) return null;

    return {
        ...membership.workspace,
        role: membership.role,
    };
}

/** Buat workspace baru, otomatis jadi OWNER */
export async function createWorkspace(
    values: z.infer<typeof CreateWorkspaceSchema>,
    isPersonal = false,
    skipRevalidate = false
) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Tidak terautentikasi" };

    const validated = CreateWorkspaceSchema.safeParse(values);
    if (!validated.success) return { error: "Data tidak valid" };

    const { name, description, currency } = validated.data;

    const workspace = await prisma.workspace.create({
        data: {
            name,
            description,
            currency: currency ?? "IDR",
            isPersonal,
            members: {
                create: {
                    userId: session.user.id,
                    role: WorkspaceRole.OWNER,
                },
            },
        },
    });

    // Auto-seed kategori default
    const { seedDefaultCategories } = await import("./category");
    await seedDefaultCategories(workspace.id);

    // Jangan panggil revalidatePath saat dipanggil dari server render (layout)
    if (!skipRevalidate) {
        revalidatePath("/dashboard");
    }
    return { success: true, workspace };
}

/** Buat workspace pribadi (Catatan Pribadi) — untuk auto-create saat pertama login */
export async function createPersonalWorkspace() {
    // skipRevalidate=true karena dipanggil dari layout saat render
    return createWorkspace(
        { name: "Catatan Pribadi", description: "Catatan keuangan pribadi", currency: "IDR" },
        true,
        true
    );
}

/** Update workspace (hanya OWNER) */
export async function updateWorkspace(
    workspaceId: string,
    values: z.infer<typeof UpdateWorkspaceSchema>
) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Tidak terautentikasi" };

    const membership = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
    });

    if (!membership || membership.role !== WorkspaceRole.OWNER) {
        return { error: "Hanya OWNER yang bisa mengubah workspace" };
    }

    const validated = UpdateWorkspaceSchema.safeParse(values);
    if (!validated.success) return { error: "Data tidak valid" };

    const workspace = await prisma.workspace.update({
        where: { id: workspaceId },
        data: validated.data,
    });

    revalidatePath(`/dashboard`);
    revalidatePath(`/settings`);
    return { success: true, workspace };
}

/** Hapus workspace (hanya OWNER) */
export async function deleteWorkspace(workspaceId: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Tidak terautentikasi" };

    const membership = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
    });

    if (!membership || membership.role !== WorkspaceRole.OWNER) {
        return { error: "Hanya OWNER yang bisa menghapus workspace" };
    }

    await prisma.workspace.delete({ where: { id: workspaceId } });

    revalidatePath("/dashboard");
    return { success: true };
}

/** Keluar dari workspace (hanya non-OWNER) */
export async function leaveWorkspace(workspaceId: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Tidak terautentikasi" };

    const membership = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
    });

    if (!membership) return { error: "Kamu bukan anggota workspace ini" };
    if (membership.role === WorkspaceRole.OWNER) {
        return { error: "Owner tidak bisa keluar. Hapus workspace atau transfer kepemilikan." };
    }

    await prisma.workspaceMember.delete({
        where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
    });

    revalidatePath("/dashboard");
    return { success: true };
}

/** Ubah role anggota (hanya OWNER) */
export async function updateMemberRole(
    workspaceId: string,
    memberId: string,
    newRole: WorkspaceRole
) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Tidak terautentikasi" };

    const myMembership = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
    });

    if (!myMembership || myMembership.role !== WorkspaceRole.OWNER) {
        return { error: "Hanya OWNER yang bisa mengubah role anggota" };
    }

    if (newRole === WorkspaceRole.OWNER) {
        return { error: "Tidak bisa mengganti role menjadi OWNER" };
    }

    const updated = await prisma.workspaceMember.update({
        where: { id: memberId },
        data: { role: newRole },
    });

    revalidatePath(`/settings/members`);
    return { success: true, member: updated };
}

/** Keluarkan anggota dari workspace (hanya OWNER) */
export async function removeMember(workspaceId: string, memberUserId: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Tidak terautentikasi" };

    if (memberUserId === session.user.id) {
        return { error: "Tidak bisa mengeluarkan diri sendiri" };
    }

    const myMembership = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
    });

    if (!myMembership || myMembership.role !== WorkspaceRole.OWNER) {
        return { error: "Hanya OWNER yang bisa mengeluarkan anggota" };
    }

    await prisma.workspaceMember.delete({
        where: { workspaceId_userId: { workspaceId, userId: memberUserId } },
    });

    revalidatePath(`/settings/members`);
    return { success: true };
}
