"use client";

// Импортируем только необходимые стили
import "swiper/css";
// Импортируем только если действительно используем автоплей
import "swiper/css/autoplay";

import { LuArrowLeft, LuArrowRight, LuNavigation } from "react-icons/lu";
import { Swiper, SwiperSlide } from "swiper/react";
import { memo, useCallback, useState } from "react";

// Импортируем только необходимые модули Swiper
import { Autoplay } from "swiper/modules";
import BlurHashImage from "@/components/media/BlurHashImage";
import DeveloperBanner from "./DeveloperBanner";
import { FiMapPin } from "react-icons/fi";
import { IProjectDetailsSliderProps } from "./interfaces";
import SliderPagination from "../SliderPagination";
// Импортируем тип SwiperCore
import type { Swiper as SwiperCore } from "swiper/types";
import { VideoPlayer } from "@/components/ui/VideoPlayer";
import styles from "./ProjectDetailsSlider.module.css";
import { useTranslations } from "next-intl";

// Определяем тип для пропсов SlideItem
interface SlideItemProps {
  image: {
    name: string;
    url: string;
    type?: "image" | "video";
    blurhash?: string;
  };
  isLoaded: boolean;
  onLoad: (url: string) => void;
}

// Мемоизируем SlideItem для предотвращения ререндеров
const SlideItem = memo<SlideItemProps>(({ image, isLoaded, onLoad }) => {
  const isVideoFile = (url: string | undefined): boolean => {
    if (!url) return false;
    const videoExtensions = [".mp4", ".webm", ".m3u8"];
    return videoExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  const isVideo = isVideoFile(image.url);

  return (
    <div className={styles.slide}>
      {isVideo ? (
        <VideoPlayer
          src={image.url}
          className="w-full h-full"
          controls={false}
          muted
          loop={true}
          startLevel={0}
          lockQuality={true}
        />
      ) : (
        <BlurHashImage
          src={image.url}
          alt={image.name || "Изображение проекта"}
          blurhash={image.blurhash}
          priority={false}
          isLCP={false}
          quality={75}
          className={!isLoaded ? styles.shimmer : ""}
          onLoad={() => onLoad(image.url)}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 60vw"
        />
      )}
    </div>
  );
});

SlideItem.displayName = "SlideItem";

const SwiperSliderComponent = ({ data }: IProjectDetailsSliderProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  // Задаем правильный тип для состояния swiper
  const [swiper, setSwiper] = useState<SwiperCore | null>(null);
  // Типизируем состояние загруженных изображений
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const t = useTranslations("ProjectDetails");

  // Мемоизируем обработчики
  const goToUnitsList = useCallback(() => {
    const unitsList = document.querySelector("#master-plan");
    if (unitsList) {
      unitsList.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const handleNextSlide = useCallback(() => {
    swiper?.slideNext();
  }, [swiper]);

  const handlePrevSlide = useCallback(() => {
    swiper?.slidePrev();
  }, [swiper]);

  const handleImageLoad = useCallback(imageUrl => {
    setLoadedImages(prev => ({
      ...prev,
      [imageUrl]: true
    }));
  }, []);

  // Определяем мобильность один раз
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <div className={styles.sliderContainer}>
      <div className={styles.slider}>
        <Swiper
          onSwiper={setSwiper}
          slidesPerView={1}
          spaceBetween={10}
          className={styles.swiper}
          onSlideChange={(swiperInstance: SwiperCore) => {
            setCurrentSlide(swiperInstance.activeIndex);
          }}
          modules={[Autoplay]}
          autoplay={
            !isMobile && {
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true
            }
          }
          initialSlide={0}
        >
          {data.project.images.map((image, index) => (
            <SwiperSlide key={image.url}>
              <SlideItem
                image={image}
                isLoaded={loadedImages[image.url]}
                onLoad={handleImageLoad}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className={styles.sliderOverlay}>
        <DeveloperBanner developer={data.developer} />
        <div className={styles.projectDetails}>
          <div className={styles.projectDetailsContent}>
            <h4 className={styles.projectDetailsPrice}>{data.project.price}</h4>
            <h1 className={styles.projectDetailsName}>{data.project.name}</h1>
            <div className={styles.projectDetailsLocation}>
              <div className={styles.projectDetailsLocationItem}>
                <FiMapPin className={styles.locationIcon} />
                <span>{data.project.location}</span>
              </div>
              <div className={styles.projectDetailsLocationItem}>
                <LuNavigation className={styles.locationIcon} />
                <p>
                  <span>{data.project.beach.name}</span>
                  <span>{data.project.beach.distance}</span>
                </p>
              </div>
            </div>
          </div>
          <button className={styles.chooseFlatButton} onClick={goToUnitsList}>
            <span>{t("buttons.selectUnit")}</span>
            <LuArrowRight />
          </button>
        </div>
        <div className={styles.controls}>
          <div className={styles.controlsContent}>
            <SliderPagination
              totalSlides={data.project.images.length}
              currentSlide={currentSlide}
            />
            <div className={styles.controlButtons}>
              <button
                className={styles.controlButton}
                onClick={handlePrevSlide}
                aria-label="Предыдущий слайд"
              >
                <LuArrowLeft className={styles.controlButtonIcon} />
              </button>
              <button
                className={styles.controlButton}
                onClick={handleNextSlide}
                aria-label="Следующий слайд"
              >
                <LuArrowRight className={styles.controlButtonIcon} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwiperSliderComponent;
