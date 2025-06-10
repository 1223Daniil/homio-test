# Векторный поиск и рекомендации проектов

## Общее описание

Система векторного поиска и рекомендаций проектов использует комбинированный подход, сочетающий:
1. Семантический поиск на основе векторных эмбеддингов
2. Прямые текстовые совпадения
3. Контекстные факторы релевантности
4. Кэширование результатов

## Архитектура

### Основные компоненты

1. **VectorizationService** - основной сервис, отвечающий за:
   - Подготовку текстовых описаний проектов
   - Генерацию и хранение векторных эмбеддингов
   - Поиск похожих проектов
   - Управление кэшем
   - Периодическое обновление векторов

2. **ProjectEmbedding** - модель в базе данных для хранения векторов
3. **OpenAIService** - сервис для работы с API OpenAI

### Процесс векторизации

1. **Подготовка текста**:
```typescript
const sections = [
  // Основная информация
  `Название: ${project.name}`,
  `Тип: ${project.type}`,
  `Статус: ${project.status}`,
  `Класс: ${project.class}`,
  `Стадия строительства: ${project.constructionStatus}%`,
  
  // Локация
  `Локация: ${district}, ${city}
   Расстояние до пляжа: ${beachDistance} км
   Расстояние до центра: ${centerDistance} км`,
  
  // Инфраструктура
  `Инфраструктура:
   - Транспорт: ${publicTransport}/100
   - Удобства: ${amenitiesLevel}/100
   - Безопасность: ${safetyLevel}/100
   - Шум: ${noiseLevel}/100
   - Школы: ${schoolsAvailable}/100`,
  
  // Цена и условия
  `Цена: ${basePrice} ${currency}
   Цена за м²: ${pricePerSqm} ${currency}
   Условия: ${purchaseConditions}`,
  
  // Характеристики
  `Характеристики:
   - Всего юнитов: ${totalUnits}
   - Зданий: ${totalBuildings}
   - Площадь участка: ${totalLandArea}м²
   - Инфраструктурная площадь: ${infrastructureArea}м²`,
  
  // Удобства
  `Удобства: ${amenities.join(', ')}`,
  
  // Застройщик
  `Застройщик: ${developer}
   Завершенных проектов: ${completedProjects}
   Строящихся проектов: ${ongoingProjects}`,
  
  // Доходность
  `Инвестиционные показатели:
   - Гарантированная доходность: ${guaranteed}% на ${years} года
   - Потенциальная доходность: ${potential}%
   - Заполняемость: ${occupancy}%`
].filter(Boolean).join('\n\n');
```

2. **Генерация эмбеддингов**:
- Использование OpenAI API для создания векторных представлений
- Кэширование результатов на 1 час
- Сохранение в базе данных для последующего использования

## Алгоритм поиска

### Факторы релевантности

1. **Векторное сходство** (базовый скор):
   - Косинусное сходство между векторами запроса и проекта

2. **Прямые совпадения**:
   - Точное совпадение названия (вес: 1.0)
   - Частичное совпадение в названии (вес: 0.8)
   - Совпадение в описании (вес: 0.3)

3. **Удобства**:
   - Наличие фитнес-центра (вес: 0.2)
   - Наличие бассейна (вес: 0.15)
   - Наличие охраны (вес: 0.1)

4. **Локация**:
   - Близость к пляжу (≤ 2 км) (вес: 0.2)
   - Хороший транспорт (> 80%) (вес: 0.15)
   - Низкий уровень шума (< 30%) (вес: 0.1)

5. **Статус**:
   - Проект в стадии строительства (вес: 0.1)

### Формула расчета релевантности

```typescript
relevance = vectorSimilarity + 
            (exactNameMatch ? 1.0 : 0) +
            (nameIncludes ? 0.8 : 0) +
            (descIncludes ? 0.3 : 0) +
            (hasGym ? 0.2 : 0) +
            (hasPool ? 0.15 : 0) +
            (hasSecurity ? 0.1 : 0) +
            (isNearBeach ? 0.2 : 0) +
            (hasGoodTransport ? 0.15 : 0) +
            (hasLowNoise ? 0.1 : 0) +
            (isUnderConstruction ? 0.1 : 0);

// Нормализация
relevance = Math.min(1, Math.max(0, relevance));
```

## Механизмы файнтюнинга

### 1. Настройка весов факторов

Веса факторов можно настраивать в зависимости от:
- Анализа поведения пользователей
- A/B тестирования
- Сезонности
- Маркетинговых приоритетов

```typescript
interface RelevanceWeights {
  exactNameMatch: number;    // 1.0
  nameIncludes: number;      // 0.8
  descIncludes: number;      // 0.3
  hasGym: number;           // 0.2
  hasPool: number;          // 0.15
  hasSecurity: number;      // 0.1
  isNearBeach: number;      // 0.2
  hasGoodTransport: number; // 0.15
  hasLowNoise: number;      // 0.1
  isUnderConstruction: number; // 0.1
}
```

### 2. Настройка подготовки текста

Можно улучшать качество векторизации путем:
- Добавления новых секций в описание
- Изменения форматирования
- Добавления ключевых слов
- Улучшения нормализации текста

### 3. Кастомизация эмбеддингов

- Использование разных моделей OpenAI
- Тонкая настройка параметров запроса
- Эксперименты с размерностью векторов

## Механизмы дообучения

### 1. Обратная связь от пользователей

```typescript
interface UserFeedback {
  queryId: string;
  projectId: string;
  relevanceScore: number;
  clickThrough: boolean;
  timeSpent: number;
  conversion: boolean;
}
```

### 2. Автоматическое обновление

```typescript
async function scheduleVectorization(): Promise<void> {
  // Обновление векторов каждую неделю
  const projects = await findProjectsToUpdate();
  await vectorizeProjects(projects);
}
```

### 3. Анализ поведения

- Отслеживание кликов
- Время просмотра
- Конверсии
- Повторные просмотры

### 4. A/B тестирование

```typescript
interface ABTest {
  id: string;
  name: string;
  variants: {
    weights: RelevanceWeights;
    textPreparation: TextPreparationConfig;
    embeddingConfig: EmbeddingConfig;
  }[];
  metrics: {
    clickThrough: number;
    conversionRate: number;
    averageRelevance: number;
  };
}
```

## Мониторинг и оптимизация

### 1. Метрики производительности

- Время генерации эмбеддингов
- Время поиска
- Использование кэша
- Нагрузка на базу данных

### 2. Метрики качества

- Точность поиска
- Полнота результатов
- Релевантность результатов
- Удовлетворенность пользователей

### 3. Логирование

```typescript
interface VectorizationLog {
  projectId: string;
  timestamp: Date;
  duration: number;
  vectorSize: number;
  success: boolean;
  error?: string;
}
```

## Рекомендации по улучшению

1. **Краткосрочные улучшения**:
   - Добавить больше факторов релевантности
   - Улучшить нормализацию текста
   - Оптимизировать кэширование
   - Добавить логирование в базу данных

2. **Среднесрочные улучшения**:
   - Внедрить A/B тестирование
   - Добавить персонализацию поиска
   - Улучшить обработку языков
   - Внедрить анализ поведения пользователей

3. **Долгосрочные улучшения**:
   - Внедрить машинное обучение для настройки весов
   - Добавить кластеризацию проектов
   - Реализовать рекомендательную систему
   - Внедрить предиктивную аналитику

## API

### Основные методы

```typescript
interface VectorizationService {
  // Поиск похожих проектов
  findSimilarProjects(query: string, limit?: number): Promise<Project[]>;
  
  // Векторизация проекта
  vectorizeProject(project: Project): Promise<number[]>;
  
  // Массовая векторизация
  vectorizeAllProjects(): Promise<void>;
  
  // Планировщик обновлений
  scheduleVectorization(): Promise<void>;
}
```

### Примеры использования

```typescript
// Поиск проектов
const projects = await vectorizationService.findSimilarProjects(
  'luxury villa near beach with pool',
  10
);

// Обновление векторов
await vectorizationService.vectorizeAllProjects();

// Планирование обновлений
await vectorizationService.scheduleVectorization();
``` 