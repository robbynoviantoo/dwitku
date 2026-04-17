import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserWorkspaces } from "@/app/actions/workspace";
import { WorkspacesClient } from "./_components/workspaces-client";
import { DashboardClient } from "@/app/(dashboard)/dashboard/_components/dashboard-client";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Workspace — Dwitku",
  description: "Pilih workspace untuk mulai mencatat keuangan.",
};

export default async function WorkspacesPage({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [workspaces, dbUser] = await Promise.all([
    getUserWorkspaces(),
    prisma.user.findUnique({
      where: { id: session.user.id! },
      select: { emailVerified: true, password: true },
    }),
  ]);

  // Unverified = has password (credentials) and no emailVerified date
  const isEmailVerified = !dbUser?.password || !!dbUser?.emailVerified;

  if (searchParams?.workspaceId) {
    return (
      <DashboardClient
        initialUser={{ name: session.user.name }}
        isEmailVerified={isEmailVerified}
      />
    );
  }

  return (
    <WorkspacesClient
      workspaces={workspaces}
      user={session.user}
      isEmailVerified={isEmailVerified}
    />
  );
}
