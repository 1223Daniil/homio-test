import {
  IconBolt,
  IconBuildingEstate,
  IconCompass,
  IconHome,
  IconLayoutGrid,
  IconNotes,
  IconSeo,
  IconSortAscending,
  IconTags
} from "@tabler/icons-react";
import { Input, Select, Textarea } from "@heroui/react";
import { UnitLayout, UnitLayoutStatus, UnitLayoutType } from "@prisma/client";

import { useTranslations } from "next-intl";

interface LayoutGeneralFormProps {
  layout: Partial<UnitLayout>;
  onFieldChange: <K extends keyof UnitLayout>(
    field: K,
    value: UnitLayout[K]
  ) => void;
}

export function LayoutGeneralForm({
  layout,
  onFieldChange
}: LayoutGeneralFormProps) {
  const t = useTranslations("Layouts");

  return (
    <div className="space-y-4">
      <Input
        label={t("fields.name")}
        value={layout.name || ""}
        onChange={e => onFieldChange("name", e.target.value)}
        isRequired
        startContent={<IconHome size={20} className="text-default-500" />}
      />

      <div className="flex gap-4">
        <div className="flex-1">
          <select
            className="form-select block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-4"
            value={layout.type || ""}
            onChange={e =>
              onFieldChange("type", e.target.value as UnitLayoutType)
            }
            required
          >
            <option value="">{t("fields.selectType")}</option>
            {Object.values(UnitLayoutType).map(type => (
              <option key={type} value={type}>
                {t(`types.${type}`)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <select
            className="form-select block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-4"
            value={layout.status || "DRAFT"}
            onChange={e =>
              onFieldChange("status", e.target.value as UnitLayoutStatus)
            }
          >
            {Object.values(UnitLayoutStatus).map(status => (
              <option key={status} value={status}>
                {t(`status.${status}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Textarea
        label={t("fields.description")}
        value={layout.description || ""}
        onChange={e => onFieldChange("description", e.target.value)}
        startContent={<IconNotes size={20} className="text-default-500" />}
      />

      <Input
        type="number"
        label={t("fields.order")}
        value={layout.order?.toString() || "0"}
        onChange={e => onFieldChange("order", parseInt(e.target.value) || 0)}
        startContent={
          <IconSortAscending size={20} className="text-default-500" />
        }
      />

      <Input
        label={t("fields.orientation")}
        value={layout.orientation || ""}
        onChange={e => onFieldChange("orientation", e.target.value)}
        startContent={<IconCompass size={20} className="text-default-500" />}
      />

      <Input
        label={t("fields.energyClass")}
        value={layout.energyClass || ""}
        onChange={e => onFieldChange("energyClass", e.target.value)}
        startContent={<IconBolt size={20} className="text-default-500" />}
      />

      <Input
        type="number"
        label={t("fields.floor")}
        value={layout.floor?.toString() || ""}
        onChange={e => onFieldChange("floor", parseInt(e.target.value) || null)}
        startContent={
          <IconBuildingEstate size={20} className="text-default-500" />
        }
      />

      <div className="space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <IconTags size={20} className="text-default-500" />
          {t("fields.tags")}
        </h3>
        <Input
          value={Array.isArray(layout.tags) ? layout.tags.join(", ") : ""}
          onChange={e =>
            onFieldChange(
              "tags",
              e.target.value.split(",").map(tag => tag.trim())
            )
          }
          placeholder={t("fields.tagsPlaceholder")}
        />
      </div>

      <div className="border-t border-gray-200 pt-4 mt-4 space-y-4">
        <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
          <IconSeo size={20} className="text-default-500" />
          {t("fields.seo")}
        </h3>

        <Input
          label={t("fields.seoTitle")}
          value={layout.seoTitle || ""}
          onChange={e => onFieldChange("seoTitle", e.target.value)}
        />

        <Textarea
          label={t("fields.seoDescription")}
          value={layout.seoDescription || ""}
          onChange={e => onFieldChange("seoDescription", e.target.value)}
        />

        <Input
          label={t("fields.seoKeywords")}
          value={
            Array.isArray(layout.seoKeywords)
              ? layout.seoKeywords.join(", ")
              : ""
          }
          onChange={e =>
            onFieldChange(
              "seoKeywords",
              e.target.value.split(",").map(k => k.trim())
            )
          }
          placeholder={t("fields.seoKeywordsPlaceholder")}
        />
      </div>
    </div>
  );
}
