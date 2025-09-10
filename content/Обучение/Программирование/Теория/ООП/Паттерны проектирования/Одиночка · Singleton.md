**Singleton** — это порождающий паттерн проектирования, который гарантирует, что у класса есть только один экземпляр, и предоставляет глобальную точку доступа к нему.

## Классическая реализация

```csharp
public sealed class Singleton
{
    private static Singleton _instance;
    private static readonly object _lock = new object();
    
    private Singleton() { } // Приватный конструктор
    
    public static Singleton Instance
    {
        get
        {
            if (_instance == null)
            {
                lock (_lock)
                {
                    if (_instance == null)
                        _instance = new Singleton();
                }
            }
            return _instance;
        }
    }
    
    public void DoSomething()
    {
        Console.WriteLine("Doing something...");
    }
}
```

## Современные реализации в C\#

### 1. Thread-safe через Lazy\<T>

```csharp
public sealed class ModernSingleton
{
    private static readonly Lazy<ModernSingleton> _lazy = 
        new Lazy<ModernSingleton>(() => new ModernSingleton());
    
    private ModernSingleton() { }
    
    public static ModernSingleton Instance => _lazy.Value;
}
```

### 2. Через статический конструктор

```csharp
public sealed class StaticSingleton
{
    private static readonly StaticSingleton _instance = new StaticSingleton();
    
    static StaticSingleton() { } // Принудительная инициализация
    
    private StaticSingleton() { }
    
    public static StaticSingleton Instance => _instance;
}
```

## Типичные примеры использования

### 1. Логгер

```csharp
public sealed class Logger
{
    private static readonly Lazy<Logger> _instance = new Lazy<Logger>(() => new Logger());
    private readonly StreamWriter _writer;
    
    private Logger()
    {
        _writer = new StreamWriter("app.log", append: true);
    }
    
    public static Logger Instance => _instance.Value;
    
    public void Log(string message)
    {
        lock (_writer)
        {
            _writer.WriteLine($"{DateTime.Now}: {message}");
            _writer.Flush();
        }
    }
}

// Использование
Logger.Instance.Log("Application started");
```

### 2. Менеджер конфигурации

```csharp
public sealed class ConfigurationManager
{
    private static readonly Lazy<ConfigurationManager> _instance = 
        new Lazy<ConfigurationManager>(() => new ConfigurationManager());
    
    private readonly Dictionary<string, string> _settings;
    
    private ConfigurationManager()
    {
        _settings = LoadConfiguration();
    }
    
    public static ConfigurationManager Instance => _instance.Value;
    
    public string GetSetting(string key) => _settings.TryGetValue(key, out var value) ? value : null;
    
    private Dictionary<string, string> LoadConfiguration()
    {
        // Загрузка конфигурации из файла/БД
        return new Dictionary<string, string>();
    }
}
```

### 3. Подключение к базе данных

```csharp
public sealed class DatabaseConnection
{
    private static readonly Lazy<DatabaseConnection> _instance = 
        new Lazy<DatabaseConnection>(() => new DatabaseConnection());
    
    private readonly IDbConnection _connection;
    
    private DatabaseConnection()
    {
        _connection = new SqlConnection(connectionString);
        _connection.Open();
    }
    
    public static DatabaseConnection Instance => _instance.Value;
    
    public IDbConnection Connection => _connection;
}
```

## ✅ Плюсы Singleton

### 1. Контроль количества экземпляров

```csharp
// Гарантия единственности
var logger1 = Logger.Instance;
var logger2 = Logger.Instance;
Console.WriteLine(ReferenceEquals(logger1, logger2)); // True
```

### 2. Глобальная точка доступа

```csharp
// Доступ из любого места приложения
public class OrderService
{
    public void ProcessOrder(Order order)
    {
        Logger.Instance.Log($"Processing order {order.Id}");
        // Не нужно передавать логгер как зависимость
    }
}
```

### 3. Ленивая инициализация

```csharp
// Создается только при первом обращении
public class ExpensiveResource
{
    private ExpensiveResource()
    {
        // Дорогая инициализация выполняется только один раз
        Thread.Sleep(5000); // Имитация долгой загрузки
    }
}
```

### 4. Экономия памяти

```csharp
// Один экземпляр вместо множества одинаковых объектов
public class CacheManager
{
    private readonly Dictionary<string, object> _cache = new();
    
    // Все части приложения используют один кэш
}
```

## ❌ Минусы Singleton

### 1. Нарушение Single Responsibility Principle

```csharp
// ПЛОХО - класс отвечает за бизнес-логику И за управление экземпляром
public sealed class UserService
{
    private static readonly Lazy<UserService> _instance = new Lazy<UserService>(() => new UserService());
    
    public static UserService Instance => _instance.Value; // Управление жизненным циклом
    
    public User GetUser(int id) { /* бизнес-логика */ }   // Бизнес-логика
    public void SaveUser(User user) { /* бизнес-логика */ }
}
```

### 2. Скрытые зависимости

```csharp
// ПЛОХО - неочевидные зависимости
public class OrderProcessor
{
    public void ProcessOrder(Order order)
    {
        // Скрытая зависимость! Не видно из сигнатуры метода
        Logger.Instance.Log("Processing order");
        EmailService.Instance.SendConfirmation(order.Email);
        PaymentGateway.Instance.ProcessPayment(order.Amount);
    }
}

// ХОРОШО - explicit dependencies
public class OrderProcessor
{
    private readonly ILogger _logger;
    private readonly IEmailService _emailService;
    private readonly IPaymentGateway _paymentGateway;
    
    public OrderProcessor(ILogger logger, IEmailService emailService, IPaymentGateway paymentGateway)
    {
        _logger = logger;
        _emailService = emailService;
        _paymentGateway = paymentGateway;
    }
}
```

### 3. Проблемы с тестированием

```csharp
[Test]
public void TestOrderProcessing()
{
    // ПРОБЛЕМА: нельзя замокать Singleton
    var processor = new OrderProcessor();
    
    // Logger.Instance всегда реальный объект
    // Нельзя проверить, что логирование произошло
    // Нельзя изолировать тест от файловой системы
    processor.ProcessOrder(new Order());
}

// Решение через DI
[Test]
public void TestOrderProcessing_WithDI()
{
    // Можно легко мокать
    var mockLogger = new Mock<ILogger>();
    var processor = new OrderProcessor(mockLogger.Object, ...);
    
    processor.ProcessOrder(new Order());
    
    mockLogger.Verify(x => x.Log(It.IsAny<string>()), Times.Once);
}
```

### 4. Проблемы в многопоточности

```csharp
// Даже thread-safe Singleton может создавать проблемы
public sealed class Counter
{
    private static readonly Lazy<Counter> _instance = new Lazy<Counter>(() => new Counter());
    private int _count = 0;
    
    public static Counter Instance => _instance.Value;
    
    public void Increment()
    {
        _count++; // Race condition! Не thread-safe
    }
    
    public int GetCount() => _count;
}
```

### 5. Глобальное состояние

```csharp
// Изменения в одном месте влияют на все приложение
public class UserSession
{
    public User CurrentUser { get; set; }
    
    public void Login(User user)
    {
        CurrentUser = user;
        // Все части приложения видят это изменение
    }
}

// В разных частях кода
UserSession.Instance.CurrentUser = adminUser;  // Где-то в коде
// ...
if (UserSession.Instance.CurrentUser.IsAdmin)  // В другом месте - неожиданное поведение
{
    // Может быть не тот пользователь!
}
```

## Нарушения SOLID принципов

### 1. Single Responsibility Principle ❌

```csharp
// Класс отвечает за 2 вещи: бизнес-логику и управление экземпляром
public class ConfigurationManager
{
    // Ответственность 1: управление жизненным циклом
    private static ConfigurationManager _instance;
    public static ConfigurationManager Instance { get; }
    
    // Ответственность 2: работа с конфигурацией  
    public string GetSetting(string key) { }
    public void SaveSetting(string key, string value) { }
}
```

### 2. Open/Closed Principle ❌

```csharp
// Сложно расширить поведение без модификации
public sealed class Logger // sealed - нельзя наследовать
{
    public void Log(string message)
    {
        // Фиксированная логика - сложно изменить
        File.AppendAllText("log.txt", message);
    }
}
```

#### ❌ Extension методы НЕ могут:

- Изменить существующее поведение
- Получить доступ к приватным полям
- Заменить реализацию для тестирования
- Создать полиморфные варианты
- "Вклиниться" в существующие методы

#### ✅ Правильное решение:

- **Dependency Injection** вместо прямого обращения к Singleton
- **Интерфейсы** для абстракции
- **[[Декораторы в DI|Декораторы]]** для добавления функциональности
- **Композиция** для комбинирования поведений
### 3. Dependency Inversion Principle ❌

```csharp
// Высокоуровневые модули зависят от низкоуровневых
public class OrderService // Высокий уровень
{
    public void ProcessOrder(Order order)
    {
        // Прямая зависимость от конкретного класса (низкий уровень)
        FileLogger.Instance.Log("Order processed");
    }
}
```

## Альтернативы Singleton в продакшн

### 1. Dependency Injection Container

```csharp
// Вместо Singleton
public interface ILogger
{
    void Log(string message);
}

public class FileLogger : ILogger
{
    public void Log(string message) { /* implementation */ }
}

// Регистрация как Singleton в DI контейнере
services.AddSingleton<ILogger, FileLogger>();

// Использование
public class OrderService
{
    private readonly ILogger _logger;
    
    public OrderService(ILogger logger) // Инъекция зависимости
    {
        _logger = logger;
    }
}
```

### 2. Static класс для [[stateless операции|stateless операций]]

```csharp
// Для утилитарных методов без состояния
public static class MathUtils
{
    public static double CalculateDistance(Point a, Point b)
    {
        return Math.Sqrt(Math.Pow(b.X - a.X, 2) + Math.Pow(b.Y - a.Y, 2));
    }
}
```

### 3. Factory паттерн

```csharp
public interface IConnectionFactory
{
    IDbConnection CreateConnection();
}

public class SqlConnectionFactory : IConnectionFactory
{
    private readonly string _connectionString;
    
    public IDbConnection CreateConnection()
    {
        return new SqlConnection(_connectionString);
    }
}
```

## Когда Singleton оправдан

### ✅ Подходящие сценарии:

- **Системные ресурсы** (драйверы, подключения к оборудованию)
- **Кэши** (когда нужен единый кэш для всего приложения)
- **Логирование** (в простых приложениях)
- **Конфигурация** (read-only настройки)

### ❌ Избегайте для:

- **Бизнес-логики**
- **Сервисов** (лучше через DI)
- **Объектов с изменяемым состоянием**
- **Всего, что нужно тестировать**

## Современный подход

```csharp
// Современная альтернativa - использование DI
public interface IApplicationSettings
{
    string GetSetting(string key);
}

public class ApplicationSettings : IApplicationSettings
{
    public string GetSetting(string key) { /* implementation */ }
}

// Startup.cs
services.AddSingleton<IApplicationSettings, ApplicationSettings>();

// Использование
public class SomeService
{
    private readonly IApplicationSettings _settings;
    
    public SomeService(IApplicationSettings settings)
    {
        _settings = settings; // Тестируемо и гибко
    }
}
```

## Вывод

**Singleton** — это мощный паттерн, но он имеет серьезные недостатки в современной разработке. В продакшн-приложениях лучше использовать **Dependency Injection** для управления жизненным циклом объектов, что обеспечивает:

- ✅ Лучшую тестируемость
- ✅ Соблюдение SOLID принципов
- ✅ Гибкость в конфигурации
- ✅ Явные зависимости
- ✅ Легкую замену реализаций

Singleton стоит рассматривать только для **системных ресурсов** и **простых утилитарных случаев**, где альтернативы слишком сложны.