import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserWorkspaces } from "@/app/actions/workspace";
import { TransactionsClient } from "@/components/transactions/transactions-client";
import { Suspense } from "react";

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
    ? allWorkspaces.find((w) => w.id === workspaceId) || allWorkspaces[0]
    : allWorkspaces[0];

  return (
    <Suspense fallback={null}>
      <TransactionsClient
        workspaceId={activeWs.id}
        currency={activeWs.currency}
        canEdit={activeWs.role !== "VIEWER"}
      />
    </Suspense>
  );
}
