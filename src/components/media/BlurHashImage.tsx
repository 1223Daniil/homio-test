"use client";

import React, { useEffect, useState } from "react";

import { Blurhash } from "react-blurhash";
import Head from "next/head";
import Image from "next/image";

// Простая функция для проверки валидности блюр-хеша
function isValidBlurhash(hash?: string): boolean {
  // Блюр-хеш должен быть строкой и не пустой
  if (!hash || typeof hash !== "string" || hash.length < 6) return false;

  // Блюр-хеш имеет специфический формат, но проверка на длину и наличие
  // является достаточной для базовой валидации
  return true;
}

interface BlurHashImageProps {
  src: string;
  alt: string;
  blurhash?: string | undefined;
  onLoad?: () => void;
  priority?: boolean;
  quality?: number;
  className?: string | undefined;
  sizes?: string;
  isLCP?: boolean;
}

const BlurHashImage = React.memo(
  ({
    src,
    alt,
    blurhash,
    onLoad,
    priority = false,
    quality = 100,
    className = "",
    sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 60vw",
    isLCP = false
  }: BlurHashImageProps) => {
    const [loaded, setLoaded] = useState(false);
    const [validHash, setValidHash] = useState<string | undefined>(undefined);

    // Проверяем валидность блюр-хеша при загрузке и при изменении
    useEffect(() => {
      const isValid = isValidBlurhash(blurhash);
      setValidHash(isValid ? blurhash : undefined);
    }, [src, blurhash, alt]);

    const handleLoadComplete = () => {
      setLoaded(true);
      if (onLoad) onLoad();
    };

    const fetchPriorityValue = isLCP ? "high" : priority ? "high" : "auto";
    const loadingValue = isLCP || priority ? "eager" : "lazy";
    const imageQuality = isLCP ? Math.min(quality, 85) : quality;
    const imageSizes = isLCP
      ? "(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 70vw"
      : sizes;

    return (
      <>
        <div className="relative w-full h-full">
          {!loaded && !validHash && (
            <div className="absolute top-0 left-0 w-full h-full bg-gray-200"></div>
          )}
          {!loaded && validHash && !isLCP && (
            <Blurhash
              hash={validHash}
              width="100%"
              height="100%"
              resolutionX={32}
              resolutionY={32}
              punch={1}
              className="absolute top-0 left-0 w-full h-full"
            />
          )}

          <Image
            src={src}
            alt={alt}
            fill
            priority={isLCP || priority}
            quality={imageQuality}
            sizes={imageSizes}
            onLoadingComplete={handleLoadComplete}
            className={`${isLCP || priority ? "opacity-100" : `transition-opacity ${loaded ? "opacity-100" : "opacity-0"}`} ${className}`}
            fetchPriority={fetchPriorityValue}
            loading={loadingValue}
          />
        </div>
      </>
    );
  }
);

BlurHashImage.displayName = "BlurHashImage";

export default BlurHashImage;
