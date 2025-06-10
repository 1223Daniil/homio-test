import { Button } from "@heroui/button";
import Image from "next/image";
import styles from "./PersonalBroker.module.css";
import { useTranslations } from "next-intl";

const PersonalBroker = () => {
  const t = useTranslations("UnitDetail.broker-widget");

  return (
    <div className={styles.personalBroker}>
      <div className={styles.brokerInfoContainer}>
        <div className={`${styles.brokerImage}`}>
          <Image src="/images/broker-image.png" fill alt="Personal Broker" />
        </div>

        <div className={`${styles.brokerInfo}`}>
          <h4 className={`${styles.brokerName}`}>{t("title")}</h4>
          <p className={`${styles.brokerPhone}`}>{t("broker-name")}</p>
        </div>
      </div>

      <Button className={`${styles.chatButton}`}>{t("chat-button")}</Button>
    </div>
  );
};

export default PersonalBroker;
