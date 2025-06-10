"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Modal, Button, Group, Title } from "@mantine/core";
import { ProjectForm } from "./ProjectForm";

interface ProjectFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export function ProjectFormDialog({
  isOpen,
  onClose,
  onSubmit
}: ProjectFormDialogProps) {
  const t = useTranslations("projects");

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={<Title order={2}>{t("create")}</Title>}
      size="xl"
    >
      <ProjectForm open={isOpen} onClose={onClose} />
      <Group position="right" mt="md">
        <Button variant="light" onClick={onClose}>
          {t("form.cancel")}
        </Button>
        <Button onClick={onSubmit}>{t("form.save")}</Button>
      </Group>
    </Modal>
  );
}
