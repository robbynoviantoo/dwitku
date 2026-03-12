import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserWorkspaces } from "@/app/actions/workspace";
import { ReportsClient } from "./_components/reports-client";
import { Suspense } from "react";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ workspaceId?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { workspaceId } = await searchParams;
  const allWorkspaces = await getUserWorkspaces();
  if (allWorkspaces.length === 0) redirect("/dashboard");

  const personalWs =
    allWorkspaces.find((w) => w.isPersonal) ?? allWorkspaces[0];
  const activeWs = workspaceId
    ? allWorkspaces.find((w) => w.id === workspaceId) || personalWs
    : personalWs;

  return (
    <Suspense fallback={null}>
      <ReportsClient
        workspaceId={activeWs.id}
        workspaceName={activeWs.name}
        isPersonal={activeWs.isPersonal}
        currency={activeWs.currency}
      />
    </Suspense>
  );
}
