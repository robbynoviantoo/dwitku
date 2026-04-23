"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { WorkspaceRole } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import * as z from "zod";
import { SaleSchema, SaleExpenseSchema } from "@/lib/validations/sale";


// ── Helper ────────────────────────────────────────────────────────────────────


async function getMembership(workspaceId: string, userId: string) {
    return prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId } },
    });
}

// ── Sale CRUD ─────────────────────────────────────────────────────────────────

export type SaleFilter = {
    categoryId?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
};

export async function getSales(workspaceId: string, filter: SaleFilter = {}) {
    const session = await auth();
    if (!session?.user?.id) return { items: [], total: 0, totalPages: 0 };

    const membership = await getMembership(workspaceId, session.user.id);
    if (!membership) return { items: [], total: 0, totalPages: 0 };

    const { categoryId, search, dateFrom, dateTo, page = 1, limit = 20 } = filter;

    const where = {
        workspaceId,
        ...(categoryId ? { categoryId } : {}),
        ...(search ? { name: { contains: search, mode: "insensitive" as const } } : {}),
        ...(dateFrom || dateTo
            ? {
                  date: {
                      ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
                      ...(dateTo ? { lte: new Date(dateTo + "T23:59:59") } : {}),
                  },
              }
            : {}),
    };

    const [items, total] = await Promise.all([
        prisma.sale.findMany({
            where,
            include: {
                category: { select: { id: true, name: true, emoji: true, color: true } },
                createdBy: { select: { id: true, name: true, image: true } },
            },
            orderBy: [{ date: "desc" }, { createdAt: "desc" }],
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.sale.count({ where }),
    ]);

    return { items, total, totalPages: Math.ceil(total / limit) };
}

export async function createSale(workspaceId: string, values: z.infer<typeof SaleSchema>) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Tidak terautentikasi" };

    const membership = await getMembership(workspaceId, session.user.id);
    if (!membership || membership.role === WorkspaceRole.VIEWER)
        return { error: "Tidak punya akses untuk membuat entri penjualan" };

    const validated = SaleSchema.safeParse(values);
    if (!validated.success) return { error: "Data tidak valid" };

    const { date, name, qty, sellingPrice, costPrice, categoryId, note, productId } = validated.data;

    const sale = await prisma.sale.create({
        data: {
            workspaceId,
            date: new Date(date),
            name,
            qty,
            sellingPrice,
            costPrice,
            categoryId: categoryId || null,
            productId: productId || null,
            note: note || null,
            createdById: session.user.id,
        },
    });

    revalidatePath("/sales");
    revalidatePath("/sales-reports");
    return { success: true, sale };
}

export async function updateSale(saleId: string, workspaceId: string, values: z.infer<typeof SaleSchema>) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Tidak terautentikasi" };

    const membership = await getMembership(workspaceId, session.user.id);
    if (!membership || membership.role === WorkspaceRole.VIEWER)
        return { error: "Tidak punya akses" };

    const validated = SaleSchema.safeParse(values);
    if (!validated.success) return { error: "Data tidak valid" };

    const { date, name, qty, sellingPrice, costPrice, categoryId, note, productId } = validated.data;

    const sale = await prisma.sale.update({
        where: { id: saleId },
        data: {
            date: new Date(date),
            name,
            qty,
            sellingPrice,
            costPrice,
            categoryId: categoryId || null,
            productId: productId || null,
            note: note || null,
        },
    });

    revalidatePath("/sales");
    revalidatePath("/sales-reports");
    return { success: true, sale };
}

export async function deleteSale(saleId: string, workspaceId: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Tidak terautentikasi" };

    const membership = await getMembership(workspaceId, session.user.id);
    if (!membership || membership.role === WorkspaceRole.VIEWER)
        return { error: "Tidak punya akses" };

    await prisma.sale.delete({ where: { id: saleId } });

    revalidatePath("/sales");
    revalidatePath("/sales-reports");
    return { success: true };
}

// ── SaleExpense CRUD ──────────────────────────────────────────────────────────

export async function getSaleExpenses(workspaceId: string, filter: SaleFilter = {}) {
    const session = await auth();
    if (!session?.user?.id) return { items: [], total: 0, totalPages: 0 };

    const membership = await getMembership(workspaceId, session.user.id);
    if (!membership) return { items: [], total: 0, totalPages: 0 };

    const { categoryId, search, dateFrom, dateTo, page = 1, limit = 20 } = filter;

    const where = {
        workspaceId,
        ...(categoryId ? { categoryId } : {}),
        ...(search ? { name: { contains: search, mode: "insensitive" as const } } : {}),
        ...(dateFrom || dateTo
            ? {
                  date: {
                      ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
                      ...(dateTo ? { lte: new Date(dateTo + "T23:59:59") } : {}),
                  },
              }
            : {}),
    };

    const [items, total] = await Promise.all([
        prisma.saleExpense.findMany({
            where,
            include: {
                category: { select: { id: true, name: true, emoji: true, color: true } },
                createdBy: { select: { id: true, name: true, image: true } },
            },
            orderBy: [{ date: "desc" }, { createdAt: "desc" }],
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.saleExpense.count({ where }),
    ]);

    return { items, total, totalPages: Math.ceil(total / limit) };
}

export async function createSaleExpense(workspaceId: string, values: z.infer<typeof SaleExpenseSchema>) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Tidak terautentikasi" };

    const membership = await getMembership(workspaceId, session.user.id);
    if (!membership || membership.role === WorkspaceRole.VIEWER)
        return { error: "Tidak punya akses" };

    const validated = SaleExpenseSchema.safeParse(values);
    if (!validated.success) return { error: "Data tidak valid" };

    const { date, name, amount, categoryId, note } = validated.data;

    const expense = await prisma.saleExpense.create({
        data: {
            workspaceId,
            date: new Date(date),
            name,
            amount,
            categoryId: categoryId || null,
            note: note || null,
            createdById: session.user.id,
        },
    });

    revalidatePath("/sales");
    revalidatePath("/sales-reports");
    return { success: true, expense };
}

export async function updateSaleExpense(expenseId: string, workspaceId: string, values: z.infer<typeof SaleExpenseSchema>) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Tidak terautentikasi" };

    const membership = await getMembership(workspaceId, session.user.id);
    if (!membership || membership.role === WorkspaceRole.VIEWER)
        return { error: "Tidak punya akses" };

    const validated = SaleExpenseSchema.safeParse(values);
    if (!validated.success) return { error: "Data tidak valid" };

    const { date, name, amount, categoryId, note } = validated.data;

    const expense = await prisma.saleExpense.update({
        where: { id: expenseId },
        data: {
            date: new Date(date),
            name,
            amount,
            categoryId: categoryId || null,
            note: note || null,
        },
    });

    revalidatePath("/sales");
    revalidatePath("/sales-reports");
    return { success: true, expense };
}

export async function deleteSaleExpense(expenseId: string, workspaceId: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Tidak terautentikasi" };

    const membership = await getMembership(workspaceId, session.user.id);
    if (!membership || membership.role === WorkspaceRole.VIEWER)
        return { error: "Tidak punya akses" };

    await prisma.saleExpense.delete({ where: { id: expenseId } });

    revalidatePath("/sales");
    revalidatePath("/sales-reports");
    return { success: true };
}

// ── Reports & Summary ─────────────────────────────────────────────────────────

export async function getSalesSummary(workspaceId: string, dateFrom?: string, dateTo?: string) {
    const session = await auth();
    if (!session?.user?.id) return null;

    const membership = await getMembership(workspaceId, session.user.id);
    if (!membership) return null;

    const dateFilter = dateFrom || dateTo
        ? {
              date: {
                  ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
                  ...(dateTo ? { lte: new Date(dateTo + "T23:59:59") } : {}),
              },
          }
        : {};

    const [sales, expenses] = await Promise.all([
        prisma.sale.findMany({
            where: { workspaceId, ...dateFilter },
            select: { qty: true, sellingPrice: true, costPrice: true },
        }),
        prisma.saleExpense.findMany({
            where: { workspaceId, ...dateFilter },
            select: { amount: true },
        }),
    ]);

    const omzet = sales.reduce((sum, s) => sum + Number(s.sellingPrice), 0);
    const hpp = sales.reduce((sum, s) => sum + Number(s.costPrice), 0);
    const labaKotor = omzet - hpp;
    const biayaOperasional = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const labaBersih = labaKotor - biayaOperasional;

    return { omzet, hpp, labaKotor, biayaOperasional, labaBersih };
}

export async function getSalesReport(workspaceId: string, months = 6) {
    const session = await auth();
    if (!session?.user?.id) return [];

    const membership = await getMembership(workspaceId, session.user.id);
    if (!membership) return [];

    const result = [];
    for (let i = months - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(1);
        date.setMonth(date.getMonth() - i);
        const from = new Date(date.getFullYear(), date.getMonth(), 1);
        const to = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

        const [sales, expenses] = await Promise.all([
            prisma.sale.findMany({
                where: { workspaceId, date: { gte: from, lte: to } },
                select: { qty: true, sellingPrice: true, costPrice: true },
            }),
            prisma.saleExpense.findMany({
                where: { workspaceId, date: { gte: from, lte: to } },
                select: { amount: true },
            }),
        ]);

        const omzet = sales.reduce((sum, s) => sum + Number(s.sellingPrice), 0);
        const hpp = sales.reduce((sum, s) => sum + Number(s.costPrice), 0);
        const biayaOperasional = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
        const labaBersih = omzet - hpp - biayaOperasional;

        result.push({
            month: from.toLocaleDateString("id-ID", { month: "short", year: "numeric" }),
            omzet,
            labaBersih,
        });
    }

    return result;
}
