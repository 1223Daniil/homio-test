import { Swiper, SwiperSlide } from "swiper/react";
import { useRef, useState } from "react";

import SimilarUnit from "@/entites/SimilarUnit";
import SliderControl from "@/shared/components/SliderControl";
import { Swiper as SwiperType } from "swiper/types";
import { Unit } from "@prisma/client";
import styles from "./SimilarUnits.module.css";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";

// Функция для проксирования URL изображений
const getProxiedImageUrl = (imageUrl: string): string => {
  if (!imageUrl) return "";

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

export type SimilarUnitsFormValues = {
  bedrooms: number;
  price: number;
  totalArea: number;
  offDate: number;
};

const defaultValues: SimilarUnitsFormValues = {
  bedrooms: 1,
  price: 1,
  totalArea: 1,
  offDate: 1
};

const SimilarUnitsPublic = ({ units }: { units: Unit[] }) => {
  const [isFiltersChanged, setIsFiltersChanged] = useState(false);

  const t = useTranslations("UnitDetail.similar-units");
  const tProjects = useTranslations("projects.currency.symbols");

  const swiperRef = useRef<SwiperType | null>(
    null
  ) as React.MutableRefObject<SwiperType | null>;

  const { register, watch } = useForm<SimilarUnitsFormValues>({
    defaultValues
  });

  const formValues = watch();

  // useEffect(() => {
  //   setIsFiltersChanged(true);

  //   getFilteredUnits({
  //     bedrooms: formValues.bedrooms,
  //     price: formValues.price,
  //     totalArea: formValues.totalArea,
  //     offDate: formValues.offDate
  //   }).then(units => {
  //     console.log(units);
  //   });
  // }, [formValues]);

  const swiperOptions = {
    spaceBetween: 16,
    breakpoints: {
      1920: {
        slidesPerView: 2.8
      },
      1700: {
        slidesPerView: 2.5
      },
      1600: {
        slidesPerView: 2.4
      },
      1400: {
        slidesPerView: 2.4
      },
      1280: {
        slidesPerView: 2.1
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

  console.log(units);

  return (
    <div className={`${styles.similarUnits} hidden md:block`}>
      <h4 className={`${styles.title}`}>{t("title")}</h4>

      {/* <SimilarUnitsFilters register={register} /> */}

      <div className={`${styles.swiperContainer}`}>
        {units.length > 0 && (
          <>
            <SliderControl
              direction="prev"
              className={`${styles.control} ${styles.prevButton}`}
              onClick={handlePrev}
            />
            <SliderControl
              direction="next"
              className={`${styles.control} ${styles.nextButton}`}
              onClick={handleNext}
            />
          </>
        )}

        <Swiper {...swiperOptions}>
          {units.length > 0 ? (
            units.map(unit => {
              // Получаем URL изображения
              const imageUrl =
                (unit as any)?.layout?.mainImage?.url?.includes(".m3u8") ||
                (unit as any)?.layout?.mainImage?.url?.includes(".mp4")
                  ? null
                  : (unit as any)?.layout?.mainImage?.url ||
                    (unit as any)?.layout?.images?.find(
                      image =>
                        !image.url.includes(".m3u8") &&
                        !image.url.includes(".mp4")
                    )?.url ||
                    (unit as any)?.project?.media?.find(
                      media =>
                        !media.url.includes(".m3u8") &&
                        !media.url.includes(".mp4")
                    )?.url;

              // Проксируем URL изображения
              const proxiedImageUrl = imageUrl
                ? getProxiedImageUrl(imageUrl)
                : "";

              const unitData = {
                unitLink: `/projects/${unit.projectId}/units/${unit.id}`,
                image: proxiedImageUrl, // Используем проксированный URL
                title:
                  (unit as any)?.layout?.type === "VILLA"
                    ? t("unit-card.title-villa", {
                        bed:
                          (unit as any).layout?.bedrooms || unit.bedrooms || 0,
                        area: (unit as any).layout?.totalArea || unit.area || 0
                      })
                    : t("unit-card.title", {
                        bed:
                          (unit as any).layout?.bedrooms || unit.bedrooms || 0,
                        area: (unit as any).layout?.totalArea || unit.area || 0,
                        floor: unit.floor || 0,
                        floors: (unit as any).building?.floors || 0
                      }),
                price: unit.price || 0,
                currency: tProjects((unit as any)?.project?.currency),
                area: (unit as any).layout?.totalArea || unit.area || 0
              };

              console.log(unitData, unit);

              return (
                <SwiperSlide key={unit.id}>
                  <SimilarUnit unit={unitData} />
                </SwiperSlide>
              );
            })
          ) : (
            <p>{t("no-units")}</p>
          )}
        </Swiper>
      </div>
    </div>
  );
};

export default SimilarUnitsPublic;
