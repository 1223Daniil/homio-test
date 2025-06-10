import "swiper/css";
import "swiper/css/free-mode";

import { Checkbox, Slider } from "@heroui/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { useCallback, useEffect, useMemo, useState } from "react";

import BlurHashImage from "@/components/media/BlurHashImage";
import Image from "next/image";
import SliderControl from "../SliderControl/SliderControl";
import { formatNumberType } from "@/utils/formatPrice";
import styles from "./Availability.module.css";
import { useLayouts } from "@/hooks/useLayouts";
import { useTranslations } from "next-intl";

// Функция для проксирования URL изображений
const getProxiedImageUrl = (
  imageUrl: string,
  width: number = 600,
  height: number = 400,
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
    return `/api/image-proxy/${cloudPath}?width=${width}&height=${height}&quality=${quality}`;
  }

  // Для остальных изображений
  const normalizedUrl = imageUrl.replace(/^https?:\/\//, "");
  return `/api/image-proxy/${normalizedUrl}?width=${width}&height=${height}&quality=${quality}`;
};

// Функция для получения blurhash из массива изображений макета
const getBlurhash = (layout: Layout, imageUrl: string): string | undefined => {
  // Проверка наличия изображений в макете
  if (!layout.images) {
    console.log(`Нет images для макета ${layout.name}`);
    return undefined;
  }

  try {
    // Преобразуем images в массив объектов
    let images: Array<{
      id: string;
      url: string;
      title?: string | null;
      blurhash?: string;
      isMain?: boolean;
    }> = [];

    if (typeof layout.images === "string") {
      try {
        const parsed = JSON.parse(layout.images);
        if (Array.isArray(parsed)) {
          images = parsed;
          console.log(
            `Успешно распарсили JSON в массив из ${images.length} элементов`
          );
        } else {
          console.log(
            `Строка images не является массивом после парсинга:`,
            parsed
          );
          return undefined;
        }
      } catch (jsonError) {
        console.error(`Ошибка парсинга JSON для layout.images:`, jsonError);
        return undefined;
      }
    } else if (Array.isArray(layout.images)) {
      images = layout.images;
      console.log(`Используем images как массив из ${images.length} элементов`);
    } else {
      console.log(`Неизвестный тип images:`, typeof layout.images);
      return undefined;
    }

    // Проверка, что массив не пустой
    if (images.length === 0) {
      console.log(`Пустой массив images для макета ${layout.name}`);
      return undefined;
    }

    // Логируем все изображения в массиве для отладки
    console.log(
      `Список изображений для ${layout.name}:`,
      images.map(img => ({
        url: img.url,
        blurhash: img.blurhash || "нет",
        isMain: img.isMain || false
      }))
    );

    // Ищем точное соответствие по URL
    const exactMatch = images.find(img => img && img.url === imageUrl);
    if (exactMatch && exactMatch.blurhash) {
      console.log(`Найдено точное соответствие по URL:`, exactMatch.url);
      return exactMatch.blurhash;
    }

    // Если точного соответствия нет, ищем по isMain
    const mainImage = images.find(img => img && img.isMain === true);
    if (mainImage && mainImage.blurhash) {
      console.log(`Найдено главное изображение с isMain=true:`, mainImage.url);
      return mainImage.blurhash;
    }

    // Если ничего не нашли, берем первое изображение с blurhash
    const firstWithBlurhash = images.find(img => img && img.blurhash);
    if (firstWithBlurhash) {
      console.log(
        `Используем первое изображение с blurhash:`,
        firstWithBlurhash.url
      );
      return firstWithBlurhash.blurhash;
    }

    console.log(
      `Не найдено ни одного изображения с blurhash для макета ${layout.name}`
    );
    return undefined;
  } catch (error) {
    console.error(`Ошибка в getBlurhash для макета ${layout.name}:`, error);
    return undefined;
  }
};

// Запасные блюр-хеши для разных типов макетов
const getFallbackBlurhash = (layoutName: string): string => {
  // Разные паттерны для разных типов планировок
  if (layoutName.includes("BEDROOM L")) {
    return "L9I}3n9at7of~qWBayWB-;WBD%M{"; // Светлый блюр-хеш для планировок с L
  } else if (layoutName.includes("BEDROOM M")) {
    return "LDHUtst7-;ofMxj[WBay%NM{RPjt"; // Блюр-хеш для M-планировок
  } else if (layoutName.includes("BEDROOM S")) {
    return "LiJ@R:j[fkj[?wfkfQj[RjfkM{WB"; // Блюр-хеш для S-планировок
  } else if (layoutName.includes("BEDROOM D")) {
    return "L6D8ES4T00M{tR?bIAoL9F%M-;of"; // Блюр-хеш для D-планировок
  } else if (layoutName.includes("BEDROOM P")) {
    return "LcHKGJD%ayj[~qRjayayIUR*M{M{"; // Блюр-хеш для P-планировок
  } else if (layoutName.includes("BEDROOM X")) {
    return "LeHBsCWBj[ay~qfQfQj[j[Rjt7WB"; // Блюр-хеш для X-планировок
  }

  // Универсальный запасной вариант
  return "LGF5?xYk^6#M@-5c,1J5@[or[Q6.";
};

interface Filter {
  type: string;
  price: number;
  totalArea: number;
  building: string;
}

interface Layout {
  id: string;
  name: string;
  bedrooms: number;
  bathrooms: number;
  totalArea: number;
  type: string;
  currency: string;
  minPrice: number;
  maxPrice: number;
  mainImage: string;
  mainImageBlurhash?: string | null;
  unitsCount: number;
  images?:
    | string
    | Array<{
        id: string;
        url: string;
        title?: string | null;
        blurhash?: string;
        isMain?: boolean;
      }>;
}

interface Building {
  id: string;
  name: string;
  floors: number;
  status: string;
  description: string;
  imageUrl: string | null;
  layouts: Layout[];
  project: {
    currency: string;
  };
}

interface AvailabilityProps {
  building?: Building;
  isPublic?: boolean;
}

const Availability = ({ building, isPublic = false }: AvailabilityProps) => {
  const {
    addLayout,
    clearLayouts,
    removeLayout,
    isLayoutSelected,
    selectedLayouts
  } = useLayouts();
  const [swiper, setSwiper] = useState<any | null>(null);

  const t = useTranslations("ProjectDetails.tabs.masterPlan.availability");
  const currencyT = useTranslations("projects.currency.symbols");
  const amountT = useTranslations("Amounts");

  const layouts = useMemo(() => {
    return building?.layouts || [];
  }, [building?.layouts]);

  useEffect(() => {
    if (!swiper || !layouts.length) return;

    if (selectedLayouts.length === 1 && selectedLayouts[0]?.id) {
      const selectedId = selectedLayouts[0]?.id;
      if (selectedId) {
        const layoutIndex = layouts.findIndex(
          layout => layout.id === selectedId
        );
        if (layoutIndex !== -1) {
          swiper.slideTo(layoutIndex);
        }
      }
      return;
    }
  }, [swiper, selectedLayouts, layouts]);

  const handleClearFilters = () => {
    clearLayouts();
  };

  const swiperOptions = {
    spaceBetween: 24,
    breakpoints: {
      1600: {
        slidesPerView: isPublic ? 2.55 : 2.55
      },
      1280: {
        slidesPerView: isPublic ? 2.55 : 2.05
      }
    },
    onSwiper: (swiperInstance: any) => {
      setSwiper(swiperInstance);
    }
  };

  const handleClickCheckbox = useCallback(
    (layout: { id: string; name: string }) => {
      if (isLayoutSelected(layout.id)) {
        removeLayout(layout.id);
      } else {
        addLayout(layout);
      }
    },
    [isLayoutSelected, addLayout, removeLayout]
  );

  const handlePrev = () => {
    swiper?.slidePrev();
  };

  const handleNext = () => {
    swiper?.slideNext();
  };

  const currency = building?.project?.currency;

  console.log(building?.layouts);
  // Отладка блюр-хешей для планировок
  if (building?.layouts && building.layouts.length > 0) {
    console.log(
      "Blurhash debug:",
      building.layouts.map(layout => ({
        name: layout.name,
        mainImageBlurhash: layout.mainImageBlurhash || "отсутствует",
        mainImage: layout.mainImage,
        hasImages: !!layout.images,
        imagesType: layout.images ? typeof layout.images : "отсутствует"
      }))
    );
  }

  return (
    <div className={`${styles.availability}`}>
      <div className={`${styles.header}`}>
        <h3>
          {t("title")}{" "}
          {building?.name ? `- ${t("building")} ${building.name}` : ""}
        </h3>

        <div className={`${styles.filters}`}>
          <button
            className={`${styles.clearFilters}`}
            onClick={handleClearFilters}
          >
            {t("clearFilters")}
          </button>
        </div>
      </div>

      <div className={`${styles.unitsList}`}>
        {layouts.length && (
          <>
            <SliderControl
              direction="prev"
              onClick={handlePrev}
              className={`${styles.sliderControl}`}
            />
            <SliderControl
              direction="next"
              onClick={handleNext}
              className={`${styles.sliderControl} ${styles.sliderControlNext}`}
            />
          </>
        )}
        {layouts.length > 0 ? (
          <Swiper {...swiperOptions}>
            {layouts.map(layout => {
              const minFormattedPrice = formatNumberType(layout.minPrice);
              const maxFormattedPrice = formatNumberType(layout.maxPrice);

              return (
                <SwiperSlide key={layout.id}>
                  <div className={`${styles.unit}`}>
                    <div className={`${styles.unitImage}`}>
                      <BlurHashImage
                        src={getProxiedImageUrl(layout.mainImage, 640, 480, 90)}
                        alt={layout.name}
                        blurhash={(() => {
                          // Подробное логирование для отладки выбора blurhash
                          console.log(
                            `Определение blurhash для ${layout.name}:`
                          );

                          // Проверяем mainImageBlurhash
                          const fromMain = layout.mainImageBlurhash;
                          console.log(
                            ` - mainImageBlurhash: ${fromMain === null ? "null" : fromMain === undefined ? "undefined" : fromMain}`
                          );

                          // Пробуем найти в images
                          const fromGetBlurhash = getBlurhash(
                            layout,
                            layout.mainImage
                          );
                          console.log(
                            ` - из getBlurhash: ${fromGetBlurhash === undefined ? "undefined" : fromGetBlurhash}`
                          );

                          // Запасной вариант в зависимости от типа планировки
                          const fallback = getFallbackBlurhash(layout.name);

                          // Выбираем первый доступный blurhash
                          const selectedBlurhash =
                            fromMain || fromGetBlurhash || fallback;
                          console.log(
                            ` - итоговый blurhash: ${selectedBlurhash}`
                          );

                          return selectedBlurhash;
                        })()}
                        className={`${styles.unitImage}`}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />

                      <Checkbox
                        isSelected={isLayoutSelected(layout.id)}
                        onValueChange={() => handleClickCheckbox(layout)}
                        className={`${styles.unitCheckbox}`}
                      />
                    </div>

                    <div className={`${styles.content}`}>
                      <div className={`${styles.unitName}`}>
                        <h3>
                          {building?.name} ⸱ {layout.type}
                        </h3>

                        <div className={`${styles.unitsCount}`}>
                          <p>
                            {layout.unitsCount} {t("layoutCard.units")}
                          </p>
                        </div>
                      </div>

                      <h4>
                        {layout.name.length > 20
                          ? layout.name.slice(0, 20) + "..."
                          : layout.name}
                      </h4>

                      <p className={`${styles.price}`}>
                        {currency &&
                          currencyT(
                            currency as
                              | "USD"
                              | "EUR"
                              | "THB"
                              | "IDR"
                              | "AED"
                              | "VND"
                              | "MYR"
                              | "SGD"
                          )}
                        {minFormattedPrice.number}
                        {minFormattedPrice.type &&
                          amountT(
                            minFormattedPrice.type as "thousand" | "million"
                          )}{" "}
                        –{" "}
                        {currency &&
                          currencyT(
                            currency as
                              | "USD"
                              | "EUR"
                              | "THB"
                              | "IDR"
                              | "AED"
                              | "VND"
                              | "MYR"
                              | "SGD"
                          )}
                        {maxFormattedPrice.number}
                        {maxFormattedPrice.type &&
                          amountT(
                            maxFormattedPrice.type as "thousand" | "million"
                          )}
                      </p>

                      <div className={`${styles.facts}`}>
                        <div className={`${styles.fact}`}>
                          <p className={`${styles.factTitle}`}>
                            {t("layoutCard.bedrooms")}
                          </p>
                          <p className={`${styles.factValue}`}>
                            {layout.bedrooms}
                          </p>
                        </div>
                        <div className={`${styles.fact}`}>
                          <p className={`${styles.factTitle}`}>
                            {t("layoutCard.bathrooms")}
                          </p>
                          <p className={`${styles.factValue}`}>
                            {layout.bathrooms}
                          </p>
                        </div>
                        <div className={`${styles.fact}`}>
                          <p className={`${styles.factTitle}`}>
                            {t("layoutCard.totalArea")}
                          </p>
                          <p className={`${styles.factValue}`}>
                            {layout.totalArea} {t("layoutCard.sqm")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        ) : (
          <div className={`${styles.noLayouts}`}>
            <p>{t("noLayouts")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Availability;
