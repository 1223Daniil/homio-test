import { Button, Card, Image, Input } from "@heroui/react";
import {
  Icon3dCubeSphere,
  IconLayoutGrid,
  IconPhotoPlus,
  IconTrash,
  IconUpload
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

import BlurHashImage from "@/components/media/BlurHashImage";
import { UnitLayout } from "@prisma/client";
import { handleLayoutFileUpload } from "@/lib/upload";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface LayoutMediaFormProps {
  layout: Partial<UnitLayout>;
  onFieldChange: <K extends keyof UnitLayout>(
    field: K,
    value: UnitLayout[K]
  ) => void;
}

interface LayoutImage {
  id: string;
  url: string;
  title?: string;
  description?: string;
  blurhash?: string;
  isMain?: boolean;
}

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

const parseImages = (images: unknown): LayoutImage[] => {
  console.log("parseImages вызван с аргументом:", images);

  if (!images) {
    console.log("parseImages: images отсутствует, возвращаю пустой массив");
    return [];
  }

  try {
    // Если images уже массив
    if (Array.isArray(images)) {
      console.log(
        "parseImages: images является массивом, обрабатываю элементы"
      );

      // Создаем массив валидных изображений
      const validImages: LayoutImage[] = [];

      for (const img of images) {
        if (!img || typeof img !== "object") {
          console.log("parseImages: пропускаю некорректный элемент:", img);
          continue;
        }

        const id = img.id || String(Math.random());
        const url = img.url || "";

        // Пропускаем элементы с пустым URL
        if (!url || url.trim() === "") {
          console.log(`parseImages: пропускаю элемент с пустым URL, id=${id}`);
          continue;
        }

        const title = img.title || "";
        const description = img.description || "";

        console.log(`parseImages: добавляю элемент с id=${id}, url=${url}`);

        validImages.push({
          id,
          url,
          title,
          description
        });
      }

      console.log("parseImages: результат после фильтрации:", validImages);
      return validImages;
    }

    // Если images - объект, пробуем преобразовать его в массив
    if (typeof images === "object" && images !== null) {
      console.log(
        "parseImages: images является объектом, преобразуем в массив"
      );
      const jsonString = JSON.stringify(images);
      const parsed = JSON.parse(jsonString);

      if (Array.isArray(parsed)) {
        console.log("parseImages: объект успешно преобразован в массив");
        return parseImages(parsed);
      }
    }
  } catch (error) {
    console.error("parseImages: ошибка при обработке объекта:", error);
  }

  console.log(
    "parseImages: неизвестный формат данных, возвращаю пустой массив"
  );
  return [];
};

export function LayoutMediaForm({
  layout,
  onFieldChange
}: LayoutMediaFormProps) {
  const t = useTranslations("Layouts");
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});

  const [images, setImages] = useState<LayoutImage[]>(() => {
    const parsedImages = parseImages(layout.images);
    console.log("Начальное состояние images:", parsedImages);
    return parsedImages;
  });

  // Отслеживаем изменения в состоянии images только для логирования
  useEffect(() => {
    console.log("Состояние images обновлено:", images);
    // Проверяем, есть ли в images все необходимые поля для корректного отображения
    const hasValidStructure = images.every(img => img.id && img.url);
    console.log("Структура изображений валидна:", hasValidStructure);
  }, [images]);

  // Отслеживаем изменения в layout.images при первичной загрузке и внешних обновлениях
  useEffect(() => {
    console.log("layout.images изменился:", layout.images);

    // Сравниваем текущее состояние с новыми данными, чтобы избежать циклов
    const parsedImages = parseImages(layout.images);
    console.log("Разобранные изображения из layout.images:", parsedImages);

    const currentIds = new Set(images.map(img => img.id));
    const layoutIds = new Set(parsedImages.map(img => img.id));

    // Обновляем только если есть реальные изменения в составе изображений
    const hasChanges =
      parsedImages.length !== images.length ||
      parsedImages.some(img => !currentIds.has(img.id)) ||
      images.some(img => !layoutIds.has(img.id));

    console.log("Есть изменения в изображениях:", hasChanges);
    console.log("Текущие IDs:", Array.from(currentIds));
    console.log("IDs из layout:", Array.from(layoutIds));

    if (hasChanges) {
      console.log(
        "Обновляем локальное состояние images из layout.images:",
        parsedImages
      );
      setImages(parsedImages);
    }
  }, [layout.images]);

  const handleMainImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const layoutId = layout.id || "temp-layout";
      console.log(`Uploading main image for layout ${layoutId}...`);

      const result = await handleLayoutFileUpload(
        file,
        layoutId,
        "photo",
        setUploadProgress
      );

      console.log(`Main image upload successful:`, result);

      // Обновляем состояние
      onFieldChange("mainImage", result.url);
      toast.success(t("media.uploadSuccess"));

      // Очищаем input после загрузки
      if (event.target) {
        event.target.value = "";
      }
    } catch (error) {
      console.error("Main image upload error:", error);
      toast.error(
        error instanceof Error ? error.message : t("media.uploadError")
      );
    }
  };

  const handleMainImageDelete = async () => {
    onFieldChange("mainImage", null);
    toast.success(t("media.deleteSuccess"));
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      const fileArray = Array.from(files);
      const layoutId = layout.id || "temp-layout";

      console.log(
        `Uploading ${fileArray.length} gallery images for layout ${layoutId}...`
      );

      // Загружаем каждый файл
      const uploadPromises = fileArray.map(file =>
        handleLayoutFileUpload(file, layoutId, "photo", setUploadProgress)
      );

      // Ждем завершения всех загрузок
      const results = await Promise.all(uploadPromises);
      console.log(`Gallery images upload successful:`, results);

      // Создаем новые объекты изображений
      const newImages: LayoutImage[] = results.map(result => ({
        id: result.id,
        url: result.url,
        title: "",
        description: "",
        blurhash: result.blurhash,
        isMain: result.isMain
      }));

      // Обновляем локальное состояние
      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);

      // Обновляем состояние layout
      try {
        const imagesJson = JSON.parse(JSON.stringify(updatedImages));
        onFieldChange("images", imagesJson);
        console.log("Images saved to layout state:", imagesJson);
      } catch (error) {
        console.error("Ошибка при сохранении изображений:", error);
        toast.error("Не удалось сохранить изображения");
      }

      toast.success(t("media.gallery.uploadSuccess"));

      // Очищаем input после загрузки
      if (event.target) {
        event.target.value = "";
      }
    } catch (error) {
      console.error("Gallery images upload error:", error);
      toast.error(
        error instanceof Error ? error.message : t("media.uploadError")
      );
    }
  };

  const handleImageDelete = async (imageId: string) => {
    console.log(`Удаление изображения с ID: ${imageId}`);

    // Находим изображение по ID для логирования
    const imageToDelete = images.find(img => img.id === imageId);
    console.log("Удаляемое изображение:", imageToDelete);

    // Фильтруем список изображений, исключая удаляемое
    const updatedImages = images.filter(img => img.id !== imageId);
    console.log("Список изображений после удаления:", updatedImages);

    // Обновляем локальное состояние
    setImages(updatedImages);

    try {
      // Преобразуем в JSON и обновляем в layout
      const imagesJson = JSON.parse(JSON.stringify(updatedImages));
      console.log("Обновляем images в layout после удаления:", imagesJson);

      onFieldChange("images", imagesJson);
      console.log("Изображения в layout обновлены после удаления");

      toast.success(t("media.gallery.deleteSuccess"));
    } catch (error) {
      console.error("Ошибка при удалении изображения:", error);
      toast.error(
        "Не удалось удалить изображение. Пожалуйста, попробуйте еще раз."
      );

      // Восстанавливаем предыдущее состояние в случае ошибки
      setImages(images);
    }
  };

  const handleImageDescriptionUpdate = (
    imageId: string,
    description: string
  ) => {
    console.log(`Обновление описания для изображения ${imageId}:`, description);

    // Обновляем описание изображения
    const updatedImages = images.map(img =>
      img.id === imageId ? { ...img, description } : img
    );

    // Обновляем локальное состояние
    setImages(updatedImages);

    try {
      // Преобразуем в JSON и обновляем в layout
      const imagesJson = JSON.parse(JSON.stringify(updatedImages));
      console.log("Обновляем images в layout с новым описанием:", imagesJson);

      onFieldChange("images", imagesJson);
      console.log("Описание изображения обновлено в layout");
    } catch (error) {
      console.error("Ошибка при обновлении описания изображения:", error);
      toast.error("Не удалось обновить описание изображения.");
    }
  };

  // Найти blurhash для главного изображения
  const getMainImageBlurhash = (): string | undefined => {
    if (!layout.images) return undefined;

    try {
      const imagesArray =
        typeof layout.images === "string"
          ? JSON.parse(layout.images)
          : layout.images;

      if (!Array.isArray(imagesArray)) return undefined;

      const mainImage = imagesArray.find(
        (img: any) =>
          img.isMain === true ||
          (layout.mainImage && img.url === layout.mainImage)
      );

      return mainImage?.blurhash;
    } catch (error) {
      console.error("Error parsing images JSON:", error);
      return undefined;
    }
  };

  const mainImageBlurhash = getMainImageBlurhash();

  return (
    <div className="space-y-6">
      {/* Main Image */}
      <div>
        <h3 className="text-lg font-medium mb-4 text-default-900 dark:text-white">
          {t("media.title")}
        </h3>

        {/* Main Image Display */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          {layout.mainImage ? (
            <Card className="relative group">
              <div className="relative w-full h-40">
                <BlurHashImage
                  src={layout.mainImage || ""}
                  alt={layout.name || "Layout Image"}
                  className="object-cover"
                  blurhash={mainImageBlurhash}
                  quality={70}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all">
                  <Button
                    isIconOnly
                    size="sm"
                    color="danger"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    onClick={handleMainImageDelete}
                    aria-label={t("media.delete")}
                  >
                    <IconTrash size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Button
              variant="flat"
              color="primary"
              className="w-full h-40 flex flex-col items-center justify-center gap-2"
              onClick={() => document.getElementById("mainImageInput")?.click()}
            >
              <IconPhotoPlus size={24} />
              <span>{t("media.addPhoto")}</span>
              <input
                id="mainImageInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleMainImageUpload}
              />
            </Button>
          )}
        </div>

        {/* Upload Progress */}
        {Object.entries(uploadProgress).map(([fileName, progress]) => (
          <div key={fileName} className="mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-default-600">{fileName}</span>
              <span className="text-sm text-default-600">{progress}%</span>
            </div>
            <div className="w-full bg-default-100 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Images Gallery */}
      <div>
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <IconPhotoPlus size={20} className="text-default-500" />
          {t("media.gallery.title")}
        </h3>

        {/* Images Grid */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          {images.map(image => (
            <div key={image.id} className="space-y-2">
              <Card className="relative group">
                <div className="relative w-full h-40">
                  <BlurHashImage
                    src={image.url}
                    alt={image.title || "Layout Image"}
                    className="object-cover"
                    blurhash={image.blurhash}
                    quality={70}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all">
                    <Button
                      isIconOnly
                      size="sm"
                      color="danger"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      onClick={() => handleImageDelete(image.id)}
                      aria-label={t("media.gallery.delete")}
                    >
                      <IconTrash size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
              <Input
                size="sm"
                placeholder="Описание изображения"
                value={image.description || ""}
                onChange={e =>
                  handleImageDescriptionUpdate(image.id, e.target.value)
                }
              />
            </div>
          ))}

          {/* Add Image Button */}
          <Button
            variant="flat"
            color="primary"
            className="w-full h-40 flex flex-col items-center justify-center gap-2"
            onClick={() =>
              document.getElementById("galleryImageInput")?.click()
            }
          >
            <IconPhotoPlus size={24} />
            <span>{t("media.gallery.addPhoto")}</span>
            <input
              id="galleryImageInput"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
            />
          </Button>
        </div>
      </div>

      {/* Plan Image */}
      <div>
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <IconLayoutGrid size={20} className="text-default-500" />
          {t("fields.planImage")}
        </h3>
        <Input
          value={layout.planImage || ""}
          onChange={e => onFieldChange("planImage", e.target.value)}
          placeholder={t("fields.planImagePlaceholder")}
          startContent={
            <IconLayoutGrid size={20} className="text-default-500" />
          }
        />
      </div>

      {/* 3D Tour */}
      <div>
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <Icon3dCubeSphere size={20} className="text-default-500" />
          {t("fields.tour3d")}
        </h3>
        <Input
          value={layout.tour3d || ""}
          onChange={e => onFieldChange("tour3d", e.target.value)}
          placeholder={t("fields.tour3dPlaceholder")}
          startContent={
            <Icon3dCubeSphere size={20} className="text-default-500" />
          }
        />
      </div>
    </div>
  );
}
