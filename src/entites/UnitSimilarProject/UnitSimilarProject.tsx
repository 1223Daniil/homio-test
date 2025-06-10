import BlurHashImage from "@/components/media/BlurHashImage";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { IconBuilding } from "@tabler/icons-react";
import ImageWithLoader from "@/components/media/ImageWithLoader";
import { TbLocation } from "react-icons/tb";
import styles from "./UnitSimilarProject.module.css";
import { useRouter } from "@/config/i18n";
import { useTranslations } from "next-intl";

type ProjectData = {
  id: string;
  developerImage: string;
  projectImage: string;
  title: string;
  price: {
    from: string;
    to: string;
    currency: string;
  };
  location: string;
  distance: string;
  blurhash: string;
};

interface IProps {
  projectData: ProjectData;
}

const UnitSimilarProject = ({ projectData }: IProps) => {
  const router = useRouter();

  const t = useTranslations("UnitDetail.similar-projects");
  const tProjects = useTranslations("projects.currency");

  return (
    <button
      className={`${styles.projectCard}`}
      onClick={() => router.push(`/projects/${projectData.id}`)}
    >
      <div className={`${styles.projectCardImage}`}>
        <BlurHashImage
          src={projectData.projectImage}
          alt={projectData.title || "Проект"}
          blurhash={projectData.blurhash}
          className={`${styles.projectImage}`}
          quality={90}
        />

        <div className={`${styles.developerLogoContainer}`}>
          <div className={`${styles.developerLogo}`}>
            {projectData.developerImage ? (
              <ImageWithLoader
                src={projectData.developerImage}
                alt={`Застройщик ${projectData.title}` || "Застройщик"}
                className={styles.developerImage}
                quality={80}
                loaderClassName="absolute inset-0 flex items-center justify-center"
                shimmerClassName="w-full h-full relative overflow-hidden"
              />
            ) : (
              <div className={`${styles.developerLogoPlaceholder}`}>
                <IconBuilding size={20} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={`${styles.cardData}`}>
        <h3 className={`${styles.cardTitle}`}>{projectData.title}</h3>

        <h4 className={`${styles.cardPrice}`}>
          {t("projects-cards.price-range", {
            from: `${projectData.price.from}`,
            to: `${projectData.price.to}`
          })}
        </h4>

        <div className={`${styles.locationData}`}>
          {projectData.location && (
            <div className={`${styles.location}`}>
              <HiOutlineLocationMarker className={`${styles.locationIcon}`} />
              <h4>{projectData.location}</h4>
            </div>
          )}
          {projectData.distance && (
            <div className={`${styles.location}`}>
              <TbLocation className={`${styles.locationIcon}`} />
              <p>
                {t("projects-cards.beach-distance", {
                  distance: projectData.distance
                })}
              </p>
            </div>
          )}
        </div>
      </div>
    </button>
  );
};

export default UnitSimilarProject;
