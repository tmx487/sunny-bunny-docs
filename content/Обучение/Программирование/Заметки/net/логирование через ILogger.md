Для использования `ILogger` в приложении .NET, предоставляемого библиотекой `Microsoft.Extensions.Logging`, вам нужно выполнить несколько шагов. `ILogger` позволяет записывать логи различных уровней (например, `Information`, `Warning`, `Error` и другие) и интегрируется с различными поставщиками логирования, такими как консоль, файлы или сторонние системы.

Вот как использовать `ILogger` в приложении .NET:

### 1. **Добавление зависимостей**

Для начала убедитесь, что у вас в проекте подключены необходимые пакеты. Если вы используете ASP.NET Core, то они уже включены по умолчанию. Если вы работаете с обычным .NET проектом, вам нужно добавить следующие пакеты:

```bash
dotnet add package Microsoft.Extensions.Logging
dotnet add package Microsoft.Extensions.Logging.Console
```

### 2. **Настройка `ILogger` в `Program.cs` или `Startup.cs`**

В .NET Core и .NET 5/6/7/8 настройка `ILogger` обычно происходит в методе `ConfigureServices` в классе `Startup` или в `Program.cs`.

#### Пример для ASP.NET Core (например, в `Program.cs`):

```csharp
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

var builder = WebApplication.CreateBuilder(args);

// Настройка логирования (по умолчанию используется консоль)
builder.Logging.ClearProviders(); // Убираем стандартные провайдеры логирования
builder.Logging.AddConsole(); // Добавляем провайдер консольного логирования

var app = builder.Build();

// Пример использования ILogger в контроллере
app.MapGet("/", (ILogger<Program> logger) =>
{
    logger.LogInformation("Hello World! This is an informational message.");
    return "Hello, World!";
});

app.Run();
```

### 3. **Использование `ILogger` в классах или контроллерах**

Для использования `ILogger` в других частях вашего приложения, например, в сервисах или контроллерах, вам нужно внедрить его через конструктор.

#### Пример использования в контроллере:

```csharp
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace MyApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MyController : ControllerBase
    {
        private readonly ILogger<MyController> _logger;

        public MyController(ILogger<MyController> logger)
        {
            _logger = logger;
        }

        [HttpGet]
        public IActionResult Get()
        {
            _logger.LogInformation("Getting data from the API");
            return Ok(new { Message = "Hello, World!" });
        }
    }
}
```

#### Пример использования в сервисе:

```csharp
using Microsoft.Extensions.Logging;

namespace MyApp.Services
{
    public class MyService
    {
        private readonly ILogger<MyService> _logger;

        public MyService(ILogger<MyService> logger)
        {
            _logger = logger;
        }

        public void DoSomething()
        {
            _logger.LogDebug("Doing something in MyService...");
            _logger.LogInformation("Service operation completed.");
        }
    }
}
```

### 4. **Различные уровни логирования**

`ILogger` поддерживает несколько уровней логирования, которые можно использовать в зависимости от важности сообщения. Вот основные уровни:

- `Trace` — подробные сообщения для трассировки.
- `Debug` — сообщения для отладки.
- `Information` — обычные информационные сообщения.
- `Warning` — предупреждения о потенциальных проблемах.
- `Error` — ошибки, которые не останавливают приложение.
- `Critical` — критические ошибки, которые могут привести к сбоям приложения.

Пример использования:

```csharp
_logger.LogTrace("Trace level log.");
_logger.LogDebug("Debug level log.");
_logger.LogInformation("Information level log.");
_logger.LogWarning("Warning level log.");
_logger.LogError("Error level log.");
_logger.LogCritical("Critical level log.");
```

### 5. **Форматирование логов**

Вы можете форматировать сообщения логов, используя дополнительные параметры, например:

```csharp
_logger.LogInformation("User {UserId} has logged in at {Time}", userId, DateTime.UtcNow);
```

В этом примере будет выведено сообщение с подставленными значениями переменных `userId` и `DateTime.UtcNow`.

### 6. **Настройка логирования в `appsettings.json`**

Для управления уровнями логирования через конфигурацию можно использовать файл `appsettings.json`:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "System": "Warning",
      "Microsoft": "Error"
    }
  }
}
```

В этом примере для всех логов по умолчанию установлен уровень `Information`, для логов системы — `Warning`, а для логов Microsoft — `Error`.

### 7. **Отправка логов в другие источники**

Вы также можете настроить логирование на сторонние сервисы или системы, такие как файлы, базы данных или облачные решения, например, Azure Application Insights или Serilog.

Пример с использованием `Serilog` для логирования в файл:

```bash
dotnet add package Serilog
dotnet add package Serilog.Sinks.File
```

Пример настройки в `Program.cs`:

```csharp
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Настройка Serilog для записи логов в файл
Log.Logger = new LoggerConfiguration()
    .WriteTo.File("logs/myapp.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Logging.ClearProviders();
builder.Logging.AddSerilog();

var app = builder.Build();
```

### 8. **Просмотр логов**

Если вы настроили консольное логирование, логи будут выводиться в консоль, и вы сможете их видеть во время работы приложения.

Если вы настроили вывод в файл, то логи будут записываться в указанный файл (например, `logs/myapp.txt`).

### Заключение

Использование `ILogger` позволяет вам эффективно управлять логами в вашем приложении, выводить информацию о работе приложения, ошибки и другие важные сообщения. Вы можете настроить логирование на различные уровни и выводить логи в разные источники (консоль, файлы, удаленные сервисы).