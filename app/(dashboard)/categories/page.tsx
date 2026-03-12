import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserWorkspaces } from "@/app/actions/workspace";
import { getCategories } from "@/app/actions/category";
import { CategoriesClient } from "@/components/categories/categories-client";

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
    const activeWs = allWorkspaces.find((w) => w.id === activeWsId) ?? allWorkspaces[0];

    const categories = await getCategories(activeWs.id);
    const canEdit = activeWs.role !== "VIEWER";

    return (
        <CategoriesClient
            workspaceId={activeWs.id}
            initialCategories={categories as any}
            canEdit={canEdit}
        />
    );
}
