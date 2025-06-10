"use client";

import { ReactNode, useEffect, useState } from "react";

import { IntlClientProvider } from "@/components/IntlClientProvider";
import { NextUIAppProvider } from "./NextUIAppProvider";
import { Toaster } from "sonner";
import { initLogRocket } from "@/utils/logrocket";

interface RootProviderProps {
  children: ReactNode;
  messages: any;
  locale: string;
}

export function RootProvider({
  children,
  messages,
  locale
}: RootProviderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Инициализация LogRocket после монтирования компонента
    initLogRocket();
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <IntlClientProvider messages={messages} locale={locale}>
      <NextUIAppProvider>
        {children}
      </NextUIAppProvider>
      <Toaster />
    </IntlClientProvider>
  );
}
