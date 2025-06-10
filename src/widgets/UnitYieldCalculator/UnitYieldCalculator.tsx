import { Input, Slider, Tooltip } from "@heroui/react";
import {
  calculatePropertyYield,
  formatMillions
} from "@/shared/lib/calculators";
import { useEffect, useState } from "react";

import { CgLock } from "react-icons/cg";
import Image from "next/image";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { YieldChart } from "@/shared/components/YieldChart";
import { formatNumberType } from "@/utils/formatPrice";
import { formatYearUnit } from "@/utils/formatYears";
import styles from "./UnitYieldCalculator.module.css";
import { useTranslations } from "next-intl";

interface UnitYieldCalculatorProps {
  unitPrice?: number;
  currency?: string;
}

const UnitYieldCalculator = ({
  unitPrice = 0,
  currency = "USD"
}: UnitYieldCalculatorProps) => {
  const [investmentAmount, setInvestmentAmount] = useState<number>(
    unitPrice || 0
  );
  const [annualIncomePercentage, setAnnualIncomePercentage] =
    useState<number>(0.08); // 8%
  const [propertyGrowthPercentage, setPropertyGrowthPercentage] =
    useState<number>(0.09); // 9%
  const [paybackPeriod, setPaybackPeriod] = useState<number | string>(0);
  const [annualIncome, setAnnualIncome] = useState<number>(0);
  const [roi, setRoi] = useState<string>("0%");
  const [chartData, setChartData] = useState<any>(null);

  const t = useTranslations("UnitDetail.yeld-calculator");
  const tCurrency = useTranslations("projects.currency.symbols");
  const tAmount = useTranslations("Amounts");

  // Обновляем инвестиционную сумму при изменении цены юнита
  useEffect(() => {
    if (unitPrice) {
      setInvestmentAmount(unitPrice);
    }
  }, [unitPrice]);

  useEffect(() => {
    const yieldData = calculatePropertyYield({
      cost: investmentAmount,
      annualIncomePercentage: annualIncomePercentage,
      annualGrowthPercentage: propertyGrowthPercentage
    });

    if (yieldData.paybackPeriod <= 20) {
      setPaybackPeriod(yieldData.paybackPeriod);
    } else {
      setPaybackPeriod("20+");
    }

    setAnnualIncome(yieldData.annualIncome);

    setRoi(Math.round(yieldData.roi5Year) + "%");

    setChartData({
      years: yieldData.years,
      cashflowData: yieldData.cashflowData,
      propertyValueData: yieldData.propertyValueData,
      totalReturnData: yieldData.totalReturnData,
      initialInvestment: investmentAmount,
      currency: tCurrency(currency)
    });
  }, [investmentAmount, annualIncomePercentage, propertyGrowthPercentage]);

  // Безопасно получаем символ валюты
  const getCurrencySymbol = () => {
    try {
      // @ts-ignore - игнорируем ошибку типизации для простоты
      return tCurrency(currency) || currency || "$";
    } catch (error) {
      return currency || "$";
    }
  };

  // Безопасное форматирование числа с локализацией
  const safelyFormatNumber = (num: number) => {
    try {
      return num.toLocaleString();
    } catch (error) {
      return String(num);
    }
  };

  const formattedAnnualIncome = formatNumberType(annualIncome);

  return (
    <div className={`${styles.unitYieldCalculator}`}>
      <h3 className={`${styles.title}`}>{t("title")}</h3>

      <div
        className={`${styles.container} flex flex-col md:flex-row border md:border-none rounded-lg md:rounded-none border-gray-300 p-[6px] md:p-0`}
      >
        <div className={`${styles.leftCard} !hidden md:!flex`}>
          <Input
            label={t("fields.investment-amount")}
            labelPlacement="outside"
            endContent={<CgLock className={`${styles.lockIcon}`} />}
            placeholder={`${getCurrencySymbol()}${safelyFormatNumber(investmentAmount)}`}
            value={`${getCurrencySymbol()}${safelyFormatNumber(investmentAmount)}`}
            onChange={e => {
              const value = e.target.value.replace(/[^\d]/g, "");
              if (value) setInvestmentAmount(Number(value));
            }}
            className="!hidden md:!inline-flex"
          />

          <div>
            <p className="text-sm font-medium mb-2">
              {t("fields.occupancy-rate.title")}
            </p>
            <Slider
              className="max-w-md"
              defaultValue={annualIncomePercentage}
              value={annualIncomePercentage}
              onChange={value => setAnnualIncomePercentage(Number(value))}
              formatOptions={{ style: "percent" }}
              label={t("fields.occupancy-rate.label")}
              size="sm"
              marks={[
                {
                  value: 0.05,
                  label: "5%"
                },
                {
                  value: 0.1,
                  label: "10%"
                },
                {
                  value: 0.15,
                  label: "15%"
                }
              ]}
              maxValue={0.2}
              minValue={0.01}
              step={0.01}
              showTooltip={true}
            />
          </div>

          <div>
            <p className="text-sm font-medium mb-2">
              {t("fields.expected-yield.title")}
            </p>
            <Slider
              className="max-w-md"
              defaultValue={propertyGrowthPercentage}
              value={propertyGrowthPercentage}
              onChange={value => setPropertyGrowthPercentage(Number(value))}
              formatOptions={{ style: "percent" }}
              label={t("fields.expected-yield.label")}
              size="sm"
              marks={[
                {
                  value: 0.05,
                  label: "5%"
                },
                {
                  value: 0.1,
                  label: "10%"
                },
                {
                  value: 0.15,
                  label: "15%"
                }
              ]}
              maxValue={0.2}
              minValue={0.03}
              step={0.01}
              showTooltip={true}
            />
          </div>
        </div>

        <div className={`${styles.rightCard} hidden md:block`}>
          <h4 className="hidden md:block">{t("results.title")}</h4>

          <div>
            <div className={`${styles.subtitle} !hidden md:!flex`}>
              <div className={`${styles.checkImage}`}>
                <Image src="/images/check.png" fill alt="check" />
              </div>
              <span>{t("results.description")}</span>
              <Tooltip
                showArrow
                content={t("results.tip")}
                placement="bottom"
                className={`${styles.tooltip}`}
              >
                <IoMdInformationCircleOutline
                  className={`${styles.infoIcon}`}
                />
              </Tooltip>
            </div>

            <div className={`${styles.results}`}>
              <div className={`${styles.resultItem}`}>
                <p className={`${styles.resultItemTitle}`}>
                  {t("results.total-yield.payback-period")}
                </p>
                <p className={`${styles.resultItemValue}`}>
                  {paybackPeriod}{" "}
                  {t(`results.${formatYearUnit(Number(paybackPeriod))}`)}
                </p>
              </div>

              <div className={`${styles.resultItem}`}>
                <p className={`${styles.resultItemTitle}`}>
                  {t("results.total-yield.roi")}
                </p>
                <p className={`${styles.resultItemValue}`}>{roi}</p>
              </div>

              <div className={`${styles.resultItem}`}>
                <p className={`${styles.resultItemTitle}`}>
                  {t("results.total-yield.annual-income")}
                </p>
                <p
                  className={`${styles.resultItemValue}`}
                >{`${tCurrency(currency)}${formattedAnnualIncome.number}${formattedAnnualIncome.type ? tAmount(formattedAnnualIncome.type) : ""}`}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`${styles.chartContainer} mt-8 bg-white p-6 rounded-lg border-[#D5D7DA] md:border`}
      >
        {chartData && (
          <YieldChart
            title={t("results.chart-title")}
            data={chartData}
            height="400px"
          />
        )}
      </div>

      <div
        className={`${styles.leftCard} mt-3 border-none md:border md:!hidden`}
      >
        <Input
          label={t("fields.investment-amount")}
          labelPlacement="outside"
          endContent={<CgLock className={`${styles.lockIcon}`} />}
          placeholder={`${getCurrencySymbol()}${safelyFormatNumber(investmentAmount)}`}
          value={`${getCurrencySymbol()}${safelyFormatNumber(investmentAmount)}`}
          onChange={e => {
            const value = e.target.value.replace(/[^\d]/g, "");
            if (value) setInvestmentAmount(Number(value));
          }}
          className="!hidden md:!inline-flex"
        />

        <div>
          <p className="text-sm font-medium mb-2">
            {t("fields.occupancy-rate.title")}
          </p>
          <Slider
            className="max-w-md"
            defaultValue={annualIncomePercentage}
            value={annualIncomePercentage}
            onChange={value => setAnnualIncomePercentage(Number(value))}
            formatOptions={{ style: "percent" }}
            label={t("fields.occupancy-rate.label")}
            size="sm"
            marks={[
              {
                value: 0.05,
                label: "5%"
              },
              {
                value: 0.1,
                label: "10%"
              },
              {
                value: 0.15,
                label: "15%"
              }
            ]}
            maxValue={0.2}
            minValue={0.01}
            step={0.01}
            showTooltip={true}
          />
        </div>

        <div>
          <p className="text-sm font-medium mb-2">
            {t("fields.expected-yield.title")}
          </p>
          <Slider
            className="max-w-md"
            defaultValue={propertyGrowthPercentage}
            value={propertyGrowthPercentage}
            onChange={value => setPropertyGrowthPercentage(Number(value))}
            formatOptions={{ style: "percent" }}
            label={t("fields.expected-yield.label")}
            size="sm"
            marks={[
              {
                value: 0.05,
                label: "5%"
              },
              {
                value: 0.1,
                label: "10%"
              },
              {
                value: 0.15,
                label: "15%"
              }
            ]}
            maxValue={0.2}
            minValue={0.03}
            step={0.01}
            showTooltip={true}
          />
        </div>
      </div>

      <div
        className={`${styles.rightCard} md:!hidden mt-3 border-none md:border`}
      >
        <h4 className="hidden md:block">{t("results.title")}</h4>

        <div>
          <div className={`${styles.subtitle} !hidden md:!flex`}>
            <div className={`${styles.checkImage}`}>
              <Image src="/images/check.png" fill alt="check" />
            </div>
            <span>{t("results.description")}</span>
            <Tooltip
              showArrow
              content={t("results.tip")}
              placement="bottom"
              className={`${styles.tooltip}`}
            >
              <IoMdInformationCircleOutline className={`${styles.infoIcon}`} />
            </Tooltip>
          </div>

          <div className={`${styles.results}`}>
            <div className={`${styles.resultItem}`}>
              <p className={`${styles.resultItemTitle}`}>
                {t("results.total-yield.payback-period")}
              </p>
              <p className={`${styles.resultItemValue}`}>
                {paybackPeriod}{" "}
                {t(`results.${formatYearUnit(Number(paybackPeriod))}`)}
              </p>
            </div>

            <div className={`${styles.resultItem}`}>
              <p className={`${styles.resultItemTitle}`}>
                {t("results.total-yield.roi")}
              </p>
              <p className={`${styles.resultItemValue}`}>{roi}</p>
            </div>

            <div className={`${styles.resultItem}`}>
              <p className={`${styles.resultItemTitle}`}>
                {t("results.total-yield.annual-income")}
              </p>
              <p
                className={`${styles.resultItemValue}`}
              >{`${tCurrency(currency)}${formattedAnnualIncome.number}${formattedAnnualIncome.type ? tAmount(formattedAnnualIncome.type) : ""}`}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitYieldCalculator;
