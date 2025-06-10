import Image from "next/image";
import styles from "./AdaptiveMasterPlan.module.css";

interface Props {
  image: {
    url: string;
    alt: string;
  };
  points: any[];
}

const AdaptiveMasterPlan = ({ image, points }: Props) => {
  return (
    <div className={`${styles.masterPlan}`}>
      <Image
        src={image.url}
        fill
        alt={image.alt}
        className={`${styles.image}`}
      />

      {points.map(point => {
        return (
          <div className={`${styles.point}`} key={point.id}>
            <div className={`${styles.dot}`} />
          </div>
        );
      })}
    </div>
  );
};

export default AdaptiveMasterPlan;
