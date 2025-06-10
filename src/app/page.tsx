import { defaultLocale } from "@/config/i18n";
import { redirect } from "next/navigation";

// Указываем, что страница динамическая
export const dynamic = "force-dynamic";

export default async function RootPage() {
  // Редирект на главную страницу с локалью по умолчанию
  redirect(`/${defaultLocale}`);
}
