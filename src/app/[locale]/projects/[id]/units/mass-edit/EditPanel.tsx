"use client";

import {
  Button,
  Card,
  CardBody,
  Checkbox,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Spinner,
  useDisclosure
} from "@heroui/react";
import {
  selectBuildings,
  selectError,
  selectIsLoading,
  selectLayouts,
  selectSelectedUnits,
  updateUnits
} from "@/store/slices/unitsSlice";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { useCallback, useEffect, useState } from "react";

import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface EditPanelProps {
  projectId: string;
  onCancel: () => void;
  onSuccess: () => void;
}

interface EditFields {
  status: { enabled: boolean; value: string };
  price: { enabled: boolean; value: string };
  bedrooms: { enabled: boolean; value: string };
  bathrooms: { enabled: boolean; value: string };
  layoutId: { enabled: boolean; value: string };
  buildingId: { enabled: boolean; value: string };
}

export default function EditPanel({
  projectId,
  onCancel,
  onSuccess
}: EditPanelProps) {
  const t = useTranslations("Units");
  const dispatch = useAppDispatch();
  const selectedUnits = useAppSelector(selectSelectedUnits);
  const layouts = useAppSelector(selectLayouts);
  const buildings = useAppSelector(selectBuildings);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [editFields, setEditFields] = useState<EditFields>({
    status: { enabled: false, value: "AVAILABLE" },
    price: { enabled: false, value: "" },
    bedrooms: { enabled: false, value: "" },
    bathrooms: { enabled: false, value: "" },
    layoutId: { enabled: false, value: "" },
    buildingId: { enabled: false, value: "" }
  });

  // Показываем сообщение об ошибке, если она есть
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Обработчик изменения поля для массового редактирования
  const handleEditFieldChange = useCallback(
    (field: keyof EditFields, value: any) => {
      setEditFields(prev => ({
        ...prev,
        [field]: { ...prev[field], value }
      }));
    },
    []
  );

  // Обработчик включения/выключения поля для массового редактирования
  const handleEditFieldToggle = useCallback(
    (field: keyof EditFields, enabled: boolean) => {
      setEditFields(prev => ({
        ...prev,
        [field]: { ...prev[field], enabled }
      }));
    },
    []
  );

  // Обработчик сохранения изменений
  const handleSaveChanges = async () => {
    if (selectedUnits.size === 0) {
      toast.error(t("massEdit.noUnitsSelected"));
      return;
    }

    // Проверяем, что хотя бы одно поле выбрано для редактирования
    const hasEnabledFields = Object.values(editFields).some(
      field => field.enabled
    );
    if (!hasEnabledFields) {
      toast.error(t("massEdit.noFieldsSelected"));
      return;
    }

    try {
      // Создаем объект с данными для обновления
      const updateData: Record<string, any> = {};

      // Добавляем только включенные поля
      if (editFields.status.enabled)
        updateData.status = editFields.status.value;

      if (editFields.price.enabled) {
        const price = parseFloat(editFields.price.value);
        if (isNaN(price)) {
          toast.error(t("massEdit.invalidPrice"));
          return;
        }
        updateData.price = price;
      }

      if (editFields.bedrooms.enabled) {
        const bedrooms = parseInt(editFields.bedrooms.value, 10);
        if (isNaN(bedrooms)) {
          toast.error(t("massEdit.invalidBedrooms"));
          return;
        }
        updateData.bedrooms = bedrooms;
      }

      if (editFields.bathrooms.enabled) {
        const bathrooms = parseInt(editFields.bathrooms.value, 10);
        if (isNaN(bathrooms)) {
          toast.error(t("massEdit.invalidBathrooms"));
          return;
        }
        updateData.bathrooms = bathrooms;
      }

      if (editFields.layoutId.enabled) {
        // Если значение пустое, устанавливаем null, иначе используем выбранное значение
        updateData.layoutId =
          editFields.layoutId.value === "" ? null : editFields.layoutId.value;
      }

      // Добавляем обработку поля здания
      if (editFields.buildingId.enabled) {
        if (editFields.buildingId.value === "") {
          toast.error(t("massEdit.buildingRequired"));
          return;
        }
        updateData.buildingId = editFields.buildingId.value;
      }

      // Показываем прогресс
      toast.info(`Обновление ${selectedUnits.size} юнитов...`);

      // Вызываем Redux thunk для обновления
      const result = await dispatch(
        updateUnits({
          projectId,
          unitIds: Array.from(selectedUnits),
          updateData
        })
      ).unwrap();

      if (result.failed === 0) {
        toast.success(
          t("massEdit.updateSuccess", { count: result.successful })
        );
      } else {
        toast.warning(
          t("massEdit.updatePartial", {
            success: result.successful,
            failed: result.failed
          })
        );
      }

      // Вызываем колбэк успешного завершения
      onSuccess();
    } catch (error) {
      console.error("Error updating units:", error);
    }
  };

  // Обработчик удаления юнитов
  const handleDeleteUnits = async () => {
    if (selectedUnits.size === 0) {
      toast.error(t("massEdit.noUnitsSelected"));
      return;
    }

    onOpen(); // Открываем модальное окно для подтверждения
  };

  // Подтверждение удаления юнитов
  const confirmDeleteUnits = async () => {
    try {
      // Показываем прогресс
      toast.info(`Удаление ${selectedUnits.size} юнитов...`);

      // Создаем массив промисов для удаления каждого юнита
      const deletePromises = Array.from(selectedUnits).map(unitId =>
        fetch(`/api/projects/${projectId}/units/${unitId}`, {
          method: "DELETE"
        })
      );

      const results = await Promise.allSettled(deletePromises);

      const successful = results.filter(r => r.status === "fulfilled").length;
      const failed = results.filter(r => r.status === "rejected").length;

      if (failed === 0) {
        toast.success(
          t("filters.form.massEdit.deleteSuccess", { count: successful })
        );
      } else {
        toast.warning(
          t("filters.form.massEdit.deletePartial", {
            success: successful,
            failed
          })
        );
      }

      // Закрываем модальное окно
      onClose();

      // Вызываем колбэк успешного завершения
      onSuccess();
    } catch (error) {
      console.error("Error deleting units:", error);
      toast.error(t("filters.form.massEdit.deleteError"));
      onClose();
    }
  };

  return (
    <Card className="mb-6">
      <CardBody>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {t("filters.form.massEdit.editFields")}
          </h2>
          <div className="text-sm text-default-500">
            {selectedUnits.size > 0 ? (
              <span>
                {t("filters.form.massEdit.selectedUnits")}: {selectedUnits.size}
              </span>
            ) : (
              <span className="text-danger">
                {t("filters.form.massEdit.noUnitsSelected")}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Статус */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center">
              <Checkbox
                isSelected={editFields.status.enabled}
                onChange={(e: any) =>
                  handleEditFieldToggle("status", e.target.checked)
                }
              />
              <span className="ml-2">{t("status.title" as any)}</span>
            </div>
            <Select
              placeholder={t("status.select" as any)}
              selectedKeys={[editFields.status.value]}
              onChange={(e: any) =>
                handleEditFieldChange("status", e.target.value)
              }
              isDisabled={!editFields.status.enabled}
            >
              <SelectItem key="AVAILABLE" value="AVAILABLE">
                {t("status.available" as any)}
              </SelectItem>
              <SelectItem key="RESERVED" value="RESERVED">
                {t("status.reserved" as any)}
              </SelectItem>
              <SelectItem key="SOLD" value="SOLD">
                {t("status.sold" as any)}
              </SelectItem>
            </Select>
          </div>

          {/* Цена */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center">
              <Checkbox
                isSelected={editFields.price.enabled}
                onChange={(e: any) =>
                  handleEditFieldToggle("price", e.target.checked)
                }
              />
              <span className="ml-2">
                {t("filters.form.price.label" as any)}
              </span>
            </div>
            <Input
              type="number"
              placeholder={t("filters.form.form.price.placeholder" as any)}
              value={editFields.price.value}
              onChange={(e: any) =>
                handleEditFieldChange("price", e.target.value)
              }
              isDisabled={!editFields.price.enabled}
            />
          </div>

          {/* Спальни */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center">
              <Checkbox
                isSelected={editFields.bedrooms.enabled}
                onChange={(e: any) =>
                  handleEditFieldToggle("bedrooms", e.target.checked)
                }
              />
              <span className="ml-2">
                {t("filters.form.bedrooms.label" as any)}
              </span>
            </div>
            <Input
              type="number"
              placeholder={t("filters.form.form.bedrooms.placeholder" as any)}
              value={editFields.bedrooms.value}
              onChange={(e: any) =>
                handleEditFieldChange("bedrooms", e.target.value)
              }
              isDisabled={!editFields.bedrooms.enabled}
            />
          </div>

          {/* Ванные */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center">
              <Checkbox
                isSelected={editFields.bathrooms.enabled}
                onChange={(e: any) =>
                  handleEditFieldToggle("bathrooms", e.target.checked)
                }
              />
              <span className="ml-2">
                {t("filters.form.bathrooms.label" as any)}
              </span>
            </div>
            <Input
              type="number"
              placeholder={t("filters.form.form.bathrooms.placeholder" as any)}
              value={editFields.bathrooms.value}
              onChange={(e: any) =>
                handleEditFieldChange("bathrooms", e.target.value)
              }
              isDisabled={!editFields.bathrooms.enabled}
            />
          </div>

          {/* Планировка */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center">
              <Checkbox
                isSelected={editFields.layoutId.enabled}
                onChange={(e: any) =>
                  handleEditFieldToggle("layoutId", e.target.checked)
                }
              />
              <span className="ml-2">
                {t("filters.form.selectLayout" as any)}
              </span>
            </div>
            <Select
              placeholder={t("filters.form.form.layout.placeholder" as any)}
              selectedKeys={
                editFields.layoutId.value ? [editFields.layoutId.value] : []
              }
              onChange={(e: any) =>
                handleEditFieldChange("layoutId", e.target.value)
              }
              isDisabled={!editFields.layoutId.enabled}
            >
              <SelectItem key="empty" value="">
                {t("filters.form.noLayout" as any)}
              </SelectItem>
              {
                layouts.map(layout => (
                  <SelectItem key={layout.id} value={layout.id}>
                    {layout.name}
                  </SelectItem>
                )) as any
              }
            </Select>
          </div>

          {/* Здание */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center">
              <Checkbox
                isSelected={editFields.buildingId.enabled}
                onChange={(e: any) =>
                  handleEditFieldToggle("buildingId", e.target.checked)
                }
              />
              <span className="ml-2">
                {t("filters.form.selectBuilding" as any)}
              </span>
            </div>
            <Select
              placeholder={t("filters.form.selectBuilding" as any)}
              selectedKeys={
                editFields.buildingId.value ? [editFields.buildingId.value] : []
              }
              onChange={(e: any) =>
                handleEditFieldChange("buildingId", e.target.value)
              }
              isDisabled={!editFields.buildingId.enabled}
            >
              {
                buildings.map(building => (
                  <SelectItem key={building.id} value={building.id}>
                    {building.name}
                  </SelectItem>
                )) as any
              }
            </Select>
          </div>
        </div>

        <Divider className="my-6" />

        <div className="flex justify-end gap-2">
          <Button variant="flat" onClick={onCancel} isDisabled={isLoading}>
            {t("buttons.cancel" as any)}
          </Button>
          <Button
            color="danger"
            onClick={handleDeleteUnits}
            isDisabled={selectedUnits.size === 0 || isLoading}
          >
            {t("buttons.delete" as any)}
          </Button>
          <Button
            color="primary"
            onClick={handleSaveChanges}
            isLoading={isLoading}
            isDisabled={selectedUnits.size === 0}
            startContent={isLoading ? <Spinner size="sm" /> : null}
          >
            {t("buttons.save" as any)}
          </Button>
        </div>

        {/* Модальное окно подтверждения удаления */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalContent>
            <ModalHeader>
              {t("filters.form.massEdit.deleteConfirmHeader")}
            </ModalHeader>
            <ModalBody>
              {t("filters.form.massEdit.deleteConfirmBody", {
                count: selectedUnits.size
              })}
            </ModalBody>
            <ModalFooter>
              <Button variant="flat" onClick={onClose}>
                {t("filters.form.massEdit.deleteCancelButton")}
              </Button>
              <Button color="danger" onClick={confirmDeleteUnits}>
                {t("filters.form.massEdit.deleteConfirmButton")}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </CardBody>
    </Card>
  );
}
