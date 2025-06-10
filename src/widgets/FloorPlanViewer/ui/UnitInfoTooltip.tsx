import { AnimatePresence, motion } from "framer-motion";
import { IconArrowRight, IconX } from "@tabler/icons-react";
import { formatPrice, getWindowViewTranslation } from "../lib/utils";

import { Button } from "@heroui/react";
import Link from "next/link";
import { UnitInfoTooltipProps } from "../model/types";
import { useTranslations } from "next-intl";

export const UnitInfoTooltip = ({
  unit,
  position,
  isPinned,
  onClose,
  buildingId,
  planImageUrl,
  projectId
}: UnitInfoTooltipProps) => {
  const t = useTranslations("Units");

  if (!unit) return null;

  // Создаем объект с переводами для видов из окна
  const windowViewTranslations: Record<string, string> = {
    "windowView.sea": t("windowView.sea"),
    "windowView.mountain": t("windowView.mountain"),
    "windowView.city": t("windowView.city"),
    "windowView.garden": t("windowView.garden")
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`unit-tooltip-${unit.id}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`absolute z-[100] bg-background dark:bg-default-100 p-4 rounded-lg shadow-lg ${
          isPinned ? "cursor-auto" : "pointer-events-none"
        }`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: "300px",
          transformOrigin: "top left"
        }}
        transition={{
          duration: 0.15,
          ease: "easeOut"
        }}
      >
        <div className="space-y-2">
          {isPinned && (
            <div className="flex justify-between items-center mb-2">
              <div className="font-medium text-default-900">
                {t("title")} {unit.number}
              </div>
              <Button isIconOnly size="sm" variant="light" onClick={onClose}>
                <IconX size={16} />
              </Button>
            </div>
          )}
          {!isPinned && (
            <div className="font-medium text-default-900">
              {t("title")} {unit.number}
            </div>
          )}
          <div className="text-sm grid grid-cols-2 gap-2">
            <div className="text-default-700">
              <span className="text-default-500">{t("card.area")}:</span>{" "}
              {unit.area} m²
            </div>
            {unit.bedrooms !== undefined && (
              <div className="text-default-700">
                <span className="text-default-500">{t("card.bedrooms")}:</span>{" "}
                {unit.bedrooms}
              </div>
            )}
            {unit.windowView && (
              <div className="text-default-700">
                <span className="text-default-500">{t("card.view")}:</span>{" "}
                {getWindowViewTranslation(
                  unit.windowView,
                  windowViewTranslations
                )}
              </div>
            )}
            {unit.price && (
              <div className="col-span-2 text-primary font-medium">
                {formatPrice(unit.price)}
              </div>
            )}
          </div>
          {isPinned && buildingId && (
            <Link
              href={`/projects/${projectId}/units/${unit.id}`}
              className="flex items-center gap-2 text-primary mt-4 hover:opacity-80"
            >
              {t("card.view")}
              <IconArrowRight size={20} />
            </Link>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
