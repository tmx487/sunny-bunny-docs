#〽️visualise
- https://explain.dalibo.com/
- https://explain.depesz.com/

- **ANALYZE** — выполняет запрос и показывает фактическое время, количество строк и другую статистику вместо оценок:

```sql
EXPLAIN ANALYZE SELECT * FROM users WHERE country = 'USA';
```
    
- **VERBOSE** — показывает дополнительную информацию, включая полный список выходных столбцов для каждой ноды плана:
 
```sql
EXPLAIN (ANALYZE, VERBOSE) SELECT * FROM users JOIN orders USING (user_id);
```
    
- **COSTS** — отображает оценки стоимости (значение по умолчанию — TRUE):

```sql
EXPLAIN (COSTS FALSE) SELECT * FROM users;
```
    
- **BUFFERS** — показывает информацию об использовании буферов (чтения из кэша/диска):
  
```sql
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM large_table;
```
    
- **TIMING** — включает/выключает показ времени выполнения (по умолчанию TRUE):
 
```sql
EXPLAIN (ANALYZE, TIMING FALSE) SELECT * FROM users;
```
    
- **FORMAT** — определяет формат вывода. Доступны варианты: TEXT (по умолчанию), XML, JSON, YAML:

```sql
EXPLAIN (FORMAT JSON) SELECT * FROM users;
```
    
- **WAL** — показывает детали генерации WAL (Write-Ahead Log):

```sql
EXPLAIN (ANALYZE, WAL) INSERT INTO users VALUES (1, 'John');
```
    
- **SETTINGS** — отображает измененные параметры оптимизатора:

```sql
EXPLAIN (SETTINGS ON) SELECT * FROM users;
```