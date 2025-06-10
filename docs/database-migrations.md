# Безопасное обновление схемы базы данных

## Алгоритм безопасного обновления схемы с сохранением данных

### 1. Подготовка
1. Сделать бэкап базы данных
```bash
pg_dump homio > backup_$(date +%Y%m%d_%H%M%S).dump
```

2. Проверить текущее состояние таблиц
```bash
psql homio -c "\d \"TableName\""
```

### 2. Создание базовой миграции
1. Очистить директорию миграций (если есть)
```bash
rm -rf prisma/migrations/*
```

2. Создать директорию для базовой миграции
```bash
mkdir -p prisma/migrations/0_init
```

3. Сохранить текущую схему как базовую миграцию
```bash
pg_dump --schema-only homio > prisma/migrations/0_init/migration.sql
```

4. Отметить базовую миграцию как примененную
```bash
npx prisma migrate resolve --applied 0_init
```

### 3. Синхронизация Prisma Schema
1. Обновить schema.prisma в соответствии с базой данных
```bash
npx prisma db pull
```

2. Сгенерировать Prisma Client
```bash
npx prisma generate
```

### 4. Проверка
1. Проверить статус миграций
```bash
npx prisma migrate status
```

2. Убедиться, что:
   - База данных содержит все необходимые изменения
   - Миграции синхронизированы
   - Schema.prisma соответствует структуре базы данных
   - Prisma Client успешно сгенерирован

## Важные замечания

1. **Безопасность данных**:
   - Всегда делайте бэкап перед изменением схемы
   - Проверяйте структуру таблиц до и после изменений
   - Используйте условные операторы в SQL для безопасного добавления/изменения полей

2. **Работа с миграциями**:
   - Базовая миграция (0_init) должна отражать текущее состояние базы
   - Избегайте прямого редактирования примененных миграций
   - Всегда проверяйте статус миграций после изменений

3. **Решение проблем**:
   - Если миграция не применяется, проверьте существующую структуру таблиц
   - При конфликтах используйте условные операторы в SQL
   - В случае ошибок можно восстановить базу из бэкапа и повторить процесс

## Пример SQL для безопасных изменений

```sql
-- Безопасное добавление колонки
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'TableName' AND column_name = 'new_column'
    ) THEN
        ALTER TABLE "TableName" ADD COLUMN "new_column" TEXT NOT NULL DEFAULT '';
    END IF;
END $$;

-- Безопасное добавление индекса
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'TableName' AND indexname = 'index_name'
    ) THEN
        CREATE INDEX "index_name" ON "TableName"("column_name");
    END IF;
END $$;

-- Безопасное добавление ограничения
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'constraint_name'
    ) THEN
        ALTER TABLE "TableName" 
        ADD CONSTRAINT "constraint_name" 
        UNIQUE ("column_name");
    END IF;
END $$;
``` 