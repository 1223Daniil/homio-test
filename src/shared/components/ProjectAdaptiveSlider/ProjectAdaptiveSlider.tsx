"use client";

import "swiper/css";

import { Swiper, SwiperSlide } from "swiper/react";
import { useMemo, useRef } from "react";

import Head from "next/head";
import Image from "next/image";
import { ProjectMedia } from "@prisma/client";
import { VideoPlayer } from "@/components/ui/VideoPlayer";
import styles from "./ProjectAdaptiveSlider.module.css";

interface Props {
  media: ProjectMedia[];
}

const swiperOptions = { slidesPerView: 1.01, spaceBetween: "2.13vw" };

// Функция для проксирования URL изображений
const getProxiedImageUrl = (
  imageUrl: string,
  width: number = 800,
  height: number = 600,
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

export default function ProjectAdaptiveSlider({ media }: Props) {
  const sliderRef = useRef<HTMLDivElement>(null);

  const compressedMedia = useMemo(() => {
    const width = sliderRef.current?.clientWidth ?? 640;
    const height = sliderRef.current?.clientHeight ?? 480;

    return media.map(item => {
      if (item && item.url && item.type !== "video") {
        return {
          ...item,
          url: getProxiedImageUrl(item.url, width, height, 90)
        };
      }
      return item;
    });
  }, [media]);

  // Получаем URL первого изображения для предзагрузки
  const firstImageUrl = compressedMedia[0]?.url || "";
  const isFirstImageVideo = compressedMedia[0]?.type === "video";
  const shouldPreloadFirstImage = !isFirstImageVideo && !!firstImageUrl;

  return (
    <>
      {shouldPreloadFirstImage && (
        <Head>
          <link
            rel="preload"
            href={firstImageUrl}
            as="image"
            fetchPriority="high"
            type="image/webp"
          />
        </Head>
      )}
      <div className={`${styles.slider}`} ref={sliderRef}>
        <Swiper {...swiperOptions}>
          {compressedMedia.map((mediaItem, index) => (
            <SwiperSlide key={mediaItem.id}>
              <div className={`${styles.slide}`}>
                {mediaItem.type === "video" ? (
                  <VideoPlayer
                    src={mediaItem.url || ""}
                    autoPlay
                    muted
                    loop
                    className={`${styles.image}`}
                  />
                ) : (
                  <Image
                    src={mediaItem.url || ""}
                    fill
                    priority={index === 0}
                    fetchPriority={index === 0 ? "high" : "auto"}
                    alt={mediaItem.title || ""}
                    className={`${styles.image}`}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 60vw"
                    quality={90}
                  />
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </>
  );
}
