import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserWorkspaces } from "@/app/actions/workspace";
import { CategoriesClient } from "@/app/(dashboard)/categories/_components/categories-client";
import { Suspense } from "react";

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ workspaceId?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { workspaceId } = await searchParams;

  const allWorkspaces = await getUserWorkspaces();
  if (allWorkspaces.length === 0) redirect("/onboarding");

  const activeWsId = workspaceId ?? allWorkspaces[0].id;
  const activeWs =
    allWorkspaces.find((w) => w.id === activeWsId) ?? allWorkspaces[0];

  return (
    <Suspense fallback={null}>
      <CategoriesClient
        workspaceId={activeWs.id}
        canEdit={activeWs.role !== "VIEWER"}
      />
    </Suspense>
  );
}
