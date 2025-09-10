## **ChatGPT**
### 1. **`ARRAY`** — массивы

Позволяет хранить массив значений в одной ячейке.

```sql
CREATE TABLE tags (
  id SERIAL,
  keywords TEXT[]
);
```

```sql
INSERT INTO tags (keywords) VALUES (ARRAY['postgres', 'sql', 'mvcc']);
```

---

### 2. **`JSON` / `JSONB`** — встроенная поддержка JSON

- `JSON` — хранит текст как есть (медленнее, но точный формат)
    
- `JSONB` — бинарный формат (быстрее, можно индексировать)
    

```sql
CREATE TABLE products (
  id SERIAL,
  data JSONB
);
```

```sql
INSERT INTO products (data) VALUES ('{"name": "Laptop", "price": 1000}');
```

---

### 3. **`HSTORE`** — ключ-значение (типа словаря)

Оптимально для хранения неструктурированных данных:

```sql
CREATE TABLE settings (
  user_id INT,
  config HSTORE
);
```

```sql
INSERT INTO settings VALUES (1, 'theme => dark, lang => en');
```

---

### 4. **`RANGE` типы** — диапазоны

Поддержка диапазонов чисел, дат и времени:

```sql
CREATE TABLE bookings (
  room_id INT,
  period DATERANGE
);
```

```sql
INSERT INTO bookings VALUES (1, '[2024-01-01, 2024-01-10)');
```

---

### 5. **`ENUM`** — пользовательские перечисления

```sql
CREATE TYPE mood AS ENUM ('happy', 'sad', 'neutral');
```

```sql
CREATE TABLE people (
  name TEXT,
  current_mood mood
);
```

---

### 6. **`CIDR`, `INET`, `MACADDR`** — работа с IP-адресами

```sql
CREATE TABLE servers (
  ip INET,
  mac MACADDR
);
```

---

### 7. **`UUID`** — встроенный тип для хранения UUID

```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid()
);
```

---

### 8. **`TSVECTOR`, `TSQUERY`** — полнотекстовый поиск

Используется для поиска по тексту:

```sql
SELECT to_tsvector('english', 'PostgreSQL is a powerful DBMS');
```

---

### 9. **`GEOMETRY` / `GEOGRAPHY` (через PostGIS)** — геоданные

Если установлен PostGIS — можно хранить точки, полигоны и т.п.:

```sql
CREATE TABLE locations (
  id SERIAL,
  geom GEOGRAPHY(POINT)
);
```

---

### ✅ Почему это важно:

- Меньше джойнов и вспомогательных таблиц (можно вложить данные в `JSONB` или `ARRAY`)
    
- Удобство и читаемость (например, `RANGE` вместо пары `start_date`, `end_date`)
    
- Индексация по сложным типам (`GIN`, `GiST` для `JSONB`, `RANGE`, `HSTORE`, `TSVECTOR`)
    
- Гибкость для API, NoSQL-стилей, географических приложений, логов и др.


## **Claude**

### Геометрические типы данных

- **point** - точка на плоскости `(x,y)`
- **line** - бесконечная прямая
- **lseg** - отрезок линии
- **box** - прямоугольник
- **path** - открытый и закрытый путь
- **polygon** - многоугольник
- **circle** - круг

### Сетевые типы данных

- **cidr** - сеть IPv4 или IPv6
- **inet** - хост IPv4 или IPv6 и необязательная маска подсети
- **macaddr** - MAC-адрес
- **macaddr8** - MAC-адрес в формате EUI-64

### JSON типы

- **json** - текстовое хранение JSON
- **jsonb** - бинарное хранение JSON с индексированием и оптимизацией запросов

### XML

- **xml** - хранение XML-данных с проверкой синтаксиса

### Массивы

- Массивы любого типа данных: `integer[]`, `text[]`, etc.
- Многомерные массивы: `integer[][]`

### Диапазоны

- **int4range** - диапазон целых чисел
- **int8range** - диапазон больших целых чисел
- **numrange** - диапазон числовых значений
- **tsrange** - диапазон timestamp без часового пояса
- **tstzrange** - диапазон timestamp с часовым поясом
- **daterange** - диапазон дат

### Текстовый поиск

- **tsvector** - оптимизированный документ для полнотекстового поиска
- **tsquery** - запрос полнотекстового поиска

### UUID

- **uuid** - универсальный уникальный идентификатор

### Денежный тип

- **money** - денежная сумма с фиксированной точностью

### Составные типы

- Пользовательские типы, определенные с помощью `CREATE TYPE`

### Перечисления

- **enum** - пользовательский список строковых констант

### Для объектных и иерархических данных

- **ltree** - иерархические метки (древовидная структура)
- **hstore** - набор пар ключ-значение

### Типы для полнотекстового поиска

- **regconfig** - конфигурация текстового поиска
- **regdictionary** - словарь текстового поиска

### Идентификаторы объектов базы данных

- **regclass**, **regproc**, **regtype** и другие - ссылки на объекты БД

### Временные типы (расширенные)

- Высокоточное время: **interval** с расширенными возможностями
- **timestamptz** с лучшей поддержкой часовых поясов

### Примеры использования

```sql
-- JSON
SELECT '{"name": "Иван", "age": 30}'::jsonb -> 'name';

-- Массивы
CREATE TABLE teams (
    id serial PRIMARY KEY,
    name text,
    members text[]
);
INSERT INTO teams (name, members) VALUES ('Разработчики', '{"Иван", "Мария", "Алексей"}');

-- Диапазоны
CREATE TABLE reservations (
    id serial PRIMARY KEY,
    room_id integer,
    period daterange
);
INSERT INTO reservations (room_id, period) VALUES (1, '[2025-05-01, 2025-05-15)');
SELECT * FROM reservations WHERE period @> '2025-05-10'::date;

-- Геометрические типы
SELECT point '(1,2)' <-> point '(5,6)' AS distance;
```

Эти типы данных делают PostgreSQL особенно мощным для специализированных приложений, таких как ГИС (геоинформационные системы), приложения с JSON-документами или сложными временными расчетами.