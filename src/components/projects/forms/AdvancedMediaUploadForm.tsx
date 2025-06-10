"use client";

import { Button, Card, Image, Input, Progress } from "@heroui/react";
import {
  IconPhoto,
  IconTrash,
  IconUpload,
  IconVideo,
  IconRefresh
} from "@tabler/icons-react";
import { ProjectMedia, ProjectWithTranslation } from "@/types/project";
import {
  handleDescriptionUpdate,
  handleError,
  handleFileUpload,
  handleMediaDelete
} from "@/lib/upload";
import { useEffect, useState, useRef } from "react";

import { MediaCategory } from "@prisma/client";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface AdvancedMediaUploadFormProps {
  project: ProjectWithTranslation;
  onSave: (data: Partial<ProjectWithTranslation>) => Promise<void>;
  isSaving: boolean;
  onUpdateDescription: (mediaId: string, description: string) => Promise<any>;
}

export function AdvancedMediaUploadForm({
  project,
  onSave,
  isSaving,
  onUpdateDescription
}: AdvancedMediaUploadFormProps) {
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
  const [constructionPhotos, setConstructionPhotos] = useState<ProjectMedia[]>(
    project.media?.filter(
      m =>
        (m.type === "image" || m.type === "photo") &&
        m.category === MediaCategory.CONSTRUCTION_PROGRESS
    ) || []
  );
  const [videos, setVideos] = useState<ProjectMedia[]>(
    project.media?.filter(m => m.type === "video") || []
  );

  const [descriptions, setDescriptions] = useState<{ [key: string]: string }>({});
  const [savingDescription, setSavingDescription] = useState<{
    [key: string]: boolean;
  }>({});
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [isUploading, setIsUploading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [videoThumbnails, setVideoThumbnails] = useState<{ [key: string]: string }>({});
  const [uploadingThumbnail, setUploadingThumbnail] = useState<string | null>(null);
  
  // Refs для input элементов
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const amenityInputRef = useRef<HTMLInputElement>(null);
  const constructionInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Обновляем состояние при изменении project.media
    if (project.media) {
      const bannerMedia = project.media.filter(
        m =>
          (m.type === "image" || m.type === "photo") &&
          m.category === MediaCategory.BANNER
      );
      const amenityMedia = project.media.filter(
        m =>
          (m.type === "image" || m.type === "photo") &&
          m.category === MediaCategory.AMENITIES
      );
      const constructionMedia = project.media.filter(
        m =>
          (m.type === "image" || m.type === "photo") &&
          m.category === MediaCategory.CONSTRUCTION_PROGRESS
      );
      const videoMedia = project.media.filter(m => m.type === "video");

      setBannerPhotos(bannerMedia);
      setAmenityPhotos(amenityMedia);
      setConstructionPhotos(constructionMedia);
      setVideos(videoMedia);

      // Инициализируем состояние миниатюр из видео
      const thumbnails: { [key: string]: string } = {};
      videoMedia.forEach(video => {
        if (video.id && video.thumbnailUrl) {
          thumbnails[video.id] = video.thumbnailUrl;
        }
      });
      setVideoThumbnails(thumbnails);
    }
  }, [project.media]);

  useEffect(() => {
    const initialDescriptions: { [key: string]: string } = {};
    [...bannerPhotos, ...amenityPhotos, ...constructionPhotos, ...videos].forEach(media => {
      if (media.id) {
        initialDescriptions[media.id] = media.description || "";
      }
    });
    setDescriptions(initialDescriptions);
  }, [bannerPhotos, amenityPhotos, constructionPhotos, videos]);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
    category: MediaCategory
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      const fileArray = Array.from(files);

      // Создаем функцию для обновления прогресса
      const updateProgress = (fn: (prev: { [key: string]: number }) => { [key: string]: number }) => {
        setUploadProgress(fn);
      };

      // Загружаем все файлы параллельно
      const uploadPromises = fileArray.map(file =>
        handleFileUpload(file, project.id, category, "photo", updateProgress)
      );

      const uploadedMedia = await Promise.all(uploadPromises);

      // Обновляем состояние в зависимости от категории
      if (category === MediaCategory.BANNER) {
        setBannerPhotos(prev => [...prev, ...uploadedMedia]);
      } else if (category === MediaCategory.AMENITIES) {
        setAmenityPhotos(prev => [...prev, ...uploadedMedia]);
      } else if (category === MediaCategory.CONSTRUCTION_PROGRESS) {
        setConstructionPhotos(prev => [...prev, ...uploadedMedia]);
      }

      toast.success(t("upload.success"));
      
      // Очищаем input после успешной загрузки
      if (category === MediaCategory.BANNER && bannerInputRef.current) {
        bannerInputRef.current.value = '';
      } else if (category === MediaCategory.AMENITIES && amenityInputRef.current) {
        amenityInputRef.current.value = '';
      } else if (category === MediaCategory.CONSTRUCTION_PROGRESS && constructionInputRef.current) {
        constructionInputRef.current.value = '';
      }
    } catch (error) {
      handleError(error, t("upload.error"));
    } finally {
      setIsUploading(false);
      // Очищаем прогресс после завершения
      setTimeout(() => {
        setUploadProgress({});
      }, 1000);
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
      } else if (category === MediaCategory.AMENITIES) {
        setAmenityPhotos(prev => prev.filter(photo => photo.id !== photoId));
      } else if (category === MediaCategory.CONSTRUCTION_PROGRESS) {
        setConstructionPhotos(prev => prev.filter(photo => photo.id !== photoId));
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
      const updateProgress = (fn: (prev: { [key: string]: number }) => { [key: string]: number }) => {
        setUploadProgress(fn);
      };

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

      toast.success(t("upload.videoSuccess"));
      
      // Очищаем input после успешной загрузки
      if (videoInputRef.current) {
        videoInputRef.current.value = '';
      }
    } catch (error) {
      handleError(error, t("upload.videoError"));
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
      toast.success(t("upload.videoDeleteSuccess"));
    } catch (error) {
      handleError(error, t("upload.videoDeleteError"));
    }
  };

  const handleSave = async () => {
    if (!onSave) return;

    try {
      await onSave({
        media: [...bannerPhotos, ...amenityPhotos, ...constructionPhotos, ...videos]
      });
      toast.success(t("save.success"));
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
      
      toast.success(t("description.updateSuccess"));
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
  
  const refreshMediaFiles = async () => {
    try {
      setIsRefreshing(true);
      const response = await fetch(`/api/projects/${project.id}?include=media`);
      if (!response.ok) {
        throw new Error("Failed to fetch project data");
      }
      
      const updatedProject = await response.json();
      
      // Обновляем состояние медиафайлов
      if (updatedProject.media) {
        const bannerMedia = updatedProject.media.filter(
          (m: ProjectMedia) =>
            (m.type === "image" || m.type === "photo") &&
            m.category === MediaCategory.BANNER
        );
        const amenityMedia = updatedProject.media.filter(
          (m: ProjectMedia) =>
            (m.type === "image" || m.type === "photo") &&
            m.category === MediaCategory.AMENITIES
        );
        const constructionMedia = updatedProject.media.filter(
          (m: ProjectMedia) =>
            (m.type === "image" || m.type === "photo") &&
            m.category === MediaCategory.CONSTRUCTION_PROGRESS
        );
        const videoMedia = updatedProject.media.filter((m: ProjectMedia) => m.type === "video");

        setBannerPhotos(bannerMedia);
        setAmenityPhotos(amenityMedia);
        setConstructionPhotos(constructionMedia);
        setVideos(videoMedia);
      }
      
      toast.success(t("refresh.success"));
    } catch (error) {
      handleError(error, t("refresh.error"));
    } finally {
      setIsRefreshing(false);
    }
  };

  // Функция для отображения прогресса загрузки
  const renderUploadProgress = () => {
    const progressKeys = Object.keys(uploadProgress);
    if (progressKeys.length === 0) return null;
    
    return (
      <div className="mb-4 space-y-2">
        <h4 className="text-sm font-medium">{t("upload.progress")}</h4>
        {progressKeys.map(key => (
          <div key={key} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="truncate max-w-[200px]">{key}</span>
              <span>{uploadProgress[key]}%</span>
            </div>
            <Progress value={uploadProgress[key]} className="h-1" />
          </div>
        ))}
      </div>
    );
  };

  // Функция загрузки миниатюры для видео
  const handleThumbnailUpload = async (
    videoId: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    try {
      setUploadingThumbnail(videoId);
      
      // Загружаем миниатюру
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error("Failed to upload thumbnail");
      }

      const data = await response.json();
      const thumbnailUrl = data.url;

      // Сохраняем URL миниатюры в состоянии
      setVideoThumbnails(prev => ({
        ...prev,
        [videoId]: thumbnailUrl
      }));

      // Обновляем видео с новым URL миниатюры
      const response2 = await fetch(`/api/projects/${project.id}/media/${videoId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ thumbnailUrl })
      });

      if (!response2.ok) {
        throw new Error("Failed to update video with thumbnail");
      }

      // Обновляем список видео с новой миниатюрой
      setVideos(prev => 
        prev.map(video => 
          video.id === videoId ? { ...video, thumbnailUrl } : video
        )
      );

      toast.success(t("upload.thumbnailSuccess"));
    } catch (error) {
      handleError(error, t("upload.thumbnailError"));
    } finally {
      setUploadingThumbnail(null);
      // Очищаем input после успешной загрузки
      if (thumbnailInputRef.current) {
        thumbnailInputRef.current.value = '';
      }
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
        {/* Индикатор прогресса загрузки */}
        {renderUploadProgress()}
        
        {/* Кнопка обновления */}
        <div className="flex justify-end">
          <Button
            color="default"
            variant="light"
            startContent={<IconRefresh size={16} />}
            onClick={refreshMediaFiles}
            isLoading={isRefreshing}
            className="mb-4"
          >
            {t("refresh.button")}
          </Button>
        </div>

        {/* Project Photographs */}
        <div>
          <h3 className="text-lg font-medium mb-4 text-default-900 dark:text-white">
            {t("sections.photographs.title")}
          </h3>

          {/* Banner Photos Upload */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-md font-medium">{t("sections.photographs.banner")}</h4>
              <Input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                ref={bannerInputRef}
                onChange={e => handleFileSelect(e, MediaCategory.BANNER)}
                disabled={isUploading}
              />
              <Button
                color="primary"
                variant="light"
                startContent={<IconUpload size={16} />}
                onClick={() => bannerInputRef.current?.click()}
                isLoading={isUploading}
              >
                {t("upload.button")}
              </Button>
            </div>

            {/* Banner Photos Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {bannerPhotos.map(photo => (
                <Card key={photo.id} className="relative group">
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
                      onClick={() => handleRemovePhoto(photo.id, MediaCategory.BANNER)}
                    >
                      <IconTrash size={16} />
                    </Button>
                  </div>
                  <Input
                    size="sm"
                    placeholder={t("description.placeholder")}
                    value={descriptions[photo.id] || ""}
                    onChange={e => setDescriptions(prev => ({ ...prev, [photo.id]: e.target.value }))}
                    onBlur={e => handleUpdateMediaDescription(photo.id, e.target.value)}
                    className="mt-2"
                  />
                </Card>
              ))}
            </div>
          </div>

          {/* Amenity Photos Upload */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-md font-medium">{t("sections.photographs.amenities")}</h4>
              <Input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                ref={amenityInputRef}
                onChange={e => handleFileSelect(e, MediaCategory.AMENITIES)}
                disabled={isUploading}
              />
              <Button
                color="primary"
                variant="light"
                startContent={<IconUpload size={16} />}
                onClick={() => amenityInputRef.current?.click()}
                isLoading={isUploading}
              >
                {t("upload.button")}
              </Button>
            </div>

            {/* Amenity Photos Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {amenityPhotos.map(photo => (
                <Card key={photo.id} className="relative group">
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
                      onClick={() => handleRemovePhoto(photo.id, MediaCategory.AMENITIES)}
                    >
                      <IconTrash size={16} />
                    </Button>
                  </div>
                  <Input
                    size="sm"
                    placeholder={t("description.placeholder")}
                    value={descriptions[photo.id] || ""}
                    onChange={e => setDescriptions(prev => ({ ...prev, [photo.id]: e.target.value }))}
                    onBlur={e => handleUpdateMediaDescription(photo.id, e.target.value)}
                    className="mt-2"
                  />
                </Card>
              ))}
            </div>
          </div>
          
          {/* Construction Progress Photos Upload */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-md font-medium">{t("sections.photographs.construction")}</h4>
              <Input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                ref={constructionInputRef}
                onChange={e => handleFileSelect(e, MediaCategory.CONSTRUCTION_PROGRESS)}
                disabled={isUploading}
              />
              <Button
                color="primary"
                variant="light"
                startContent={<IconUpload size={16} />}
                onClick={() => constructionInputRef.current?.click()}
                isLoading={isUploading}
              >
                {t("upload.button")}
              </Button>
            </div>

            {/* Construction Photos Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {constructionPhotos.map(photo => (
                <Card key={photo.id} className="relative group">
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
                      onClick={() => handleRemovePhoto(photo.id, MediaCategory.CONSTRUCTION_PROGRESS)}
                    >
                      <IconTrash size={16} />
                    </Button>
                  </div>
                  <Input
                    size="sm"
                    placeholder={t("description.placeholder")}
                    value={descriptions[photo.id] || ""}
                    onChange={e => setDescriptions(prev => ({ ...prev, [photo.id]: e.target.value }))}
                    onBlur={e => handleUpdateMediaDescription(photo.id, e.target.value)}
                    className="mt-2"
                  />
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Project Videos */}
        <div>
          <h3 className="text-lg font-medium mb-4 text-default-900 dark:text-white">
            {t("sections.videos.title")}
          </h3>

          <div className="flex justify-between items-center mb-4">
            <div></div>
            <Input
              type="file"
              accept="video/*"
              multiple
              className="hidden"
              ref={videoInputRef}
              onChange={handleVideoSelect}
              disabled={isUploading}
            />
            <Button
              color="primary"
              variant="light"
              startContent={<IconUpload size={16} />}
              onClick={() => videoInputRef.current?.click()}
              isLoading={isUploading}
            >
              {t("upload.videoButton")}
            </Button>
          </div>

          {/* Videos Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {videos.map(video => (
              <Card key={video.id} className="relative group">
                <div className="relative w-full h-40 bg-black">
                  <video
                    src={video.url}
                    className="w-full h-full object-cover"
                    preload="metadata"
                    controls
                    poster={video.thumbnailUrl || undefined}
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <IconVideo size={32} className="text-white opacity-50" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all">
                  <Button
                    isIconOnly
                    size="sm"
                    color="danger"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    onClick={() => handleRemoveVideo(video.id)}
                  >
                    <IconTrash size={16} />
                  </Button>
                  <Button
                    isIconOnly
                    size="sm"
                    color="primary"
                    className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    onClick={() => document.getElementById(`thumbnail-input-${video.id}`)?.click()}
                    isLoading={uploadingThumbnail === video.id}
                  >
                    <IconPhoto size={16} />
                    <input
                      id={`thumbnail-input-${video.id}`}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleThumbnailUpload(video.id, e)}
                      disabled={uploadingThumbnail !== null}
                    />
                  </Button>
                </div>
                <div className="p-2 space-y-2">
                  <Input
                    size="sm"
                    placeholder={t("description.placeholder")}
                    value={descriptions[video.id] || ""}
                    onChange={e => setDescriptions(prev => ({ ...prev, [video.id]: e.target.value }))}
                    onBlur={e => handleUpdateMediaDescription(video.id, e.target.value)}
                  />
                  {video.thumbnailUrl && (
                    <div className="text-xs text-default-500 truncate">
                      {t("thumbnailSet")}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            color="primary"
            isLoading={isSaving}
          >
            {t("save.button")}
          </Button>
        </div>
      </div>
    </form>
  );
} 