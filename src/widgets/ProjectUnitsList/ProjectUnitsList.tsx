import { useMemo, useState } from "react";

import { FaRegBookmark } from "react-icons/fa6";
import { Pagination } from "@heroui/react";
import { formatNumberType } from "@/utils/formatPrice";
import styles from "./ProjectUnitsList.module.css";
import { useLayouts } from "@/hooks/useLayouts";
import { useParams } from "next/navigation";
import { useRouter } from "@/config/i18n";
import { useTranslations } from "next-intl";

interface Unit {
  id: string;
  number: string;
  price: number;
  status: string;
  floor: number | null;
  layoutId: string;
  views?: number;
}

interface ProjectUnitsListProps {
  buildingData?: any;
  isPublic?: boolean;
}

const ProjectUnitsList = ({
  buildingData,
  isPublic = false
}: ProjectUnitsListProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const params = useParams();

  const router = useRouter();

  const { selectedLayouts } = useLayouts();

  const t = useTranslations("ProjectDetails.tabs.masterPlan.projectUnitsList");
  const amountT = useTranslations("Amounts");
  const currencyT = useTranslations("projects.currency.symbols");

  console.log("ProjectUnitsList - selectedLayouts:", selectedLayouts);
  console.log(
    "ProjectUnitsList - selectedLayouts с units:",
    selectedLayouts.filter(layout => layout.units && layout.units.length > 0)
  );
  console.log("ProjectUnitsList - buildingData:", buildingData);

  // Получаем валюту из проекта или используем дефолтное значение
  const projectCurrency = buildingData?.project?.currency || "USD";

  const allUnits = useMemo(() => {
    const units = selectedLayouts
      .filter(
        layout =>
          layout.units && Array.isArray(layout.units) && layout.units.length > 0
      )
      .flatMap(layout => {
        return layout.units!.map(unit => ({
          ...unit,
          layout: {
            id: layout.id,
            name: layout.name,
            currency: projectCurrency,
            bedrooms: layout.bedrooms || 0,
            bathrooms: layout.bathrooms || 0,
            totalArea: layout.totalArea || 0
          }
        }));
      });

    console.log("ProjectUnitsList - собранные юниты:", units);
    return units;
  }, [selectedLayouts, projectCurrency]);

  const pages = useMemo(() => {
    return Math.ceil(allUnits.length / itemsPerPage);
  }, [allUnits.length, itemsPerPage]);

  const paginatedUnits = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return allUnits.slice(startIndex, startIndex + itemsPerPage);
  }, [allUnits, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusColor = (status: string) => {
    if (!status) return "";

    switch (status) {
      case "AVAILABLE":
        return styles.statusAvailable;
      case "RESERVED":
        return styles.statusReserved;
      case "SOLD":
        return styles.statusSold;
      default:
        return styles.statusUnavailable;
    }
  };

  // Функция для локализации статуса юнита
  const getLocalizedStatus = (status: string) => {
    if (!status) return "-";

    return t(`statuses.${status}`);
  };

  if (allUnits.length === 0) {
    return (
      <div className={styles.noUnits}>
        <p>{t("noUnits")}</p>
      </div>
    );
  }

  return (
    <div className={`${styles.container}`}>
      <div className={`${styles.unitsTable}`}>
        <div className={`${styles.header}`}>
          <div className={`${styles.headerColumn} ${styles.unit}`}>
            {t("list.header.unit")}
          </div>
          <div className={`${styles.headerColumn} ${styles.layout}`}>
            {t("list.header.layout")}
          </div>
          <div className={`${styles.headerColumn} ${styles.price}`}>
            {t("list.header.price")}
          </div>
          <div className={`${styles.headerColumn} ${styles.beds}`}>
            {t("list.header.beds")}
          </div>
          <div className={`${styles.headerColumn} ${styles.baths}`}>
            {t("list.header.baths")}
          </div>
          <div className={`${styles.headerColumn} ${styles.area}`}>
            {t("list.header.area")}
          </div>
          <div className={`${styles.headerColumn} ${styles.floor}`}>
            {t("list.header.floor")}
          </div>
          <div className={`${styles.headerColumn} ${styles.view}`}>
            {t("list.header.view")}
          </div>

          <div className={`${styles.actions}`}></div>
        </div>

        <div className={`${styles.data}`}>
          {paginatedUnits.map(unit => {
            const formattedPrice = formatNumberType(unit.price);

            return (
              <div
                className={`${styles.row} ${getStatusColor(unit.status)}`}
                key={unit.id}
              >
                <div
                  className={`${styles.unit} ${styles.rowColumn} ${styles.number} ${styles.unitNumber}`}
                >
                  №{" "}
                  {unit.number.length > 7
                    ? unit.number.slice(0, 7) + "..."
                    : unit.number}
                </div>
                <div
                  className={`${styles.layout} ${styles.rowColumn} ${styles.layoutName}`}
                >
                  {unit.layout.name.length > 10
                    ? unit.layout.name.slice(0, 10) + "..."
                    : unit.layout.name}
                </div>
                <div
                  className={`${styles.price} ${styles.rowColumn} ${styles.unitPrice}`}
                >
                  {unit.price > 0
                    ? `${currencyT(unit.layout.currency as keyof typeof currencyT) || unit.layout.currency} ${formattedPrice.number} ${amountT(formattedPrice.type as keyof typeof amountT) || ""}`
                    : getLocalizedStatus(unit.status)}
                </div>
                <div
                  className={`${styles.beds} ${styles.rowColumn} ${styles.unitBeds}`}
                >
                  {unit.layout.bedrooms}
                </div>
                <div
                  className={`${styles.baths} ${styles.rowColumn} ${styles.unitBaths}`}
                >
                  {unit.layout.bathrooms}
                </div>
                <div
                  className={`${styles.area} ${styles.rowColumn} ${styles.unitArea}`}
                >
                  {unit.layout.totalArea}
                </div>
                <div
                  className={`${styles.floor} ${styles.rowColumn} ${styles.unitFloor}`}
                >
                  {unit.floor}
                </div>
                <div
                  className={`${styles.floor} ${styles.rowColumn} ${styles.unitView}`}
                >
                  {unit.views || "-"}
                </div>

                <div className={`${styles.actions}`}>
                  <button
                    className={`${styles.markAction}`}
                    onClick={e => {
                      e.preventDefault();
                    }}
                  >
                    <FaRegBookmark />
                  </button>

                  <button
                    className={`${styles.viewAction}`}
                    onClick={() =>
                      router.push(
                        `/${isPublic ? "p" : "projects"}/${isPublic ? params.slug : buildingData.project.id}/units/${isPublic ? unit.slug : unit.id}`
                      )
                    }
                  >
                    {t("list.actions.view")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {pages > 1 && (
        <Pagination
          showControls
          initialPage={currentPage}
          total={pages}
          onChange={handlePageChange}
          classNames={{
            wrapper: styles.paginationWrapper,
            cursor: styles.paginationCursor
          }}
        />
      )}
    </div>
  );
};

export default ProjectUnitsList;
