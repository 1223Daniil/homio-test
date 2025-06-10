import { Unit, UnitLayout } from "@prisma/client";
import { useEffect, useRef, useState } from "react";

import Image from "next/image";
import { Link } from "@/config/i18n";
import { formatDateToQuarter } from "@/utils/formatQuarterDate";
import { formatNumberType } from "@/utils/formatPrice";
import { motion } from "framer-motion";
import styles from "./AdaptiveUnitsList.module.css";
import { useTranslations } from "next-intl";

interface Props {
  layouts: (UnitLayout & { units: Unit[] })[];
  project: {
    id: string;
    currency: string;
    offDate: string;
  };
}

const AdaptiveUnitsList = ({ layouts, project }: Props) => {
  return (
    <motion.div
      className={`${styles.container}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {layouts.flatMap(layout => {
        if (!layout.units.length) return null;

        const mainImage = "mainImage" in layout ? layout.mainImage : "";
        const name = "name" in layout ? layout.name : "";
        const type = "type" in layout ? layout.type : "";
        const totalArea = "totalArea" in layout ? layout.totalArea : 0;

        return layout.units.map(unit => (
          <UnitItem
            key={unit.id}
            unit={unit}
            layout={{
              image: mainImage,
              name: name,
              type: type,
              totalArea: totalArea
            }}
            project={project}
          />
        ));
      })}
    </motion.div>
  );
};

export default AdaptiveUnitsList;

interface UnitItemProps {
  unit: Unit;
  layout: {
    image: string | null;
    name: string;
    type: string;
    totalArea: number;
  };
  project: {
    id: string;
    currency: string;
    offDate: string;
  };
}

export function UnitItem({ unit, layout, project }: UnitItemProps) {
  const [compressedMedia, setCompressedMedia] = useState<{
    url: string;
  } | null>(null);

  const imageContainerRef = useRef<HTMLDivElement>(null);

  const t = useTranslations("UnitDetail");
  const tAmount = useTranslations("Amounts");
  const tCurrency = useTranslations("projects.currency.symbols");

  useEffect(() => {
    if (!imageContainerRef.current) return;

    const width = imageContainerRef.current.clientWidth * 2;
    const height = imageContainerRef.current.clientHeight * 2;

    if (
      layout.image &&
      typeof layout.image === "string" &&
      layout.image.includes("storage.yandexcloud.net")
    ) {
      const cloudPath = layout.image.replace(
        "https://storage.yandexcloud.net/",
        ""
      );
      setCompressedMedia({
        url: `/api/image-proxy/${cloudPath}?width=${width}&height=${height}&quality=100`
      });
    } else {
      setCompressedMedia(null);
    }
  }, [layout.image, imageContainerRef.current]);

  const formattedPrice = formatNumberType(unit.price);
  const formattedDate = formatDateToQuarter(project.offDate);

  return (
    <Link
      href={`/projects/${project.id}/units/${unit.id}`}
      className={`${styles.unitItem}`}
    >
      <div className={`${styles.leftCol}`}>
        <div className={`${styles.image}`} ref={imageContainerRef}>
          <Image
            src={
              compressedMedia?.url || layout.image || "/images/placeholder.jpg"
            }
            alt={layout.name}
            fill
            className={`${styles.image}`}
          />
        </div>

        <div className={`${styles.info}`}>
          <p className={`${styles.date}`}>{formattedDate}</p>
          <p className={`${styles.price}`}>
            {formattedPrice.number == 0 ? (
              <>{t("request-viewing.sold")}</>
            ) : (
              <>
                {tCurrency(project.currency as any)}
                {formattedPrice.number}
                {formattedPrice.type && tAmount(formattedPrice.type as any)}
              </>
            )}
          </p>
          <p className={`${styles.description}`}>
            {layout.type} ⸱ {layout.totalArea} m² ⸱{" "}
          </p>
        </div>
      </div>

      <div className={`${styles.rightCol}`}>
        <p className={`${styles.number}`}>
          {unit.number && unit.number.length > 10
            ? unit.number.slice(0, 7) + "..."
            : unit.number || ""}
        </p>
      </div>
    </Link>
  );
}
