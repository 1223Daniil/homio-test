"use client";

import { Spinner } from "@heroui/react";

export function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Spinner size="lg" color="primary" />
    </div>
  );
}
