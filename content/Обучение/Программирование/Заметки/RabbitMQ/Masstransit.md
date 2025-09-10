# Использование

MassTransit предоставляет абстракцию над различными транспортами (RabbitMQ, Azure Service Bus, Amazon SQS) и решает множество задач из коробки: retry policies, circuit breakers, saga state machines, request/response паттерны, мониторинг и диагностика. Это значительно упрощает разработку надежных распределенных приложений.

## Установка пакетов и конфигурация

```plaintext
<PackageReference Include="MassTransit" Version="8.1.3" />
<PackageReference Include="MassTransit.RabbitMQ" Version="8.1.3" />
<PackageReference Include="MassTransit.AspNetCore" Version="8.1.3" />
```

**Базовая конфигурация:**

```csharp
using MassTransit;

var builder = WebApplication.CreateBuilder(args);

// Добавляем MassTransit
builder.Services.AddMassTransit(x =>
{
    // Регистрируем consumers
    x.AddConsumer<OrderCreatedConsumer>();
    x.AddConsumer<PaymentProcessedConsumer>();

    // Настраиваем RabbitMQ
    x.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host("localhost", "/", h =>
        {
            h.Username("guest");
            h.Password("guest");
        });

        // Автоматическая настройка endpoints для consumers
        cfg.ConfigureEndpoints(context);
    });
});

var app = builder.Build();

// Остальная конфигурация приложения
app.MapControllers();
app.Run();
```

**Расширенная конфигаруция:**

```csharp
builder.Services.AddMassTransit(x =>
{
    // Регистрируем consumers
    x.AddConsumer<OrderCreatedConsumer>(typeof(OrderCreatedConsumerDefinition));
    x.AddConsumer<PaymentProcessedConsumer>();

    // Настраиваем Request/Response клиенты
    x.AddRequestClient<GetOrderStatus>();

    x.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host("localhost", "/", h =>
        {
            h.Username("guest");
            h.Password("guest");
        });

        // Глобальные настройки retry
        cfg.UseMessageRetry(r => r.Interval(3, TimeSpan.FromSeconds(5)));
        
        // Circuit breaker
        cfg.UseCircuitBreaker(cb =>
        {
            cb.TrackingPeriod = TimeSpan.FromMinutes(1);
            cb.TripThreshold = 15;
            cb.ActiveThreshold = 10;
            cb.ResetInterval = TimeSpan.FromMinutes(5);
        });

        // Настройка specific endpoint
        cfg.ReceiveEndpoint("order-created-queue", e =>
        {
            e.ConfigureConsumer<OrderCreatedConsumer>(context);
            
            // Специфичные настройки для этого endpoint
            e.UseMessageRetry(r => r.Exponential(5, 
                TimeSpan.FromSeconds(1), 
                TimeSpan.FromSeconds(30), 
                TimeSpan.FromSeconds(5)));
                
            e.PrefetchCount = 10;
            e.ConcurrentMessageLimit = 5;
        });

        cfg.ConfigureEndpoints(context);
    });
});

// Consumer Definition для дополнительной настройки
public class OrderCreatedConsumerDefinition : ConsumerDefinition<OrderCreatedConsumer>
{
    protected override void ConfigureConsumer(IReceiveEndpointConfigurator endpointConfigurator, 
        IConsumerConfigurator<OrderCreatedConsumer> consumerConfigurator)
    {
        endpointConfigurator.UseMessageRetry(r => r.Intervals(100, 200, 500, 800, 1000));
        endpointConfigurator.UseInMemoryOutbox();
    }
}
```
## Создание сообщений и consumers

```csharp
// Контракты сообщений
public record OrderCreated(Guid OrderId, string CustomerEmail, decimal Amount);
public record PaymentProcessed(Guid OrderId, bool IsSuccessful, string PaymentId);
public record OrderCompleted(Guid OrderId, DateTime CompletedAt);

// Consumer для обработки созданного заказа
public class OrderCreatedConsumer : IConsumer<OrderCreated>
{
    private readonly ILogger<OrderCreatedConsumer> _logger;
    private readonly IOrderService _orderService;

    public OrderCreatedConsumer(ILogger<OrderCreatedConsumer> logger, IOrderService orderService)
    {
        _logger = logger;
        _orderService = orderService;
    }

    public async Task Consume(ConsumeContext<OrderCreated> context)
    {
        var message = context.Message;
        
        _logger.LogInformation("Processing order {OrderId} for customer {Email}", 
            message.OrderId, message.CustomerEmail);

        try
        {
            await _orderService.ProcessOrderAsync(message.OrderId);
            
            // Публикуем событие об обработке платежа
            await context.Publish(new PaymentProcessed(
                message.OrderId, 
                true, 
                Guid.NewGuid().ToString()));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to process order {OrderId}", message.OrderId);
            throw; // MassTransit автоматически обработает retry
        }
    }
}

// Consumer для обработки платежа
public class PaymentProcessedConsumer : IConsumer<PaymentProcessed>
{
    private readonly ILogger<PaymentProcessedConsumer> _logger;

    public PaymentProcessedConsumer(ILogger<PaymentProcessedConsumer> logger)
    {
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<PaymentProcessed> context)
    {
        var message = context.Message;
        
        if (message.IsSuccessful)
        {
            _logger.LogInformation("Payment successful for order {OrderId}", message.OrderId);
            
            // Публикуем событие о завершении заказа
            await context.Publish(new OrderCompleted(message.OrderId, DateTime.UtcNow));
        }
        else
        {
            _logger.LogWarning("Payment failed for order {OrderId}", message.OrderId);
        }
    }
}
```

## Публикация сообщений

```csharp
using MassTransit;
using Microsoft.AspNetCore.Mvc;

// Стандартные атрибуты для Web API контроллера
[ApiController]  // Включает автоматическую валидацию модели, привязку параметров
[Route("api/[controller]")]  // Маршрут будет api/orders
public class OrdersController : ControllerBase
{
    // Dependency Injection - получаем сервисы через конструктор
    private readonly IPublishEndpoint _publishEndpoint;  // Для публикации событий
    private readonly ILogger<OrdersController> _logger;  // Для логирования

    public OrdersController(IPublishEndpoint publishEndpoint, ILogger<OrdersController> logger)
    {
        _publishEndpoint = publishEndpoint;
        _logger = logger;
    }

    // HTTP POST метод для создания заказа
    // Publish/Subscribe паттерн
    [HttpPost]  // Обрабатывает POST запросы на api/orders
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request)
    {
        // Генерируем уникальный ID для нового заказа
        var orderId = Guid.NewGuid();
        
        // Логируем создание заказа (для отладки и мониторинга)
        _logger.LogInformation("Creating order {OrderId} for customer {Email}", 
            orderId, request.CustomerEmail);

        // КЛЮЧЕВАЯ СТРОКА: Публикуем событие о создании заказа
        // Это асинхронная операция - сообщение попадет в message bus
        // Все подписчики на событие OrderCreated получат это сообщение
        await _publishEndpoint.Publish(new OrderCreated(
            orderId,                    // ID заказа
            request.CustomerEmail,      // Email клиента из запроса
            request.Amount));           // Сумма заказа из запроса

        // Возвращаем успешный ответ клиенту с ID созданного заказа
        // Важно: мы не ждем обработки заказа, сразу отвечаем клиенту
        return Ok(new { OrderId = orderId });
    }

    // HTTP GET метод для получения статуса заказа
    // Request/Response паттерн
    [HttpGet("{orderId}/status")]  // Обрабатывает GET api/orders/{guid}/status
    public async Task<IActionResult> GetOrderStatus(
        Guid orderId,  // Параметр из URL
        [FromServices] IRequestClient<GetOrderStatus> client)  // Внедряем клиент напрямую в метод
    {
        try
        {
            // Request/Response паттерн - отправляем запрос и ждем ответ
            // Это синхронная операция с таймаутом
            var response = await client.GetResponse<OrderStatusResponse>(
                new GetOrderStatus(orderId));  // Создаем запрос с ID заказа
            
            // Возвращаем полученный ответ клиенту
            return Ok(response.Message);
        }
        catch (RequestTimeoutException)
        {
            // Если превышен таймаут ожидания ответа
            return StatusCode(408, "Request timeout");
        }
    }
}

// DTO для входящего запроса создания заказа
public record CreateOrderRequest(string CustomerEmail, decimal Amount);

// Сообщения для Request/Response паттерна
public record GetOrderStatus(Guid OrderId);           // Запрос статуса
public record OrderStatusResponse(Guid OrderId, string Status, DateTime LastUpdated);  // Ответ
```
# Тестирование

Разные типы harness предназначены для разных уровней и целей тестирования.

## Зачем нужны разные типы harness?

### 1. **Пирамида тестирования**

#### Пирамида тестирования MassTransit

##### 🔺 System Tests (мало, медленные, дорогие)

**ITestHarness с полным DI контейнером**

- Тестируют полную систему
- Включают реальные зависимости (БД, внешние сервисы)
- Проверяют end-to-end сценарии
- Медленные, но максимально достоверные

```csharp
// Пример: полный workflow заказа с БД и внешними сервисами
[Fact] async Task CompleteOrderWorkflow_WithRealDatabase()
```

##### 🔺🔺 Integration Tests (средне, быстрее)

**InMemoryTestHarness**

- Тестируют взаимодействие между consumers
- Проверяют цепочки событий
- Без реальных внешних зависимостей
- Быстрее системных тестов

```csharp
// Пример: OrderCreated → PaymentProcessed → OrderCompleted
[Fact] async Task OrderEventChain_ShouldTriggerAllSteps()
```

##### 🔺🔺🔺 Unit Tests (много, быстрые, дешевые)

**ConsumerTestHarness**

- Тестируют отдельные consumers в изоляции
- Используют mocks для зависимостей
- Самые быстрые и надежные
- Легко отлаживать проблемы

```csharp
// Пример: только логика OrderCreatedConsumer
[Fact] async Task OrderCreatedConsumer_Should_CallOrderService()
```

#### Специализированные тесты

**Saga/StateMachine Harness**

- Для тестирования сложных state machines
- Проверяют переходы состояний
- Timeout и compensation logic
### 2. **Разные цели тестирования**

#### Что тестирует каждый тип harness

##### ConsumerTestHarness - Unit Tests

**Что тестируем:**

- ✅ Логику обработки сообщения в consumer
- ✅ Правильность вызовов зависимостей
- ✅ Обработку ошибок и исключений
- ✅ Валидацию входных данных

**Что НЕ тестируем:**

- ❌ Взаимодействие между consumers
- ❌ Публикацию событий другими consumers
- ❌ Реальные зависимости (БД, внешние API)

**Когда использовать:**

- При TDD разработке consumer
- Для быстрой обратной связи
- При отладке логики consumer

##### InMemoryTestHarness - Integration Tests

**Что тестируем:**

- ✅ Цепочки событий между consumers
- ✅ Правильность публикации/подписки
- ✅ Routing и filtering сообщений
- ✅ Retry policies и error handling

**Что НЕ тестируем:**

- ❌ Реальные побочные эффекты (запись в БД)
- ❌ Внешние сервисы
- ❌ Производительность

**Когда использовать:**

- При рефакторинге messaging логики
- Для проверки business workflows
- При добавлении новых consumers в цепочку

##### ITestHarness с DI - System Tests

**Что тестируем:**

- ✅ Полный end-to-end workflow
- ✅ Реальные зависимости и побочные эффекты
- ✅ Конфигурацию DI контейнера
- ✅ Интеграцию с БД, внешними API

**Что НЕ тестируем:**

- ❌ Детали реализации отдельных consumers
- ❌ Производительность под нагрузкой

**Когда использовать:**

- Перед релизом функциональности
- Для critical business scenarios
- При изменении архитектуры

##### Saga Harness - State Machine Tests

**Что тестируем:**

- ✅ Переходы между состояниями
- ✅ Timeout и compensation логику
- ✅ Корректность завершения saga
- ✅ Обработку дублированных событий

**Когда использовать:**

- При работе с долгоживущими процессами
- Для сложных business workflows
- При реализации распределенных транзакций
### 3. **Практический пример стратегии тестирования**

```csharp
// Пример реальной стратегии тестирования для Order Processing системы

public class OrderProcessingTestSuite
{
    // 1. UNIT ТЕСТЫ (70% от всех тестов)
    // Быстрые, надежные, легко отлаживать
    
    [Theory]
    [InlineData(100.0, true)]   // Обычный заказ
    [InlineData(0.01, true)]    // Минимальная сумма
    [InlineData(-10.0, false)]  // Отрицательная сумма
    public async Task OrderCreatedConsumer_Should_ValidateAmount(decimal amount, bool shouldSucceed)
    {
        var harness = new ConsumerTestHarness<OrderCreatedConsumer>();
        // ... тест только логики валидации
    }

    [Fact]
    public async Task OrderCreatedConsumer_Should_RetryOnTransientError()
    {
        // Тестируем retry логику с mock, который сначала падает, потом работает
        var mockService = new Mock<IOrderService>();
        mockService.SetupSequence(x => x.ProcessOrderAsync(It.IsAny<Guid>()))
            .ThrowsAsync(new HttpRequestException("Temporary failure"))
            .Returns(Task.CompletedTask);
        // ... проверяем retry
    }

    // 2. INTEGRATION ТЕСТЫ (25% от всех тестов)
    // Тестируют взаимодействие между компонентами
    
    [Fact]
    public async Task HappyPath_OrderCreatedToCompleted_ShouldPublishAllEvents()
    {
        var harness = new InMemoryTestHarness();
        // Регистрируем всю цепочку consumers
        var orderConsumer = harness.Consumer<OrderCreatedConsumer>();
        var paymentConsumer = harness.Consumer<PaymentProcessedConsumer>();
        
        await harness.Start();
        try
        {
            await harness.Bus.Publish(new OrderCreated(Guid.NewGuid(), "test@test.com", 100m));
            
            // Проверяем всю цепочку событий
            Assert.True(await harness.Published.Any<PaymentProcessed>());
            Assert.True(await harness.Published.Any<OrderCompleted>());
        }
        finally { await harness.Stop(); }
    }

    [Fact]
    public async Task ErrorHandling_PaymentFailure_ShouldPublishFailureEvent()
    {
        // Тестируем error handling в цепочке
        // Настраиваем consumer, который всегда падает на определенном сообщении
        // Проверяем, что публикуется событие об ошибке
    }

    // 3. SYSTEM ТЕСТЫ (5% от всех тестов)
    // Тестируют полную систему с реальными зависимостями
    
    [Fact]
    public async Task FullWorkflow_WithDatabase_ShouldPersistOrderStates()
    {
        using var provider = new ServiceCollection()
            .AddMassTransitTestHarness(cfg => {
                cfg.AddConsumer<OrderCreatedConsumer>();
                cfg.AddConsumer<PaymentProcessedConsumer>();
            })
            .AddDbContext<OrderDbContext>(opt => opt.UseInMemoryDatabase("test"))
            .AddScoped<IOrderService, OrderService>() // Реальный сервис!
            .BuildServiceProvider();

        var harness = provider.GetRequiredService<ITestHarness>();
        await harness.Start();
        
        try
        {
            var orderId = Guid.NewGuid();
            await harness.Bus.Publish(new OrderCreated(orderId, "test@test.com", 100m));
            
            // Проверяем не только события, но и состояние в БД
            var dbContext = provider.GetRequiredService<OrderDbContext>();
            var order = await dbContext.Orders.FindAsync(orderId);
            Assert.Equal("Completed", order.Status);
        }
        finally { await harness.Stop(); }
    }

    // 4. SAGA ТЕСТЫ (для сложных workflows)
    
    [Fact]
    public async Task OrderSaga_TimeoutScenario_ShouldCancelOrder()
    {
        var harness = new InMemoryTestHarness();
        var sagaHarness = harness.Saga<OrderSaga>();
        
        await harness.Start();
        try
        {
            var orderId = Guid.NewGuid();
            
            // Запускаем saga
            await harness.Bus.Publish(new OrderCreated(orderId, "test@test.com", 100m));
            
            // Ждем timeout (в тестах используем быстрые timeout)
            await Task.Delay(TimeSpan.FromSeconds(1));
            
            // Проверяем, что saga завершилась по timeout
            Assert.True(await sagaHarness.Completed.Any(x => x.Context.Saga.OrderId == orderId));
            Assert.True(await harness.Published.Any<OrderCancelled>());
        }
        finally { await harness.Stop(); }
    }
}
```
## Резюме: почему разные harness?

**Скорость обратной связи**: Unit тесты с `ConsumerTestHarness` дают мгновенную обратную связь при разработке.

**Уровень детализации**: Каждый harness тестирует свой уровень абстракции - от отдельных методов до полных бизнес-процессов.

**Стоимость поддержки**: Unit тесты дешевле в поддержке, system тесты дороже, но дают больше уверенности.

**Цель обнаружения багов**:

- Unit тесты находят логические ошибки в коде
- Integration тесты - проблемы взаимодействия
- System тесты - проблемы конфигурации и интеграции

**Стабильность**: Unit тесты более стабильны, system тесты могут падать из-за внешних факторов.

Правильная стратегия - использовать все типы в пропорции 70% unit / 25% integration / 5% system, что обеспечивает баланс между скоростью, надежностью и покрытием.