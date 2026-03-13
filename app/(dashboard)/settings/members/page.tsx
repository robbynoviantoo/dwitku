import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserWorkspaces } from "@/app/actions/workspace";
import { MembersClient } from "@/components/workspace/members-client";
import { Users } from "lucide-react";
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
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Users className="w-5 h-5 text-indigo-500" />
          <h1 className="text-2xl font-bold text-zinc-900">
            Anggota Workspace
          </h1>
        </div>
        <p className="text-zinc-500 text-sm">
          Kelola anggota dan undangan untuk workspace Anda.
        </p>
      </div>

      <Suspense fallback={null}>
        <MembersClient
          workspaceId={activeWsId}
          currentUserId={session.user.id}
        />
      </Suspense>
    </div>
  );
}
