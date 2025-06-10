export interface YieldChartData {
  years: number[];
  cashflowData: number[];
  propertyValueData: number[];
  totalReturnData: number[];
  initialInvestment: number;
}

export interface YieldChartProps {
  data: YieldChartData;
  title?: string;
  height?: number | string;
}
