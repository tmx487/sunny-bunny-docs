### **Основная проблема PostgreSQL:**

PostgreSQL использует **MVCC (Multi-Version Concurrency Control)** - при UPDATE/DELETE старые версии строк не удаляются сразу, а помечаются как "мертвые" (dead tuples).

```sql
-- Пример проблемы
CREATE TABLE users (id INT, name TEXT);
INSERT INTO users VALUES (1, 'John');

UPDATE users SET name = 'John Doe' WHERE id = 1;
-- Старая версия ('John') остается в таблице как dead tuple!

DELETE FROM users WHERE id = 1;
-- Обе версии остаются как dead tuples!
```

### **Что накапливается:**

- **Dead tuples** - устаревшие версии строк
- **Bloat** - неиспользуемое пространство
- **Фрагментация** индексов
- **Устаревшая статистика** для планировщика запросов

## **Виды VACUUM:**

### **1. VACUUM (обычный):**

```sql
-- Освобождает место внутри файлов, но не уменьшает размер файлов
VACUUM;                    -- Вся база
VACUUM table_name;         -- Конкретная таблица
VACUUM VERBOSE table_name; -- С подробным выводом
```

**Что делает:**

- Удаляет dead tuples
- Обновляет статистику (если не запускался ANALYZE)
- Освобождает место для повторного использования
- **НЕ блокирует** таблицу для чтения/записи

### **2. VACUUM FULL (полный):**

```sql
-- Полная перестройка таблицы, уменьшает физический размер файлов
VACUUM FULL table_name;
```

**Что делает:**

- Полностью перестраивает таблицу
- Возвращает освобожденное место операционной системе
- **БЛОКИРУЕТ** таблицу (эксклюзивная блокировка)
- Требует дополнительное место на диске (временно удваивает размер)

### **3. VACUUM ANALYZE:**

```sql
-- VACUUM + обновление статистики планировщика
VACUUM ANALYZE table_name;
```

## **Практические примеры:**

### **Мониторинг bloat:**

```sql
-- Проверка размера мертвых строк
SELECT 
    schemaname,
    tablename,
    n_dead_tup,
    n_live_tup,
    ROUND(n_dead_tup * 100.0 / NULLIF(n_live_tup + n_dead_tup, 0), 2) AS dead_percentage
FROM pg_stat_user_tables 
WHERE n_dead_tup > 0
ORDER BY dead_percentage DESC;

-- Размер таблиц
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(tablename::regclass)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename::regclass) DESC;
```

### **Когда нужен VACUUM:**

```sql
-- Проверка последнего VACUUM
SELECT 
    schemaname,
    tablename,
    last_vacuum,
    last_autovacuum,
    vacuum_count,
    autovacuum_count
FROM pg_stat_user_tables;
```

### **Настройка автовакуума:**

```sql
-- Посмотреть текущие настройки
SHOW autovacuum;
SHOW autovacuum_vacuum_threshold;
SHOW autovacuum_vacuum_scale_factor;

-- Настройка для конкретной таблицы
ALTER TABLE high_update_table SET (
    autovacuum_vacuum_threshold = 100,
    autovacuum_vacuum_scale_factor = 0.1,
    autovacuum_analyze_threshold = 50,
    autovacuum_analyze_scale_factor = 0.05
);
```

## **Автовакуум (Autovacuum):**

### **Как работает:**

```sql
-- Autovacuum запускается когда:
-- dead_tuples > autovacuum_vacuum_threshold + (autovacuum_vacuum_scale_factor * live_tuples)

-- По умолчанию:
-- autovacuum_vacuum_threshold = 50
-- autovacuum_vacuum_scale_factor = 0.2
-- Значит: dead_tuples > 50 + (0.2 * live_tuples)
```

### **Настройка в postgresql.conf:**

```bash
# Включение автовакуума
autovacuum = on

# Максимальное количество worker'ов
autovacuum_max_workers = 3

# Задержка между циклами
autovacuum_naptime = 1min

# Пороги для vacuum
autovacuum_vacuum_threshold = 50
autovacuum_vacuum_scale_factor = 0.2

# Пороги для analyze  
autovacuum_analyze_threshold = 50
autovacuum_analyze_scale_factor = 0.1
```

## **Практические сценарии:**

### **1. Регулярное обслуживание:**

```sql
-- Скрипт для ночного обслуживания
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT tablename 
        FROM pg_stat_user_tables 
        WHERE n_dead_tup > 1000
    LOOP
        EXECUTE 'VACUUM ANALYZE ' || r.tablename;
        RAISE NOTICE 'Vacuumed table: %', r.tablename;
    END LOOP;
END $$;
```

### **2. Мониторинг производительности:**

```sql
-- Таблицы, которым нужен VACUUM
SELECT 
    schemaname,
    tablename,
    n_dead_tup,
    n_live_tup,
    CASE WHEN n_live_tup > 0 
         THEN ROUND(n_dead_tup::numeric / n_live_tup * 100, 2) 
         ELSE 0 
    END AS dead_ratio,
    last_autovacuum
FROM pg_stat_user_tables
WHERE n_dead_tup > 100
ORDER BY dead_ratio DESC;
```

### **3. Проблемные случаи:**

```sql
-- Когда VACUUM FULL может понадобиться
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(tablename::regclass)) as total_size,
    n_dead_tup,
    n_live_tup
FROM pg_stat_user_tables 
WHERE n_dead_tup > n_live_tup  -- Больше мертвых чем живых строк
ORDER BY n_dead_tup DESC;
```

## **Рекомендации:**

### **✅ Лучшие практики:**

```sql
-- 1. Настраивайте autovacuum для высоконагруженных таблиц
ALTER TABLE orders SET (
    autovacuum_vacuum_scale_factor = 0.1,  -- Более частый vacuum
    autovacuum_analyze_scale_factor = 0.05
);

-- 2. Мониторьте bloat регулярно
-- 3. Используйте VACUUM FULL только в maintenance window
-- 4. Настраивайте vacuum_cost_limit для снижения нагрузки
```

### **❌ Чего избегать:**

```sql
-- Не отключайте autovacuum без крайней необходимости
-- Не запускайте VACUUM FULL на продакшене в рабочее время
-- Не игнорируйте предупреждения о transaction ID wraparound
```

## **Мониторинг через pgAdmin/SQL:**

```sql
-- Статистика vacuum операций
SELECT 
    schemaname,
    tablename,
    last_vacuum,
    last_autovacuum,
    vacuum_count,
    autovacuum_count,
    n_tup_ins + n_tup_upd + n_tup_del as total_operations
FROM pg_stat_user_tables
ORDER BY total_operations DESC;
```

**Итог:** VACUUM - это механизм очистки мертвых строк в PostgreSQL, критически важный для поддержания производительности базы данных при частых UPDATE/DELETE операциях.