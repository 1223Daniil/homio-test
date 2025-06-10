import { createTranslator, TranslationValues, Formats } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';

// Конфигурация для next-intl
export const locales = ['en', 'ru'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

// Конфигурация для development/production
export const DEBUG = process.env.NODE_ENV === 'development';

// Типы для переводов
export interface TranslationKey {
  key: string;
  namespace?: string;
  params?: Record<string, any>;
}

export interface TranslationValue {
  value: string;
  locale: string;
  lastUpdated: Date;
  context?: {
    namespace?: string;
    context?: string;
  };
}

// Утилиты для работы с ключами
export function formatTranslationKey(key: string): string {
  return key
    .split(/(?=[A-Z])|\./)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
    .trim();
}

// Логирование
export function logTranslation(message: string, ...args: any[]) {
  if (DEBUG) {
    console.log(`🔍 [i18n] ${message}`, ...args);
  }
}

// Конфигурация next-intl
export async function getMessages(locale: string) {
  try {
    return (await import(`../locales/${locale}.json`)).default;
  } catch (error) {
    logTranslation(`Failed to load messages for locale: ${locale}`, error);
    return {};
  }
}

export const timeZone = 'UTC';

// Конфигурация для next-intl/server
export default getRequestConfig(async ({ locale }) => ({
  messages: await getMessages(locale),
  timeZone,
}));

// Создание переводчика с поддержкой fallback
export function createFlexibleTranslator(messages: Record<string, any>, locale: string) {
  const translator = createTranslator({ locale, messages });
  
  return {
    t: <T extends string>(key: T, values?: TranslationValues, formats?: Formats) => {
      try {
        return translator(key, values, formats);
      } catch (error) {
        logTranslation(`Translation failed for key: ${key}`, error);
        return formatTranslationKey(key.split('.').pop() || key);
      }
    }
  };
} 