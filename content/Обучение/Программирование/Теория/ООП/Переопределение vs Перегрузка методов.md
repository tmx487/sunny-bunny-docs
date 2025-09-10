## Перегрузка (Overloading) - один класс, разные сигнатуры

**Перегрузка** — это определение нескольких методов с **одинаковым именем**, но **разными параметрами** в **одном классе**.

```cs
public class Calculator
{
    // Перегружаем метод Add для разных типов и количества параметров
    
    // 1. Два int
    public int Add(int a, int b)
    {
        Console.WriteLine("Add(int, int)");
        return a + b;
    }
    
    // 2. Три int
    public int Add(int a, int b, int c)
    {
        Console.WriteLine("Add(int, int, int)");
        return a + b + c;
    }
    
    // 3. Два double
    public double Add(double a, double b)
    {
        Console.WriteLine("Add(double, double)");
        return a + b;
    }
    
    // 4. Массив int
    public int Add(params int[] numbers)
    {
        Console.WriteLine("Add(params int[])");
        return numbers.Sum();
    }
    
    // 5. string (конкатенация)
    public string Add(string a, string b)
    {
        Console.WriteLine("Add(string, string)");
        return a + b;
    }
}

// Использование - компилятор выбирает нужную перегрузку
var calc = new Calculator();

calc.Add(5, 3);           // Вызовется Add(int, int) → 8
calc.Add(5, 3, 2);        // Вызовется Add(int, int, int) → 10
calc.Add(5.5, 3.2);       // Вызовется Add(double, double) → 8.7
calc.Add(1, 2, 3, 4, 5);  // Вызовется Add(params int[]) → 15
calc.Add("Hello", "World"); // Вызовется Add(string, string) → "HelloWorld"
```

## Переопределение (Overriding) - наследование, полиморфизм

**Переопределение** — это замена реализации **виртуального метода** из **базового класса** в **наследнике**.

```cs
// Базовый класс
public class Animal
{
    // virtual - можно переопределить в наследниках
    public virtual void MakeSound()
    {
        Console.WriteLine("Некоторый звук животного");
    }
    
    // Обычный метод - нельзя переопределить
    public void Sleep()
    {
        Console.WriteLine("Животное спит");
    }
}

// Наследники переопределяют поведение
public class Dog : Animal
{
    // override - переопределяем родительский метод
    public override void MakeSound()
    {
        Console.WriteLine("Гав-гав!");
    }
}

public class Cat : Animal
{
    public override void MakeSound()
    {
        Console.WriteLine("Мяу!");
    }
}

public class Cow : Animal
{
    public override void MakeSound()
    {
        Console.WriteLine("Му-у!");
    }
}

// Полиморфизм в действии
Animal[] animals = { new Dog(), new Cat(), new Cow() };

foreach (Animal animal in animals)
{
    animal.MakeSound(); // Вызовется переопределенная версия каждого класса
}
// Вывод:
// Гав-гав!
// Мяу!
// Му-у!
```

## Ключевые различия

|Аспект|Перегрузка (Overloading)|Переопределение (Overriding)|
|---|---|---|
|**Где происходит**|В одном классе|В наследнике|
|**Сигнатура метода**|Разная (параметры)|Одинаковая|
|**Время выбора**|Compile-time|Runtime|
|**Ключевые слова**|Нет специальных|`virtual`, `override`|
|**Полиморфизм**|Нет|Да|

## Продакшн примеры перегрузки

### 1. Логирование с разными уровнями детализации

```cs
public class Logger
{
    // Перегрузка для разных способов логирования
    
    public void Log(string message)
    {
        Log(LogLevel.Info, message, null);
    }
    
    public void Log(LogLevel level, string message)
    {
        Log(level, message, null);
    }
    
    public void Log(string message, Exception exception)
    {
        Log(LogLevel.Error, message, exception);
    }
    
    public void Log(LogLevel level, string message, Exception? exception)
    {
        var logEntry = new LogEntry
        {
            Level = level,
            Message = message,
            Exception = exception,
            Timestamp = DateTime.UtcNow
        };
        
        WriteToLog(logEntry);
    }
    
    // Специализированные методы - тоже перегрузка
    public void LogError(string message) => Log(LogLevel.Error, message);
    public void LogError(string message, Exception ex) => Log(LogLevel.Error, message, ex);
    public void LogWarning(string message) => Log(LogLevel.Warning, message);
    public void LogInfo(string message) => Log(LogLevel.Info, message);
    
    private void WriteToLog(LogEntry entry) { /* запись в лог */ }
}

// Использование - удобно для разных сценариев
var logger = new Logger();

logger.Log("Простое сообщение");
logger.Log(LogLevel.Warning, "Предупреждение");
logger.LogError("Ошибка", new InvalidOperationException());
```

### 2. HTTP Client с разными способами отправки

```cs
public class HttpClient
{
    // Перегрузка для разных типов HTTP запросов
    
    // GET запросы
    public async Task<string> GetAsync(string url)
    {
        return await GetAsync(url, CancellationToken.None);
    }
    
    public async Task<string> GetAsync(string url, CancellationToken cancellationToken)
    {
        return await SendAsync("GET", url, null, null, cancellationToken);
    }
    
    // POST запросы
    public async Task<string> PostAsync(string url, string content)
    {
        return await PostAsync(url, content, "application/json");
    }
    
    public async Task<string> PostAsync(string url, string content, string contentType)
    {
        return await PostAsync(url, content, contentType, CancellationToken.None);
    }
    
    public async Task<string> PostAsync(string url, string content, string contentType, CancellationToken cancellationToken)
    {
        var headers = new Dictionary<string, string> { ["Content-Type"] = contentType };
        return await SendAsync("POST", url, content, headers, cancellationToken);
    }
    
    // POST с объектом
    public async Task<string> PostJsonAsync<T>(string url, T obj)
    {
        var json = JsonSerializer.Serialize(obj);
        return await PostAsync(url, json, "application/json");
    }
    
    // Базовый метод
    private async Task<string> SendAsync(string method, string url, string? content, 
        Dictionary<string, string>? headers, CancellationToken cancellationToken)
    {
        // Реализация HTTP запроса
        await Task.Delay(100, cancellationToken); // Имитация запроса
        return "Response";
    }
}
```

## Продакшн примеры переопределения

### 1. Система обработки платежей

```cs
// Базовый класс с общей логикой
public abstract class PaymentProcessor
{
    // Template method - общий алгоритм
    public async Task<PaymentResult> ProcessPaymentAsync(PaymentRequest request)
    {
        try
        {
            ValidateRequest(request);
            
            var result = await ExecutePaymentAsync(request); // Переопределяемый метод
            
            await LogTransactionAsync(request, result);
            
            return result;
        }
        catch (Exception ex)
        {
            await LogErrorAsync(request, ex);
            throw;
        }
    }
    
    // Переопределяемые методы - каждый провайдер реализует по-своему
    protected abstract Task<PaymentResult> ExecutePaymentAsync(PaymentRequest request);
    protected abstract Task<bool> ValidatePaymentDataAsync(PaymentRequest request);
    
    // Виртуальные методы - можно переопределить при необходимости
    protected virtual void ValidateRequest(PaymentRequest request)
    {
        if (request.Amount <= 0)
            throw new ArgumentException("Amount must be positive");
    }
    
    protected virtual async Task LogTransactionAsync(PaymentRequest request, PaymentResult result)
    {
        // Общее логирование
        Console.WriteLine($"Payment processed: {request.Amount} -> {result.Status}");
    }
    
    protected virtual async Task LogErrorAsync(PaymentRequest request, Exception ex)
    {
        Console.WriteLine($"Payment error: {ex.Message}");
    }
}

// Конкретные реализации переопределяют поведение
public class CreditCardProcessor : PaymentProcessor
{
    private readonly ICreditCardGateway _gateway;
    
    public CreditCardProcessor(ICreditCardGateway gateway)
    {
        _gateway = gateway;
    }
    
    protected override async Task<PaymentResult> ExecutePaymentAsync(PaymentRequest request)
    {
        // Специфичная логика для кредитных карт
        var response = await _gateway.ChargeAsync(
            request.CardNumber, 
            request.Amount, 
            request.Currency);
            
        return new PaymentResult
        {
            Success = response.IsSuccessful,
            TransactionId = response.TransactionId,
            Status = response.Status
        };
    }
    
    protected override async Task<bool> ValidatePaymentDataAsync(PaymentRequest request)
    {
        // Валидация кредитной карты
        return !string.IsNullOrWhiteSpace(request.CardNumber) && 
               request.CardNumber.Length >= 13;
    }
    
    // Переопределяем валидацию для карт
    protected override void ValidateRequest(PaymentRequest request)
    {
        base.ValidateRequest(request); // Вызываем базовую валидацию
        
        // Дополнительная валидация для карт
        if (string.IsNullOrWhiteSpace(request.CardNumber))
            throw new ArgumentException("Card number is required");
    }
}

public class PayPalProcessor : PaymentProcessor
{
    private readonly IPayPalService _payPalService;
    
    public PayPalProcessor(IPayPalService payPalService)
    {
        _payPalService = payPalService;
    }
    
    protected override async Task<PaymentResult> ExecutePaymentAsync(PaymentRequest request)
    {
        // Специфичная логика для PayPal
        var paymentId = await _payPalService.CreatePaymentAsync(request.Amount, request.Currency);
        var result = await _payPalService.ExecutePaymentAsync(paymentId, request.PayPalToken);
        
        return new PaymentResult
        {
            Success = result.State == "approved",
            TransactionId = result.Id,
            Status = result.State
        };
    }
    
    protected override async Task<bool> ValidatePaymentDataAsync(PaymentRequest request)
    {
        // Валидация PayPal токена
        return !string.IsNullOrWhiteSpace(request.PayPalToken);
    }
}

// Использование - полиморфизм в действии
public class PaymentService
{
    public async Task ProcessPaymentAsync(PaymentRequest request, PaymentMethod method)
    {
        PaymentProcessor processor = method switch
        {
            PaymentMethod.CreditCard => new CreditCardProcessor(_creditCardGateway),
            PaymentMethod.PayPal => new PayPalProcessor(_payPalService),
            _ => throw new ArgumentException("Unsupported payment method")
        };
        
        // Один интерфейс, разные реализации
        var result = await processor.ProcessPaymentAsync(request);
        
        // Обработка результата
    }
}
```

### 2. Система репозиториев

```cs
// Базовый репозиторий с общими операциями
public abstract class BaseRepository<T> where T : class, IEntity
{
    protected readonly DbContext _context;
    
    protected BaseRepository(DbContext context)
    {
        _context = context;
    }
    
    // Общие методы
    public virtual async Task<T?> GetByIdAsync(int id)
    {
        return await GetQuery().FirstOrDefaultAsync(e => e.Id == id);
    }
    
    public virtual async Task<List<T>> GetAllAsync()
    {
        return await GetQuery().ToListAsync();
    }
    
    public virtual async Task<T> AddAsync(T entity)
    {
        _context.Set<T>().Add(entity);
        await _context.SaveChangesAsync();
        return entity;
    }
    
    // Переопределяемые методы
    protected abstract IQueryable<T> GetQuery(); // Каждый репозиторий настраивает запросы
    
    protected virtual void OnBeforeSave(T entity) { } // Можно переопределить
    protected virtual void OnAfterSave(T entity) { } // Можно переопределить
}

// Конкретные репозитории переопределяют поведение
public class UserRepository : BaseRepository<User>
{
    public UserRepository(DbContext context) : base(context) { }
    
    // Переопределяем запрос - добавляем включения связанных данных
    protected override IQueryable<User> GetQuery()
    {
        return _context.Users
            .Include(u => u.Roles)
            .Include(u => u.Profile)
            .Where(u => !u.IsDeleted); // Фильтрация удаленных
    }
    
    // Переопределяем общий метод для специфичной логики
    public override async Task<User?> GetByIdAsync(int id)
    {
        // Дополнительная логика для пользователей
        var user = await base.GetByIdAsync(id);
        
        if (user != null)
        {
            // Обновляем время последнего доступа
            user.LastAccessedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
        
        return user;
    }
    
    // Дополнительные методы специфичные для пользователей
    public async Task<User?> GetByEmailAsync(string email)
    {
        return await GetQuery().FirstOrDefaultAsync(u => u.Email == email);
    }
    
    protected override void OnBeforeSave(User user)
    {
        // Логика перед сохранением пользователя
        user.UpdatedAt = DateTime.UtcNow;
        if (string.IsNullOrEmpty(user.NormalizedEmail))
        {
            user.NormalizedEmail = user.Email.ToUpperInvariant();
        }
    }
}

public class ProductRepository : BaseRepository<Product>
{
    public ProductRepository(DbContext context) : base(context) { }
    
    protected override IQueryable<Product> GetQuery()
    {
        return _context.Products
            .Include(p => p.Category)
            .Include(p => p.Reviews)
            .Where(p => p.IsActive); // Только активные товары
    }
    
    // Специфичные методы для товаров
    public async Task<List<Product>> GetByCategoryAsync(int categoryId)
    {
        return await GetQuery()
            .Where(p => p.CategoryId == categoryId)
            .OrderBy(p => p.Name)
            .ToListAsync();
    }
    
    protected override void OnBeforeSave(Product product)
    {
        // Автоматически обновляем поисковые теги
        product.SearchTags = GenerateSearchTags(product);
    }
    
    private string GenerateSearchTags(Product product)
    {
        return $"{product.Name} {product.Description} {product.Category?.Name}".ToLowerInvariant();
    }
}
```

## Комбинирование перегрузки и переопределения

```cs
public abstract class Shape
{
    // Виртуальные методы для переопределения
    public abstract double CalculateArea();
    public virtual void Draw()
    {
        Console.WriteLine("Drawing a shape");
    }
    
    // Перегруженные методы
    public void Move(int x, int y)
    {
        Move(x, y, 0);
    }
    
    public void Move(int x, int y, int z)
    {
        Console.WriteLine($"Moving to ({x}, {y}, {z})");
    }
}

public class Circle : Shape
{
    public double Radius { get; set; }
    
    // Переопределение
    public override double CalculateArea()
    {
        return Math.PI * Radius * Radius;
    }
    
    public override void Draw()
    {
        Console.WriteLine($"Drawing a circle with radius {Radius}");
    }
    
    // Перегрузка в наследнике
    public void Draw(ConsoleColor color)
    {
        Console.ForegroundColor = color;
        Draw(); // Вызов переопределенного метода
        Console.ResetColor();
    }
}
```

## Основные правила

### Перегрузка:

1. ✅ Одинаковое имя, разные параметры
2. ✅ Может отличаться тип возвращаемого значения
3. ❌ Нельзя перегружать только по возвращаемому типу
4. ✅ Выбор метода происходит на этапе компиляции

### Переопределение:

1. ✅ Точно такая же сигнатура как у базового метода
2. ✅ Базовый метод должен быть `virtual`, `abstract` или `override`
3. ✅ Используется ключевое слово `override`
4. ✅ Выбор метода происходит во время выполнения (полиморфизм)

Эти концепции дополняют друг друга и активно используются в продакшн-коде для создания гибких и расширяемых систем!