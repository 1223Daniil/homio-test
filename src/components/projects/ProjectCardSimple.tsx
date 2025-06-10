"use client";

import { Button, Card, CardBody, Chip } from "@heroui/react";
import { ChevronRight, Edit, Image as ImageIcon, Play } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import BlurHashImage from "@/components/media/BlurHashImage";
import Image from "next/image";
import Link from "next/link";
import { ProjectMedia } from "@prisma/client";
import { VideoPlayer } from "../ui/VideoPlayer";
import { useRouter } from "@/config/i18n";
import { useState } from "react";

interface DomainProject {
  id: string;
  name: string;
  translations: {
    language: string;
    name?: string;
    description?: string;
  }[];
  media: ProjectMedia[];
  status: string;
}

interface ProjectCardSimpleProps {
  project: DomainProject;
  onEdit?: (project: DomainProject) => void;
}

export function ProjectCardSimple({ project, onEdit }: ProjectCardSimpleProps) {
  const t = useTranslations("Projects");
  const locale = useLocale();
  const router = useRouter();

  // Проверка на наличие translations
  const hasTranslations =
    project.translations && project.translations.length > 0;
  const projectName = hasTranslations
    ? project.translations.find(t => t.language === locale)?.name ||
      project.translations[0]?.name
    : project.name || t("untitled");

  const projectDescription = hasTranslations
    ? project.translations.find(t => t.language === locale)?.description ||
      project.translations[0]?.description
    : t("noDescription");

  console.log(project);

  // Преобразуем URL изображения для использования прокси
  const getProxiedImageUrl = (url?: string) => {
    if (!url) return "";

    // Проверяем, является ли это видео
    const isVideo =
      url.endsWith(".mp4") || url.endsWith(".webm") || url.endsWith(".m3u8");

    // Для изображений используем image-proxy
    if (!isVideo && url.includes("storage.yandexcloud.net")) {
      const cloudPath = url.replace("https://storage.yandexcloud.net/", "");
      return `/api/image-proxy/${cloudPath}?width=666&height=440&quality=100`;
    }

    return url;
  };

  // Проверяем, является ли медиа-файл видео
  const isVideo = (media?: { url?: string; type?: string }) => {
    if (!media?.url) return false;
    return (
      media.url.endsWith(".mp4") ||
      media.url.endsWith(".webm") ||
      media.url.endsWith(".m3u8") ||
      media.type?.startsWith("video/") ||
      media.type === "video"
    );
  };

  // Ищем первое видео в списке медиа, если оно есть
  const videoMedia = project.media?.find(media => isVideo(media));

  // Если видео нет, берем первую картинку
  const mediaToDisplay =
    videoMedia ||
    project.media?.find(media => media.isCover === true) ||
    project.media?.[0];

  // Определяем, является ли медиа видео
  const isMediaVideo = isVideo(mediaToDisplay);

  const handleLearnMore = () => {
    router.push(`/projects/${project.id}`);
  };

  return (
    <Card
      isPressable
      onPress={handleLearnMore}
      className="w-full overflow-hidden bg-background-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
    >
      {/* Изображение или видео проекта */}
      <div className="relative w-full h-[220px] overflow-clip">
        {mediaToDisplay ? (
          <div className="relative w-full h-full">
            {isMediaVideo ? (
              <VideoPlayer
                src={getProxiedImageUrl(mediaToDisplay.url)}
                poster={mediaToDisplay.thumbnailUrl || ""}
                lockQuality={true}
                startLevel={0}
                autoPlay={true}
                muted={true}
                loop={true}
                controls={false}
                className="w-full h-full object-cover"
              />
            ) : (
              <BlurHashImage
                src={getProxiedImageUrl(mediaToDisplay.url)}
                alt={projectName || "Project image"}
                blurhash={mediaToDisplay.blurhash || undefined}
                quality={50}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
                className="object-cover"
              />
            )}
            {/* Индикатор видео */}
            {isMediaVideo && (
              <div className="absolute bottom-2 right-2 p-1 rounded-full bg-black/50 text-white">
                <Play className="w-4 h-4" />
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full bg-default-100 flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-default-400" />
          </div>
        )}
      </div>

      <CardBody className="p-6">
        <div className="space-y-4">
          {/* Статус */}
          <Chip
            size="sm"
            variant="flat"
            className="bg-default-100 text-default-800 uppercase text-xs font-medium"
          >
            {t(`status.${project.status.toLowerCase()}` as any)}
          </Chip>

          {/* Название */}
          <h3 className="text-2xl font-bold text-foreground">{projectName}</h3>

          {/* Описание */}
          <p className="text-base text-default-600 line-clamp-2">
            {projectDescription}
          </p>

          {/* Кнопки */}
          <div className="flex justify-between items-center pt-4">
            <Button
              color="primary"
              variant="light"
              endContent={<ChevronRight className="w-4 h-4" />}
              onPress={handleLearnMore}
            >
              {t("actions.viewDetails")}
            </Button>

            <Button
              isIconOnly
              variant="light"
              className="text-default-500 hover:text-primary"
              onPress={() => {
                // Просто перенаправляем на страницу редактирования
                router.push(`/projects/${project.id}/edit`);
              }}
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export default ProjectCardSimple;
