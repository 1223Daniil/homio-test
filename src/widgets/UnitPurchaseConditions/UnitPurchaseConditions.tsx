import { Accordion, AccordionItem } from "@heroui/accordion";
import { ElementType, useMemo } from "react";
import { Prisma, Unit } from "@prisma/client";

import { BsClipboard } from "react-icons/bs";
import { FiPercent } from "react-icons/fi";
import { FiTag } from "react-icons/fi";
import { Icon24Hours } from "@tabler/icons-react";
import styles from "./UnitPurchaseConditions.module.css";
import { useTranslations } from "next-intl";

// Явно определяем тип для свойств PurchaseConditions
interface PurchaseConditionsType {
  id: string;
  projectId: string;
  currentCurrency?: string | null;
  leaseholdDuration?: number | null;
  reservationFee?: number | null;
  reservationDuration?: number | null;
  onTimePaymentDiscont?: number | null;
  utilitiesAndStafCost?: number | null;
  managmentFee?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

type UnitWithProject = Prisma.UnitGetPayload<{
  include: {
    project: {
      include: {
        PurchaseConditions: true;
        paymentStages: true;
        agentCommissions: true;
        cashbackBonuses: true;
        additionalExpenses: true;
      };
    };
  };
}> & {
  project?: {
    PurchaseConditions?: PurchaseConditionsType | null;
  };
};

interface UnitPurchaseConditionsProps {
  unit: UnitWithProject;
}

const getYearText = (years: number, t: any) => {
  const lastDigit = years % 10;
  const lastTwoDigits = years % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return t("years.many"); // "лет"
  }

  if (lastDigit === 1) {
    return t("years.one"); // "год"
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return t("years.few"); // "года"
  }

  return t("years.many"); // "лет"
};

const UnitPurchaseConditions = ({ unit }: UnitPurchaseConditionsProps) => {
  const t = useTranslations("UnitDetail.purchase-conditions");

  console.log("unit", unit);

  // Функция для расчета сумм для каждого этапа
  const calculateStageAmounts = (stages: any[], totalPrice: number) => {
    return stages.map(stage => {
      const amount = (stage.paymentAmount / 100) * totalPrice;

      return {
        ...stage,
        absoluteAmount: amount
      };
    });
  };

  // Расчет этапов с суммами
  const stagesWithAmounts = useMemo(() => {
    if (!unit.project?.paymentStages || !unit.price) return [];
    return calculateStageAmounts(unit.project.paymentStages, unit.price);
  }, [unit.project?.paymentStages, unit.price]);

  const data = useMemo(() => {
    return [
      {
        title: t("accordions.installment-plan.title"),
        description: t("accordions.installment-plan.description"),
        Icon: Icon24Hours,
        sections: [
          {
            content: [
              [
                t("accordions.installment-plan.rows.0.0"),
                t("accordions.installment-plan.rows.0.1")
              ],
              [
                t("accordions.installment-plan.rows.1.0"),
                t("accordions.installment-plan.rows.1.1")
              ],
              [
                t("accordions.installment-plan.rows.2.0"),
                t("accordions.installment-plan.rows.2.1")
              ]
            ]
          }
        ]
      },
      {
        title: t("accordions.ownership-conditions.title"),
        description: t("accordions.ownership-conditions.description"),
        Icon: BsClipboard,
        sections: [
          {
            content: [
              [
                t("accordions.ownership-conditions.rows.0.0", {
                  percentage: 30
                }),
                t("accordions.ownership-conditions.rows.0.1")
              ],
              [
                t("accordions.ownership-conditions.rows.1.0"),
                t("accordions.ownership-conditions.rows.1.1")
              ]
            ]
          }
        ]
      },
      {
        title: t("accordions.additional-expenses.title"),
        description: t("accordions.additional-expenses.description"),
        Icon: FiTag,
        sections: [
          {
            title: [t("accordions.additional-expenses.tables.0.cols.0")],
            content: [
              [t("accordions.additional-expenses.tables.0.rows.0.0")],
              [t("accordions.additional-expenses.tables.0.rows.1.0")],
              [t("accordions.additional-expenses.tables.0.rows.2.0")],
              [t("accordions.additional-expenses.tables.0.rows.3.0")]
            ]
          },
          {
            title: [
              t("accordions.additional-expenses.tables.1.cols.single-payments"),
              t("accordions.additional-expenses.tables.1.cols.freehold"),
              t("accordions.additional-expenses.tables.1.cols.leasehold")
            ],
            content: [
              ["Transfer fee", "฿360,000 (2%)", "฿180,000 (1.0%)"],
              [
                "Withholding tax",
                "1% for companies / up to 3% for individuals",
                "–"
              ],
              ["Stamp duty", "฿90,000 (0.5%)", "฿1,800 (0.1%)"],
              ["Special Business Tax", "฿594,000 (3.3%)", "฿594,000 (3.3%)"]
            ]
          }
        ]
      },
      {
        title: t("accordions.agent-commission.title"),
        description: t("accordions.agent-commission.description"),
        Icon: FiPercent,
        sections: [
          {
            content: [
              ["0 – ฿20,000,000", "2.0%"],
              ["฿20,000,001 – ฿50,000,000", "2.5%"],
              ["฿50,000,001 – ฿100,000,000", "3.0%"],
              ["฿100,000,001 – and more", "3.0%"]
            ]
          }
        ]
      }
    ];
  }, [t]);

  console.log("unitPROJECT", unit);

  return (
    <div className={styles.unitPurchaseConditions}>
      <h3>{t("title")}</h3>

      <div className={`${styles.facts}`}>
        <div className={`${styles.fact}`}>
          <h4>{t("facts.0.title")}</h4>
          <p>
            {unit.project?.currency === "USD"
              ? t("currency.USD")
              : t("currency.THB")}
            {unit.project?.PurchaseConditions?.reservationFee || "0"}
          </p>
        </div>
        <div className={`${styles.fact}`}>
          <h4>{t("facts.1.title")}</h4>
          <p>
            {unit.project?.PurchaseConditions?.reservationDuration || "0"}{" "}
            {t("days")}
          </p>
        </div>
        <div className={`${styles.fact}`}>
          <h4>{t("facts.2.title")}</h4>
          <p>
            {unit.project?.PurchaseConditions?.leaseholdDuration || "0"}{" "}
            {getYearText(
              unit.project?.PurchaseConditions?.leaseholdDuration || 0,
              t
            )}
          </p>
        </div>
        <div className={`${styles.fact}`}>
          <h4>{t("facts.3.title")}</h4>
          <p>
            {unit.project?.PurchaseConditions?.onTimePaymentDiscont || "0"}%
          </p>
        </div>
        {/* {[0, 1, 2, 3].map(index => (
          <div key={index} className={`${styles.fact}`}>
            <h4>{t(`facts.${index}.title`)}</h4>
            <p>฿100,000</p>
          </div>
        ))} */}
      </div>
      {/* /Instalment Plan*/}
      <Accordion selectionMode="multiple" className={`${styles.accordion}`}>
        <AccordionItem
          className={`${styles.accordionItem}`}
          startContent={
            <StartContent
              Icon={Icon24Hours}
              title={t("accordions.installment-plan.title")}
              description={t("accordions.installment-plan.description")}
            />
          }
        >
          <AccordionItemContent
            content={
              stagesWithAmounts.map((stage, index) => {
                let stageNumber;
                if (index === 0) {
                  stageNumber = t("accordions.installment-plan.rows.0.0");
                } else if (index === stagesWithAmounts.length - 1) {
                  stageNumber = t("accordions.installment-plan.rows.2.0");
                } else {
                  const suffix =
                    index === 1
                      ? "2"
                      : index === 2
                        ? "3"
                        : index === 3
                          ? "4"
                          : "5";
                  stageNumber = `${index}-${t(`accordions.installment-plan.rows.${suffix}.0`)}`;
                }

                return [
                  stageNumber,
                  stage.stageName,
                  `${t(`currency.${unit.project?.currency || "THB"}`)}${Math.round(
                    stage.absoluteAmount
                  )
                    .toString()
                    .replace(
                      /\B(?=(\d{3})+(?!\d))/g,
                      ","
                    )} (${stage.paymentAmount}%)`
                ];
              }) || []
            }
          />
        </AccordionItem>
      </Accordion>

      {/* /Ownership Conditions*/}
      <Accordion selectionMode="multiple" className={`${styles.accordion}`}>
        <AccordionItem
          className={`${styles.accordionItem}`}
          startContent={
            <StartContent
              Icon={Icon24Hours}
              title={t("accordions.ownership-conditions.title")}
              description={t("accordions.ownership-conditions.description")}
            />
          }
        >
          <AccordionItemContent
            content={[
              [
                t("accordions.ownership-conditions.rows.0.0"),
                unit.project?.PurchaseConditions?.leaseholdDuration
                  ? t("accordions.ownership-conditions.rows.0.1")
                  : t("accordions.ownership-conditions.rows.0.2")
              ],
              [
                t("accordions.ownership-conditions.rows.1.0"),
                `${unit.project?.PurchaseConditions?.leaseholdDuration || 0} ${getYearText(unit.project?.PurchaseConditions?.leaseholdDuration || 0, t)}`
              ]
            ]}
          />
        </AccordionItem>
      </Accordion>

      {/* /Additional Expenses*/}
      <Accordion selectionMode="multiple" className={`${styles.accordion}`}>
        <AccordionItem
          className={`${styles.accordionItem}`}
          startContent={
            <StartContent
              Icon={Icon24Hours}
              title={t("accordions.additional-expenses.title")}
              description={t("accordions.additional-expenses.description")}
            />
          }
        >
          <AccordionItemContent
            title={[
              t("accordions.additional-expenses.tables.0.cols.name"),
              t("accordions.additional-expenses.tables.0.cols.cost")
            ]}
            content={
              unit.project?.additionalExpenses?.map(expense => [
                expense.nameOfExpenses || "",
                `${unit.project?.currency === "USD" ? t("currency.USD") : t("currency.THB")}${expense.costOfExpenses?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "0"}`
              ]) || []
            }
          />
        </AccordionItem>
      </Accordion>

      {/* /Commission agent*/}
      <Accordion selectionMode="multiple" className={`${styles.accordion}`}>
        <AccordionItem
          className={`${styles.accordionItem}`}
          startContent={
            <StartContent
              Icon={Icon24Hours}
              title={t("accordions.agent-commission.title")}
              description={t("accordions.agent-commission.description")}
            />
          }
        >
          <AccordionItemContent
            title={[
              t("accordions.agent-commission.price"),
              t("accordions.agent-commission.commission")
            ]}
            content={
              unit.project?.agentCommissions?.map(commission => [
                `${commission.from === 0 ? "0" : `${unit.project?.currency === "USD" ? t("currency.USD") : t("currency.THB")}${commission.from.toLocaleString()}`} – ${commission.to >= 100000000 ? "and more" : `${unit.project?.currency === "USD" ? t("currency.USD") : t("currency.THB")}${commission.to.toLocaleString()}`}`,
                `${commission.commission.toFixed(1)}%`
              ]) || []
            }
          />

          <AccordionItemContent
            title={[
              t("accordions.cashback-bonus.bonus"),
              t("accordions.cashback-bonus.condition")
            ]}
            content={
              unit.project?.cashbackBonuses?.map(commission => [
                `${commission.cashbackBonus.toFixed(1)}%`,
                commission.condition
              ]) || []
            }
          />
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default UnitPurchaseConditions;

interface IStartContentProps {
  Icon: ElementType;
  title: string;
  description: string;
}

function StartContent({ Icon, title, description }: IStartContentProps) {
  return (
    <div className={`${styles.startContent}`}>
      <div className={`${styles.iconContainer}`}>
        <Icon className={`${styles.startContentIcon}`} />
      </div>
      <div className={`${styles.startContentText}`}>
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
    </div>
  );
}

interface IAccordionItemContentProps {
  title?: string[];
  content: string[][];
}

function AccordionItemContent({ title, content }: IAccordionItemContentProps) {
  return (
    <div className={`${styles.accordionItemContent}`}>
      <div className={`${styles.col}`}>
        <div className={`${styles.titles}`}>
          {title &&
            title.length > 0 &&
            title.map((titleItem, idx) => <h4 key={idx}>{titleItem}</h4>)}
        </div>

        <div className={`${styles.content}`}>
          {content.map((contentRow, rowIdx) => (
            <div key={rowIdx} className={`${styles.contentRow}`}>
              {contentRow.map((contentItem, inx) => (
                <div key={inx} className={`${styles.rowItem}`}>
                  {contentItem}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
