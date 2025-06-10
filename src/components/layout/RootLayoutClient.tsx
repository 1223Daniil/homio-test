"use client";

import { useTranslationError } from "@/hooks/useTranslationError";
import { ReactNode, useEffect } from "react";

export function RootLayoutClient({ children }: { children: ReactNode }) {
  useEffect(() => {
    console.log("RootLayoutClient mounted");
  }, []);

  console.log("RootLayoutClient rendering");
  useTranslationError();
  return <>{children}</>;
}
