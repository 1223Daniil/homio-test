import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
  Spinner,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Checkbox,
  Tooltip,
  useDisclosure
} from "@heroui/react";
import { IconDeviceFloppy, IconEdit, IconTrash, IconPlus, IconInfoCircle } from "@tabler/icons-react";
import { toast } from "sonner";

// Типы для сопоставления полей
interface FieldMapping {
  id: string;
  name: string;
  mappings: Record<string, string>;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FieldMappingManagerProps {
  projectId: string;
  currentMapping: Record<string, string>;
  headers: string[];
  availableFields: { value: string; label: string }[];
  onLoadMapping: (mapping: Record<string, string>) => void;
}

export function FieldMappingManager({
  projectId,
  currentMapping,
  headers,
  availableFields,
  onLoadMapping
}: FieldMappingManagerProps) {
  const t = useTranslations();
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMapping, setSelectedMapping] = useState<FieldMapping | null>(null);
  const [newMappingName, setNewMappingName] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { 
    isOpen: isDeleteOpen, 
    onOpen: onDeleteOpen, 
    onClose: onDeleteClose 
  } = useDisclosure();

  // Загрузка сохраненных конфигураций при монтировании компонента
  useEffect(() => {
    fetchMappings();
  }, [projectId]);

  // Загрузка сохраненных конфигураций
  const fetchMappings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/projects/${projectId}/field-mappings`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setMappings(data.data || []);
    } catch (error) {
      console.error("Error fetching field mappings:", error);
      toast.error(t("errors.fetchFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  // Сохранение текущей конфигурации
  const handleSaveMapping = async () => {
    if (!newMappingName.trim()) {
      toast.error(t("errors.nameRequired"));
      return;
    }

    try {
      setIsLoading(true);
      
      const payload = {
        name: newMappingName,
        mappings: currentMapping,
        isDefault
      };
      
      let response;
      
      if (selectedMapping) {
        // Обновление существующей конфигурации
        response = await fetch(
          `/api/projects/${projectId}/field-mappings?mappingId=${selectedMapping.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          }
        );
      } else {
        // Создание новой конфигурации
        response = await fetch(`/api/projects/${projectId}/field-mappings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      await fetchMappings();
      onClose();
      toast.success(
        selectedMapping
          ? t("Units.import.mapping.updated")
          : t("Units.import.mapping.saved")
      );
      
      setNewMappingName("");
      setIsDefault(false);
      setSelectedMapping(null);
    } catch (error) {
      console.error("Error saving field mapping:", error);
      toast.error(t("errors.saveFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  // Загрузка выбранной конфигурации
  const handleLoadMapping = (mapping: FieldMapping) => {
    onLoadMapping(mapping.mappings);
    toast.success(t("Units.import.mapping.loaded"));
  };

  // Удаление конфигурации
  const handleDeleteMapping = async () => {
    if (!selectedMapping) return;
    
    try {
      setIsLoading(true);
      
      const response = await fetch(
        `/api/projects/${projectId}/field-mappings?mappingId=${selectedMapping.id}`,
        { method: "DELETE" }
      );
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      await fetchMappings();
      onDeleteClose();
      toast.success(t("Units.import.mapping.deleted"));
      setSelectedMapping(null);
    } catch (error) {
      console.error("Error deleting field mapping:", error);
      toast.error(t("errors.deleteFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  // Открытие модального окна для редактирования
  const handleEditMapping = (mapping: FieldMapping) => {
    setSelectedMapping(mapping);
    setNewMappingName(mapping.name);
    setIsDefault(mapping.isDefault);
    onOpen();
  };

  // Открытие модального окна для создания
  const handleNewMapping = () => {
    setSelectedMapping(null);
    setNewMappingName("");
    setIsDefault(false);
    onOpen();
  };

  // Открытие модального окна для удаления
  const handleConfirmDelete = (mapping: FieldMapping) => {
    setSelectedMapping(mapping);
    onDeleteOpen();
  };

  return (
    <div className="mt-4">
      <Card>
        <CardHeader className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            {t("Units.import.mapping.savedConfigurations")}
          </h3>
          <Button 
            color="primary" 
            startContent={<IconPlus size={16} />}
            onClick={handleNewMapping}
          >
            {t("Units.import.mapping.saveNew")}
          </Button>
        </CardHeader>
        <CardBody>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Spinner />
            </div>
          ) : mappings.length === 0 ? (
            <div className="text-center py-4 text-default-500">
              {t("Units.import.mapping.noSavedConfigurations")}
            </div>
          ) : (
            <Table aria-label="Saved field mappings">
              <TableHeader>
                <TableColumn>{t("Units.import.mapping.name")}</TableColumn>
                <TableColumn>{t("Units.import.mapping.default")}</TableColumn>
                <TableColumn>{t("Units.import.mapping.createdAt")}</TableColumn>
                <TableColumn>{t("Units.import.mapping.updatedAt")}</TableColumn>
                <TableColumn>{t("common.actions")}</TableColumn>
              </TableHeader>
              <TableBody>
                {mappings.map((mapping) => (
                  <TableRow key={mapping.id}>
                    <TableCell>{mapping.name}</TableCell>
                    <TableCell>
                      {mapping.isDefault ? (
                        <span className="text-success">✓</span>
                      ) : (
                        <span>-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(mapping.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(mapping.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onClick={() => handleLoadMapping(mapping)}
                        >
                          <Tooltip content={t("Units.import.mapping.load")}>
                            <IconDeviceFloppy size={18} />
                          </Tooltip>
                        </Button>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onClick={() => handleEditMapping(mapping)}
                        >
                          <Tooltip content={t("common.edit")}>
                            <IconEdit size={18} />
                          </Tooltip>
                        </Button>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          color="danger"
                          onClick={() => handleConfirmDelete(mapping)}
                        >
                          <Tooltip content={t("common.delete")}>
                            <IconTrash size={18} />
                          </Tooltip>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Модальное окно для создания/редактирования конфигурации */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>
            {selectedMapping
              ? t("Units.import.mapping.editConfiguration")
              : t("Units.import.mapping.saveConfiguration")}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label={t("Units.import.mapping.configurationName")}
                placeholder={t("Units.import.mapping.enterName")}
                value={newMappingName}
                onChange={(e) => setNewMappingName(e.target.value)}
                isRequired
              />
              <Checkbox
                isSelected={isDefault}
                onValueChange={setIsDefault}
              >
                {t("Units.import.mapping.setAsDefault")}
              </Checkbox>
              
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2 flex items-center">
                  {t("Units.import.mapping.currentMapping")}
                  <Tooltip content={t("Units.import.mapping.currentMappingHelp")}>
                    <IconInfoCircle size={16} className="ml-1 text-default-400" />
                  </Tooltip>
                </h4>
                <div className="max-h-60 overflow-y-auto border rounded-md">
                  <Table aria-label="Current mapping preview">
                    <TableHeader>
                      <TableColumn>{t("Units.import.mapping.sourceField")}</TableColumn>
                      <TableColumn>{t("Units.import.mapping.targetField")}</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {headers.map((header) => (
                        <TableRow key={header}>
                          <TableCell>{header}</TableCell>
                          <TableCell>
                            {availableFields.find(
                              (field) => field.value === currentMapping[header]
                            )?.label || t("Units.import.mapping.ignored")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button
              color="primary"
              onClick={handleSaveMapping}
              isLoading={isLoading}
            >
              {t("common.save")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Модальное окно для подтверждения удаления */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalContent>
          <ModalHeader>{t("Units.import.mapping.confirmDelete")}</ModalHeader>
          <ModalBody>
            {t("Units.import.mapping.deleteWarning", {
              name: selectedMapping?.name
            })}
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onClick={onDeleteClose}>
              {t("common.cancel")}
            </Button>
            <Button
              color="danger"
              onClick={handleDeleteMapping}
              isLoading={isLoading}
            >
              {t("common.delete")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
} 