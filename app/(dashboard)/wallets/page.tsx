import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { WalletsClient } from "./_components/wallets-client";
import { WorkspaceRole } from "@/generated/prisma/client";

export default async function WalletsPage({
  searchParams,
}: {
  searchParams: Promise<{ workspaceId?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { workspaceId: paramWsId } = await searchParams;

  // Cari workspace aktif
  let activeWsId = paramWsId;
  if (!activeWsId) {
    const firstMember = await prisma.workspaceMember.findFirst({
      where: { userId: session.user.id },
      include: { workspace: true },
      orderBy: { joinedAt: "asc" },
    });
    if (!firstMember) redirect("/onboarding");
    activeWsId = firstMember.workspaceId;
  }

  const [membership, dbUser] = await Promise.all([
    prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: activeWsId,
          userId: session.user.id,
        },
      },
      include: { workspace: true },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { emailVerified: true, password: true },
    }),
  ]);

  if (!membership) redirect("/workspaces");

  const canEdit =
    membership.role === WorkspaceRole.OWNER ||
    membership.role === WorkspaceRole.EDITOR;

  const isEmailVerified = !(!!dbUser?.password && !dbUser?.emailVerified);

  return (
    <WalletsClient
      workspaceId={activeWsId}
      currency={membership.workspace.currency}
      canEdit={canEdit}
      isEmailVerified={isEmailVerified}
    />
  );
}
