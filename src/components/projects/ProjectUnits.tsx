import { Button, Card, CardBody, Chip } from "@heroui/react";
import React, { useEffect, useState } from "react";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface ProjectUnitsProps {
  buildings: any[];
  projectId: string;
  projectSlug?: string;
  currency: string;
  locale: string;
  filters: {
    availability: string[];
    bedrooms: number[];
    priceRange: [number, number];
    areaRange: [number, number];
    windowView: string[];
  };
  publicMode?: boolean;
}

export function ProjectUnits({
  buildings,
  projectId,
  projectSlug,
  currency,
  locale,
  filters,
  publicMode = false
}: ProjectUnitsProps) {
  const t = useTranslations("Units");
  const currenciesT = useTranslations("projects.currency.symbols");
  const router = useRouter();

  console.log("projectSlug", projectSlug, buildings[0]);

  // Filter units based on the provided filters
  const filteredBuildings = buildings
    .map(building => ({
      ...building,
      units: (building.units || []).filter(unit => {
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
        if (
          unit.price &&
          (unit.price < filters.priceRange[0] ||
            unit.price > filters.priceRange[1])
        ) {
          return false;
        }

        // Area filter
        if (
          unit.area &&
          (unit.area < filters.areaRange[0] || unit.area > filters.areaRange[1])
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
      })
    }))
    .filter(building => building.units.length > 0);

  const getStatusTranslation = (status: string) => {
    switch (status.toLowerCase()) {
      case "available":
        return t("status.available");
      case "reserved":
        return t("status.reserved");
      case "sold":
        return t("status.sold");
      default:
        return status;
    }
  };

  const getWindowViewTranslation = (view: string) => {
    switch (view.toLowerCase()) {
      case "sea":
        return t("filters.windowView.sea");
      case "mountain":
        return t("filters.windowView.mountain");
      case "city":
        return t("filters.windowView.city");
      case "garden":
        return t("filters.windowView.garden");
      default:
        return view;
    }
  };

  return (
    <div className="space-y-8">
      {filteredBuildings.map(building => (
        <div key={building.id} className="space-y-4">
          <h3 className="text-xl font-semibold text-default-900">
            {building.name || t("unnamed")}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {building.units.map(unit => (
              <Card key={unit.id} className="bg-white dark:bg-[#2C2C2C]">
                <CardBody>
                  {/* Unit details */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-lg font-medium">
                        {t("unitTitle", { number: unit.number })}
                      </h4>
                      <Chip
                        size="sm"
                        variant="flat"
                        color={
                          unit.status === "AVAILABLE"
                            ? "success"
                            : unit.status === "RESERVED"
                              ? "warning"
                              : "default"
                        }
                      >
                        {getStatusTranslation(unit.status)}
                      </Chip>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">
                          {t("card.floor")}:
                        </span>{" "}
                        {unit.floor}
                      </div>
                      <div>
                        <span className="text-gray-500">{t("card.area")}:</span>{" "}
                        {unit.area} m²
                      </div>
                      {unit.bedrooms && (
                        <div>
                          <span className="text-gray-500">
                            {t("card.bedrooms")}:
                          </span>{" "}
                          {unit.bedrooms}
                        </div>
                      )}
                      {unit.windowView && (
                        <div>
                          <span className="text-gray-500">
                            {t("card.view")}:
                          </span>{" "}
                          {getWindowViewTranslation(unit.windowView)}
                        </div>
                      )}
                    </div>

                    {unit.price && (
                      <div className="text-lg font-semibold text-primary">
                        {currenciesT(currency as keyof typeof currenciesT) ||
                          currency}{" "}
                        {new Intl.NumberFormat(
                          locale === "ru" ? "ru-RU" : "en-US",
                          {
                            style: "decimal",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          }
                        ).format(unit.price)}
                      </div>
                    )}

                    <Button
                      size="sm"
                      color="primary"
                      variant="flat"
                      className="w-full"
                      onClick={() => {
                        router.push(
                          publicMode
                            ? `/${locale}/p/${projectSlug}/units/${unit.slug}`
                            : `/${locale}/projects/${projectId}/units/${unit.id}`
                        );
                      }}
                    >
                      {t("card.toView")}
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {filteredBuildings.length === 0 && (
        <Card>
          <CardBody className="text-center py-8">
            <p className="text-default-500">{t("noUnits")}</p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
