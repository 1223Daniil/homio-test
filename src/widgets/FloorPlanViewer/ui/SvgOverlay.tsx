import { SvgOverlayProps } from "../model/types";
import { motion } from "framer-motion";

export const SvgOverlay = ({
  svgData,
  selectedPlan,
  hoveredUnit,
  pinnedUnit,
  onUnitHover,
  onUnitClick,
  isModal = false
}: SvgOverlayProps) => {
  // Определяем цвета для разных статусов юнитов
  const getUnitFillColor = (status?: string) => {
    switch (status) {
      case "AVAILABLE":
        return "rgba(0, 255, 0, 0.2)";
      case "RESERVED":
        return "rgba(255, 165, 0, 0.2)";
      case "SOLD":
        return "rgba(255, 0, 0, 0.2)";
      default:
        return "rgba(200, 200, 200, 0.2)"; // Недоступные юниты
    }
  };

  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox={`0 0 ${isModal ? "1000 1000" : "100 100"}`}
      preserveAspectRatio="none"
      style={{ pointerEvents: "none" }}
    >
      <g style={{ pointerEvents: "all" }}>
        {svgData.map((area: any, index: number) => {
          const unit = selectedPlan?.areas?.find(u => u.unitId === area.unitId);
          const fillColor = getUnitFillColor(unit?.status);

          const isSelected =
            pinnedUnit?.id === unit?.unitId || hoveredUnit?.id === unit?.unitId;

          return (
            <motion.path
              key={index}
              d={area.svgPath}
              fill={fillColor}
              stroke={
                isSelected
                  ? "rgba(255, 255, 255, 0.8)"
                  : "rgba(255, 255, 255, 0.5)"
              }
              strokeWidth={isSelected ? "0.4" : "0.2"}
              className="cursor-pointer"
              whileHover={{
                scale: 1.01,
                filter: "brightness(1.2)"
              }}
              onClick={() => {
                if (unit) {
                  const unitObj = selectedPlan?.units?.find(
                    u => u.id === unit.unitId
                  );
                  if (unitObj) {
                    onUnitClick(unitObj);
                  }
                }
              }}
              onHoverStart={() => {
                if (!pinnedUnit && unit) {
                  const unitObj = selectedPlan?.units?.find(
                    u => u.id === unit.unitId
                  );
                  if (unitObj) {
                    onUnitHover(unitObj);
                  }
                }
              }}
              onHoverEnd={() => {
                if (!pinnedUnit) {
                  onUnitHover(null);
                }
              }}
              animate={
                isSelected
                  ? {
                      opacity: [0.8, 1],
                      scale: [1, 1.02]
                    }
                  : {}
              }
              transition={{
                repeat: isSelected ? Infinity : 0,
                duration: 0.8,
                ease: "easeInOut"
              }}
            />
          );
        })}
      </g>
    </svg>
  );
};
