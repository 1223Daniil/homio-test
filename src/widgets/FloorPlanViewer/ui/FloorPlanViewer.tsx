import { AnimatePresence, motion } from "framer-motion";
import {
  Button,
  Card,
  CardBody,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader
} from "@heroui/react";
import { FloorPlanViewerProps, Unit, ViewMode } from "../model/types";
import { IconMaximize, IconX } from "@tabler/icons-react";
import { calculateTooltipPosition, parseSvgData } from "../lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";

import { FloorSelector } from "./FloorSelector";
import { SvgOverlay } from "./SvgOverlay";
import { UnitInfoTooltip } from "./UnitInfoTooltip";
import { ViewModeSelector } from "./ViewModeSelector";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export const FloorPlanViewer = ({
  projectId,
  floorPlans,
  selectedFloor,
  onFloorChange,
  selectedUnitId
}: FloorPlanViewerProps) => {
  const t = useTranslations("Units");
  const t2 = useTranslations("ProjectDetails");

  // Состояния
  const [viewMode, setViewMode] = useState<ViewMode>("floors");
  const [hoveredUnit, setHoveredUnit] = useState<Unit | null>(null);
  const [pinnedUnit, setPinnedUnit] = useState<Unit | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Рефы
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Хуки
  const isMobile = useMediaQuery("(max-width: 768px)");
  const router = useRouter();

  // Получаем выбранный план этажа и его SVG данные
  const selectedPlan = floorPlans.find(
    plan => plan.floorNumber === selectedFloor
  );
  const svgData = selectedPlan?.svgData
    ? parseSvgData(selectedPlan.svgData)
    : [];

  // Если передан ID юнита, находим его и устанавливаем как выбранный
  useEffect(() => {
    if (selectedUnitId && selectedPlan) {
      const unit = selectedPlan.units?.find(u => u.id === selectedUnitId);
      if (unit) {
        setPinnedUnit(unit);
      }
    }
  }, [selectedUnitId, selectedPlan]);

  // Обработчик движения мыши для позиционирования тултипа
  const handleMouseMove = useCallback((e: React.MouseEvent<SVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMousePosition(prev => {
      if (Math.abs(prev.x - x) < 5 && Math.abs(prev.y - y) < 5) {
        return prev;
      }
      return { x, y };
    });
  }, []);

  // Вычисляем позицию тултипа
  useEffect(() => {
    if (!containerRef.current || !tooltipRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    const position = calculateTooltipPosition(
      mousePosition,
      containerRect,
      tooltipRect
    );

    setTooltipPosition(position);
  }, [mousePosition]);

  // Обработчик клика по юниту
  const handleUnitClick = useCallback((unit: Unit | null) => {
    if (!unit) return;
    setPinnedUnit(unit);
  }, []);

  // Обработчик наведения на юнит
  const handleUnitHover = useCallback((unit: Unit | null) => {
    setHoveredUnit(unit);
  }, []);

  return (
    <div className="relative w-full">
      {/* Верхняя панель с переключателями режимов и выбором этажа */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <ViewModeSelector currentMode={viewMode} onModeChange={setViewMode} />

        {/* Мобильный селектор этажей */}
        {isMobile && (
          <FloorSelector
            floors={floorPlans}
            selectedFloor={selectedFloor}
            onFloorChange={onFloorChange}
            isMobile={true}
          />
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Десктопный селектор этажей */}
        {!isMobile && viewMode === "floors" && (
          <FloorSelector
            floors={floorPlans}
            selectedFloor={selectedFloor}
            onFloorChange={onFloorChange}
            isMobile={false}
          />
        )}

        {/* Отображение плана этажа */}
        <div className="flex-grow relative" ref={containerRef}>
          {selectedPlan ? (
            <Card className="w-full">
              <CardBody className="p-0">
                <div className="relative group">
                  {/* Кнопка полноэкранного режима */}
                  <Button
                    isIconOnly
                    size="sm"
                    color="default"
                    variant="flat"
                    className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setIsModalOpen(true)}
                  >
                    <IconMaximize size={20} />
                  </Button>

                  {/* План этажа с SVG разметкой */}
                  <motion.div
                    key={selectedPlan.floorNumber}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative"
                  >
                    <img
                      src={selectedPlan.imageUrl}
                      alt={`Floor ${selectedPlan.floorNumber} plan`}
                      className="w-full h-full object-contain"
                    />
                    <SvgOverlay
                      svgData={svgData}
                      selectedPlan={selectedPlan}
                      hoveredUnit={hoveredUnit}
                      pinnedUnit={pinnedUnit}
                      onUnitHover={handleUnitHover}
                      onUnitClick={handleUnitClick}
                    />
                  </motion.div>

                  {/* Тултип с информацией о юните */}
                  <div ref={tooltipRef}>
                    {(hoveredUnit || pinnedUnit) && (
                      <UnitInfoTooltip
                        unit={pinnedUnit || hoveredUnit}
                        position={tooltipPosition}
                        isPinned={!!pinnedUnit}
                        onClose={() => setPinnedUnit(null)}
                        buildingId={selectedPlan.buildingId}
                        planImageUrl={selectedPlan.imageUrl}
                        projectId={projectId}
                      />
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {t2("tabs.plans.selectFloorPrompt")}
            </div>
          )}
        </div>
      </div>

      {/* Полноэкранный режим */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="full"
        scrollBehavior="inside"
        classNames={{
          wrapper: "items-center justify-center z-[200]",
          base: "m-0 max-w-full h-full",
          body: "p-0 relative",
          header: "border-b border-default-200",
          footer: "border-t border-default-200",
          backdrop: "z-[200]"
        }}
      >
        <ModalContent>
          <ModalHeader className="flex justify-between items-center">
            <span>
              {t2("tabs.plans.floor")} {selectedPlan?.floorNumber}
            </span>
          </ModalHeader>
          <ModalBody>
            <div className="relative w-full h-[calc(100vh-8rem)] flex items-center justify-center bg-default-100">
              <div className="relative w-full h-full max-w-[90vw] max-h-[80vh]">
                <img
                  src={selectedPlan?.imageUrl}
                  alt={`Floor ${selectedPlan?.floorNumber} plan`}
                  className="w-full h-full object-contain"
                />
                <SvgOverlay
                  svgData={svgData}
                  selectedPlan={selectedPlan}
                  hoveredUnit={hoveredUnit}
                  pinnedUnit={pinnedUnit}
                  onUnitHover={handleUnitHover}
                  onUnitClick={handleUnitClick}
                  isModal
                />
                {!isMobile && (hoveredUnit || pinnedUnit) && (
                  <UnitInfoTooltip
                    unit={pinnedUnit || hoveredUnit}
                    position={tooltipPosition}
                    isPinned={!!pinnedUnit}
                    onClose={() => setPinnedUnit(null)}
                    buildingId={selectedPlan?.buildingId}
                    planImageUrl={selectedPlan?.imageUrl}
                    projectId={projectId}
                  />
                )}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onPress={() => setIsModalOpen(false)}
            >
              {t("buttons.back")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Мобильная панель с информацией о юните */}
      {isMobile && pinnedUnit && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-default-50 dark:bg-default-100 rounded-t-xl shadow-xl"
          style={{ maxHeight: "85vh", overflowY: "auto" }}
        >
          <div className="sticky top-0 flex justify-between items-center p-4 bg-default-50 dark:bg-default-100 border-b border-default-200">
            <h3 className="text-lg font-semibold">
              {t("title")} {pinnedUnit.number}
            </h3>
            <Button
              isIconOnly
              variant="light"
              onClick={() => setPinnedUnit(null)}
            >
              <IconX size={20} />
            </Button>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {pinnedUnit.area && (
                  <div>
                    <div className="text-sm text-default-500">
                      {t("card.area")}
                    </div>
                    <div className="font-medium">{pinnedUnit.area} m²</div>
                  </div>
                )}
                {pinnedUnit.bedrooms !== undefined && (
                  <div>
                    <div className="text-sm text-default-500">
                      {t("card.bedrooms")}
                    </div>
                    <div className="font-medium">{pinnedUnit.bedrooms}</div>
                  </div>
                )}
                {pinnedUnit.price && (
                  <div className="col-span-2">
                    <div className="text-sm text-default-500">
                      {t("card.price")}
                    </div>
                    <div className="font-medium text-primary text-xl">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      }).format(pinnedUnit.price)}
                    </div>
                  </div>
                )}
              </div>

              <Button
                color="primary"
                className="w-full"
                onClick={() =>
                  router.push(`/projects/${projectId}/units/${pinnedUnit.id}`)
                }
              >
                {t("card.view")}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
