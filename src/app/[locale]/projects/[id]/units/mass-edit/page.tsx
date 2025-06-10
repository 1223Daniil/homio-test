"use client";

import { Button, Spinner } from "@heroui/react";
import {
  clearSelectedUnits,
  fetchBuildings,
  fetchLayouts,
  fetchUnits,
  selectError,
  selectIsLoading
} from "@/store/slices/unitsSlice";
import { useAppDispatch, useAppSelector } from "@/store/store";
import { useEffect, useState } from "react";

import EditPanel from "./EditPanel";
// Импортируем компоненты
import UnitFilters from "./UnitFilters";
import UnitTable from "./UnitTable";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

export default function MassEditPage() {
  const t = useTranslations("Units");
  const params = useParams<{ id: string; locale: string }>();
  const projectId = params?.id || "";
  const locale = params?.locale || "ru";
  const dispatch = useAppDispatch();

  const [editMode, setEditMode] = useState(false);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);

  // Загружаем данные при монтировании компонента
  useEffect(() => {
    if (!projectId) return;

    const loadData = async () => {
      try {
        await dispatch(fetchUnits(projectId)).unwrap();
        await dispatch(fetchBuildings(projectId)).unwrap();
        await dispatch(fetchLayouts(projectId)).unwrap();
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();

    // Очищаем данные при размонтировании
    return () => {
      dispatch(clearSelectedUnits());
    };
  }, [dispatch, projectId]);

  // Показываем сообщение об ошибке, если она есть
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Обработчик включения режима редактирования
  const handleEnableEditMode = () => {
    setEditMode(true);
  };

  // Обработчик отмены редактирования
  const handleCancelEdit = () => {
    setEditMode(false);
    dispatch(clearSelectedUnits());
  };

  // Обработчик успешного завершения редактирования
  const handleEditSuccess = () => {
    setEditMode(false);
    dispatch(clearSelectedUnits());
    dispatch(fetchUnits(projectId));
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {t("filters.form.massEdit.title")}
          </h1>

          {!editMode && (
            <Button
              color="primary"
              onClick={handleEnableEditMode}
              isDisabled={isLoading}
            >
              {t("filters.form.massEdit.startEditing")}
            </Button>
          )}
        </div>

        {/* Панель фильтров */}
        <UnitFilters projectId={projectId} />

        {/* Панель редактирования (показывается только в режиме редактирования) */}
        {editMode && (
          <EditPanel
            projectId={projectId}
            onCancel={handleCancelEdit}
            onSuccess={handleEditSuccess}
          />
        )}

        {/* Таблица юнитов */}
        {isLoading && !error ? (
          <div className="flex justify-center items-center py-12">
            <Spinner size="lg" />
            <span className="ml-2">Загрузка юнитов...</span>
          </div>
        ) : (
          <UnitTable
            editMode={editMode}
            projectId={projectId}
            locale={locale}
          />
        )}
      </div>
    </div>
  );
}
