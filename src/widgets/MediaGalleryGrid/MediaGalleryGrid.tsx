import { useMemo, useState } from "react";

import MediaGalleryGridPattern from "@/shared/components/MediaGalleryGridPattern";
import MediaGallerySlider from "../MediaGallerySlider";
import styles from "./MediaGalleryGrid.module.css";

interface IProps {
  images: {
    url: string;
    type: string;
    category: string;
    interior: boolean;
  }[];
  filter: "all" | "interior" | "exterior";
}

const MediaGalleryGrid = ({ images, filter }: IProps) => {
  const [isSliderOverlayShown, setIsSliderOverlayShown] = useState(false);
  const [currentSliderImage, setCurrentSliderImage] = useState<number>(0);

  const filteredImages = useMemo(() => {
    return images.filter(image => {
      if (filter === "all") return true;
      if (filter === "exterior") return !image.interior;
      return image.interior === (filter === "interior");
    });
  }, [images, filter]);

  const patternsQty = Math.ceil(filteredImages.length / 9);

  const handleImageClick = (qty: number) => {
    return (index: number) => {
      const imageIndex = qty * 9 + index;
      console.log("Opening slider with image index:", imageIndex);

      setCurrentSliderImage(imageIndex);
      setIsSliderOverlayShown(true);
    };
  };

  return (
    <div className={styles.mediaGalleryGrid}>
      {patternsQty > 0 && (
        <>
          {Array.from({ length: patternsQty }).map((_, index) => (
            <MediaGalleryGridPattern
              key={index}
              images={
                filteredImages.slice(
                  index * 9,
                  index * 9 + 9
                ) as typeof filteredImages
              }
              onImageClick={handleImageClick(index)}
            />
          ))}
        </>
      )}

      {filteredImages.length > 0 && (
        <MediaGallerySlider
          isSliderOverlayShown={isSliderOverlayShown}
          setIsSliderOverlayShown={setIsSliderOverlayShown}
          images={filteredImages}
          currentSliderImage={currentSliderImage}
          setCurrentSliderImage={setCurrentSliderImage}
        />
      )}
    </div>
  );
};

export default MediaGalleryGrid;
