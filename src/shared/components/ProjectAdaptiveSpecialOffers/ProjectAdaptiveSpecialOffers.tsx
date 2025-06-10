"use client";

import { Swiper, SwiperSlide } from "swiper/react";

import { IoIosArrowForward } from "react-icons/io";
import { ReactNode } from "react";
import { getIcon } from "@/components/projects/SpecialOffers";
import styles from "./ProjectAdaptiveSpecialOffers.module.css";
import { useTranslations } from "next-intl";

interface Props {
  offers: SpecialOffersItemProps[];
}

const swiperOptions = {
  slidesPerView: 1.25,
  spaceBetween: 10,
  breakpoints: {
    375: {
      slidesPerView: 1.1
    },
    480: {
      slidesPerView: 1.15
    },
    640: {
      slidesPerView: 1.25
    },
    768: {
      slidesPerView: 2.5
    },
    1024: {
      slidesPerView: 3.5
    }
  }
};

const ProjectAdaptiveSpecialOffers = ({ offers }: Props) => {
  const t = useTranslations("Projects");

  return (
    <div className={`${styles.container}`}>
      <h3 className={`${styles.title}`}>{t("sections.specialOffers.title")}</h3>

      <Swiper {...swiperOptions} className={`${styles.swiper}`}>
        {offers.map(offer => (
          <SwiperSlide key={offer.id}>
            <SpecialOffersItem
              icon={offer.icon}
              title={offer.title}
              validUntil={
                offer.validUntil
                  ? new Date(offer.validUntil).toLocaleDateString()
                  : null
              }
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ProjectAdaptiveSpecialOffers;

interface SpecialOffersItemProps {
  icon: ReactNode | string;
  title: string;
  validUntil: string | null;
  id?: string;
  description?: string;
}

function SpecialOffersItem({
  icon,
  title,
  validUntil
}: SpecialOffersItemProps) {
  const t = useTranslations("Projects");

  return (
    <div className={`${styles.offer}`}>
      <div className={`${styles.offerContent}`}>
        <div className={`${styles.offerIcon}`}>
          {typeof icon === "string" ? getIcon(icon) : icon}
        </div>

        <div>
          <h4 className={`${styles.offerTitle}`}>{title}</h4>
          <p className={`${styles.offerDescription}`}>
            {validUntil && (
              <>
                {t("sections.specialOffers.validUntilPrefix")}: {validUntil}
              </>
            )}
          </p>
        </div>
      </div>

      <div className={`${styles.offerArrowContainer}`}>
        <IoIosArrowForward className={`${styles.offerArrow}`} />
      </div>
    </div>
  );
}
