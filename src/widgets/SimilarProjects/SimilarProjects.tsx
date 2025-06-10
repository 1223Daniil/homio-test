"use client";

import "swiper/css";

import { Developer, Project } from "@prisma/client";
import { Swiper, SwiperSlide } from "swiper/react";
import { useLocale, useTranslations } from "next-intl";

import SliderControl from "@/shared/components/SliderControl";
import type { Swiper as SwiperType } from "swiper";
import UnitSimilarProject from "@/entites/UnitSimilarProject";
import { formatNumberType } from "@/utils/formatPrice";
import styles from "./SimilarProjects.module.css";
import { useRef } from "react";

// Функция для проксирования URL изображений
const getProxiedImageUrl = (imageUrl: string): string => {
  if (!imageUrl || imageUrl.startsWith("/images/")) return imageUrl;

  // Для изображений из Yandex Cloud
  if (imageUrl.includes("storage.yandexcloud.net")) {
    const cloudPath = imageUrl.replace(
      /^https?:\/\/storage\.yandexcloud\.net\//,
      ""
    );
    return `/api/image-proxy/${cloudPath}?width=400&height=300&quality=80`;
  }

  // Пропускаем уже проксированные изображения
  if (imageUrl.startsWith("/api/image-proxy/")) {
    return imageUrl;
  }

  // Для остальных изображений
  const normalizedUrl = imageUrl.replace(/^https?:\/\//, "");
  return `/api/image-proxy/${normalizedUrl}?width=400&height=300&quality=80`;
};

type SimilarProject = Project & {
  developer: Developer;
  location: Location & { city?: string; district?: string };
  translations?: { locale: string; name: string }[];
  media?: { url: string }[];
  price?: { from: string; to: string; currency: string };
  distance?: string;
  formattedData?: {
    id: string;
    title: string;
    projectImage: string;
    developerImage: string;
    price: { from: string; to: string };
    location: string;
    distance: string;
  };
  blurhash?: string;
};

interface IProps {
  similarProjects: SimilarProject[];
}

const SimilarProjects = ({ similarProjects }: IProps) => {
  const swiperRef = useRef<SwiperType>();

  const t = useTranslations("UnitDetail.similar-projects");
  const tProjects = useTranslations("Projects");
  const tCurrency = useTranslations("projects.currency.symbols");
  const tAmount = useTranslations("Amounts");
  const locale = useLocale();

  const swiperOptions = {
    spaceBetween: 16,
    slidesPerView: "auto",
    breakpoints: {
      375: {
        slidesPerView: 1.15,
        spaceBetween: 16
      },
      390: {
        slidesPerView: 1.2,
        spaceBetween: 16
      },
      414: {
        slidesPerView: 1.25,
        spaceBetween: 16
      },
      480: {
        slidesPerView: 1.3,
        spaceBetween: 16
      },
      540: {
        slidesPerView: 1.35,
        spaceBetween: 16
      },
      600: {
        slidesPerView: 1.4,
        spaceBetween: 16
      },
      1280: {
        slidesPerView: 2.1,
        spaceBetween: 16
      },
      1600: {
        slidesPerView: 2.25,
        spaceBetween: 20
      }
    },
    onSwiper: (swiper: SwiperType) => {
      swiperRef.current = swiper;
    }
  };

  const handlePrev = () => {
    if (swiperRef.current) {
      swiperRef.current.slidePrev();
    }
  };

  const handleNext = () => {
    if (swiperRef.current) {
      swiperRef.current.slideNext();
    }
  };

  console.log(similarProjects);

  return (
    <div className={`${styles.similarProjects}`}>
      <h3 className={`${styles.title}`}>{t("title")}</h3>

      <Swiper {...swiperOptions} className={`${styles.swiper}`}>
        {similarProjects.length > 0 && (
          <>
            <SliderControl
              direction="prev"
              onClick={handlePrev}
              className={`${styles.prevButton} ${styles.control} ${swiperRef.current?.isBeginning ? styles.controlDisabled : ""}`}
            />
            <SliderControl
              direction="next"
              onClick={handleNext}
              className={`${styles.nextButton} ${styles.control} ${swiperRef.current?.isEnd ? styles.controlDisabled : ""}`}
            />
          </>
        )}

        {similarProjects.length > 0 ? (
          similarProjects.map((project, index) => {
            const minPriceFormatted = formatNumberType(
              Number(project.price?.from)
            );
            const maxPriceFormatted = formatNumberType(
              Number(project.price?.to)
            );

            // Получаем и проксируем URL изображений
            const developerImage =
              project.developer?.logo || "/images/no_image.png";
            const projectImage =
              project.media && project.media.length > 0 && project.media[0]
                ? project.media[0].url
                : "/images/no_image.png";

            const proxiedDeveloperImage = getProxiedImageUrl(developerImage);
            const proxiedProjectImage = getProxiedImageUrl(projectImage);

            let projectData = project.formattedData
              ? {
                  ...project.formattedData,
                  projectImage: proxiedProjectImage,
                  developerImage: project.formattedData.developerImage
                    ? getProxiedImageUrl(project.formattedData.developerImage)
                    : proxiedDeveloperImage
                }
              : {
                  developerImage: proxiedDeveloperImage,
                  projectImage: proxiedProjectImage,
                  title: project.translations?.[0]?.name || project.name || "",
                  price: {
                    from: `${minPriceFormatted.number}`,
                    to: `111`,
                    currency: project.price?.currency || "USD"
                  },
                  location:
                    typeof project.location === "string"
                      ? project.location
                      : `${project.location?.city || ""}, ${
                          project.location?.district || ""
                        }`,
                  distance: project.distance || "N/A"
                };

            projectData = {
              ...projectData,
              price: {
                from: `${tCurrency(project.price?.currency || "USD")}${minPriceFormatted.number}${minPriceFormatted.type ? tAmount(minPriceFormatted.type) : ""}`,
                to: `${tCurrency(project.price?.currency || "USD")}${maxPriceFormatted.number}${maxPriceFormatted.type ? tAmount(maxPriceFormatted.type) : ""}`,
                currency: project.price?.currency || "USD"
              },
              blurhash: project.media?.[0]?.blurhash || "",
              id: project.id
            };

            return (
              <SwiperSlide key={index}>
                <UnitSimilarProject projectData={projectData as any} />
              </SwiperSlide>
            );
          })
        ) : (
          <p>{t("no-projects")}</p>
        )}
      </Swiper>
    </div>
  );
};

export default SimilarProjects;
