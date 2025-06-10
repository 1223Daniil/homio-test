import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import {
  Group,
  Text,
  Button,
  Paper,
  Stack,
  FileButton,
  ActionIcon,
  TextInput,
  Textarea
} from "@mantine/core";
import { IconTrash, IconEdit, IconUpload } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { ProjectMedia } from "@/types/project";
import { getMediaUrl } from "@/lib/utils";

interface ProjectMediaEditProps {
  projectId: string;
  media: ProjectMedia[];
  onUpdate: () => void;
}

export function ProjectMediaEdit({
  projectId,
  media,
  onUpdate
}: ProjectMediaEditProps) {
  const t = useTranslations("Projects");
  const [uploading, setUploading] = useState(false);
  const [editingMedia, setEditingMedia] = useState<ProjectMedia | null>(null);

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`/api/projects/${projectId}/media`, {
        method: "POST",
        body: formData
      });

      if (!response.ok) throw new Error("Upload failed");

      notifications.show({
        title: t("notifications.mediaUploadSuccess.title"),
        message: t("notifications.mediaUploadSuccess.message"),
        color: "green"
      });

      onUpdate();
    } catch (error) {
      notifications.show({
        title: t("notifications.error.title"),
        message: t("notifications.error.message"),
        color: "red"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (mediaId: string) => {
    try {
      const response = await fetch(
        `/api/projects/${projectId}/media/${mediaId}`,
        {
          method: "DELETE"
        }
      );

      if (!response.ok) throw new Error("Delete failed");

      notifications.show({
        title: t("notifications.mediaDeleteSuccess.title"),
        message: t("notifications.mediaDeleteSuccess.message"),
        color: "green"
      });

      onUpdate();
    } catch (error) {
      notifications.show({
        title: t("notifications.error.title"),
        message: t("notifications.error.message"),
        color: "red"
      });
    }
  };

  const handleUpdateMedia = async (
    mediaId: string,
    data: Partial<ProjectMedia>
  ) => {
    try {
      const response = await fetch(
        `/api/projects/${projectId}/media/${mediaId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
        }
      );

      if (!response.ok) throw new Error("Update failed");

      notifications.show({
        title: t("notifications.mediaUpdateSuccess.title"),
        message: t("notifications.mediaUpdateSuccess.message"),
        color: "green"
      });

      setEditingMedia(null);
      onUpdate();
    } catch (error) {
      notifications.show({
        title: t("notifications.error.title"),
        message: t("notifications.error.message"),
        color: "red"
      });
    }
  };

  return (
    <Stack spacing="md">
      <Group position="right">
        <FileButton onChange={handleUpload} accept="image/*">
          {props => (
            <Button
              {...props}
              leftIcon={<IconUpload size={16} />}
              loading={uploading}
            >
              {t("media.upload")}
            </Button>
          )}
        </FileButton>
      </Group>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "1rem"
        }}
      >
        {media.map(item => (
          <Paper key={item.id} p="xs" withBorder>
            {editingMedia?.id === item.id ? (
              <Stack spacing="xs">
                <div
                  style={{ position: "relative", width: "100%", height: 200 }}
                >
                  <img
                    src={getMediaUrl(item.url)}
                    alt={item.title || ""}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover"
                    }}
                  />
                </div>
                <TextInput
                  label={t("media.title")}
                  value={editingMedia.title || ""}
                  onChange={e =>
                    setEditingMedia({ ...editingMedia, title: e.target.value })
                  }
                />
                <Textarea
                  label={t("media.description")}
                  value={editingMedia.description || ""}
                  onChange={e =>
                    setEditingMedia({
                      ...editingMedia,
                      description: e.target.value
                    })
                  }
                  minRows={2}
                />
                <Group position="right">
                  <Button
                    variant="light"
                    size="xs"
                    onClick={() => setEditingMedia(null)}
                  >
                    {t("form.cancel")}
                  </Button>
                  <Button
                    size="xs"
                    onClick={() => handleUpdateMedia(item.id, editingMedia)}
                  >
                    {t("form.save")}
                  </Button>
                </Group>
              </Stack>
            ) : (
              <>
                <Group position="right" spacing={4} mb={4}>
                  <ActionIcon
                    size="sm"
                    variant="light"
                    onClick={() => setEditingMedia(item)}
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                  <ActionIcon
                    size="sm"
                    color="red"
                    variant="light"
                    onClick={() => handleDelete(item.id)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
                <div
                  style={{ position: "relative", width: "100%", height: 200 }}
                >
                  <img
                    src={getMediaUrl(item.url)}
                    alt={item.title || ""}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover"
                    }}
                  />
                </div>
                {item.title && (
                  <Text size="sm" mt="xs" fw={500}>
                    {item.title}
                  </Text>
                )}
                {item.description && (
                  <Text size="sm" color="dimmed" mt={2}>
                    {item.description}
                  </Text>
                )}
              </>
            )}
          </Paper>
        ))}
      </div>
    </Stack>
  );
}
