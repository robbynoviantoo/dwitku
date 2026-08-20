import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getGuideImages } from "@/app/actions/guide";
import { GuideAdminClient } from "./_components/guide-admin-client";

export const metadata = {
  title: "Kelola Gambar Buku Panduan — Admin Dwitku",
  description: "Manajemen tautan gambar screenshot tutorial buku panduan tanpa perlu deploy ulang kode.",
};

export default async function AdminGuidePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAdmin: true },
  });

  if (!user?.isAdmin) redirect("/workspaces");

  const guideImages = await getGuideImages();

  return <GuideAdminClient initialImages={guideImages} />;
}
