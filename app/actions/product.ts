"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { WorkspaceRole } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import * as z from "zod";
import { ProductSchema } from "@/lib/validations/product";

async function getMembership(workspaceId: string, userId: string) {
    return prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId } },
    });
}

export type ProductFilter = {
    categoryId?: string;
    search?: string;
    page?: number;
    limit?: number;
};

export async function getProducts(workspaceId: string, filter: ProductFilter = {}) {
    const session = await auth();
    if (!session?.user?.id) return { items: [], total: 0, totalPages: 0 };

    const membership = await getMembership(workspaceId, session.user.id);
    if (!membership) return { items: [], total: 0, totalPages: 0 };

    const { categoryId, search, page = 1, limit = 50 } = filter;

    const where = {
        workspaceId,
        ...(categoryId ? { categoryId } : {}),
        ...(search ? { name: { contains: search, mode: "insensitive" as const } } : {}),
    };

    const [items, total] = await Promise.all([
        prisma.product.findMany({
            where,
            include: {
                category: { select: { id: true, name: true, emoji: true, color: true } },
            },
            orderBy: [{ name: "asc" }],
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.product.count({ where }),
    ]);

    return { items, total, totalPages: Math.ceil(total / limit) };
}

export async function createProduct(workspaceId: string, values: z.infer<typeof ProductSchema>) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Tidak terautentikasi" };

    const membership = await getMembership(workspaceId, session.user.id);
    if (!membership || membership.role === WorkspaceRole.VIEWER)
        return { error: "Tidak punya akses" };

    const validated = ProductSchema.safeParse(values);
    if (!validated.success) return { error: "Data tidak valid" };

    const { name, categoryId, costPrice, packages } = validated.data;

    const product = await prisma.product.create({
        data: {
            workspaceId,
            name,
            costPrice,
            categoryId: categoryId || null,
            packages: packages as any,
        },
    });

    revalidatePath("/sales");
    return { success: true, product };
}

export async function updateProduct(productId: string, workspaceId: string, values: z.infer<typeof ProductSchema>) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Tidak terautentikasi" };

    const membership = await getMembership(workspaceId, session.user.id);
    if (!membership || membership.role === WorkspaceRole.VIEWER)
        return { error: "Tidak punya akses" };

    const validated = ProductSchema.safeParse(values);
    if (!validated.success) return { error: "Data tidak valid" };

    const { name, categoryId, costPrice, packages } = validated.data;

    const product = await prisma.product.update({
        where: { id: productId },
        data: {
            name,
            costPrice,
            categoryId: categoryId || null,
            packages: packages as any,
        },
    });

    revalidatePath("/sales");
    return { success: true, product };
}

export async function deleteProduct(productId: string, workspaceId: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Tidak terautentikasi" };

    const membership = await getMembership(workspaceId, session.user.id);
    if (!membership || membership.role === WorkspaceRole.VIEWER)
        return { error: "Tidak punya akses" };

    await prisma.product.delete({ where: { id: productId } });

    revalidatePath("/sales");
    return { success: true };
}
