import { IBottomBarProps } from "../interfaces";
import { formatDateToQuarter } from "@/utils/formatQuarterDate";
import styles from "./BottomBar.module.css";
import { useTranslations } from "next-intl";

const BottomBar = ({ data }: IBottomBarProps) => {
  const t = useTranslations("ProjectDetails");

  const formattedDate = formatDateToQuarter(data.offDate);
  const formattedArea = `${data.totalArea} ${t("projectInfo.values.metrics.squareMeters")}`;
  const formattedData = {
    ...data,
    offDate: formattedDate,
    totalArea: formattedArea
  };

  return (
    <div className={styles.bottomBarContainer}>
      <div className={styles.bottomBar}>
        {Object.entries(formattedData).map(([key, value], index) => (
          <div key={index} className={styles.col}>
            <h4>
              <span className={styles.colTitle}>{t(`projectInfo.${key}`)}</span>
              <span className={styles.colValue}>
                {value || t("projectInfo.values.notSpecified")}
              </span>
            </h4>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BottomBar;
