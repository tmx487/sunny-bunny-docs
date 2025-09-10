### **Через конструктор**

```csharp
public class OrderService
{
    private readonly IRepository _repository;
    private readonly ILogger _logger;

    public OrderService(IRepository repository, ILogger logger)
    {
        _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }
}
```

**Преимущества**:

- Явная зависимость, видна в сигнатуре конструктора
- Обеспечивает иммутабельность зависимостей
- Гарантирует, что объект полностью инициализирован

### **Через свойство**

```csharp
public class OrderService
{
    public IRepository Repository { get; set; }
    public ILogger Logger { get; set; }
    
    public void ProcessOrder(Order order)
    {
        Repository?.Save(order);
        Logger?.Log("Order processed");
    }
}
```
**Преимущества**:

- Удобно для опциональных зависимостей
- Возможность изменить зависимость после создания объекта
### **Через метод**

```csharp
public class OrderService
{
    public void ProcessOrder(Order order, IPaymentProcessor paymentProcessor)
    {
        paymentProcessor.Process(order.Payment);
        // Остальная логика...
    }
}
```
**Преимущества**:

- Зависимость нужна только для конкретного метода
- Разные вызовы могут использовать разные реализации

### **Service Locator**

```csharp
public class OrderService
{
    public void ProcessOrder(Order order)
    {
        var repository = ServiceLocator.Current.GetInstance<IRepository>();
        var logger = ServiceLocator.Current.GetInstance<ILogger>();
        
        repository.Save(order);
        logger.Log("Order processed");
    }
}
```
**Примечание**: Этот подход считается антипаттерном в строгом DI, но иногда применяется.

### **Встроенный DI-контейнер .NET**

```csharp
// В Startup.cs или Program.cs
services.AddScoped<IRepository, SqlRepository>();
services.AddSingleton<ILogger, ConsoleLogger>();
services.AddTransient<OrderService>();

// Использование
public class OrderController : ControllerBase
{
    private readonly OrderService _orderService;
    
    public OrderController(OrderService orderService)
    {
        _orderService = orderService;
    }
}
```
**Примечание**: появился в .net core/.net 5+
### **Сторонние DI-контейнеры**

Несмотря на встроенный DI, многие проекты используют сторонние контейнеры:

- **Autofac**
- **Unity**
- **Ninject**
- **StructureMap/Lamar**
- **Castle Windsor**

```csharp
// Пример с Autofac
var builder = new ContainerBuilder();
builder.RegisterType<SqlRepository>().As<IRepository>();
builder.RegisterType<ConsoleLogger>().As<ILogger>().SingleInstance();
builder.RegisterType<OrderService>();
var container = builder.Build();

var orderService = container.Resolve<OrderService>();
```
### **Внедрение через атрибуты**

Используется в некоторых фреймворках (например, в ASP.NET с помощью атрибута `[Inject]`):
```csharp
public class HomeController : Controller
{
    [Inject]
    public ILogger Logger { get; set; }
}
```
### **Внедрение через статический контекст**

Используется в редких случаях для глобального доступа:
```csharp
public static class DependencyContext
{
    public static IServiceProvider Services { get; set; }
}

// Использование
var logger = DependencyContext.Services.GetService<ILogger>();
```
### **Фабричный метод (Factory Method Injection)**

Фабричный метод (Factory Method Injection) — это особая разновидность внедрения зависимостей в C#, которая используется, когда требуется создавать экземпляры зависимостей динамически в процессе работы приложения.

#### Принцип работы

Вместо внедрения конкретного экземпляра зависимости, внедряется фабрика (или делегат), которая может создавать экземпляры по запросу. Обычно для этого используются делегаты `Func<T>` или специальные фабричные интерфейсы.

##### Пример базовой реализации с делегатом
```csharp
public class OrderProcessor
{
    private readonly Func<IPaymentGateway> _paymentGatewayFactory;
    
    // Внедрение фабричного метода через конструктор
    public OrderProcessor(Func<IPaymentGateway> paymentGatewayFactory)
    {
        _paymentGatewayFactory = paymentGatewayFactory ?? throw new ArgumentNullException(nameof(paymentGatewayFactory));
    }
    
    public void ProcessOrder(Order order)
    {
        // Создание нового экземпляра для каждого заказа
        IPaymentGateway gateway = _paymentGatewayFactory();
        gateway.ProcessPayment(order.Payment);
        
        // Остальная логика обработки заказа...
    }
}
```
##### Регистрация в DI-контейнере

```csharp
// В стандартном DI-контейнере .NET
services.AddTransient<IPaymentGateway, StripePaymentGateway>();
services.AddTransient<OrderProcessor>();

// Или явная регистрация фабрики
services.AddTransient<Func<IPaymentGateway>>(sp => () => sp.GetService<IPaymentGateway>());
```
##### Пример с фабричным интерфейсом

```csharp
// Интерфейс фабрики
public interface IPaymentGatewayFactory
{
    IPaymentGateway Create(PaymentMethod method);
}

// Реализация фабрики
public class PaymentGatewayFactory : IPaymentGatewayFactory
{
    public IPaymentGateway Create(PaymentMethod method)
    {
        switch (method)
        {
            case PaymentMethod.CreditCard:
                return new CreditCardGateway();
            case PaymentMethod.PayPal:
                return new PayPalGateway();
            case PaymentMethod.Bitcoin:
                return new BitcoinGateway();
            default:
                throw new ArgumentOutOfRangeException(nameof(method));
        }
    }
}

// Использование фабрики
public class OrderProcessor
{
    private readonly IPaymentGatewayFactory _gatewayFactory;
    
    public OrderProcessor(IPaymentGatewayFactory gatewayFactory)
    {
        _gatewayFactory = gatewayFactory;
    }
    
    public void ProcessOrder(Order order)
    {
        var gateway = _gatewayFactory.Create(order.PaymentMethod);
        gateway.ProcessPayment(order.Payment);
    }
}
```

##### Применение фабричного метода с параметрами

```csharp
public class NotificationService
{
    private readonly Func<string, INotifier> _notifierFactory;
    
    public NotificationService(Func<string, INotifier> notifierFactory)
    {
        _notifierFactory = notifierFactory;
    }
    
    public void SendNotifications(User user)
    {
        foreach (var channel in user.NotificationChannels)
        {
            var notifier = _notifierFactory(channel);
            notifier.Notify(user, "Your order has been processed");
        }
    }
}

// Регистрация в DI:
services.AddTransient<INotifier, EmailNotifier>(sp => new EmailNotifier("email"));
services.AddTransient<INotifier, SmsNotifier>(sp => new SmsNotifier("sms"));
services.AddTransient<Func<string, INotifier>>(sp => channel => 
{
    return channel switch
    {
        "email" => sp.GetService<EmailNotifier>(),
        "sms" => sp.GetService<SmsNotifier>(),
        _ => throw new ArgumentException($"Unknown channel: {channel}")
    };
});
```
##### Преимущества фабричного метода

1. **Отложенное создание** — зависимости создаются только когда нужны
2. **Динамический выбор реализации** — можно выбирать конкретную реализацию на основе контекста
3. **Новые экземпляры** — каждый вызов получает новый экземпляр, что может быть важно для некоторых компонентов
4. **Параметризация создания** — можно передавать параметры при создании объектов
5. **Управление жизненным циклом** — точный контроль над созданием и освобождением ресурсов
##### Фабричный метод особенно полезен, когда:

- Вам нужно выбирать реализацию зависимости в runtime
- Зависимость требует параметров, доступных только во время выполнения
- Каждая операция должна получать новый экземпляр зависимости
- Создание зависимости — сложный процесс с множеством вариантов
- Вам нужно инкапсулировать логику создания объектов
## Рекомендации по выбору

- **Для большинства случаев**: используйте конструкторную инъекцию
- **Для опциональных зависимостей**: подойдет инъекция через свойства
- **Для конкретных операций**: рассмотрите инъекцию через метод
- **Для сложной инициализации**: фабричный метод
- **Для современных .NET приложений**: встроенный DI-контейнер
- **Для крупных проектов с особыми требованиями**: сторонние контейнеры