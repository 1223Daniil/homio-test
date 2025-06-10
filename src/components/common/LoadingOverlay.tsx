"use client";

import { Spinner } from "@heroui/react";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  overlayBlur?: number;
  loaderProps?: {
    size?: "sm" | "md" | "lg";
  };
}

const LoadingOverlayContent = ({
  isLoading,
  message,
  overlayBlur = 2,
  loaderProps
}: LoadingOverlayProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !isLoading) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/10 dark:bg-white/10 backdrop-blur-sm"
      style={{ backdropFilter: `blur(${overlayBlur}px)` }}
      suppressHydrationWarning
    >
      <div className="flex flex-col items-center gap-4">
        <Spinner size={loaderProps?.size || "lg"} />
        {message && (
          <div className="text-center">
            <p className="text-default-700 dark:text-default-300 font-medium">
              {message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export const LoadingOverlay = dynamic(
  () => Promise.resolve(LoadingOverlayContent),
  {
    ssr: false
  }
);
