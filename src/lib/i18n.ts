import { getRequestConfig } from "next-intl/server";
import { locales } from "@/config/i18n";
import { notFound } from "next/navigation";

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as any)) notFound();

  return {
    messages: (await import(`../locales/${locale}.json`)).default
  };
});

export async function getMessages(locale: string) {
  try {
    return (await import(`../locales/${locale}.json`)).default;
  } catch (error) {
    console.error(`Failed to load messages for locale: ${locale}`, error);
    // Fallback to English messages
    return (await import(`../locales/en.json`)).default;
  }
}
