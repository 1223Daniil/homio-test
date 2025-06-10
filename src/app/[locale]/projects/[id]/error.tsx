"use client";

import React from 'react';
import { useTranslations } from "next-intl";
import { Button } from "@heroui/react";
import { IconRefresh, IconArrowLeft } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function ProjectError({ error, reset }: ErrorProps) {
  const t = useTranslations("Errors");
  const router = useRouter();

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-default-900">
          {t("project.title")}
        </h1>
        <p className="text-default-600 mb-8 max-w-md mx-auto">
          {error.message || t("project.description")}
        </p>
        <div className="flex gap-4 justify-center">
          <Button
            color="primary"
            variant="flat"
            startContent={<IconRefresh size={20} />}
            onClick={reset}
          >
            {t("buttons.tryAgain")}
          </Button>
          <Button
            color="default"
            variant="flat"
            startContent={<IconArrowLeft size={20} />}
            onClick={() => router.back()}
          >
            {t("buttons.goBack")}
          </Button>
        </div>
      </div>
    </div>
  );
} 