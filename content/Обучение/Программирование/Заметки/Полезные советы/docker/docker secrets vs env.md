Чтобы значение для переменной `POSTGRES_USER` было взято из файла `postgresql_secret.txt`, вы должны использовать Docker Secrets или переменные окружения. Однако, Docker Compose не предоставляет прямого способа загрузить переменные окружения из текстового файла в конфигурации `docker-compose.yaml`.

Есть несколько способов реализовать такую задачу:

### 1. Использование Docker Secrets для POSTGRES_USER
Docker предоставляет встроенную возможность для работы с секретами (например, пароли, токены), которые можно безопасно хранить и передавать в контейнер. Вам нужно использовать секреты Docker для хранения значений, таких как имя пользователя и пароль. 

Предположим, что файл `postgresql_secret.txt` выглядит так:
```
POSTGRES_USER=your_admin_user
POSTGRES_PASSWORD=your_password
```

Чтобы использовать эти данные через Docker Secrets, вы должны их разделить на два секрета — один для пользователя, а второй для пароля. Например:

### Структура Docker Compose

1. **Создайте секреты в Docker**:
   
   Для того чтобы создать секреты для пользователя и пароля, используйте следующие команды в терминале (находясь в той же директории, где находится `postgresql_secret.txt`):

   ```bash
   docker secret create postgres_admin_user ./postgresql_secret.txt
   ```

   **Важно**: Для работы с секретами необходимо использовать Docker Swarm, а значит, ваш Docker должен быть в Swarm-режиме. Вы можете активировать Swarm командой:

   ```bash
   docker swarm init
   ```

2. **Обновите файл `docker-compose.yaml`**:

   Теперь в вашем `docker-compose.yaml` можно указать, чтобы Docker использовал секреты:

```yaml
version: '3.9'

services:
  postgres:
    image: postgres:latest
    restart: always
    ports:
      - 9432:5432
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/postgres_password
    secrets:
      - postgres_admin_user
      - postgres_password
    volumes:
      - db_data:/var/lib/postgresql/data

secrets:
  postgres_admin_user:
    file: ./postgresql_secret.txt
  postgres_password:
    file: ./postgresql_secret.txt

volumes:
  db_data:
```

### 2. Использование переменных окружения из файла (без использования Docker Secrets)
Если вы не хотите использовать Docker Secrets, вы можете использовать обычные переменные окружения и загрузить их из текстового файла в систему перед запуском контейнера. В этом случае файл `postgresql_secret.txt` может выглядеть, например, так:

```
POSTGRES_USER=your_admin_user
POSTGRES_PASSWORD=your_password
```

Чтобы загрузить значения из этого файла в переменные окружения, можно использовать команду в PowerShell или в командной строке Linux (в зависимости от операционной системы).

#### Пример для PowerShell:
```powershell
$env:POSTGRES_USER = (Get-Content .\postgresql_secret.txt | Select-String -Pattern "POSTGRES_USER=(.*)" | ForEach-Object {$_.Matches.Groups[1].Value})
$env:POSTGRES_PASSWORD = (Get-Content .\postgresql_secret.txt | Select-String -Pattern "POSTGRES_PASSWORD=(.*)" | ForEach-Object {$_.Matches.Groups[1].Value})
docker-compose up -d
```

#### Пример для Linux/WSL:
```bash
export POSTGRES_USER=$(grep "POSTGRES_USER" postgresql_secret.txt | cut -d'=' -f2)
export POSTGRES_PASSWORD=$(grep "POSTGRES_PASSWORD" postgresql_secret.txt | cut -d'=' -f2)
docker-compose up -d
```

Здесь мы извлекаем значения из файла `postgresql_secret.txt` и устанавливаем их как переменные окружения для использования в Docker Compose.

### Заключение:
- **Использование Docker Secrets** — более безопасный и предпочтительный способ, если у вас включен Docker Swarm.
- **Использование переменных окружения** — можно использовать в любом случае, просто загружая значения из текстового файла перед запуском Docker Compose.