# AI Assistant Feature

## Обзор
AI Assistant - это интеллектуальный помощник, интегрированный в платформу Next Homio для оптимизации рабочих процессов и автоматизации рутинных задач. Ассистент специализируется на работе с проектами, позволяя быстро находить, редактировать и анализировать проекты через естественный языковой интерфейс.

## Архитектура

### Компоненты

1. **Frontend Components**
   ```
   src/
   ├── components/
   │   └── ai/
   │       ├── AIAssistant.tsx           # Основной компонент
   │       ├── AIMessage.tsx             # Компонент сообщения
   │       ├── AIQuickActions.tsx        # Компонент быстрых действий
   │       ├── AITypingIndicator.tsx     # Индикатор набора текста
   │       ├── AIProjectCard.tsx         # Карточка проекта в результатах
   │       └── AIProjectEditor.tsx       # Интерфейс редактирования проекта
   ├── hooks/
   │   └── ai/
   │       ├── useAIAssistant.ts         # Основной хук для работы с AI
   │       ├── useAIActions.ts           # Хук для действий AI
   │       ├── useAIProjectSearch.ts     # Хук для поиска проектов
   │       └── useAIProjectEdit.ts       # Хук для редактирования проектов
   ├── store/
   │   └── ai/
   │       ├── aiSlice.ts               # Redux slice для AI состояния
   │       ├── aiMiddleware.ts          # Middleware для обработки AI действий
   │       └── projectActions.ts        # Специфичные действия для проектов
   ```

2. **Backend Components**
   ```
   src/
   ├── app/
   │   └── api/
   │       └── ai/
   │           ├── route.ts             # Основной API endpoint
   │           ├── actions/             # Обработчики действий
   │           │   ├── projects/        # Действия с проектами
   │           │   │   ├── search.ts    # Поиск проектов
   │           │   │   ├── edit.ts      # Редактирование проектов
   │           │   │   └── analyze.ts   # Анализ проектов
   │           │   └── common/          # Общие действия
   │           └── chat/               # Обработка чат-сообщений
   ```

3. **Types and Interfaces**
   ```typescript
   // src/types/ai.ts
   interface AIMessage {
     id: string;
     content: string;
     type: 'user' | 'assistant';
     timestamp: Date;
     context?: {
       projectId?: string;
       action?: AIActionType;
       searchResults?: Project[];
     };
   }

   interface AIAction {
     id: string;
     type: AIActionType;
     params: Record<string, any>;
     status: 'pending' | 'completed' | 'failed';
     result?: any;
   }

   type AIActionType = 
     | 'search_projects'      // Поиск проектов
     | 'edit_project'         // Редактирование проекта
     | 'analyze_projects'     // Анализ проектов
     | 'create_selection'     // Создание подборки
     | 'compare_projects'     // Сравнение проектов
     | 'update_prices'        // Обновление цен
     | 'manage_status'        // Управление статусом
     | 'schedule_event';      // Планирование событий

   interface AIProjectSearchParams {
     query: string;
     filters?: {
       status?: ProjectStatus[];
       type?: ProjectType[];
       priceRange?: [number, number];
       location?: string;
       amenities?: string[];
     };
     sort?: {
       field: string;
       order: 'asc' | 'desc';
     };
   }

   interface AIProjectEditParams {
     projectId: string;
     fields: {
       [key: string]: any;
     };
     reason?: string;
   }
   ```

### Процесс работы с проектами

1. **Поиск проектов**
   ```typescript
   // Примеры команд для поиска
   "Найди все активные проекты в Пхукете с бассейном"
   "Покажи проекты дороже 5 миллионов с видом на море"
   "Составь подборку инвестиционных проектов с высокой доходностью"
   ```

2. **Редактирование проектов**
   ```typescript
   // Примеры команд для редактирования
   "Обнови статус проекта X на 'В строительстве'"
   "Добавь удобство 'спа' в проект Y"
   "Измени цены всех 1-bedroom юнитов в проекте Z, подняв их на 5%"
   ```

3. **Анализ проектов**
   ```typescript
   // Примеры аналитических команд
   "Сравни проекты X и Y по ключевым параметрам"
   "Проанализируй динамику цен в проекте Z за последний месяц"
   "Составь отчет по статусам строительства всех активных проектов"
   ```

### API Endpoints

```typescript
// src/app/api/ai/projects/route.ts
POST /api/ai/projects/search
{
  query: string;
  filters?: ProjectSearchFilters;
}

POST /api/ai/projects/edit
{
  projectId: string;
  updates: ProjectUpdates;
  context?: string;
}

POST /api/ai/projects/analyze
{
  projectIds: string[];
  analysisType: 'comparison' | 'trends' | 'performance';
}
```

## Функциональность для проектов

### Поисковые возможности
1. **Семантический поиск**
   - Понимание естественных запросов
   - Контекстный поиск по всем полям
   - Поддержка сложных фильтров

2. **Умные фильтры**
   - Автоматическое определение параметров поиска
   - Комбинирование нескольких условий
   - Поиск по похожести

3. **Подборки**
   - Создание тематических подборок
   - Персонализированные рекомендации
   - Сохранение и экспорт результатов

### Возможности редактирования
1. **Массовое редактирование**
   - Изменение параметров нескольких проектов
   - Умное обновление связанных полей
   - Валидация изменений

2. **Контекстное редактирование**
   - Понимание сложных команд редактирования
   - Автоматическое заполнение зависимых полей
   - История изменений

3. **Умные подсказки**
   - Предложения по оптимизации данных
   - Проверка консистентности
   - Рекомендации по улучшению

### Аналитические возможности
1. **Сравнительный анализ**
   - Детальное сравнение проектов
   - Выявление уникальных преимуществ
   - Анализ конкурентных преимуществ

2. **Анализ трендов**
   - Отслеживание изменений цен
   - Анализ спроса
   - Прогнозирование трендов

3. **Отчетность**
   - Генерация аналитических отчетов
   - Визуализация данных
   - Экспорт результатов

## Безопасность

1. **Валидация изменений**
   - Проверка прав доступа для каждого поля
   - Логирование всех изменений
   - Возможность отмены изменений

2. **Контроль доступа**
   - Ролевой доступ к функциям
   - Ограничение массовых операций
   - Аудит действий

## План реализации

1. **Фаза 1: Базовый функционал**
   - Реализация поиска проектов
   - Базовое редактирование полей
   - Простые аналитические функции

2. **Фаза 2: Расширенные возможности**
   - Семантический поиск
   - Массовое редактирование
   - Сравнительный анализ

3. **Фаза 3: Интеллектуальные функции**
   - Умные подсказки
   - Предиктивная аналитика
   - Персонализированные рекомендации

4. **Фаза 4: Оптимизация**
   - Улучшение точности
   - Оптимизация производительности
   - Расширение аналитических возможностей

## Тестирование

1. **Unit тесты**
   ```typescript
   // src/__tests__/components/ai/AIAssistant.test.tsx
   describe('AIAssistant', () => {
     it('renders correctly', () => {
       // ...
     });

     it('handles messages correctly', () => {
       // ...
     });
   });
   ```

2. **Integration тесты**
   - Тестирование взаимодействия компонентов
   - Проверка работы с API
   - Тестирование действий

3. **E2E тесты**
   - Проверка полного flow работы
   - Тестирование в разных браузерах
   - Проверка мобильной версии 

## Интеграция с существующими модулями

### 1. Проекты и Недвижимость
```typescript
// Интеграция с модулем проектов
interface ProjectIntegration {
  // Поиск и фильтрация
  searchProjects(query: string): Promise<Project[]>;
  filterByParameters(params: ProjectFilters): Promise<Project[]>;
  
  // Редактирование
  updateProject(id: string, data: Partial<Project>): Promise<Project>;
  updateMultipleProjects(updates: ProjectBulkUpdate[]): Promise<UpdateResult>;
  
  // Аналитика
  analyzeProjectMetrics(projectId: string): Promise<ProjectAnalytics>;
  compareProjects(projectIds: string[]): Promise<ProjectComparison>;
}
```

### 2. Курсы и Обучение
```typescript
// Интеграция с обучающим модулем
interface CourseIntegration {
  // Генерация контента
  generateCourseFromProject(projectId: string): Promise<Course>;
  createQuizFromProjectData(projectId: string): Promise<Quiz>;
  
  // Аналитика обучения
  analyzeAgentProgress(agentId: string): Promise<LearningProgress>;
  recommendNextCourse(userId: string): Promise<Course[]>;
}
```

### 3. Агентства и Агенты
```typescript
// Интеграция с модулем агентств
interface AgencyIntegration {
  // Управление агентами
  assignProjectsToAgents(assignments: AgentAssignment[]): Promise<void>;
  trackAgentPerformance(agentId: string): Promise<PerformanceMetrics>;
  
  // Аналитика продаж
  analyzeSalesMetrics(agencyId: string): Promise<SalesAnalytics>;
  forecastSales(projectId: string): Promise<SalesForecast>;
}
```

### 4. Просмотры и Бронирования
```typescript
// Интеграция с модулем просмотров
interface ViewingIntegration {
  // Управление просмотрами
  scheduleViewing(data: ViewingRequest): Promise<Viewing>;
  optimizeViewingSchedule(agentId: string): Promise<ViewingSchedule>;
  
  // Аналитика просмотров
  analyzeViewingEffectiveness(projectId: string): Promise<ViewingAnalytics>;
  trackConversionRate(agentId: string): Promise<ConversionMetrics>;
}
```

## Топ-50 ключевых возможностей системы

### Для застройщиков

1. **Управление проектами**
   - Автоматическое обновление статусов строительства
   - Массовое редактирование цен с учетом рыночных трендов
   - Генерация отчетов о ходе строительства

2. **Аналитика продаж**
   - Прогнозирование спроса на разные типы юнитов
   - Анализ эффективности ценовой политики
   - Отслеживание конверсии просмотров в продажи

3. **Маркетинг**
   - Автоматическая генерация описаний проектов
   - Оптимизация медиа-контента
   - A/B тестирование презентационных материалов

4. **Обучение**
   - Автоматическая генерация обучающих курсов по проектам
   - Отслеживание прогресса обучения агентов
   - Создание тестов для проверки знаний

### Для агентств

5. **Управление агентами**
   - Умное распределение проектов между агентами
   - Автоматическое планирование просмотров
   - Отслеживание эффективности работы агентов

6. **Продажи**
   - Автоматическая квалификация лидов
   - Прогнозирование вероятности закрытия сделок
   - Оптимизация воронки продаж

7. **Аналитика**
   - Анализ эффективности работы агентства
   - Прогнозирование комиссионных
   - Отслеживание KPI агентов

8. **Обучение**
   - Персонализированные планы обучения для агентов
   - Автоматическая оценка компетенций
   - Геймификация обучения

### Для агентов

9. **Работа с клиентами**
   - Умный подбор проектов под запросы клиентов
   - Автоматическое планирование просмотров
   - Генерация персонализированных презентаций

10. **Личная эффективность**
    - Оптимизация рабочего графика
    - Отслеживание личных KPI
    - Рекомендации по улучшению показателей

## Умные решения для архитектуры

### 1. Микросервисная архитектура с AI-прокси
```typescript
interface AIProxy {
  // Маршрутизация запросов к специализированным микросервисам
  route(request: AIRequest): Promise<AIResponse>;
  
  // Агрегация результатов
  aggregate(responses: AIResponse[]): Promise<AggregatedResponse>;
  
  // Кэширование и оптимизация
  cache(key: string, data: any): Promise<void>;
}
```

### 2. Событийно-ориентированная система
```typescript
interface EventSystem {
  // Публикация событий
  publish(event: AIEvent): Promise<void>;
  
  // Подписка на события
  subscribe(pattern: string, handler: EventHandler): void;
  
  // Обработка событий
  process(events: AIEvent[]): Promise<void>;
}
```

### 3. Умная маршрутизация запросов
```typescript
interface SmartRouter {
  // Анализ запроса
  analyze(request: AIRequest): Promise<RequestMetadata>;
  
  // Выбор оптимального обработчика
  selectHandler(metadata: RequestMetadata): Promise<RequestHandler>;
  
  // Балансировка нагрузки
  balance(handlers: RequestHandler[]): Promise<RequestHandler>;
}
```

### 4. Адаптивное кэширование
```typescript
interface AdaptiveCache {
  // Предиктивное кэширование
  predictAndCache(context: RequestContext): Promise<void>;
  
  // Инвалидация по паттернам
  invalidate(pattern: string): Promise<void>;
  
  // Оптимизация кэша
  optimize(): Promise<void>;
}
```

## Оптимизация API взаимодействия

### 1. Батчинг запросов
```typescript
interface BatchProcessor {
  // Группировка запросов
  batch(requests: AIRequest[]): Promise<BatchedRequest>;
  
  // Оптимизация выполнения
  execute(batch: BatchedRequest): Promise<BatchedResponse>;
  
  // Разделение результатов
  split(response: BatchedResponse): Promise<AIResponse[]>;
}
```

### 2. Потоковая обработка
```typescript
interface StreamProcessor {
  // Инициализация потока
  initStream(context: StreamContext): Promise<Stream>;
  
  // Обработка чанков
  processChunk(chunk: DataChunk): Promise<ProcessedChunk>;
  
  // Агрегация результатов
  finalizeStream(stream: Stream): Promise<StreamResult>;
}
```

### 3. Предиктивная загрузка
```typescript
interface PredictiveLoader {
  // Анализ паттернов использования
  analyzeUsagePatterns(userId: string): Promise<UsagePattern>;
  
  // Предзагрузка данных
  preload(pattern: UsagePattern): Promise<void>;
  
  // Оптимизация загрузки
  optimize(metrics: LoadingMetrics): Promise<void>;
}
```

### 4. Умная валидация
```typescript
interface SmartValidator {
  // Контекстная валидация
  validateWithContext(data: any, context: ValidationContext): Promise<ValidationResult>;
  
  // Предиктивная валидация
  predictValidationIssues(data: any): Promise<PotentialIssues>;
  
  // Автокоррекция данных
  autoCorrect(data: any, issues: ValidationIssue[]): Promise<CorrectedData>;
}
```

## Дополнительные возможности системы

11. **Умное планирование**
    - Оптимизация графика просмотров
    - Планирование маркетинговых кампаний
    - Прогнозирование загруженности агентов

12. **Автоматизация документооборота**
    - Генерация договоров
    - Автоматическое заполнение форм
    - Отслеживание статусов документов

13. **Интеграция с внешними сервисами**
    - Синхронизация с CRM системами
    - Интеграция с банковскими сервисами
    - Подключение к рекламным платформам

14. **Управление медиа-контентом**
    - Автоматическая обработка изображений
    - Генерация виртуальных туров
    - Оптимизация контента для разных платформ

15. **Безопасность и аудит**
    - Мониторинг подозрительной активности
    - Отслеживание изменений в системе
    - Контроль доступа к данным 

## SQL AI Интеграция

### 1. Прямые запросы к базе данных
```typescript
interface SQLAIIntegration {
  // Генерация SQL запросов из естественного языка
  generateQuery(prompt: string): Promise<{
    sql: string;
    explanation: string;
    params: any[];
  }>;

  // Оптимизация существующих запросов
  optimizeQuery(sql: string): Promise<{
    optimizedSql: string;
    improvements: string[];
    performanceGain: string;
  }>;

  // Анализ и объяснение запросов
  explainQuery(sql: string): Promise<{
    explanation: string;
    visualization: string;
    breakdown: QueryBreakdown[];
  }>;
}
```

### 2. Примеры использования

```typescript
// Примеры естественно-языковых запросов к БД
const examples = [
  // Поиск проектов
  "Найди все проекты в Пхукете с ценой от 5 до 10 миллионов батов и бассейном",
  
  // Аналитика
  "Покажи среднюю цену за квадратный метр по районам для проектов со статусом 'В строительстве'",
  
  // Сложные выборки
  "Сравни продажи юнитов по типам за последние 3 месяца с аналогичным периодом прошлого года",
  
  // Агрегация данных
  "Рассчитай общую стоимость всех доступных юнитов по каждому проекту с группировкой по статусу"
];
```

### 3. Преимущества подхода

1. **Гибкость запросов**
   - Прямой доступ к данным через SQL
   - Сложные выборки и агрегации
   - Оптимизированные запросы

2. **Производительность**
   - Выполнение на уровне БД
   - Оптимизация запросов AI
   - Кэширование результатов

3. **Безопасность**
   - Валидация запросов
   - Ограничение доступа
   - Аудит выполнения

### 4. Архитектура SQL AI

```typescript
interface SQLAIProcessor {
  // Анализ естественного языка
  analyzePrompt(prompt: string): Promise<QueryIntent>;

  // Генерация SQL
  generateSQL(intent: QueryIntent): Promise<SQLQuery>;

  // Валидация и оптимизация
  validateAndOptimize(query: SQLQuery): Promise<OptimizedQuery>;

  // Выполнение запроса
  execute(query: OptimizedQuery): Promise<QueryResult>;
}

interface QueryIntent {
  type: 'search' | 'analytics' | 'comparison' | 'aggregation';
  entities: string[];
  filters: Filter[];
  aggregations: Aggregation[];
  timeRange?: TimeRange;
}

interface SQLQuery {
  sql: string;
  params: any[];
  tables: string[];
  estimated_cost: number;
}

interface OptimizedQuery extends SQLQuery {
  optimizations: string[];
  indexes_used: string[];
  execution_plan: ExecutionPlan;
}
```

### 5. Интеграция с существующими модулями

```typescript
class ProjectRepository {
  constructor(
    private sqlAI: SQLAIIntegration,
    private prisma: PrismaClient
  ) {}

  async findProjects(prompt: string): Promise<Project[]> {
    // Генерация оптимального SQL запроса
    const { sql, params } = await this.sqlAI.generateQuery(prompt);
    
    // Выполнение через Prisma
    return this.prisma.$queryRaw(sql, ...params);
  }

  async analyzeProjects(prompt: string): Promise<Analytics> {
    const { sql, explanation } = await this.sqlAI.generateQuery(prompt);
    const results = await this.prisma.$queryRaw(sql);
    
    return {
      data: results,
      explanation,
      visualization: generateVisualization(results)
    };
  }
}
```

### 6. Оптимизация производительности

```typescript
interface QueryOptimizer {
  // Анализ паттернов запросов
  analyzeQueryPatterns(): Promise<QueryPatterns>;

  // Рекомендации по индексам
  suggestIndexes(patterns: QueryPatterns): Promise<IndexSuggestions>;

  // Кэширование запросов
  cacheQuery(query: SQLQuery, result: any): Promise<void>;

  // Инвалидация кэша
  invalidateCache(tables: string[]): Promise<void>;
}

interface QueryPatterns {
  common_filters: Filter[];
  frequent_joins: Join[];
  heavy_queries: HeavyQuery[];
  optimization_suggestions: Suggestion[];
}
```

### 7. Безопасность и валидация

```typescript
interface SQLSecurityValidator {
  // Проверка безопасности запроса
  validateSecurity(query: SQLQuery): Promise<SecurityValidation>;

  // Анализ влияния на производительность
  analyzePerformanceImpact(query: SQLQuery): Promise<PerformanceImpact>;

  // Проверка прав доступа
  checkPermissions(query: SQLQuery, user: User): Promise<PermissionCheck>;
}

interface SecurityValidation {
  is_safe: boolean;
  potential_risks: Risk[];
  suggested_modifications: Modification[];
}
```

### 8. Примеры использования в компонентах

```typescript
// Компонент поиска проектов
const ProjectSearch: React.FC = () => {
  const [searchPrompt, setSearchPrompt] = useState('');
  const [results, setResults] = useState<Project[]>([]);

  const handleSearch = async () => {
    try {
      // Генерация и выполнение SQL запроса
      const projects = await projectRepository.findProjects(searchPrompt);
      
      // Отображение результатов
      setResults(projects);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  return (
    <div>
      <Input
        value={searchPrompt}
        onChange={(e) => setSearchPrompt(e.target.value)}
        placeholder="Опишите, какие проекты вы ищете..."
      />
      <Button onClick={handleSearch}>Поиск</Button>
      <ProjectList projects={results} />
    </div>
  );
};
```

Этот подход позволит нам:
1. Использовать мощь SQL для сложных запросов
2. Сохранить гибкость естественно-языкового интерфейса
3. Оптимизировать производительность запросов
4. Обеспечить безопасность и контроль доступа
5. Легко интегрировать с существующей архитектурой

Хотите, чтобы я детальнее расписал какой-то конкретный аспект этой интеграции? 

## Система ролей и безопасности

### 1. Роли пользователей

```typescript
enum UserRole {
  SUPER_ADMIN = 'super_admin',      // Полный доступ ко всем функциям
  DEVELOPER = 'developer',          // Застройщик
  AGENCY_ADMIN = 'agency_admin',    // Администратор агентства
  AGENT = 'agent',                  // Агент
  ANALYST = 'analyst',              // Аналитик
  MARKETING = 'marketing',          // Маркетолог
  VIEWER = 'viewer'                 // Просмотр ограниченной информации
}
```

### 2. Права доступа

```typescript
interface RolePermissions {
  // Проекты
  projects: {
    view: boolean;                  // Просмотр проектов
    edit: {                         // Редактирование проектов
      all: boolean;                 // Все проекты
      assigned: boolean;            // Назначенные проекты
      fields: string[];            // Доступные для редактирования поля
    };
    delete: boolean;                // Удаление проектов
    create: boolean;                // Создание проектов
    export: boolean;                // Экспорт данных
  };

  // SQL запросы
  sql: {
    execute: boolean;               // Выполнение SQL запросов
    tables: string[];              // Доступные таблицы
    operations: ('SELECT' | 'INSERT' | 'UPDATE' | 'DELETE')[];
  };

  // Аналитика
  analytics: {
    view: boolean;                  // Просмотр аналитики
    export: boolean;                // Экспорт отчетов
    create: boolean;                // Создание отчетов
  };

  // Агенты
  agents: {
    manage: boolean;                // Управление агентами
    view: boolean;                  // Просмотр информации об агентах
    assign: boolean;                // Назначение проектов агентам
  };
}
```

### 3. Контекст безопасности

```typescript
interface SecurityContext {
  organization: string;            // Организация пользователя
  project: string;                // Текущий проект
  timeRestrictions?: {            // Временные ограничения
    start: Date;
    end: Date;
  };
  ipRestrictions?: string[];      // Ограничения по IP
  dataClassification?: string[];  // Классификация данных
}
```

### 4. Архитектура системы безопасности

#### 4.1 Компоненты

```
src/
├── types/
│   └── security.ts               # Типы и интерфейсы безопасности
├── config/
│   └── rolePermissions.ts        # Конфигурация прав для ролей
├── lib/
│   └── security/
│       ├── SecurityValidator.ts   # Валидатор безопасности
│       └── SecurityAudit.ts      # Аудит безопасности
├── middleware/
│   └── securityMiddleware.ts     # Middleware для API
├── components/
│   └── security/
│       ├── RoleManager.tsx       # Управление ролями
│       └── SecurityAuditView.tsx # Просмотр аудита
└── app/
    └── api/
        └── security/
            ├── route.ts          # Основной API endpoint
            └── permissions/      # API для управления правами
                └── route.ts
```

#### 4.2 Процесс проверки доступа

1. **Валидация запроса**:
   ```typescript
   const validation = await validator.validateAccess(
     user,
     action,
     resource,
     context
   );
   ```

2. **Проверка контекста**:
   - Организация
   - Проект
   - Временные ограничения
   - IP ограничения

3. **Проверка полей**:
   ```typescript
   const fieldAccess = await validator.validateFieldAccess(
     user,
     resource,
     fields
   );
   ```

### 5. Аудит безопасности

#### 5.1 Логирование действий

```typescript
interface AuditLog {
  id: string;
  timestamp: Date;
  user: {
    id: string;
    role: UserRole;
    name: string;
  };
  action: string;
  resource: string;
  context?: any;
  result: {
    success: boolean;
    error?: string;
  };
  metadata?: Record<string, any>;
}
```

#### 5.2 Алерты безопасности

```typescript
interface SecurityAlert {
  id: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  description: string;
  user?: {
    id: string;
    role: UserRole;
    name: string;
  };
  metadata?: Record<string, any>;
}
```

#### 5.3 Мониторинг

1. **Частота действий**:
   - Отслеживание количества действий за период
   - Выявление аномальной активности

2. **Неудачные попытки**:
   - Мониторинг неудачных попыток доступа
   - Блокировка при превышении лимита

3. **Подозрительная активность**:
   - Действия в нерабочее время
   - Необычные паттерны использования
   - Критические операции

### 6. API Endpoints

#### 6.1 Проверка доступа
```typescript
POST /api/security
{
  action: string;
  resource: string;
  context?: any;
}
```

#### 6.2 Управление правами
```typescript
GET /api/security/permissions/{role}
PUT /api/security/permissions
{
  role: UserRole;
  permissions: RolePermissions;
}
```

### 7. Пользовательский интерфейс

#### 7.1 Управление ролями
- Выбор роли
- Настройка прав доступа
- Управление полями и ресурсами

#### 7.2 Аудит безопасности
- Просмотр логов
- Анализ алертов
- Статистика и отчеты

### 8. Безопасность SQL запросов

#### 8.1 Валидация
- Проверка прав на выполнение
- Валидация используемых таблиц
- Проверка типов операций

#### 8.2 Ограничения
- Доступ только к разрешенным таблицам
- Ограничение типов операций
- Контроль сложности запросов

### 9. План внедрения

1. **Фаза 1: Базовая безопасность**
   - ✅ Типы и интерфейсы
   - ✅ Валидатор безопасности
   - ✅ Middleware для API

2. **Фаза 2: Управление правами**
   - ✅ Конфигурация ролей
   - ✅ API для управления правами
   - ✅ UI для управления ролями

3. **Фаза 3: Аудит и мониторинг**
   - ✅ Система логирования
   - ✅ Анализ безопасности
   - ✅ UI для просмотра аудита

4. **Фаза 4: SQL безопасность**
   - ✅ Валидация запросов
   - ✅ Ограничения доступа
   - ✅ Мониторинг выполнения

### 10. Тестирование

```typescript
describe('SecurityValidator', () => {
  // Тесты валидации доступа
  it('should allow super admin full access', async () => {
    const result = await validator.validateAccess(
      mockUser,
      'edit',
      'projects'
    );
    expect(result.isValid).toBe(true);
  });

  // Тесты проверки полей
  it('should restrict fields for regular users', async () => {
    const result = await validator.validateFieldAccess(
      regularUser,
      'projects',
      fields
    );
    expect(result.allowedFields).toContain('agent_notes');
    expect(result.deniedFields).toContain('price');
  });
});
```

## Vector Search Implementation

### Overview
The AI Assistant uses DeepSeek embeddings for semantic search capabilities, allowing more intelligent and context-aware project search functionality.

### Architecture

#### 1. Data Storage
```prisma
model ProjectEmbedding {
  id          String   @id @default(cuid())
  projectId   String   @unique
  embedding   Bytes    // Vector representation
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  project     Project  @relation(fields: [projectId], references: [id])
}
```

#### 2. Core Components

##### EmbeddingService
- Purpose: Manages generation and search of embeddings
- Location: `src/lib/ai/embeddings.ts`
- Key methods:
  - `generateEmbedding(text: string): Promise<number[]>`
  - `updateProjectEmbedding(project: Project): Promise<void>`
  - `searchSimilar(query: string, limit?: number): Promise<Project[]>`

##### DeepSeekAI
- Purpose: Handles communication with DeepSeek API
- Location: `src/lib/ai/deepseek.ts`
- Key features:
  - Embedding generation
  - Text processing
  - Project search

#### 3. Implementation Flow

1. **Embedding Generation**
   - Combine project text fields (name, description, translations)
   - Send to DeepSeek API for embedding generation
   - Store in PostgreSQL as binary data

2. **Search Process**
   - Convert search query to embedding
   - Use cosine similarity for comparison
   - Return most similar projects

3. **Integration Points**
   - Project creation/update triggers embedding update
   - Search queries use both keyword and semantic search
   - Results combine traditional and vector search scores

### Usage Examples

```typescript
// Generate embedding for a project
await embeddingService.updateProjectEmbedding(project);

// Search similar projects
const results = await embeddingService.searchSimilar("luxury villa near beach", 5);
```

### Prompts Structure

```typescript
const projectSearchPrompts = {
  system: `AI assistant for real estate search...`,
  embedding: `Generate embedding focusing on real estate details...`,
  searchQuery: `Extract search parameters in JSON format...`
};
```

### Future Improvements

1. **Performance Optimization**
   - Implement caching for frequently accessed embeddings
   - Batch processing for multiple projects
   - Index optimization for vector operations

2. **Search Enhancement**
   - Hybrid search combining vector and keyword approaches
   - Weighted scoring based on multiple factors
   - Multi-language support for embeddings

3. **Feature Extensions**
   - Similar project recommendations
   - Project clustering by similarity
   - Automated tagging based on embeddings

### Development Guidelines

1. **Embedding Updates**
   - Generate embeddings asynchronously
   - Update on significant content changes
   - Include all relevant text fields

2. **Search Implementation**
   - Use appropriate vector similarity metrics
   - Consider performance implications
   - Handle edge cases and errors

3. **Testing**
   - Unit tests for embedding generation
   - Integration tests for search functionality
   - Performance benchmarks

### API Integration

```typescript
// Example API endpoint
POST /api/ai/search
{
  "query": "string",
  "limit": number,
  "filters": {
    "location": string,
    "priceRange": [min, max],
    "type": string
  }
}
```

### Security Considerations

1. **Access Control**
   - Validate user permissions
   - Rate limit embedding generation
   - Secure storage of embeddings

2. **Data Protection**
   - Sanitize input for embedding generation
   - Validate vector data integrity
   - Monitor API usage

### Monitoring and Maintenance

1. **Performance Metrics**
   - Embedding generation time
   - Search response time
   - Storage usage

2. **Error Handling**
   - API failures
   - Invalid embeddings
   - Database issues

3. **Updates**
   - Regular model updates
   - Schema migrations
   - API version management
```

### Сравнение подходов к поиску

#### Текущий подход (без векторной базы)

1. **Принцип работы**
   - Точное совпадение слов или частей слов
   - Поиск по конкретным полям (название, описание, местоположение)
   - Использование простых фильтров (цена, тип недвижимости)

2. **Ограничения**
   - Не понимает контекст и синонимы
   - Требует точного совпадения слов
   - Чувствителен к опечаткам
   - Не работает с похожими по смыслу запросами
   - Сложно найти "похожие" проекты

3. **Примеры запросов, где текущий поиск неэффективен**
   ```
   "Современный проект рядом с морем" - не найдет проекты с описанием "новый комплекс на берегу"
   "Инвестиционная недвижимость" - не найдет проекты с хорошей доходностью, если явно не указано слово "инвестиционный"
   "Проект как X" - не может найти похожие на указанный проект
   ```

#### Векторный поиск

1. **Принцип работы**
   - Преобразование текста в многомерные векторы (embeddings)
   - Поиск по семантической близости
   - Использование машинного обучения для понимания контекста

2. **Преимущества**
   - Понимает смысл и контекст запроса
   - Находит семантически похожие проекты
   - Работает с синонимами и близкими по смыслу словами
   - Устойчив к опечаткам и разным формулировкам
   - Поддерживает поиск "похожих" проектов

3. **Примеры улучшенных возможностей**
   ```
   "Современный проект рядом с морем" -> найдет:
   - "Новый комплекс на берегу"
   - "Премиальные апартаменты с видом на океан"
   - "Стильный ЖК в пешей доступности от пляжа"

   "Инвестиционная недвижимость" -> найдет проекты:
   - С высокой доходностью
   - В развивающихся районах
   - С потенциалом роста стоимости
   - С программами гарантированной аренды

   "Проект как X" -> найдет проекты:
   - С похожими характеристиками
   - В аналогичной локации
   - С близкой ценовой категорией
   ```

4. **Гибридный подход**
   - Комбинация векторного и традиционного поиска
   - Использование фильтров (цена, локация) вместе с семантическим поиском
   - Ранжирование результатов по релевантности

5. **Технические особенности**
   - Хранение векторов в PostgreSQL с использованием pgvector
   - Размер вектора: 1536 измерений (DeepSeek embedding)
   - Использование косинусного сходства для поиска
   - Индексация векторов для быстрого поиска

6. **Примеры использования**

```typescript
// Традиционный поиск
const results = await prisma.project.findMany({
  where: {
    OR: [
      { name: { contains: searchQuery } },
      { description: { contains: searchQuery } }
    ]
  }
});

// Векторный поиск
const embedding = await generateEmbedding(searchQuery);
const results = await prisma.$queryRaw`
  SELECT *, 
    1 - (embedding <=> ${embedding}::vector) as similarity 
  FROM projects 
  ORDER BY similarity DESC 
  LIMIT 10
`;

// Гибридный поиск
const embedding = await generateEmbedding(searchQuery);
const results = await prisma.$queryRaw`
  SELECT *,
    1 - (embedding <=> ${embedding}::vector) as semantic_score,
    ts_rank(to_tsvector(name || ' ' || description), to_tsquery(${searchQuery})) as text_score
  FROM projects
  WHERE price BETWEEN ${minPrice} AND ${maxPrice}
  ORDER BY (semantic_score * 0.7 + text_score * 0.3) DESC
  LIMIT 10
`;
```

7. **Производительность**
   - Традиционный поиск: O(n) по количеству записей
   - Векторный поиск с индексом: O(log n)
   - Дополнительное место: ~12KB на проект (вектор 1536 float)
```

### Векторизация данных

#### Основные поля для векторизации

1. **Информация о проекте**
   - Название проекта (name)
   - Описание (description)
   - Переводы (translations)
     - Названия на разных языках
     - Описания на разных языках
   - Тип проекта (type)
   - Статус строительства (constructionStatus)

2. **Локация**
   - Город (location.city)
   - Район (location.district)
   - Адрес (location.address)
   - Описание местоположения из переводов

3. **Характеристики**
   - Типы недвижимости (propertyTypes)
     - Количество спален
     - Площади
   - Удобства (amenities)
     - Названия удобств
     - Описания удобств
   - Инфраструктура
     - Общая площадь (totalLandArea)
     - Количество зданий (totalBuildings)
     - Количество юнитов (totalUnits)

4. **Инвестиционные параметры**
   - Информация о доходности (yield)
   - Условия покупки (purchaseConditions)
   - Планы оплаты (paymentPlans)

5. **Информация о застройщике**
   - Название застройщика (developer.name)
   - Описание застройщика (developer.description)
   - Переводы информации о застройщике

#### Пример комбинирования данных для векторизации

```typescript
const getProjectTextForEmbedding = (project: Project): string => {
  return [
    // Основная информация
    project.name,
    project.description,
    project.type,
    project.constructionStatus,
    
    // Переводы
    ...project.translations.map(t => `${t.name} ${t.description}`),
    
    // Локация
    project.location?.city,
    project.location?.district,
    project.location?.address,
    
    // Характеристики
    ...project.propertyTypes.map(pt => 
      `${pt.bedrooms} bedrooms, ${pt.area}m2`
    ),
    ...project.amenities.map(a => a.amenity.name),
    
    // Инвестиционная информация
    project.purchaseConditions,
    project.yield?.description,
    
    // Информация о застройщике
    project.developer?.name,
    project.developer?.description,
    ...project.developer?.translations.map(t => 
      `${t.name} ${t.description}`
    )
  ]
  .filter(Boolean) // Удаляем null/undefined значения
  .join(' ');
};
```

#### Особенности векторизации

1. **Приоритизация полей**
   - Название и описание имеют больший вес
   - Локация и характеристики - средний вес
   - Дополнительная информация - меньший вес

2. **Обработка текста**
   - Удаление специальных символов
   - Нормализация пробелов
   - Сохранение важных числовых значений

3. **Многоязычность**
   - Векторизация всех языковых версий
   - Сохранение контекста перевода
   - Поддержка поиска на разных языках

4. **Обновление векторов**
   ```typescript
   // Триггеры обновления
   - При создании проекта
   - При обновлении основных полей
   - При изменении переводов
   - При обновлении характеристик
   ```

5. **Оптимизация хранения**
   - Сжатие векторов
   - Индексация для быстрого поиска
   - Кэширование часто используемых векторов