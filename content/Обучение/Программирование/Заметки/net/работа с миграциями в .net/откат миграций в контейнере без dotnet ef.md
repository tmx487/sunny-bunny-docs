Да, откат миграций можно выполнить напрямую через SQL-запросы, без использования `dotnet ef`. Вот как это можно сделать:

### Подходы для отката миграций без `dotnet ef`

#### 1. **Ручное выполнение SQL-запросов**

1. **Подключитесь к контейнеру приложения или используйте `psql` для доступа к базе данных**:
    
    ```bash
    docker exec -it <container_name> bash
    ```
    
2. **Подключитесь к PostgreSQL**:
    
    ```bash
    psql -h <postgres_host> -U <username> -d <database_name>
    ```
    
    Например:
    
    ```bash
    psql -h postgresql -U contacts_sa -d contacts
    ```
    
3. **Откатите последнюю миграцию вручную**: Посмотрите последнюю примененную миграцию:
    
    ```sql
    SELECT * FROM "__EFMigrationsHistory";
    ```
    
    Удалите последнюю запись миграции:
    
    ```sql
    DELETE FROM "__EFMigrationsHistory" WHERE "MigrationId" = '<MigrationId>';
    ```
    
4. **Откат изменений в таблицах**: Используйте SQL-команды `ALTER TABLE`, `DROP TABLE`, или `DELETE`, чтобы вернуть базу данных в желаемое состояние. Пример:
    
    ```sql
    DROP TABLE "ExampleTable";
    ```
    

---

#### 2. **Автоматизация через скрипты**

Вы можете использовать SQL-скрипт для отката миграций и запускать его через контейнер с помощью `psql`:

1. Создайте файл `rollback.sql` с нужными командами:
    
    ```sql
    DELETE FROM "__EFMigrationsHistory" WHERE "MigrationId" = '<MigrationId>';
    DROP TABLE "ExampleTable";
    ```
    
2. Запустите скрипт в контейнере:
    
    ```bash
    docker exec -i <postgres_container_name> psql -U <username> -d <database_name> < rollback.sql
    ```
    

---

### Примечание

Этот метод подходит для случаев, когда вы хотите избежать использования `dotnet ef` или в случаях, когда автоматические инструменты недоступны. Однако, рекомендуется делать резервные копии базы данных перед выполнением любых операций на уровне SQL.