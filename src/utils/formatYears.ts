/**
 * Функция для получения ключа локализации формы слова "год" в зависимости от числа
 * @param years число лет
 * @returns ключ локализации: 'year.one' | 'year.few' | 'year.many'
 */
export function formatYearUnit(
  years: number
): "year.one" | "year.few" | "year.many" {
  const absYears = Math.abs(years);
  const lastDigit = absYears % 10;
  const lastTwoDigits = absYears % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return "year.many"; // лет (11-19 лет)
  } else if (lastDigit === 1) {
    return "year.one"; // год (1, 21, 31... год)
  } else if (lastDigit >= 2 && lastDigit <= 4) {
    return "year.few"; // года (2-4, 22-24... года)
  } else {
    return "year.many"; // лет (5-9, 10, 25-30... лет)
  }
}
