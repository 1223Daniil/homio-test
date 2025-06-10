import { createSharedPathnamesNavigation } from "next-intl/navigation";
import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";

export const locales = ["en", "ru"] as const;
export const defaultLocale = "ru" as const;

export type Locale = (typeof locales)[number];

// Export navigation hooks
export const { Link, redirect, usePathname, useRouter } =
  createSharedPathnamesNavigation({
    locales
  });

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  return {
    messages: (await import(`@/locales/${locale}.json`)).default,
    timeZone: "Asia/Bangkok",
    now: new Date()
  };
});
