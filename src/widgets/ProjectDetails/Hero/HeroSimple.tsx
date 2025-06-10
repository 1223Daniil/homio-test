"use client";

import { LuArrowLeft, LuArrowRight, LuNavigation } from "react-icons/lu";
import { useCallback, useMemo, useState } from "react";

import BottomBar from "@/shared/refactoring/components/ProjectDetailsSlider/BottomBar/BottomBar";
import DeveloperBanner from "@/shared/refactoring/components/ProjectDetailsSlider/DeveloperBanner";
import { FiMapPin } from "react-icons/fi";
import { IProps } from "@/shared/refactoring/components/ProjectDetailsSlider/interfaces";
import Image from "next/image";
import sliderStyles from "@/shared/refactoring/components/ProjectDetailsSlider/ProjectDetailsSlider.module.css";
import { useTranslations } from "next-intl";

// Функция для проксирования URL изображений (скопирована из ProjectAdaptiveSlider)
const getProxiedImageUrl = (
  imageUrl: string,
  width: number = 1200, // Параметры по умолчанию для Hero (можно настроить)
  height: number = 800,
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

const HeroSimple = ({ data, bottomBar }: IProps) => {
  const images = data.project.images;
  const [current, setCurrent] = useState(0);
  const t = useTranslations("ProjectDetails");

  const handlePrev = useCallback(() => {
    setCurrent(prev => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    setCurrent(prev => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  const goToUnitsList = useCallback(() => {
    const unitsList = document.querySelector("#master-plan");
    if (unitsList) {
      unitsList.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // Мемоизируем обработанные изображения
  const processedImages = useMemo(() => {
    return images.map(img => ({
      ...img,
      url: getProxiedImageUrl(img.url) // Применяем проксирование
    }));
  }, [images]);

  return (
    <section id="hero" className={sliderStyles.sliderContainer}>
      <div className={sliderStyles.slider}>
        {processedImages.map((img, idx) => (
          <Image
            key={img.url}
            src={img.url}
            alt={img.name}
            fill
            priority={idx === 0}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              opacity: idx === current ? 1 : 0,
              transition: "opacity 0.5s ease-in-out",
              pointerEvents: idx === current ? "auto" : "none",
              zIndex: 0
            }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 60vw"
          />
        ))}
      </div>

      <div className={sliderStyles.sliderOverlay}>
        <DeveloperBanner developer={data.developer} />

        <div className={sliderStyles.projectDetails}>
          <h4 className={sliderStyles.projectDetailsPrice}>
            {data.project.price}
          </h4>
          <h1 className={sliderStyles.projectDetailsName}>
            {data.project.name}
          </h1>
          <div className={sliderStyles.projectDetailsLocation}>
            <div className={sliderStyles.projectDetailsLocationItem}>
              <FiMapPin className={sliderStyles.locationIcon} />
              <span>{data.project.location}</span>
            </div>
            <div className={sliderStyles.projectDetailsLocationItem}>
              <LuNavigation className={sliderStyles.locationIcon} />
              <p>
                <span>{data.project.beach.name}</span>{" "}
                <span>{data.project.beach.distance}</span>
              </p>
            </div>
          </div>
          <button
            className={sliderStyles.chooseFlatButton}
            onClick={goToUnitsList}
          >
            <span>{t("buttons.selectUnit")}</span>
            <LuArrowRight />
          </button>
        </div>

        <div className={sliderStyles.controls}>
          <div className={sliderStyles.controlsContent}>
            <div />
            <div className={sliderStyles.controlButtons}>
              <button
                type="button"
                onClick={handlePrev}
                className={sliderStyles.controlButton}
                aria-label="Предыдущий слайд"
              >
                <LuArrowLeft className={sliderStyles.controlButtonIcon} />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className={sliderStyles.controlButton}
                aria-label="Следующий слайд"
              >
                <LuArrowRight className={sliderStyles.controlButtonIcon} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <BottomBar data={bottomBar} />
    </section>
  );
};

export default HeroSimple;
