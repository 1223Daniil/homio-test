import { useEffect, useMemo, useState } from "react";

import BuildingTooltip from "../BuildingTooltip";
import { Tooltip } from "@heroui/react";

interface MasterPlanPointProps {
  point: {
    x: number;
    y: number;
    buildingId: string;
  };
  handleBuildingPointClick: (buildingId: string) => void;
  activeMasterPlanPoint: { id: string } | null;
  setIsOpen: (value: any) => void;
  originalWidth?: number;
  originalHeight?: number;
  displayWidth?: number;
  displayHeight?: number;
  adjustmentFactors?:
    | {
        xFactor: number;
        yFactor: number;
        xOffset: number;
        yOffset: number;
      }
    | undefined;
}

// Функция для автоматического расчета коэффициентов масштабирования
function calculateAdjustmentFactors(
  originalWidth: number,
  originalHeight: number,
  displayWidth: number,
  displayHeight: number
) {
  // Коэффициенты для размера 896x480 (оригинал 638.76x556.64)
  const size896x480 = {
    xFactor: 0.78,
    yFactor: 1.29,
    xOffset: 9,
    yOffset: -1
  };

  // Всегда применяем оптимальные коэффициенты для размера 896x480
  if (Math.abs(displayWidth - 896) < 20 && Math.abs(displayHeight - 480) < 20) {
    return size896x480;
  }

  // Для размера 880x480
  if (Math.abs(displayWidth - 880) < 20 && Math.abs(displayHeight - 480) < 20) {
    return {
      xFactor: 0.89,
      yFactor: 1.54,
      xOffset: 7,
      yOffset: -2
    };
  }

  // Для размера 720x480
  if (Math.abs(displayWidth - 720) < 20 && Math.abs(displayHeight - 480) < 20) {
    return {
      xFactor: 0.93,
      yFactor: 1.33,
      xOffset: 2,
      yOffset: -1
    };
  }

  // Для всех других размеров используем значения для 896x480
  return size896x480;
}

const MasterPlanPoint = ({
  point,
  handleBuildingPointClick,
  activeMasterPlanPoint,
  setIsOpen,
  originalWidth = 638.76,
  originalHeight = 556.64,
  displayWidth = 896,
  displayHeight = 480,
  adjustmentFactors
}: MasterPlanPointProps) => {
  // Автоматически рассчитываем коэффициенты, если они не переданы явно
  const calculatedFactors = useMemo(
    () =>
      calculateAdjustmentFactors(
        originalWidth,
        originalHeight,
        displayWidth,
        displayHeight
      ),
    [originalWidth, originalHeight, displayWidth, displayHeight]
  );

  // Используем переданные коэффициенты или рассчитанные автоматически
  const factors = adjustmentFactors || calculatedFactors;

  const [adjustedX, setAdjustedX] = useState(point.x);
  const [adjustedY, setAdjustedY] = useState(point.y);

  useEffect(() => {
    // Проверяем, что все размеры валидные ненулевые числа
    if (!displayWidth || !displayHeight || !originalWidth || !originalHeight) {
      // Если размеры еще не доступны, просто используем исходные координаты
      setAdjustedX(point.x);
      setAdjustedY(point.y);
      return;
    }

    // Используем математическую формулу для трансформации координат
    const { xFactor, yFactor, xOffset, yOffset } = factors;

    // Координата X с применением коэффициента масштабирования и смещения
    const newX = point.x * xFactor + xOffset;

    // Координата Y требует масштабирования с центрированием
    // Смещаем центральную точку (50%) и масштабируем пропорционально
    const centeredY = point.y - 50; // Отцентрируем относительно середины
    const scaledCenteredY = centeredY * yFactor; // Масштабируем
    const newY = scaledCenteredY + 50 + yOffset; // Возвращаем смещение

    setAdjustedX(newX);
    setAdjustedY(newY);
  }, [
    point.x,
    point.y,
    originalWidth,
    originalHeight,
    displayWidth,
    displayHeight,
    factors
  ]);

  return (
    <div
      className={
        "absolute flex items-center justify-center size-5 rounded-full transition-transform hover:scale-125 bg-[#F5F8FF] border border-[#416DC6]"
      }
      style={{
        left: `${adjustedX}%`,
        top: `${adjustedY}%`,
        zIndex: 10
      }}
      onClick={e => {
        e.stopPropagation();
        if (point.buildingId) {
          if (
            activeMasterPlanPoint !== null &&
            point.buildingId === activeMasterPlanPoint.id
          ) {
            setIsOpen(null);
          } else {
            handleBuildingPointClick(point.buildingId);
          }
        }
      }}
    >
      <Tooltip
        content={
          <div onClick={e => e.stopPropagation()}>
            <BuildingTooltip building={activeMasterPlanPoint} />
          </div>
        }
        placement="right"
        isOpen={
          activeMasterPlanPoint !== null &&
          point.buildingId === activeMasterPlanPoint.id
        }
        showArrow
        className="!m-0"
      >
        <div
          className={`rounded-full size-2 bg-[#416DC6] transition-all duration-300 ${
            activeMasterPlanPoint !== null &&
            point.buildingId === activeMasterPlanPoint.id
              ? "opacity-100"
              : "opacity-0"
          }`}
        ></div>
      </Tooltip>
    </div>
  );
};

export default MasterPlanPoint;
