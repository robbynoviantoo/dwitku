import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { GuideClient } from "./_components/guide-client";

export const metadata = {
  title: "Buku Panduan Penggunaan — Dwitku",
  description: "Panduan lengkap penggunaan fitur Dwitku: Workspace, Dompet, Transaksi, Bot Telegram, Laporan, dan Kolaborasi Tim.",
};

export default async function GuidePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  return <GuideClient userName={session.user.name || "Pengguna Dwitku"} />;
}
