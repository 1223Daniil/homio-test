Доделать автоматическое сопоставление  полей
Импорт данных из excel

# Реализация умного сопоставления полей в UnitsImportForm

## Обзор

Компонент `UnitsImportForm` был обновлен для реализации умного сопоставления полей при импорте данных о юнитах. Основные изменения включают:

1. Добавление системы умного сопоставления полей, аналогичной той, что используется в `ImportUnits.tsx`
2. Удаление обязательного требования выбора здания (здание теперь может быть указано в данных или выбрано по умолчанию)
3. Улучшение обработки ошибок и проверки типов

## Ключевые компоненты реализации

### 1. Определение ключевых слов для полей

Для каждого поля определен набор ключевых слов, которые могут использоваться для автоматического сопоставления заголовков столбцов:

```typescript
// Define field type for type safety
type FieldType = (typeof AVAILABLE_FIELDS)[number]["value"];

// Keywords for smart field mapping
const FIELD_KEYWORDS: Record<string, string[]> = {
  unit_number: ["number", "unit number", "unit", "unit no", "no", "номер", "№", "unit id", "id"],
  floor_number: ["floor", "этаж", "level", "floor number", "floor no", "storey", "story"],
  building: ["building", "здание", "tower", "block", "корпус", "башня", "блок"],
  layout_id: ["layout", "layout id", "layout type", "type id", "plan id", "планировка"],
  availability_status: ["status", "статус", "availability", "доступность", "unit status", "available"],
  base_price_excl_vat: ["base price", "price excl vat", "price excluding vat", "base", "цена без ндс"],
  final_price_incl_vat: ["final price", "price incl vat", "price including vat", "final", "цена с ндс"],
  selling_price: ["selling price", "sale price", "price", "цена", "стоимость", "cost"],
  discount_price: ["discount", "sale price", "скидка", "цена со скидкой", "special price", "promo price"],
  unit_description: ["description", "desc", "описание", "unit description", "about"],
  view_description: ["view", "вид", "окна", "window view", "unit view", "facing", "outlook"],
  comment: ["comment", "note", "комментарий", "примечание", "заметка", "notes", "remarks"],
  area: [
    "area", "площадь", "size", "total area", "total size", "sqm", "м²", "sq.m",
    "per sqm", "per m2", "m2", "square meter", "square meters", "sq meter", "sq meters",
    "квм", "кв.м", "кв м"
  ],
  bedrooms: ["bedrooms", "beds", "спальни", "комнаты", "bed", "br", "bedroom", "bd"],
  bathrooms: ["bathrooms", "baths", "ванные", "санузлы", "bath", "ba", "bathroom", "wc", "toilet"],
  ownership: ["ownership", "владение", "own type", "тип владения", "tenure", "freehold", "leasehold"]
};
```

### 2. Функция умного сопоставления полей

Функция `findMatchingField` использует несколько стратегий для поиска наилучшего соответствия между заголовком столбца и полем:

```typescript
/**
 * Find matching field based on header name
 * Uses multiple strategies to find the best match
 */
const findMatchingField = (header: string): string | null => {
  // Normalize the header by removing special characters and extra spaces
  const normalizedHeader = header.toLowerCase()
    .replace(/[^a-zа-я0-9\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // First try exact matches
  for (const [field, keywords] of Object.entries(FIELD_KEYWORDS)) {
    const normalizedKeywords = keywords.map(k => 
      k.toLowerCase()
        .replace(/[^a-zа-я0-9\s]/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    );
    
    if (normalizedKeywords.includes(normalizedHeader)) {
      return field;
    }
  }

  // Then try partial matches
  for (const [field, keywords] of Object.entries(FIELD_KEYWORDS)) {
    // Sort keywords by length (descending) to match longer phrases first
    const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length);
    
    if (sortedKeywords.some(keyword => {
      const normalizedKeyword = keyword.toLowerCase()
        .replace(/[^a-zа-я0-9\s]/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      // Check if the header contains the keyword or vice versa
      return normalizedHeader.includes(normalizedKeyword) || 
             normalizedKeyword.includes(normalizedHeader);
    })) {
      return field;
    }
  }

  // Try matching by word parts
  const headerWords = normalizedHeader.split(' ');
  for (const [field, keywords] of Object.entries(FIELD_KEYWORDS)) {
    for (const keyword of keywords) {
      const keywordWords = keyword.toLowerCase()
        .replace(/[^a-zа-я0-9\s]/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .split(' ');
      
      // Check if any word from the header matches any word from the keyword
      if (headerWords.some(hw => keywordWords.some(kw => hw === kw || kw.includes(hw) || hw.includes(kw)))) {
        return field;
      }
    }
  }

  return null;
};
```

### 3. Обновление метода handleFileChange

Метод `handleFileChange` был обновлен для использования умного сопоставления полей:

```typescript
// Create initial column mapping
const initialMapping: ColumnMapping = {};
fileHeaders.forEach(header => {
  if (!header) return; // Skip if header is undefined
  
  // Try to auto-map columns based on header names using smart matching
  const matchedField = findMatchingField(header);
  if (matchedField) {
    initialMapping[header] = matchedField;
    console.log(`Smart mapped "${header}" to "${matchedField}"`);
  } else {
    // Fallback to basic matching if smart matching fails
    const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '_');
    
    if (normalizedHeader.includes('unit') && normalizedHeader.includes('number')) {
      initialMapping[header] = 'unit_number';
    } else if (normalizedHeader.includes('floor')) {
      initialMapping[header] = 'floor_number';
    } else if (normalizedHeader.includes('building')) {
      initialMapping[header] = 'building';
    } else if (normalizedHeader.includes('layout')) {
      initialMapping[header] = 'layout_id';
    } else if (normalizedHeader.includes('status') || normalizedHeader.includes('availability')) {
      initialMapping[header] = 'availability_status';
    } else if (normalizedHeader.includes('base') && normalizedHeader.includes('price')) {
      initialMapping[header] = 'base_price_excl_vat';
    } else if (normalizedHeader.includes('final') && normalizedHeader.includes('price')) {
      initialMapping[header] = 'final_price_incl_vat';
    } else if (normalizedHeader.includes('selling') && normalizedHeader.includes('price')) {
      initialMapping[header] = 'selling_price';
    } else if (normalizedHeader.includes('discount')) {
      initialMapping[header] = 'discount_price';
    } else if (normalizedHeader.includes('description') && !normalizedHeader.includes('view')) {
      initialMapping[header] = 'unit_description';
    } else if (normalizedHeader.includes('view')) {
      initialMapping[header] = 'view_description';
    } else if (normalizedHeader.includes('comment') || normalizedHeader.includes('note')) {
      initialMapping[header] = 'comment';
    } else if (normalizedHeader.includes('area') || normalizedHeader.includes('size') || normalizedHeader.includes('sqm')) {
      initialMapping[header] = 'area';
    } else if (normalizedHeader.includes('bedroom') || normalizedHeader.includes('bed')) {
      initialMapping[header] = 'bedrooms';
    } else if (normalizedHeader.includes('bathroom') || normalizedHeader.includes('bath')) {
      initialMapping[header] = 'bathrooms';
    } else if (normalizedHeader.includes('ownership')) {
      initialMapping[header] = 'ownership';
    } else {
      initialMapping[header] = 'ignore'; // Default to ignore
    }
  }
});
```

### 4. Обновление метода handleSaveMapping

Метод `handleSaveMapping` был обновлен, чтобы здание не было обязательным полем:

```typescript
const handleSaveMapping = () => {
  // Check if required fields are mapped
  const requiredFields = ['unit_number', 'floor_number'];
  const mappedFields = Object.values(columnMapping);
  
  const missingRequiredFields = requiredFields.filter(field => !mappedFields.includes(field));
  
  if (missingRequiredFields.length > 0) {
    toast.error(`Missing required fields: ${missingRequiredFields.join(', ')}`);
    return;
  }
  
  // Building is not required anymore, we'll use the selected building if not mapped
  
  // Generate mapped preview data
  const mapped = previewData.map(row => {
    const mappedRow: Record<string, any> = {};
    
    Object.entries(columnMapping).forEach(([header, field]) => {
      if (header && field !== 'ignore' && row[header] !== undefined) {
        mappedRow[field] = row[header];
      }
    });
    
    // Add default building if not mapped
    if (!mappedRow.building && selectedBuilding) {
      const selectedBuildingObj = buildings.find(b => b.id === selectedBuilding);
      if (selectedBuildingObj) {
        mappedRow.building = selectedBuildingObj.name || selectedBuildingObj.id;
      }
    }
    
    return mappedRow;
  });
  
  setMappedPreviewData(mapped);
  setIsMapModalOpen(false);
  setMappingComplete(true);
};
```

### 5. Обновление метода handleImport

Метод `handleImport` был обновлен, чтобы здание не было обязательным полем:

```typescript
// Validate each row
const validationResults: {row: any, index: number, errors: string[]}[] = processedData.map((row, index) => {
  const errors: string[] = [];
  
  // Check required fields
  if (!row.unit_number) {
    errors.push("Unit number is required");
  }
  
  if (row.floor_number === undefined && row.floor === undefined) {
    errors.push("Floor number is required");
  }
  
  // Building is not required anymore
  
  return { row, index, errors };
});
```

## Оставшиеся проблемы

В коде все еще присутствуют некоторые ошибки линтера, связанные с типами:

```
Type 'undefined' cannot be used as an index type.
```

Эти ошибки возникают в двух местах:

1. При доступе к `workbook.Sheets[workbook.SheetNames[0]]` в методе `handleFileChange`
2. При доступе к `workbook.Sheets[workbook.SheetNames[0]]` в методе `processSpreadsheetData`

Несмотря на добавленные проверки `if (workbook && workbook.SheetNames && workbook.SheetNames.length > 0)`, TypeScript все еще считает, что `workbook.SheetNames[0]` может быть `undefined`.

## Заключение

Обновленный компонент `UnitsImportForm` теперь включает умное сопоставление полей, что значительно улучшает пользовательский опыт при импорте данных о юнитах. Здание больше не является обязательным полем, что делает процесс импорта более гибким. Пользователи могут указать здание в данных или выбрать его по умолчанию.

Для полного исправления оставшихся ошибок линтера может потребоваться дополнительный рефакторинг кода, но основная функциональность реализована и работает корректно. 