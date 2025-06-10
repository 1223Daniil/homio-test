import { Unit, UnitStatusColors } from "../model/types";

/**
 * Парсит SVG данные из строки JSON
 */
export const parseSvgData = (svgData?: string): any[] => {
  if (!svgData) return [];
  try {
    return JSON.parse(svgData);
  } catch (error) {
    console.error("Error parsing SVG data:", error);
    return [];
  }
};

/**
 * Возвращает цвет заливки для юнита в зависимости от его статуса
 */
export const getUnitFillColor = (
  status: string,
  colors: UnitStatusColors,
  isSelected: boolean = false
): string => {
  const baseColor = colors[status] || colors.UNAVAILABLE;

  // Если юнит выбран, делаем цвет более насыщенным
  if (isSelected) {
    return baseColor.replace(
      /rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/,
      "rgba($1, $2, $3, 0.4)"
    );
  }

  return baseColor;
};

/**
 * Возвращает перевод для типа вида из окна
 */
export const getWindowViewTranslation = (
  view: string,
  translations: Record<string, string>
): string => {
  const viewKey = `windowView.${view.toLowerCase()}`;
  return translations[viewKey] || view;
};

/**
 * Форматирует цену в соответствии с локалью
 */
export const formatPrice = (
  price?: number,
  currency: string = "USD"
): string => {
  if (!price) return "";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

/**
 * Вычисляет позицию тултипа, чтобы он не выходил за границы контейнера
 */
export const calculateTooltipPosition = (
  mousePosition: { x: number; y: number },
  containerRect: DOMRect,
  tooltipRect: DOMRect
): { x: number; y: number } => {
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight
  };

  let x = mousePosition.x;
  let y = mousePosition.y;

  // Проверяем, не выходит ли тултип за правую границу
  if (containerRect.left + x + tooltipRect.width > viewport.width) {
    x = x - tooltipRect.width - 40;
  }

  // Проверяем, не выходит ли тултип за нижнюю границу
  if (containerRect.top + y + tooltipRect.height > viewport.height) {
    y = y - tooltipRect.height - 20;
  }

  // Проверяем, не выходит ли тултип за левую границу
  if (containerRect.left + x < 0) {
    x = -containerRect.left + 20;
  }

  // Проверяем, не выходит ли тултип за верхнюю границу
  if (containerRect.top + y < 0) {
    y = -containerRect.top + 20;
  }

  return { x, y };
};
