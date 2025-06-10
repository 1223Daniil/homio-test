import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { RootState } from "../store";

// Интерфейс для планировки
export interface SelectedLayout {
  id: string;
  name: string;
  bathrooms?: number;
  bedrooms?: number;
  currency?: string;
  floor?: number | null;
  mainImage?: string;
  maxPrice?: number;
  minPrice?: number;
  totalArea?: number;
  type?: string;
  units?: Array<{
    id: string;
    number: string;
    price: number;
    status: string;
    floor: number | null;
    layoutId: string;
    views?: number;
  }>;
  unitsCount?: number;
}

// Интерфейс для состояния слайса
interface LayoutsState {
  selectedLayouts: SelectedLayout[];
  isLoading: boolean;
  error: string | null;
}

// Начальное состояние
const initialState: LayoutsState = {
  selectedLayouts: [],
  isLoading: false,
  error: null
};

// Создаем слайс
export const layoutsSlice = createSlice({
  name: "layouts",
  initialState,
  reducers: {
    // Добавить планировку в выбранные
    addSelectedLayout: (state, action: PayloadAction<SelectedLayout>) => {
      // Проверяем, не добавлена ли уже эта планировка
      const exists = state.selectedLayouts.some(
        layout => layout.id === action.payload.id
      );
      if (!exists) {
        state.selectedLayouts.push(action.payload);
      }
    },

    // Удалить планировку из выбранных
    removeSelectedLayout: (state, action: PayloadAction<string>) => {
      state.selectedLayouts = state.selectedLayouts.filter(
        layout => layout.id !== action.payload
      );
    },

    // Очистить все выбранные планировки
    clearSelectedLayouts: state => {
      state.selectedLayouts = [];
    },

    // Установить массив выбранных планировок
    setSelectedLayouts: (state, action: PayloadAction<SelectedLayout[]>) => {
      state.selectedLayouts = action.payload;
    }
  }
});

// Экспортируем actions
export const {
  addSelectedLayout,
  removeSelectedLayout,
  clearSelectedLayouts,
  setSelectedLayouts
} = layoutsSlice.actions;

// Селекторы
export const selectSelectedLayouts = (state: RootState) =>
  state.layouts.selectedLayouts;
export const selectIsLoading = (state: RootState) => state.layouts.isLoading;
export const selectError = (state: RootState) => state.layouts.error;

// Экспортируем reducer
export default layoutsSlice.reducer;
