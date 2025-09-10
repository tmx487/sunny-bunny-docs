Отличие **наследования** от **композиции** — в способе **переиспользования кода** и **организации связей между объектами**.

---

## 🧬 Наследование (`is-a` — "является")

> Класс наследует поведение и структуру от базового класса.

### 📌 Пример:

```csharp
class Animal {
    public void Breathe() => Console.WriteLine("Breathing");
}

class Dog : Animal {
    public void Bark() => Console.WriteLine("Barking");
}
```

➡ `Dog` **является** `Animal` → можно использовать `Dog` там, где ожидается `Animal`.

| ✅ Плюсы:                                                                   | ❌ Минусы:                                                                                                                                                                                                                                                                   |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| - Повторное использование кода.<br>    <br>- Упрощённая структура классов. | - Жёсткая связность.<br>    <br>- Трудно переопределять поведение без нарушений принципов SOLID.<br>    <br>- Изменения в базовом классе могут **ломать** поведение наследников.<br>    <br>- Плохо подходит для **динамического изменения поведения во время выполнения**. |

---

## 🧱 Композиция (`has-a` — "содержит")

> Один объект содержит другой и делегирует ему часть поведения.

### 📌 Пример:

```csharp
class Engine {
    public void Start() => Console.WriteLine("Engine starting...");
}

class Car {
    private readonly Engine _engine = new Engine();
    public void Start() => _engine.Start();
}
```

➡ `Car` **имеет** `Engine`, но **не является** им.

| ✅ Плюсы                                                                                                                                                                                                                                            | ❌ Минусы                                                                                                                              |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| - Гибкость: легко подменить или заменить поведение.<br>    <br>- Лучше для unit-тестирования.<br>    <br>- Следует принципу **"предпочитай композицию наследованию"**.<br>    <br>- Лучше соответствует принципу **единственной ответственности**. | - Иногда нужно больше кода.<br>    <br>- Не такая «естественная» модель, если ты моделируешь иерархии (например, `Square` → `Shape`). |

---

## 🧠 Когда использовать что?

|Ситуация|Выбор|
|---|---|
|Поведение общее, иерархия "является"|Наследование|
|Поведение можно разбить на независимые части|Композиция|
|Нужно динамически изменять поведение|Композиция|
|Следуем SOLID/чистой архитектуре|Композиция предпочтительнее|

---

## 💡 Вывод:

- Наследование — "жёсткая" связь, работает хорошо, когда **реально есть отношение "является"**.
    
- Композиция — **более гибкий и безопасный** способ повторного использования кода.

# Практический пример

Отлично! Ниже — **пример одной и той же задачи** двумя способами: сначала с **наследованием**, затем с **композицией**.

---

## 📌 Сценарий:

Есть базовый функционал — **логирование действий**. Мы хотим, чтобы объекты могли "что-то делать" и автоматически логировать эти действия.

---

## 🧬 Вариант 1: **Наследование**

```csharp
class ActionBase {
    public void Log(string message) {
        Console.WriteLine($"[LOG]: {message}");
    }
}

class FileUploader : ActionBase {
    public void UploadFile() {
        Log("Uploading file...");
        // логика загрузки
    }
}
```

### ➕ Просто, быстро.

### ➖ Жёстко привязаны к `ActionBase`, нельзя изменить поведение логирования без переписывания всего класса или использования `virtual/override`.

---

## 🧱 Вариант 2: **Композиция**

```csharp
interface ILogger {
    void Log(string message);
}

class ConsoleLogger : ILogger {
    public void Log(string message) {
        Console.WriteLine($"[LOG]: {message}");
    }
}

class FileUploader {
    private readonly ILogger _logger;

    public FileUploader(ILogger logger) {
        _logger = logger;
    }

    public void UploadFile() {
        _logger.Log("Uploading file...");
        // логика загрузки
    }
}
```

### ➕ Более гибко:

- можно внедрить любой логгер (`ConsoleLogger`, `FileLogger`, `FakeLogger` для тестов);
    
- легко тестировать (заменив `ILogger` на мок).
    

### ➖ Требует немного больше кода, но даёт **высокую гибкость и слабо связанную архитектуру**.

---

## 🧠 Вывод:

- Наследование — **удобно, когда поведение фиксировано и общее**.
    
- Композиция — **лучше, когда нужна гибкость, расширяемость и модульность**, особенно в реальных проектах с зависимостями и тестами.

# Наследование vs Композиция: Продакшн примеры

Покажу на реальных примерах из продакшн-кода, когда использовать наследование, а когда композицию.

## Пример 1: Система логирования

### ❌ Неправильное наследование

```cs
// Плохой подход - наследование для добавления возможностей
public class Logger
{
    public virtual void Log(string message)
    {
        Console.WriteLine($"[LOG] {DateTime.Now}: {message}");
    }
}

public class DatabaseLogger : Logger
{
    private readonly string _connectionString;
    
    public override void Log(string message)
    {
        // Проблема: теряем консольное логирование
        SaveToDatabase(message);
    }
    
    private void SaveToDatabase(string message) { /* код БД */ }
}

public class FileLogger : Logger
{
    private readonly string _filePath;
    
    public override void Log(string message)
    {
        // Проблема: теряем консольное логирование
        SaveToFile(message);
    }
    
    private void SaveToFile(string message) { /* код файла */ }
}

// Проблемы:
// 1. Нельзя комбинировать (писать И в файл, И в БД)
// 2. Жесткая связанность
// 3. Нарушение SRP - класс знает КАК логировать
```

### ✅ Правильная композиция

```cs
// Интерфейс для цели логирования
public interface ILogTarget
{
    Task WriteAsync(string message);
}

// Конкретные реализации
public class ConsoleLogTarget : ILogTarget
{
    public Task WriteAsync(string message)
    {
        Console.WriteLine($"[LOG] {DateTime.Now}: {message}");
        return Task.CompletedTask;
    }
}

public class DatabaseLogTarget : ILogTarget
{
    private readonly string _connectionString;
    
    public DatabaseLogTarget(string connectionString)
    {
        _connectionString = connectionString;
    }
    
    public async Task WriteAsync(string message)
    {
        // Сохранение в БД
        using var connection = new SqlConnection(_connectionString);
        await connection.ExecuteAsync(
            "INSERT INTO Logs (Message, Timestamp) VALUES (@message, @timestamp)",
            new { message, timestamp = DateTime.Now });
    }
}

public class FileLogTarget : ILogTarget
{
    private readonly string _filePath;
    
    public FileLogTarget(string filePath)
    {
        _filePath = filePath;
    }
    
    public async Task WriteAsync(string message)
    {
        await File.AppendAllTextAsync(_filePath, 
            $"[LOG] {DateTime.Now}: {message}{Environment.NewLine}");
    }
}

// Главный логгер использует композицию
public class Logger
{
    private readonly List<ILogTarget> _targets;
    
    public Logger(params ILogTarget[] targets)
    {
        _targets = targets?.ToList() ?? new List<ILogTarget>();
    }
    
    public async Task LogAsync(string message)
    {
        var tasks = _targets.Select(target => target.WriteAsync(message));
        await Task.WhenAll(tasks);
    }
}

// Использование - гибкость!
var logger = new Logger(
    new ConsoleLogTarget(),
    new DatabaseLogTarget("connection_string"),
    new FileLogTarget("app.log")
);

await logger.LogAsync("Сообщение попадет во все три места!");
```

## Пример 2: Система уведомлений

### ❌ Неправильное наследование

```cs
public abstract class NotificationSender
{
    public abstract void Send(string message, string recipient);
}

public class EmailNotificationSender : NotificationSender
{
    public override void Send(string message, string recipient)
    {
        // Отправка email
    }
}

public class SmsNotificationSender : NotificationSender
{
    public override void Send(string message, string recipient)
    {
        // Отправка SMS
    }
}

// Проблема: как отправить И email, И SMS одновременно?
// Придется создавать EmailAndSmsNotificationSender - взрывной рост классов!
```

### ✅ Правильная композиция

```cs
public interface INotificationChannel
{
    Task SendAsync(string message, string recipient);
    bool SupportsRecipient(string recipient);
}

public class EmailChannel : INotificationChannel
{
    private readonly IEmailService _emailService;
    
    public EmailChannel(IEmailService emailService)
    {
        _emailService = emailService;
    }
    
    public async Task SendAsync(string message, string recipient)
    {
        await _emailService.SendAsync(recipient, "Уведомление", message);
    }
    
    public bool SupportsRecipient(string recipient) => recipient.Contains("@");
}

public class SmsChannel : INotificationChannel
{
    private readonly ISmsService _smsService;
    
    public SmsChannel(ISmsService smsService)
    {
        _smsService = smsService;
    }
    
    public async Task SendAsync(string message, string recipient)
    {
        await _smsService.SendAsync(recipient, message);
    }
    
    public bool SupportsRecipient(string recipient) => 
        Regex.IsMatch(recipient, @"^\+?\d{10,15}$");
}

public class PushChannel : INotificationChannel
{
    private readonly IPushService _pushService;
    
    public PushChannel(IPushService pushService)
    {
        _pushService = pushService;
    }
    
    public async Task SendAsync(string message, string recipient)
    {
        await _pushService.SendAsync(recipient, message);
    }
    
    public bool SupportsRecipient(string recipient) => 
        Guid.TryParse(recipient, out _); // Device ID
}

// Сервис уведомлений с композицией
public class NotificationService
{
    private readonly List<INotificationChannel> _channels;
    
    public NotificationService(IEnumerable<INotificationChannel> channels)
    {
        _channels = channels.ToList();
    }
    
    // Отправка через ВСЕ подходящие каналы
    public async Task SendToAllChannelsAsync(string message, string recipient)
    {
        var supportedChannels = _channels.Where(c => c.SupportsRecipient(recipient));
        var tasks = supportedChannels.Select(c => c.SendAsync(message, recipient));
        await Task.WhenAll(tasks);
    }
    
    // Отправка через конкретный канал
    public async Task SendViaChannelAsync<T>(string message, string recipient) 
        where T : INotificationChannel
    {
        var channel = _channels.OfType<T>().FirstOrDefault();
        if (channel?.SupportsRecipient(recipient) == true)
        {
            await channel.SendAsync(message, recipient);
        }
    }
}

// Настройка DI
services.AddScoped<INotificationChannel, EmailChannel>();
services.AddScoped<INotificationChannel, SmsChannel>();
services.AddScoped<INotificationChannel, PushChannel>();
services.AddScoped<NotificationService>();

// Использование
await notificationService.SendToAllChannelsAsync(
    "Важное сообщение", 
    "user@example.com"); // Отправится только на email

await notificationService.SendViaChannelAsync<SmsChannel>(
    "SMS уведомление", 
    "+1234567890");
```

## Пример 3: Когда наследование правильно - Controllers в ASP.NET Core

### ✅ Правильное наследование (истинное is-a отношение)

```cs
// Базовый контроллер с общей функциональностью
public abstract class BaseApiController : ControllerBase
{
    protected readonly ILogger _logger;
    protected readonly IMapper _mapper;
    
    protected BaseApiController(ILogger logger, IMapper mapper)
    {
        _logger = logger;
        _mapper = mapper;
    }
    
    // Общие методы для всех API контроллеров
    protected IActionResult HandleResult<T>(Result<T> result)
    {
        return result switch
        {
            { IsSuccess: true } => Ok(result.Value),
            { Error.Code: "NotFound" } => NotFound(result.Error.Message),
            { Error.Code: "Validation" } => BadRequest(result.Error.Message),
            _ => StatusCode(500, result.Error.Message)
        };
    }
    
    protected async Task<IActionResult> HandleCommandAsync<T>(ICommand<T> command)
    {
        try
        {
            var result = await Mediator.Send(command);
            return HandleResult(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing command {Command}", typeof(T).Name);
            return StatusCode(500, "Internal server error");
        }
    }
}

// Конкретные контроллеры ЯВЛЯЮТСЯ контроллерами API
[ApiController]
[Route("api/[controller]")]
public class UsersController : BaseApiController
{
    public UsersController(ILogger<UsersController> logger, IMapper mapper) 
        : base(logger, mapper) { }
    
    [HttpGet("{id}")]
    public async Task<IActionResult> GetUser(int id)
    {
        return await HandleCommandAsync(new GetUserQuery { Id = id });
    }
    
    [HttpPost]
    public async Task<IActionResult> CreateUser(CreateUserRequest request)
    {
        var command = _mapper.Map<CreateUserCommand>(request);
        return await HandleCommandAsync(command);
    }
}

[ApiController]
[Route("api/[controller]")]
public class OrdersController : BaseApiController
{
    public OrdersController(ILogger<OrdersController> logger, IMapper mapper) 
        : base(logger, mapper) { }
    
    [HttpGet("{id}")]
    public async Task<IActionResult> GetOrder(int id)
    {
        return await HandleCommandAsync(new GetOrderQuery { Id = id });
    }
}
```

## Пример 4: Система обработки платежей

### ❌ Неправильное наследование

```cs
public abstract class PaymentProcessor
{
    public abstract void ProcessPayment(decimal amount);
}

public class CreditCardPaymentProcessor : PaymentProcessor
{
    public override void ProcessPayment(decimal amount)
    {
        // Проблема: что если нужна валидация И логирование И уведомления?
        ValidateCreditCard();
        ProcessCreditCardPayment(amount);
        LogTransaction();
        SendNotification();
    }
}

// Проблемы:
// 1. Дублирование кода (валидация, логирование в каждом классе)
// 2. Сложно тестировать
// 3. Нарушение SRP
```

### ✅ Правильная композиция

```cs
// Интерфейсы для разных аспектов
public interface IPaymentValidator
{
    Task<ValidationResult> ValidateAsync(PaymentRequest request);
}

public interface IPaymentProcessor
{
    Task<PaymentResult> ProcessAsync(PaymentRequest request);
}

public interface IPaymentLogger
{
    Task LogTransactionAsync(PaymentRequest request, PaymentResult result);
}

public interface IPaymentNotifier
{
    Task NotifyAsync(PaymentRequest request, PaymentResult result);
}

// Конкретные реализации
public class CreditCardValidator : IPaymentValidator
{
    public async Task<ValidationResult> ValidateAsync(PaymentRequest request)
    {
        // Валидация кредитной карты
        return ValidationResult.Success();
    }
}

public class CreditCardProcessor : IPaymentProcessor
{
    private readonly IPaymentGateway _gateway;
    
    public CreditCardProcessor(IPaymentGateway gateway)
    {
        _gateway = gateway;
    }
    
    public async Task<PaymentResult> ProcessAsync(PaymentRequest request)
    {
        return await _gateway.ChargeAsync(request.Amount, request.CardToken);
    }
}

public class PaymentTransactionLogger : IPaymentLogger
{
    private readonly IRepository<PaymentLog> _repository;
    
    public async Task LogTransactionAsync(PaymentRequest request, PaymentResult result)
    {
        var log = new PaymentLog
        {
            Amount = request.Amount,
            Status = result.Status,
            TransactionId = result.TransactionId,
            Timestamp = DateTime.UtcNow
        };
        
        await _repository.AddAsync(log);
    }
}

// Главный сервис - композиция всех компонентов
public class PaymentService
{
    private readonly IPaymentValidator _validator;
    private readonly IPaymentProcessor _processor;
    private readonly IPaymentLogger _logger;
    private readonly IPaymentNotifier _notifier;
    
    public PaymentService(
        IPaymentValidator validator,
        IPaymentProcessor processor,
        IPaymentLogger logger,
        IPaymentNotifier notifier)
    {
        _validator = validator;
        _processor = processor;
        _logger = logger;
        _notifier = notifier;
    }
    
    public async Task<PaymentResult> ProcessPaymentAsync(PaymentRequest request)
    {
        // Композиция поведений
        var validationResult = await _validator.ValidateAsync(request);
        if (!validationResult.IsValid)
        {
            return PaymentResult.Failed(validationResult.Errors);
        }
        
        var result = await _processor.ProcessAsync(request);
        
        // Логирование и уведомления независимо от результата
        await _logger.LogTransactionAsync(request, result);
        await _notifier.NotifyAsync(request, result);
        
        return result;
    }
}

// Настройка DI для разных типов платежей
services.AddScoped<IPaymentValidator, CreditCardValidator>();
services.AddScoped<IPaymentProcessor, CreditCardProcessor>();
services.AddScoped<IPaymentLogger, PaymentTransactionLogger>();
services.AddScoped<IPaymentNotifier, EmailPaymentNotifier>();

// Для PayPal можно заменить только процессор и валидатор
services.AddScoped<IPaymentValidator, PayPalValidator>();
services.AddScoped<IPaymentProcessor, PayPalProcessor>();
// Логирование и уведомления остаются теми же!
```

## Ключевые принципы выбора

### Используйте наследование когда:

1. **Истинное "is-a" отношение**: `UsersController IS-A BaseApiController`
2. **Общий код и поведение**: базовый класс содержит логику, используемую всеми наследниками
3. **Полиморфизм необходим**: нужно обрабатывать объекты через базовый тип

### Используйте композицию когда:

1. **"Has-a" или "uses-a" отношения**: `PaymentService HAS-A validator, processor, logger`
2. **Гибкость комбинирования**: нужно миксовать разные поведения
3. **Независимые ответственности**: разные аспекты можно менять независимо
4. **Тестируемость**: легче мокать зависимости

### Правило из GoF:

**"Предпочитайте композицию наследованию"** - не потому что наследование плохо, а потому что композиция дает больше гибкости в большинстве случаев.