import { Input } from "@heroui/react";
import { UnitLayout } from "@prisma/client";
import { useTranslations } from "next-intl";
import {
  IconCurrencyDollar,
  IconCoin,
  IconRulerMeasure,
  IconReceipt
} from "@tabler/icons-react";

interface LayoutPricingFormProps {
  layout: Partial<UnitLayout>;
  onFieldChange: <K extends keyof UnitLayout>(field: K, value: UnitLayout[K]) => void;
}

export function LayoutPricingForm({ layout, onFieldChange }: LayoutPricingFormProps) {
  const t = useTranslations("Layouts");

  const handlePriceChange = (field: keyof UnitLayout, value: string) => {
    const numValue = value === "" ? null : parseFloat(value);
    onFieldChange(field, numValue as UnitLayout[typeof field]);
  };

  const currencies = ["USD", "EUR", "THB", "SGD"] as const;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          type="number"
          label={t("fields.basePrice")}
          value={layout.basePrice?.toString() || ""}
          onChange={(e) => handlePriceChange("basePrice", e.target.value)}
          step="0.01"
          min="0"
          startContent={<IconCurrencyDollar size={20} className="text-default-500" />}
        />

        <div className="flex items-end gap-2">
          <div className="flex-1">
            <select
              className="form-select block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              value={layout.currency || "USD"}
              onChange={(e) => onFieldChange("currency", e.target.value)}
              required
            >
              {currencies.map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>
          <div className="w-10 h-10 flex items-center justify-center">
            <IconCoin size={20} className="text-default-500" />
          </div>
        </div>

        <Input
          type="number"
          label={t("fields.pricePerSqm")}
          value={layout.pricePerSqm?.toString() || ""}
          onChange={(e) => handlePriceChange("pricePerSqm", e.target.value)}
          step="0.01"
          min="0"
          startContent={<IconRulerMeasure size={20} className="text-default-500" />}
        />

        <Input
          type="number"
          label={t("fields.maintenanceFee")}
          value={layout.maintenanceFee?.toString() || ""}
          onChange={(e) => handlePriceChange("maintenanceFee", e.target.value)}
          step="0.01"
          min="0"
          startContent={<IconReceipt size={20} className="text-default-500" />}
        />
      </div>
    </div>
  );
} 