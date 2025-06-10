import { IDeveloperBannerProps } from "../interfaces";
import Image from "next/image";
import styles from "./DeveloperBanner.module.css";
import { useTranslations } from "next-intl";

const DeveloperBanner = ({ developer }: IDeveloperBannerProps) => {
  const t = useTranslations("projects");

  return (
    <div className={styles.developerBanner}>
      <div className={`${styles.developerBannerImage}`}>
        <Image
          src={developer.image}
          alt={developer.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 60vw"
        />
      </div>

      <div className={`${styles.developerBannerContent}`}>
        <p>{t("Projects.developer")}</p>
        <h3>{developer.name}</h3>
      </div>
    </div>
  );
};

export default DeveloperBanner;
