Для автоматического выполнения миграций при запуске WebAPI можно использовать несколько подходов. Это часто реализуют с помощью скрипта, который запускает команды миграции перед стартом приложения.

---

### 1. **Добавление команды миграции в `Dockerfile`**
Измените `Dockerfile` вашего WebAPI, добавив вызов команды миграции перед запуском приложения.

Пример `Dockerfile`:
```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:7.0 AS base
WORKDIR /app

# Добавляем этап сборки
FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build
WORKDIR /src
COPY ["MyApp/MyApp.csproj", "MyApp/"]
RUN dotnet restore "MyApp/MyApp.csproj"
COPY . .
WORKDIR "/src/MyApp"
RUN dotnet build "MyApp.csproj" -c Release -o /app/build

# Публикуем приложение
FROM build AS publish
RUN dotnet publish "MyApp.csproj" -c Release -o /app/publish

# Финальный этап
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
# Выполняем миграции перед запуском
ENTRYPOINT ["bash", "-c", "dotnet ef database update --no-build && dotnet MyApp.dll"]
```

---

### 2. **Автоматизация через `docker-compose`**
Можно добавить этап миграции в `docker-compose.yaml`, чтобы миграции выполнялись до запуска WebAPI.

Пример:
```yaml
version: '3.9'

services:
  postgres:
    image: postgres:latest
    container_name: postgresql
    restart: always
    ports:
      - 9432:5432
    environment:
      POSTGRES_USER: phonebook_user
      POSTGRES_PASSWORD: secure_password
      POSTGRES_DB: phonebook_db
    volumes:
      - postgresql_data:/var/lib/postgresql/data

  migrate:
    image: myapp:latest
    depends_on:
      - postgres
    entrypoint: ["dotnet", "ef", "database", "update", "--no-build"]
    environment:
      - ASPNETCORE_ENVIRONMENT=Production

  webapi:
    image: myapp:latest
    container_name: webapi
    depends_on:
      - postgres
      - migrate
    ports:
      - "5000:80"
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
    command: ["dotnet", "MyApp.dll"]

volumes:
  postgresql_data:
```

В этом примере:
- Сервис `migrate` выполняет миграции с помощью команды `dotnet ef database update`.
- WebAPI (`webapi`) запускается только после успешного выполнения миграций.

---

### 3. **Использование кода внутри приложения**

Вы можете добавить выполнение миграций непосредственно в код WebAPI. Это гибкий вариант, особенно если вы хотите, чтобы миграции выполнялись только в определенной среде (например, на Dev или Staging).

Пример в `Program.cs`:
```csharp
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// Выполняем миграции при старте
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    dbContext.Database.Migrate();
}

app.Run();
```

Это позволит вашему приложению автоматически выполнять миграции при запуске.

---

### Что выбрать?
- **Код в приложении** (`Program.cs`) — простой способ для Dev/Staging сред.
- **Команда в `Dockerfile`** — подходит, если вы хотите четко отделить миграции от логики приложения.
- **Через `docker-compose`** — лучший вариант для продакшна, так как миграции выполняются до запуска приложения, и их результат можно контролировать отдельно.