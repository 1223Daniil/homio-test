"use client";

import { ReactNode, useEffect, useState } from "react";
import { HeroUIProvider } from "@heroui/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

interface NextUIAppProviderProps {
  children: ReactNode;
}

export function NextUIAppProvider({ children }: NextUIAppProviderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <HeroUIProvider>{children}</HeroUIProvider>
    </NextThemesProvider>
  );
}
