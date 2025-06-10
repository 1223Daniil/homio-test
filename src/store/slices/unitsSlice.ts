import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

// Определяем интерфейсы
export interface Unit {
  id: string;
  name: string | null;
  number: string | null;
  floor: number;
  area: number | null;
  price: number;
  status: "AVAILABLE" | "RESERVED" | "SOLD";
  bedrooms: number;
  bathrooms: number;
  buildingId: string;
  layoutId: string | null;
  description: string | null;
  view: string | null;
}

export interface Building {
  id: string;
  name: string;
}

export interface Layout {
  id: string;
  name: string;
}

interface UnitsState {
  units: Unit[];
  filteredUnits: Unit[];
  buildings: Building[];
  layouts: Layout[];
  selectedUnits: Set<string>;
  isLoading: boolean;
  error: string | null;
  filters: {
    searchQuery: string;
    statusFilter: string;
    buildingFilter: string;
    floorFilter: string;
    layoutFilter: string;
  };
}

// Начальное состояние
const initialState: UnitsState = {
  units: [],
  filteredUnits: [],
  buildings: [],
  layouts: [],
  selectedUnits: new Set<string>(),
  isLoading: false,
  error: null,
  filters: {
    searchQuery: '',
    statusFilter: 'all',
    buildingFilter: 'all',
    floorFilter: 'all',
    layoutFilter: 'all'
  }
};

// Асинхронные thunks
export const fetchUnits = createAsyncThunk(
  'units/fetchUnits',
  async (projectId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/units`);
      if (!response.ok) {
        throw new Error('Не удалось загрузить юниты');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchBuildings = createAsyncThunk(
  'units/fetchBuildings',
  async (projectId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/buildings`);
      if (!response.ok) {
        throw new Error('Не удалось загрузить здания');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

export const fetchLayouts = createAsyncThunk(
  'units/fetchLayouts',
  async (projectId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/layouts`);
      if (!response.ok) {
        throw new Error('Не удалось загрузить планировки');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

interface UpdateUnitsParams {
  projectId: string;
  unitIds: string[];
  updateData: Record<string, any>;
}

interface UpdateResult {
  successful: number;
  failed: number;
}

export const updateUnits = createAsyncThunk<
  UpdateResult,
  UpdateUnitsParams,
  { rejectValue: string }
>(
  'units/updateUnits',
  async ({ projectId, unitIds, updateData }, { rejectWithValue }) => {
    try {
      let successful = 0;
      let failed = 0;
      
      // Обновляем юниты пакетами по 20 для оптимизации
      const batchSize = 20;
      const batches: Array<string[]> = [];
      
      for (let i = 0; i < unitIds.length; i += batchSize) {
        const batchIds = unitIds.slice(i, i + batchSize);
        batches.push(batchIds);
      }
      
      // Обрабатываем пакеты последовательно
      for (const batch of batches) {
        if (!batch || batch.length === 0) continue;
        
        const updatePromises = batch.map(unitId => {
          // Проверяем, содержит ли updateData поля, требующие специальной обработки
          const needsSpecialHandling = 'layoutId' in updateData || 'buildingId' in updateData;
          
          // Если требуется специальная обработка, используем PATCH для каждого поля отдельно
          if (needsSpecialHandling) {
            const promises: Promise<Response>[] = [];
            
            // Обрабатываем все поля, кроме layoutId и buildingId
            const regularData = { ...updateData };
            delete regularData.layoutId;
            delete regularData.buildingId;
            
            if (Object.keys(regularData).length > 0) {
              promises.push(
                fetch(`/api/projects/${projectId}/units/${unitId}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(regularData)
                })
              );
            }
            
            // Обрабатываем layoutId отдельно, если он есть
            if ('layoutId' in updateData) {
              promises.push(
                fetch(`/api/projects/${projectId}/units/${unitId}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ layoutId: updateData.layoutId })
                })
              );
            }
            
            // Обрабатываем buildingId отдельно, если он есть
            if ('buildingId' in updateData) {
              promises.push(
                fetch(`/api/projects/${projectId}/units/${unitId}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ buildingId: updateData.buildingId })
                })
              );
            }
            
            // Возвращаем Promise.all для всех запросов
            return Promise.all(promises).then(() => Promise.resolve());
          }
          
          // Если нет полей, требующих специальной обработки, используем обычный PUT
          return fetch(`/api/projects/${projectId}/units/${unitId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updateData)
          });
        });
        
        const results = await Promise.allSettled(updatePromises);
        
        successful += results.filter(r => r.status === "fulfilled").length;
        failed += results.filter(r => r.status === "rejected").length;
        
        // Добавляем небольшую задержку между пакетами, чтобы не перегружать сервер
        if (batches.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      return { successful, failed };
    } catch (error) {
      return rejectWithValue((error as Error).message);
    }
  }
);

// Создаем slice
const unitsSlice = createSlice({
  name: 'units',
  initialState,
  reducers: {
    applyFilters: (state, action: PayloadAction<{
      searchQuery: string;
      statusFilter: string;
      buildingFilter: string;
      floorFilter: string;
      layoutFilter?: string;
    }>) => {
      const { searchQuery, statusFilter, buildingFilter, floorFilter, layoutFilter = state.filters.layoutFilter } = action.payload;
      
      // Сохраняем фильтры
      state.filters = {
        searchQuery,
        statusFilter,
        buildingFilter,
        floorFilter,
        layoutFilter
      };
      
      // Применяем фильтры
      let result = [...state.units];
      
      // Применяем поиск по номеру или названию
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        result = result.filter(unit => 
          (unit.number && unit.number.toLowerCase().includes(query)) || 
          (unit.name && unit.name.toLowerCase().includes(query))
        );
      }
      
      // Фильтр по статусу
      if (statusFilter !== "all") {
        result = result.filter(unit => unit.status === statusFilter);
      }
      
      // Фильтр по зданию
      if (buildingFilter !== "all") {
        result = result.filter(unit => unit.buildingId === buildingFilter);
      }
      
      // Фильтр по этажу
      if (floorFilter !== "all") {
        result = result.filter(unit => unit.floor === parseInt(floorFilter));
      }
      
      // Фильтр по планировке
      if (layoutFilter !== "all") {
        result = result.filter(unit => unit.layoutId === layoutFilter);
      }
      
      state.filteredUnits = result;
    },
    
    toggleSelectUnit: (state, action: PayloadAction<string>) => {
      const unitId = action.payload;
      if (state.selectedUnits.has(unitId)) {
        state.selectedUnits.delete(unitId);
      } else {
        state.selectedUnits.add(unitId);
      }
    },
    
    selectAllUnits: (state) => {
      state.selectedUnits = new Set(state.filteredUnits.map(unit => unit.id));
    },
    
    deselectAllUnits: (state) => {
      state.selectedUnits.clear();
    },
    
    clearSelectedUnits: (state) => {
      state.selectedUnits.clear();
    }
  },
  extraReducers: (builder) => {
    builder
      // Обработка fetchUnits
      .addCase(fetchUnits.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUnits.fulfilled, (state, action) => {
        state.isLoading = false;
        state.units = action.payload;
        state.filteredUnits = action.payload;
      })
      .addCase(fetchUnits.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Не удалось загрузить юниты';
      })
      
      // Обработка fetchBuildings
      .addCase(fetchBuildings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBuildings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.buildings = action.payload;
      })
      .addCase(fetchBuildings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Не удалось загрузить здания';
      })
      
      // Обработка fetchLayouts
      .addCase(fetchLayouts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLayouts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.layouts = action.payload;
      })
      .addCase(fetchLayouts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Не удалось загрузить планировки';
      })
      
      // Обработка updateUnits
      .addCase(updateUnits.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUnits.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updateUnits.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Не удалось обновить юниты';
      });
  }
});

// Экспортируем actions
export const { 
  applyFilters, 
  toggleSelectUnit, 
  selectAllUnits, 
  deselectAllUnits,
  clearSelectedUnits
} = unitsSlice.actions;

// Экспортируем селекторы
export const selectUnits = (state: RootState) => state.units.units;
export const selectFilteredUnits = (state: RootState) => state.units.filteredUnits;
export const selectBuildings = (state: RootState) => state.units.buildings;
export const selectLayouts = (state: RootState) => state.units.layouts;
export const selectSelectedUnits = (state: RootState) => state.units.selectedUnits;
export const selectIsLoading = (state: RootState) => state.units.isLoading;
export const selectError = (state: RootState) => state.units.error;
export const selectFilters = (state: RootState) => state.units.filters;

// Экспортируем reducer
export default unitsSlice.reducer; 