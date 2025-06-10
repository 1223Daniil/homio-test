"use client";

import {
  Button,
  Card,
  CardBody,
  Checkbox,
  Spinner,
  Tooltip
} from "@heroui/react";
import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable
} from "@hello-pangea/dnd";
import {
  IconArrowsSort,
  IconDeviceFloppy,
  IconPhoto,
  IconStar,
  IconVideo
} from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";

import { MediaCategory } from "@prisma/client";
import { VideoPlayer } from "@/components/ui/VideoPlayer";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

// Определяем интерфейс для медиа, соответствующий схеме Prisma
export interface ProjectMedia {
  id: string;
  projectId: string;
  type: string;
  url: string;
  thumbnailUrl?: string | null;
  title?: string | null;
  description?: string | null;
  category: MediaCategory | string;
  order: number;
  isCover: boolean;
  isMainVideo: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface MediaOrderFormProps {
  projectId: string;
  media: ProjectMedia[];
  onSave: (media: ProjectMedia[]) => Promise<void>;
  isSaving: boolean;
}

export function MediaOrderForm({
  projectId,
  media: initialMedia,
  onSave,
  isSaving
}: MediaOrderFormProps) {
  // Используем переводы для компонента
  const t = useTranslations("Projects");
  const [media, setMedia] = useState<ProjectMedia[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Мемоизируем группировку медиа по категориям для предотвращения лишних перерендеров
  const getBannerMedia = useCallback(
    () =>
      media.filter(
        m => m.category === MediaCategory.BANNER || m.category === "BANNER"
      ),
    [media]
  );

  const getAmenityMedia = useCallback(
    () =>
      media.filter(
        m =>
          m.category === MediaCategory.AMENITIES || m.category === "AMENITIES"
      ),
    [media]
  );

  const getConstructionMedia = useCallback(
    () =>
      media.filter(
        m =>
          m.category === MediaCategory.CONSTRUCTION_PROGRESS ||
          m.category === "CONSTRUCTION_PROGRESS"
      ),
    [media]
  );

  useEffect(() => {
    // Сортируем медиа по порядку
    const sortedMedia = [...initialMedia].sort((a, b) => {
      // Если порядок не указан, используем 0
      const orderA = typeof a.order === "number" ? a.order : 0;
      const orderB = typeof b.order === "number" ? b.order : 0;
      return orderA - orderB;
    });
    setMedia(sortedMedia);
    setHasChanges(false);
  }, [initialMedia]);

  const handleDragEnd = (result: DropResult) => {
    setIsDragging(false);

    if (!result.destination) return;

    const { source, destination } = result;

    if (source.droppableId === destination.droppableId) {
      const category = source.droppableId;

      // Создаем новый массив медиа
      const newMedia = [...media];

      // Находим индексы элементов в общем массиве
      const sourceItemIndex = newMedia.findIndex(
        item =>
          item.category.toString() === category &&
          newMedia
            .filter(m => m.category.toString() === category)
            .indexOf(item) === source.index
      );

      const destItemIndex = newMedia.findIndex(
        item =>
          item.category.toString() === category &&
          newMedia
            .filter(m => m.category.toString() === category)
            .indexOf(item) === destination.index
      );

      if (sourceItemIndex !== -1 && destItemIndex !== -1) {
        // Перемещаем элемент
        const removed = newMedia.splice(sourceItemIndex, 1)[0];
        if (!removed) return; // Проверяем, что элемент существует

        newMedia.splice(destItemIndex, 0, removed);

        // Обновляем порядок для всех элементов в категории
        const categoryItems = newMedia.filter(
          item => item.category.toString() === category
        );
        categoryItems.forEach((item, index) => {
          item.order = index;
        });

        // Обновляем состояние
        setMedia(newMedia);
        setHasChanges(true);
      }
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleCoverChange = (id: string, checked: boolean) => {
    // Если выбираем новую обложку, снимаем флаг с предыдущей
    const updatedMedia = media.map(item => ({
      ...item,
      isCover: item.id === id ? checked : checked ? false : item.isCover
    }));

    setMedia(updatedMedia);
    setHasChanges(true);
  };

  const handleMainVideoChange = (id: string, checked: boolean) => {
    // Если выбираем новое главное видео, снимаем флаг с предыдущего
    const updatedMedia = media.map(item => ({
      ...item,
      isMainVideo: item.id === id ? checked : checked ? false : item.isMainVideo
    }));

    setMedia(updatedMedia);
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      // Логируем данные перед отправкой для отладки
      console.log(
        "Saving media order:",
        media.map(m => ({ id: m.id, category: m.category, order: m.order }))
      );

      await onSave(media);
      setHasChanges(false);
      toast.success("Порядок медиафайлов сохранен");
    } catch (error) {
      console.error("Error saving media order:", error);
      toast.error("Ошибка при сохранении порядка медиафайлов");
    }
  };

  const renderMediaList = (categoryMedia: ProjectMedia[], category: string) => (
    <Droppable droppableId={category}>
      {(provided, snapshot) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className={`space-y-2 min-h-[50px] p-2 rounded-md transition-colors ${
            snapshot.isDraggingOver
              ? "bg-primary-50 dark:bg-primary-900/20"
              : ""
          }`}
        >
          {categoryMedia.map((item, index) => (
            <Draggable key={item.id} draggableId={item.id} index={index}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  className={`bg-default-50 dark:bg-default-800/50 rounded-lg p-2 transition-shadow ${
                    snapshot.isDragging ? "shadow-lg" : ""
                  }`}
                  style={{
                    ...provided.draggableProps.style
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      {...provided.dragHandleProps}
                      className="cursor-grab p-1 hover:bg-default-100 dark:hover:bg-default-700 rounded-md transition-colors"
                    >
                      <IconArrowsSort size={20} />
                    </div>

                    <div className="w-16 h-16 relative overflow-hidden rounded-md">
                      {item.type === "photo" || item.type === "image" ? (
                        <img
                          src={item.url}
                          alt={item.title || ""}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="relative w-full h-full bg-black">
                          <VideoPlayer
                            src={item.url}
                            className="w-full h-full object-cover"
                            muted={true}
                            autoPlay={false}
                            controls={false}
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <IconVideo size={24} className="text-white" />
                          </div>
                        </div>
                      )}
                      {(item.isCover || item.isMainVideo) && (
                        <div className="absolute top-0 right-0 bg-primary text-white p-1 rounded-bl-md">
                          <IconStar size={14} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {item.title || t("untitled")}
                      </p>
                      <p className="text-xs text-default-500 truncate">
                        {item.type} •{" "}
                        {getCategoryName(item.category.toString())}
                      </p>
                      <p className="text-xs text-default-400">#{index + 1}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {(item.type === "photo" || item.type === "image") && (
                        <Tooltip content="Установить как обложку">
                          <Checkbox
                            isSelected={item.isCover === true}
                            onValueChange={checked =>
                              handleCoverChange(item.id, checked)
                            }
                            aria-label="Установить как обложку"
                            size="sm"
                            icon={<IconPhoto size={18} />}
                          />
                        </Tooltip>
                      )}

                      {item.type === "video" && (
                        <Tooltip content="Установить как главное видео">
                          <Checkbox
                            isSelected={item.isMainVideo === true}
                            onValueChange={checked =>
                              handleMainVideoChange(item.id, checked)
                            }
                            aria-label="Установить как главное видео"
                            size="sm"
                            icon={<IconVideo size={18} />}
                          />
                        </Tooltip>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );

  // Функция для получения названия категории
  const getCategoryName = (category: string): string => {
    switch (category.toUpperCase()) {
      case "BANNER":
        return t("mediaManagement.mediaOrder.tabs.banner");
      case "AMENITIES":
        return t("mediaManagement.mediaOrder.tabs.amenities");
      case "CONSTRUCTION_PROGRESS":
        return t("mediaManagement.mediaOrder.tabs.constructionProgress");
      default:
        return category;
    }
  };

  // Получаем медиа по категориям
  const bannerMedia = getBannerMedia();
  const amenityMedia = getAmenityMedia();
  const constructionMedia = getConstructionMedia();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          {t("mediaManagement.form.order")}
        </h2>
        <Button
          color="primary"
          startContent={<IconDeviceFloppy size={18} />}
          isLoading={isSaving}
          isDisabled={!hasChanges || isSaving}
          onClick={handleSave}
        >
          {isSaving ? "Сохранение..." : "Сохранить порядок"}
        </Button>
      </div>

      <p className="text-default-600 dark:text-default-400 mb-6">
        {t("mediaManagement.form.orderDescription")}
      </p>

      <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
        {bannerMedia.length > 0 && (
          <Card className="mb-6">
            <CardBody>
              <h3 className="text-lg font-medium mb-4">
                {t("mediaManagement.form.order")}
              </h3>
              {renderMediaList(bannerMedia, "BANNER")}
            </CardBody>
          </Card>
        )}

        {amenityMedia.length > 0 && (
          <Card className="mb-6">
            <CardBody>
              <h3 className="text-lg font-medium mb-4">
                {t("mediaManagement.form.order")}
              </h3>
              {renderMediaList(amenityMedia, "AMENITIES")}
            </CardBody>
          </Card>
        )}

        {constructionMedia.length > 0 && (
          <Card className="mb-6">
            <CardBody>
              <h3 className="text-lg font-medium mb-4">
                {t("mediaManagement.form.order")}
              </h3>
              {renderMediaList(constructionMedia, "CONSTRUCTION_PROGRESS")}
            </CardBody>
          </Card>
        )}
      </DragDropContext>

      {media.length === 0 && (
        <div className="text-center py-10">
          <p className="text-default-500">{t("mediaManagement.noMedia")}</p>
        </div>
      )}

      {isSaving && (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-default-900 p-6 rounded-lg shadow-lg flex flex-col items-center">
            <Spinner size="lg" className="mb-4" />
            <p>{t("mediaManagement.saving")}</p>
          </div>
        </div>
      )}
    </div>
  );
}
