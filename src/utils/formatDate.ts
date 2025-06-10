export function formatDate(date: string | Date, locale: string = 'en'): string {
  const d = new Date(date);
  const localeMap: { [key: string]: string } = {
    'en': 'en-US',
    'ru': 'ru-RU'
  };

  return d.toLocaleDateString(localeMap[locale] || 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC'
  });
} 