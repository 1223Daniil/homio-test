import { Button, Card, CardBody, Chip, Spinner } from "@heroui/react";
import { IconDownload, IconEye } from "@tabler/icons-react";
import { useMemo, useState } from "react";

import { FloorPlanFilters } from "./FloorPlanFilters";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface FloorPlan {
  id: string;
  buildingId: string;
  floorNumber: number;
  imageUrl: string;
  name: string;
  status: string;
  units?: Array<{
    id: string;
    number: string;
    status: string;
    bedrooms?: number;
    price?: number;
    area?: number;
    windowView?: string;
  }>;
}

interface Building {
  id: string;
  name: string;
  floorPlans: FloorPlan[];
}

interface ProjectFloorPlansProps {
  buildings: Building[];
  projectId: string;
  locale: string;
  currency: string;
}

export function ProjectFloorPlans({
  buildings,
  projectId,
  locale,
  currency
}: ProjectFloorPlansProps) {
  const t = useTranslations("ProjectDetails");
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(
    buildings[0]?.id || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Дефолтные значения для фильтров
  const defaultFilters = {
    availability: ["AVAILABLE"] as string[],
    bedrooms: [] as number[],
    priceRange: [0, 10000000] as [number, number],
    areaRange: [0, 500] as [number, number],
    windowView: [] as string[]
  };

  const [filters, setFilters] = useState(defaultFilters);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleResetFilters = () => {
    setFilters(defaultFilters);
  };

  // Filter floor plans based on selected filters
  const filteredBuildings = useMemo(() => {
    return buildings.map(building => {
      if (selectedBuilding && building.id !== selectedBuilding) {
        return { ...building, floorPlans: [] };
      }

      const filteredPlans = building.floorPlans
        .map(plan => {
          const filteredUnits = (plan.units || []).filter(unit => {
            // Availability filter
            if (
              filters.availability.length > 0 &&
              !filters.availability.includes(unit.status)
            ) {
              return false;
            }

            // Bedrooms filter
            if (
              filters.bedrooms.length > 0 &&
              !filters.bedrooms.includes(unit.bedrooms || 0)
            ) {
              return false;
            }

            // Price filter
            const unitPrice = unit.price || 0;
            if (
              unitPrice < filters.priceRange[0] ||
              unitPrice > filters.priceRange[1]
            ) {
              return false;
            }

            // Area filter
            const unitArea = unit.area || 0;
            if (
              unitArea < filters.areaRange[0] ||
              unitArea > filters.areaRange[1]
            ) {
              return false;
            }

            // Window view filter
            if (
              filters.windowView.length > 0 &&
              !filters.windowView.includes(unit.windowView || "")
            ) {
              return false;
            }

            return true;
          });

          return {
            ...plan,
            units: filteredUnits,
            hasFilteredUnits: filteredUnits.length > 0
          };
        })
        .filter(plan => plan.hasFilteredUnits); // Only show floors with matching units

      return {
        ...building,
        floorPlans: filteredPlans
      };
    });
  }, [buildings, selectedBuilding, filters]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <FloorPlanFilters
        buildings={buildings}
        selectedBuilding={selectedBuilding}
        onBuildingChange={setSelectedBuilding}
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        currency={currency}
      />

      {error && (
        <Card>
          <CardBody className="text-center py-4 text-danger">{error}</CardBody>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* Floor Plans */}
          {filteredBuildings.map(
            building =>
              building.floorPlans.length > 0 && (
                <div key={building.id} className="space-y-4">
                  <h3 className="text-xl font-semibold text-default-900">
                    {building.name}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {building.floorPlans
                      .sort((a, b) => b.floorNumber - a.floorNumber)
                      .map(floorPlan => (
                        <Card
                          key={floorPlan.id}
                          className="bg-white dark:bg-[#2C2C2C]"
                        >
                          <CardBody className="p-0">
                            {/* План этажа */}
                            <div className="relative aspect-[4/3] overflow-hidden">
                              <img
                                src={floorPlan.imageUrl}
                                alt={`Floor ${floorPlan.floorNumber} plan`}
                                className="w-full h-full object-cover"
                              />

                              {/* Оверлей с информацией */}
                              <div className="absolute top-2 left-2">
                                <Chip
                                  size="sm"
                                  variant="flat"
                                  color="primary"
                                  className="text-xs"
                                >
                                  {t("tabs.plans.floor")}{" "}
                                  {floorPlan.floorNumber}
                                </Chip>
                              </div>

                              {/* Статистика по юнитам */}
                              {floorPlan.units &&
                                floorPlan.units.length > 0 && (
                                  <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
                                    <Chip
                                      size="sm"
                                      variant="flat"
                                      color="success"
                                      className="text-xs"
                                    >
                                      {floorPlan.units.length}{" "}
                                      {t("tabs.plans.units")}
                                    </Chip>
                                    <Chip
                                      size="sm"
                                      variant="flat"
                                      color="warning"
                                      className="text-xs"
                                    >
                                      {
                                        floorPlan.units.filter(
                                          u => u.status === "AVAILABLE"
                                        ).length
                                      }{" "}
                                      {t("tabs.plans.available")}
                                    </Chip>
                                  </div>
                                )}
                            </div>

                            {/* Действия */}
                            <div className="p-4 flex justify-between items-center">
                              <Link
                                href={`/${locale}/projects/${projectId}/buildings/${building.id}/floor-plans`}
                                className="text-primary hover:text-primary/80 flex items-center gap-2"
                              >
                                <IconEye size={20} />
                                <span>{t("tabs.plans.view")}</span>
                              </Link>

                              <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                color="primary"
                                onClick={() =>
                                  window.open(floorPlan.imageUrl, "_blank")
                                }
                              >
                                <IconDownload size={20} />
                              </Button>
                            </div>
                          </CardBody>
                        </Card>
                      ))}
                  </div>
                </div>
              )
          )}

          {filteredBuildings.every(b => b.floorPlans.length === 0) && (
            <Card>
              <CardBody className="text-center py-8">
                <p className="text-default-500">{t("tabs.plans.noPlans")}</p>
              </CardBody>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
