export const formatPrice = (
  price: number,
  currency: string = "USD"
): string => {
  if (!price && price !== 0) return "";

  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

export const formatCompact = (value: number, digits: number = 1): string => {
  if (!value && value !== 0) return "";

  if (Math.abs(value) >= 1000000) {
    return (value / 1000000).toFixed(digits).replace(/\.0+$/, "") + "M";
  }

  if (Math.abs(value) >= 1000) {
    return (value / 1000).toFixed(digits).replace(/\.0+$/, "") + "K";
  }

  return value.toString();
};

export const formatPriceCompact = (
  price: number,
  currency: string = "USD",
  digits: number = 1
): string => {
  if (!price && price !== 0) return "";

  const currencySymbol = getCurrencySymbol(currency);
  return currencySymbol + " " + formatCompact(price, digits);
};

const getCurrencySymbol = (currency: string): string => {
  switch (currency) {
    case "USD":
      return "$";
    case "EUR":
      return "€";
    case "RUB":
      return "₽";
    case "THB":
      return "฿";
    default:
      return currency;
  }
};

export const formatNumberType = (
  value: number
): { number: number; type: string } => {
  if (value >= 1000000) {
    return { number: Number((value / 1000000).toFixed(2)), type: "million" };
  } else if (value >= 1000) {
    return { number: Number((value / 1000).toFixed(2)), type: "thousand" };
  } else {
    return { number: value, type: null };
  }
};
