import React, { useCallback, useEffect, useMemo, useState } from "react";

import { Blurhash } from "react-blurhash";
import { FaRegCirclePlay } from "react-icons/fa6";
import Image from "next/image";
import { VideoPlayer } from "@/components/ui/VideoPlayer";
import styles from "./MediaGalleryGridPattern.module.css";

// Функция для определения типа файла по URL
const isVideoByUrl = (url: string): boolean => {
  return (
    url.toLowerCase().endsWith(".mp4") ||
    url.toLowerCase().endsWith(".webm") ||
    url.toLowerCase().endsWith(".mov") ||
    url.toLowerCase().endsWith(".avi") ||
    url.toLowerCase().endsWith(".m3u8") ||
    url.toLowerCase().includes(".m3u8?")
  );
};

// Общий интерфейс для элементов медиа
interface IMediaItem {
  url: string;
  type: string;
  category?: string;
  blurhash?: string | undefined;
}

interface IProps {
  images: IMediaItem[];
  onImageClick: (index: number) => void;
}

function MediaGalleryGridPatternItem({
  image,
  onImageClick,
  className
}: {
  image: IMediaItem | undefined;
  onImageClick: () => void;
  className?: string | undefined;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const MAX_RETRIES = 3;

  useEffect(() => {
    // Сбрасываем состояние при изменении URL изображения
    if (image) {
      setIsLoading(true);
      setHasError(false);
      setRetryCount(0);
      setImageLoaded(false);
    }
  }, [image?.url]);

  // Логируем блюр-хеш когда он доступен
  useEffect(() => {
    if (image?.blurhash && !imageLoaded) {
      console.log("Доступен блюр-хеш для изображения:", image.url);
      console.log("Блюр-хеш:", image.blurhash.substring(0, 20) + "...");
    }
  }, [image?.blurhash, image?.url, imageLoaded]);

  if (!image) return null;

  const isImage = image.type === "image";
  const isVideo = image.type === "video";

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);

    // Автоматически пытаемся перезагрузить изображение несколько раз
    if (retryCount < MAX_RETRIES) {
      setTimeout(() => {
        setIsLoading(true);
        setHasError(false);
        setRetryCount(prev => prev + 1);
      }, 1000); // Задержка перед повторной попыткой
    }
  };

  const imageUrl = useMemo(() => {
    // Добавляем параметр для предотвращения кэширования при ошибках
    const cacheBuster = hasError ? `?retry=${retryCount}` : "";
    return `${image.url}${cacheBuster}`;
  }, [image.url, hasError, retryCount]);

  return (
    <>
      {isImage ? (
        <button className={`${className} relative`} onClick={onImageClick}>
          {/* Показываем индикатор загрузки только если нет блюр-хеша */}
          {isLoading && !hasError && !imageLoaded && !image.blurhash && (
            <div className={styles.imageLoader}>
              <div className={styles.spinner}></div>
            </div>
          )}

          {/* Блюр-хеш плейсхолдер - показываем, если он есть и изображение ещё не загружено */}
          {!imageLoaded && image.blurhash && (
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ zIndex: 10 }}
            >
              <Blurhash
                hash={image.blurhash}
                width="100%"
                height="100%"
                resolutionX={32}
                resolutionY={32}
                punch={1}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  width: "100%",
                  height: "100%"
                }}
              />
            </div>
          )}

          <Image
            src={imageUrl}
            alt={image.category || "изображение"}
            fill
            className={`${styles.image} transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
            quality={70}
            loading="lazy"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 80vw"
            onLoadingComplete={() => {
              setIsLoading(false);
              setImageLoaded(true);
            }}
            onError={handleError}
            unoptimized={false}
            priority={false}
          />
          {hasError && retryCount >= MAX_RETRIES && (
            <div className={styles.imageError}>
              Не удалось загрузить изображение
            </div>
          )}
        </button>
      ) : isVideo ? (
        <button
          className={`${className} ${styles.videoContainer} relative`}
          onClick={onImageClick}
        >
          {/* Блюр-хеш плейсхолдер для видео - показываем, если он есть и видео ещё загружается */}
          {isLoading && image.blurhash && (
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ zIndex: 5 }}
            >
              <Blurhash
                hash={image.blurhash}
                width="100%"
                height="100%"
                resolutionX={32}
                resolutionY={32}
                punch={1}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  width: "100%",
                  height: "100%"
                }}
              />
            </div>
          )}

          <div className={styles.videoPlayerWrapper}>
            <VideoPlayer
              src={image.url}
              muted={true}
              autoPlay={true}
              loop={true}
              controls={false}
              startLevel={0}
              lockQuality={true}
              onLoadedData={() => setIsLoading(false)}
              onError={() => handleError()}
            />
          </div>

          <div className={styles.videoOverlay}>
            <div className={styles.playButton}>
              <FaRegCirclePlay />
            </div>
          </div>
          {hasError && retryCount >= MAX_RETRIES && (
            <div className={styles.videoError}>Не удалось загрузить видео</div>
          )}
        </button>
      ) : (
        <button className={`${className}`} onClick={onImageClick}>
          <div className={styles.unknownFileType}>
            {image.url.split("/").pop()}
          </div>
        </button>
      )}
    </>
  );
}

const MemoizedMediaGalleryGridPatternItem = React.memo(
  MediaGalleryGridPatternItem
);

function MediaGalleryGridPattern({ images, onImageClick }: IProps) {
  if (images.length === 0) return null;

  // Выводим в консоль наличие блюр-хеш для отладки
  useEffect(() => {
    console.log(
      "MediaGalleryGridPattern: Изображения с блюр-хешем:",
      images.filter(img => img.blurhash).length,
      "из",
      images.length
    );

    if (images.length > 0 && images.some(img => img.blurhash)) {
      console.log(
        "Пример блюр-хеша:",
        images.find(img => img.blurhash)?.blurhash
      );
    }
  }, [images]);

  const handleImageClick = useCallback(
    (index: number) => {
      onImageClick(index);
    },
    [onImageClick]
  );

  const compressedImages = useMemo(() => {
    return images.map(image => {
      if (!image || !image.url) return image;

      // Принудительно определяем тип элемента
      let type = image.type;
      const originalType = type;
      if (!type) {
        type = isVideoByUrl(image.url) ? "video" : "image";
      } else if (type === "image" && isVideoByUrl(image.url)) {
        // Если тип указан как "image", но URL похож на видео, исправляем
        console.log(
          `MediaGalleryGridPattern: Исправляем тип контента с image на video для URL: ${image.url}`
        );
        type = "video";
      }

      // Сохраняем blurhash, если он есть
      const blurhash = image.blurhash;

      // Для видео не проксируем, чтобы избежать проблем с CORS
      if (type === "video") {
        if (originalType !== type) {
          console.log(
            `MediaGalleryGridPattern: Определён тип video для URL: ${image.url}`
          );
        }
        return { ...image, type, blurhash } as IMediaItem;
      }

      // Для изображений из Yandex Cloud проксируем
      if (image.url.includes("storage.yandexcloud.net") && type === "image") {
        // Удаляем весь префикс Yandex Cloud
        const cloudPath = image.url.replace(
          /^https?:\/\/storage\.yandexcloud\.net\//,
          ""
        );
        const proxyUrl = `/api/image-proxy/${cloudPath}?width=900&height=450&quality=100`;
        console.log(
          `MediaGalleryGridPattern: Проксирование Yandex Cloud изображения: ${image.url} -> ${proxyUrl}, blurhash: ${blurhash ? "есть" : "нет"}`
        );
        return {
          ...image,
          type,
          url: proxyUrl,
          blurhash
        } as IMediaItem;
      }

      // Для других изображений тоже проксируем
      if (type === "image" && !image.url.startsWith("/api/image-proxy/")) {
        // Удаляем схему URL если она есть (http://, https://)
        const normalizedUrl = image.url.replace(/^https?:\/\//, "");
        const proxyUrl = `/api/image-proxy/${normalizedUrl}?width=900&height=450&quality=100`;
        console.log(
          `MediaGalleryGridPattern: Проксирование изображения: ${image.url} -> ${proxyUrl}, blurhash: ${blurhash ? "есть" : "нет"}`
        );
        return {
          ...image,
          type,
          url: proxyUrl,
          blurhash
        } as IMediaItem;
      }

      return { ...image, type, blurhash } as IMediaItem;
    });
  }, [images]);

  const slicedImages = useMemo(() => {
    const safeImages: IMediaItem[] = [...compressedImages];
    return {
      first: safeImages[0] || null,
      second: safeImages[1] || null,
      thirdFourth: safeImages.slice(2, 4),
      fifthEighth: safeImages.slice(4, 8),
      ninth: safeImages[8] || null
    };
  }, [compressedImages]);

  return (
    <div className={styles.gridPattern}>
      <div className={styles.col}>
        {slicedImages.first && (
          <MemoizedMediaGalleryGridPatternItem
            image={slicedImages.first}
            onImageClick={() => handleImageClick(0)}
            className={styles.horItem}
          />
        )}

        <div className={`${styles.quadroGridItem}`}>
          {slicedImages.fifthEighth.map((image, index) => (
            <MemoizedMediaGalleryGridPatternItem
              key={`${image?.url || ""}-${index}`}
              image={image}
              onImageClick={() => handleImageClick(index + 4)}
              className={styles.quadroGridItemImage}
            />
          ))}
        </div>
      </div>

      <div className={styles.col}>
        <div className={styles.colInner}>
          {slicedImages.second && (
            <MemoizedMediaGalleryGridPatternItem
              image={slicedImages.second}
              onImageClick={() => handleImageClick(1)}
              className={styles.verItem}
            />
          )}

          <div className={`${styles.doubleGridItem}`}>
            {slicedImages.thirdFourth.map((image, index) => (
              <MemoizedMediaGalleryGridPatternItem
                key={`${image?.url || ""}-${index}`}
                image={image}
                onImageClick={() => handleImageClick(index + 2)}
                className={styles.doubleGridItemImage}
              />
            ))}
          </div>
        </div>

        {slicedImages.ninth && (
          <MemoizedMediaGalleryGridPatternItem
            image={slicedImages.ninth}
            onImageClick={() => handleImageClick(8)}
            className={styles.horItem}
          />
        )}
      </div>
    </div>
  );
}

const MemoizedMediaGalleryGridPattern = React.memo(MediaGalleryGridPattern);

export default MemoizedMediaGalleryGridPattern;
