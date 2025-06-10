"use client";

import { Button, Card, Image, Input, Progress } from "@heroui/react";
import {
  IconPhoto,
  IconTrash,
  IconUpload,
  IconVideo,
  IconStar
} from "@tabler/icons-react";
import { ProjectMedia, ProjectWithTranslation } from "@/types/project";
import {
  handleDescriptionUpdate,
  handleError,
  handleFileUpload,
  handleMediaDelete
} from "@/lib/upload";
import { useEffect, useState } from "react";

import { MediaCategory } from "@prisma/client";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface MarketingAssetsFormProps {
  project: ProjectWithTranslation;
  onSave: (data: Partial<ProjectWithTranslation>) => Promise<void>;
  isSaving: boolean;
  onUpdateDescription: (mediaId: string, description: string) => Promise<any>;
}

export function MarketingAssetsForm({
  project,
  onSave,
  isSaving,
  onUpdateDescription
}: MarketingAssetsFormProps) {
  const t = useTranslations("Projects.marketing");
  const [bannerPhotos, setBannerPhotos] = useState<ProjectMedia[]>(
    project.media?.filter(
      m =>
        (m.type === "image" || m.type === "photo") &&
        m.category === MediaCategory.BANNER
    ) || []
  );
  const [amenityPhotos, setAmenityPhotos] = useState<ProjectMedia[]>(
    project.media?.filter(
      m =>
        (m.type === "image" || m.type === "photo") &&
        m.category === MediaCategory.AMENITIES
    ) || []
  );
  const [videos, setVideos] = useState<ProjectMedia[]>(
    project.media?.filter(m => m.type === "video") || []
  );

  const [descriptions, setDescriptions] = useState<{ [key: string]: string }>(
    {}
  );
  const [savingDescription, setSavingDescription] = useState<{
    [key: string]: boolean;
  }>({});
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const initialDescriptions: { [key: string]: string } = {};
    [...bannerPhotos, ...amenityPhotos, ...videos].forEach(media => {
      if (media.id) {
        initialDescriptions[media.id] = media.description || "";
      }
    });
    setDescriptions(initialDescriptions);
  }, [bannerPhotos, amenityPhotos, videos]);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
    category: MediaCategory
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      const fileArray = Array.from(files);

      // Создаем функцию для обновления прогресса, которая ничего не делает
      const updateProgress = (fn: any) => {};

      // Загружаем все файлы параллельно
      const uploadPromises = fileArray.map(file =>
        handleFileUpload(file, project.id, category, "photo", updateProgress)
      );

      const uploadedMedia = await Promise.all(uploadPromises);

      // Обновляем состояние в зависимости от категории
      if (category === MediaCategory.BANNER) {
        setBannerPhotos(prev => [...prev, ...uploadedMedia]);
      } else {
        setAmenityPhotos(prev => [...prev, ...uploadedMedia]);
      }

      toast.success(t("upload.success"));
    } catch (error) {
      handleError(error, t("upload.error"));
    }
  };

  const handleRemovePhoto = async (
    photoId: string,
    category: MediaCategory
  ) => {
    try {
      await handleMediaDelete(project.id, photoId);

      if (category === MediaCategory.BANNER) {
        setBannerPhotos(prev => prev.filter(photo => photo.id !== photoId));
      } else {
        setAmenityPhotos(prev => prev.filter(photo => photo.id !== photoId));
      }

      toast.success(t("upload.deleteSuccess"));
    } catch (error) {
      handleError(error, t("upload.deleteError"));
    }
  };

  const handleVideoSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      const fileArray = Array.from(files);

      // Используем функцию для обновления прогресса
      const updateProgress = setUploadProgress;

      // Загружаем все видеофайлы параллельно
      const uploadPromises = fileArray.map(file =>
        handleFileUpload(
          file,
          project.id,
          MediaCategory.BANNER,
          "video",
          updateProgress
        )
      );

      const uploadedVideos = await Promise.all(uploadPromises);

      // Обновляем состояние
      setVideos(prev => [...prev, ...uploadedVideos]);

      toast.success("Videos uploaded successfully");
    } catch (error) {
      handleError(error, "upload videos");
    } finally {
      setIsUploading(false);
      // Очищаем прогресс после завершения
      setTimeout(() => {
        setUploadProgress({});
      }, 1000);
    }
  };

  const handleRemoveVideo = async (videoId: string) => {
    try {
      await handleMediaDelete(project.id, videoId);
      setVideos(prev => prev.filter(video => video.id !== videoId));
      toast.success("Video deleted successfully");
    } catch (error) {
      handleError(error, "delete video");
    }
  };

  const handleSave = async () => {
    if (!onSave) return;

    try {
      await onSave({
        media: [...bannerPhotos, ...amenityPhotos, ...videos]
      });
    } catch (error) {
      console.error("Save error:", error);
      toast.error(t("errors.updateError"));
    }
  };

  const handleUpdateMediaDescription = async (
    mediaId: string,
    newDescription: string
  ) => {
    if (savingDescription[mediaId]) return;

    setSavingDescription(prev => ({ ...prev, [mediaId]: true }));
    try {
      await handleDescriptionUpdate(
        mediaId,
        newDescription,
        onUpdateDescription
      );
      setDescriptions(prev => ({
        ...prev,
        [mediaId]: newDescription
      }));
    } catch (error) {
      handleError(error, t("errors.descriptionUpdate"));
      setDescriptions(prev => ({
        ...prev,
        [mediaId]: prev[mediaId] || ""
      }));
    } finally {
      setSavingDescription(prev => ({ ...prev, [mediaId]: false }));
    }
  };

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        handleSave();
      }}
    >
      <div className="space-y-8">
        {/* Project Photographs */}
        <div>
          <h3 className="text-lg font-medium mb-4 text-default-900 dark:text-white">
            {t("sections.photographs.title")}
          </h3>

          {/* Banner Photos Grid */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            {bannerPhotos.map(photo => (
              <div key={photo.id} className="space-y-2">
                <Card className="relative group">
                  <Image
                    src={photo.url}
                    alt={photo.title || ""}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all">
                    <Button
                      isIconOnly
                      size="sm"
                      color="danger"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      onClick={() =>
                        handleRemovePhoto(photo.id!, MediaCategory.BANNER)
                      }
                      aria-label={t("media.photo.delete")}
                    >
                      <IconTrash size={16} />
                    </Button>
                  </div>
                  {photo.isCover && (
                    <div className="absolute top-2 left-2 bg-primary text-white p-1 rounded-md">
                      <IconStar size={16} />
                    </div>
                  )}
                </Card>
                <Input
                  size="sm"
                  placeholder={t("fields.description.placeholder")}
                  value={descriptions[photo.id!] || ""}
                  onChange={e => {
                    setDescriptions(prev => ({
                      ...prev,
                      [photo.id!]: e.target.value
                    }));
                  }}
                  onBlur={() =>
                    handleUpdateMediaDescription(
                      photo.id!,
                      descriptions[photo.id!] || ""
                    )
                  }
                  isDisabled={Boolean(savingDescription[photo.id!])}
                  description={
                    savingDescription[photo.id!]
                      ? t("fields.description.saving")
                      : undefined
                  }
                />
              </div>
            ))}
          </div>

          {/* Add Banner Photos Button */}
          <Button
            variant="flat"
            color="primary"
            className="w-full h-40 flex flex-col items-center justify-center gap-2"
            onClick={() =>
              document.getElementById("bannerPhotosInput")?.click()
            }
          >
            <IconPhoto size={24} />
            <span>{t("sections.photographs.addBanner")}</span>
            <input
              id="bannerPhotosInput"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => handleFileSelect(e, MediaCategory.BANNER)}
            />
          </Button>
        </div>

        {/* Project Amenities Photos */}
        <div>
          <h3 className="text-lg font-medium mb-4 text-default-900 dark:text-white">
            {t("sections.amenities.title")}
          </h3>

          {/* Amenities Photos Grid */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            {amenityPhotos.map(photo => (
              <div key={photo.id} className="space-y-2">
                <Card className="relative group">
                  <Image
                    src={photo.url}
                    alt={photo.title || ""}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all">
                    <Button
                      isIconOnly
                      size="sm"
                      color="danger"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      onClick={() =>
                        handleRemovePhoto(photo.id!, MediaCategory.AMENITIES)
                      }
                      aria-label={t("media.photo.delete")}
                    >
                      <IconTrash size={16} />
                    </Button>
                  </div>
                  {photo.isCover && (
                    <div className="absolute top-2 left-2 bg-primary text-white p-1 rounded-md">
                      <IconStar size={16} />
                    </div>
                  )}
                </Card>
                <Input
                  size="sm"
                  placeholder={t("fields.description.placeholder")}
                  value={descriptions[photo.id!] || ""}
                  onChange={e => {
                    setDescriptions(prev => ({
                      ...prev,
                      [photo.id!]: e.target.value
                    }));
                  }}
                  onBlur={() =>
                    handleUpdateMediaDescription(
                      photo.id!,
                      descriptions[photo.id!] || ""
                    )
                  }
                  isDisabled={Boolean(savingDescription[photo.id!])}
                  description={
                    savingDescription[photo.id!]
                      ? t("fields.description.saving")
                      : undefined
                  }
                />
              </div>
            ))}
          </div>

          {/* Add Amenities Photos Button */}
          <Button
            variant="flat"
            color="primary"
            className="w-full h-40 flex flex-col items-center justify-center gap-2"
            onClick={() =>
              document.getElementById("amenitiesPhotosInput")?.click()
            }
          >
            <IconPhoto size={24} />
            <span>{t("sections.amenities.addPhotos")}</span>
            <input
              id="amenitiesPhotosInput"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => handleFileSelect(e, MediaCategory.AMENITIES)}
            />
          </Button>
        </div>

        {/* Project Videos */}
        <div>
          <h3 className="text-lg font-medium mb-4 text-default-900 dark:text-white">
            {t("sections.videos.title")}
          </h3>

          {/* Videos Grid */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            {videos.map(video => (
              <div key={video.id} className="space-y-2">
                <Card className="relative group">
                  <video
                    src={video.url}
                    className="w-full h-40 object-cover"
                    controls
                    playsInline
                    crossOrigin="anonymous"
                    preload="metadata"
                    onError={e => {
                      console.error(
                        "Ошибка загрузки видео:",
                        e,
                        (e.target as HTMLVideoElement).error?.message ||
                          "Неизвестная ошибка"
                      );
                      toast.error(
                        `Ошибка загрузки видео: ${
                          (e.target as HTMLVideoElement).error?.message ||
                          "Проверьте консоль браузера"
                        }`
                      );
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all">
                    <Button
                      isIconOnly
                      size="sm"
                      color="danger"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      onClick={() => handleRemoveVideo(video.id)}
                      aria-label={t("media.video.delete")}
                    >
                      <IconTrash size={16} />
                    </Button>
                  </div>
                </Card>
                <Input
                  size="sm"
                  placeholder={t("fields.description.placeholder")}
                  value={descriptions[video.id!] || ""}
                  onChange={e => {
                    setDescriptions(prev => ({
                      ...prev,
                      [video.id!]: e.target.value
                    }));
                  }}
                  onBlur={() =>
                    handleUpdateMediaDescription(
                      video.id!,
                      descriptions[video.id!] || ""
                    )
                  }
                  isDisabled={Boolean(savingDescription[video.id!])}
                  description={
                    savingDescription[video.id!]
                      ? t("fields.description.saving")
                      : undefined
                  }
                />
              </div>
            ))}
          </div>

          {/* Add Video Button */}
          <div className="space-y-4">
            <Button
              variant="flat"
              color="primary"
              className="w-full h-40 flex flex-col items-center justify-center gap-2"
              onClick={() => document.getElementById("videoInput")?.click()}
              isDisabled={isUploading}
            >
              {isUploading ? (
                <IconUpload size={24} className="animate-pulse" />
              ) : (
                <IconVideo size={24} />
              )}
              <span>
                {isUploading
                  ? t("sections.videos.uploading")
                  : t("sections.videos.addVideo")}
              </span>
              <input
                id="videoInput"
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleVideoSelect}
                disabled={isUploading}
              />
            </Button>

            {/* Прогресс загрузки */}
            {isUploading && Object.keys(uploadProgress).length > 0 && (
              <div className="space-y-2">
                {Object.entries(uploadProgress).map(([fileName, progress]) => (
                  <div key={fileName} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="truncate max-w-[80%]">{fileName}</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} color="primary" size="sm" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t border-default-200">
          <Button
            color="primary"
            className="px-8"
            type="submit"
            isLoading={isSaving}
          >
            {t("save")}
          </Button>
        </div>
      </div>
    </form>
  );
}
