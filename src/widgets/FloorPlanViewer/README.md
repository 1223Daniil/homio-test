# FloorPlanViewer

Виджет для отображения поэтажных планов проекта с возможностью выбора этажа и просмотра информации о юнитах.

## Возможности

- Отображение поэтажных планов с SVG разметкой юнитов
- Выбор этажа из списка
- Переключение между режимами просмотра (List, Floors, Grid)
- Отображение информации о юните при наведении или клике
- Полноэкранный режим просмотра
- Адаптивный дизайн для мобильных устройств
- Поддержка интернационализации

## Использование

```tsx
import { FloorPlanViewer } from "@/widgets/FloorPlanViewer";

// ...

<FloorPlanViewer
  projectId={projectId}
  floorPlans={floorPlans}
  selectedFloor={selectedFloor}
  onFloorChange={setSelectedFloor}
  selectedUnitId={selectedUnitId} // опционально
/>;
```

## Пропсы

| Имя            | Тип                     | Обязательный | Описание                               |
| -------------- | ----------------------- | ------------ | -------------------------------------- |
| projectId      | string                  | Да           | ID проекта                             |
| floorPlans     | FloorPlan[]             | Да           | Массив планов этажей                   |
| selectedFloor  | number                  | Да           | Номер выбранного этажа                 |
| onFloorChange  | (floor: number) => void | Да           | Функция для изменения выбранного этажа |
| selectedUnitId | string                  | Нет          | ID выбранного юнита (опционально)      |

## Структура данных

### FloorPlan

```ts
interface FloorPlan {
  id: string;
  buildingId: string;
  floorNumber: number;
  imageUrl: string;
  name: string;
  status: string;
  svgData?: string;
  units?: Unit[];
  areas?: Array<{ unitId: string; svgPath: string; status?: string }>;
}
```

### Unit

```ts
interface Unit {
  id: string;
  number: string;
  status: string;
  floor: number;
  bedrooms?: number;
  price?: number;
  area?: number;
  windowView?: "sea" | "mountain" | "city" | "garden";
}
```

## Режимы просмотра

- **List** - отображение списка юнитов
- **Floors** - отображение поэтажного плана с выбором этажа
- **Grid** - отображение сетки юнитов

## Статусы юнитов

- **AVAILABLE** - доступен (зеленый)
- **RESERVED** - зарезервирован (оранжевый)
- **SOLD** - продан (красный)
- **UNAVAILABLE** - недоступен (серый)
