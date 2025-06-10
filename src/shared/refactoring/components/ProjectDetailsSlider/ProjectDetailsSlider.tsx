// Убираем "use client" отсюда, он будет в SwiperComponent
// "use client";

// Импортируем только основные стили Swiper
import "swiper/css";

import { LuArrowRight, LuNavigation } from "react-icons/lu";

import BlurHashImage from "@/components/media/BlurHashImage";
import DeveloperBanner from "./DeveloperBanner";
import { FiMapPin } from "react-icons/fi";
import { IProjectDetailsSliderProps } from "./interfaces";
import { VideoPlayer } from "@/components/ui/VideoPlayer";
import dynamic from "next/dynamic";
import styles from "./ProjectDetailsSlider.module.css";
// Импортируем dynamic
import { useTranslations } from "next-intl";

// --- Компонент для статичного отображения первого слайда (LCP) ---
// Этот компонент не должен быть async и не должен иметь "use client"
// Он рендерится как часть loading fallback
const StaticHeroContent = ({ data }: IProjectDetailsSliderProps) => {
  // useTranslations можно использовать здесь, если ProjectDetailsSlider является клиентским
  // или если он обернут в <NextIntlClientProvider> при использовании в Server Component
  // Для простоты предполагаем, что он используется в контексте, где t доступен
  const t = useTranslations("ProjectDetails");
  const firstImage = data.project.images?.[0];

  const isVideo = (url: string | undefined): boolean => {
    // Добавляем проверку на undefined
    if (!url) return false;
    const videoExtensions = [".mp4", ".webm", ".m3u8"];
    return videoExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  // Логика для кнопки "Выбрать юнит" в статичной версии
  // Эта функция будет работать только на клиенте после гидратации
  const goToUnitsListStatic = () => {
    if (typeof window !== "undefined") {
      // Проверка на клиентскую сторону
      const unitsList = document.querySelector("#master-plan");
      if (unitsList) {
        unitsList.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  if (!firstImage) {
    return <div className={styles.sliderContainer}>No images available</div>;
  }

  const isFirstImageVideo = isVideo(firstImage.url);
  // isMobile определение лучше убрать из статичного компонента,
  // так как он может рендериться на сервере. Autoplay для видео LCP лучше включить.
  // const isMobile =
  //   typeof window !== "undefined" ? window.innerWidth < 768 : false;

  return (
    <div className={styles.sliderContainer}>
      <div className={`${styles.slider}`}>
        <div className={`${styles.slide}`}>
          {isFirstImageVideo ? (
            <VideoPlayer
              src={firstImage.url}
              className="w-full h-full"
              controls={false}
              autoPlay={true} // Включаем автоплей для LCP видео
              muted
              loop={true}
              // Poster можно добавить, если есть URL превью
              // poster={firstImage.blurhash ? generateBlurDataURL(firstImage.blurhash) : undefined}
            />
          ) : (
            <BlurHashImage
              src={firstImage.url}
              alt={firstImage.name || "Изображение проекта"}
              blurhash={firstImage.blurhash}
              quality={90}
              priority={true}
              isLCP={true}
              // className не нужен для shimmer
              // sizes определяется внутри BlurHashImage для isLCP
            />
          )}
        </div>
      </div>

      <div className={`${styles.sliderOverlay}`}>
        <DeveloperBanner developer={data.developer} />
        <div className={`${styles.projectDetails}`}>
          <div className={`${styles.projectDetailsContent}`}>
            <h4 className={`${styles.projectDetailsPrice}`}>
              {data.project.price}
            </h4>
            <h1 className={`${styles.projectDetailsName}`}>
              {data.project.name}
            </h1>
            <div className={`${styles.projectDetailsLocation}`}>
              <div className={`${styles.projectDetailsLocationItem}`}>
                <FiMapPin className={`${styles.locationIcon}`} />
                <span>{data.project.location}</span>
              </div>
              <div className={`${styles.projectDetailsLocationItem}`}>
                <LuNavigation className={`${styles.locationIcon}`} />
                <p>
                  <span>{data.project.beach.name}</span>
                  <span>{data.project.beach.distance}</span>
                </p>
              </div>
            </div>
          </div>
          <button
            className={`${styles.chooseFlatButton}`}
            onClick={goToUnitsListStatic}
          >
            <span>{t("buttons.selectUnit")}</span>
            <LuArrowRight />
          </button>
        </div>
        {/* Контролы и пагинация убраны */}
      </div>
    </div>
  );
};

// --- Основной экспортируемый компонент ---
// Оптимизируем: используем только один динамический импорт
const ProjectDetailsSlider = ({ data }: IProjectDetailsSliderProps) => {
  const SwiperComponent = dynamic(() => import("./SwiperSliderComponent"), {
    ssr: false,
    loading: () => <StaticHeroContent data={data} />
  });

  return <SwiperComponent data={data} />;
};

export default ProjectDetailsSlider;
