shows list of existing roles

```bash
\du
```

`\du` hides system roles by default
or

```sql
SELECT rolname FROM pg_roles; -- Этот запрос вернет только имена ролей

SELECT rolname, rolsuper, rolcreaterole, rolcreatedb, rolcanlogin FROM pg_roles; -- Этот запрос покажет, является ли роль суперпользователем (`rolsuper`), может ли создавать другие роли (`rolcreaterole`), базы данных (`rolcreatedb`), и может ли логиниться (`rolcanlogin`

```