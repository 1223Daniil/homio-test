"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { useEffect, useRef, useState } from "react";

import Image from "next/image";
import { ProjectMedia } from "@/types/project";
import styles from "./AmenitiesAdaptiveSlider.module.css";

interface AmenitiesAdaptiveSliderProps {
  medias: {
    media: ProjectMedia;
    description?: string;
  }[];
}

const swiperOptions = {
  slidesPerView: 1,
  spaceBetween: 10,
  breakpoints: {
    375: {
      slidesPerView: 1.2
    },
    480: {
      slidesPerView: 1.5
    },
    768: {
      slidesPerView: 2
    }
  }
};

const AmenitiesAdaptiveSlider = ({ medias }: AmenitiesAdaptiveSliderProps) => {
  return (
    <Swiper className={styles.swiper} {...swiperOptions}>
      {medias.map(media => (
        <SwiperSlide key={media.media.id}>
          <SliderItem media={media.media} description={media.description} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default AmenitiesAdaptiveSlider;

interface SliderItemProps {
  media: ProjectMedia;
  description?: string | undefined;
}

function SliderItem({ media, description }: SliderItemProps) {
  const [compressedMedia, setCompressedMedia] = useState<ProjectMedia | null>(
    null
  );

  const imageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const width = imageContainerRef.current!.clientWidth * 2;
    const height = imageContainerRef.current!.clientHeight * 2;

    if (
      media &&
      media.url &&
      media.url.includes("storage.yandexcloud.net") &&
      media.type !== "video"
    ) {
      const cloudPath = media.url.replace(
        "https://storage.yandexcloud.net/",
        ""
      );
      setCompressedMedia({
        ...media,
        url: `/api/image-proxy/${cloudPath}?width=${width}&height=${height}&quality=100`
      });
    }
  }, [imageContainerRef.current]);

  return (
    <div className={styles.item}>
      <div className={styles.itemImage} ref={imageContainerRef}>
        <Image
          src={compressedMedia?.url || media.url}
          alt={description || ""}
          fill
          className={styles.image}
        />
      </div>
      {description && <p className={styles.description}>{description}</p>}
    </div>
  );
}
