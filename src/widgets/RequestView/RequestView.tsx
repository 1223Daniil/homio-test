import { Swiper, SwiperSlide } from "swiper/react";
import { useRef, useState } from "react";

import { Button } from "@heroui/button";
import SliderControl from "@/shared/components/SliderControl";
import { Swiper as SwiperType } from "swiper";
import { formatNumberType } from "@/utils/formatPrice";
import styles from "./RequestView.module.css";
import { useTranslations } from "next-intl";

interface IProps {
  unit: {
    title: string;
    bed: number;
    area: number;
    floor: string;
    price: number;
    currency: string;
  };
  onRequestView: () => void;
  onRequestDetails?: () => void;
}

const RequestView = ({ unit, onRequestView, onRequestDetails }: IProps) => {
  const days = getDays();
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedDay, setSelectedDay] = useState<{
    day: number;
    month: number;
    weekday: number;
  }>(days[0]!);

  console.log(unit);

  const t = useTranslations("UnitDetail.request-viewing");
  const tProjects = useTranslations("projects.currency.symbols");
  const tAmount = useTranslations("Amounts");

  const swiperRef = useRef<SwiperType | null>(null);

  const swiperOptions = {
    slidesPerView: 3,
    spaceBetween: 6,
    onSwiper: (swiper: SwiperType) => {
      swiperRef.current = swiper;
    },
    onSlideChange: () => {
      if (swiperRef.current) {
        setActiveIndex(swiperRef.current.activeIndex);
      }
    }
  };

  const handleNext = () => {
    if (swiperRef.current) {
      swiperRef.current.slideNext();
      setSelectedDay(days[swiperRef.current.activeIndex]!);
    }
  };

  const handlePrev = () => {
    if (swiperRef.current) {
      swiperRef.current.slidePrev();
      setSelectedDay(days[swiperRef.current.activeIndex]!);
    }
  };

  const formattedPrice = formatNumberType(unit.price);
  const formattedPricePerSqm = formatNumberType(unit.price / unit.area);

  console.log(formattedPricePerSqm);

  return (
    <div className={styles.requestView}>
      <div className={`${styles.requestViewHeader}`}>
        <h2 className={`${styles.title}`}>
          {t("unit-title", {
            bed: unit.bedrooms,
            area: unit.area,
            floor: unit.floor
          })}
        </h2>
        <h4 className={`${styles.price}`}>
          {formattedPrice.number ? (
            <>
              {tProjects(unit.currency)}
              {formattedPrice.number} {tAmount(formattedPrice.type)}
            </>
          ) : (
            t("sold")
          )}
        </h4>
        <h4 className={`${styles.area}`}>
          {formattedPricePerSqm.number ? (
            <>
              {t("price-per-sqm", {
                price: `${formattedPricePerSqm.number}${tAmount(formattedPricePerSqm.type)}`
              })}
            </>
          ) : (
            t("sold")
          )}
          {/* {t("price-per-sqm", {
            price: `${formattedPricePerSqm.number}${tAmount(formattedPricePerSqm.type)}`
          })} */}
        </h4>
      </div>

      <div className={`${styles.calendarSlider}`}>
        <SliderControl
          direction="prev"
          onClick={handlePrev}
          className={`${styles.control} ${activeIndex === 0 ? styles.controlDisabled : ""}`}
        />
        <SliderControl
          direction="next"
          onClick={handleNext}
          className={`${styles.control} ${styles.controlNext} ${activeIndex === days.length - 3 ? styles.controlDisabled : ""}`}
        />

        <Swiper {...swiperOptions}>
          {days.map(day => (
            <SwiperSlide key={day.day}>
              <CalendarSlide
                active={
                  day.day === selectedDay.day && day.month === selectedDay.month
                }
                onClick={() => setSelectedDay(day)}
                day={day.day}
                month={day.month}
                weekday={day.weekday}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        <p className={`${styles.desiredDate}`}>{t("calendar.desired-date")}</p>
      </div>

      <div className={`${styles.buttons}`}>
        <div>
          <Button
            className={`${styles.requestViewButton}`}
            onClick={onRequestView}
          >
            {t("buttons.request-viewing")}
          </Button>
        </div>

        <div className={`${styles.orContainer}`}>
          <p className={`${styles.or}`}>{t("or")}</p>
        </div>

        <div className={`${styles.requestDetailsButtonContainer}`}>
          <Button
            className={`${styles.requestDetailsButton}`}
            onClick={
              onRequestDetails ||
              (() => console.log("Request details not implemented"))
            }
          >
            {t("buttons.request-details")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RequestView;

interface CalendarSlideProps extends React.HTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  day: number;
  month: number;
  weekday: number;
}

function CalendarSlide({
  active,
  day,
  month,
  weekday,
  ...props
}: CalendarSlideProps) {
  const t = useTranslations("UnitDetail.request-viewing.calendar");

  return (
    <button
      {...props}
      className={`${styles.calendarSlide} ${active ? styles.calendarSlideActive : ""}`}
    >
      <p className={styles.calendarSlideDay}>{t(`weekday.${weekday}`)}</p>
      <p className={styles.calendarSlideDate}>{day}</p>
      <p className={styles.calendarSlideMonth}>{t(`month.${month}`)}</p>
    </button>
  );
}

function getDays() {
  const now = new Date();
  const days: { day: number; month: number; weekday: number }[] = [];

  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(now.getDate() + i);

    days.push({
      day: date.getDate(),
      month: date.getMonth(),
      weekday: date.getDay()
    });
  }

  return days;
}
