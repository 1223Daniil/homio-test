import { Card, Group, Image, SimpleGrid, Text, rem } from "@mantine/core";
import { Dropzone, FileWithPath } from "@mantine/dropzone";
import { IconPhoto, IconUpload, IconX } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";

import { MediaCategory } from "@prisma/client";
import { getMediaUrl } from "@/lib/utils";
import { notifications } from "@mantine/notifications";
import { useTranslations } from "next-intl";

interface ProjectMedia {
  id: string;
  url: string;
  title: string | null;
  description: string | null;
  type: string;
  order: number;
}

interface ProjectMediaUploadProps {
  projectId: string;
  existingMedia?: ProjectMedia[];
  onUploadComplete?: (media: ProjectMedia) => void;
  onDeleteMedia?: (mediaId: string) => void;
}

export function ProjectMediaUpload({
  projectId,
  existingMedia = [],
  onUploadComplete,
  onDeleteMedia
}: ProjectMediaUploadProps) {
  const t = useTranslations("projects");
  const [uploading, setUploading] = useState(false);
  const [media, setMedia] = useState<ProjectMedia[]>(existingMedia);

  useEffect(() => {
    setMedia(existingMedia);
  }, [existingMedia]);

  const handleDrop = useCallback(
    async (files: FileWithPath[]) => {
      setUploading(true);
      try {
        const uploadSingleFile = async (file: FileWithPath) => {
          const formData = new FormData();
          formData.append("files", file);

          const uploadResponse = await fetch("/api/media/upload", {
            method: "POST",
            body: formData
          });

          if (!uploadResponse.ok) {
            throw new Error(t("messages.error.upload"));
          }

          const urls = await uploadResponse.json();
          const url = urls[0];

          const mediaResponse = await fetch(
            `/api/projects/${projectId}/media`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                url,
                title: file.name,
                type: file.type.startsWith("image/") ? "photo" : "video",
                category: MediaCategory.BANNER
              })
            }
          );

          if (!mediaResponse.ok) {
            throw new Error(t("messages.error.saveMedia"));
          }

          return await mediaResponse.json();
        };

        // Загружаем все файлы параллельно
        const mediaResults = await Promise.all(
          files.map(file => uploadSingleFile(file))
        );

        setMedia(prev => [...prev, ...mediaResults]);

        mediaResults.forEach(newMedia => {
          if (onUploadComplete) {
            onUploadComplete(newMedia);
          }
        });

        notifications.show({
          title: t("common.success"),
          message: t("messages.success.mediaUploaded"),
          color: "green"
        });
      } catch (error) {
        console.error("Media upload error:", error);
        notifications.show({
          title: t("common.error"),
          message:
            error instanceof Error ? error.message : t("messages.error.upload"),
          color: "red"
        });
      } finally {
        setUploading(false);
      }
    },
    [projectId, onUploadComplete]
  );

  const handleDelete = async (mediaId: string) => {
    try {
      await fetch(`/api/projects/${projectId}/media`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ mediaId })
      });

      setMedia(prev => prev.filter(m => m.id !== mediaId));
      onDeleteMedia?.(mediaId);

      notifications.show({
        title: t("common.success"),
        message: t("messages.success.delete"),
        color: "green"
      });
    } catch (error) {
      console.error("Delete error:", error);
      notifications.show({
        title: t("common.error"),
        message:
          error instanceof Error ? error.message : t("messages.error.delete"),
        color: "red"
      });
    }
  };

  return (
    <div>
      <Dropzone
        onDrop={handleDrop}
        onReject={() => {
          notifications.show({
            title: t("common.error"),
            message: t("messages.error.invalidFile"),
            color: "red"
          });
        }}
        maxSize={5 * 1024 ** 2}
        accept={["image/jpeg", "image/png", "image/webp"]}
        loading={uploading}
      >
        <Group
          position="center"
          spacing="xl"
          style={{ minHeight: rem(220), pointerEvents: "none" }}
        >
          <Dropzone.Accept>
            <IconUpload
              size={rem(50)}
              stroke={1.5}
              color="var(--mantine-color-blue-6)"
            />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX
              size={rem(50)}
              stroke={1.5}
              color="var(--mantine-color-red-6)"
            />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <IconPhoto size={rem(50)} stroke={1.5} />
          </Dropzone.Idle>

          <div>
            <Text size="xl" inline>
              {t("media.dragImages")}
            </Text>
            <Text size="sm" color="dimmed" inline mt={7}>
              {t("media.imageRequirements")}
            </Text>
          </div>
        </Group>
      </Dropzone>

      {media.length > 0 && (
        <SimpleGrid
          cols={4}
          spacing="md"
          mt="xl"
          breakpoints={[
            { maxWidth: "md", cols: 3 },
            { maxWidth: "sm", cols: 2 },
            { maxWidth: "xs", cols: 1 }
          ]}
        >
          {media.map(item => (
            <Card key={item.id} padding="xs" shadow="sm">
              <Card.Section>
                <Image
                  src={getMediaUrl(item.url)}
                  height={160}
                  fit="cover"
                  alt={item.title || t("media.untitled")}
                  styles={{
                    image: {
                      aspectRatio: "4/3",
                      objectFit: "cover",
                      width: "100%",
                      height: "100%"
                    }
                  }}
                />
              </Card.Section>
              <Group position="apart" mt="xs">
                <Text size="sm" weight={500}>
                  {item.title || t("media.untitled")}
                </Text>
                <IconX
                  size={rem(16)}
                  stroke={1.5}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleDelete(item.id)}
                />
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </div>
  );
}
