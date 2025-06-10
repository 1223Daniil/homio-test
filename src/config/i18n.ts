import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";
import { getRequestConfig } from "next-intl/server";

export const locales = [
  "en",
  "ru",
  "th",
  "es",
  "ar",
  "cmn",
  "fr",
  "ind"
] as const;
export const defaultLocale = "ru" as const;

export type Locale = (typeof locales)[number];

export const i18nConfig = {
  locales,
  defaultLocale,
  localeDetection: true
} as const;

export const routing = defineRouting({
  locales: locales,
  localeDetection: true,
  localeCookie: true,
  localePrefix: "always",
  defaultLocale: defaultLocale
});

// Export navigation hooks
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);

export default getRequestConfig(async ({ locale }) => {
  let messages;
  try {
    messages = (await import(`@/locales/${locale}.json`)).default;
  } catch (error) {
    console.error(`Failed to load messages for locale ${locale}:`, error);
    messages = (await import(`@/locales/${defaultLocale}.json`)).default;
  }

  return {
    messages,
    timeZone: "Asia/Bangkok",
    now: new Date()
  };
});
