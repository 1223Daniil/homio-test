"use client";

import React, { useState } from "react";

import Image from "next/image";

interface ImageWithLoaderProps {
  src: string;
  alt: string;
  onLoad?: () => void;
  priority?: boolean;
  quality?: number;
  className?: string | undefined;
  loaderClassName?: string | undefined;
  shimmerClassName?: string | undefined;
}

const ImageWithLoader = React.memo(
  ({
    src,
    alt,
    onLoad,
    priority = false,
    quality = 100,
    className = "",
    loaderClassName = "",
    shimmerClassName = ""
  }: ImageWithLoaderProps) => {
    const [loaded, setLoaded] = useState(false);

    const handleLoadComplete = () => {
      setLoaded(true);
      if (onLoad) onLoad();
    };

    return (
      <>
        {!loaded && (
          <div className={loaderClassName}>
            <div className={shimmerClassName}>
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
            </div>
          </div>
        )}
        <Image
          src={src}
          alt={alt}
          fill
          quality={quality}
          priority={priority}
          className={className}
          onLoadingComplete={handleLoadComplete}
        />
      </>
    );
  }
);

ImageWithLoader.displayName = "ImageWithLoader";

export default ImageWithLoader;
