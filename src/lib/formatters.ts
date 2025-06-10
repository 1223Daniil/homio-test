/**
 * Форматирует число как цену в тайских батах
 * 
 * @param value Число для форматирования
 * @returns Отформатированная строка с ценой
 */
export function formatPrice(value: number): string {
  if (value >= 1000000) {
    return `฿${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `฿${(value / 1000).toFixed(0)}K`;
  } else {
    return `฿${value.toLocaleString()}`;
  }
}

/**
 * Форматирует число с разделителями групп
 * 
 * @param value Число для форматирования
 * @returns Отформатированная строка с числом
 */
export function formatNumber(value: number): string {
  return value.toLocaleString();
}

/**
 * Форматирует площадь в квадратных метрах
 * 
 * @param value Площадь в квадратных метрах
 * @returns Отформатированная строка с площадью
 */
export function formatArea(value: number): string {
  return `${value.toLocaleString()} m²`;
} 