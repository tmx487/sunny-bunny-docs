В продакшене секреты обычно управляются через **секцию `secrets`** в `docker-compose.yaml`, с привязкой секретов к файлам. Вот подробный пример и объяснение.

---

### **Пример структуры проекта**
```plaintext
project-directory/
├── docker-compose.yaml
├── secrets/
│   ├── postgres_user.txt
│   ├── postgres_password.txt
```

---

### **docker-compose.yaml**
```yaml
version: '3.9'

services:
  postgres:
    image: postgres:latest
    restart: always
    ports:
      - "5432:5432"
    environment:
      # Используем секреты через файловую систему Docker.
      POSTGRES_USER_FILE: /run/secrets/postgres_user
      POSTGRES_PASSWORD_FILE: /run/secrets/postgres_password
    secrets:
      - postgres_user
      - postgres_password
    volumes:
      - db_data:/var/lib/postgresql/data

secrets:
  postgres_user:
    file: ./secrets/postgres_user.txt # Указываем путь к файлу с секретом
  postgres_password:
    file: ./secrets/postgres_password.txt

volumes:
  db_data:
```

---

### **Секреты в отдельных файлах**
Создайте два файла для хранения значений секретов:

#### `secrets/postgres_user.txt`
```
my_postgres_user
```

#### `secrets/postgres_password.txt`
```
SuperSecretPassword123
```

---

### **Пошаговое объяснение**
1. **Секция `secrets` в `docker-compose.yaml`:**
   - Каждая запись в секции `secrets` связывает имя секрета (`postgres_user`, `postgres_password`) с файлом, где содержится его значение.

2. **Указание секретов в сервисе:**
   - Секреты монтируются как файлы в папку `/run/secrets` внутри контейнера. Например:
     - Содержимое `postgres_user.txt` будет доступно по пути `/run/secrets/postgres_user`.
     - Аналогично для пароля.

3. **Использование секретов через переменные окружения:**
   - Вместо передачи пароля напрямую (`POSTGRES_PASSWORD`), используем переменную с суффиксом `_FILE`, чтобы PostgreSQL прочитал значение из монтированного файла.

---

### **Запуск**
1. Убедитесь, что файлы секретов находятся в правильной директории.
2. Запустите `docker-compose`:
   ```bash
   docker-compose up -d
   ```
3. Docker создаст секреты, смонтирует их в контейнер и передаст PostgreSQL.

---

### **Как проверить секреты в контейнере**
После запуска контейнера можно проверить, что секреты доступны в папке `/run/secrets`:
1. Зайдите в контейнер:
   ```bash
   docker exec -it <container_name> bash
   ```
2. Список файлов в `/run/secrets`:
   ```bash
   ls /run/secrets
   ```
   Вы увидите:
   ```plaintext
   postgres_user
   postgres_password
   ```
3. Посмотрите содержимое файла (только для тестирования):
   ```bash
   cat /run/secrets/postgres_user
   ```

---

### **Преимущества такого подхода**
- **Безопасность:** секреты передаются как зашифрованные данные внутри Docker.
- **Управление:** легко заменить файлы секретов для обновления данных.
- **Логичность:** конфигурация секретов централизована в `docker-compose.yaml`.

### **Замечание:**
- На продакшене лучше использовать **менеджеры секретов** (например, HashiCorp Vault, AWS Secrets Manager), чтобы обеспечить дополнительные уровни защиты и автоматизацию.