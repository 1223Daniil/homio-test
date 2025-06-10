import { Button, Card, CardBody, CardHeader, Divider } from "@heroui/react";
import { IconArrowRight, IconCheck, IconFileUpload } from "@tabler/icons-react";
import React, { useEffect, useState } from "react";

import { CsvDataValidator } from "./CsvDataValidator";
import { CsvFieldMapping } from "./CsvFieldMapping";
import { useTranslations } from "next-intl";

interface CsvImportStepperProps {
  projectId: string;
  buildings: Array<{ id: string; name: string }>;
  csvData: Array<Array<string>>;
  csvHeaders: string[];
  onImport: (data: any) => Promise<void>;
  onReset: () => void;
}

export function CsvImportStepper({
  projectId,
  buildings,
  csvData,
  csvHeaders,
  onImport,
  onReset
}: CsvImportStepperProps) {
  const t = useTranslations("Units");
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const [processedData, setProcessedData] = useState<any[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<string>("");
  const [updateExisting, setUpdateExisting] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Устанавливаем первое здание по умолчанию
  useEffect(() => {
    if (buildings.length > 0 && buildings[0]) {
      setSelectedBuilding(buildings[0].id);
    }
  }, [buildings]);

  // Обработчик изменения маппинга
  const handleMappingChange = (newMapping: Record<string, string>) => {
    setMapping(newMapping);
  };

  // Обработчик завершения валидации
  const handleValidationComplete = (
    isValid: boolean,
    errors: any[],
    processed: any[]
  ) => {
    setIsValid(isValid);
    setValidationErrors(errors);
    setProcessedData(processed);
  };

  // Переход к следующему шагу
  const handleNextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 2));
  };

  // Переход к предыдущему шагу
  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  // Обработчик импорта
  const handleImport = async () => {
    try {
      setIsLoading(true);

      // Подготавливаем данные для отправки
      const importData = {
        data: processedData,
        updateExisting,
        defaultBuildingId: selectedBuilding
      };

      // Вызываем функцию импорта
      await onImport(importData);

      // Сбрасываем состояние после успешного импорта
      onReset();
    } catch (error) {
      console.error("Error during import:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Кастомный степпер вместо компонента Stepper */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          {/* Шаг 1 */}
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep >= 0
                  ? "bg-primary text-white"
                  : "bg-default-100 text-default-500"
              }`}
            >
              {currentStep > 0 ? <IconCheck size={20} /> : "1"}
            </div>
            <div className="mt-2 text-center">
              <p className="font-medium text-default-900 dark:text-white">
                {t("import.stepper.mapping")}
              </p>
              <p className="text-xs text-default-500">
                {t("import.stepper.mappingDescription")}
              </p>
            </div>
          </div>

          {/* Линия между шагами */}
          <div className="flex-1 h-0.5 bg-default-200 dark:bg-default-700 mx-4"></div>

          {/* Шаг 2 */}
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep >= 1
                  ? "bg-primary text-white"
                  : "bg-default-100 text-default-500"
              }`}
            >
              {currentStep > 1 ? <IconCheck size={20} /> : "2"}
            </div>
            <div className="mt-2 text-center">
              <p className="font-medium text-default-900 dark:text-white">
                {t("import.stepper.validation")}
              </p>
              <p className="text-xs text-default-500">
                {t("import.stepper.validationDescription")}
              </p>
            </div>
          </div>

          {/* Линия между шагами */}
          <div className="flex-1 h-0.5 bg-default-200 dark:bg-default-700 mx-4"></div>

          {/* Шаг 3 */}
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                currentStep >= 2
                  ? "bg-primary text-white"
                  : "bg-default-100 text-default-500"
              }`}
            >
              {currentStep > 2 ? <IconCheck size={20} /> : "3"}
            </div>
            <div className="mt-2 text-center">
              <p className="font-medium text-default-900 dark:text-white">
                {t("import.stepper.importStep")}
              </p>
              <p className="text-xs text-default-500">
                {t("import.stepper.importStepDescription")}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Divider className="my-4" />

      {/* Шаг 1: Сопоставление полей */}
      {currentStep === 0 && (
        <>
          <CsvFieldMapping
            csvHeaders={csvHeaders}
            projectId={projectId}
            onMappingChange={handleMappingChange}
          />

          <div className="flex justify-between mt-4">
            <Button variant="flat" color="default" onClick={onReset}>
              {t("buttons.cancel")}
            </Button>
            <Button
              color="primary"
              onClick={handleNextStep}
              endContent={<IconArrowRight size={16} />}
            >
              {t("buttons.next")}
            </Button>
          </div>
        </>
      )}

      {/* Шаг 2: Валидация данных */}
      {currentStep === 1 && (
        <>
          <CsvDataValidator
            csvData={csvData}
            csvHeaders={csvHeaders}
            mapping={mapping}
            onValidationComplete={handleValidationComplete}
          />

          <Card className="mb-6">
            <CardHeader className="pb-0">
              <h3 className="text-lg font-medium text-default-900 dark:text-white">
                {t("import.stepper.importSettings")}
              </h3>
            </CardHeader>
            <CardBody>
              <div className="flex flex-col gap-4">
                {/* Выбор здания */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-default-700 dark:text-default-300">
                    {t("import.stepper.defaultBuilding")}
                  </label>
                  <select
                    className="w-full p-2 border rounded-md bg-[#F5F5F7] dark:bg-[#2C2C2C] border-default-200 dark:border-default-100/20 text-default-900 dark:text-white"
                    value={selectedBuilding}
                    onChange={e => setSelectedBuilding(e.target.value)}
                  >
                    <option value="">{t("import.stepper.notSelected")}</option>
                    {buildings.map(building => (
                      <option key={building.id} value={building.id}>
                        {building.name ||
                          `Здание ${building.id.substring(0, 4)}`}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-sm text-default-500">
                    {t("import.stepper.defaultBuildingDescription")}
                  </p>
                </div>

                {/* Обновление существующих записей */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="updateExisting"
                    checked={updateExisting}
                    onChange={e => setUpdateExisting(e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-default-300 rounded"
                  />
                  <label
                    htmlFor="updateExisting"
                    className="ml-2 text-default-900 dark:text-white"
                  >
                    {t("import.stepper.updateExisting")}
                  </label>
                </div>
              </div>
            </CardBody>
          </Card>

          <div className="flex justify-between mt-4">
            <Button variant="flat" color="default" onClick={handlePrevStep}>
              {t("buttons.back")}
            </Button>
            <Button
              color="primary"
              onClick={handleNextStep}
              endContent={<IconArrowRight size={16} />}
              isDisabled={!isValid}
            >
              {t("buttons.next")}
            </Button>
          </div>
        </>
      )}

      {/* Шаг 3: Импорт */}
      {currentStep === 2 && (
        <>
          <Card>
            <CardHeader className="pb-0">
              <h3 className="text-lg font-medium text-default-900 dark:text-white">
                {t("import.stepper.importConfirmation")}
              </h3>
            </CardHeader>
            <CardBody>
              <div className="flex flex-col gap-4">
                <div className="p-4 bg-default-50 dark:bg-default-100/10 rounded-md">
                  <h4 className="text-md font-medium text-default-900 dark:text-white mb-2">
                    {t("import.stepper.importResult")}
                  </h4>
                  <ul className="text-default-700 dark:text-default-300 space-y-2">
                    <li>
                      {t("import.stepper.recordsCount")}:{" "}
                      <span className="font-medium">
                        {processedData.length}
                      </span>
                    </li>
                    <li>
                      {t("import.stepper.defaultBuilding")}:{" "}
                      <span className="font-medium">
                        {buildings.find(b => b.id === selectedBuilding)?.name ||
                          "Не выбрано"}
                      </span>
                    </li>
                    <li>
                      {t("import.stepper.updatingExisting")}:{" "}
                      <span className="font-medium">
                        {updateExisting
                          ? t("import.stepper.yes")
                          : t("import.stepper.no")}
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 bg-warning-50 dark:bg-warning-900/20 rounded-md">
                  <p className="text-warning-700 dark:text-warning-300 text-sm">
                    {t("import.stepper.warning")}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          <div className="flex justify-between mt-4">
            <Button variant="flat" color="default" onClick={handlePrevStep}>
              {t("buttons.back")}
            </Button>
            <Button
              color="primary"
              onClick={handleImport}
              startContent={<IconFileUpload size={16} />}
              isLoading={isLoading}
            >
              {t("buttons.import")}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
