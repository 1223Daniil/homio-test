import { Pathnames } from "next-intl/navigation";
import { i18nConfig } from './src/config/i18n';

export const locales = ["en", "ru"] as const;
export const defaultLocale = "ru" as const;

// Paths that should not be localized
export const nonLocalizedPaths = ["/uploads"];

export const pathnames = {
  "/": "/",
  "/dashboard": "/dashboard",
  "/projects": "/projects",
  "/settings": "/settings"
} satisfies Pathnames<typeof locales>;

export type AppPathnames = keyof typeof pathnames;

// Helper function to check if path should be localized
export function shouldLocalizePathname(pathname: string): boolean {
  return !nonLocalizedPaths.some(path => pathname.startsWith(path));
}

export default {
  locales: i18nConfig.locales,
  defaultLocale: i18nConfig.defaultLocale,
  localePrefix: 'always'
} as const;
