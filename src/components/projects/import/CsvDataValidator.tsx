import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip
} from "@heroui/react";
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconInfoCircle
} from "@tabler/icons-react";
import React, { useEffect, useState } from "react";

import { FIELD_TYPES } from "./CsvFieldMapping";
import { useTranslations } from "next-intl";

interface ValidationError {
  row: number;
  field: string;
  message: string;
  value: any;
}

interface CsvDataValidatorProps {
  csvData: Array<Array<string>>;
  csvHeaders: string[];
  mapping: Record<string, string>;
  onValidationComplete: (
    isValid: boolean,
    errors: ValidationError[],
    processedData: any[]
  ) => void;
}

export function CsvDataValidator({
  csvData,
  csvHeaders,
  mapping,
  onValidationComplete
}: CsvDataValidatorProps) {
  const t = useTranslations("Units");
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );
  const [isValid, setIsValid] = useState<boolean>(false);
  const [processedData, setProcessedData] = useState<any[]>([]);
  const [showAllErrors, setShowAllErrors] = useState<boolean>(false);

  // Валидация данных при изменении маппинга или данных
  useEffect(() => {
    validateData();
  }, [csvData, csvHeaders, mapping]);

  // Функция валидации данных
  const validateData = () => {
    const errors: ValidationError[] = [];
    const processed: any[] = [];

    console.log("=== DATA VALIDATION STARTED ===");
    console.log("CSV Headers:", csvHeaders);
    console.log("Field Mapping:", mapping);
    console.log("Total rows to validate:", csvData.length);

    // Проверяем, что обязательные поля сопоставлены
    const requiredFields = ["unit_number"];

    // Получаем список полей, которые сопоставлены с полями юнитов
    // Преобразуем объект маппинга в массив пар [header, field]
    const mappedFieldPairs = Object.entries(mapping);

    // Проверяем, что каждое обязательное поле имеет хотя бы одно сопоставление
    const missingRequiredFields = requiredFields.filter(
      requiredField =>
        !mappedFieldPairs.some(([_, field]) => field === requiredField)
    );

    console.log("Required fields:", requiredFields);
    console.log("Mapped field pairs:", mappedFieldPairs);
    console.log("Missing required fields:", missingRequiredFields);

    if (missingRequiredFields.length > 0) {
      missingRequiredFields.forEach(field => {
        errors.push({
          row: -1,
          field,
          message: `Обязательное поле "${field}" не сопоставлено`,
          value: null
        });
        console.log(`ERROR: Required field "${field}" is not mapped`);
      });
    }

    // Валидация каждой строки данных
    csvData.forEach((row, rowIndex) => {
      // Пропускаем пустые строки
      if (row.every(cell => cell.trim() === "")) {
        console.log(`Row ${rowIndex + 1}: Empty row, skipping`);
        return;
      }

      console.log(`\nValidating row ${rowIndex + 1}:`, row);

      const processedRow: Record<string, any> = {};

      // Проверяем каждую ячейку
      csvHeaders.forEach((header, colIndex) => {
        const fieldName = mapping[header];

        // Пропускаем игнорируемые поля
        if (fieldName === "ignore" || !fieldName) {
          console.log(`Column "${header}": Ignored`);
          return;
        }

        const value = row[colIndex]?.trim() || "";
        console.log(
          `Column "${header}" -> Field "${fieldName}": Value = "${value}"`
        );

        // Проверка на пустое значение для обязательных полей
        if (requiredFields.includes(fieldName) && value === "") {
          errors.push({
            row: rowIndex,
            field: fieldName,
            message: `Обязательное поле "${fieldName}" не может быть пустым`,
            value
          });
          console.log(`ERROR: Required field "${fieldName}" is empty`);
          return;
        }

        // Валидация типа данных
        const fieldType = FIELD_TYPES[fieldName as keyof typeof FIELD_TYPES];
        let processedValue: any = value;

        if (value !== "") {
          try {
            switch (fieldType) {
              case "number":
                processedValue = parseFloat(value.replace(/,/g, "."));
                if (isNaN(processedValue)) {
                  throw new Error("Не является числом");
                }
                console.log(`Parsed number: ${processedValue}`);
                break;
              case "price":
                // Удаляем все нечисловые символы, кроме точки и запятой
                processedValue = parseFloat(
                  value.replace(/[^\d.,]/g, "").replace(/,/g, ".")
                );
                if (isNaN(processedValue)) {
                  throw new Error("Не является ценой");
                }
                console.log(`Parsed price: ${processedValue}`);
                break;
              case "string":
                // Строки не требуют преобразования
                console.log(`String value: "${processedValue}"`);
                break;
              default:
                // Для неизвестных типов просто используем значение как есть
                console.log(
                  `Unknown type for field "${fieldName}": ${fieldType}`
                );
                break;
            }
          } catch (error) {
            errors.push({
              row: rowIndex,
              field: fieldName,
              message: `Неверный формат данных для поля "${fieldName}": ${error instanceof Error ? error.message : "ошибка"}`,
              value
            });
            console.log(
              `ERROR: Invalid format for field "${fieldName}": ${error instanceof Error ? error.message : "error"}`
            );
            return;
          }
        }

        // Добавляем обработанное значение в строку
        processedRow[fieldName] = processedValue;
      });

      // Добавляем обработанную строку в результат
      processed.push(processedRow);
      console.log(`Row ${rowIndex + 1} processed:`, processedRow);
    });

    console.log("\n=== VALIDATION RESULTS ===");
    console.log(`Total rows: ${csvData.length}`);
    console.log(`Processed rows: ${processed.length}`);
    console.log(`Errors: ${errors.length}`);
    if (errors.length > 0) {
      console.log("Validation errors:", errors);
    } else {
      console.log("No validation errors found");
    }
    console.log("=== VALIDATION COMPLETED ===");

    setValidationErrors(errors);
    setProcessedData(processed);
    setIsValid(errors.length === 0);

    // Вызываем колбэк с результатами валидации
    onValidationComplete(errors.length === 0, errors, processed);
  };

  // Отображаем только первые 10 ошибок, если не включен режим "показать все"
  const displayedErrors = showAllErrors
    ? validationErrors
    : validationErrors.slice(0, 10);

  return (
    <Card className="mb-6">
      <CardHeader className="pb-0">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-medium text-default-900 dark:text-white">
              {t("validation.title")}
            </h3>
            <p className="text-default-500 text-sm">
              {t("validation.description")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isValid ? (
              <Chip
                color="success"
                variant="flat"
                startContent={<IconCircleCheck size={14} />}
              >
                {t("validation.valid")}
              </Chip>
            ) : (
              <Chip
                color="danger"
                variant="flat"
                startContent={<IconAlertTriangle size={14} />}
              >
                {t("validation.invalid")}: {validationErrors.length}
              </Chip>
            )}
          </div>
        </div>
      </CardHeader>
      <CardBody>
        {validationErrors.length > 0 ? (
          <div className="flex flex-col gap-4">
            <div className="overflow-auto">
              <Table aria-label="Validation errors">
                <TableHeader>
                  <TableColumn>{t("validation.table.row")}</TableColumn>
                  <TableColumn>{t("validation.table.field")}</TableColumn>
                  <TableColumn>{t("validation.table.value")}</TableColumn>
                  <TableColumn>{t("validation.table.error")}</TableColumn>
                </TableHeader>
                <TableBody>
                  {displayedErrors.map((error, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {error.row >= 0 ? error.row + 1 : "—"}
                      </TableCell>
                      <TableCell>{error.field}</TableCell>
                      <TableCell>
                        {error.value !== null ? String(error.value) : "—"}
                      </TableCell>
                      <TableCell>{error.message}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {validationErrors.length > 10 && !showAllErrors && (
              <div className="flex justify-center">
                <Button
                  variant="flat"
                  color="default"
                  onClick={() => setShowAllErrors(true)}
                >
                  {t("validation.showAllErrors")} ({validationErrors.length})
                </Button>
              </div>
            )}

            <div className="p-3 bg-default-50 dark:bg-default-100/10 rounded-md">
              <div className="flex items-center gap-2">
                <IconInfoCircle size={16} className="text-primary" />
                <span className="text-sm font-medium text-default-900 dark:text-white">
                  {t("validation.recommendations.recommendations")}
                </span>
              </div>
              <ul className="mt-2 text-sm text-default-700 dark:text-default-300 list-disc list-inside">
                <li>{t("validation.recommendations.recommendationsList.0")}</li>
                <li>{t("validation.recommendations.recommendationsList.1")}</li>
                <li>{t("validation.recommendations.recommendationsList.2")}</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-success-50 dark:bg-success-900/20 rounded-md">
            <div className="flex items-center gap-2">
              <IconCircleCheck size={18} className="text-success" />
              <span className="text-sm font-medium text-success-700 dark:text-success-300">
                {t("validation.success")}
              </span>
            </div>
            <p className="mt-2 text-sm text-default-700 dark:text-default-300">
              {t("validation.readyToImport", { count: processedData.length })}
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
