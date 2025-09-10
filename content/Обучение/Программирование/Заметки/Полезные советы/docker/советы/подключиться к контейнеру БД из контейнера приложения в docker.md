Для подключения приложения в одном контейнере к базе данных в другом контейнере нужно убедиться, что оба контейнера находятся в одной сети Docker и использовать правильные параметры подключения.

### Шаги для подключения приложения к БД в Docker:

#### 1. **Убедитесь, что контейнеры находятся в одной сети**

Если вы используете `docker-compose`, по умолчанию создается общая сеть, и контейнеры могут обращаться друг к другу по имени сервиса.

##### Пример `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgresql:
    image: postgres:16
    container_name: postgresql
    environment:
      POSTGRES_USER: contacts_sa
      POSTGRES_PASSWORD: contacts_sa
      POSTGRES_DB: contacts
    ports:
      - "5432:5432"

  contacts_api:
    build:
      context: .
      dockerfile: Contacts.API/Dockerfile
    container_name: contacts_api
    environment:
      ConnectionStrings__NpgsqlConnection: "Host=postgresql;Port=5432;Database=contacts;Username=contacts_sa;Password=contacts_sa;"
    ports:
      - "5000:5000"
    depends_on:
      - postgresql
```

В данном случае приложение `contacts_api` будет подключаться к базе данных `postgresql`, используя имя сервиса `postgresql`.

#### 2. **Подключение к БД по имени контейнера или сервиса**

Используйте имя контейнера/сервиса в качестве хоста:

- **Host:** `postgresql`
- **Port:** `5432` (по умолчанию для PostgreSQL)

#### 3. **Строка подключения в `appsettings.json`:**

```json
{
  "ConnectionStrings": {
    "NpgsqlConnection": "Host=postgresql;Port=5432;Database=contacts;Username=contacts_sa;Password=contacts_sa;"
  }
}
```

#### 4. **Ручное добавление контейнеров в одну сеть (если `docker-compose` не используется)**

Если вы не используете `docker-compose`, создайте сеть вручную и подключите оба контейнера:

```bash
# Создание сети
docker network create my_network

# Подключение контейнеров к сети
docker network connect my_network postgresql
docker network connect my_network contacts_api
```

Теперь приложение может подключаться к БД по имени `postgresql`.

#### 5. **Проверка подключения**

Вы можете проверить подключение к базе данных из контейнера приложения:

```bash
docker exec -it contacts_api ping postgresql
```

Если всё настроено правильно, пинг будет успешным, и ваше приложение сможет подключаться к базе данных.