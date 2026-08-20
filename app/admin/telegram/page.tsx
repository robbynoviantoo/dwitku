import { getAdminTelegramSettings } from "@/app/actions/telegram";
import { TelegramAdminClient } from "./_components/telegram-admin-client";

export const metadata = {
  title: "Telegram Bot Settings — Admin Dwitku",
};

export default async function AdminTelegramPage() {
  const initialData = await getAdminTelegramSettings();

  return <TelegramAdminClient initialData={initialData as any} />;
}
