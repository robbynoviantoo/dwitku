import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserWorkspaces } from "@/app/actions/workspace";
import { WorkspacesClient } from "./_components/workspaces-client";

export const metadata = {
  title: "Workspace — Dwitku",
  description: "Pilih workspace untuk mulai mencatat keuangan.",
};

export default async function WorkspacesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const workspaces = await getUserWorkspaces();

  return <WorkspacesClient workspaces={workspaces} user={session.user} />;
}
