import { Swiper, SwiperSlide } from "swiper/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import BlurHashImage from "@/components/media/BlurHashImage";
import { Blurhash } from "react-blurhash";
import Image from "next/image";
import ImageWithLoader from "@/components/media/ImageWithLoader";
import React from "react";
import SliderControl from "@/shared/components/SliderControl";
import { Swiper as SwiperType } from "swiper";
import { VideoPlayer } from "@/components/ui/VideoPlayer";
import styles from "./MediaSlider.module.css";

// Типы медиа
interface IMediaItem {
  id: string | number;
  url: string;
  title?: string;
  type?: "image" | "video";
  poster?: string;
  forThumbnail?: boolean; // Флаг для миниатюр пагинации
  blurhash?: string; // Добавляем поддержку blurhash
}

interface IProps {
  media: (IMediaItem & { blurhash?: string })[];
  pagination?: boolean;
}

// Константа для блюр-плейсхолдера
const BLUR_PLACEHOLDER =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YwZjBmMCIvPjwvc3ZnPg==";

// Функция для определения, является ли медиа видео по URL
const isVideoByUrl = (url: string): boolean => {
  if (!url) return false;

  const urlLower = url.toLowerCase();

  // Сначала проверяем расширения файлов изображений - они имеют приоритет
  if (
    urlLower.endsWith(".png") ||
    urlLower.endsWith(".jpg") ||
    urlLower.endsWith(".jpeg") ||
    urlLower.endsWith(".gif") ||
    urlLower.endsWith(".webp") ||
    urlLower.endsWith(".svg") ||
    urlLower.includes(".png?") ||
    urlLower.includes(".jpg?") ||
    urlLower.includes(".jpeg?") ||
    urlLower.includes(".gif?") ||
    urlLower.includes(".webp?") ||
    urlLower.includes(".svg?")
  ) {
    // Если файл имеет расширение изображения, это точно не видео
    return false;
  }

  // Затем проверяем видео-расширения и паттерны в URL
  return (
    urlLower.endsWith(".mp4") ||
    urlLower.endsWith(".webm") ||
    urlLower.endsWith(".m3u8") ||
    urlLower.endsWith(".mov") ||
    urlLower.includes(".mp4?") ||
    urlLower.includes(".webm?") ||
    urlLower.includes(".m3u8?") ||
    urlLower.includes(".mov?") ||
    urlLower.includes("/videos/") ||
    // Проверяем строго паттерны видео (только если они не в имени файла)
    (urlLower.includes("video/") && !urlLower.includes(".png")) ||
    (urlLower.includes("movie/") && !urlLower.includes(".png"))
  );
};

// Мемоизированный компонент для видеоплеера
const MemoizedVideoPlayer = React.memo(
  ({
    slide,
    index,
    currentSlide,
    ...props
  }: {
    slide: IMediaItem;
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
          poster={slide.poster || ""}
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

const ThumbnailItem = React.memo(
  ({ item, isActive }: { item: IMediaItem; isActive: boolean }) => {
    // Определяем, является ли элемент видео
    const isVideo = item.type === "video" || isVideoByUrl(item.url);

    // Проксируем только изображения, не видео
    if (!isVideo && item.url.includes("storage.yandexcloud.net")) {
      item.url = `/api/image-proxy/${item.url.replace(
        "?width=1600&height=900&quality=100",
        "?width=105&height=78&quality=80"
      )}`;
    }

    return (
      <div className={styles.paginationImage}>
        {isVideo ? (
          <>
            <div className={styles.paginationVideoWrapper}>
              {item.poster ? (
                <Image
                  src={item.poster}
                  alt={item.title || "Превью видео"}
                  fill
                  sizes="100px"
                  className="object-cover"
                  loading="eager"
                  placeholder="blur"
                  blurDataURL={BLUR_PLACEHOLDER}
                />
              ) : (
                <MemoizedThumbnailVideoPlayer item={item} />
              )}

              {/* Значок видео */}
              <div className={styles.videoIndicator}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M10 16.5L16 12L10 7.5V16.5Z" fill="currentColor" />
                </svg>
              </div>
            </div>
          </>
        ) : /* Для изображений используем компонент BlurHashImage, если есть blurhash */
        item.blurhash ? (
          <BlurHashImage
            src={item.url}
            alt={item.title || "Миниатюра"}
            blurhash={item.blurhash}
            onLoad={() => {}}
            priority={true}
            quality={70}
            className="object-cover"
          />
        ) : (
          /* Fallback для изображений без blurhash */
          <Image
            src={item.url}
            alt={item.title || "Миниатюра"}
            fill
            className="object-cover"
            loading="eager"
            placeholder="blur"
            quality={70}
            blurDataURL={BLUR_PLACEHOLDER}
          />
        )}
      </div>
    );
  },
  // Оптимизация ререндеров
  (prevProps, nextProps) => {
    return (
      prevProps.item.url === nextProps.item.url &&
      prevProps.isActive === nextProps.isActive
    );
  }
);

ThumbnailItem.displayName = "ThumbnailItem";

// Мемоизированный компонент для видеоплеера в пагинации с фиксированным низким качеством
const MemoizedThumbnailVideoPlayer = React.memo(
  ({ item }: { item: IMediaItem }) => {
    const [isLoading, setIsLoading] = useState(true);
    const isHlsVideo = item.url.includes(".m3u8");

    return (
      <>
        {isLoading && !isHlsVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <VideoPlayer
          key={`thumbnail-video-${item.url}`}
          src={item.url}
          className={styles.paginationVideoItem || ""}
          muted={true}
          autoPlay={false}
          loop={true}
          controls={false}
          startLevel={0} // Всегда самое низкое качество (240p)
          lockQuality={true} // Фиксируем качество
          onLoadedData={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
        />
      </>
    );
  }
);

MemoizedThumbnailVideoPlayer.displayName = "MemoizedThumbnailVideoPlayer";

const MediaSlider = ({ media, pagination = true }: IProps) => {
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
  const swiperRef = useRef<SwiperType | null>(null);
  const paginationSwiperRef = useRef<SwiperType | null>(null);

  // Обрабатываем медиа для основного слайдера, оптимизируя URLs с высоким качеством
  const processedMedia = useMemo(() => {
    if (!media || media.length === 0) return [];

    return media.map(item => {
      if (!item || !item.url) return item;

      // Принудительно определяем тип элемента
      // Если явно указан тип, используем его, иначе определяем по URL
      let type = item.type;
      if (!type) {
        type = isVideoByUrl(item.url) ? "video" : "image";
      } else if (type === "image" && isVideoByUrl(item.url)) {
        // Дополнительная проверка: если тип указан как "image", но URL похож на видео,
        // переопределяем тип на "video"
        console.log(
          `MediaSlider: Исправляем тип контента с image на video для URL: ${item.url}`
        );
        type = "video";
      }

      // Для изображений из Yandex Cloud используем прокси с высоким качеством для основного слайдера
      if (item.url.includes("storage.yandexcloud.net") && type === "image") {
        const cloudPath = item.url.replace(
          "https://storage.yandexcloud.net/",
          ""
        );
        return {
          ...item,
          type,
          url: `/api/image-proxy/${cloudPath}?width=1600&height=900&quality=100`
        };
      }

      // Для других случаев просто добавляем определенный тип
      return {
        ...item,
        type
      };
    });
  }, [media]);

  // Обрабатываем медиа для пагинации, оптимизируя URLs с низким качеством
  const processedThumbnailMedia = useMemo(() => {
    if (!media || media.length === 0) return [];

    return media.map(item => {
      if (!item || !item.url) return item;

      // Копируем логику определения типа из основного processedMedia
      let type = item.type;
      if (!type) {
        type = isVideoByUrl(item.url) ? "video" : "image";
      } else if (type === "image" && isVideoByUrl(item.url)) {
        type = "video";
      }

      // Создаем копию объекта для предотвращения мутаций
      const thumbnailItem = { ...item, type };

      // Для видео ВСЕГДА используем оригинальный URL, чтобы избежать проблем с CORS
      if (type === "video") {
        return thumbnailItem;
      }

      // Для изображений из Yandex Cloud используем прокси с низким качеством для пагинации
      if (item.url.includes("storage.yandexcloud.net") && type === "image") {
        const cloudPath = item.url.replace(
          "https://storage.yandexcloud.net/",
          ""
        );
        thumbnailItem.url = `/api/image-proxy/${cloudPath}?width=200&height=150&quality=80`;
      }

      return thumbnailItem;
    });
  }, [media]);

  // Очистка неиспользуемых видео при смене слайда
  useEffect(() => {
    // Очищаем видеоэлементы, которые не отображаются сейчас
    Object.entries(videoRefs.current).forEach(([url, videoElement]) => {
      // Проверяем, что это не текущий слайд
      const isCurrentVideo = processedMedia[currentSlide]?.url === url;

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
  }, [currentSlide, processedMedia]);

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
    // Проверяем, что processedMedia существует и не пустой
    if (processedMedia && processedMedia.length > 0) {
      const initialLoadState: { [key: string]: boolean } = {};
      const initialVideoState: { [key: string]: boolean } = {};

      processedMedia.forEach(slide => {
        if (slide && slide.url) {
          // Предварительно отмечаем все слайды как загруженные для обеспечения возможности навигации
          initialLoadState[slide.url] = true;
          if (slide.type === "video") {
            initialVideoState[slide.url] = false;
          }
        }
      });

      console.log(
        "MediaSlider: Инициализированы состояния загрузки для",
        processedMedia.length,
        "слайдов"
      );
      setSlideLoaded(initialLoadState);
      setIsVideoPlaying(initialVideoState);
    }
  }, [processedMedia.length]);

  // Функции для навигации по слайдам
  const nextSlide = useCallback(() => {
    if (!swiperRef.current || processedMedia.length <= 1) return;

    // Переключаем слайд
    swiperRef.current.slideNext();

    // Приостанавливаем автопереключение на 5 секунд
    setAutoplayPaused(true);
    setTimeout(() => {
      setAutoplayPaused(false);
    }, 5000);
  }, [processedMedia.length]);

  const prevSlide = useCallback(() => {
    if (!swiperRef.current || processedMedia.length <= 1) return;

    // Переключаем слайд
    swiperRef.current.slidePrev();

    // Приостанавливаем автопереключение на 5 секунд
    setAutoplayPaused(true);
    setTimeout(() => {
      setAutoplayPaused(false);
    }, 5000);
  }, [processedMedia.length]);

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
    // Проверяем, что processedMedia существует и содержит более одного элемента
    if (!processedMedia || processedMedia.length <= 1) return;

    // Очистим предыдущий интервал если он существует
    if (slideIntervalRef.current) {
      clearInterval(slideIntervalRef.current);
    }

    // Проверим текущий слайд
    const currentSlideItem = processedMedia[currentSlide];

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
        currentSlide === processedMedia.length - 1 ? 0 : currentSlide + 1;
      const nextSlideItem = processedMedia[nextIndex];

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
  }, [currentSlide, nextSlide, slideLoaded, autoplayPaused, processedMedia]);

  // Обработчик изменения слайда в Swiper
  const handleSlideChange = useCallback(() => {
    if (swiperRef.current) {
      const newIndex = swiperRef.current.activeIndex;
      setCurrentSlide(newIndex);

      // Обновляем пагинацию
      if (paginationSwiperRef.current) {
        paginationSwiperRef.current.slideTo(newIndex);
      }
    }
  }, []);

  // Оптимизированный обработчик клика на пагинации
  const handlePaginationClick = useCallback((index: number) => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(index);
      setCurrentSlide(index);

      // Приостанавливаем автопереключение на 5 секунд
      setAutoplayPaused(true);
      setTimeout(() => {
        setAutoplayPaused(false);
      }, 5000);
    }
  }, []);

  return (
    <div className={`!opacity-100`}>
      <Swiper
        slidesPerView={1}
        spaceBetween={0}
        className={styles.mainSwiper}
        onSwiper={swiper => {
          swiperRef.current = swiper;
        }}
        onSlideChange={handleSlideChange}
      >
        <SliderControl
          direction="prev"
          onClick={prevSlide}
          className={styles.prevButton}
        />
        <SliderControl
          direction="next"
          onClick={nextSlide}
          className={styles.nextButton}
        />

        {processedMedia.map((slide, index) => (
          <SwiperSlide key={index} className={styles.slide}>
            {slide && (slide.type === "video" || isVideoByUrl(slide.url)) ? (
              <>
                {!slideLoaded[slide.url] && (
                  <div className={styles.loaderContainer}>
                    <div className={styles.spinner}></div>
                  </div>
                )}
                {/* Используем мемоизированный компонент для видеоплеера */}
                <MemoizedVideoPlayer
                  slide={{ ...slide, type: "video" }} // Гарантируем, что тип = video
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
                {/* Используем BlurHashImage для изображений с blurhash */}
                {slide.blurhash ? (
                  <BlurHashImage
                    src={slide.url}
                    alt={slide.title || "Изображение"}
                    blurhash={slide.blurhash}
                    onLoad={() => handleImageLoaded(slide.url)}
                    priority={index < 3}
                    quality={100}
                    className={styles.slideImage}
                  />
                ) : (
                  // Fallback для изображений без blurhash
                  <ImageWithLoader
                    src={slide.url}
                    alt={slide.title || "Изображение"}
                    priority={index < 3}
                    quality={100}
                    className={styles.slideImage}
                    onLoad={() => handleImageLoaded(slide.url)}
                    loaderClassName={styles.loaderContainer}
                    shimmerClassName={styles.shimmerWrapper}
                  />
                )}
              </>
            ) : null}
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Пагинация */}
      {pagination && processedMedia.length > 1 && (
        <div className={styles.pagination}>
          <Swiper
            slidesPerView={5.5}
            spaceBetween={12}
            initialSlide={currentSlide}
            speed={200}
            breakpoints={{
              1600: { slidesPerView: 7.5 },
              1280: { slidesPerView: 5.5 },
              768: { slidesPerView: 4.5 }
            }}
            onSwiper={swiper => {
              paginationSwiperRef.current = swiper;
            }}
            className={styles.paginationSwiper}
          >
            {processedThumbnailMedia.map((item, index) => (
              <SwiperSlide key={index}>
                <div
                  className={`${styles.paginationItem} ${
                    currentSlide === index ? styles.paginationItemActive : ""
                  }`}
                  onClick={() => handlePaginationClick(index)}
                >
                  <ThumbnailItem
                    item={item}
                    isActive={currentSlide === index}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </div>
  );
};

export default MediaSlider;
