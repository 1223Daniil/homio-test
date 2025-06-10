import BlurHashImage from "@/components/media/BlurHashImage";
import { Button } from "@heroui/button";
import ImageWithLoader from "@/components/media/ImageWithLoader";
import { formatNumberType } from "@/utils/formatPrice";
import styles from "./SimilarUnit.module.css";
import { useRouter } from "@/config/i18n";
import { useTranslations } from "next-intl";

type SimilarUnitProps = {
  unit: {
    unitLink: string;
    image: string;
    title: string;
    price: number;
    currency: string;
    area: number;
    blurhash: string;
  };
};

const SimilarUnit = ({ unit }: SimilarUnitProps) => {
  const router = useRouter();

  const t = useTranslations("UnitDetail.similar-units.unit-card");
  const tSold = useTranslations("UnitDetail");
  const tAmount = useTranslations("Amounts");

  const formattedPrice = formatNumberType(unit.price);
  const formattedPricePerM2 = formatNumberType(unit.price / unit.area);

  return (
    <button className={`${styles.unitCard}`}>
      <div className={`${styles.unitCardImage}`}>
        <BlurHashImage
          src={unit.image}
          alt={unit.title}
          blurhash={unit.blurhash}
          className={`object-cover`}
          quality={90}
        />
      </div>

      <div className={`${styles.unitCardInfo}`}>
        <h3>{unit.title}</h3>

        <div className={`${styles.unitDetails}`}>
          {formattedPrice.number > 0 ? (
            <>
              <span className={`${styles.unitDetailsPrice}`}>
                {unit.currency}
                {formattedPrice.number}
                {formattedPrice.type && tAmount(formattedPrice.type)}
              </span>
              <span className={`${styles.pricePerM2}`}>
                {t("price-per-sqm", {
                  price: `${formattedPricePerM2.number}${tAmount(
                    formattedPricePerM2.type
                  )}`
                })}
              </span>
            </>
          ) : (
            tSold("request-viewing.sold")
          )}
        </div>
      </div>

      <Button
        className={`${styles.unitCardButton}`}
        onPress={() => router.push(unit.unitLink)}
      >
        {t("view-details")}
      </Button>
    </button>
  );
};

export default SimilarUnit;
