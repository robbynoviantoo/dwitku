import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SalesClient } from "./_components/sales-client";
import { Suspense } from "react";

export const metadata = {
    title: "Penjualan — Dwitku",
    description: "Catat dan kelola transaksi penjualan workspace kamu.",
};

export default async function SalesPage() {
    const session = await auth();
    if (!session?.user) redirect("/login");

    const searchParams = {} as any;
    const workspaceId = searchParams?.workspaceId;

    const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id! },
        select: { email: true },
    });

    return (
        <Suspense fallback={null}>
            <SalesClient
                userId={session.user.id!}
                userEmail={dbUser?.email ?? ""}
            />
        </Suspense>
    );
}
