import { Building, BuildingMedia, Unit, UnitMedia } from "@prisma/client";
import { Accordion, AccordionItem } from "@heroui/react";
import { Card, CardBody } from "@heroui/react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell
} from "@heroui/react";
import { IconBuilding, IconStairs } from "@tabler/icons-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

interface ProjectUnitsProps {
  buildings: (Building & {
    units: (Unit & {
      media: UnitMedia[];
    })[];
    media: BuildingMedia[];
  })[];
  projectId: string;
  currency?: string;
}

export function ProjectUnits({ buildings, projectId, currency = "USD" }: ProjectUnitsProps) {
  const params = useParams();
  const locale = params?.locale as string || "en";
  const t = useTranslations("Units");

  // Группируем юниты по этажам для каждого здания
  const getFloorUnits = (units: (Unit & { media: UnitMedia[] })[]) => {
    const floorUnits = units.reduce(
      (acc, unit) => {
        const floor = unit.floor || 0;
        if (!acc[floor]) {
          acc[floor] = [];
        }
        acc[floor].push(unit);
        return acc;
      },
      {} as Record<number, (Unit & { media: UnitMedia[] })[]>
    );

    // Сортируем этажи по возрастанию
    return Object.entries(floorUnits)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([floor, units]) => ({
        floor: Number(floor),
        units: units.sort((a, b) =>
          (a.number || "").localeCompare(b.number || "")
        )
      }));
  };

  return (
    <div className="flex flex-col gap-2">
      {buildings.map(building => (
        <div key={building.id} className="border border-default-200 rounded-lg">
          <Accordion
            variant="light"
            selectionMode="multiple"
            className="w-full"
          >
            <AccordionItem
              key={building.id}
              aria-label={building.name || "Building"}
              classNames={{
                base: "group-[.is-splitted]:shadow-none",
                title: "font-normal text-default-500",
                trigger:
                  "px-2 py-0 data-[hover=true]:bg-default-100 rounded-lg h-14",
                indicator: "text-default-400",
                content: "pt-2 pb-0"
              }}
              title={
                <div className="flex items-center gap-2">
                  <IconBuilding className="text-primary" />
                  <span className="font-medium text-default-700">
                    {building.name || t("building.untitled")}
                  </span>
                  <span className="text-sm text-default-400">
                    ({building.units.length} {t("building.units")})
                  </span>
                </div>
              }
            >
              <div className="px-2 pb-2">
                {getFloorUnits(building.units).map(({ floor, units }) => (
                  <Card
                    key={floor}
                    className="mb-3 shadow-none border border-default-200"
                  >
                    <CardBody>
                      <div className="flex items-center gap-2 mb-2">
                        <IconStairs className="text-primary" />
                        <span className="font-medium">
                          {t("floor.title", { number: floor === 0 ? t("floor.ground") : floor })}
                        </span>
                        <span className="text-sm text-default-400">
                          ({units.length} {t("floor.units")})
                        </span>
                      </div>

                      <Table
                        aria-label={t("table.aria.units", { floor })}
                        className="mt-2"
                        removeWrapper
                      >
                        <TableHeader>
                          <TableColumn>{t("table.headers.unit")}</TableColumn>
                          <TableColumn>{t("table.headers.area")}</TableColumn>
                          <TableColumn>{t("table.headers.bedrooms")}</TableColumn>
                          <TableColumn>{t("table.headers.bathrooms")}</TableColumn>
                          <TableColumn>{t("table.headers.price", { currency })}</TableColumn>
                          <TableColumn>{t("table.headers.status")}</TableColumn>
                        </TableHeader>
                        <TableBody>
                          {units.map(unit => (
                            <TableRow key={unit.id}>
                              <TableCell>
                                <Link
                                  href={`/${locale}/projects/${projectId}/units/${unit.id}`}
                                  className="text-primary hover:text-primary-600 hover:underline"
                                >
                                  {unit.number}
                                </Link>
                              </TableCell>
                              <TableCell>{unit.area}</TableCell>
                              <TableCell>{unit.bedrooms}</TableCell>
                              <TableCell>{unit.bathrooms}</TableCell>
                              <TableCell>
                                {unit.price
                                  ? unit.price.toLocaleString()
                                  : t("price.onRequest")}
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    unit.status === "AVAILABLE"
                                      ? "bg-success/10 text-success"
                                      : unit.status === "RESERVED"
                                        ? "bg-warning/10 text-warning"
                                        : "bg-danger/10 text-danger"
                                  }`}
                                >
                                  {t(`status.${unit.status.toLowerCase()}`)}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </AccordionItem>
          </Accordion>
        </div>
      ))}
    </div>
  );
}
