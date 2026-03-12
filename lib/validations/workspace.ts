import { z } from "zod";

// Definisi standalone agar file ini aman dipakai di client component
// (tidak mengimport Prisma yang tidak bisa di-bundle ke browser)
export const WorkspaceRole = {
    OWNER: "OWNER",
    EDITOR: "EDITOR",
    VIEWER: "VIEWER",
} as const;
export type WorkspaceRoleType = (typeof WorkspaceRole)[keyof typeof WorkspaceRole];

export const CreateWorkspaceSchema = z.object({
    name: z.string().min(1, "Nama workspace wajib diisi").max(60, "Nama terlalu panjang"),
    description: z.string().max(200, "Deskripsi terlalu panjang").optional().or(z.literal("")),
    currency: z.string().min(1).default("IDR"),
});

export const UpdateWorkspaceSchema = CreateWorkspaceSchema.partial();

export const InviteMemberSchema = z.object({
    email: z.string().email("Email tidak valid"),
    role: z.enum(["OWNER", "EDITOR", "VIEWER"]).default("EDITOR"),
});
