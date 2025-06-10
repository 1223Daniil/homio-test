"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Spinner,
  Button,
  Autocomplete,
  AutocompleteItem,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
  Select,
  SelectItem
} from "@heroui/react";
import { format } from "date-fns";
import { toast } from "sonner";

interface UnitVersionHistoryProps {
  projectId: string;
  locale: string;
}

interface Unit {
  id: string;
  number: string;
  status: string;
}

interface UnitVersion {
  id: string;
  versionDate: string;
  unitId: string;
  number: string;
  status: string;
  metadata: {
    changes?: Record<string, { before: any; after: any }>;
    updateType?: 'UPDATE' | 'CREATE';
  };
  import: {
    id: string;
    importDate: string;
  };
}

export function UnitVersionHistory({ projectId, locale }: UnitVersionHistoryProps) {
  const t = useTranslations();
  const [isLoading, setIsLoading] = useState(true);
  const [versions, setVersions] = useState<UnitVersion[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const [units, setUnits] = useState<Unit[]>([]);
  const [filterValue, setFilterValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedUnitVersions, setSelectedUnitVersions] = useState<UnitVersion[]>([]);
  const [comparisonDataList, setComparisonDataList] = useState<Array<{
    version: UnitVersion;
    differences: Record<string, { before: any; after: any }>;
  }>>([]);

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/units`);
        if (response.ok) {
          const data = await response.json();
          // Сортируем юниты по номеру
          const sortedUnits = data.sort((a: Unit, b: Unit) => {
            // Преобразуем номера в числа для корректной сортировки
            const aNum = parseInt(a.number.replace(/\D/g, ''));
            const bNum = parseInt(b.number.replace(/\D/g, ''));
            return aNum - bNum;
          });
          setUnits(sortedUnits);
        }
      } catch (error) {
        toast.error(t("errors.fetchFailed"));
      }
    };
    fetchUnits();
  }, [projectId]);

  useEffect(() => {
    const fetchVersions = async () => {
      setIsLoading(true);
      try {
        const url = new URL(`/api/projects/${projectId}/units/versions`, window.location.origin);
        if (selectedUnit) {
          url.searchParams.append("unitId", selectedUnit);
        }

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          // Сортируем версии по дате, новые сверху
          const sortedVersions = data.sort((a: UnitVersion, b: UnitVersion) => 
            new Date(b.versionDate).getTime() - new Date(a.versionDate).getTime()
          );

          // Группируем версии по номеру юнита и берем только последнюю версию для каждого юнита
          const latestVersions = sortedVersions.reduce((acc: UnitVersion[], current) => {
            const exists = acc.find(v => v.number === current.number);
            if (!exists) {
              acc.push(current);
            }
            return acc;
          }, []);

          setVersions(sortedVersions);
        }
      } catch (error) {
        toast.error(t("errors.fetchFailed"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchVersions();
  }, [projectId, selectedUnit]);

  // Получаем последние версии для отображения в таблице с учетом фильтра
  const getLatestVersions = () => {
    const allVersions = versions.reduce((acc: UnitVersion[], current) => {
      const exists = acc.find(v => v.number === current.number);
      if (!exists) {
        acc.push(current);
      }
      return acc;
    }, []);

    // Применяем фильтр по статусу
    return statusFilter === "ALL" 
      ? allVersions 
      : allVersions.filter(version => version.status === statusFilter);
  };

  const showAllVersionChanges = async (version: UnitVersion) => {
    try {
      // Получаем все версии для текущего юнита, отсортированные по дате (новые сверху)
      const unitVersions = versions
        .filter(v => v.number === version.number)
        .sort((a, b) => new Date(b.versionDate).getTime() - new Date(a.versionDate).getTime());

      console.log('Unit versions:', unitVersions);
      
      const changesData: Array<{
        version: UnitVersion;
        differences: Record<string, { before: any; after: any }>;
      }> = [];
      
      // Проходим по каждой версии и собираем изменения
      for (const currentVersion of unitVersions) {
        const changes = currentVersion.metadata?.changes;
        
        if (changes && Object.keys(changes).length > 0) {
          const dataBefore = changes.before;
          const dataAfter = changes.after;
          
          // Список ключей, которые нужно исключить
          const excludeKeys = ['update', 'createAt', 'updatedAt', 'translations', 'createdAt'];
          
          // Собираем все уникальные ключи из обоих объектов, исключая служебные
          const allKeys = new Set([
            ...Object.keys(dataBefore || {}),
            ...Object.keys(dataAfter || {})
          ].filter(key => !excludeKeys.includes(key)));

          // Сравниваем значения по каждому ключу
          const differences: Record<string, { before: any; after: any }> = {};
          
          allKeys.forEach(key => {
            const beforeValue = dataBefore?.[key];
            const afterValue = dataAfter?.[key];

            // Если значения различаются, добавляем в differences
            if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
              differences[key] = {
                before: beforeValue ?? 'не указано',
                after: afterValue ?? 'не указано'
              };
            }
          });

          if (Object.keys(differences).length > 0) {
            changesData.push({
              version: currentVersion,
              differences
            });
          }
        }
      }

      if (changesData.length > 0) {
        setSelectedUnitVersions(unitVersions);
        setComparisonDataList(changesData);
        onOpen();
      } else {
        toast.info('Нет данных об изменениях');
      }
    } catch (error) {
      console.error('Error showing version changes:', error);
      toast.error(t("errors.fetchFailed"));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spinner size="lg" />
      </div>
    );
  }

  // Получаем последние версии для отображения
  const latestVersions = getLatestVersions();

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-end mb-4">
        <Autocomplete
          label={t("Projects.import.versionTable.selectUnit")}
          placeholder={t("Projects.import.versionTable.selectUnitPlaceholder")}
          defaultItems={units}
          defaultSelectedKey={selectedUnit}
          onSelectionChange={(key) => {
            if (key) {
              setSelectedUnit(key.toString());
              setFilterValue("");
            }
          }}
          inputValue={filterValue}
          onInputChange={(value) => {
            setFilterValue(value);
            if (!value) {
              setSelectedUnit("");
            }
          }}
          className="max-w-xs"
        >
          {(unit) => (
            <AutocompleteItem 
              key={unit.id} 
              textValue={`${t("Projects.import.versionTable.unit")} ${unit.number}`}
            >
              {t("Projects.import.versionTable.unit")} {unit.number}
            </AutocompleteItem>
          )}
        </Autocomplete>

        <Select
          label={t("Projects.import.versionTable.selectStatus")}
          placeholder={t("Projects.import.versionTable.selectStatusPlaceholder")}
          selectedKeys={[statusFilter]}
          onSelectionChange={(keys) => {
            const selectedStatus = Array.from(keys)[0]?.toString() || "ALL";
            setStatusFilter(selectedStatus);
          }}
          className="w-48"
          defaultSelectedKeys={["ALL"]}
          renderValue={(items) => {
            const status = items[0]?.key?.toString() || "ALL";
            if (status === "ALL") return t("Projects.import.versionTable.statusSelect.all");
            return (
              <Chip 
                color={
                  status === "AVAILABLE" ? "success" :
                  status === "RESERVED" ? "warning" :
                  status === "SOLD" ? "danger" :
                  status === "DRAFT" ? "default" :
                  status === "ACTIVE" ? "primary" : "default"
                } 
                size="sm"
              >
                {t(`Projects.import.versionTable.statusSelect.${status}`)}
              </Chip>
            );
          }}
        >
          <SelectItem key="ALL">
            {t("Projects.import.versionTable.statusSelect.all")}
          </SelectItem>
          <SelectItem key="AVAILABLE">
            <Chip color="success" size="sm">{t("Projects.import.versionTable.statusSelect.AVAILABLE")}</Chip>
          </SelectItem>
          <SelectItem key="DRAFT">
            <Chip color="default" size="sm">{t("Projects.import.versionTable.statusSelect.DRAFT")}</Chip>
          </SelectItem>
          <SelectItem key="ACTIVE">
            <Chip color="primary" size="sm">{t("Projects.import.versionTable.statusSelect.ACTIVE")}</Chip>
          </SelectItem>
          <SelectItem key="RESERVED">
            <Chip color="warning" size="sm">{t("Projects.import.versionTable.statusSelect.RESERVED")}</Chip>
          </SelectItem>
          <SelectItem key="SOLD">
            <Chip color="danger" size="sm">{t("Projects.import.versionTable.statusSelect.SOLD")}</Chip>
          </SelectItem>
        </Select>
      </div>

      <Table aria-label={t("Projects.import.versionTable.title")}>
        <TableHeader>
          <TableColumn>{t("Projects.import.versionTable.date")}</TableColumn>
          <TableColumn>{t("Projects.import.versionTable.number")}</TableColumn>
          <TableColumn>{t("Projects.import.versionTable.type.title")}</TableColumn>
          <TableColumn>{t("Projects.import.versionTable.status.title")}</TableColumn>
          <TableColumn>{t("Projects.import.versionTable.actions.title")}</TableColumn>
        </TableHeader>
        <TableBody>
          {latestVersions.map((version) => {
            // Находим предыдущую версию для текущего юнита
            const previousVersion = versions.find(v => 
              v.number === version.number && 
              v.id !== version.id &&
              new Date(v.versionDate) < new Date(version.versionDate)
            );

            // Проверяем наличие изменений
            const hasChanges = version.metadata?.changes && 
              Object.keys(version.metadata.changes).length > 0 &&
              version.metadata.changes.before && 
              version.metadata.changes.after &&
              Object.keys(version.metadata.changes.before).length > 0;

            return (
              <TableRow key={version.id}>
                <TableCell>{format(new Date(version.versionDate), 'dd.MM.yyyy HH:mm')}</TableCell>
                <TableCell>{version.number}</TableCell>
                <TableCell>
                  {version.metadata?.updateType === 'UPDATE' ? t("Projects.import.versionTable.type.update") :    
                   version.metadata?.updateType === 'CREATE' ? t("Projects.import.versionTable.type.create") : t("Projects.import.versionTable.type.update")}
                </TableCell>
                <TableCell>
                  <Chip 
                    color={
                      version.status === 'AVAILABLE' ? 'success' :
                      version.status === 'RESERVED' ? 'warning' :
                      version.status === 'SOLD' ? 'danger' :
                      version.status === 'DRAFT' ? 'default' :
                      version.status === 'ACTIVE' ? 'primary' : 'default'
                    } 
                    size="sm"
                  >
                    {t(`Projects.import.versionTable.statusSelect.${version.status}`)}
                  </Chip>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="light"
                    onClick={() => showAllVersionChanges(version)}
                    isDisabled={!hasChanges}
                  >
                    {hasChanges ? t("Projects.import.versionTable.actions.view") : t("Projects.import.versionTable.actions.noChanges")}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Modal isOpen={isOpen} onClose={onClose} size="2xl">
        <ModalContent>
          <ModalHeader>
            <h3 className="text-lg font-semibold">
              {t("Projects.import.versionTable.modalView.title")} {selectedUnitVersions[0]?.number}
            </h3>
          </ModalHeader>
          <ModalBody>
            {comparisonDataList.length > 0 ? (
              <Table aria-label={t("Projects.import.versionTable.modalView.title")}>
                <TableHeader>
                  <TableColumn>{t("Projects.import.versionTable.modalView.fields.date")}</TableColumn>
                  <TableColumn>{t("Projects.import.versionTable.modalView.fields.field.title")}</TableColumn>
                  <TableColumn>{t("Projects.import.versionTable.modalView.fields.before")}</TableColumn>
                  <TableColumn>{t("Projects.import.versionTable.modalView.fields.after")}</TableColumn>
                </TableHeader>
                <TableBody>
                  {comparisonDataList.flatMap((changeData, changeDataIndex) => 
                    Object.entries(changeData.differences)
                      .filter(([field]) => !field.startsWith('_'))
                      .map(([field, values], index) => (
                        <TableRow 
                          key={`${changeData.version.id}-${field}`}
                          className={index === 0 && changeDataIndex > 0 ? "border-t-2 border-gray-200" : ""}
                        >
                          <TableCell className="whitespace-nowrap">
                            {format(new Date(changeData.version.versionDate), 'dd.MM.yyyy HH:mm')}
                            <div className="text-xs text-gray-500">
                              {changeData.version.metadata?.updateType === 'UPDATE' ? t("Projects.import.versionTable.type.update") : 
                               changeData.version.metadata?.updateType === 'CREATE' ? t("Projects.import.versionTable.type.create") : t("Projects.import.versionTable.type.update")}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {t(`Projects.import.versionTable.modalView.fields.field.${field}`)}
                          </TableCell>
                          <TableCell>
                            <div className="bg-red-50 p-2 rounded whitespace-pre-wrap">
                              {field === 'status' 
                                ? t(`Projects.import.versionTable.statusSelect.${values.before}`)
                                : typeof values.before === 'object' 
                                  ? JSON.stringify(values.before, null, 2) 
                                  : String(values.before)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="bg-green-50 p-2 rounded whitespace-pre-wrap">
                              {field === 'status' 
                                ? t(`Projects.import.versionTable.statusSelect.${values.after}`)
                                : typeof values.after === 'object' 
                                  ? JSON.stringify(values.after, null, 2) 
                                  : String(values.after)}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-4 text-gray-500">
                Нет данных для сравнения
              </div>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
} 