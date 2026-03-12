"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { InviteMemberSchema } from "@/lib/validations/workspace";
import { WorkspaceRole, InviteStatus } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { addDays } from "date-fns";
import * as z from "zod";
import { resend } from "@/lib/resend";
import { buildInviteEmail } from "@/lib/email-templates";

/** Base URL aplikasi — bisa dari AUTH_URL atau NEXTAUTH_URL atau fallback */
function getBaseUrl() {
    return (
        process.env.AUTH_URL ??
        process.env.NEXTAUTH_URL ??
        process.env.VERCEL_URL?.replace(/^(?!https?:\/\/)/, "https://") ??
        "http://localhost:3000"
    ).replace(/\/$/, ""); // hapus trailing slash
}

/** Kirim undangan ke email (hanya OWNER/EDITOR) */
export async function sendInvite(
    workspaceId: string,
    values: z.infer<typeof InviteMemberSchema>
) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Tidak terautentikasi" };

    const validated = InviteMemberSchema.safeParse(values);
    if (!validated.success) return { error: "Data tidak valid" };

    const { email, role } = validated.data;

    // Cek role pengirim
    const myMembership = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
    });

    if (!myMembership || myMembership.role === WorkspaceRole.VIEWER) {
        return { error: "Hanya OWNER atau EDITOR yang bisa mengundang anggota" };
    }

    // EDITOR hanya bisa undang VIEWER
    if (myMembership.role === WorkspaceRole.EDITOR && role !== WorkspaceRole.VIEWER) {
        return { error: "EDITOR hanya bisa mengundang dengan role VIEWER" };
    }

    // Cek apakah target sudah menjadi anggota
    const targetUser = await prisma.user.findUnique({ where: { email } });
    if (targetUser) {
        const existingMember = await prisma.workspaceMember.findUnique({
            where: {
                workspaceId_userId: { workspaceId, userId: targetUser.id },
            },
        });
        if (existingMember) {
            return { error: "Pengguna ini sudah menjadi anggota workspace" };
        }
    }

    // Hapus invite lama yang masih PENDING untuk email ini
    await prisma.invite.deleteMany({
        where: { workspaceId, email, status: InviteStatus.PENDING },
    });

    // Buat invite baru
    const invite = await prisma.invite.create({
        data: {
            workspaceId,
            email,
            role,
            senderId: session.user.id,
            expiresAt: addDays(new Date(), 7), // berlaku 7 hari
        },
        include: {
            workspace: { select: { name: true } },
            sender: { select: { name: true } },
        },
    });

    const inviteLink = `${getBaseUrl()}/invite/${invite.token}`;

    // Kirim email via Resend
    try {
        const { error: emailError } = await resend.emails.send({
            from: "Dwitku <onboarding@resend.dev>", // ganti dengan domain kamu saat produksi
            to: email,
            subject: `${invite.sender.name ?? "Seseorang"} mengundangmu ke "${invite.workspace.name}"`,
            html: buildInviteEmail({
                workspaceName: invite.workspace.name,
                senderName: invite.sender.name ?? "Pengguna Dwitku",
                inviteLink,
                role,
                expiresAt: invite.expiresAt,
            }),
        });

        if (emailError) {
            console.error("[Invite] Email gagal:", emailError);
            revalidatePath(`/settings/members`);
            return {
                success: true,
                invite,
                warning: "Undangan tersimpan tapi email gagal dikirim. Salin link ini secara manual.",
                inviteLink,
            };
        }
    } catch (err) {
        console.error("[Invite] Resend error:", err);
    }

    if (process.env.NODE_ENV === "development") {
        console.log(`[DEV] Invite link: ${inviteLink}`);
    }

    revalidatePath(`/settings/members`);
    return { success: true, invite, inviteLink };
}

/** Ambil semua invite aktif (PENDING) untuk workspace */
export async function getWorkspaceInvites(workspaceId: string) {
    const session = await auth();
    if (!session?.user?.id) return [];

    const myMembership = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
    });

    if (!myMembership) return [];

    return prisma.invite.findMany({
        where: { workspaceId, status: InviteStatus.PENDING },
        include: {
            sender: { select: { name: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
    });
}

/** Terima undangan via token */
export async function acceptInvite(token: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Silakan login terlebih dahulu" };

    const invite = await prisma.invite.findUnique({
        where: { token },
        include: { workspace: { select: { id: true, name: true } } },
    });

    if (!invite) return { error: "Link undangan tidak valid" };
    if (invite.status !== InviteStatus.PENDING) return { error: "Undangan sudah tidak aktif" };
    if (invite.expiresAt < new Date()) {
        await prisma.invite.update({
            where: { token },
            data: { status: InviteStatus.EXPIRED },
        });
        return { error: "Undangan telah kadaluarsa" };
    }

    // Cek apakah sudah menjadi anggota
    const existing = await prisma.workspaceMember.findUnique({
        where: {
            workspaceId_userId: {
                workspaceId: invite.workspaceId,
                userId: session.user.id,
            },
        },
    });

    if (existing) {
        // Sudah member, update status invite dan redirect
        await prisma.invite.update({
            where: { token },
            data: { status: InviteStatus.ACCEPTED },
        });
        return { success: true, workspaceId: invite.workspaceId };
    }

    // Buat WorkspaceMember + update status invite secara atomik
    await prisma.$transaction([
        prisma.workspaceMember.create({
            data: {
                workspaceId: invite.workspaceId,
                userId: session.user.id,
                role: invite.role,
            },
        }),
        prisma.invite.update({
            where: { token },
            data: { status: InviteStatus.ACCEPTED },
        }),
    ]);

    revalidatePath("/dashboard");
    return { success: true, workspaceId: invite.workspaceId };
}

/** Tolak undangan */
export async function declineInvite(token: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Tidak terautentikasi" };

    const invite = await prisma.invite.findUnique({ where: { token } });
    if (!invite || invite.status !== InviteStatus.PENDING) {
        return { error: "Undangan tidak valid atau sudah tidak aktif" };
    }

    await prisma.invite.update({
        where: { token },
        data: { status: InviteStatus.DECLINED },
    });

    return { success: true };
}

/** Batalkan invite yang sudah dikirim (hanya pengirim atau OWNER) */
export async function cancelInvite(inviteId: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Tidak terautentikasi" };

    const invite = await prisma.invite.findUnique({ where: { id: inviteId } });
    if (!invite) return { error: "Invite tidak ditemukan" };

    const myMembership = await prisma.workspaceMember.findUnique({
        where: {
            workspaceId_userId: {
                workspaceId: invite.workspaceId,
                userId: session.user.id,
            },
        },
    });

    const isOwner = myMembership?.role === WorkspaceRole.OWNER;
    const isSender = invite.senderId === session.user.id;

    if (!isOwner && !isSender) {
        return { error: "Tidak punya akses untuk membatalkan undangan ini" };
    }

    await prisma.invite.delete({ where: { id: inviteId } });

    revalidatePath(`/settings/members`);
    return { success: true };
}

/** Preview invite (untuk halaman /invite/[token]) — public, tidak butuh auth */
export async function getInvitePreview(token: string) {
    const invite = await prisma.invite.findUnique({
        where: { token },
        include: {
            workspace: { select: { name: true, description: true } },
            sender: { select: { name: true, image: true } },
        },
    });

    if (!invite) return null;

    return {
        id: invite.id,
        status: invite.status,
        role: invite.role,
        expiresAt: invite.expiresAt,
        workspace: invite.workspace,
        sender: invite.sender,
        email: invite.email,
    };
}
