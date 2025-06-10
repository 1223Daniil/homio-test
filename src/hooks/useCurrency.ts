import { Unit } from "@prisma/client";

export type CurrencyCode = "THB" | "USD" | "EUR" | "RUB";

interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  rate: number; // Rate relative to THB
}

const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  THB: {
    code: "THB",
    symbol: "฿",
    rate: 1
  },
  USD: {
    code: "USD",
    symbol: "$",
    rate: 0.028 // 1 THB = 0.028 USD
  },
  EUR: {
    code: "EUR",
    symbol: "€",
    rate: 0.026 // 1 THB = 0.026 EUR
  },
  RUB: {
    code: "RUB",
    symbol: "₽",
    rate: 2.54 // 1 THB = 2.54 RUB
  }
};

export function useCurrency(locale: string) {
  // Определяем валюту по умолчанию на основе локали
  const defaultCurrency: CurrencyCode = locale === "ru" ? "RUB" : "THB";

  // Форматирование цены с учетом локали и валюты
  const formatPrice = (
    price: number,
    currency: CurrencyCode = defaultCurrency
  ): string => {
    const config = CURRENCIES[currency];
    const convertedPrice = price * config.rate;

    const formattedPrice = (convertedPrice / 1000000).toLocaleString(
      locale === "ru" ? "ru-RU" : "en-US",
      {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      }
    );

    return `${formattedPrice} M ${currency}`;
  };

  // Получение диапазона цен для списка юнитов
  const getPriceRange = (units: Unit[]): string | null => {
    if (!units?.length) return null;

    const prices = units
      .filter(unit => unit.price)
      .map(unit => unit.price as number);

    if (!prices.length) return null;

    const min = Math.min(...prices);
    const max = Math.max(...prices);

    return locale === "ru"
      ? `от ${formatPrice(min)} до ${formatPrice(max)}`
      : `From ${formatPrice(min)} to ${formatPrice(max)}`;
  };

  // Конвертация цены из одной валюты в другую
  const convertPrice = (
    price: number,
    from: CurrencyCode = "THB",
    to: CurrencyCode
  ): number => {
    const fromRate = CURRENCIES[from].rate;
    const toRate = CURRENCIES[to].rate;
    return (price / fromRate) * toRate;
  };

  return {
    formatPrice,
    getPriceRange,
    convertPrice,
    defaultCurrency
  };
} 