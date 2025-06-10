"use client";

import { Card, CardBody, Button } from "@heroui/react";
import { IconArrowRight } from "@tabler/icons-react";
import { useRouter } from "@/config/i18n";
import { Unit, UnitMedia, BuildingMedia } from "@prisma/client";

interface UnitCardProps {
  unit: Unit & {
    media?: UnitMedia[];
  };
  buildingMedia?: BuildingMedia[];
  projectId: string;
}

export function UnitCard({ unit, buildingMedia, projectId }: UnitCardProps) {
  const router = useRouter();

  // Находим план помещения в media здания
  const layoutPlan = buildingMedia?.find(
    media =>
      media.category === "LAYOUT_PLANS" && media.layoutPlan === unit.layoutPlan
  );

  // Если есть план помещения - показываем его, иначе показываем первое изображение квартиры
  const imageUrl = layoutPlan?.url || unit.media?.[0]?.url;

  return (
    <Card
      className="w-full"
      classNames={{
        base: "bg-white dark:bg-[#2C2C2C] border-default-200"
      }}
    >
      <CardBody>
        {/* Unit Image */}
        {imageUrl && (
          <div className="w-full h-48 mb-4 relative bg-[#F5F5F7] dark:bg-[#2C2C2C] rounded-lg">
            <img
              src={imageUrl}
              alt={`Unit ${unit.number} layout`}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        )}

        {/* Unit Info */}
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-default-900 dark:text-white">
                Unit {unit.number}
              </h3>
            </div>
            <span
              className={`
              text-xs px-2 py-1 rounded-full
              ${
                unit.status === "AVAILABLE"
                  ? "bg-success/10 text-success"
                  : unit.status === "RESERVED"
                    ? "bg-warning/10 text-warning"
                    : "bg-default/10 text-default-600"
              }
            `}
            >
              {unit.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1 text-sm">
            <div>
              <span className="text-default-500 dark:text-gray-400">Area:</span>
              <span className="ml-1 text-default-900 dark:text-white">
                {unit.area} m²
              </span>
            </div>
            <div className="whitespace-nowrap">
              <span className="text-default-500 dark:text-gray-400">
                Price:
              </span>
              <span className="ml-1 text-default-900 dark:text-white">
                {unit.price?.toLocaleString()} ฿
              </span>
            </div>
            {unit.bedrooms && (
              <div>
                <span className="text-default-500 dark:text-gray-400">
                  Bedrooms:
                </span>
                <span className="ml-1 text-default-900 dark:text-white">
                  {unit.bedrooms}
                </span>
              </div>
            )}
            {unit.bathrooms && (
              <div>
                <span className="text-default-500 dark:text-gray-400">
                  Bathrooms:
                </span>
                <span className="ml-1 text-default-900 dark:text-white">
                  {unit.bathrooms}
                </span>
              </div>
            )}
          </div>

          <div className="pt-4">
            <Button
              color="secondary"
              variant="solid"
              size="sm"
              className="w-full"
              endContent={<IconArrowRight size={16} />}
              onClick={() =>
                router.push(`/projects/${projectId}/units/${unit.id}`)
              }
            >
              View Details
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
