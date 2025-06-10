"use client";

import { ReactNode, useMemo, useState } from "react";

import { Button } from "@heroui/button";
import { HiOutlineLocationMarker } from "react-icons/hi";
import Image from "next/image";
import { TbLocation } from "react-icons/tb";
import UnitFacilities from "@/shared/components/UnitFacilities";
import { formatDateToQuarter } from "@/utils/formatQuarterDate";
import { formatNumberType } from "@/utils/formatPrice";
import styles from "./AboutUnit.module.css";
import { useTranslations } from "next-intl";

interface IProps {
  price: number;
  currency: string;
  description: string;
  factsList: {
    [key: string]: string;
  };
  facilities: string[];
  underHeaderContent: ReactNode;
  project: {
    name: string;
    location: {
      address: string;
      beach: string;
      distance: string;
    };
  };
  developerName?: string;
  onRequestView?: () => void;
}

const AboutUnit = ({
  price,
  currency,
  description,
  factsList,
  facilities,
  underHeaderContent,
  project,
  developerName,
  onRequestView
}: IProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const t = useTranslations("UnitDetail");
  const tSold = useTranslations("UnitDetail.request-viewing");
  const tCurrency = useTranslations("projects.currency.symbols");
  const amountT = useTranslations("Amounts");
  const tRequest = useTranslations("UnitDetail.request-viewing");

  const facts = useMemo(() => {
    return Object.values(t.raw("aboutUnit.facts"));
  }, []);

  const { number: priceNumber, type: priceType } = formatNumberType(price);

  return (
    <div className={styles.aboutUnitContainer}>
      <div className={styles.aboutUnit}>
        <p className={`${styles.aboutUnitTitle}`}>{t("aboutUnit.title")}</p>
        <p
          className={`${styles.aboutUnitTitle} ${styles.aboutUnitTitleMobile}`}
        >
          {priceNumber ? (
            <>
              {tCurrency(currency)}
              {priceNumber}
              {amountT(priceType)}
            </>
          ) : (
            tSold("sold")
          )}
        </p>

        {underHeaderContent}

        <div className="hidden md:block">
          <h3 suppressHydrationWarning>
            {description.length > 325 && !isExpanded
              ? description.slice(0, 325) + "..."
              : description}{" "}
            {description.length > 325 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={styles.readMoreButton}
              >
                {isExpanded
                  ? t("aboutUnit.read-less")
                  : t("aboutUnit.read-more")}
              </button>
            )}
          </h3>
        </div>
      </div>

      <div className={styles.factsList}>
        {facts.map((fact, inx) => (
          <div key={inx} className={styles.factItem}>
            <h4>
              {fact}{" "}
              <p>
                {inx === 4
                  ? formatDateToQuarter(Object.values(factsList)[inx])
                  : Object.values(factsList)[inx]}
              </p>
            </h4>
          </div>
        ))}
      </div>

      <div className={`${styles.locationContainer}`}>
        <div className={`${styles.location}`}>
          <p className={styles.projectName}>{project.name}</p>
          {project.location.address && (
            <div className={styles.locationDetail}>
              <HiOutlineLocationMarker className={`${styles.locationIcon}`} />
              <p className={styles.locationAddress}>
                {project.location.address}
              </p>
            </div>
          )}
          <div className={styles.locationDetail}>
            <TbLocation className={`${styles.locationIcon}`} />
            <p className={styles.locationDistance}>
              {project.location.beach || ""}
            </p>
          </div>
        </div>

        <div className={`${styles.image}`}>
          <Image
            src={"/images/location-icon.png"}
            fill
            alt="location icon"
            className={styles.locationIcon}
          />
        </div>
      </div>

      <div className={styles.requestViewButton}>
        <Button className={styles.viewButton} onClick={onRequestView}>
          {tRequest("buttons.request-viewing")}
        </Button>
        <p className={styles.developerName}>{developerName}</p>
      </div>

      <div className={styles.descriptionContainer}>
        <p>
          {description.length > 75
            ? description.slice(0, 75) + "..."
            : description}
        </p>
        <button
          className={styles.readMoreButton}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? t("aboutUnit.read-less") : t("aboutUnit.read-more")}
        </button>
      </div>

      <UnitFacilities facilities={facilities} />
    </div>
  );
};

export default AboutUnit;
