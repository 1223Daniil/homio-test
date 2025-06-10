import { ElementType, useState } from "react";

import { IoIosArrowDown } from "react-icons/io";
import { UnitLayout } from "@prisma/client";
import { features } from "@/components/layouts/forms/LayoutFeaturesForm";
import styles from "./UnitFacilities.module.css";
import { useTranslations } from "next-intl";

interface IProps {
  facilities: Partial<UnitLayout> | string[];
}

const UnitFacilities = ({ facilities }: IProps) => {
  const t = useTranslations("UnitDetail.aboutUnit.facilities");
  const featuresT = useTranslations("Layouts.features");

  const [isExpanded, setIsExpanded] = useState(false);

  // Обрабатываем случай, когда facilities - массив строк
  if (Array.isArray(facilities)) {
    const facilitesList = features
      .filter(({ key }) => facilities.includes(key))
      .map(({ icon: Icon, label }) => {
        // Получаем ключ без префикса
        const translationKey = label.replace(
          "features.",
          ""
        ) as keyof typeof featuresT.rich;
        return {
          Icon,
          title: featuresT(translationKey)
        };
      });

    if (facilitesList.length === 0) return null;

    return (
      <div className={`${styles.unitFacilities}`}>
        <div className={`${styles.cardsGrid}`}>
          {facilitesList.length > 8 && !isExpanded
            ? facilitesList
                .slice(0, 8)
                .map(({ Icon, title }, index) => (
                  <FacilityCard key={index} Icon={Icon} title={title} />
                ))
            : facilitesList.map(({ Icon, title }, index) => (
                <FacilityCard key={index} Icon={Icon} title={title} />
              ))}
        </div>

        {facilitesList.length > 8 && (
          <button
            className={`${styles.showAllFacilities}`}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <IoIosArrowDown
              className={`${styles.arrowIcon} ${isExpanded ? "rotate-180" : ""}`}
            />
            {isExpanded ? t("hide") : t("show-all")}
          </button>
        )}
      </div>
    );
  }

  // Обрабатываем случай, когда facilities - объект Partial<UnitLayout>
  const facilitesList = features
    .map(({ key, label, icon: Icon }) => {
      if (facilities && facilities[key as keyof UnitLayout] === true) {
        // Получаем ключ без префикса
        const translationKey = label.replace(
          "features.",
          ""
        ) as keyof typeof featuresT.rich;
        return {
          Icon,
          title: featuresT(translationKey)
        };
      }
      return null;
    })
    .filter(Boolean) as { Icon: ElementType; title: string }[];

  if (facilitesList.length === 0) return null;

  return (
    <div className={`${styles.unitFacilities}`}>
      <div className={`${styles.cardsGrid}`}>
        {facilitesList.length > 8 && !isExpanded
          ? facilitesList
              .slice(0, 8)
              .map(({ Icon, title }, index) => (
                <FacilityCard key={index} Icon={Icon} title={title} />
              ))
          : facilitesList.map(({ Icon, title }, index) => (
              <FacilityCard key={index} Icon={Icon} title={title} />
            ))}
      </div>

      {facilitesList.length > 8 && (
        <button
          className={`${styles.showAllFacilities}`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <IoIosArrowDown
            className={`${styles.arrowIcon} ${isExpanded ? "rotate-180" : ""}`}
          />
          {isExpanded
            ? t("hide")
            : t("show-all", { count: facilitesList.length })}
        </button>
      )}
    </div>
  );
};

export default UnitFacilities;

interface ICardProps {
  Icon: ElementType;
  title: string;
}

function FacilityCard({ Icon, title }: ICardProps) {
  return (
    <div className={`${styles.facilityCard}`}>
      <Icon className={`${styles.facilityCardIcon}`} />
      <p className={`${styles.facilityCardTitle}`}>
        {title.length > 10 ? title.slice(0, 7) + "..." : title}
      </p>
    </div>
  );
}
