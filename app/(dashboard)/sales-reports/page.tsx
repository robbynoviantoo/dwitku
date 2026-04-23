import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SalesReportsClient } from "./_components/sales-reports-client";
import { Suspense } from "react";

export const metadata = {
    title: "Laporan Penjualan — Dwitku",
    description: "Laporan omzet, laba kotor, dan laba bersih workspace penjualan kamu.",
};

export default async function SalesReportsPage() {
    const session = await auth();
    if (!session?.user) redirect("/login");

    return (
        <Suspense fallback={null}>
            <SalesReportsClient />
        </Suspense>
    );
}
