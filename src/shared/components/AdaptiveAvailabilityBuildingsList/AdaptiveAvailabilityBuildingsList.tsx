import { Building, Unit, UnitLayout } from "@prisma/client";
import { Button, Select, SelectItem } from "@heroui/react";
import { ChangeEvent, useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";

import { AdaptiveUnitsFloorPlan } from "../AdaptiveUnitsFloorPlan";
import AdaptiveUnitsGrid from "../AdaptiveUnitsGrid";
import AdaptiveUnitsList from "../AdaptiveUnitsList";
import type { CurrencyCode } from "@/utils/currency";
import { FaListUl } from "react-icons/fa";
import { IoGridOutline } from "react-icons/io5";
import { IoIosArrowForward } from "react-icons/io";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { TbBorderCorners } from "react-icons/tb";
import { formatDateToQuarter } from "@/utils/formatQuarterDate";
import { formatNumberType } from "@/utils/formatPrice";
import styles from "./AdaptiveAvailabilityBuildingsList.module.css";
import { useTranslations } from "next-intl";

interface FloorPlan {
  id: string;
  floorNumber: number;
  name: string;
  imageUrl: string;
  svgData: string;
  description: string | null;
  status: string;
  order: number;
}

interface BuildingData {
  layouts: (UnitLayout & { units: Unit[] })[];
  units: Unit[];
  floorPlans: FloorPlan[];
}

interface Props {
  buildings: (Building & BuildingData)[];
  project: {
    id: string;
    offDate: string;
    phase: string;
    currency: string;
  };
}

const swiperOptions = {
  breakpoints: {
    320: {
      slidesPerView: 1,
      spaceBetween: 10
    },
    375: {
      slidesPerView: 1.2,
      spaceBetween: 10
    },
    425: {
      slidesPerView: 1.3,
      spaceBetween: 15
    },
    480: {
      slidesPerView: 1.4,
      spaceBetween: 15
    },
    540: {
      slidesPerView: 1.5,
      spaceBetween: 20
    },
    600: {
      slidesPerView: 1.6,
      spaceBetween: 20
    }
  }
};

const AdaptiveAvailabilityBuildingsList = ({ buildings, project }: Props) => {
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<string>("list");
  useEffect(() => {
    if (selectedBuilding !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [selectedBuilding]);

  const unitsCount = buildings.reduce((acc, building) => {
    return acc + building.units.length;
  }, 0);

  const handleBuildingSelection = (evt: ChangeEvent<HTMLSelectElement>) => {
    setSelectedBuilding(evt.target.value);
  };

  const buildingOptions = [
    ...buildings.map(building => ({
      key: String(building.id),
      label: building.name
    }))
  ];

  return (
    <>
      <Swiper className={`${styles.swiper}`} {...swiperOptions}>
        {buildings.map(building => {
          if (building.layouts.length) {
            return (
              <SwiperSlide key={building.id}>
                <BuildingCard
                  building={building}
                  project={project}
                  setSelectedBuilding={setSelectedBuilding}
                />
              </SwiperSlide>
            );
          }
        })}
      </Swiper>

      {selectedBuilding !== null && (
        <div className={`${styles.layoutsModal}`}>
          <div className={`${styles.layoutsModalHeader}`}>
            <button
              className={`${styles.layoutsModalClose}`}
              onClick={() => setSelectedBuilding(null)}
            >
              <MdKeyboardArrowLeft />
            </button>

            <p className={`${styles.layoutsModalTitle}`}>Availability</p>

            <button className={`${styles.layoutsModalClose}`}></button>
          </div>

          <div className={`${styles.underHeader}`}>
            <Select
              className={`${styles.select}`}
              selectedKeys={selectedBuilding ? [selectedBuilding] : []}
              onChange={handleBuildingSelection}
              placeholder="Select building"
            >
              {buildingOptions.map(option => (
                <SelectItem key={option.key}>{option.label}</SelectItem>
              ))}
            </Select>

            <div className={`${styles.switchers}`}>
              <div
                className={`${styles.switcher} ${
                  selectedView === "list" ? styles.switcherActive : ""
                }`}
                onClick={() => setSelectedView("list")}
              >
                <FaListUl />
              </div>

              <div
                className={`${styles.switcher} ${
                  selectedView === "floor-plan" ? styles.switcherActive : ""
                }`}
                onClick={() => setSelectedView("floor-plan")}
              >
                <TbBorderCorners />
              </div>

              <div
                className={`${styles.switcher} ${
                  selectedView === "grid" ? styles.switcherActive : ""
                }`}
                onClick={() => setSelectedView("grid")}
              >
                <IoGridOutline />
              </div>
            </div>

            <p className={`${styles.unitsCount}`}>{unitsCount} units</p>
          </div>

          <div className={`${styles.layoutsModalContent}`}>
            <div className={`${styles.content}`}>
              {buildings.length > 0 && selectedBuilding !== null && (
                <>
                  {selectedView === "list" ? (
                    <AdaptiveUnitsList
                      layouts={
                        buildings.find(
                          building => String(building.id) === selectedBuilding
                        )?.layouts || []
                      }
                      project={{
                        id: project.id,
                        currency: project.currency,
                        offDate: project.offDate
                      }}
                    />
                  ) : selectedView === "grid" ? (
                    <AdaptiveUnitsGrid
                      floors={
                        buildings.find(
                          building => String(building.id) === selectedBuilding
                        )?.floors || 0
                      }
                      layouts={
                        buildings.find(
                          building => String(building.id) === selectedBuilding
                        )?.layouts || []
                      }
                      project={{
                        id: project.id,
                        currency: project.currency,
                        offDate: project.offDate
                      }}
                    />
                  ) : (
                    <AdaptiveUnitsFloorPlan
                      layouts={
                        buildings.find(
                          building => String(building.id) === selectedBuilding
                        )?.layouts || []
                      }
                      floorPlans={
                        buildings.find(
                          building => String(building.id) === selectedBuilding
                        )?.floorPlans || []
                      }
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdaptiveAvailabilityBuildingsList;

interface BuildingCardProps {
  building: Building & BuildingData;
  project: {
    id: string;
    offDate: string;
    phase: string;
    currency: string;
  };
  setSelectedBuilding: (buildingId: string) => void;
}

function BuildingCard({
  building,
  project,
  setSelectedBuilding
}: BuildingCardProps) {
  const tAmount = useTranslations("Amounts");
  const tCurrency = useTranslations("projects.currency.symbols");

  const handleSelectBuilding = (id: string) => {
    setSelectedBuilding(id);
  };

  return (
    <div className={`${styles.buildingCard}`}>
      <div className={`${styles.cardHeader}`}>
        <p className={`${styles.buildingName}`}>{building.name}</p>

        <div className={`${styles.facts}`}>
          <div className={`${styles.fact}`}>
            <p className={`${styles.factLabel}`}>Off date:</p>
            <p className={`${styles.factValue}`}>
              {project.offDate ? formatDateToQuarter(project.offDate) : "-"}
            </p>
          </div>

          <div className={`${styles.fact}`}>
            <p className={`${styles.factLabel}`}>Phase:</p>
            <p className={`${styles.factValue}`}>{project.phase}</p>
          </div>

          <div className={`${styles.fact}`}>
            <p className={`${styles.factLabel}`}>Floors:</p>
            <p className={`${styles.factValue}`}>{building.floors}</p>
          </div>

          <div className={`${styles.fact}`}>
            <p className={`${styles.factLabel}`}>Aparts:</p>
            <p className={`${styles.factValue}`}>{building.units.length}</p>
          </div>
        </div>
      </div>

      <hr className={`${styles.divider}`} />

      <div className={`${styles.layoutsList}`}>
        {building.layouts.map(layout => {
          const minPrice = building.units.reduce((min, unit) => {
            return Math.min(min, unit.price);
          }, Infinity);

          const { number: formattedMinPrice, type } =
            formatNumberType(minPrice);

          return (
            <div key={layout.id} className={`${styles.layout}`}>
              <div className={`${styles.layoutData}`}>
                <div className={`${styles.layoutCount}`}>
                  {layout.units.length}
                </div>

                <p className={`${styles.layoutType}`}>
                  <span className={`${styles.layoutTitle}`}>
                    {layout.name.length > 10
                      ? layout.name.slice(0, 7) + "..."
                      : layout.name}
                  </span>{" "}
                  <span className={`${styles.layoutPrice}`}>
                    from {tCurrency(project.currency as CurrencyCode)}
                    {formattedMinPrice}
                    {type && tAmount(type as "thousand" | "million")}
                  </span>
                </p>
              </div>

              <IoIosArrowForward className={`${styles.arrow}`} />
            </div>
          );
        })}
      </div>

      <Button
        className={`${styles.showUnitsButton}`}
        onClick={() => handleSelectBuilding(String(building.id))}
      >
        Show {building.units.length} units
      </Button>
    </div>
  );
}
