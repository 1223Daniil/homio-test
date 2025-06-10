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
  useDisclosure,
  Badge,
  Divider
} from "@heroui/react";
import { IconDeviceFloppy, IconEdit, IconTrash, IconPlus, IconInfoCircle, IconCheck, IconX, IconAlertCircle, IconEye } from "@tabler/icons-react";
import { toast } from "sonner";

// Типы для сопоставления полей
interface FieldMapping {
  id: string;
  name: string;
  mappings: Record<string, string>;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  isApproved?: boolean;
  importId?: string;
  sampleData?: any[];
}

interface PendingImport {
  id: string;
  mappingId: string;
  createdAt: string;
  totalUnits: number;
  importedBy: string;
  sampleData: any[];
}

interface ImportConfigurationTabProps {
  projectId: string;
  availableFields: { value: string; label: string }[];
  onLoadMapping?: (mapping: Record<string, string>) => void;
  pendingHeaders?: string[];
  pendingMapping?: Record<string, string>;
  onApproveMapping?: (mappingId: string) => void;
}

export function ImportConfigurationTab({
  projectId,
  availableFields,
  onLoadMapping,
  pendingHeaders = [],
  pendingMapping = {},
  onApproveMapping
}: ImportConfigurationTabProps) {
  const t = useTranslations();
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [pendingImports, setPendingImports] = useState<PendingImport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPendingLoading, setIsPendingLoading] = useState(false);
  const [selectedMapping, setSelectedMapping] = useState<FieldMapping | null>(null);
  const [selectedPendingImport, setSelectedPendingImport] = useState<PendingImport | null>(null);
  const [newMappingName, setNewMappingName] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [editedMapping, setEditedMapping] = useState<Record<string, string>>({});
  const [hasPendingMapping, setHasPendingMapping] = useState(false);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { 
    isOpen: isDeleteOpen, 
    onOpen: onDeleteOpen, 
    onClose: onDeleteClose 
  } = useDisclosure();
  
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose
  } = useDisclosure();
  
  const {
    isOpen: isPendingOpen,
    onOpen: onPendingOpen,
    onClose: onPendingClose
  } = useDisclosure();
  
  const {
    isOpen: isSampleOpen,
    onOpen: onSampleOpen,
    onClose: onSampleClose
  } = useDisclosure();

  // Загрузка сохраненных конфигураций при монтировании компонента
  useEffect(() => {
    fetchMappings();
    fetchPendingImports();
  }, [projectId]);
  
  // Проверка наличия ожидающей конфигурации
  useEffect(() => {
    setHasPendingMapping(Object.keys(pendingMapping).length > 0 && pendingHeaders.length > 0);
  }, [pendingMapping, pendingHeaders]);

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
  
  // Загрузка ожидающих импортов
  const fetchPendingImports = async () => {
    try {
      setIsPendingLoading(true);
      const response = await fetch(`/api/projects/${projectId}/units/import/pending`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setPendingImports(data.data || []);
    } catch (error) {
      console.error("Error fetching pending imports:", error);
      // Don't show error toast for this as it's not critical
    } finally {
      setIsPendingLoading(false);
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
      
      const mappingData = {
        name: newMappingName,
        mappings: selectedMapping ? editedMapping : pendingMapping,
        isDefault
      };
      
      let response;
      
      if (selectedMapping) {
        // Обновление существующей конфигурации
        response = await fetch(`/api/projects/${projectId}/field-mappings?id=${selectedMapping.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(mappingData)
        });
      } else {
        // Создание новой конфигурации
        response = await fetch(`/api/projects/${projectId}/field-mappings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(mappingData)
        });
      }
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      // Обновляем список конфигураций
      await fetchMappings();
      
      // Сбрасываем состояние
      setNewMappingName("");
      setIsDefault(false);
      setSelectedMapping(null);
      
      toast.success(t("success.saved"));
      onClose();
      
    } catch (error) {
      console.error("Error saving field mapping:", error);
      toast.error(t("errors.saveFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  // Загрузка конфигурации
  const handleLoadMapping = (mapping: FieldMapping) => {
    if (onLoadMapping) {
      onLoadMapping(mapping.mappings);
    }
  };

  // Удаление конфигурации
  const handleDeleteMapping = async () => {
    if (!selectedMapping) return;
    
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/projects/${projectId}/field-mappings?id=${selectedMapping.id}`, {
        method: "DELETE"
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      // Обновляем список конфигураций
      await fetchMappings();
      
      toast.success(t("success.deleted"));
      onDeleteClose();
      
    } catch (error) {
      console.error("Error deleting field mapping:", error);
      toast.error(t("errors.deleteFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  // Редактирование конфигурации
  const handleEditMapping = (mapping: FieldMapping) => {
    setSelectedMapping(mapping);
    setNewMappingName(mapping.name);
    setIsDefault(mapping.isDefault);
    setEditedMapping({...mapping.mappings});
    onEditOpen();
  };

  // Создание новой конфигурации
  const handleNewMapping = () => {
    setSelectedMapping(null);
    setNewMappingName("");
    setIsDefault(false);
    onOpen();
  };

  // Подтверждение удаления
  const handleConfirmDelete = (mapping: FieldMapping) => {
    setSelectedMapping(mapping);
    onDeleteOpen();
  };
  
  // Утверждение конфигурации
  const handleApproveMapping = async (mappingId: string) => {
    if (onApproveMapping) {
      onApproveMapping(mappingId);
      
      // Обновляем список конфигураций
      await fetchMappings();
      await fetchPendingImports();
    }
  };
  
  // Редактирование значения маппинга
  const handleEditMappingField = (header: string, value: string) => {
    setEditedMapping(prev => ({
      ...prev,
      [header]: value
    }));
  };
  
  // Просмотр и утверждение ожидающего импорта
  const handleViewPendingImport = async (pendingImport: PendingImport) => {
    try {
      setIsLoading(true);
      
      // Проверяем наличие ID маппинга
      if (!pendingImport.mappingId) {
        console.error("Mapping ID is undefined in pending import");
        toast.error(t("Units.import.errors.mappingNotFound"));
        return;
      }
      
      // Получаем сопоставление полей для этого импорта
      const response = await fetch(`/api/projects/${projectId}/field-mappings?id=${pendingImport.mappingId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error fetching mapping:", errorData);
        toast.error(t("Units.import.errors.mappingNotFound"));
        return;
      }
      
      const data = await response.json();
      let mapping = data.data;
      
      // Проверяем, что маппинг не является массивом
      if (Array.isArray(mapping)) {
        console.error("Received mapping as array instead of object:", mapping);
        // Если это массив, берем первый элемент, если он существует
        if (mapping.length > 0) {
          mapping = mapping[0];
        } else {
          toast.error(t("Units.import.errors.mappingNotFound"));
          return;
        }
      }
      
      if (!mapping) {
        console.error("Mapping not found for ID:", pendingImport.mappingId);
        toast.error(t("Units.import.errors.mappingNotFound"));
        return;
      }
      
      // Проверяем наличие ID в полученном маппинге
      if (!mapping.id) {
        console.error("Received mapping without ID:", mapping);
        toast.error(t("Units.import.errors.mappingNotFound"));
        return;
      }
      
      setSelectedMapping(mapping);
      setEditedMapping({...mapping.mappings});
      setSelectedPendingImport(pendingImport);
      onPendingOpen();
      
    } catch (error) {
      console.error("Error fetching mapping for pending import:", error);
      toast.error(t("errors.fetchFailed"));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Просмотр образца данных
  const handleViewSampleData = (pendingImport: PendingImport) => {
    setSelectedPendingImport(pendingImport);
    onSampleOpen();
  };
  
  // Утверждение ожидающего импорта
  const handleApprovePendingImport = async () => {
    if (!selectedMapping || !selectedPendingImport) return;
    
    try {
      setIsLoading(true);
      
      // Проверяем наличие ID маппинга
      if (!selectedMapping.id) {
        console.error("Mapping ID is undefined");
        toast.error(t("Units.import.errors.mappingNotFound"));
        return;
      }
      
      // Обновляем сопоставление полей
      const mappingResponse = await fetch(`/api/projects/${projectId}/field-mappings?id=${selectedMapping.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: selectedMapping.name,
          mappings: editedMapping,
          isDefault: true,
          isApproved: true
        })
      });
      
      if (!mappingResponse.ok) {
        throw new Error(`Error updating mapping: ${mappingResponse.status}`);
      }
      
      // Запускаем импорт
      const importResponse = await fetch(`/api/projects/${projectId}/units/import/process-pending?importId=${selectedPendingImport.id}`, {
        method: "POST"
      });
      
      if (!importResponse.ok) {
        throw new Error(`Error processing import: ${importResponse.status}`);
      }
      
      const importResult = await importResponse.json();
      
      // Обновляем списки
      await fetchMappings();
      await fetchPendingImports();
      
      // Закрываем модальное окно
      onPendingClose();
      
      // Показываем сообщение об успехе
      toast.success(
        t("Units.import.notifications.importApprovedDescription", {
          count: importResult.data.total
        })
      );
      
    } catch (error) {
      console.error("Error approving pending import:", error);
      toast.error(t("errors.updateFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  // Эффект для автоматического открытия первого ожидающего импорта, если есть URL-параметр autoOpen=true
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const autoOpen = urlParams.get('autoOpen');
    
    if (autoOpen === 'true' && pendingImports.length > 0 && pendingImports[0]) {
      handleViewPendingImport(pendingImports[0]);
    }
  }, [pendingImports]);
  
  // Публичный метод для открытия первого ожидающего импорта
  const openFirstPendingImport = () => {
    if (pendingImports.length > 0 && pendingImports[0]) {
      handleViewPendingImport(pendingImports[0]);
      return true;
    }
    return false;
  };

  return (
    <div className="space-y-4">
      {/* Pending Imports Section */}
      {isPendingLoading ? (
        <div className="flex justify-center py-4">
          <Spinner />
        </div>
      ) : pendingImports.length > 0 ? (
        <Card>
          <CardHeader className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <IconAlertCircle className="text-warning" size={20} />
              <h3 className="text-lg font-semibold">
                {t("Units.import.fieldMappings.pendingApproval")}
              </h3>
            </div>
            <p className="text-default-500">
              {t("Units.import.fieldMappings.pendingDescription")}
            </p>
          </CardHeader>
          <CardBody>
            <Table aria-label="Pending imports">
              <TableHeader>
                <TableColumn>{t("Units.import.fieldMappings.importDate")}</TableColumn>
                <TableColumn>{t("Units.import.fieldMappings.importedBy")}</TableColumn>
                <TableColumn>{t("Units.import.fieldMappings.totalUnits")}</TableColumn>
                <TableColumn>{t("common.actions")}</TableColumn>
              </TableHeader>
              <TableBody>
                {pendingImports.map((pendingImport) => (
                  <TableRow key={pendingImport.id}>
                    <TableCell>
                      {new Date(pendingImport.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>{pendingImport.importedBy}</TableCell>
                    <TableCell>{pendingImport.totalUnits}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          color="primary"
                          onClick={() => handleViewPendingImport(pendingImport)}
                        >
                          {t("Units.import.fieldMappings.reviewAndApprove")}
                        </Button>
                        <Button
                          size="sm"
                          variant="light"
                          onClick={() => handleViewSampleData(pendingImport)}
                          startContent={<IconEye size={16} />}
                        >
                          {t("Units.import.fieldMappings.viewSample")}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">
              {t("Units.import.fieldMappings.pendingApproval")}
            </h3>
          </CardHeader>
          <CardBody>
            <div className="text-center py-4 text-default-500">
              {t("Units.import.fieldMappings.noPendingConfigurations")}
            </div>
          </CardBody>
        </Card>
      )}

      <Divider />

      {/* Existing Configurations Section */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            {t("Units.import.fieldMappings.savedConfigurations")}
          </h3>
          <Button 
            color="primary" 
            startContent={<IconPlus size={16} />}
            onClick={handleNewMapping}
          >
            {t("Units.import.fieldMappings.saveNew")}
          </Button>
        </CardHeader>
        <CardBody>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Spinner />
            </div>
          ) : mappings.length === 0 ? (
            <div className="text-center py-4 text-default-500">
              {t("Units.import.fieldMappings.noSavedConfigurations")}
            </div>
          ) : (
            <Table aria-label="Saved field mappings">
              <TableHeader>
                <TableColumn>{t("Units.import.fieldMappings.name")}</TableColumn>
                <TableColumn>{t("Units.import.fieldMappings.default")}</TableColumn>
                <TableColumn>{t("Units.import.fieldMappings.createdAt")}</TableColumn>
                <TableColumn>{t("Units.import.fieldMappings.updatedAt")}</TableColumn>
                <TableColumn>{t("common.actions")}</TableColumn>
              </TableHeader>
              <TableBody>
                {mappings.map((mapping) => (
                  <TableRow key={mapping.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {mapping.name}
                        {mapping.isApproved === false && (
                          <Badge color="warning" variant="flat" size="sm">
                            {t("Units.import.fieldMappings.pendingApproval")}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {mapping.isDefault ? (
                        <span className="text-success">✓</span>
                      ) : (
                        <span className="text-default-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(mapping.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {new Date(mapping.updatedAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="flat"
                          color="primary"
                          onClick={() => handleLoadMapping(mapping)}
                        >
                          {t("Units.import.fieldMappings.load")}
                        </Button>
                        <Button
                          size="sm"
                          variant="light"
                          onClick={() => handleEditMapping(mapping)}
                          startContent={<IconEdit size={16} />}
                        >
                          {t("common.edit")}
                        </Button>
                        <Button
                          size="sm"
                          variant="light"
                          color="danger"
                          onClick={() => handleConfirmDelete(mapping)}
                          startContent={<IconTrash size={16} />}
                        >
                          {t("common.delete")}
                        </Button>
                        {mapping.isApproved === false && onApproveMapping && (
                          <Button
                            size="sm"
                            color="success"
                            onClick={() => handleApproveMapping(mapping.id)}
                            startContent={<IconCheck size={16} />}
                          >
                            {t("Units.import.fieldMappings.approveMapping")}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Save Mapping Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>
            {t("Units.import.fieldMappings.saveConfiguration")}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label={t("Units.import.fieldMappings.configurationName")}
                placeholder={t("Units.import.fieldMappings.enterName")}
                value={newMappingName}
                onChange={(e) => setNewMappingName(e.target.value)}
              />
              <Checkbox
                isSelected={isDefault}
                onValueChange={setIsDefault}
              >
                {t("Units.import.fieldMappings.setAsDefault")}
              </Checkbox>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              onClick={onClose}
            >
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

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalContent>
          <ModalHeader>
            {t("Units.import.fieldMappings.confirmDelete")}
          </ModalHeader>
          <ModalBody>
            <p>
              {t("Units.import.fieldMappings.deleteWarning", {
                name: selectedMapping?.name || ""
              })}
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              onClick={onDeleteClose}
            >
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

      {/* Edit Mapping Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="3xl">
        <ModalContent>
          <ModalHeader>
            {t("Units.import.fieldMappings.editConfiguration")}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label={t("Units.import.fieldMappings.configurationName")}
                placeholder={t("Units.import.fieldMappings.enterName")}
                value={newMappingName}
                onChange={(e) => setNewMappingName(e.target.value)}
              />
              <Checkbox
                isSelected={isDefault}
                onValueChange={setIsDefault}
              >
                {t("Units.import.fieldMappings.setAsDefault")}
              </Checkbox>
              
              <div className="mt-4">
                <h4 className="text-md font-medium mb-2">
                  {t("Units.import.fieldMappings.currentMapping")}
                </h4>
                <p className="text-sm text-default-500 mb-4">
                  {t("Units.import.fieldMappings.currentMappingHelp")}
                </p>
                
                <Table aria-label="Field mapping">
                  <TableHeader>
                    <TableColumn>{t("Units.import.fieldMappings.sourceField")}</TableColumn>
                    <TableColumn>{t("Units.import.fieldMappings.targetField")}</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(editedMapping).map(([header, value]) => (
                      <TableRow key={header}>
                        <TableCell>{header}</TableCell>
                        <TableCell>
                          <Select
                            value={value}
                            onChange={(e) => handleEditMappingField(header, e.target.value)}
                            className="w-full"
                          >
                            {availableFields.map(field => (
                              <SelectItem key={field.value} value={field.value}>
                                {field.label}
                              </SelectItem>
                            ))}
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              onClick={onEditClose}
            >
              {t("common.cancel")}
            </Button>
            <Button
              color="primary"
              onClick={() => {
                handleSaveMapping();
                onEditClose();
              }}
              isLoading={isLoading}
            >
              {t("common.save")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Pending Import Review Modal */}
      <Modal isOpen={isPendingOpen} onClose={onPendingClose} size="3xl">
        <ModalContent>
          <ModalHeader>
            {t("Units.import.fieldMappings.pendingImport")}
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="bg-default-100 p-4 rounded-lg">
                <p className="text-default-700">
                  {t("Units.import.fieldMappings.pendingImportDescription")}
                </p>
              </div>
              
              <div className="mt-4">
                <h4 className="text-md font-medium mb-2">
                  {t("Units.import.fieldMappings.autoMappedFields")}
                </h4>
                <p className="text-sm text-default-500 mb-4">
                  {t("Units.import.fieldMappings.autoMappingDescription")}
                </p>
                
                <Table aria-label="Field mapping">
                  <TableHeader>
                    <TableColumn>{t("Units.import.fieldMappings.sourceField")}</TableColumn>
                    <TableColumn>{t("Units.import.fieldMappings.targetField")}</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(editedMapping).map(([header, value]) => (
                      <TableRow key={header}>
                        <TableCell>{header}</TableCell>
                        <TableCell>
                          <Select
                            value={value}
                            onChange={(e) => handleEditMappingField(header, e.target.value)}
                            className="w-full"
                          >
                            {availableFields.map(field => (
                              <SelectItem key={field.value} value={field.value}>
                                {field.label}
                              </SelectItem>
                            ))}
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="mt-4">
                <Button
                  size="sm"
                  variant="flat"
                  onClick={() => {
                    if (selectedPendingImport) {
                      handleViewSampleData(selectedPendingImport);
                    }
                  }}
                  startContent={<IconEye size={16} />}
                >
                  {t("Units.import.fieldMappings.viewSample")}
                </Button>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="flat"
              onClick={onPendingClose}
            >
              {t("common.cancel")}
            </Button>
            <Button
              color="primary"
              onClick={handleApprovePendingImport}
              isLoading={isLoading}
            >
              {t("Units.import.fieldMappings.saveAndApprove")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Sample Data Modal */}
      <Modal isOpen={isSampleOpen} onClose={onSampleClose} size="4xl">
        <ModalContent>
          <ModalHeader>
            {t("Units.import.fieldMappings.viewSample")}
          </ModalHeader>
          <ModalBody>
            <div className="overflow-x-auto">
              {selectedPendingImport?.sampleData && selectedPendingImport.sampleData.length > 0 ? (
                <Table aria-label="Sample data">
                  <TableHeader>
                    {Object.keys(selectedPendingImport.sampleData[0]).map(key => (
                      <TableColumn key={key}>{key}</TableColumn>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {selectedPendingImport.sampleData.map((row, index) => (
                      <TableRow key={index}>
                        {Object.values(row).map((value, i) => (
                          <TableCell key={i}>
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-4 text-default-500">
                  {t("common.noData")}
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              onClick={onSampleClose}
            >
              {t("common.close")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
} 