В **Swagger/OpenAPI** разделе `security` задаются механизмы аутентификации и авторизации для API.

### Разбор структуры:

```yaml
security:
  - petstore_auth:
      - write:pets
      - read:pets
```

### Пояснение:

1. **`security`** – глобальный раздел, определяющий требования безопасности для всех или некоторых эндпоинтов API. Этот блок описывает, какие схемы аутентификации используются и какие права доступа (scopes) необходимы для вызова API.
    
2. **`petstore_auth`** – это название схемы аутентификации, которая описана в разделе `components.securitySchemes`. Например, это может быть OAuth2-схема или другой метод аутентификации.
    
3. **`write:pets`, `read:pets`** – это **scopes** (области доступа), которые определяют конкретные разрешения для пользователя или приложения. Например:
    
    - `write:pets` – разрешение на добавление или изменение записей о питомцах.
    - `read:pets` – разрешение на чтение записей о питомцах.

### Пример полного описания схемы безопасности в OpenAPI:

```yaml
openapi: 3.0.0
info:
  title: Petstore API
  version: 1.0.0
paths:
  /pets:
    get:
      summary: Get all pets
      security:
        - petstore_auth:
            - read:pets
      responses:
        '200':
          description: Successful response
components:
  securitySchemes:
    petstore_auth:
      type: oauth2
      flows:
        authorizationCode:
          authorizationUrl: https://example.com/oauth/authorize
          tokenUrl: https://example.com/oauth/token
          scopes:
            write:pets: Modify pets in your account
            read:pets: Read your pets
```

### Как это работает:

- При вызове API с OAuth2-аутентификацией клиенту потребуется передать токен доступа, содержащий нужные **scopes** для выполнения операции.
- Если токен не имеет необходимых **scopes**, сервер вернёт **403 Forbidden** или аналогичную ошибку.

### Зачем нужны `scopes`?

- **Гранулярный контроль доступа**: позволяет точно определить, что конкретный клиент может делать.
- **Безопасность**: ограничивает доступ к операциям, что особенно важно для публичных API.