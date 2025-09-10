
```bash
\dt # show tables from public

\dt *.* # show tables from all schemas
```

or

```sql
-- Этот запрос вернет таблицы, принадлежащие схеме `public`. Если нужно посмотреть таблицы в другой схеме, замени `'public'` на имя нужной схемы
SELECT table_name 
FROM information_schema.tables
WHERE table_schema = 'public';
```