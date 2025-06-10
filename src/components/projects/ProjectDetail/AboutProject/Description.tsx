"use client";

import { useMemo, useState } from "react";

import { ProjectTranslation } from "@/types/domain";
import { useTranslations } from "next-intl";

interface IProps {
  currentTranslation: ProjectTranslation;
}

const Description = ({ currentTranslation }: IProps) => {
  const [isShownAllDescriptions, setIsShownAllDescriptions] = useState(false);
  const t = useTranslations("ProjectDetails");

  // Мемоизируем обрезанный текст для десктопа и мобильных устройств
  const { desktopText, mobileText, hasDesktopMore, hasMobileMore } =
    useMemo(() => {
      const fullText = currentTranslation?.description || "";
      const desktopLimit = 300;
      const mobileLimit = 128;

      return {
        desktopText: isShownAllDescriptions
          ? fullText
          : fullText.slice(0, desktopLimit) +
            (fullText.length > desktopLimit ? "..." : ""),
        mobileText: isShownAllDescriptions
          ? fullText
          : fullText.slice(0, mobileLimit) +
            (fullText.length > mobileLimit ? "..." : ""),
        hasDesktopMore: fullText.length > desktopLimit,
        hasMobileMore: fullText.length > mobileLimit
      };
    }, [currentTranslation?.description, isShownAllDescriptions]);

  const toggleDescription = () =>
    setIsShownAllDescriptions(!isShownAllDescriptions);

  return (
    <>
      {/* Десктопная версия */}
      <div className="relative mt-12 lg:mt-0 hidden md:block">
        <p className="text-gray-600 break-words">{desktopText}</p>
        {hasDesktopMore && (
          <button
            className="text-primary hover:text-primary/80 mt-2"
            onClick={toggleDescription}
          >
            {isShownAllDescriptions
              ? t("overview.hide")
              : t("overview.readMore")}
          </button>
        )}
      </div>

      {/* Мобильная версия */}
      <div className="relative mt-12 lg:mt-0 md:hidden">
        <p className="text-gray-600 break-words">{mobileText}</p>
        {hasMobileMore && (
          <button
            className="text-primary hover:text-primary/80 mt-2"
            onClick={toggleDescription}
          >
            {isShownAllDescriptions
              ? t("overview.hide")
              : t("overview.readMore")}
          </button>
        )}
      </div>
    </>
  );
};

export default Description;
