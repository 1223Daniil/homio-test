import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Divider,
  Spinner,
  Tab,
  Tabs,
  Textarea
} from "@heroui/react";
import {
  IconCode,
  IconFileUpload,
  IconInfoCircle,
  IconTable
} from "@tabler/icons-react";
import React, { useEffect, useState } from "react";

import { CsvImportStepper } from "../import/CsvImportStepper";
import Papa from "papaparse";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface Building {
  id: string;
  name: string;
}

interface UnitsImportFormProps {
  projectId: string;
  buildings: Building[];
  locale: string;
}

// Типы импорта
type ImportMethod = "json" | "csv";

export function UnitsImportForm({
  projectId,
  buildings,
  locale
}: UnitsImportFormProps) {
  const t = useTranslations("Units");

  const [importMethod, setImportMethod] = useState<ImportMethod>("json");
  const [selectedBuilding, setSelectedBuilding] = useState<string>("");
  const [updateExisting, setUpdateExisting] = useState<boolean>(true);
  const [jsonData, setJsonData] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [csvData, setCsvData] = useState<Array<Array<string>>>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);

  // Устанавливаем первое здание по умолчанию, если оно есть
  useEffect(() => {
    if (buildings.length > 0 && buildings[0]) {
      setSelectedBuilding(buildings[0].id);
    }
  }, [buildings]);

  // Сбрасываем состояния при изменении метода импорта
  useEffect(() => {
    setFile(null);
    if (importMethod === "json") {
      setCsvData([]);
      setCsvHeaders([]);
    } else {
      setJsonData("");
    }
  }, [importMethod]);

  // Создаем пример JSON с выбранным зданием
  const createExampleJson = () => {
    const defaultBuildingName =
      buildings.length > 0 && buildings[0]
        ? buildings[0].name || "Building A"
        : "Building A";

    // Обратите внимание: структура соответствует ожидаемому API формату
    return JSON.stringify(
      {
        data: [
          {
            unit_number: "A101",
            floor_number: 1,
            building: defaultBuildingName,
            layout_id: "1BS",
            availability_status: "Available",
            base_price_excl_vat: 4410000,
            final_price_incl_vat: 4582000,
            selling_price: 4582000,
            unit_description: "One Bedroom Suite",
            view_description: "Mountain View",
            area: 45.5,
            bedrooms: 1,
            bathrooms: 1
          }
        ],
        updateExisting: true,
        defaultBuildingId:
          buildings.length > 0 && buildings[0] ? buildings[0].id : ""
      },
      null,
      2
    );
  };

  // Обработчик загрузки файла
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFile(file);

    if (importMethod === "json") {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const content = e.target?.result as string;
          // Пытаемся распарсить и отформатировать JSON
          const parsed = JSON.parse(content);
          setJsonData(JSON.stringify(parsed, null, 2));
          toast.success(t("import.messages.fileSuccess"));
        } catch (error) {
          toast.error(t("import.errors.fileError"));
        }
      };
      reader.readAsText(file);
    } else if (importMethod === "csv") {
      // Обработка CSV файла
      Papa.parse(file, {
        complete: results => {
          if (
            results.data &&
            Array.isArray(results.data) &&
            results.data.length > 0
          ) {
            // Первая строка - заголовки
            const headers = results.data[0] as string[];
            // Остальные строки - данные
            const data = results.data.slice(1) as Array<Array<string>>;

            setCsvHeaders(headers);
            setCsvData(data);
            toast.success(t("import.messages.fileSuccess"));
          } else {
            toast.error(t("import.errors.fileError"));
          }
        },
        error: error => {
          console.error("CSV parsing error:", error);
          toast.error(t("import.errors.fileError"));
        }
      });
    }
  };

  // Обработчик импорта JSON
  const handleJsonImport = async () => {
    try {
      setIsLoading(true);

      // Валидация JSON
      let parsedData;
      try {
        parsedData = JSON.parse(jsonData);
        console.log("=== JSON IMPORT STARTED ===");
        console.log("Parsed JSON data:", parsedData);
      } catch (e) {
        console.error("JSON parsing error:", e);
        toast.error(t("import.errors.fileError"));
        setIsLoading(false);
        return;
      }

      // Проверяем структуру данных и преобразуем при необходимости
      if (parsedData.units && Array.isArray(parsedData.units)) {
        // Если данные в формате { units: [...] }, преобразуем в { data: [...] }
        console.log("Converting from 'units' format to 'data' format");
        parsedData = {
          ...parsedData,
          data: parsedData.units,
          units: undefined
        };
      } else if (!parsedData.data || !Array.isArray(parsedData.data)) {
        console.error("Invalid data structure:", parsedData);
        toast.error(t("import.errors.fileError"));
        setIsLoading(false);
        return;
      }

      // Добавляем buildingId, если выбрано
      if (selectedBuilding && !parsedData.defaultBuildingId) {
        console.log(`Adding defaultBuildingId: ${selectedBuilding}`);
        parsedData.defaultBuildingId = selectedBuilding;
      }

      // Добавляем флаг updateExisting
      parsedData.updateExisting = updateExisting;
      console.log(`Setting updateExisting: ${updateExisting}`);

      console.log("Sending data to server:", parsedData);

      // Отправляем запрос на импорт
      const response = await fetch(`/api/projects/${projectId}/units/import`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(parsedData)
      });

      const result = await response.json();
      console.log("Import response:", result);

      if (!response.ok) {
        console.error("Import error:", result);
        if (result.error && result.message) {
          throw new Error(`${result.message}: ${result.details || ""}`);
        }
        throw new Error(t("import.errors.import"));
      }

      if (result.errors && result.errors.length > 0) {
        // Если есть ошибки, но импорт частично успешен
        toast.warning(
          t("import.messages.warningErrors", {
            count: result.errors.length
          })
        );
        console.warn("Import errors:", result.errors);
      }

      if (result.warnings && result.warnings.length > 0) {
        // Если есть предупреждения о ненайденных планировках
        toast.warning(
          t("import.messages.warningWarnings", {
            count: result.warnings.length
          })
        );
        console.warn("Import warnings:", result.warnings);

        // Если предупреждения связаны с планировками, показываем специальное сообщение
        const layoutWarnings = result.warnings.filter(w =>
          w.includes("layout")
        );
        if (layoutWarnings.length > 0) {
          toast.warning(
            t("import.messages.warningLayouts", {
              count: layoutWarnings.length
            }),
            {
              duration: 6000
            }
          );
          console.warn("Layout warnings:", layoutWarnings);

          // Выводим первые 3 предупреждения для наглядности
          if (layoutWarnings.length > 0) {
            const samplesToShow = layoutWarnings.slice(0, 3);
            samplesToShow.forEach(warning => {
              console.warn(`- ${warning}`);
            });
            if (layoutWarnings.length > 3) {
              console.warn(
                t("import.messages.warningLayouts.moreWarnings", {
                  count: layoutWarnings.length - 3
                })
              );
            }
          }
        }
      }

      toast.success(
        t("import.messages.success", {
          count: result.totalProcessed || result.total || result.processed || 0,
          created: result.created || 0,
          updated: result.updated || 0,
          markedAsSold: result.markedAsSold || 0
        })
      );
      console.log("=== JSON IMPORT COMPLETED ===");
    } catch (error) {
      console.error("Error importing units:", error);
      toast.error(
        t("import.errors.import", {
          error: error instanceof Error ? error.message : String(error)
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик импорта CSV через новый компонент
  const handleCsvImport = async (data: any) => {
    try {
      setIsLoading(true);

      console.log("=== CSV IMPORT STARTED ===");
      console.log("CSV import data:", data);

      // Отправляем запрос на импорт
      const response = await fetch(`/api/projects/${projectId}/units/import`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      console.log("CSV import response:", result);

      if (!response.ok) {
        console.error("CSV import error:", result);
        if (result.error && result.message) {
          throw new Error(`${result.message}: ${result.details || ""}`);
        }
        throw new Error("Ошибка при импорте юнитов");
      }

      if (result.errors && result.errors.length > 0) {
        // Если есть ошибки, но импорт частично успешен
        toast.warning(
          t("import.messages.warningErrors", {
            count: result.errors.length
          })
        );
        console.warn("CSV import errors:", result.errors);
      }

      if (result.warnings && result.warnings.length > 0) {
        // Если есть предупреждения о ненайденных планировках
        toast.warning(
          t("import.messages.warningWarnings", {
            count: result.warnings.length
          })
        );
        console.warn("CSV import warnings:", result.warnings);

        // Если предупреждения связаны с планировками, показываем специальное сообщение
        const layoutWarnings = result.warnings.filter(w =>
          w.includes("layout")
        );
        if (layoutWarnings.length > 0) {
          toast.warning(
            t("import.messages.warningLayouts", {
              count: layoutWarnings.length
            }),
            {
              duration: 6000
            }
          );
          console.warn("CSV layout warnings:", layoutWarnings);

          // Выводим первые 3 предупреждения для наглядности
          if (layoutWarnings.length > 0) {
            const samplesToShow = layoutWarnings.slice(0, 3);
            samplesToShow.forEach(warning => {
              console.warn(`- ${warning}`);
            });
            if (layoutWarnings.length > 3) {
              console.warn(
                `... и еще ${layoutWarnings.length - 3} предупреждений`
              );
            }
          }
        }
      }

      toast.success(
        t("import.messages.success", {
          count: result.totalProcessed || result.total || result.processed || 0,
          created: result.created || 0,
          updated: result.updated || 0,
          markedAsSold: result.markedAsSold || 0
        })
      );
      console.log("=== CSV IMPORT COMPLETED ===");

      // Сбрасываем состояние
      resetCsvState();
    } catch (error) {
      console.error("Error importing units from CSV:", error);
      toast.error(
        t("import.errors.import", {
          error: error instanceof Error ? error.message : String(error)
        })
      );
      throw error; // Пробрасываем ошибку дальше для обработки в CsvImportStepper
    } finally {
      setIsLoading(false);
    }
  };

  // Сброс состояния CSV
  const resetCsvState = () => {
    setCsvData([]);
    setCsvHeaders([]);
    setFile(null);
  };

  return (
    <div className="p-6">
      <CardHeader className="px-0 pt-0 flex flex-col gap-2">
        <h2 className="text-xl font-medium text-default-900 dark:text-white">
          {t("import.title")}
        </h2>
        <div>
          <p className="text-default-500 mt-1">{t("import.description")}</p>
        </div>
      </CardHeader>

      <CardBody className="px-0 py-4">
        <div className="space-y-6">
          {/* Выбор метода импорта */}
          <Tabs
            selectedKey={importMethod}
            onSelectionChange={key => setImportMethod(key as ImportMethod)}
            aria-label="Import method"
            className="mb-4"
          >
            <Tab key="json" title="JSON" />
            <Tab key="csv" title="CSV" />
          </Tabs>

          {/* JSON импорт */}
          {importMethod === "json" && (
            <div className="space-y-6">
              {/* Выбор здания */}
              {buildings.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-default-900 dark:text-white">
                    {t("import.form.building")}
                  </label>
                  <select
                    className="w-full p-2 border rounded-md bg-[#F5F5F7] dark:bg-[#2C2C2C] border-default-200 dark:border-default-100/20 text-default-900 dark:text-white"
                    value={selectedBuilding}
                    onChange={e => setSelectedBuilding(e.target.value)}
                  >
                    <option value="">{t("import.form.selectBuilding")}</option>
                    {buildings.map(building => (
                      <option key={building.id} value={building.id}>
                        {building.name ||
                          `Building ${building.id.substring(0, 4)}`}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-sm text-default-500">
                    {t("import.form.buildingHelp")}
                  </p>
                </div>
              )}

              {/* Обновление существующих записей */}
              <div className="flex items-center">
                <Checkbox
                  isSelected={updateExisting}
                  onValueChange={setUpdateExisting}
                  id="updateExisting"
                />
                <label
                  htmlFor="updateExisting"
                  className="ml-2 text-default-900 dark:text-white"
                >
                  {t("import.form.updateExisting")}
                </label>
              </div>

              {/* Загрузка файла */}
              <div>
                <label className="block text-sm font-medium mb-2 text-default-900 dark:text-white">
                  {t("import.form.uploadFile")}
                </label>
                <div className="flex items-center">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex items-center justify-center px-4 py-2 border border-default-200 dark:border-default-100/20 rounded-md bg-default-50 dark:bg-default-100/10 text-default-900 dark:text-white hover:bg-default-100 dark:hover:bg-default-200/10 transition-colors"
                  >
                    <IconFileUpload size={16} className="mr-2" />
                    {t("import.form.selectFile")}
                  </label>
                  {file && (
                    <span className="ml-2 text-default-700 dark:text-default-300">
                      {file.name}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-default-500">
                  {t("import.form.fileHelp")}
                </p>
              </div>

              {/* JSON редактор */}
              <div>
                <label className="block text-sm font-medium mb-2 text-default-900 dark:text-white">
                  {t("import.form.jsonData")}
                </label>
                <Textarea
                  value={jsonData}
                  onChange={e => setJsonData(e.target.value)}
                  placeholder={t("import.form.jsonPlaceholder")}
                  rows={15}
                  className="font-mono text-sm"
                  classNames={{
                    input: "bg-[#F5F5F7] dark:bg-[#2C2C2C]",
                    inputWrapper: "bg-[#F5F5F7] dark:bg-[#2C2C2C]"
                  }}
                />
                <p className="mt-1 text-sm text-default-500">
                  {t("import.form.jsonHelp")}
                </p>
              </div>

              {/* Пример */}
              <div className="bg-default-50 dark:bg-default-100/10 p-4 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-md font-medium text-default-900 dark:text-white">
                    {t("import.form.example")}
                  </h3>
                  <Button
                    size="sm"
                    variant="flat"
                    color="primary"
                    onClick={() => setJsonData(createExampleJson())}
                    startContent={<IconCode size={16} />}
                  >
                    {t("import.form.exampleButton")}
                  </Button>
                </div>
                <div className="flex items-center mb-2">
                  <IconInfoCircle size={16} className="text-primary mr-2" />
                  <span className="text-sm text-default-700 dark:text-default-300">
                    {t("import.form.exampleDescription")}
                  </span>
                </div>
                <pre className="text-xs overflow-auto p-2 bg-default-100 dark:bg-default-200/10 rounded-md text-default-900 dark:text-white">
                  {createExampleJson()}
                </pre>
              </div>

              {/* Кнопка импорта */}
              <div className="flex justify-end">
                <Button
                  color="primary"
                  isLoading={isLoading}
                  onClick={handleJsonImport}
                  startContent={<IconFileUpload size={16} />}
                  isDisabled={!jsonData}
                >
                  {t("import.form.importButton")}
                </Button>
              </div>
            </div>
          )}

          {/* CSV импорт */}
          {importMethod === "csv" && (
            <div className="space-y-6">
              {/* Если CSV данные еще не загружены, показываем форму загрузки */}
              {!csvHeaders.length ? (
                <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-default-200 dark:border-default-100/20 rounded-lg">
                  <IconTable size={48} className="text-default-400 mb-4" />
                  <h3 className="text-lg font-medium text-default-900 dark:text-white mb-2">
                    {t("import.form.uploadCsv")}
                  </h3>
                  <p className="text-default-500 text-center mb-4 max-w-md">
                    {t("import.form.uploadCsvDescription")}
                  </p>
                  <div className="flex items-center">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="hidden"
                      id="csv-file-upload"
                    />
                    <label
                      htmlFor="csv-file-upload"
                      className="cursor-pointer flex items-center justify-center px-4 py-2 border border-default-200 dark:border-default-100/20 rounded-md bg-primary text-white hover:bg-primary-600 transition-colors"
                    >
                      <IconFileUpload size={16} className="mr-2" />
                      {t("import.form.selectCsvFile")}
                    </label>
                  </div>
                </div>
              ) : (
                /* Если CSV данные загружены, показываем пошаговый процесс импорта */
                <CsvImportStepper
                  projectId={projectId}
                  buildings={buildings}
                  csvData={csvData}
                  csvHeaders={csvHeaders}
                  onImport={handleCsvImport}
                  onReset={resetCsvState}
                />
              )}
            </div>
          )}
        </div>
      </CardBody>

      {/* Информация о логах */}
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
        <div className="flex items-start">
          <IconInfoCircle
            size={20}
            className="text-blue-500 mt-0.5 mr-2 flex-shrink-0"
          />
          <div>
            <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {t("import.form.checkLogs.title")}
            </h4>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
              {t("import.form.checkLogs.description")}
            </p>
            <ol className="list-decimal list-inside text-sm text-blue-600 dark:text-blue-400 mt-2 ml-2 space-y-1">
              <li>{t("import.form.checkLogs.steps.first")}</li>
              <li>{t("import.form.checkLogs.steps.second")}</li>
              <li>{t("import.form.checkLogs.steps.third")}</li>
              <li>{t("import.form.checkLogs.steps.fourth")}</li>
            </ol>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
              {t("import.form.checkLogs.steps.fifth")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
