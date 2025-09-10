Хорошо, давайте посмотрим, как можно использовать библиотеку **MassTransit v8** с RabbitMQ в контексте реализации Calipso Tracking System. MassTransit значительно упрощает работу с сообщениями, предоставляя высокоуровневые абстракции для отправки команд, публикации событий и потребления сообщений.

Мы продолжим сценарий с обновлением статуса отправки: `Departure Service` публикует событие `DepartureStatusUpdated`, а `Tracking Screen Service` потребляет его для инвалидации кэша.

### **Необходимые NuGet пакеты:**

Для проектов (и Publisher, и Consumer) вам понадобятся:

- `MassTransit`
    
- `MassTransit.RabbitMq`
    
- `Microsoft.Extensions.Hosting` (для удобного хостинга в консольном приложении или ASP.NET Core)
    

```csharp
// Для Publisher (Departure Service)
dotnet add package MassTransit
dotnet add package MassTransit.RabbitMq
dotnet add package Microsoft.Extensions.Hosting

// Для Consumer (Tracking Screen Service)
dotnet add package MassTransit
dotnet add package MassTransit.RabbitMq
dotnet add package Microsoft.Extensions.Hosting
dotnet add package StackExchange.Redis // Если используете Redis для кэша
```

---

### **1. Определение сообщения (События)**

Это просто POCO-класс (Plain Old CLR Object), который будет общим для всех сервисов, работающих с этим событием.

**`Messages/DepartureStatusUpdated.cs` (Общий проект или shared library):**


```csharp
using System;

namespace Calipso.Tracking.Messages
{
    // Событие, публикуемое при обновлении статуса отправки
    public record DepartureStatusUpdated
    {
        public string DepartureId { get; init; }
        public string NewStatus { get; init; }
        public DateTime Timestamp { get; init; }
        // Дополнительные поля, если нужны
        public string PreviousStatus { get; init; }
        public DateTime? ActualDepartureTime { get; init; }
    }

    // Для примера, можно также определить команду, если бы что-то запрашивалось явно
    public record CreateDepartureCommand
    {
        public Guid CommandId { get; init; } = Guid.NewGuid();
        public string PoNumber { get; init; }
        // ... другие поля для создания отправки
    }
}
```

---

### **2. `Departure Service` (Publisher - Издатель события)**

Это сервис, который обновляет данные об отправке и публикует событие.

**`DepartureService/Program.cs`:**

```csharp
using Calipso.Tracking.Messages;
using MassTransit;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.Threading.Tasks;

namespace DepartureService
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            await Host.CreateDefaultBuilder(args)
                .ConfigureServices((hostContext, services) =>
                {
                    // Конфигурация MassTransit для RabbitMQ
                    services.AddMassTransit(x =>
                    {
                        x.UsingRabbitMq((context, cfg) =>
                        {
                            cfg.Host("rabbitmq://localhost:5672"); // Адрес вашего RabbitMQ

                            // Важно: если нужно отправлять команды, используйте EndpointConvention
                            // x.AddPublishMessageScheduler(); // Если используете отложенные сообщения
                        });
                    });

                    // Добавляем IHostedService для запуска MassTransit
                    services.AddMassTransitHostedService(true); // true для автоматического запуска/остановки

                    // Регистрируем наш сервис, который будет публиковать события
                    services.AddSingleton<DepartureManager>();
                })
                .Build()
                .RunAsync();
        }
    }

    // Пример класса, который обновляет статус отправки и публикует событие
    public class DepartureManager
    {
        private readonly IPublishEndpoint _publishEndpoint;
        private readonly ILogger<DepartureManager> _logger; // Если используете логирование

        public DepartureManager(IPublishEndpoint publishEndpoint, ILogger<DepartureManager> logger)
        {
            _publishEndpoint = publishEndpoint;
            _logger = logger;
        }

        // Этот метод будет вызываться, когда статус отправки обновлен
        // (например, из HTTP API контроллера или обработчика команды)
        public async Task UpdateDepartureStatus(string departureId, string newStatus, string previousStatus, DateTime? actualDepartureTime = null)
        {
            _logger.LogInformation($"Обновление статуса отправки {departureId} на {newStatus}.");

            // --- Здесь ваша логика обновления БД (паттерн Outbox) ---
            // В реальном приложении это будет транзакция:
            // 1. Обновить статус в базе данных Departure Service
            // 2. Записать событие в таблицу Outbox в той же транзакции
            // --------------------------------------------------------

            // Публикуем событие через MassTransit
            await _publishEndpoint.Publish(new DepartureStatusUpdated
            {
                DepartureId = departureId,
                NewStatus = newStatus,
                PreviousStatus = previousStatus,
                ActualDepartureTime = actualDepartureTime,
                Timestamp = DateTime.UtcNow
            });

            _logger.LogInformation($"Событие DepartureStatusUpdated для {departureId} опубликовано.");
        }
    }

    // Пример использования (можно добавить в Program.cs для демонстрации)
    // В реальном приложении это будет вызвано, например, HTTP-контроллером
    public class PublisherWorker : IHostedService
    {
        private readonly DepartureManager _departureManager;
        private readonly ILogger<PublisherWorker> _logger;

        public PublisherWorker(DepartureManager departureManager, ILogger<PublisherWorker> logger)
        {
            _departureManager = departureManager;
            _logger = logger;
        }

        public async Task StartAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("PublisherWorker запущен. Публикация тестового события через 5 секунд...");
            await Task.Delay(TimeSpan.FromSeconds(5), cancellationToken);

            await _departureManager.UpdateDepartureStatus(
                "DEP-001", "In Transit", "Pending", DateTime.UtcNow);

            await Task.Delay(TimeSpan.FromSeconds(5), cancellationToken);

            await _departureManager.UpdateDepartureStatus(
                "DEP-002", "Arrived", "In Transit", DateTime.UtcNow);

            _logger.LogInformation("Тестовые события опубликованы.");
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("PublisherWorker остановлен.");
            return Task.CompletedTask;
        }
    }
}
```

---

### **3. `Tracking Screen Service` (Consumer - Потребитель события)**

Это сервис, который подписывается на события и инвалидирует кэш.

**`TrackingScreenService/Program.cs`:**

```csharp
using Calipso.Tracking.Messages;
using MassTransit;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using StackExchange.Redis; // Для Redis
using System;
using System.Text.Json; // Или Newtonsoft.Json
using System.Threading.Tasks;

namespace TrackingScreenService
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            await Host.CreateDefaultBuilder(args)
                .ConfigureServices((hostContext, services) =>
                {
                    // Конфигурация Redis
                    services.AddSingleton<ConnectionMultiplexer>(sp =>
                        ConnectionMultiplexer.Connect("localhost:6379")); // Ваш Redis Connection String
                    services.AddScoped<IDatabase>(sp =>
                        sp.GetRequiredService<ConnectionMultiplexer>().GetDatabase());

                    // Конфигурация MassTransit для RabbitMQ
                    services.AddMassTransit(x =>
                    {
                        // Добавляем наш потребитель
                        x.AddConsumer<DepartureStatusUpdatedConsumer>();

                        x.UsingRabbitMq((context, cfg) =>
                        {
                            cfg.Host("rabbitmq://localhost:5672"); // Адрес вашего RabbitMQ

                            // Конфигурируем Receive Endpoint для потребителя
                            // Массовая транзитная очередь по умолчанию именуется по имени класса потребителя
                            cfg.ReceiveEndpoint("tracking-screen-departure-status-updates", e =>
                            {
                                // Привязываем потребителя к эндпоинту
                                e.ConfigureConsumer<DepartureStatusUpdatedConsumer>(context);

                                // Важно: если сообщения могут быть доставлены несколько раз (at-least-once),
                                // ваш потребитель должен быть идемпотентным.
                                // e.UseMessageRetry(r => r.Interval(5, TimeSpan.FromSeconds(10))); // Пример ретраев
                            });
                        });
                    });

                    // Добавляем IHostedService для запуска MassTransit
                    services.AddMassTransitHostedService(true); // true для автоматического запуска/остановки

                    // Если у вас есть другие сервисы, которые используют кэш, их тоже можно добавить.
                })
                .Build()
                .RunAsync();
        }
    }

    // Консьюмер (Потребитель) сообщения
    public class DepartureStatusUpdatedConsumer : IConsumer<DepartureStatusUpdated>
    {
        private readonly IDatabase _redisDb;
        private readonly ILogger<DepartureStatusUpdatedConsumer> _logger;

        public DepartureStatusUpdatedConsumer(IDatabase redisDb, ILogger<DepartureStatusUpdatedConsumer> logger)
        {
            _redisDb = redisDb;
            _logger = logger;
        }

        // Метод, который вызывается MassTransit при получении сообщения
        public async Task Consume(ConsumeContext<DepartureStatusUpdated> context)
        {
            var message = context.Message;
            _logger.LogInformation($"Получено событие DepartureStatusUpdated для отправки {message.DepartureId} со статусом {message.NewStatus}.");

            // --- Логика инвалидации кэша ---
            string departureId = message.DepartureId;

            // Определяем ключи в Redis, которые нужно инвалидировать
            string cacheKeyForSingleDeparture = $"tracking:departure:{departureId}";
            string cacheKeyForStatusSpecificList = "tracking:departures:status:in_transit"; // Может потребоваться обновление этого списка

            // Удаляем кэшированные данные для конкретной отправки
            await _redisDb.KeyDeleteAsync(cacheKeyForSingleDeparture);
            _logger.LogInformation($"Кэш для отправки {departureId} инвалидирован (ключ: {cacheKeyForSingleDeparture}).");

            // Удаляем кэш списка, если статус повлиял на принадлежность к списку
            // В реальной ситуации, возможно, вам понадобится более сложная логика,
            // чтобы определить, какой именно список нужно инвалидировать,
            // или перестроить его часть.
            await _redisDb.KeyDeleteAsync(cacheKeyForStatusSpecificList);
            _logger.LogInformation($"Кэш списка 'In Transit' отправлений инвалидирован (ключ: {cacheKeyForStatusSpecificList}).");

            // --- Здесь также можно добавить логику для обновления Read Model
            // Tracking Screen Service, если он поддерживает свою собственную БД для чтения.
            // Например:
            // await _readModelUpdater.UpdateDepartureInReadModel(message.DepartureId, message.NewStatus, message.ActualDepartureTime);
        }
    }
}
```

### **Как это работает в контексте Calipso:**

1. **Отправка события:** Когда в `Departure Service` происходит изменение статуса отправки (например, через HTTP API, который вызывает `DepartureManager.UpdateDepartureStatus`), `DepartureManager` публикует событие `DepartureStatusUpdated` в MassTransit. MassTransit берет это сообщение и отправляет его в RabbitMQ.
    
2. **Потребление события:** `Tracking Screen Service` имеет настроенный `ReceiveEndpoint` в RabbitMQ и зарегистрированный `DepartureStatusUpdatedConsumer`. MassTransit автоматически получает сообщение из RabbitMQ и передает его экземпляру `DepartureStatusUpdatedConsumer`.
    
3. **Инвалидация кэша:** Внутри `Consume` метода `DepartureStatusUpdatedConsumer` происходит логика инвалидации. Он использует `IDatabase` (полученный через DI) для подключения к Redis и удаления ключей, связанных с измененной отправкой.
    

**Преимущества MassTransit:**

- **Абстракция:** Вам не нужно напрямую работать с каналами RabbitMQ, очередями, обменниками. MassTransit делает это за вас.
    
- **Сериализация:** Автоматически сериализует/десериализует ваши POCO-классы в/из JSON (или другой формат).
    
- **Маршрутизация:** Определяет, куда отправлять сообщения и откуда их получать, используя соглашения или явную конфигурацию.
    
- **Отказоустойчивость:** Предоставляет встроенные механизмы ретраев, dead-letter очередей, планирования сообщений и другие.
    
- **Тестирование:** Упрощает тестирование компонентов, работающих с сообщениями.
    
- **Поддержка DI:** Легко интегрируется с системой Dependency Injection в .NET.