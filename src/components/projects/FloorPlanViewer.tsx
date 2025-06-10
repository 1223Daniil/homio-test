import { AnimatePresence, motion } from "framer-motion";
import {
  Button,
  Card,
  CardBody,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem
} from "@heroui/react";
import {
  IconArrowRight,
  IconChevronDown,
  IconMaximize,
  IconX
} from "@tabler/icons-react";
import { useCallback, useEffect, useRef, useState } from "react";

import Link from "next/link";
import { UnitDetails } from "./UnitDetails";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useRouter } from "@/config/i18n";
import { useTranslations } from "next-intl";

interface Unit {
  id: string;
  number: string;
  status: string;
  floor: number;
  bedrooms?: number;
  price?: number;
  area?: number;
  windowView?: "sea" | "mountain" | "city" | "garden";
}

interface FloorPlan {
  id: string;
  buildingId: string;
  floorNumber: number;
  imageUrl: string;
  name: string;
  status: string;
  svgData?: string;
  units?: Unit[];
  areas?: Array<{ unitId: string; svgPath: string }>;
}

interface FloorPlanViewerProps {
  projectId: string;
  floorPlans: FloorPlan[];
  selectedFloor: number;
  onFloorChange: (floor: number) => void;
}

export function FloorPlanViewer({
  projectId,
  floorPlans,
  selectedFloor,
  onFloorChange
}: FloorPlanViewerProps) {
  const t = useTranslations("Units");
  const t2 = useTranslations("ProjectDetails");
  const [hoveredUnit, setHoveredUnit] = useState<Unit | null>(null);
  const [pinnedUnit, setPinnedUnit] = useState<Unit | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const router = useRouter();

  const selectedPlan = floorPlans.find(
    plan => plan.floorNumber === selectedFloor
  );
  const svgData = selectedPlan?.svgData ? JSON.parse(selectedPlan.svgData) : [];
  const sortedFloors = [...floorPlans].sort(
    (a, b) => b.floorNumber - a.floorNumber
  );

  console.log("selectedPlan", selectedPlan);

  const calculateTooltipPosition = useCallback(() => {
    if (!containerRef.current || !tooltipRef.current) return;

    const container = containerRef.current.getBoundingClientRect();
    const tooltip = tooltipRef.current.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    let x = mousePosition.x;
    let y = mousePosition.y;

    // Check if tooltip would go outside the viewport on the right
    if (container.left + x + tooltip.width > viewport.width) {
      x = x - tooltip.width - 40;
    }

    // Check if tooltip would go outside the viewport on the bottom
    if (container.top + y + tooltip.height > viewport.height) {
      y = y - tooltip.height - 20;
    }

    // Ensure tooltip doesn't go outside the viewport on the left
    if (container.left + x < 0) {
      x = -container.left + 20;
    }

    // Ensure tooltip doesn't go outside the viewport on the top
    if (container.top + y < 0) {
      y = -container.top + 20;
    }

    setTooltipPosition({ x, y });
  }, [mousePosition]);

  useEffect(() => {
    calculateTooltipPosition();
  }, [mousePosition, calculateTooltipPosition]);

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

  const handleUnitClick = useCallback(
    (unit: Unit | undefined, e: React.MouseEvent) => {
      if (!unit) return;
      e.stopPropagation();
      setPinnedUnit(unit);

      // Плавный скролл к деталям
      setTimeout(() => {
        const detailsSection = document.getElementById("unit-details");
        if (detailsSection) {
          detailsSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    },
    []
  );

  const handleOpenModal = useCallback((e: React.MouseEvent) => {
    setModalPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    });
    setIsModalOpen(true);
  }, []);

  const getWindowViewTranslation = (view: string) => {
    switch (view) {
      case "sea":
        return t("windowView.sea");
      case "mountain":
        return t("windowView.mountain");
      case "city":
        return t("windowView.city");
      case "garden":
        return t("windowView.garden");
      default:
        return view;
    }
  };

  // Shared SVG overlay component
  const SvgOverlay = ({ isModal = false }: { isModal?: boolean }) => (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox={`0 0 ${isModal ? "1000 1000" : "100 100"}`}
      preserveAspectRatio="none"
      onMouseMove={handleMouseMove}
      style={{ pointerEvents: "none" }}
    >
      <g style={{ pointerEvents: "all" }}>
        {svgData.map((area: any, index: number) => {
          const unit = selectedPlan?.areas?.find(u => u.unitId === area.unitId);
          const fillColor =
            unit?.status === "AVAILABLE"
              ? "rgba(0, 255, 0, 0.2)"
              : unit?.status === "RESERVED"
                ? "rgba(255, 165, 0, 0.2)"
                : "rgba(255, 0, 0, 0.2)";

          const isSelected =
            pinnedUnit?.id === unit?.id || hoveredUnit?.id === unit?.id;

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
              onClick={e => {
                router.push(`/projects/${projectId}/units/${unit?.unitId}`);
              }}
              onHoverStart={() => {
                if (!pinnedUnit && unit) {
                  // Устанавливаем наведённый юнит только если он изменился
                  setHoveredUnit(prevUnit => {
                    if (prevUnit?.id === unit.id) return prevUnit;
                    return {
                      ...unit,
                      floor: selectedPlan?.floorNumber || 1 // Присваиваем значение floor из текущего плана
                    };
                  });
                }
              }}
              onHoverEnd={() => {
                if (!pinnedUnit) {
                  setHoveredUnit(null);
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

  // Unit info tooltip component
  const UnitInfoTooltip = () => {
    const unit = pinnedUnit || hoveredUnit;
    if (!unit) return null;

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={`unit-tooltip-${unit.id}`}
          ref={tooltipRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`absolute z-[100] bg-background dark:bg-default-100 p-4 rounded-lg shadow-lg ${pinnedUnit ? "cursor-auto" : "pointer-events-none"}`}
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            width: "300px",
            transformOrigin: "top left"
          }}
          transition={{
            duration: 0.15,
            ease: "easeOut"
          }}
        >
          <div className="space-y-2">
            {pinnedUnit && (
              <div className="flex justify-between items-center mb-2">
                <div className="font-medium text-default-900">
                  {t("title")} {unit.number}
                </div>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  onClick={() => setPinnedUnit(null)}
                >
                  <IconX size={16} />
                </Button>
              </div>
            )}
            {!pinnedUnit && (
              <div className="font-medium text-default-900">
                {t("title")} {unit.number}
              </div>
            )}
            <div className="text-sm grid grid-cols-2 gap-2">
              <div className="text-default-700">
                <span className="text-default-500">{t("card.area")}:</span>{" "}
                {unit.area} m²
              </div>
              {unit.bedrooms && (
                <div className="text-default-700">
                  <span className="text-default-500">
                    {t("card.bedrooms")}:
                  </span>{" "}
                  {unit.bedrooms}
                </div>
              )}
              {unit.windowView && (
                <div className="text-default-700">
                  <span className="text-default-500">{t("card.view")}:</span>{" "}
                  {getWindowViewTranslation(unit.windowView)}
                </div>
              )}
              {unit.price && (
                <div className="col-span-2 text-primary font-medium">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(unit.price)}
                </div>
              )}
            </div>
            {pinnedUnit && selectedPlan?.buildingId && (
              <Link
                href={{
                  pathname: `/projects/${selectedPlan.buildingId}/units/${unit.id}`
                }}
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

  return (
    <div className="relative w-full">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Floor Selection - Desktop */}
        {!isMobile && (
          <div className="w-32 flex-shrink-0 bg-default-50 dark:bg-default-100 rounded-lg p-2">
            <div className="text-sm font-medium mb-2">
              {t2("tabs.plans.selectFloor")}
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
                  {t2("tabs.plans.floor")} {plan.floorNumber}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Floor Selection - Mobile */}
        {isMobile && (
          <div className="w-full">
            <Select
              size="sm"
              label={t2("tabs.plans.selectFloor")}
              selectedKeys={[selectedFloor.toString()]}
              onChange={e => onFloorChange(Number(e.target.value))}
              className="w-full"
            >
              {sortedFloors.map(plan => (
                <SelectItem
                  key={plan.floorNumber.toString()}
                  value={plan.floorNumber.toString()}
                >
                  {t2("tabs.plans.floor")} {plan.floorNumber}
                </SelectItem>
              ))}
            </Select>
          </div>
        )}

        {/* Floor Plan Display */}
        <div className="flex-grow relative" ref={containerRef}>
          {selectedPlan ? (
            <Card className="w-full">
              <CardBody className="p-0">
                <div className="relative group">
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
                    <SvgOverlay />
                  </motion.div>

                  {/* Unit Info Tooltip - Desktop Only */}
                  {!isMobile && !pinnedUnit && <UnitInfoTooltip />}
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

      {/* Fullscreen Modal */}
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
                <SvgOverlay isModal />
                {!isMobile && <UnitInfoTooltip />}
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

      {/* Bottom Sheet for Mobile */}
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
            <UnitDetails
              unit={pinnedUnit}
              planImageUrl={selectedPlan?.imageUrl || ""}
              buildingId={selectedPlan?.buildingId || ""}
              onClose={() => setPinnedUnit(null)}
              isMobile={true}
            />
          </div>
        </motion.div>
      )}

      {/* Desktop Unit Details */}
      {!isMobile && pinnedUnit && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="mt-8"
        >
          <UnitDetails
            unit={pinnedUnit}
            planImageUrl={selectedPlan?.imageUrl || ""}
            buildingId={selectedPlan?.buildingId || ""}
            onClose={() => setPinnedUnit(null)}
            isMobile={false}
          />
        </motion.div>
      )}
    </div>
  );
}
