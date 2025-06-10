import {
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Tooltip as ChartTooltip,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Title
} from "chart.js";

import { Chart } from "react-chartjs-2";
import { YieldChartProps } from "./types";
import { useTranslations } from "next-intl";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  BarController,
  BarElement,
  Title,
  ChartTooltip,
  Legend
);

const formatMillions = (value: number) => {
  return (value / 1000000).toFixed(2) + "М";
};

export const YieldChart = ({
  data,
  title,
  height = "400px"
}: YieldChartProps) => {
  const t = useTranslations("UnitDetail.yeld-calculator");
  const tCurrency = useTranslations("projects.currency.symbols");

  const {
    years,
    cashflowData,
    propertyValueData,
    totalReturnData,
    initialInvestment
  } = data;

  const chartData = {
    labels: years,
    datasets: [
      {
        label: t("graphic.rental-income"),
        data: cashflowData,
        backgroundColor: "rgba(0, 123, 255, 0.5)",
        borderColor: "rgba(0, 123, 255, 1)",
        borderWidth: 1,
        order: 3,
        type: "bar" as const
      },
      {
        label: t("graphic.property-price"),
        data: propertyValueData,
        type: "line" as const,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.1)",
        fill: false,
        order: 2
      },
      {
        label: t("graphic.common-yield"),
        data: totalReturnData,
        type: "line" as const,
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.1)",
        fill: false,
        order: 1
      },
      {
        label: t("graphic.initial-investment"),
        data: Array(years.length).fill(initialInvestment),
        type: "line" as const,
        borderColor: "rgba(128, 128, 128, 1)",
        borderDash: [5, 5],
        fill: false,
        order: 4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: t("graphic.pricing", { amount: data.currency })
        },
        ticks: {
          callback: function (value: any) {
            return formatMillions(Number(value)) + " " + data.currency;
          }
        }
      },
      x: {
        title: {
          display: true,
          text: t("graphic.years")
        }
      }
    },
    plugins: {
      legend: {
        position: "bottom" as const
      }
    }
  };

  return (
    <div>
      <h4 className="text-xl font-semibold mb-4">{title}</h4>
      <div style={{ height }}>
        <Chart type="bar" data={chartData} options={options} />
      </div>
    </div>
  );
};
