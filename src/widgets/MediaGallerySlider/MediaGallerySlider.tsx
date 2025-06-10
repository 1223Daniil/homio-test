import { Swiper, SwiperSlide } from "swiper/react";
import { useEffect, useMemo } from "react";

import { CgClose } from "react-icons/cg";
import Image from "next/image";
import SliderControl from "@/shared/components/SliderControl";
import { Swiper as SwiperType } from "swiper/types";
import { VideoPlayer } from "@/components/ui/VideoPlayer";
import styles from "./MediaGallerySlider.module.css";
import { useRef } from "react";
import { useState } from "react";
import { useTranslations } from "next-intl";

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

interface IMediaGallerySliderProps {
  isSliderOverlayShown: boolean;
  setIsSliderOverlayShown: (isSliderOverlayShown: boolean) => void;
  images: {
    url: string;
    type: string;
    category: string;
  }[];
  currentSliderImage: number;
  setCurrentSliderImage: (currentSliderImage: number) => void;
}

const MediaGallerySlider = ({
  isSliderOverlayShown,
  setIsSliderOverlayShown,
  images,
  currentSliderImage,
  setCurrentSliderImage
}: IMediaGallerySliderProps) => {
  const swiperRef = useRef<SwiperType | null>(null);
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>(
    {}
  );

  const t = useTranslations("UnitDetail.unit-modal");

  // Обрабатываем медиа для слайдера, оптимизируя URLs с указанными параметрами
  const processedImages = useMemo(() => {
    if (!images || images.length === 0) return [];

    return images.map(item => {
      if (!item || !item.url) return item;

      // Принудительно определяем тип элемента
      let type = item.type;
      if (!type) {
        type = isVideoByUrl(item.url) ? "video" : "image";
      } else if (type === "image" && isVideoByUrl(item.url)) {
        // Если тип указан как "image", но URL похож на видео, исправляем
        console.log(
          `MediaGallerySlider: Исправляем тип контента с image на video для URL: ${item.url}`
        );
        type = "video";
      }

      if (type === "video") {
        return { ...item, type };
      }

      if (item.url.includes("storage.yandexcloud.net") && type === "image") {
        const cloudPath = item.url.replace(
          /^https?:\/\/storage\.yandexcloud\.net\//,
          ""
        );
        const proxyUrl = `/api/image-proxy/${cloudPath}?width=1920&height=1080&quality=100`;
        console.log(
          `MediaGallerySlider: Проксирование Yandex Cloud изображения: ${item.url} -> ${proxyUrl}`
        );
        return {
          ...item,
          type,
          url: proxyUrl
        };
      }

      if (type === "image" && !item.url.startsWith("/api/image-proxy/")) {
        const normalizedUrl = item.url.replace(/^https?:\/\//, "");
        const proxyUrl = `/api/image-proxy/${normalizedUrl}?width=1920&height=1080&quality=100`;
        console.log(
          `MediaGallerySlider: Проксирование изображения: ${item.url} -> ${proxyUrl}`
        );
        return {
          ...item,
          type,
          url: proxyUrl
        };
      }

      return { ...item, type };
    });
  }, [images]);

  useEffect(() => {
    // Инициализируем состояние загрузки для всех изображений
    const initialLoadingState: Record<string, boolean> = {};
    processedImages.forEach(image => {
      initialLoadingState[image.url] = true;
    });
    setLoadingImages(initialLoadingState);
  }, [processedImages]);

  const handleImageLoaded = (url: string) => {
    setLoadingImages(prev => ({ ...prev, [url]: false }));
  };

  const handleImageError = (url: string) => {
    setLoadingImages(prev => ({ ...prev, [url]: false }));
  };

  useEffect(() => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(currentSliderImage, 0);
    }
  }, [currentSliderImage]);

  const swiperOptions = {
    onSwiper: (swiper: SwiperType) => {
      swiperRef.current = swiper;
      if (
        currentSliderImage > 0 &&
        currentSliderImage < processedImages.length
      ) {
        swiper.slideTo(currentSliderImage, 0);
      }
    },
    initialSlide: currentSliderImage,
    onSlideChange: (swiper: SwiperType) => {
      setCurrentSliderImage(swiper.activeIndex);
    }
  };

  const handlePrev = () => {
    swiperRef.current?.slidePrev();
  };

  const handleNext = () => {
    swiperRef.current?.slideNext();
  };

  const handleClose = () => {
    setIsSliderOverlayShown(false);
  };

  return (
    <div
      className={`${styles.sliderOverlay} ${isSliderOverlayShown ? styles.sliderOverlayShown : styles.sliderOverlayHidden}`}
    >
      <div className={`${styles.mediaGallerySlider}`}>
        <SliderControl
          className={`${styles.sliderControl} ${styles.sliderControlPrev}`}
          direction="prev"
          onClick={handlePrev}
        />
        <SliderControl
          className={`${styles.sliderControl} ${styles.sliderControlNext}`}
          direction="next"
          onClick={handleNext}
        />

        <div className={`${styles.close}`}>
          <button className={`${styles.closeButton}`} onClick={handleClose}>
            <CgClose />
            <span>{t("carousel.close")}</span>
          </button>
        </div>

        <Swiper {...swiperOptions} className={styles.swiper}>
          {processedImages.map(image => (
            <SwiperSlide key={image.url}>
              {image.type === "image" ? (
                <div className={styles.swiperSlide}>
                  {loadingImages[image.url] && (
                    <div className={styles.imageLoader}>
                      <div className={styles.spinner}></div>
                    </div>
                  )}
                  <Image
                    src={image.url}
                    alt={image.category || "изображение"}
                    fill
                    className={`${styles.image} ${loadingImages[image.url] ? styles.imageLoading : ""}`}
                    quality={100}
                    onLoadingComplete={() => handleImageLoaded(image.url)}
                    onError={() => handleImageError(image.url)}
                  />
                </div>
              ) : (
                <div className={styles.swiperSlide}>
                  <div className={styles.videoPlayerWrapper}>
                    <VideoPlayer
                      src={image.url}
                      autoPlay={true}
                      muted={true}
                      loop={true}
                      controls={true}
                      startLevel={0}
                      onLoadedData={() => handleImageLoaded(image.url)}
                      onError={() => handleImageError(image.url)}
                    />
                  </div>
                </div>
              )}
            </SwiperSlide>
          ))}
        </Swiper>

        <div className={`${styles.historyContainer}`}>
          <div className={`${styles.history}`}>
            <p>
              {currentSliderImage + 1}/{processedImages.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaGallerySlider;
