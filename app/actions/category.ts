"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CategorySchema } from "@/lib/validations/transaction";
import { WorkspaceRole, TransactionType } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import * as z from "zod";

/** Seed kategori default untuk workspace baru */
export async function seedDefaultCategories(workspaceId: string) {
    const defaultCategories = [
        // Pengeluaran
        { name: "Makanan & Minuman", emoji: "🍔", color: "#f97316", type: TransactionType.EXPENSE },
        { name: "Transportasi", emoji: "🚗", color: "#3b82f6", type: TransactionType.EXPENSE },
        { name: "Rumah & Utilitas", emoji: "🏠", color: "#8b5cf6", type: TransactionType.EXPENSE },
        { name: "Belanja & Pakaian", emoji: "👗", color: "#ec4899", type: TransactionType.EXPENSE },
        { name: "Kesehatan", emoji: "💊", color: "#22c55e", type: TransactionType.EXPENSE },
        { name: "Hiburan", emoji: "🎮", color: "#f59e0b", type: TransactionType.EXPENSE },
        { name: "Pendidikan", emoji: "📚", color: "#06b6d4", type: TransactionType.EXPENSE },
        { name: "Bisnis", emoji: "💼", color: "#64748b", type: TransactionType.EXPENSE },
        { name: "Hadiah", emoji: "🎁", color: "#e879f9", type: TransactionType.EXPENSE },
        { name: "Teknologi", emoji: "📱", color: "#0ea5e9", type: TransactionType.EXPENSE },
        { name: "Perjalanan", emoji: "✈️", color: "#14b8a6", type: TransactionType.EXPENSE },
        { name: "Olahraga & Fitness", emoji: "🏋️", color: "#84cc16", type: TransactionType.EXPENSE },
        // Pemasukan
        { name: "Gaji", emoji: "💰", color: "#22c55e", type: TransactionType.INCOME },
        { name: "Investasi", emoji: "💹", color: "#10b981", type: TransactionType.INCOME },
        { name: "Transfer Masuk", emoji: "🏧", color: "#06b6d4", type: TransactionType.INCOME },
        { name: "Bonus", emoji: "🎯", color: "#f59e0b", type: TransactionType.INCOME },
        { name: "Freelance", emoji: "🤝", color: "#6366f1", type: TransactionType.INCOME },
    ];

    await prisma.category.createMany({
        data: defaultCategories.map((c) => ({
            ...c,
            workspaceId,
            isDefault: true,
        })),
    });
}

/** Ambil semua kategori workspace */
export async function getCategories(workspaceId: string, type?: "INCOME" | "EXPENSE") {
    const session = await auth();
    if (!session?.user?.id) return [];

    const membership = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
    });
    if (!membership) return [];

    return prisma.category.findMany({
        where: {
            workspaceId,
            ...(type ? { type: type as TransactionType } : {}),
        },
        include: { _count: { select: { transactions: true } } },
        orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    });
}

/** Buat kategori baru */
export async function createCategory(
    workspaceId: string,
    values: z.infer<typeof CategorySchema>
) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Tidak terautentikasi" };

    const membership = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
    });
    if (!membership || membership.role === WorkspaceRole.VIEWER) {
        return { error: "Tidak punya akses untuk membuat kategori" };
    }

    const validated = CategorySchema.safeParse(values);
    if (!validated.success) return { error: "Data tidak valid" };

    const category = await prisma.category.create({
        data: { ...validated.data, workspaceId },
    });

    revalidatePath("/categories");
    revalidatePath("/dashboard");
    revalidatePath("/reports");
    return { success: true, category };
}

/** Update kategori */
export async function updateCategory(
    categoryId: string,
    workspaceId: string,
    values: z.infer<typeof CategorySchema>
) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Tidak terautentikasi" };

    const membership = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
    });
    if (!membership || membership.role === WorkspaceRole.VIEWER) {
        return { error: "Tidak punya akses untuk mengubah kategori" };
    }

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) return { error: "Kategori tidak ditemukan" };
    if (category.isDefault) return { error: "Kategori bawaan tidak bisa diubah" };

    const validated = CategorySchema.safeParse(values);
    if (!validated.success) return { error: "Data tidak valid" };

    const updated = await prisma.category.update({
        where: { id: categoryId },
        data: validated.data,
    });

    revalidatePath("/categories");
    revalidatePath("/dashboard");
    revalidatePath("/reports");
    return { success: true, category: updated };
}

/** Hapus kategori */
export async function deleteCategory(categoryId: string, workspaceId: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Tidak terautentikasi" };

    const membership = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
    });
    if (!membership || membership.role === WorkspaceRole.VIEWER) {
        return { error: "Tidak punya akses untuk menghapus kategori" };
    }

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) return { error: "Kategori tidak ditemukan" };
    if (category.isDefault) return { error: "Kategori bawaan tidak bisa dihapus" };

    // Cek apakah kategori masih dipakai transaksi
    const used = await prisma.transaction.count({ where: { categoryId } });
    if (used > 0) {
        return { error: `Kategori ini masih dipakai oleh ${used} transaksi. Pindahkan transaksi dahulu.` };
    }

    await prisma.category.delete({ where: { id: categoryId } });

    revalidatePath("/categories");
    revalidatePath("/dashboard");
    revalidatePath("/reports");
    return { success: true };
}
