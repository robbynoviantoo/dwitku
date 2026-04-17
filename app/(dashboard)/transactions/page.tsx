import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserWorkspaces } from "@/app/actions/workspace";
import { Suspense } from "react";
import { TransactionsClient } from "./_components/transactions-client";
import { prisma } from "@/lib/prisma";
import { getUserPlanLimits, getUserPlanKey } from "@/app/actions/subscription";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ workspaceId?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { workspaceId } = await searchParams;

  const [allWorkspaces, dbUser] = await Promise.all([
    getUserWorkspaces(),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { emailVerified: true, password: true },
    }),
  ]);

  if (allWorkspaces.length === 0) redirect("/onboarding");

  const activeWs = workspaceId
    ? allWorkspaces.find((w) => w.id === workspaceId) || allWorkspaces[0]
    : allWorkspaces[0];

  const planKey = await getUserPlanKey();
  const limits = await getUserPlanLimits();
  const canExport = limits?.canExport ?? false;
  const isEmailVerified = !dbUser?.password || !!dbUser?.emailVerified;

  return (
    <Suspense fallback={null}>
      <TransactionsClient
        workspaceId={activeWs.id}
        currency={activeWs.currency}
        canEdit={activeWs.role !== "VIEWER"}
        canExport={canExport}
        planKey={planKey}
        isEmailVerified={isEmailVerified}
      />
    </Suspense>
  );
}
