import { redirect } from "next/navigation";

export default function DashboardPage({ searchParams }: { searchParams: Record<string, string> }) {
  const workspaceId = searchParams?.workspaceId;
  const target = workspaceId ? `/workspaces?workspaceId=${workspaceId}` : "/workspaces";
  redirect(target);
}
