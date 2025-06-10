"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Modal,
  Button,
  TextInput,
  Textarea,
  Select,
  Stack,
  Grid,
  Paper,
  Tabs,
  LoadingOverlay,
  Box,
  Group
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { 
  Project, 
  ProjectType, 
  ProjectStatus, 
  ProjectTranslation,
  Location,
  ProjectMedia,
  ProjectDocument,
  ProjectAmenity
} from "@prisma/client";
import { ProjectMediaUpload } from "./ProjectMediaUpload";

interface ProjectFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  project?: Project & {
    translations: ProjectTranslation[];
    location?: Location;
    media?: ProjectMedia[];
    documents?: ProjectDocument[];
    amenities?: ProjectAmenity[];
  };
}

export function ProjectForm({
  open,
  onClose,
  onSuccess,
  project
}: ProjectFormProps) {
  const t = useTranslations("projects");
  const locale = useLocale();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  const [formData, setFormData] = useState<Partial<Project> & {
    translations: ProjectTranslation[];
    location?: Location;
    media?: ProjectMedia[];
    documents?: ProjectDocument[];
    amenities?: ProjectAmenity[];
  }>(() => ({
    type: project?.type || ProjectType.RESIDENTIAL,
    status: project?.status || ProjectStatus.DRAFT,
    translations: [
      {
        id: '',
        projectId: '',
        language: locale,
        locale: null,
        name: project?.translations[0]?.name || "",
        description: project?.translations[0]?.description || "",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    location: project?.location || undefined,
    completionDate: project?.completionDate || null,
    totalUnits: project?.totalUnits || null,
    media: project?.media || [],
    documents: project?.documents || [],
    amenities: project?.amenities || []
  }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        project ? `/api/projects/${project.id}` : "/api/projects",
        {
          method: project ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
        }
      );

      if (!response.ok) {
        throw new Error(
          t(project ? "messages.error.update" : "messages.error.create")
        );
      }

      notifications.show({
        title: t("common.success"),
        message: t(
          project ? "messages.success.update" : "messages.success.create"
        ),
        color: "green"
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      notifications.show({
        title: t("common.error"),
        message:
          error instanceof Error ? error.message : t("messages.error.update"),
        color: "red"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={open}
      onClose={onClose}
      title={project ? t("form.edit") : t("form.create")}
      size="xl"
    >
      <Paper pos="relative" p="md">
        <LoadingOverlay visible={loading} />

        <Stack spacing="md">
          <Grid>
            <Grid.Col span={12}>
              <TextInput
                label={t("form.name")}
                required
                value={formData.translations[0].name}
                onChange={e =>
                  setFormData({
                    ...formData,
                    translations: [
                      {
                        ...formData.translations[0],
                        name: e.target.value
                      }
                    ]
                  })
                }
                classNames={{
                  input: "bg-[#F5F5F7] dark:bg-[#2C2C2C]",
                  wrapper: "bg-[#F5F5F7] dark:bg-[#2C2C2C]"
                }}
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <Textarea
                label={t("form.description")}
                minRows={3}
                value={formData.translations[0].description || ""}
                onChange={e =>
                  setFormData({
                    ...formData,
                    translations: [
                      {
                        ...formData.translations[0],
                        description: e.target.value
                      }
                    ]
                  })
                }
                classNames={{
                  input: "bg-[#F5F5F7] dark:bg-[#2C2C2C]",
                  wrapper: "bg-[#F5F5F7] dark:bg-[#2C2C2C]"
                }}
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <Select
                label={t("type.label")}
                required
                data={Object.values(ProjectType).map(type => ({
                  value: type,
                  label: t(`type.${type}`)
                }))}
                value={formData.type}
                onChange={(value: ProjectType) =>
                  setFormData({ ...formData, type: value })
                }
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <Select
                label={t("status.label")}
                required
                data={Object.values(ProjectStatus).map(status => ({
                  value: status,
                  label: t(`status.${status}`)
                }))}
                value={formData.status}
                onChange={(value: ProjectStatus) =>
                  setFormData({ ...formData, status: value })
                }
              />
            </Grid.Col>
          </Grid>

          <Group position="right" mt="md">
            <Button variant="light" onClick={onClose}>
              {t("form.cancel")}
            </Button>
            <Button onClick={handleSubmit}>{t("form.save")}</Button>
          </Group>
        </Stack>
      </Paper>
    </Modal>
  );
}
