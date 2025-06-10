import { Swiper, SwiperSlide } from "swiper/react";

import { HiOutlineCube } from "react-icons/hi";
import { cn } from "@/lib/utils";
import styles from "./MediaFilters.module.css";
import { useTranslations } from "next-intl";

interface IProps extends React.HTMLAttributes<HTMLDivElement> {
  setIsOpen: (isOpen: {
    isOpen: boolean;
    view: "Gallery" | "Layout" | "3d" | null;
  }) => void;
}

const swiperOptions = {
  breakpoints: {
    375: {
      slidesPerView: 2.1,
      spaceBetween: 6
    },
    390: {
      slidesPerView: 2.2,
      spaceBetween: 8
    },
    414: {
      slidesPerView: 2.3,
      spaceBetween: 10
    },
    480: {
      slidesPerView: 2.5,
      spaceBetween: 12
    },
    540: {
      slidesPerView: 2.7,
      spaceBetween: 14
    },
    600: {
      slidesPerView: 2.9,
      spaceBetween: 16
    }
  }
};

const MediaFilters = ({ setIsOpen, className, ...props }: IProps) => {
  const t = useTranslations("UnitDetail");

  return (
    <div className={cn(styles.mediaFilters, className)} {...props}>
      <div className={styles.mediaFiltersContainer}>
        {icons.map((Icon, index) => (
          <button
            key={index}
            className={styles.mediaFiltersItem}
            onClick={() => setIsOpen({ isOpen: true, view: Icon.label })}
          >
            <Icon.icon />
            <p>{t(`modal-sections-buttons.${Icon.label.toLowerCase()}`)}</p>
          </button>
        ))}
      </div>

      <Swiper {...swiperOptions} className={styles.mediaFiltersSwiper}>
        {icons.map((Icon, index) => (
          <SwiperSlide key={index}>
            <button
              className={styles.mediaFiltersItem}
              onClick={() => setIsOpen({ isOpen: true, view: Icon.label })}
            >
              <Icon.icon />
              <p>{t(`modal-sections-buttons.${Icon.label.toLowerCase()}`)}</p>
            </button>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default MediaFilters;

export const GalleryIcon = () => {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.16667 16.5H14.8333C15.7538 16.5 16.5 15.7538 16.5 14.8333V3.16667C16.5 2.24619 15.7538 1.5 14.8333 1.5H3.16667C2.24619 1.5 1.5 2.24619 1.5 3.16667V14.8333C1.5 15.7538 2.24619 16.5 3.16667 16.5ZM3.16667 16.5L12.3333 7.33333L16.5 11.5M7.33333 6.08333C7.33333 6.77369 6.77369 7.33333 6.08333 7.33333C5.39298 7.33333 4.83333 6.77369 4.83333 6.08333C4.83333 5.39298 5.39298 4.83333 6.08333 4.83333C6.77369 4.83333 7.33333 5.39298 7.33333 6.08333Z"
        stroke="#414651"
        stroke-width="1.67"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
};

export const LayoutIcon = () => {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.66667 1.5H5.5C4.09987 1.5 3.3998 1.5 2.86503 1.77248C2.39462 2.01217 2.01217 2.39462 1.77248 2.86503C1.5 3.3998 1.5 4.09987 1.5 5.5V5.66667M5.66667 16.5H5.5C4.09987 16.5 3.3998 16.5 2.86503 16.2275C2.39462 15.9878 2.01217 15.6054 1.77248 15.135C1.5 14.6002 1.5 13.9002 1.5 12.5V12.3333M16.5 5.66667V5.5C16.5 4.09987 16.5 3.3998 16.2275 2.86503C15.9878 2.39462 15.6054 2.01217 15.135 1.77248C14.6002 1.5 13.9002 1.5 12.5 1.5H12.3333M16.5 12.3333V12.5C16.5 13.9002 16.5 14.6002 16.2275 15.135C15.9878 15.6054 15.6054 15.9878 15.135 16.2275C14.6002 16.5 13.9002 16.5 12.5 16.5H12.3333"
        stroke="currentColor"
        stroke-width="1.67"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
};

const icons = [
  {
    label: "Gallery",
    icon: GalleryIcon
  },
  {
    label: "Layout",
    icon: LayoutIcon
  },
  {
    label: "3d",
    icon: HiOutlineCube
  }
];
