import { HiOutlineLocationMarker } from "react-icons/hi";
import Image from "next/image";
import { Link } from "@/config/i18n";
import { TbLocation } from "react-icons/tb";
import { memo } from "react";
import styles from "./DeveloperMiniCard.module.css";
import { useTranslations } from "next-intl";

interface IProps {
  data: {
    project: {
      name: string;
      link: string;
      location: {
        address: string;
        beach: string;
        distance: string;
      };
    };
    developer: {
      name: string;
      link: string;
      image: string;
    };
  };
}

const DeveloperMiniCard = memo(({ data }: IProps) => {
  const t = useTranslations("UnitDetail.developer-widget");

  if (!data) return null;

  return (
    <div className={styles.developerMiniCard}>
      <div className={styles.locationContainer}>
        <div className={`${styles.map}`}>
          <Image src="/images/location-icon.png" fill alt="Map" />
        </div>

        <div className={styles.locationInfo}>
          <button
            onClick={() => {
              const element = document.getElementById("infrastructure");
              if (element) {
                element.scrollIntoView({ behavior: "smooth" });
              }
            }}
            className="text-left"
          >
            <h4 className={styles.locationName}>{data.project.name}</h4>
          </button>
          <div className={styles.locationDetails}>
            {data.project.location.address && (
              <div className={styles.locationDetail}>
                <HiOutlineLocationMarker className={`${styles.locationIcon}`} />
                <p className={styles.locationAddress}>
                  {data.project.location.address}
                </p>
              </div>
            )}
            <div className={styles.locationDetail}>
              <TbLocation className={`${styles.locationIcon}`} />
              <p className={styles.locationDistance}>
                {data.project.location.beach || ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      <hr className={styles.divider} />

      {data.developer && (
        <div className={styles.developerInfo}>
          <div className={styles.developerImage}>
            <Image
              src={data.developer.image}
              fill
              alt={data.developer.name}
              onError={(e: any) => {
                e.target.src = "/images/default-developer.png";
              }}
            />
          </div>

          <div className={styles.developerName}>
            <p>{t("developer")}</p>
            <Link href={data.developer.link || "#"}>
              <h4>{data.developer.name}</h4>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
});

DeveloperMiniCard.displayName = "DeveloperMiniCard";

export default DeveloperMiniCard;
