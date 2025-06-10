import "@/styles/globals.css";

import { Inter } from "next/font/google";
import { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { RootProvider } from "@/providers/RootProvider";
import { getMessages } from "@/lib/i18n";
import { locales } from "@/config/i18n";
import { unstable_setRequestLocale } from "next-intl/server";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-inter"
});

export type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params
}: LayoutProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const locale = resolvedParams.locale;

  return {
    title: "Homio",
    description: "Real Estate management system",
    icons: {
      icon: "/favicon.ico"
    }
  };
}

export default async function Layout({ children, params }: LayoutProps) {
  const resolvedParams = await Promise.resolve(params);
  const locale = resolvedParams.locale;
  const messages = await getMessages(locale);
  unstable_setRequestLocale(locale);

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${inter.variable} font-sans`}
    >
      <head>
        <link rel="dns-prefetch" href="https://storage.yandexcloud.net" />
        <link
          rel="preconnect"
          href="https://maps.googleapis.com"
          crossOrigin="anonymous"
        />
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  document.documentElement.classList.add('light');
                } catch(e) {}
              })();
            `
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`min-h-screen bg-background ${inter.className}`}
      >
        <RootProvider messages={messages} locale={locale}>
          <NextIntlClientProvider messages={messages} locale={locale}>
            {children}
          </NextIntlClientProvider>
        </RootProvider>
      </body>
    </html>
  );
}
