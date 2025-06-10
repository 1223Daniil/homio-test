import {
  SelectedLayout,
  addSelectedLayout,
  clearSelectedLayouts,
  removeSelectedLayout,
  selectError,
  selectIsLoading,
  selectSelectedLayouts,
  setSelectedLayouts
} from "../store/slices/layoutsSlice";
import { useAppDispatch, useAppSelector } from "../store/store";

import { useCallback } from "react";

export const useLayouts = () => {
  const dispatch = useAppDispatch();
  const selectedLayouts = useAppSelector(selectSelectedLayouts);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);

  // Добавить планировку в выбранные
  const addLayout = useCallback(
    (layout: SelectedLayout) => {
      dispatch(addSelectedLayout(layout));
    },
    [dispatch]
  );

  // Удалить планировку из выбранных
  const removeLayout = useCallback(
    (layoutId: string) => {
      dispatch(removeSelectedLayout(layoutId));
    },
    [dispatch]
  );

  // Очистить все выбранные планировки
  const clearLayouts = useCallback(() => {
    dispatch(clearSelectedLayouts());
  }, [dispatch]);

  // Установить массив выбранных планировок
  const setLayouts = useCallback(
    (layouts: SelectedLayout[]) => {
      dispatch(setSelectedLayouts(layouts));
    },
    [dispatch]
  );

  // Проверить, выбрана ли планировка
  const isLayoutSelected = useCallback(
    (layoutId: string) => {
      return selectedLayouts.some(layout => layout.id === layoutId);
    },
    [selectedLayouts]
  );

  // Переключить выбор планировки (добавить если не выбрана, удалить если выбрана)
  const toggleLayout = useCallback(
    (layout: SelectedLayout) => {
      if (isLayoutSelected(layout.id)) {
        removeLayout(layout.id);
      } else {
        addLayout(layout);
      }
    },
    [isLayoutSelected, removeLayout, addLayout]
  );

  return {
    selectedLayouts,
    isLoading,
    error,
    addLayout,
    removeLayout,
    clearLayouts,
    setLayouts,
    isLayoutSelected,
    toggleLayout
  };
};
