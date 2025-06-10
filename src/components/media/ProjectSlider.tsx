"use client";

import { Button, Card, CardBody } from "@heroui/react";
import {
  IconChevronLeft,
  IconChevronRight,
  IconMapPin
} from "@tabler/icons-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import Image from "next/image";
import { ProjectMedia } from "@/types/domain";
import React from "react";
import { VideoPlayer } from "@/components/ui/VideoPlayer";

// Функция для проксирования URL изображений
const getProxiedImageUrl = (
  imageUrl: string,
  width: number = 1920,
  height: number = 1080,
  quality: number = 90
): string => {
  if (!imageUrl) return "";

  // Пропускаем локальные изображения
  if (imageUrl.startsWith("/")) return imageUrl;

  // Пропускаем уже проксированные изображения
  if (imageUrl.startsWith("/api/image-proxy/")) {
    return imageUrl;
  }

  // Для изображений из Yandex Cloud
  if (imageUrl.includes("storage.yandexcloud.net")) {
    const cloudPath = imageUrl.replace(
      /^https?:\/\/storage\.yandexcloud\.net\//,
      ""
    );
    return `/api/image-proxy/${cloudPath}?width=${width}&height=${height}&quality=${quality}&format=webp`;
  }

  // Для остальных изображений
  const normalizedUrl = imageUrl.replace(/^https?:\/\//, "");
  return `/api/image-proxy/${normalizedUrl}?width=${width}&height=${height}&quality=${quality}&format=webp`;
};

interface AdaptiveContainerProps {
  children: React.ReactNode;
  className?: string;
}

function AdaptiveContainer({
  children,
  className = ""
}: AdaptiveContainerProps) {
  return (
    <div className={`w-full max-w-[1400px] mx-auto ${className}`}>
      {children}
    </div>
  );
}

interface ProjectSliderProps {
  media: any[];
  developer?:
    | {
        logo?: string | undefined;
        translations?:
          | Array<{
              name: string;
            }>
          | undefined;
      }
    | undefined;
  projectName: string;
  priceRange: string;
  location?:
    | {
        district: string;
        city: string;
        country: string;
      }
    | undefined;
  t: (key: string) => string;
  onUnitsSectionClick: () => void;
}

// Мемоизированный компонент для видеоплеера, чтобы избежать повторных рендеров
const MemoizedVideoPlayer = React.memo(
  ({
    slide,
    index,
    currentSlide,
    ...props
  }: {
    slide: any;
    index: number;
    currentSlide: number;
    handleVideoPlay: (url: string) => void;
    handleVideoEnded: (url: string) => void;
    handleVideoPause: (url: string) => void;
    handleImageLoaded: (url: string) => void;
    setAutoplayPaused: (paused: boolean) => void;
    videoRefs: React.MutableRefObject<{ [key: string]: HTMLVideoElement }>;
  }) => {
    const shouldRender = currentSlide === index;
    const [isLoading, setIsLoading] = useState(true);
    // Проверяем, является ли видео в формате HLS
    const isHlsVideo = slide.url.includes(".m3u8");

    // Показываем видеоплеер только если это текущий слайд
    if (!shouldRender) {
      return null;
    }

    return (
      <>
        {/* Показываем индикатор загрузки только если видео не HLS или HLS еще загружается */}
        {isLoading && !isHlsVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4" />
              <div className="text-white font-medium text-sm">
                Загрузка видео...
              </div>
            </div>
          </div>
        )}
        <VideoPlayer
          key={`video-${slide.url}-${index}`}
          src={slide.url}
          className="w-full h-full absolute inset-0"
          muted={true}
          autoPlay={true}
          loop={false}
          controls={false}
          poster={slide.thumbnailUrl || ""}
          onPlay={() => {
            props.handleVideoPlay(slide.url);
            props.setAutoplayPaused(true);
            setIsLoading(false);
          }}
          onEnded={() => {
            props.handleVideoEnded(slide.url);
            props.setAutoplayPaused(false);
          }}
          onPause={() => props.handleVideoPause(slide.url)}
          onLoadedData={() => {
            props.handleImageLoaded(slide.url);
            setIsLoading(false);
          }}
          onError={errorMsg => {
            console.warn("Ошибка видео:", errorMsg);
            setIsLoading(false);
          }}
          ref={el => {
            if (el && el.videoRef && el.videoRef.current) {
              props.videoRefs.current[slide.url] = el.videoRef.current;

              // Для HLS видео скрываем лоадер сразу после начала буферизации
              if (isHlsVideo && el.videoRef.current) {
                // Добавляем слушатель события буферизации
                const handleBuffering = () => {
                  setIsLoading(false);
                };

                // Слушаем события, связанные с буферизацией
                el.videoRef.current.addEventListener(
                  "loadedmetadata",
                  handleBuffering
                );

                // Очистка слушателя при размонтировании
                return () => {
                  if (el.videoRef.current) {
                    el.videoRef.current.removeEventListener(
                      "loadedmetadata",
                      handleBuffering
                    );
                  }
                };
              }
            }
          }}
        />
      </>
    );
  },
  // Функция сравнения для React.memo - обновляем только при изменении нужных props
  (prevProps, nextProps) => {
    // Обновляем только когда изменяется видимость (currentSlide === index)
    const wasVisible = prevProps.currentSlide === prevProps.index;
    const isVisible = nextProps.currentSlide === nextProps.index;

    // Если видимость не изменилась - предотвращаем ререндер
    return wasVisible === isVisible;
  }
);

// Устанавливаем отображаемое имя для отладки
MemoizedVideoPlayer.displayName = "MemoizedVideoPlayer";

export default function ProjectSlider({
  media,
  developer,
  projectName,
  priceRange,
  location,
  t,
  onUnitsSectionClick
}: ProjectSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideLoaded, setSlideLoaded] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [isVideoPlaying, setIsVideoPlaying] = useState<{
    [key: string]: boolean;
  }>({});
  const [autoplayPaused, setAutoplayPaused] = useState(false);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement }>({});
  const slideIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Медиа файлы для слайдера
  const bannerSlides = useMemo(() => {
    if (!media || media.length === 0) return [];

    return media
      .filter(m => m && m.category === "BANNER")
      .sort((a, b) => {
        // Сначала показываем обложку (isCover)
        if (a.isCover && !b.isCover) return -1;
        if (!a.isCover && b.isCover) return 1;

        // Затем сортируем по порядку
        const orderA = a.order !== undefined ? a.order : 0;
        const orderB = b.order !== undefined ? b.order : 0;
        return orderA - orderB;
      })
      .map(slide => {
        if (
          slide &&
          slide.url &&
          slide.url.includes("storage.yandexcloud.net") &&
          slide.type !== "video" // Добавляем проверку на видео
        ) {
          // Преобразуем URL только для изображений
          const cloudPath = slide.url.replace(
            "https://storage.yandexcloud.net/",
            ""
          );
          return {
            ...slide,
            url: `/api/image-proxy/${cloudPath}?width=1920&height=1080&quality=100`
          };
        }
        return slide;
      });
  }, [media]);

  // Очистка неиспользуемых видео при смене слайда
  useEffect(() => {
    // Очищаем видеоэлементы, которые не отображаются сейчас
    Object.entries(videoRefs.current).forEach(([url, videoElement]) => {
      // Проверяем, что это не текущий слайд
      const isCurrentVideo = bannerSlides[currentSlide]?.url === url;

      if (!isCurrentVideo && videoElement) {
        // Останавливаем и очищаем ресурсы неиспользуемых видео
        try {
          videoElement.pause();
          videoElement.removeAttribute("src");
          videoElement.load();
        } catch (e) {
          console.warn("Ошибка при очистке видео:", e);
        }
      }
    });
  }, [currentSlide, bannerSlides]);

  // Очистка всех видео при размонтировании компонента
  useEffect(() => {
    return () => {
      // Очищаем все видео при размонтировании
      Object.values(videoRefs.current).forEach(videoElement => {
        try {
          if (videoElement) {
            videoElement.pause();
            videoElement.removeAttribute("src");
            videoElement.load();
          }
        } catch (e) {
          console.warn("Ошибка при очистке видео при размонтировании:", e);
        }
      });
      // Очищаем ссылки
      videoRefs.current = {};
    };
  }, []);

  // Инициализируем состояние загрузки для каждого слайда
  useEffect(() => {
    // Проверяем, что bannerSlides существует и не пустой
    if (bannerSlides && bannerSlides.length > 0) {
      const initialLoadState: { [key: string]: boolean } = {};
      const initialVideoState: { [key: string]: boolean } = {};

      bannerSlides.forEach(slide => {
        if (slide && slide.url) {
          // Предварительно отмечаем все слайды как загруженные для обеспечения возможности навигации
          initialLoadState[slide.url] = true;
          if (slide.type === "video") {
            initialVideoState[slide.url] = false;
          }
        }
      });

      console.log(
        "Слайдер: Инициализированы состояния загрузки для",
        bannerSlides.length,
        "слайдов"
      );
      setSlideLoaded(initialLoadState);
      setIsVideoPlaying(initialVideoState);
    }
  }, [bannerSlides.length]);

  // Функции для навигации по слайдам - упрощаем логику, чтобы слайды гарантированно переключались
  const nextSlide = useCallback(() => {
    const nextIndex =
      currentSlide === bannerSlides.length - 1 ? 0 : currentSlide + 1;

    // Проверяем, что у нас есть слайды для переключения
    if (bannerSlides.length <= 1) return;

    // Если текущий слайд - видео, останавливаем его
    const currentSlideItem = bannerSlides[currentSlide];
    if (
      currentSlideItem &&
      currentSlideItem.type === "video" &&
      videoRefs.current &&
      videoRefs.current[currentSlideItem.url]
    ) {
      const videoElement = videoRefs.current[currentSlideItem.url];
      if (videoElement && typeof videoElement.pause === "function") {
        videoElement.pause();
        // Сбрасываем время воспроизведения
        videoElement.currentTime = 0;
        // Освобождаем ресурсы
        videoElement.src = "";
        videoElement.load();
      }
    }

    // Переключаем слайд без проверки на загрузку
    setCurrentSlide(nextIndex);

    // Приостанавливаем автопереключение на 5 секунд
    setAutoplayPaused(true);
    setTimeout(() => {
      setAutoplayPaused(false);
    }, 5000);
  }, [bannerSlides, currentSlide]);

  const prevSlide = useCallback(() => {
    const prevIndex =
      currentSlide === 0 ? bannerSlides.length - 1 : currentSlide - 1;

    // Проверяем, что у нас есть слайды для переключения
    if (bannerSlides.length <= 1) return;

    // Если текущий слайд - видео, останавливаем его
    const currentSlideItem = bannerSlides[currentSlide];
    if (
      currentSlideItem &&
      currentSlideItem.type === "video" &&
      videoRefs.current &&
      videoRefs.current[currentSlideItem.url]
    ) {
      const videoElement = videoRefs.current[currentSlideItem.url];
      if (videoElement && typeof videoElement.pause === "function") {
        videoElement.pause();
        // Сбрасываем время воспроизведения
        videoElement.currentTime = 0;
        // Освобождаем ресурсы
        videoElement.src = "";
        videoElement.load();
      }
    }

    // Переключаем слайд без проверки на загрузку
    setCurrentSlide(prevIndex);

    // Приостанавливаем автопереключение на 5 секунд
    setAutoplayPaused(true);
    setTimeout(() => {
      setAutoplayPaused(false);
    }, 5000);
  }, [bannerSlides, currentSlide]);

  // Обработчик загрузки изображения
  const handleImageLoaded = useCallback((url: string) => {
    if (!url) return;

    setSlideLoaded(prev => {
      // Проверяем, было ли уже установлено значение true для этого URL
      if (prev[url] === true) return prev;
      return { ...prev, [url]: true };
    });
  }, []);

  // Обработчик начала воспроизведения видео
  const handleVideoPlay = useCallback((url: string) => {
    setIsVideoPlaying(prev => ({ ...prev, [url]: true }));
  }, []);

  // Обработчик окончания воспроизведения видео
  const handleVideoEnded = useCallback(
    (url: string) => {
      setIsVideoPlaying(prev => ({ ...prev, [url]: false }));
      // Автоматически переключаем на следующий слайд
      nextSlide();
    },
    [nextSlide]
  );

  // Обработчик паузы воспроизведения видео
  const handleVideoPause = useCallback((url: string) => {
    setIsVideoPlaying(prev => ({ ...prev, [url]: false }));
  }, []);

  // Управление автоматической сменой слайдов
  useEffect(() => {
    // Проверяем, что bannerSlides существует и содержит более одного элемента
    if (!bannerSlides || bannerSlides.length <= 1) return;

    // Очистим предыдущий интервал если он существует
    if (slideIntervalRef.current) {
      clearInterval(slideIntervalRef.current);
    }

    // Проверим текущий слайд
    const currentSlideItem = bannerSlides[currentSlide];

    // Проверка на undefined
    if (!currentSlideItem || !currentSlideItem.url) return;

    const isCurrentVideo = currentSlideItem.type === "video";

    // Если текущий слайд - видео, не устанавливаем интервал
    if (isCurrentVideo || autoplayPaused) {
      return;
    }

    // Устанавливаем новый интервал
    slideIntervalRef.current = setInterval(() => {
      // Перед сменой слайда проверяем, что все необходимые ресурсы загружены
      const nextIndex =
        currentSlide === bannerSlides.length - 1 ? 0 : currentSlide + 1;
      const nextSlideItem = bannerSlides[nextIndex];

      // Проверка на undefined
      if (!nextSlideItem || !nextSlideItem.url) return;

      const nextSlideKey = nextSlideItem.url;

      if (slideLoaded[nextSlideKey]) {
        nextSlide();
      }
    }, 5000);

    return () => {
      if (slideIntervalRef.current) {
        clearInterval(slideIntervalRef.current);
      }
    };
  }, [
    currentSlide,
    nextSlide,
    slideLoaded,
    autoplayPaused,
    bannerSlides.length
  ]);

  return (
    <AdaptiveContainer className="px-0 shadow-xl hidden lg:block">
      <Card className="w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[650px] rounded-none overflow-hidden">
        <CardBody className="p-0 overflow-hidden relative">
          {/* Слайдер */}
          <div className="relative w-full h-full">
            {/* Проверяем наличие слайдов */}
            {bannerSlides && bannerSlides.length > 0 ? (
              <>
                {bannerSlides.map((slide, index) => (
                  <div
                    key={index}
                    className={`absolute w-full h-full transition-opacity duration-500 ${
                      currentSlide === index
                        ? "opacity-100"
                        : "opacity-0 pointer-events-none"
                    }`}
                  >
                    {slide && slide.type === "video" ? (
                      <>
                        {!slideLoaded[slide.url] && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                        {/* Используем мемоизированный компонент для видеоплеера */}
                        <MemoizedVideoPlayer
                          slide={slide}
                          index={index}
                          currentSlide={currentSlide}
                          handleVideoPlay={handleVideoPlay}
                          handleVideoEnded={handleVideoEnded}
                          handleVideoPause={handleVideoPause}
                          handleImageLoaded={handleImageLoaded}
                          setAutoplayPaused={setAutoplayPaused}
                          videoRefs={videoRefs}
                        />
                      </>
                    ) : slide ? (
                      <>
                        {!slideLoaded[slide.url] && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                        <Image
                          src={getProxiedImageUrl(slide.url)}
                          alt={projectName}
                          fill
                          priority={index < 3}
                          className="object-cover w-full h-full absolute inset-0"
                          onLoadingComplete={() => handleImageLoaded(slide.url)}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1920px"
                          quality={90}
                        />
                      </>
                    ) : null}
                  </div>
                ))}

                {/* Навигация по слайдеру (точки внизу) */}
                {bannerSlides.length > 1 && (
                  <div className="absolute bottom-20 left-0 right-0 flex justify-center gap-2">
                    {bannerSlides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setCurrentSlide(index);
                          setAutoplayPaused(true);
                          setTimeout(() => {
                            setAutoplayPaused(false);
                          }, 5000);
                        }}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          currentSlide === index
                            ? "bg-white"
                            : "bg-white/50 hover:bg-white/70"
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                )}

                {/* Кнопки навигации (стрелки по бокам) */}
                {bannerSlides.length > 1 && (
                  <>
                    <button
                      onClick={prevSlide}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full"
                      aria-label="Previous slide"
                    >
                      <IconChevronLeft size={24} />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full"
                      aria-label="Next slide"
                    >
                      <IconChevronRight size={24} />
                    </button>
                  </>
                )}
              </>
            ) : (
              // Показываем заглушку, если нет слайдов
              <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <p className="text-xl font-medium">{t("noImages")}</p>
                </div>
              </div>
            )}

            {/* Оверлей с логотипом */}
            <div className="absolute top-4 right-4 bg-white rounded-full size-12 overflow-hidden">
              <div className="size-full relative flex items-center justify-center overflow-hidden">
                <Image
                  src={
                    developer?.logo &&
                    developer.logo.includes("storage.yandexcloud.net")
                      ? getProxiedImageUrl(developer.logo, 96, 96, 90)
                      : developer?.logo || "/vip-logo.png"
                  }
                  alt={
                    developer?.translations?.[0]?.name || "DEVELOPER UNKNOWN"
                  }
                  fill
                  className="object-cover"
                  loading="eager"
                  sizes="48px"
                />
              </div>
            </div>

            {/* Основная информация (если есть слайды) */}
            {bannerSlides && bannerSlides.length > 0 && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-8 shadow-lg">
                {/* Название проекта */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-sm">
                  {projectName || "PROJECT UNTITLED"}
                </h1>

                {/* Цена */}
                <div className="text-xl text-white mb-4 drop-shadow-sm">
                  {priceRange || t("units.priceOnRequest")}
                </div>

                {/* Локация */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <IconMapPin
                      size={20}
                      className="text-white drop-shadow-sm"
                    />
                    <span className="text-white drop-shadow-sm">
                      {location
                        ? `${location.district}, ${location.city}, ${location.country}`
                        : t("location.unknown")}
                    </span>
                  </div>
                </div>

                {/* Кнопка выбора квартиры */}
                <div className="mt-4">
                  <Button
                    color="primary"
                    variant="solid"
                    onClick={() => {
                      const infrastructureSection =
                        document.getElementById("infrastructure");

                      if (infrastructureSection) {
                        infrastructureSection.scrollIntoView({
                          behavior: "smooth",
                          block: "nearest"
                        });
                      }
                    }}
                    className="shadow-md hover:shadow-lg transition-shadow"
                  >
                    {t("buttons.selectUnit")}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </AdaptiveContainer>
  );
}
