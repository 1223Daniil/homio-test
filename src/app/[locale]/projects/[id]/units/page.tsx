"use client";

import { Button, Card, CardBody, Spinner } from "@heroui/react";
import {
  IconArrowLeft,
  IconCurrencyDollar,
  IconEdit,
  IconFilter,
  IconPlus,
  IconUpload
} from "@tabler/icons-react";
import { useEffect, useState } from "react";

import Link from "next/link";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { useRouter } from "@/config/i18n";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";

interface Unit {
  id: string;
  number?: string;
  floor: number;
  area?: number;
  price: number;
  status: string;
  bedrooms: number;
  bathrooms: number;
  view?: string;
  buildingId: string;
}

interface Building {
  id: string;
  name?: string;
}

export default function UnitsPage() {
  const { theme } = useTheme();
  const t = useTranslations("Units");
  const projectDetailsT = useTranslations("ProjectDetails");
  const router = useRouter();
  const { id, locale } = useParams() as { id: string; locale: string };
  const [isLoading, setIsLoading] = useState(true);
  const [projectName, setProjectName] = useState("");
  const [units, setUnits] = useState<Unit[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [buildingMap, setBuildingMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch project name
        const projectResponse = await fetch(`/api/projects/${id}`);
        if (projectResponse.ok) {
          const projectData = await projectResponse.json();
          const translation = projectData.translations?.find(
            (t: any) => t.language === locale
          );
          setProjectName(translation?.name || t("unnamed"));
        }

        // Fetch buildings
        const buildingsResponse = await fetch(`/api/projects/${id}/buildings`);
        if (buildingsResponse.ok) {
          const buildingsData = await buildingsResponse.json();
          setBuildings(buildingsData);

          // Create building map for quick lookup
          const map: Record<string, string> = {};
          buildingsData.forEach((building: Building) => {
            map[building.id] =
              building.name ||
              `${t("building.untitled")} ${building.id.substring(0, 4)}`;
          });
          setBuildingMap(map);
        }

        // Fetch units
        const unitsResponse = await fetch(`/api/projects/${id}/units`);
        if (unitsResponse.ok) {
          const unitsData = await unitsResponse.json();
          setUnits(unitsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error(t("errors.loading"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, locale, t]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "text-success-500";
      case "RESERVED":
        return "text-warning-500";
      case "SOLD":
        return "text-danger-500";
      default:
        return "text-default-500";
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(locale === "ru" ? "ru-RU" : "en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href={`/${locale}/projects/${id}`}
          className="flex items-center text-default-500 hover:text-primary transition-colors"
        >
          <IconArrowLeft size={16} className="mr-1" />
          {t("buttons.backToBuilding")}
        </Link>
      </div>

      <div className="mb-8 flex flex-wrap justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold mb-2 text-default-900 dark:text-white">
            {t("units")} - {projectName}
          </h1>
          <p className="text-default-500">{t("subtitle")}</p>
        </div>

        <div className="flex gap-2 mt-4 sm:mt-0">
          <Button
            color="primary"
            variant="flat"
            startContent={<IconFilter size={16} />}
          >
            {t("filters.title")}
          </Button>

          <Button
            color="primary"
            startContent={<IconPlus size={16} />}
            onClick={() => router.push(`/projects/${id}/units/new`)}
          >
            {t("buttons.addUnit")}
          </Button>

          <Button
            color="primary"
            variant="flat"
            startContent={<IconUpload size={16} />}
            onClick={() => router.push(`/projects/${id}/units/import`)}
          >
            {t("import.title")}
          </Button>

          <Button
            color="primary"
            variant="flat"
            startContent={<IconEdit size={16} />}
            onClick={() => router.push(`/projects/${id}/units/mass-edit`)}
          >
            {t("massEdit.title")}
          </Button>
          <Button
            color="primary"
            variant="flat"
            startContent={<IconCurrencyDollar size={20} />}
            onClick={() => router.push(`/${locale}/projects/${id}/prices`)}
            className="whitespace-normal h-auto min-h-[40px] text-sm max-w-[200px]"
          >
            {projectDetailsT("headers.editButtons.editPrices")}
          </Button>
        </div>
      </div>

      {units.length === 0 ? (
        <div className="bg-white dark:bg-[#2C2C2C] rounded-lg shadow-sm p-8 text-center">
          <p className="text-default-500 mb-4">{t("noUnits")}</p>
          <Button
            color="primary"
            startContent={<IconPlus size={16} />}
            onClick={() => router.push(`/${locale}/projects/${id}/units/new`)}
          >
            {t("buttons.addUnit")}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {units.map(unit => (
            <Card
              key={unit.id}
              className="bg-white dark:bg-[#2C2C2C] shadow-sm hover:shadow-md transition-shadow"
              isPressable
              onPress={() =>
                router.push(`/${locale}/projects/${id}/units/${unit.id}`)
              }
            >
              <CardBody className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-default-900 dark:text-white">
                      {unit.number || `Unit ${unit.id.substring(0, 4)}`}
                    </h3>
                    <p className="text-sm text-default-500">
                      {buildingMap[unit.buildingId] || t("building.untitled")}
                    </p>
                  </div>
                  <div
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(unit.status)}`}
                  >
                    {unit.status}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div>
                    <p className="text-xs text-default-500">
                      {t("card.floor")}
                    </p>
                    <p className="text-sm font-medium text-default-900 dark:text-white">
                      {unit.floor}
                    </p>
                  </div>
                  {unit.area && (
                    <div>
                      <p className="text-xs text-default-500">
                        {t("card.area")}
                      </p>
                      <p className="text-sm font-medium text-default-900 dark:text-white">
                        {unit.area} m²
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-default-500">
                      {t("card.bedrooms")}
                    </p>
                    <p className="text-sm font-medium text-default-900 dark:text-white">
                      {unit.bedrooms}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-default-500">
                      {t("card.bathrooms")}
                    </p>
                    <p className="text-sm font-medium text-default-900 dark:text-white">
                      {unit.bathrooms}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-3 dark:border-default-100/20">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-default-500">
                        {t("card.price")}
                      </p>
                      <p className="text-base font-semibold text-default-900 dark:text-white">
                        {formatPrice(unit.price)}
                      </p>
                    </div>
                    {unit.view && (
                      <div className="text-right">
                        <p className="text-xs text-default-500">
                          {t("card.view")}
                        </p>
                        <p className="text-sm text-default-900 dark:text-white">
                          {unit.view}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
