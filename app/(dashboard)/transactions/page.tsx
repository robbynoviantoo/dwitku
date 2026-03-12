import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserWorkspaces } from "@/app/actions/workspace";
import { getCategories } from "@/app/actions/category";
import { getTransactions, getTransactionSummary } from "@/app/actions/transaction";
import { TransactionsClient } from "@/components/transactions/transactions-client";

export default async function TransactionsPage({
    searchParams,
}: {
    searchParams: Promise<{ workspaceId?: string }>;
}) {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const { workspaceId } = await searchParams;

    const allWorkspaces = await getUserWorkspaces();
    if (allWorkspaces.length === 0) redirect("/onboarding");

    const activeWs = workspaceId
        ? (allWorkspaces.find((w) => w.id === workspaceId) ?? allWorkspaces[0])
        : allWorkspaces[0];

    const [categories, { items: rawTransactions, total }, summary] = await Promise.all([
        getCategories(activeWs.id),
        getTransactions(activeWs.id, { limit: 20 }),
        getTransactionSummary(activeWs.id),
    ]);

    // Prisma Decimal & Date tidak bisa dioper ke client component — harus di-serialize
    const transactions = rawTransactions.map((tx) => ({
        ...tx,
        amount: Number(tx.amount),
        date: tx.date.toISOString(),
        createdAt: tx.createdAt.toISOString(),
        updatedAt: tx.updatedAt.toISOString(),
    }));

    const canEdit = activeWs.role !== "VIEWER";

    return (
        <TransactionsClient
            workspaceId={activeWs.id}
            currency={activeWs.currency}
            categories={categories as any}
            initialTransactions={transactions as any}
            initialTotal={total}
            summary={summary}
            canEdit={canEdit}
        />
    );
}
