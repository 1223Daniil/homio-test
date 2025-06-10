import styles from "./SliderPagination.module.css";

interface IProps {
  totalSlides: number;
  currentSlide: number;
  onSlideChange?: (slideIndex: number) => void;
}

const SliderPagination = ({
  totalSlides,
  currentSlide,
  onSlideChange
}: IProps) => {
  const maxDots = 5;
  const dotsToShow = Math.min(totalSlides, maxDots);

  let startIndex = 0;

  if (totalSlides <= maxDots) {
    startIndex = 0;
  } else {
    if (currentSlide < 2) {
      startIndex = 0;
    } else if (currentSlide >= totalSlides - 2) {
      startIndex = totalSlides - maxDots;
    } else {
      startIndex = currentSlide - 2;
    }
  }

  const handleDotClick = (slideIndex: number) => {
    if (onSlideChange) {
      onSlideChange(slideIndex);
    }
  };

  return (
    <div className={styles.sliderPagination}>
      {Array.from({ length: dotsToShow }).map((_, index) => {
        const slideIndex = startIndex + index;

        return (
          <div
            key={index}
            className={`${styles.dot} ${slideIndex === currentSlide ? styles.dotActive : ""}`}
            onClick={() => handleDotClick(slideIndex)}
          ></div>
        );
      })}
    </div>
  );
};

export default SliderPagination;
