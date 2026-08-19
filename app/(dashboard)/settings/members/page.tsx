import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserWorkspaces } from "@/app/actions/workspace";
import { MembersClient } from "@/components/workspace/members-client";
import { Suspense } from "react";

export default async function MembersPage({
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

  return (
    <div className="p-4 md:p-8 max-w-7xl lg:max-w-full mx-auto">
      <Suspense fallback={null}>
        <MembersClient
          workspaceId={activeWsId}
          currentUserId={session.user.id}
        />
      </Suspense>
    </div>
  );
}
