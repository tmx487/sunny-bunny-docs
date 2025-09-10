Согласно вашему лог-файлу, приложение не запускается из-за отсутствия HTTPS-сертификата. В контейнере используется Kestrel-сервер, который пытается настроить HTTPS, но не может найти сертификат. Вот несколько шагов для исправления проблемы:

### 1. **Отключение HTTPS в контейнере (для локальной разработки)**

Если HTTPS не является обязательным для текущей разработки, можно отключить его:

- Откройте файл `appsettings.json` или `appsettings.Development.json` в проекте и добавьте (или измените) секцию Kestrel:

```json
"Kestrel": {
  "Endpoints": {
    "Http": {
      "Url": "http://*:5000"
    }
  },
  "RedirectToHttps": false
}
```

- В файле `Program.cs` убедитесь, что Kestrel настроен на использование только HTTP:

```csharp
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(5000); // HTTP
});
```

- Проверьте переменные среды, используемые в `docker-compose.yml`. Если установлена переменная `ASPNETCORE_URLS` с `https://`, измените её на `http://`.

### 2. **Использование Developer Certificate в контейнере**

Если нужно использовать HTTPS, сгенерируйте Developer Certificate на хосте и смонтируйте его в контейнер:

- На хосте выполните:
    
    ```bash
    dotnet dev-certs https --clean
    dotnet dev-certs https --trust
    ```
    
    Это создаст сертификат и установит его доверенным.
    
- Экспортируйте сертификат:
    
    ```bash
    dotnet dev-certs https -ep ./https/aspnetapp.pfx -p <your_password>
    ```
    
- В `docker-compose.override.yml` добавьте монтирование сертификата:
    

```yaml
services:
  your-service-name:
    volumes:
      - ./https:/https:ro
    environment:
      - ASPNETCORE_Kestrel__Certificates__Default__Path=/https/aspnetapp.pfx
      - ASPNETCORE_Kestrel__Certificates__Default__Password=<your_password>
```

### 3. **Использование Production Certificate**

Если нужно использовать HTTPS в продакшене, настройте сертификат для Kestrel:

- Убедитесь, что сертификат доступен в контейнере (через секреты Docker или монтирование).
    
- Обновите конфигурацию Kestrel в `Program.cs`:
    

```csharp
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(5000); // HTTP
    options.ListenAnyIP(5001, listenOptions =>
    {
        listenOptions.UseHttps("/path/to/certificate.pfx", "password");
    });
});
```

### 4. **Проверка документации**

Если вы хотите больше узнать о настройке HTTPS, воспользуйтесь официальной документацией Microsoft по ссылке из ошибки: [https://go.microsoft.com/fwlink/?linkid=848054](https://go.microsoft.com/fwlink/?linkid=848054).

После внесения изменений перезапустите контейнер:

```bash
docker-compose down
docker-compose up --build
```

### Итог

Для локальной разработки предпочтительно отключить HTTPS или использовать Developer Certificate. Для продакшена убедитесь, что сертификат корректно настроен и доступен контейнеру. Если проблема сохраняется, напишите, и мы продолжим разбираться.