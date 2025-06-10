export interface PropertyYieldParams {
  cost: number; // Стоимость недвижимости
  annualIncomePercentage: number; // Процент годового дохода
  annualGrowthPercentage: number; // Процент годового роста стоимости
  yearsToProject?: number; // Количество лет для прогноза
}

export interface PropertyYieldData {
  years: number[]; // Массив годов (1, 2, 3, ...)
  cashflowData: number[]; // Накопленный доход от аренды
  propertyValueData: number[]; // Стоимость недвижимости по годам
  totalReturnData: number[]; // Общий доход (аренда + рост стоимости)
  paybackPeriod: number; // Срок окупаемости (в годах)
  annualIncome: number; // Годовой доход
  roi5Year: number; // ROI за 5 лет (в процентах)
}

// Расчет данных для анализа доходности недвижимости
export const calculatePropertyYield = ({
  cost,
  annualIncomePercentage,
  annualGrowthPercentage,
  yearsToProject = 20
}: PropertyYieldParams): PropertyYieldData => {
  const initialInvestment = cost;
  const years = Array.from({ length: yearsToProject }, (_, i) => i + 1);
  const annualIncome = initialInvestment * annualIncomePercentage;

  // Инициализация массивов для данных
  const cashflowData: number[] = [];
  const propertyValueData: number[] = [];
  const totalReturnData: number[] = [];
  let cumulativeIncome = 0;

  // Заполнение массивов данными
  for (let i = 0; i < years.length; i++) {
    // Накопленный доход от аренды
    cumulativeIncome += annualIncome;
    cashflowData[i] = cumulativeIncome;

    // Рост стоимости недвижимости
    const year = years[i];
    propertyValueData[i] =
      initialInvestment * Math.pow(1 + annualGrowthPercentage, year as number);

    // Общий доход (аренда + рост стоимости)
    totalReturnData[i] =
      (cashflowData[i] ?? 0) + (propertyValueData[i] ?? 0) - initialInvestment;
  }

  // Расчет срока окупаемости только по арендному доходу
  const paybackPeriodIndex = cashflowData.findIndex(
    value => value >= initialInvestment
  );
  const paybackPeriod =
    paybackPeriodIndex !== -1 ? paybackPeriodIndex + 1 : yearsToProject + 1;

  // Расчет ROI за 5 лет
  const fiveYearIndex = Math.min(4, totalReturnData.length - 1);
  const fiveYearReturn = totalReturnData[fiveYearIndex] || 0;
  const roi5Year = (fiveYearReturn / initialInvestment) * 100;

  return {
    years,
    cashflowData,
    propertyValueData,
    totalReturnData,
    paybackPeriod,
    annualIncome,
    roi5Year
  };
};

// Форматирование значений в миллионы
export const formatMillions = (value: number): string => {
  return (value / 1000000).toFixed(2) + "М";
};
