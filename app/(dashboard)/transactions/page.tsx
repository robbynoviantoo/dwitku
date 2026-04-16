import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserWorkspaces } from "@/app/actions/workspace";
import { Suspense } from "react";
import { TransactionsClient } from "./_components/transactions-client";
import { getUserPlanLimits, getUserPlanKey } from "@/app/actions/subscription";

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

  const planKey = await getUserPlanKey();
  const limits = await getUserPlanLimits();
  const canExport = limits?.canExport ?? false;

  return (
    <Suspense fallback={null}>
      <TransactionsClient
        workspaceId={activeWs.id}
        currency={activeWs.currency}
        canEdit={activeWs.role !== "VIEWER"}
        canExport={canExport}
        planKey={planKey}
      />
    </Suspense>
  );
}
