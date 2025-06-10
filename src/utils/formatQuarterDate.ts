export function formatDateToQuarter(
  dateString: string | Date | number
): string {
  // Если дата не предоставлена, используем текущую дату
  if (!dateString) {
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear().toString();
    const quarter = Math.ceil(month / 3);
    return `${quarter}Q${year}`;
  }

  let date: Date;

  // Если dateString уже является объектом Date
  if (dateString instanceof Date) {
    date = dateString;
  }
  // Если dateString это число (timestamp)
  else if (typeof dateString === "number") {
    date = new Date(dateString);
  }
  // Если dateString это строка
  else if (typeof dateString === "string") {
    // Проверяем, содержит ли строка формат даты с GMT
    if (dateString.includes("GMT") || dateString.includes("UTC")) {
      // Это формат "Thu Dec 31 2026 07:00:00 GMT+0700"
      date = new Date(dateString);
    } else {
      // Пробуем разобрать строку как дату с точками (DD.MM.YYYY)
      const dateParts = dateString.split(".");

      // Устанавливаем значения по умолчанию
      let day = 1;
      let month = 1;
      let year = new Date().getFullYear().toString();

      if (dateParts.length >= 1 && dateParts[0]) {
        day = parseInt(dateParts[0], 10) || 1;
      }

      if (dateParts.length >= 2 && dateParts[1]) {
        month = parseInt(dateParts[1], 10) || 1;
      }

      if (dateParts.length >= 3 && dateParts[2]) {
        year = dateParts[2];
      }

      // Ограничиваем значение месяца
      if (isNaN(month) || month < 1) {
        month = 1;
      } else if (month > 12) {
        month = 12;
      }

      // Создаем объект Date из разобранных частей
      // Месяцы в JavaScript начинаются с 0, поэтому вычитаем 1
      date = new Date(parseInt(year), month - 1, day);
    }
  }
  // Если тип не определен, пробуем преобразовать в Date
  else {
    try {
      date = new Date(dateString as any);
    } catch (e) {
      date = new Date();
    }
  }

  // Убедимся, что дата действительна
  if (isNaN(date.getTime())) {
    // Если дата недействительна, используем текущую дату
    date = new Date();
  }

  const month = date.getMonth() + 1; // Месяцы в JavaScript начинаются с 0
  const year = date.getFullYear().toString();
  const quarter = Math.ceil(month / 3);

  return `${quarter}Q${year}`;
}
