import { Select, SelectItem } from "@heroui/react";

import { FloorSelectorProps } from "../model/types";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export const FloorSelector = ({
  floors,
  selectedFloor,
  onFloorChange,
  isMobile
}: FloorSelectorProps) => {
  const t = useTranslations("ProjectDetails");

  // Сортируем этажи по убыванию (сверху вниз)
  const sortedFloors = [...floors].sort(
    (a, b) => b.floorNumber - a.floorNumber
  );

  // Мобильная версия с выпадающим списком
  if (isMobile) {
    return (
      <div className="w-full">
        <Select
          size="sm"
          label={t("tabs.plans.selectFloor")}
          selectedKeys={[selectedFloor.toString()]}
          onChange={e => onFloorChange(Number(e.target.value))}
          className="w-full"
        >
          {sortedFloors.map(plan => (
            <SelectItem
              key={plan.floorNumber.toString()}
              value={plan.floorNumber.toString()}
            >
              {t("tabs.plans.floor")} {plan.floorNumber}
            </SelectItem>
          ))}
        </Select>
      </div>
    );
  }

  // Десктопная версия со списком этажей
  return (
    <div className="w-32 flex-shrink-0 bg-default-50 dark:bg-default-100 rounded-lg p-2">
      <div className="text-sm font-medium mb-2">
        {t("tabs.plans.selectFloor")}
      </div>
      <div className="space-y-1">
        {sortedFloors.map(plan => (
          <motion.div
            key={plan.floorNumber}
            className={`
              p-2 rounded-lg cursor-pointer text-sm
              ${
                selectedFloor === plan.floorNumber
                  ? "bg-primary text-white"
                  : "hover:bg-default-100 dark:hover:bg-default-200"
              }
            `}
            onClick={() => onFloorChange(plan.floorNumber)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            layout
          >
            {t("tabs.plans.floor")} {plan.floorNumber}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
