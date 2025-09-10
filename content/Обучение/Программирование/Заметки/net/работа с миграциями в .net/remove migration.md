```bash
dotnet ef migrations remove -p TeacherResource.Infrastructure -s TeacherResource.API
```

Ошибка **"Unrecognized option '--connection'"** возникает, потому что команда `dotnet ef migrations remove` не поддерживает параметр `--connection`. Это связано с тем, что параметр подключения для миграций (например, `--connection`) работает только с командами, которые управляют базой данных (например, `dotnet ef database update` или `dotnet ef migrations list`).

Команда `dotnet ef migrations remove` **не поддерживает явную строку подключения** в командной строке. Для этого вам нужно использовать настройки строки подключения, которые определяются через файл конфигурации вашего проекта, например, `appsettings.json` или через переменные окружения.

### Решение:

1. **Использование строки подключения через `appsettings.json`**: Убедитесь, что в вашем проекте настроена правильная строка подключения в файле `appsettings.json` или `appsettings.Development.json`. Например:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=host.docker.internal;Port=9432;Database=contacts;Username=contacts_sa;Password=contacts_sa;"
  }
}
```

2. **Использование переменной окружения**: Если строка подключения не указана в `appsettings.json`, вы можете установить переменную окружения для строки подключения перед выполнением команды:

```powershell
$env:ConnectionStrings__DefaultConnection="Host=host.docker.internal;Port=9432;Database=contacts;Username=contacts_sa;Password=contacts_sa"; 
dotnet ef migrations remove
```

3. **Запуск миграций с переменной окружения**: Убедитесь, что перед запуском миграции в PowerShell установлена переменная окружения для строки подключения, если она указана в коде через `Configuration.GetConnectionString("DefaultConnection")`.

### Пример:

```powershell
$env:ASPNETCORE_ENVIRONMENT="Development"
$env:ConnectionStrings__DefaultConnection="Host=host.docker.internal;Port=9432;Database=contacts;Username=contacts_sa;Password=contacts_sa"
dotnet ef migrations remove
```

Этот подход позволит вам управлять миграциями с нужной строкой подключения, не указывая ее напрямую в команде `dotnet ef migrations remove`.