"use client";

import {
  BuildingStatus,
  Developer,
  DeveloperTranslation,
  ProjectStatus,
  ProjectTranslation,
  ProjectType
} from "@prisma/client";
import { useLocale, useTranslations } from "next-intl";

import Image from "next/image";
import { Link } from "@/config/i18n";
import styles from "./UnitAboutBuilding.module.css";

interface BuildingBasicInfo {
  building: {
    id: string;
    name: string;
    floors: number;
    status: ProjectStatus;
    description: string | null;
    imageUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
    projectId: string;
    _count: {
      units: number;
    };
  } | null;
  project?: {
    id: string;
    name: string | null;
    slug: string | null;
    description: string | null;
    type: ProjectType;
    buildingStatus: BuildingStatus;
    status: ProjectStatus;
    translations: ProjectTranslation[];
    completionDate: Date | null;
    constructionStatus: number | null;
    phase: number | null;
    media?: {
      id: string;
      projectId: string;
      type: string;
      url: string;
      title: string;
      blurhash?: string;
      category?: string;
      createdAt: Date;
      updatedAt: Date;
      isCover?: boolean;
      isMainVideo?: boolean;
      description?: string | null;
      thumbnailUrl?: string | null;
      metadata?: any;
      order?: number;
    }[];
    developer?: Developer & {
      name?: string;
      translations: DeveloperTranslation[];
    };
  } | null;
}

// Функция для проксирования URL изображений
const getProxiedImageUrl = (imageUrl: string): string => {
  if (!imageUrl || imageUrl.startsWith("/images/")) return imageUrl;

  // Для изображений из Yandex Cloud
  if (imageUrl.includes("storage.yandexcloud.net")) {
    const cloudPath = imageUrl.replace(
      /^https?:\/\/storage\.yandexcloud\.net\//,
      ""
    );
    return `/api/image-proxy/${cloudPath}?width=600&height=400&quality=80`;
  }

  // Пропускаем уже проксированные изображения
  if (imageUrl.startsWith("/api/image-proxy/")) {
    return imageUrl;
  }

  // Для остальных изображений
  const normalizedUrl = imageUrl.replace(/^https?:\/\//, "");
  return `/api/image-proxy/${normalizedUrl}?width=600&height=400&quality=80`;
};

const UnitAboutBuilding = ({ project, building }: BuildingBasicInfo) => {
  console.log("aboutBuilding", project, building);

  const t = useTranslations("UnitDetail.about-building");
  const tDeliveryStages = useTranslations(
    "UnitDetail.about-building.delivery-stags"
  );
  const locale = useLocale();

  const getDeliveryStage = (phase: number | null): string => {
    if (phase === null || phase === undefined) {
      return "Not specified";
    }

    if (phase <= 25) {
      return tDeliveryStages("pre-sale");
    }

    if (phase <= 50) {
      return tDeliveryStages("construction");
    }

    if (phase <= 75) {
      return tDeliveryStages("handover");
    }

    if (phase <= 100) {
      return tDeliveryStages("completion");
    }

    return "Not specified";
  };

  // Проверка на наличие project и media
  const hasMediaImages = project?.media && project.media.length > 0;

  // Получаем URL изображения здания и проксируем его
  const buildingImageUrl =
    building?.imageUrl ||
    (hasMediaImages && project.media[0]?.url
      ? project.media[0].url
      : "/images/no_image.png");

  const proxiedBuildingImageUrl = getProxiedImageUrl(buildingImageUrl);

  // Если здание отсутствует, используем данные из проекта
  const buildingName = building?.name || project?.name || "";
  const totalUnits = building?._count?.units || 0;

  // Если проект отсутствует, показываем только основную информацию
  if (!project) {
    return (
      <div className={`${styles.unitAboutBuilding}`}>
        <h3 className={`${styles.title}`}>{t("title")}</h3>
        <div className={`${styles.container}`}>
          <div className={`${styles.buildingImage}`}>
            <Image
              src={building?.imageUrl || "/images/no_image.png"}
              fill
              alt={building?.name || ""}
            />
          </div>
          <div className={`${styles.buildingInfo}`}>
            {building && (
              <>
                <div className={`${styles.infoLine}`}>
                  <p>{t("fields.building-id")}</p>
                  <p className={`${styles.value}`}>{building.name}</p>
                </div>
                <div className={`${styles.infoLine}`}>
                  <p>{t("fields.total-units")}</p>
                  <p className={`${styles.value}`}>{building._count.units}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.unitAboutBuilding}`}>
      <h3 className={`${styles.title}`}>{t("title")}</h3>

      <div className={`${styles.container}`}>
        <div className={`${styles.buildingImage}`}>
          <Image src={proxiedBuildingImageUrl} fill alt={buildingName} />
        </div>

        <div className={`${styles.buildingInfo}`}>
          {project.developer && (
            <div className={`${styles.infoLine}`}>
              <p>{t("fields.developer")}</p>
              <Link
                href={`/developers/${project.developer.id}`}
                className={`${styles.value}`}
              >
                {project.developer.translations?.find(
                  t => t.language === locale
                )?.name ||
                  project.developer.translations?.[0]?.name ||
                  project.developer.name ||
                  ""}{" "}
              </Link>
            </div>
          )}

          <div className={`${styles.infoLine}`}>
            <p>{t("fields.project")}</p>
            <Link
              href={`/projects/${project.id}`}
              className={`${styles.value}`}
            >
              {project.translations?.find(t => t.language === locale)?.name ||
                project.name ||
                ""}{" "}
            </Link>
          </div>

          <div className={`${styles.infoLine}`}>
            <p>{t("fields.building-id")}</p>
            <p className={`${styles.value}`}>{buildingName}</p>
          </div>

          <div className={`${styles.infoLine}`}>
            <p>{t("fields.total-units")}</p>
            <p className={`${styles.value}`}>{totalUnits}</p>
          </div>

          <div className={`${styles.infoLine}`}>
            <p>{t("fields.construction-dates")}</p>
            <p className={`${styles.value}`}>
              {project.completionDate
                ? new Date(project.completionDate).toLocaleDateString()
                : "Not specified"}
            </p>
          </div>

          <div className={`${styles.infoLine}`}>
            <p>{t("fields.delivery-stage")}</p>
            <p className={`${styles.value}`}>
              {getDeliveryStage(project.constructionStatus)}
            </p>
          </div>

          <div className={`${styles.infoLine}`}>
            <p>{t("fields.phase-number")}</p>
            <p className={`${styles.value}`}>
              {project.phase || "Not specified"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitAboutBuilding;
