import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Tooltip
} from "@heroui/react";
import {
  IconArrowRight,
  IconDeviceFloppy,
  IconInfoCircle
} from "@tabler/icons-react";
import React, { useEffect, useState } from "react";

import { toast } from "sonner";
import { useTranslations } from "next-intl";

// Доступные поля для маппинга
export const AVAILABLE_FIELDS = (t: any) => ({
  unit_number: t("matching.availableFields.unit_number"),
  floor_number: t("matching.availableFields.floor_number"),
  building: t("matching.availableFields.building"),
  layout_id: t("matching.availableFields.layout_id"),
  availability_status: t("matching.availableFields.availability_status"),
  base_price_excl_vat: t("matching.availableFields.base_price_excl_vat"),
  final_price_incl_vat: t("matching.availableFields.final_price_incl_vat"),
  selling_price: t("matching.availableFields.selling_price"),
  discount_price: t("matching.availableFields.discount_price"),
  unit_description: t("matching.availableFields.unit_description"),
  view_description: t("matching.availableFields.view_description"),
  area: t("matching.availableFields.area"),
  bedrooms: t("matching.availableFields.bedrooms"),
  bathrooms: t("matching.availableFields.bathrooms")
});

// Типы полей для валидации
export const FIELD_TYPES = {
  unit_number: "string",
  floor_number: "number",
  building: "string",
  layout_id: "string",
  availability_status: "string",
  base_price_excl_vat: "price",
  final_price_incl_vat: "price",
  selling_price: "price",
  discount_price: "price",
  unit_description: "string",
  view_description: "string",
  area: "number",
  bedrooms: "number",
  bathrooms: "number"
};

interface CsvFieldMappingProps {
  csvHeaders: string[];
  projectId: string;
  onMappingChange: (mapping: Record<string, string>) => void;
}

export function CsvFieldMapping({
  csvHeaders,
  projectId,
  onMappingChange
}: CsvFieldMappingProps) {
  const t = useTranslations("Units");
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [savedMappings, setSavedMappings] = useState<
    Array<{ id: string; name: string; mappings: Record<string, string> }>
  >([]);
  const [selectedMappingId, setSelectedMappingId] = useState<string>("");
  const [mappingName, setMappingName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Загружаем сохраненные маппинги при монтировании
  useEffect(() => {
    fetchSavedMappings();
  }, [projectId]);

  // Загрузка сохраненных маппингов
  const fetchSavedMappings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/projects/${projectId}/units/field-mappings`
      );
      if (response.ok) {
        const data = await response.json();
        setSavedMappings(data);
      }
    } catch (error) {
      console.error("Error fetching saved mappings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Автоматическое сопоставление полей
  const autoMapFields = () => {
    const newMapping: Record<string, string> = {};

    // Словарь с дополнительными ключевыми словами для каждого поля
    const fieldKeywords: Record<string, string[]> = {
      unit_number: ["номер", "number", "unit", "юнит", "id", "код", "code"],
      floor_number: ["этаж", "floor", "level", "уровень"],
      building: ["здание", "building", "корпус", "дом", "house", "block"],
      layout_id: ["планировка", "layout", "тип", "type"],
      availability_status: [
        "статус",
        "status",
        "доступность",
        "availability",
        "available"
      ],
      base_price_excl_vat: [
        "базовая",
        "цена",
        "без",
        "ндс",
        "base",
        "price",
        "excl",
        "vat"
      ],
      final_price_incl_vat: [
        "финальная",
        "цена",
        "с",
        "ндс",
        "final",
        "price",
        "incl",
        "vat"
      ],
      selling_price: ["цена", "продажи", "продажа", "selling", "price", "sale"],
      discount_price: ["скидка", "цена", "со", "скидкой", "discount", "price"],
      unit_description: ["описание", "юнит", "description", "unit"],
      view_description: ["вид", "из", "окон", "view", "window"],
      area: ["площадь", "area", "size", "размер", "кв.м", "м2", "sqm"],
      bedrooms: ["спальни", "спальня", "bedroom", "bedrooms", "bed"],
      bathrooms: [
        "санузлы",
        "санузел",
        "ванная",
        "bathroom",
        "bathrooms",
        "bath"
      ]
    };

    console.log("=== AUTO MAPPING FIELDS ===");
    console.log("CSV Headers:", csvHeaders);

    csvHeaders.forEach(header => {
      // Нормализуем заголовок для сравнения
      const normalizedHeader = header.toLowerCase().trim();
      let bestMatch: string | null = null;
      let bestMatchScore = 0;

      console.log(
        `\nProcessing header: "${header}" (normalized: "${normalizedHeader}")`
      );

      // Проверяем точные совпадения сначала
      for (const [field, label] of Object.entries(AVAILABLE_FIELDS)) {
        const normalizedLabel = label.toLowerCase();
        const normalizedField = field.toLowerCase();

        if (
          normalizedHeader === normalizedLabel ||
          normalizedHeader === normalizedField
        ) {
          bestMatch = field;
          console.log(
            `Exact match found: "${header}" -> "${field}" (${label})`
          );
          break; // Нашли точное совпадение, прекращаем поиск
        }
      }

      // Если точное совпадение не найдено, ищем по ключевым словам и частичным совпадениям
      if (!bestMatch) {
        console.log(
          `No exact match for "${header}", trying keywords and partial matches`
        );

        for (const [field, label] of Object.entries(AVAILABLE_FIELDS)) {
          const normalizedLabel = label.toLowerCase();
          const normalizedField = field.toLowerCase();
          const keywords = fieldKeywords[field] || [];

          // Проверяем, содержит ли заголовок название поля или его метку
          if (
            normalizedHeader.includes(normalizedField) ||
            normalizedHeader.includes(normalizedLabel)
          ) {
            const score =
              normalizedField.length > normalizedLabel.length
                ? normalizedField.length
                : normalizedLabel.length;

            console.log(
              `Partial match: "${header}" contains "${field}" or "${label}", score: ${score}`
            );

            if (score > bestMatchScore) {
              bestMatch = field;
              bestMatchScore = score;
              console.log(`New best match: "${field}" with score ${score}`);
            }
          }

          // Проверяем ключевые слова
          for (const keyword of keywords) {
            if (normalizedHeader.includes(keyword)) {
              const score = keyword.length;
              console.log(
                `Keyword match: "${header}" contains keyword "${keyword}" for field "${field}", score: ${score}`
              );

              if (score > bestMatchScore) {
                bestMatch = field;
                bestMatchScore = score;
                console.log(`New best match: "${field}" with score ${score}`);
              }
            }
          }
        }
      }

      // Если соответствие найдено, устанавливаем его, иначе "ignore"
      newMapping[header] = bestMatch || "ignore";
      console.log(`Final mapping for "${header}": ${newMapping[header]}`);
    });

    // Проверяем, что обязательные поля сопоставлены
    const requiredFields = ["unit_number"];
    const mappedFields = Object.values(newMapping);

    console.log("\nChecking required fields:");
    console.log("Required fields:", requiredFields);
    console.log("Mapped fields:", mappedFields);

    // Если обязательное поле не сопоставлено, пытаемся найти наиболее подходящий заголовок
    requiredFields.forEach(requiredField => {
      if (!mappedFields.includes(requiredField)) {
        console.log(
          `Required field "${requiredField}" is not mapped, trying to find best match`
        );

        // Ищем наиболее подходящий заголовок для этого поля
        let bestHeader: string = "";
        let bestScore = 0;

        for (const header of csvHeaders) {
          const normalizedHeader = header.toLowerCase().trim();
          const keywords = fieldKeywords[requiredField] || [];

          // Проверяем, насколько заголовок соответствует ключевым словам
          for (const keyword of keywords) {
            if (normalizedHeader.includes(keyword)) {
              const score = keyword.length;
              console.log(
                `Header "${header}" contains keyword "${keyword}" for required field "${requiredField}", score: ${score}`
              );

              if (score > bestScore) {
                bestHeader = header;
                bestScore = score;
                console.log(
                  `New best header for "${requiredField}": "${bestHeader}" with score ${bestScore}`
                );
              }
            }
          }
        }

        // Если нашли подходящий заголовок, устанавливаем сопоставление
        if (bestHeader && newMapping[bestHeader] === "ignore") {
          console.log(
            `Setting "${bestHeader}" to required field "${requiredField}" (was "ignore")`
          );
          newMapping[bestHeader] = requiredField;
        } else if (bestHeader) {
          console.log(
            `Best header "${bestHeader}" is already mapped to "${newMapping[bestHeader]}"`
          );
        } else {
          console.log(
            `Could not find suitable header for required field "${requiredField}"`
          );
        }
      } else {
        console.log(`Required field "${requiredField}" is already mapped`);
      }
    });

    console.log("\nFinal mapping:", newMapping);
    console.log("=== AUTO MAPPING COMPLETED ===");

    setMapping(newMapping);
    onMappingChange(newMapping);
  };

  // Обработчик изменения маппинга
  const handleMappingChange = (header: string, value: string) => {
    const newMapping = { ...mapping, [header]: value };
    setMapping(newMapping);
    onMappingChange(newMapping);
  };

  // Загрузка сохраненного маппинга
  const loadMapping = (id: string) => {
    const selected = savedMappings.find(m => m.id === id);
    if (selected) {
      setMapping(selected.mappings);
      onMappingChange(selected.mappings);
      setMappingName(selected.name);
    }
  };

  // Сохранение маппинга
  const saveMapping = async () => {
    if (!mappingName.trim()) {
      toast.error("Введите название для сохранения маппинга");
      return;
    }

    try {
      setIsLoading(true);

      // Создаем чистую копию объекта mapping без циклических ссылок
      const cleanMapping: Record<string, string> = {};
      Object.keys(mapping).forEach(key => {
        const value = mapping[key];
        if (value !== undefined) {
          cleanMapping[key] = value;
        } else {
          cleanMapping[key] = "ignore"; // Используем значение по умолчанию, если значение не определено
        }
      });

      const response = await fetch(
        `/api/projects/${projectId}/units/field-mappings`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: mappingName,
            mappings: cleanMapping,
            isDefault: savedMappings.length === 0 // Первый маппинг по умолчанию
          })
        }
      );

      if (response.ok) {
        const result = await response.json();
        toast.success("Маппинг успешно сохранен");
        fetchSavedMappings();
        setSelectedMappingId(result.id);
      } else {
        toast.error("Ошибка при сохранении маппинга");
      }
    } catch (error) {
      console.error("Error saving mapping:", error);
      toast.error("Ошибка при сохранении маппинга");
    } finally {
      setIsLoading(false);
    }
  };

  // Автоматическое сопоставление при первой загрузке
  useEffect(() => {
    if (csvHeaders.length > 0 && Object.keys(mapping).length === 0) {
      autoMapFields();
    }
  }, [csvHeaders]);

  return (
    <Card className="mb-6">
      <CardHeader className="pb-0">
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-medium text-default-900 dark:text-white">
            {t("matching.title")}
          </h3>
          <p className="text-default-500 text-sm">
            {t("matching.description")}
          </p>
        </div>
      </CardHeader>
      <CardBody>
        <div className="flex flex-col gap-4">
          {/* Управление маппингами */}
          <div className="flex flex-wrap gap-4 items-end mb-2">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 text-default-700 dark:text-default-300">
                {t("matching.savedTemplates")}
              </label>
              <select
                className="w-full p-2 border rounded-md bg-[#F5F5F7] dark:bg-[#2C2C2C] border-default-200 dark:border-default-100/20 text-default-900 dark:text-white"
                value={selectedMappingId}
                onChange={e => {
                  setSelectedMappingId(e.target.value);
                  loadMapping(e.target.value);
                }}
                disabled={isLoading || savedMappings.length === 0}
              >
                <option value="">{t("matching.selectTemplate")}</option>
                {savedMappings.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 text-default-700 dark:text-default-300">
                {t("matching.name")}
              </label>
              <input
                type="text"
                value={mappingName}
                onChange={e => setMappingName(e.target.value)}
                placeholder={t("matching.namePlaceholder")}
                className="w-full p-2 border rounded-md bg-[#F5F5F7] dark:bg-[#2C2C2C] border-default-200 dark:border-default-100/20 text-default-900 dark:text-white"
              />
            </div>
            <Button
              color="primary"
              variant="flat"
              isLoading={isLoading}
              onClick={saveMapping}
              startContent={<IconDeviceFloppy size={16} />}
            >
              {t("matching.saveMapping")}
            </Button>
            <Button color="default" variant="flat" onClick={autoMapFields}>
              {t("matching.autoMapping")}
            </Button>
          </div>

          {/* Таблица сопоставления полей */}
          <div className="overflow-auto">
            <table className="min-w-full divide-y divide-default-200 dark:divide-default-100/20">
              <thead className="bg-default-50 dark:bg-default-100/10">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-default-700 dark:text-default-300 uppercase tracking-wider">
                    {t("matching.table.csvField")}
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-medium text-default-700 dark:text-default-300 uppercase tracking-wider">
                    {t("matching.table.mapping")}
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-default-700 dark:text-default-300 uppercase tracking-wider">
                    {t("matching.table.unitField")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-default-50/5 divide-y divide-default-200 dark:divide-default-100/20">
                {csvHeaders.map(header => (
                  <tr key={header}>
                    <td className="px-3 py-2 text-sm text-default-900 dark:text-white">
                      {header}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <IconArrowRight
                        size={16}
                        className="text-default-500 mx-auto"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select
                        className="w-full p-2 border rounded-md bg-[#F5F5F7] dark:bg-[#2C2C2C] border-default-200 dark:border-default-100/20 text-default-900 dark:text-white"
                        value={mapping[header] || "ignore"}
                        onChange={e =>
                          handleMappingChange(header, e.target.value)
                        }
                      >
                        <option value="ignore">
                          {t("matching.availableFields.ignore")}
                        </option>
                        {Object.entries(AVAILABLE_FIELDS(t)).map(
                          ([field, label]) => (
                            <option key={field} value={field}>
                              {label}
                            </option>
                          )
                        )}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Легенда */}
          <div className="mt-4 p-3 bg-default-50 dark:bg-default-100/10 rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <IconInfoCircle size={16} className="text-primary" />
              <span className="text-sm font-medium text-default-900 dark:text-white">
                {t("matching.requiredFields")}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Chip color="primary" variant="flat">
                {t("matching.availableFields.unit_number")}
              </Chip>
              <Chip color="primary" variant="flat">
                {t("matching.availableFields.floor_number")}
              </Chip>
              <Chip color="primary" variant="flat">
                {t("matching.availableFields.selling_price")}
              </Chip>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
