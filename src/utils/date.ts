/**
 * Форматирует дату в локализованную строку
 * @param dateString Строка с датой в формате ISO
 * @param locale Локаль для форматирования (по умолчанию 'ru')
 * @returns Отформатированная строка с датой
 */
export function formatDate(dateString?: string, locale: string = 'ru'): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    // Проверяем, что дата валидна
    if (isNaN(date.getTime())) {
      return '';
    }
    
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

/**
 * Форматирует дату и время в локализованную строку
 * @param dateString Строка с датой в формате ISO
 * @param locale Локаль для форматирования (по умолчанию 'ru')
 * @returns Отформатированная строка с датой и временем
 */
export function formatDateTime(dateString?: string, locale: string = 'ru'): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    
    // Проверяем, что дата валидна
    if (isNaN(date.getTime())) {
      return '';
    }
    
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date and time:', error);
    return '';
  }
}

/**
 * Преобразует дату в строку в формате ISO
 * @param date Объект Date
 * @returns Строка с датой в формате ISO
 */
export function toISOString(date?: Date): string {
  if (!date) return '';
  
  try {
    return date.toISOString();
  } catch (error) {
    console.error('Error converting date to ISO string:', error);
    return '';
  }
}

/**
 * Преобразует дату в строку в формате YYYY-MM-DD
 * @param date Объект Date или строка с датой
 * @returns Строка с датой в формате YYYY-MM-DD
 */
export function toDateString(date?: Date | string): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Проверяем, что дата валидна
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    const isoString = dateObj.toISOString();
    return isoString.split('T')[0];
  } catch (error) {
    console.error('Error converting date to date string:', error);
    return '';
  }
} 