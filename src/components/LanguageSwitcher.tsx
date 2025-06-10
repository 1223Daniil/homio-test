"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { i18nConfig } from "@/config/i18n";
import { Select } from "@mantine/core";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (newLocale: string | null) => {
    if (!newLocale) return;

    const days = 30;
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `NEXT_LOCALE=${newLocale};expires=${date.toUTCString()};path=/`;

    const current = pathname;
    const segments = current.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
  };

  return (
    <Select
      value={locale}
      onChange={handleChange}
      data={i18nConfig.locales.map(locale => ({
        value: locale,
        label: locale.toUpperCase()
      }))}
      size="xs"
    />
  );
}
