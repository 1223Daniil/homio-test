# План улучшений AI-ассистента

## 1. Обновление карточки проекта
- [ ] Вернуть дизайн карточки из коммита 69ddc6b
  - [ ] Обновить компонент AIProjectCard
  - [ ] Добавить секцию "Почему этот вариант подходит"
  - [ ] Добавить теги особенностей проекта
  - [ ] Улучшить отображение локации и деталей
  - [ ] Добавить секцию "Локация" с тегами удобств

### Технические детали:
1. Файлы для обновления:
   - `src/components/ai/AIProjectCard.tsx`
   - `src/types/project.ts` (добавить новые типы для расширенной информации)
   - `src/styles/components/ai-project-card.css` (новые стили)

2. Компоненты для создания:
   - `src/components/ai/ProjectFeaturesList.tsx` (список особенностей)
   - `src/components/ai/ProjectLocationInfo.tsx` (информация о локации)
   - `src/components/ai/ProjectAmenities.tsx` (удобства проекта)

3. Изменения в API:
   - Обновить `src/app/api/ai/chat/route.ts` для включения расширенной информации
   - Добавить новые поля в ответ API

## 2. Оптимизация аватара
- [ ] Предотвратить повторную инициализацию аватара
- [ ] Оставить только одну версию аватара наверху страницы
- [ ] Изменить настройки стриминга на 480p
- [ ] Сменить модель аватара на "Dexter_Lawyer_Sitting_public"
- [ ] Добавить кнопку изменения размера аватара (2x zoom)
  - [ ] Реализовать плавную анимацию изменения размера
  - [ ] Сохранять состояние размера

### Технические детали:
1. Файлы для обновления:
   - `src/components/ai/AvatarStream.tsx`
   - `src/lib/ai/avatar.ts`
   - `src/config/ai.ts`

2. Новые компоненты:
   - `src/components/ai/AvatarControls.tsx` (кнопки управления)
   - `src/components/ai/AvatarContainer.tsx` (контейнер с состоянием размера)

3. Изменения в конфигурации:
```typescript
// src/config/ai.ts
export const AVATAR_CONFIG = {
  model: "Dexter_Lawyer_Sitting_public",
  streamingQuality: {
    width: 854,
    height: 480,
    frameRate: 30,
    bitrate: 1000000 // 1 Mbps
  },
  zoomLevels: {
    normal: 1,
    expanded: 2
  }
};
```

## 3. Улучшение интерфейса чата
- [ ] Восстановить стартовый экран чата
- [ ] Улучшить поле ввода
  - [ ] Добавить эффект подсветки при фокусе
  - [ ] Добавить плавную анимацию
- [ ] Реализовать плавное появление сообщений
  - [ ] Добавить анимацию fade-in для новых сообщений
  - [ ] Реализовать прокрутку к новым сообщениям

### Технические детали:
1. Файлы для обновления:
   - `src/components/ai/AIAssistant.tsx`
   - `src/styles/components/ai-chat.css`

2. Новые компоненты:
   - `src/components/ai/ChatWelcomeScreen.tsx`
   - `src/components/ai/ChatInput.tsx`
   - `src/components/ai/ChatMessage.tsx`

3. Анимации:
```css
/* src/styles/components/ai-chat.css */
.message-enter {
  opacity: 0;
  transform: translateY(20px);
}
.message-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 300ms, transform 300ms;
}
.input-focus {
  box-shadow: 0 0 0 2px var(--primary-color);
  transition: box-shadow 200ms ease;
}
```

## 4. Асинхронное появление проектов
- [ ] Реализовать поочередное появление карточек проектов
- [ ] Добавить анимацию появления для каждой карточки
- [ ] Оптимизировать загрузку изображений проектов

### Технические детали:
1. Файлы для обновления:
   - `src/components/ai/ProjectList.tsx`
   - `src/hooks/useAsyncRender.ts`

2. Новый хук:
```typescript
// src/hooks/useAsyncRender.ts
export function useAsyncRender<T>(
  items: T[],
  delay: number = 200
): [T[], boolean] {
  const [renderedItems, setRenderedItems] = useState<T[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let timeouts: NodeJS.Timeout[] = [];
    
    items.forEach((item, index) => {
      const timeout = setTimeout(() => {
        setRenderedItems(prev => [...prev, item]);
        if (index === items.length - 1) setIsComplete(true);
      }, delay * index);
      
      timeouts.push(timeout);
    });

    return () => timeouts.forEach(clearTimeout);
  }, [items, delay]);

  return [renderedItems, isComplete];
}
```

## 5. Умный переход в карточку проекта
- [ ] Создать промежуточный экран с расширенной информацией
  - [ ] Добавить дополнительные детали о проекте
  - [ ] Показывать больше фотографий
  - [ ] Отображать полное описание удобств
- [ ] Реализовать плавный переход между состояниями
- [ ] Починить навигацию на страницу проекта

### Технические детали:
1. Новые компоненты:
   - `src/components/ai/ProjectDetailsModal.tsx`
   - `src/components/ai/ProjectGallery.tsx`
   - `src/components/ai/ProjectFullInfo.tsx`

2. Файлы для обновления:
   - `src/app/projects/[id]/page.tsx`
   - `src/lib/projects.ts`

3. Новые хуки:
```typescript
// src/hooks/useProjectTransition.ts
export function useProjectTransition(project: Project) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFullDetails, setShowFullDetails] = useState(false);

  // Логика перехода
}
```

## 6. Оптимизация производительности
- [ ] Оптимизировать загрузку ресурсов
- [ ] Реализовать кэширование данных проектов
- [ ] Улучшить обработку состояний загрузки

### Технические детали:
1. Новые утилиты:
   - `src/lib/cache.ts` (кэширование данных)
   - `src/lib/performance.ts` (мониторинг производительности)

2. Файлы для обновления:
   - `src/lib/api.ts` (оптимизация запросов)
   - `next.config.js` (настройки оптимизации)

3. Кэширование:
```typescript
// src/lib/cache.ts
export const projectsCache = new Map<string, Project>();
export const searchResultsCache = new Map<string, SearchResult>();
```

## 7. Улучшение озвучивания контента
- [ ] Восстановить поэтапное озвучивание
  - [ ] Вступление
  - [ ] Описание каждого проекта
  - [ ] Итоговое резюме
- [ ] Синхронизировать анимации аватара с речью
- [ ] Добавить управление воспроизведением

### Технические детали:
1. Файлы для обновления:
   - `src/lib/ai/speech.ts`
   - `src/components/ai/AvatarStream.tsx`

2. Новые компоненты:
   - `src/components/ai/SpeechController.tsx`
   - `src/components/ai/SpeechQueue.tsx`

3. Очередь озвучивания:
```typescript
// src/lib/ai/speech.ts
export class SpeechQueue {
  private queue: SpeechSegment[] = [];
  private currentSegment: SpeechSegment | null = null;

  async addToQueue(segment: SpeechSegment) {
    this.queue.push(segment);
    if (!this.currentSegment) {
      await this.processNext();
    }
  }

  private async processNext() {
    if (this.queue.length === 0) return;
    
    this.currentSegment = this.queue.shift()!;
    await this.speak(this.currentSegment);
    this.currentSegment = null;
    
    await this.processNext();
  }
}
```

## Дополнительные технические заметки:

### Управление состоянием:
```typescript
// src/store/ai-assistant.ts
interface AIAssistantState {
  avatar: {
    isInitialized: boolean;
    size: 'normal' | 'expanded';
    isSpeaking: boolean;
  };
  chat: {
    messages: Message[];
    isLoading: boolean;
    error: string | null;
  };
  projects: {
    items: Project[];
    renderedCount: number;
    selectedId: string | null;
  };
}
```

### Обработка ошибок:
```typescript
// src/lib/error-handling.ts
export class AIAssistantError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: any
  ) {
    super(message);
    this.name = 'AIAssistantError';
  }
}

export function handleAIError(error: unknown) {
  // Логика обработки ошибок
}
```

### Метрики производительности:
```typescript
// src/lib/performance.ts
export function trackMetrics() {
  const metrics = {
    ttfb: performance.now(),
    fcp: 0,
    lcp: 0
  };

  // Логика отслеживания метрик
}
```

### CSS переменные:
```css
/* src/styles/variables.css */
:root {
  --avatar-transition-duration: 300ms;
  --message-animation-duration: 200ms;
  --card-hover-transform: scale(1.02);
  --card-transition: transform 200ms ease;
}
```

## Приоритеты реализации:
1. Обновление карточки проекта и починка навигации
2. Оптимизация аватара и стриминга
3. Улучшение интерфейса чата
4. Реализация умного перехода
5. Асинхронное появление проектов
6. Оптимизация производительности
7. Улучшение озвучивания

## Технические заметки:
- Использовать CSS transitions для плавных анимаций
- Реализовать lazy loading для изображений
- Оптимизировать запросы к API
- Использовать кэширование для улучшения производительности
- Реализовать обработку ошибок и fallback состояния 