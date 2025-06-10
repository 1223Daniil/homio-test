import { Button, Checkbox, Input, Textarea } from "@heroui/react";
import {
  IconAirConditioning,
  IconArmchair,
  IconBox,
  IconBuildingSkyscraper,
  IconDeviceTv,
  IconDroplet,
  IconElevator,
  IconFlame,
  IconList,
  IconPaint,
  IconParking,
  IconPaw,
  IconPlus,
  IconShieldCheck,
  IconSmartHome,
  IconSofa,
  IconStar,
  IconTemperature,
  IconTrash,
  IconWheelchair,
  IconWifi
} from "@tabler/icons-react";

import { UnitLayout } from "@prisma/client";
import { useState } from "react";
import { useTranslations } from "next-intl";

interface Feature {
  name: string;
  value: string;
  [key: string]: string;
}

interface FurnitureItem {
  item: string;
  description: string;
  [key: string]: string;
}

interface FinishItem {
  type: string;
  material: string;
  [key: string]: string;
}

interface LayoutFeaturesFormProps {
  layout: Partial<UnitLayout>;
  onFieldChange: <K extends keyof UnitLayout>(
    field: K,
    value: UnitLayout[K]
  ) => void;
}

export const features = [
  {
    key: "hasBalcony",
    label: "features.hasBalcony",
    icon: IconBuildingSkyscraper
  },
  { key: "hasParking", label: "features.hasParking", icon: IconParking },
  { key: "hasStorage", label: "features.hasStorage", icon: IconBox },
  { key: "hasFurnished", label: "features.hasFurnished", icon: IconSofa },
  {
    key: "hasSmartHome",
    label: "features.hasSmartHome",
    icon: IconSmartHome
  },
  {
    key: "hasSecuritySystem",
    label: "features.hasSecuritySystem",
    icon: IconShieldCheck
  },
  {
    key: "hasAirConditioning",
    label: "features.hasAirConditioning",
    icon: IconAirConditioning
  },
  { key: "hasHeating", label: "features.hasHeating", icon: IconTemperature },
  {
    key: "hasWaterHeating",
    label: "features.hasWaterHeating",
    icon: IconDroplet
  },
  { key: "hasGas", label: "features.hasGas", icon: IconFlame },
  { key: "hasInternet", label: "features.hasInternet", icon: IconWifi },
  { key: "hasCableTV", label: "features.hasCableTV", icon: IconDeviceTv },
  { key: "hasElevator", label: "features.hasElevator", icon: IconElevator },
  {
    key: "hasWheelchairAccess",
    label: "features.hasWheelchairAccess",
    icon: IconWheelchair
  },
  { key: "hasPets", label: "features.hasPets", icon: IconPaw }
] as const;

export function LayoutFeaturesForm({
  layout,
  onFieldChange
}: LayoutFeaturesFormProps) {
  const t = useTranslations("Layouts");
  const [newFeatureName, setNewFeatureName] = useState("");
  const [newFeatureValue, setNewFeatureValue] = useState("");
  const [newFurnitureItem, setNewFurnitureItem] = useState("");
  const [newFurnitureDescription, setNewFurnitureDescription] = useState("");
  const [newFinishType, setNewFinishType] = useState("");
  const [newFinishMaterial, setNewFinishMaterial] = useState("");

  const currentFeatures: Feature[] = Array.isArray(layout.features)
    ? (layout.features as Feature[])
    : [];

  const currentFurniture: FurnitureItem[] = Array.isArray(layout.furniture)
    ? (layout.furniture as FurnitureItem[])
    : [];

  const currentFinishes: FinishItem[] = Array.isArray(layout.finishes)
    ? (layout.finishes as FinishItem[])
    : [];

  const handleAddFeature = () => {
    if (!newFeatureName || !newFeatureValue) return;

    const updatedFeatures = [
      ...currentFeatures,
      { name: newFeatureName, value: newFeatureValue }
    ];

    onFieldChange("features", updatedFeatures as any);
    setNewFeatureName("");
    setNewFeatureValue("");
  };

  const handleRemoveFeature = (index: number) => {
    const updatedFeatures = currentFeatures.filter((_, i) => i !== index);
    onFieldChange("features", updatedFeatures as any);
  };

  const handleAddFurniture = () => {
    if (!newFurnitureItem || !newFurnitureDescription) return;

    const updatedFurniture = [
      ...currentFurniture,
      { item: newFurnitureItem, description: newFurnitureDescription }
    ];

    onFieldChange("furniture", updatedFurniture as any);
    setNewFurnitureItem("");
    setNewFurnitureDescription("");
  };

  const handleRemoveFurniture = (index: number) => {
    const updatedFurniture = currentFurniture.filter((_, i) => i !== index);
    onFieldChange("furniture", updatedFurniture as any);
  };

  const handleAddFinish = () => {
    if (!newFinishType || !newFinishMaterial) return;

    const updatedFinishes = [
      ...currentFinishes,
      { type: newFinishType, material: newFinishMaterial }
    ];

    onFieldChange("finishes", updatedFinishes as any);
    setNewFinishType("");
    setNewFinishMaterial("");
  };

  const handleRemoveFinish = (index: number) => {
    const updatedFinishes = currentFinishes.filter((_, i) => i !== index);
    onFieldChange("finishes", updatedFinishes as any);
  };

  return (
    <div className="space-y-6">
      {/* Checkboxes for boolean features */}
      <div>
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <IconList size={20} className="text-default-500" />
          {t("form.sections.features")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ key, label, icon: Icon }) => (
            <div key={key} className="flex items-center gap-2">
              <Checkbox
                isSelected={
                  (layout[key as keyof UnitLayout] as boolean) || false
                }
                onValueChange={checked =>
                  onFieldChange(key as keyof UnitLayout, checked)
                }
              >
                <div className="flex items-center gap-2">
                  <Icon size={20} className="text-default-500" />
                  <span>{t(label)}</span>
                </div>
              </Checkbox>
            </div>
          ))}
        </div>
      </div>

      {/* Additional features */}
      <div>
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <IconStar size={20} className="text-default-500" />
          {t("form.sections.features")}
        </h3>

        {/* Existing features */}
        <div className="space-y-4 mb-4">
          {currentFeatures.map((feature, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  label={t("features.featuresForm.name.label")}
                  value={feature.name}
                  onChange={e => {
                    const updatedFeatures = [...currentFeatures];
                    updatedFeatures[index] = {
                      ...feature,
                      name: e.target.value
                    };
                    onFieldChange("features", updatedFeatures as any);
                  }}
                />
              </div>
              <div className="flex-1">
                <Input
                  label={t("features.featuresForm.value.label")}
                  value={feature.value}
                  onChange={e => {
                    const updatedFeatures = [...currentFeatures];
                    updatedFeatures[index] = {
                      ...feature,
                      value: e.target.value
                    };
                    onFieldChange("features", updatedFeatures as any);
                  }}
                />
              </div>
              <Button
                isIconOnly
                color="danger"
                variant="light"
                onPress={() => handleRemoveFeature(index)}
                className="mt-7"
              >
                <IconTrash size={20} />
              </Button>
            </div>
          ))}
        </div>

        {/* Add new feature */}
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <Input
              label={t("features.featuresForm.name.label")}
              value={newFeatureName}
              onChange={e => setNewFeatureName(e.target.value)}
              placeholder={t("features.featuresForm.name.placeholder")}
            />
          </div>
          <div className="flex-1">
            <Input
              label={t("features.featuresForm.value.label")}
              value={newFeatureValue}
              onChange={e => setNewFeatureValue(e.target.value)}
              placeholder={t("features.featuresForm.value.placeholder")}
            />
          </div>
          <Button
            isIconOnly
            color="primary"
            variant="light"
            onPress={handleAddFeature}
            className="mb-2"
          >
            <IconPlus size={20} />
          </Button>
        </div>
      </div>

      {/* Furniture */}
      <div>
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <IconArmchair size={20} className="text-default-500" />
          {t("features.furnitureForm.label")}
        </h3>

        {/* Existing furniture */}
        <div className="space-y-4 mb-4">
          {currentFurniture.map((furniture, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  label={t("features.furnitureForm.type.label")}
                  value={furniture.item}
                  onChange={e => {
                    const updatedFurniture = [...currentFurniture];
                    updatedFurniture[index] = {
                      ...furniture,
                      item: e.target.value
                    };
                    onFieldChange("furniture", updatedFurniture as any);
                  }}
                />
              </div>
              <div className="flex-1">
                <Input
                  label={t("features.furnitureForm.description.label")}
                  value={furniture.description}
                  onChange={e => {
                    const updatedFurniture = [...currentFurniture];
                    updatedFurniture[index] = {
                      ...furniture,
                      description: e.target.value
                    };
                    onFieldChange("furniture", updatedFurniture as any);
                  }}
                />
              </div>
              <Button
                isIconOnly
                color="danger"
                variant="light"
                onPress={() => handleRemoveFurniture(index)}
                className="mt-7"
              >
                <IconTrash size={20} />
              </Button>
            </div>
          ))}
        </div>

        {/* Add new furniture */}
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <Input
              label={t("features.furnitureForm.type.label")}
              value={newFurnitureItem}
              onChange={e => setNewFurnitureItem(e.target.value)}
              placeholder={t("features.furnitureForm.type.placeholder")}
            />
          </div>
          <div className="flex-1">
            <Input
              label={t("features.furnitureForm.description.label")}
              value={newFurnitureDescription}
              onChange={e => setNewFurnitureDescription(e.target.value)}
              placeholder={t("features.furnitureForm.description.placeholder")}
            />
          </div>
          <Button
            isIconOnly
            color="primary"
            variant="light"
            onPress={handleAddFurniture}
            className="mb-2"
          >
            <IconPlus size={20} />
          </Button>
        </div>
      </div>

      {/* Finishes */}
      <div>
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <IconPaint size={20} className="text-default-500" />
          {t("features.finishesForm.label")}
        </h3>

        {/* Existing finishes */}
        <div className="space-y-4 mb-4">
          {currentFinishes.map((finish, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  label={t("features.finishesForm.type.label")}
                  value={finish.type}
                  onChange={e => {
                    const updatedFinishes = [...currentFinishes];
                    updatedFinishes[index] = {
                      ...finish,
                      type: e.target.value
                    };
                    onFieldChange("finishes", updatedFinishes as any);
                  }}
                />
              </div>
              <div className="flex-1">
                <Input
                  label={t("features.finishesForm.material.label")}
                  value={finish.material}
                  onChange={e => {
                    const updatedFinishes = [...currentFinishes];
                    updatedFinishes[index] = {
                      ...finish,
                      material: e.target.value
                    };
                    onFieldChange("finishes", updatedFinishes as any);
                  }}
                />
              </div>
              <Button
                isIconOnly
                color="danger"
                variant="light"
                onPress={() => handleRemoveFinish(index)}
                className="mt-7"
              >
                <IconTrash size={20} />
              </Button>
            </div>
          ))}
        </div>

        {/* Add new finish */}
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <Input
              label={t("features.finishesForm.type.label")}
              value={newFinishType}
              onChange={e => setNewFinishType(e.target.value)}
              placeholder={t("features.finishesForm.type.placeholder")}
            />
          </div>
          <div className="flex-1">
            <Input
              label={t("features.finishesForm.material.label")}
              value={newFinishMaterial}
              onChange={e => setNewFinishMaterial(e.target.value)}
              placeholder={t("features.finishesForm.material.placeholder")}
            />
          </div>
          <Button
            isIconOnly
            color="primary"
            variant="light"
            onPress={handleAddFinish}
            className="mb-2"
          >
            <IconPlus size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
}

function formatJson(value: any) {
  if (!value) return "";
  try {
    return typeof value === "string" ? value : JSON.stringify(value, null, 2);
  } catch (error) {
    return "";
  }
}

function handleJsonChange(
  field: keyof Pick<UnitLayout, "furniture" | "finishes">,
  value: string,
  onFieldChange: LayoutFeaturesFormProps["onFieldChange"]
) {
  try {
    const jsonValue = value ? JSON.parse(value) : null;
    onFieldChange(field, jsonValue);
  } catch (error) {
    onFieldChange(field, null);
  }
}
