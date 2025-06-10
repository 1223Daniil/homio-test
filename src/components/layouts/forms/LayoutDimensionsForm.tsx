import {
  IconBath,
  IconBed,
  IconBuildingSkyscraper,
  IconCompass,
  IconHome2,
  IconRuler2,
  IconRulerMeasure,
  IconWindow
} from "@tabler/icons-react";

import { Input } from "@heroui/react";
import { UnitLayout } from "@prisma/client";
import { useTranslations } from "next-intl";

interface LayoutDimensionsFormProps {
  layout: Partial<UnitLayout>;
  onFieldChange: <K extends keyof UnitLayout>(
    field: K,
    value: UnitLayout[K]
  ) => void;
}

export function LayoutDimensionsForm({
  layout,
  onFieldChange
}: LayoutDimensionsFormProps) {
  const t = useTranslations("Layouts");

  const handleNumericChange = (field: keyof UnitLayout, value: string) => {
    const numValue = value === "" ? null : parseFloat(value);
    onFieldChange(field, numValue as UnitLayout[typeof field]);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          type="number"
          label={t("dimensions.totalArea.label")}
          placeholder={t("dimensions.totalArea.placeholder")}
          value={layout.totalArea?.toString() || ""}
          onChange={e => handleNumericChange("totalArea", e.target.value)}
          step="0.01"
          min="0"
          isRequired
          startContent={<IconRuler2 className="text-default-500" size={20} />}
          description={t("dimensions.totalArea.description")}
        />

        <Input
          type="number"
          label={t("dimensions.livingArea.label")}
          placeholder={t("dimensions.livingArea.placeholder")}
          value={layout.livingArea?.toString() || ""}
          onChange={e => handleNumericChange("livingArea", e.target.value)}
          step="0.01"
          min="0"
          startContent={<IconHome2 className="text-default-500" size={20} />}
          description={t("dimensions.livingArea.description")}
        />

        <Input
          type="number"
          label={t("dimensions.balconyArea.label")}
          placeholder={t("dimensions.balconyArea.placeholder")}
          value={layout.balconyArea?.toString() || ""}
          onChange={e => handleNumericChange("balconyArea", e.target.value)}
          step="0.01"
          min="0"
          startContent={
            <IconBuildingSkyscraper className="text-default-500" size={20} />
          }
          description={t("dimensions.balconyArea.description")}
        />

        <Input
          type="number"
          label={t("dimensions.ceilingHeight.label")}
          placeholder={t("dimensions.ceilingHeight.placeholder")}
          value={layout.ceilingHeight?.toString() || ""}
          onChange={e => handleNumericChange("ceilingHeight", e.target.value)}
          step="0.01"
          min="0"
          startContent={
            <IconRulerMeasure className="text-default-500" size={20} />
          }
          description={t("dimensions.ceilingHeight.description")}
        />

        <Input
          type="number"
          label={t("dimensions.bedrooms.label")}
          placeholder={t("dimensions.bedrooms.placeholder")}
          value={layout.bedrooms?.toString() || "0"}
          onChange={e => handleNumericChange("bedrooms", e.target.value)}
          min="0"
          startContent={<IconBed className="text-default-500" size={20} />}
          description={t("dimensions.bedrooms.description")}
        />

        <Input
          type="number"
          label={t("dimensions.bathrooms.label")}
          placeholder={t("dimensions.bathrooms.placeholder")}
          value={layout.bathrooms?.toString() || "0"}
          onChange={e => handleNumericChange("bathrooms", e.target.value)}
          min="0"
          startContent={<IconBath className="text-default-500" size={20} />}
          description={t("dimensions.bathrooms.description")}
        />

        <Input
          type="number"
          label={t("dimensions.windowCount.label")}
          placeholder={t("dimensions.windowCount.placeholder")}
          value={layout.windowCount?.toString() || ""}
          onChange={e => handleNumericChange("windowCount", e.target.value)}
          min="0"
          startContent={<IconWindow className="text-default-500" size={20} />}
          description={t("dimensions.windowCount.description")}
        />

        <Input
          label={t("dimensions.orientation.label")}
          placeholder={t("dimensions.orientation.placeholder")}
          value={layout.orientation || ""}
          onChange={e => onFieldChange("orientation", e.target.value)}
          startContent={<IconCompass className="text-default-500" size={20} />}
          description={t("dimensions.orientation.description")}
        />
      </div>
    </div>
  );
}
