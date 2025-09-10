## DIP (Dependency Inversion Principle) — Принцип инверсии зависимостей

**DIP** — это **принцип проектирования** (5-й в SOLID), который говорит:

1. **Модули высокого уровня не должны зависеть от модулей низкого уровня. И те, и другие должны зависеть от абстракций.**
2. **Абстракции не должны зависеть от деталей. Детали должны зависеть от абстракций.**

### ❌ Нарушение DIP

```cs
// Модуль высокого уровня (бизнес-логика)
public class OrderService
{
    // Зависим от конкретных реализаций (модули низкого уровня)
    private readonly SqlServerRepository _repository;        // Конкретная БД
    private readonly SmtpEmailService _emailService;        // Конкретный email
    private readonly ConsoleLogger _logger;                 // Конкретное логирование
    
    public OrderService()
    {
        // Создаем зависимости сами - жесткое связывание!
        _repository = new SqlServerRepository();
        _emailService = new SmtpEmailService();
        _logger = new ConsoleLogger();
    }
    
    public async Task ProcessOrderAsync(Order order)
    {
        _logger.Log("Processing order");
        
        await _repository.SaveAsync(order);
        await _emailService.SendOrderConfirmationAsync(order.CustomerEmail);
        
        _logger.Log("Order processed");
    }
}

// Проблемы:
// 1. Нельзя поменять БД без изменения OrderService
// 2. Сложно тестировать - нельзя замокать зависимости
// 3. OrderService знает КАК создавать свои зависимости
// 4. Нарушается Single Responsibility Principle
```

### ✅ Соблюдение DIP

```cs
// Абстракции (интерфейсы)
public interface IOrderRepository
{
    Task SaveAsync(Order order);
    Task<Order> GetByIdAsync(int id);
}

public interface IEmailService
{
    Task SendOrderConfirmationAsync(string email, Order order);
}

public interface ILogger
{
    void Log(string message);
}

// Модуль высокого уровня зависит ТОЛЬКО от абстракций
public class OrderService
{
    private readonly IOrderRepository _repository;
    private readonly IEmailService _emailService;
    private readonly ILogger _logger;
    
    // Получаем зависимости извне - инверсия управления!
    public OrderService(
        IOrderRepository repository, 
        IEmailService emailService, 
        ILogger logger)
    {
        _repository = repository;
        _emailService = emailService;
        _logger = logger;
    }
    
    public async Task ProcessOrderAsync(Order order)
    {
        _logger.Log("Processing order");
        
        await _repository.SaveAsync(order);
        await _emailService.SendOrderConfirmationAsync(order.CustomerEmail, order);
        
        _logger.Log("Order processed");
    }
}

// Конкретные реализации (модули низкого уровня) зависят от абстракций
public class SqlServerRepository : IOrderRepository
{
    public async Task SaveAsync(Order order) { /* SQL Server logic */ }
    public async Task<Order> GetByIdAsync(int id) { /* SQL Server logic */ }
}

public class MongoRepository : IOrderRepository
{
    public async Task SaveAsync(Order order) { /* MongoDB logic */ }
    public async Task<Order> GetByIdAsync(int id) { /* MongoDB logic */ }
}

public class SmtpEmailService : IEmailService
{
    public async Task SendOrderConfirmationAsync(string email, Order order)
    { /* SMTP logic */ }
}

public class SendGridEmailService : IEmailService
{
    public async Task SendOrderConfirmationAsync(string email, Order order)
    { /* SendGrid API logic */ }
}
```

## IoC (Inversion of Control) — Инверсия управления

**IoC** — это **общий принцип**, при котором управление созданием и жизненным циклом объектов передается внешнему компоненту.

### Виды IoC

#### 1. **Dependency Injection** (внедрение зависимостей)

```cs
// Класс НЕ создает свои зависимости, а получает их извне
public class OrderService
{
    private readonly IOrderRepository _repository;
    
    // Constructor Injection
    public OrderService(IOrderRepository repository)
    {
        _repository = repository;
    }
}
```

#### 2. **Service Locator** (локатор служб)

```cs
public class OrderService
{
    private readonly IOrderRepository _repository;
    
    public OrderService()
    {
        // Получаем зависимость через Service Locator
        _repository = ServiceLocator.GetService<IOrderRepository>();
    }
}

public static class ServiceLocator
{
    private static readonly Dictionary<Type, object> _services = new();
    
    public static T GetService<T>()
    {
        return (T)_services[typeof(T)];
    }
    
    public static void RegisterService<T>(T service)
    {
        _services[typeof(T)] = service;
    }
}
```

#### 3. **Factory Pattern**

```cs
public interface IOrderServiceFactory
{
    OrderService CreateOrderService();
}

public class OrderServiceFactory : IOrderServiceFactory
{
    public OrderService CreateOrderService()
    {
        var repository = new SqlServerRepository();
        var emailService = new SmtpEmailService();
        var logger = new ConsoleLogger();
        
        return new OrderService(repository, emailService, logger);
    }
}
```

#### 4. **Template Method Pattern**

```cs
public abstract class BaseOrderProcessor
{
    // Template method - алгоритм определен в базовом классе
    public async Task ProcessAsync(Order order)
    {
        ValidateOrder(order);
        await SaveOrderAsync(order);      // Инверсия - реализация в наследнике
        await SendNotificationAsync(order); // Инверсия - реализация в наследнике
    }
    
    // Абстрактные методы - контроль передан наследникам
    protected abstract Task SaveOrderAsync(Order order);
    protected abstract Task SendNotificationAsync(Order order);
    
    private void ValidateOrder(Order order)
    {
        // Общая валидация
    }
}
```

## DI (Dependency Injection) — Внедрение зависимостей

**DI** — это **конкретная техника реализации IoC**, при которой зависимости передаются объекту извне.

### Типы Dependency Injection

#### 1. **Constructor Injection** (рекомендуемый)

```cs
public class OrderService
{
    private readonly IOrderRepository _repository;
    private readonly IEmailService _emailService;
    
    // Все обязательные зависимости через конструктор
    public OrderService(IOrderRepository repository, IEmailService emailService)
    {
        _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        _emailService = emailService ?? throw new ArgumentNullException(nameof(emailService));
    }
    
    public async Task ProcessOrderAsync(Order order)
    {
        await _repository.SaveAsync(order);
        await _emailService.SendOrderConfirmationAsync(order.CustomerEmail, order);
    }
}
```

#### 2. **Property Injection**

```cs
public class OrderService
{
    // Опциональные зависимости через свойства
    public ILogger Logger { get; set; } = new NullLogger(); // Default implementation
    public IMetrics Metrics { get; set; }
    
    private readonly IOrderRepository _repository;
    
    public OrderService(IOrderRepository repository)
    {
        _repository = repository;
    }
    
    public async Task ProcessOrderAsync(Order order)
    {
        Logger?.Log("Processing order");
        Metrics?.IncrementCounter("orders.processed");
        
        await _repository.SaveAsync(order);
    }
}
```

#### 3. **Method Injection**

```cs
public class OrderService
{
    private readonly IOrderRepository _repository;
    
    public OrderService(IOrderRepository repository)
    {
        _repository = repository;
    }
    
    // Зависимость передается в метод
    public async Task ProcessOrderAsync(Order order, IEmailService emailService)
    {
        await _repository.SaveAsync(order);
        
        if (emailService != null)
        {
            await emailService.SendOrderConfirmationAsync(order.CustomerEmail, order);
        }
    }
}
```

#### 4. **Interface Injection** (редко используется)

```cs
public interface IEmailServiceInjector
{
    void InjectEmailService(IEmailService emailService);
}

public class OrderService : IEmailServiceInjector
{
    private IEmailService _emailService;
    
    public void InjectEmailService(IEmailService emailService)
    {
        _emailService = emailService;
    }
    
    public async Task ProcessOrderAsync(Order order)
    {
        if (_emailService != null)
        {
            await _emailService.SendOrderConfirmationAsync(order.CustomerEmail, order);
        }
    }
}
```

## DI Containers (IoC Containers) — Контейнеры внедрения зависимостей

**DI Container** — это **инструмент**, который автоматизирует процесс создания объектов и внедрения зависимостей.

### Встроенный DI в .NET

```cs
// Program.cs или Startup.cs
public class Program
{
    public static void Main(string[] args)
    {
        // Создаем контейнер
        var services = new ServiceCollection();
        
        // Регистрируем зависимости
        services.AddScoped<IOrderRepository, SqlServerRepository>();
        services.AddScoped<IEmailService, SmtpEmailService>();
        services.AddSingleton<ILogger, ConsoleLogger>();
        services.AddTransient<OrderService>();
        
        // Строим контейнер
        var serviceProvider = services.BuildServiceProvider();
        
        // Получаем сервис - контейнер автоматически создаст все зависимости
        var orderService = serviceProvider.GetService<OrderService>();
        
        // Используем
        var order = new Order { CustomerEmail = "test@example.com" };
        await orderService.ProcessOrderAsync(order);
    }
}
```

### Lifetimes в DI Container

```cs
public void ConfigureServices(IServiceCollection services)
{
    // Singleton - один экземпляр на все приложение
    services.AddSingleton<ILogger, FileLogger>();
    
    // Scoped - один экземпляр на HTTP запрос (или scope)
    services.AddScoped<IOrderRepository, SqlServerRepository>();
    services.AddScoped<IEmailService, SmtpEmailService>();
    
    // Transient - новый экземпляр при каждом запросе
    services.AddTransient<OrderService>();
    services.AddTransient<IValidator<Order>, OrderValidator>();
    
    // Регистрация с фабрикой
    services.AddScoped<IEmailService>(provider =>
    {
        var config = provider.GetService<IConfiguration>();
        var smtpHost = config["Smtp:Host"];
        return new SmtpEmailService(smtpHost);
    });
    
    // Регистрация экземпляра
    services.AddSingleton<IConfiguration>(new ConfigurationBuilder()
        .AddJsonFile("appsettings.json")
        .Build());
}
```

### Продвинутые возможности DI (декораторы)

```cs
// Декораторы
public class CachedOrderRepository : IOrderRepository
{
    private readonly IOrderRepository _innerRepository;
    private readonly IMemoryCache _cache;
    
    public CachedOrderRepository(IOrderRepository innerRepository, IMemoryCache cache)
    {
        _innerRepository = innerRepository;
        _cache = cache;
    }
    
    public async Task<Order> GetByIdAsync(int id)
    {
        var cacheKey = $"order:{id}";
        
        if (_cache.TryGetValue(cacheKey, out Order cachedOrder))
        {
            return cachedOrder;
        }
        
        var order = await _innerRepository.GetByIdAsync(id);
        _cache.Set(cacheKey, order, TimeSpan.FromMinutes(5));
        
        return order;
    }
    
    public async Task SaveAsync(Order order)
    {
        await _innerRepository.SaveAsync(order);
        _cache.Remove($"order:{order.Id}");
    }
}

// Регистрация декоратора
services.AddScoped<SqlServerRepository>();
services.AddScoped<IOrderRepository>(provider =>
{
    var sqlRepository = provider.GetService<SqlServerRepository>();
    var cache = provider.GetService<IMemoryCache>();
    return new CachedOrderRepository(sqlRepository, cache);
});
```

### Factory Pattern с DI

```cs
public interface IPaymentProcessorFactory
{
    IPaymentProcessor CreateProcessor(PaymentMethod method);
}

public class PaymentProcessorFactory : IPaymentProcessorFactory
{
    private readonly IServiceProvider _serviceProvider;
    
    public PaymentProcessorFactory(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }
    
    public IPaymentProcessor CreateProcessor(PaymentMethod method)
    {
        return method switch
        {
            PaymentMethod.CreditCard => _serviceProvider.GetService<CreditCardProcessor>(),
            PaymentMethod.PayPal => _serviceProvider.GetService<PayPalProcessor>(),
            PaymentMethod.BankTransfer => _serviceProvider.GetService<BankTransferProcessor>(),
            _ => throw new ArgumentException($"Unsupported payment method: {method}")
        };
    }
}

// Регистрация
services.AddScoped<CreditCardProcessor>();
services.AddScoped<PayPalProcessor>();
services.AddScoped<BankTransferProcessor>();
services.AddScoped<IPaymentProcessorFactory, PaymentProcessorFactory>();
```

## Как все связано: Полная картина

```cs
// 1. DIP - принцип проектирования
// Высокоуровневые модули зависят от абстракций
public class OrderController : ControllerBase
{
    private readonly IOrderService _orderService; // Зависим от интерфейса, не от реализации
    
    public OrderController(IOrderService orderService) // DI - получаем зависимость извне
    {
        _orderService = orderService;
    }
    
    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request)
    {
        var order = new Order(request.CustomerId, request.Items);
        await _orderService.ProcessOrderAsync(order);
        return Ok();
    }
}

// 2. Абстракция (следуем DIP)
public interface IOrderService
{
    Task ProcessOrderAsync(Order order);
}

// 3. Реализация зависит от абстракций (DIP)
public class OrderService : IOrderService
{
    private readonly IOrderRepository _repository;
    private readonly IEmailService _emailService;
    private readonly ILogger<OrderService> _logger;
    
    // Constructor Injection (техника DI)
    public OrderService(
        IOrderRepository repository,
        IEmailService emailService,
        ILogger<OrderService> logger)
    {
        _repository = repository;
        _emailService = emailService;
        _logger = logger;
    }
    
    public async Task ProcessOrderAsync(Order order)
    {
        _logger.LogInformation("Processing order {OrderId}", order.Id);
        
        await _repository.SaveAsync(order);
        await _emailService.SendOrderConfirmationAsync(order.CustomerEmail, order);
        
        _logger.LogInformation("Order {OrderId} processed successfully", order.Id);
    }
}

// 4. Конкретные реализации
public class SqlServerOrderRepository : IOrderRepository
{
    private readonly string _connectionString;
    
    public SqlServerOrderRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection");
    }
    
    public async Task SaveAsync(Order order)
    {
        // SQL Server implementation
    }
}

public class SmtpEmailService : IEmailService
{
    private readonly SmtpSettings _settings;
    
    public SmtpEmailService(IOptions<SmtpSettings> settings)
    {
        _settings = settings.Value;
    }
    
    public async Task SendOrderConfirmationAsync(string email, Order order)
    {
        // SMTP implementation
    }
}

// 5. Конфигурация DI Container (IoC Container)
public class Startup
{
    public void ConfigureServices(IServiceCollection services)
    {
        // Регистрируем зависимости в IoC контейнере
        services.AddScoped<IOrderService, OrderService>();
        services.AddScoped<IOrderRepository, SqlServerOrderRepository>();
        services.AddScoped<IEmailService, SmtpEmailService>();
        
        // Настройки
        services.Configure<SmtpSettings>(Configuration.GetSection("Smtp"));
        
        // Контроллеры
        services.AddControllers();
    }
}
```

## Взаимосвязь концепций

```
DIP (Принцип)
    ↓
IoC (Общий принцип инверсии управления)
    ↓
DI (Конкретная техника реализации IoC)
    ↓
DI Container (Инструмент для автоматизации DI)
```

### Таблица взаимосвязей

|Концепция|Что это|Зачем|Как реализуется|
|---|---|---|---|
|**DIP**|Принцип проектирования|Уменьшить связанность между модулями|Зависимости от абстракций, не от реализаций|
|**IoC**|Общий принцип|Передать управление внешнему компоненту|DI, Service Locator, Factory, Template Method|
|**DI**|Техника реализации IoC|Внедрить зависимости извне|Constructor/Property/Method Injection|
|**DI Container**|Инструмент автоматизации|Автоматическое создание и внедрение|ServiceCollection, Autofac, Unity, etc.|

## Преимущества всей связки

### 1. **Тестируемость**

```cs
[Test]
public async Task ProcessOrder_ShouldSaveAndSendEmail()
{
    // Arrange - легко мокаем зависимости
    var mockRepository = new Mock<IOrderRepository>();
    var mockEmailService = new Mock<IEmailService>();
    var mockLogger = new Mock<ILogger<OrderService>>();
    
    var orderService = new OrderService(
        mockRepository.Object,
        mockEmailService.Object,
        mockLogger.Object);
    
    var order = new Order { Id = 1, CustomerEmail = "test@example.com" };
    
    // Act
    await orderService.ProcessOrderAsync(order);
    
    // Assert
    mockRepository.Verify(r => r.SaveAsync(order), Times.Once);
    mockEmailService.Verify(e => e.SendOrderConfirmationAsync(order.CustomerEmail, order), Times.Once);
}
```

### 2. **Гибкость конфигурации**

```cs
// Development
services.AddScoped<IEmailService, FakeEmailService>(); // Не отправляем реальные emails

// Production  
services.AddScoped<IEmailService, SmtpEmailService>(); // Реальная отправка

// Testing
services.AddScoped<IEmailService, MockEmailService>(); // Моки для тестов
```

### 3. **Расширяемость**

```cs
// Легко добавить новую реализацию
public class SendGridEmailService : IEmailService
{
    public async Task SendOrderConfirmationAsync(string email, Order order)
    {
        // SendGrid API implementation
    }
}

// Просто меняем регистрацию
services.AddScoped<IEmailService, SendGridEmailService>();
```

### 4. **Декораторы и перехватчики**

```cs
// Добавляем логирование без изменения основного кода
public class LoggingOrderService : IOrderService
{
    private readonly IOrderService _innerService;
    private readonly ILogger _logger;
    
    public LoggingOrderService(IOrderService innerService, ILogger logger)
    {
        _innerService = innerService;
        _logger = logger;
    }
    
    public async Task ProcessOrderAsync(Order order)
    {
        _logger.Log($"Starting to process order {order.Id}");
        var stopwatch = Stopwatch.StartNew();
        
        try
        {
            await _innerService.ProcessOrderAsync(order);
            _logger.Log($"Order {order.Id} processed in {stopwatch.ElapsedMilliseconds}ms");
        }
        catch (Exception ex)
        {
            _logger.Log($"Error processing order {order.Id}: {ex.Message}");
            throw;
        }
    }
}
```

## Заключение

**Все концепции работают вместе:**

1. **DIP** — задает архитектурное направление (зависеть от абстракций)
2. **IoC** — определяет способ передачи управления (не создавай сам, получай извне)
3. **DI** — предоставляет конкретную технику (внедрение через конструктор/свойства/методы)
4. **DI Container** — автоматизирует процесс (регистрация + автоматическое разрешение зависимостей)

Результат: **слабосвязанный, тестируемый, гибкий и расширяемый код** 🎯