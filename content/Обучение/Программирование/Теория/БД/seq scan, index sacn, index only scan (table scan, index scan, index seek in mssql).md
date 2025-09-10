## 1. Sequential Scan (Table Scan)

**Принцип:** Последовательное чтение всех страниц таблицы от начала до конца.

```sql
-- Пример: нет индекса на поле name
EXPLAIN ANALYZE SELECT * FROM users WHERE name = 'John';
```

**Результат:**

```
Seq Scan on users (cost=0.00..18584.00 rows=5 width=64) 
                  (actual time=0.234..156.789 rows=3 loops=1)
  Filter: (name = 'John'::text)
  Rows Removed by Filter: 99997
```

### Характеристики:

- **Читает все строки** подряд, даже ненужные
- **O(n)** сложность - время растет линейно
- **Много I/O операций** для больших таблиц
- **Эффективен** только для маленьких таблиц или когда нужно много строк

## 2. Index Scan

**Принцип:** Использует индекс для поиска, но может читать строки в произвольном порядке.

```sql
-- Создаем индекс
CREATE INDEX idx_users_age ON users(age);

-- Запрос с диапазоном
EXPLAIN ANALYZE SELECT * FROM users WHERE age BETWEEN 25 AND 35;
```

**Результат:**

```
Index Scan using idx_users_age on users (cost=0.29..456.78 rows=2500 width=64)
                                        (actual time=0.045..12.345 rows=2489 loops=1)
  Index Cond: (age >= 25 AND age <= 35)
```

### Как работает:

1. **Сканирует индекс** для поиска подходящих записей
2. **Для каждой найденной записи** идет в таблицу за полными данными
3. **Может потребовать случайного I/O** если строки разбросаны по диску

### Когда используется:

- Диапазоны значений (`BETWEEN`, `>`, `<`)
- Множественные значения (`IN`)
- Когда нужны дополнительные колонки из таблицы

## 3. Index Only Scan (аналог Index Seek)

**Принцип:** Все нужные данные находятся в самом индексе, обращение к таблице не требуется.

```sql
-- Создаем covering индекс
CREATE INDEX idx_users_age_name ON users(age, name);

-- Запрос использует только колонки из индекса
EXPLAIN ANALYZE SELECT age, name FROM users WHERE age = 30;
```

**Результат:**

```
Index Only Scan using idx_users_age_name on users (cost=0.29..8.45 rows=5 width=36)
                                                  (actual time=0.012..0.034 rows=5 loops=1)
  Index Cond: (age = 30)
  Heap Fetches: 0
```

### Ключевые особенности:

- **Heap Fetches: 0** - не обращался к таблице
- **Самый быстрый** тип сканирования
- **Минимальный I/O** - только чтение индекса
- **Требует covering индекс** - все нужные колонки в индексе

## 4. Bitmap Index Scan + Bitmap Heap Scan

**Принцип:** Гибридный подход для больших наборов данных.

```sql
EXPLAIN ANALYZE SELECT * FROM users WHERE age IN (25, 30, 35);
```

**Результат:**

```
Bitmap Heap Scan on users (cost=45.67..1234.56 rows=800 width=64)
  Recheck Cond: (age = ANY ('{25,30,35}'::integer[]))
  Heap Blocks: exact=156
  -> Bitmap Index Scan on idx_users_age (cost=0.00..45.47 rows=800 width=0)
       Index Cond: (age = ANY ('{25,30,35}'::integer[]))
```

### Как работает:

1. **Bitmap Index Scan** создает битовую карту страниц
2. **Bitmap Heap Scan** читает только нужные страницы
3. **Оптимизирует I/O** - группирует чтения по страницам

## Сравнительная таблица:

|Тип сканирования|Использование индекса|Обращение к таблице|Производительность|Случаи использования|
|---|---|---|---|---|
|**Sequential Scan**|Нет|Все строки|O(n)|Нет индекса, нужно много строк|
|**Index Scan**|Да|Для каждой строки|O(log n + k)|Диапазоны, множественные значения|
|**Index Only Scan**|Да|Нет|O(log n)|Covering индекс, все данные в индексе|
|**Bitmap Scan**|Да|Группами по страницам|O(log n + p)|Большие наборы, множественные условия|

## Практические примеры:

### Оптимизация запросов:

```sql
-- Медленно: Sequential Scan
SELECT id, name, email FROM users WHERE department = 'IT';

-- Быстрее: Index Scan
CREATE INDEX idx_users_department ON users(department);

-- Еще быстрее: Index Only Scan
CREATE INDEX idx_users_dept_covering ON users(department, id, name, email);
```

### Анализ производительности:

```sql
-- Смотрим какой тип сканирования используется
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM users WHERE age = 30;

-- Если видим Sequential Scan - нужен индекс
-- Если Index Scan с высоким cost - возможно нужен covering индекс
-- Если Index Only Scan - отлично!
```

## Ключевые различия с SQL Server:

В **SQL Server** термин **"Index Seek"** соответствует **"Index Only Scan"** в PostgreSQL - прямому поиску в индексе без обращения к таблице.

**PostgreSQL** более детально разделяет типы сканирования и показывает точно, происходит ли обращение к heap (таблице) или нет.