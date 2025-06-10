import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

import { configureStore } from "@reduxjs/toolkit";
import { enableMapSet } from "immer";
import layoutsReducer from "./slices/layoutsSlice";
import { quizApi } from "./api/quizApi";
import uiReducer from "./slices/uiSlice";
import unitsReducer from "./slices/unitsSlice";

// Включаем поддержку Map и Set в Immer
enableMapSet();

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    units: unitsReducer,
    layouts: layoutsReducer,
    [quizApi.reducerPath]: quizApi.reducer
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        // Игнорируем non-serializable values в state.units.selectedUnits (Set)
        ignoredPaths: ["units.selectedUnits"]
      }
    }).concat(quizApi.middleware)
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Типизированные хуки
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
