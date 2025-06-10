"use client";

import { useEffect } from "react";
import { Container, Title, Text, Button, Stack } from "@mantine/core";
import { useTranslations } from "next-intl";

export default function ErrorPage({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("common");

  useEffect(() => {
    console.error("Error:", error);
  }, [error]);

  return (
    <Container size={420} my={40}>
      <Stack>
        <Title ta="center" order={2}>
          {t("error.title")}
        </Title>
        <Text c="dimmed" size="sm" ta="center">
          {t("error.description")}
        </Text>
        <Button onClick={reset}>{t("error.tryAgain")}</Button>
      </Stack>
    </Container>
  );
}
