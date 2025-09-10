**[[Декоратор|Декоратор]]** — это паттерн проектирования, который позволяет **добавлять новое поведение** к объектам, не изменяя их исходный код.

## Основная идея декоратора

Представь, что у тебя есть основной сервис, который работает. Но тебе нужно добавить:

- Логирование
- Кэширование
- Измерение производительности
- Валидацию
- Повторные попытки (retry)

**БЕЗ декоратора** ты бы изменял исходный класс. **С декоратором** — оборачиваешь его в другой класс.

## Простой пример без DI

```cs
// Базовый интерфейс
public interface IUserService
{
    Task<User> GetUserAsync(int id);
    Task CreateUserAsync(User user);
}

// Основная реализация (бизнес-логика)
public class UserService : IUserService
{
    private readonly IUserRepository _repository;
    
    public UserService(IUserRepository repository)
    {
        _repository = repository;
    }
    
    public async Task<User> GetUserAsync(int id)
    {
        return await _repository.GetByIdAsync(id);
    }
    
    public async Task CreateUserAsync(User user)
    {
        await _repository.SaveAsync(user);
    }
}

// ДЕКОРАТОР - добавляет логирование, НЕ ИЗМЕНЯЯ основной класс!
public class LoggingUserService : IUserService
{
    private readonly IUserService _innerService;  // Оборачиваем оригинальный сервис
    private readonly ILogger _logger;
    
    public LoggingUserService(IUserService innerService, ILogger logger)
    {
        _innerService = innerService;  // Сохраняем ссылку на оригинал
        _logger = logger;
    }
    
    public async Task<User> GetUserAsync(int id)
    {
        _logger.LogInformation("Getting user with ID {UserId}", id);
        
        try
        {
            var user = await _innerService.GetUserAsync(id);  // Вызываем оригинальный метод
            _logger.LogInformation("Successfully retrieved user {UserId}", id);
            return user;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user {UserId}", id);
            throw;
        }
    }
    
    public async Task CreateUserAsync(User user)
    {
        _logger.LogInformation("Creating user {UserName}", user.Name);
        
        try
        {
            await _innerService.CreateUserAsync(user);  // Вызываем оригинальный метод
            _logger.LogInformation("Successfully created user {UserName}", user.Name);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating user {UserName}", user.Name);
            throw;
        }
    }
}

// Использование
IUserService userService = new UserService(repository);
IUserService loggingUserService = new LoggingUserService(userService, logger);

// Теперь все вызовы будут логироваться!
await loggingUserService.GetUserAsync(1);
```

## Почему это круто?

1. **Основной класс не изменился** — `UserService` остался чистым
2. **Можно включать/выключать** — просто меняем регистрацию в DI
3. **Можно комбинировать** — логирование + кэширование + валидация
4. **Single Responsibility** — каждая ответственность в отдельном классе

## Декораторы с DI Container

### Кэширующий декоратор

```cs
public class CachingUserService : IUserService
{
    private readonly IUserService _innerService;
    private readonly IMemoryCache _cache;
    
    public CachingUserService(IUserService innerService, IMemoryCache cache)
    {
        _innerService = innerService;
        _cache = cache;
    }
    
    public async Task<User> GetUserAsync(int id)
    {
        var cacheKey = $"user:{id}";
        
        // Проверяем кэш
        if (_cache.TryGetValue(cacheKey, out User cachedUser))
        {
            return cachedUser;
        }
        
        // Если нет в кэше - получаем из оригинального сервиса
        var user = await _innerService.GetUserAsync(id);
        
        // Кэшируем на 5 минут
        _cache.Set(cacheKey, user, TimeSpan.FromMinutes(5));
        
        return user;
    }
    
    public async Task CreateUserAsync(User user)
    {
        // Создаем пользователя
        await _innerService.CreateUserAsync(user);
        
        // Инвалидируем кэш для этого пользователя
        _cache.Remove($"user:{user.Id}");
    }
}
```

### Декоратор для измерения производительности

```cs
public class PerformanceUserService : IUserService
{
    private readonly IUserService _innerService;
    private readonly ILogger _logger;
    
    public PerformanceUserService(IUserService innerService, ILogger logger)
    {
        _innerService = innerService;
        _logger = logger;
    }
    
    public async Task<User> GetUserAsync(int id)
    {
        var stopwatch = Stopwatch.StartNew();
        
        try
        {
            var result = await _innerService.GetUserAsync(id);
            stopwatch.Stop();
            
            _logger.LogInformation("GetUserAsync({UserId}) took {ElapsedMs}ms", 
                id, stopwatch.ElapsedMilliseconds);
            
            return result;
        }
        catch
        {
            stopwatch.Stop();
            _logger.LogWarning("GetUserAsync({UserId}) failed after {ElapsedMs}ms", 
                id, stopwatch.ElapsedMilliseconds);
            throw;
        }
    }
    
    public async Task CreateUserAsync(User user)
    {
        var stopwatch = Stopwatch.StartNew();
        
        try
        {
            await _innerService.CreateUserAsync(user);
            stopwatch.Stop();
            
            _logger.LogInformation("CreateUserAsync took {ElapsedMs}ms", 
                stopwatch.ElapsedMilliseconds);
        }
        catch
        {
            stopwatch.Stop();
            _logger.LogWarning("CreateUserAsync failed after {ElapsedMs}ms", 
                stopwatch.ElapsedMilliseconds);
            throw;
        }
    }
}
```

### Декоратор для retry-логики

```cs
public class RetryUserService : IUserService
{
    private readonly IUserService _innerService;
    private readonly ILogger _logger;
    private const int MaxRetries = 3;
    
    public RetryUserService(IUserService innerService, ILogger logger)
    {
        _innerService = innerService;
        _logger = logger;
    }
    
    public async Task<User> GetUserAsync(int id)
    {
        return await ExecuteWithRetryAsync(
            () => _innerService.GetUserAsync(id),
            $"GetUserAsync({id})");
    }
    
    public async Task CreateUserAsync(User user)
    {
        await ExecuteWithRetryAsync(
            () => _innerService.CreateUserAsync(user),
            $"CreateUserAsync({user.Name})");
    }
    
    private async Task<T> ExecuteWithRetryAsync<T>(Func<Task<T>> operation, string operationName)
    {
        for (int attempt = 1; attempt <= MaxRetries; attempt++)
        {
            try
            {
                return await operation();
            }
            catch (Exception ex) when (attempt < MaxRetries && IsRetryableException(ex))
            {
                _logger.LogWarning("Attempt {Attempt}/{MaxAttempts} failed for {Operation}: {Error}", 
                    attempt, MaxRetries, operationName, ex.Message);
                
                await Task.Delay(TimeSpan.FromSeconds(Math.Pow(2, attempt))); // Exponential backoff
            }
        }
        
        // Последняя попытка без catch
        return await operation();
    }
    
    private async Task ExecuteWithRetryAsync(Func<Task> operation, string operationName)
    {
        await ExecuteWithRetryAsync(async () =>
        {
            await operation();
            return true; // Dummy return for generic method
        }, operationName);
    }
    
    private static bool IsRetryableException(Exception ex)
    {
        // Определяем, стоит ли повторять операцию
        return ex is TimeoutException or HttpRequestException or SqlException;
    }
}
```

## Регистрация декораторов в DI

### Простая регистрация

```cs
public void ConfigureServices(IServiceCollection services)
{
    // 1. Регистрируем базовую реализацию
    services.AddScoped<UserService>();
    
    // 2. Регистрируем декораторы
    services.AddScoped<IUserService>(provider =>
    {
        // Получаем базовую реализацию
        var baseService = provider.GetService<UserService>();
        var cache = provider.GetService<IMemoryCache>();
        var logger = provider.GetService<ILogger<IUserService>>();
        
        // Строим цепочку декораторов:
        // RetryUserService -> PerformanceUserService -> LoggingUserService -> CachingUserService -> UserService
        
        var cachedService = new CachingUserService(baseService, cache);
        var loggedService = new LoggingUserService(cachedService, logger);
        var performanceService = new PerformanceUserService(loggedService, logger);
        var retryService = new RetryUserService(performanceService, logger);
        
        return retryService;
    });
}
```

### Более элегантная регистрация с extension методами

```cs
public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddUserService(this IServiceCollection services)
    {
        services.AddScoped<UserService>();
        services.AddMemoryCache();
        
        services.AddScoped<IUserService>(provider =>
        {
            var baseService = provider.GetService<UserService>();
            var cache = provider.GetService<IMemoryCache>();
            var logger = provider.GetService<ILogger<IUserService>>();
            
            // Применяем декораторы в нужном порядке
            IUserService service = baseService;
            service = new CachingUserService(service, cache);
            service = new LoggingUserService(service, logger);
            service = new PerformanceUserService(service, logger);
            service = new RetryUserService(service, logger);
            
            return service;
        });
        
        return services;
    }
}

// Использование
services.AddUserService();
```

### Условная регистрация декораторов

```cs
public void ConfigureServices(IServiceCollection services)
{
    services.AddScoped<UserService>();
    
    services.AddScoped<IUserService>(provider =>
    {
        IUserService service = provider.GetService<UserService>();
        var configuration = provider.GetService<IConfiguration>();
        var logger = provider.GetService<ILogger<IUserService>>();
        
        // Кэширование только в Production
        if (Environment.IsProduction())
        {
            var cache = provider.GetService<IMemoryCache>();
            service = new CachingUserService(service, cache);
        }
        
        // Логирование если включено в настройках
        if (configuration.GetValue<bool>("Logging:EnableServiceLogging"))
        {
            service = new LoggingUserService(service, logger);
        }
        
        // Performance monitoring только в Development
        if (Environment.IsDevelopment())
        {
            service = new PerformanceUserService(service, logger);
        }
        
        // Retry всегда
        service = new RetryUserService(service, logger);
        
        return service;
    });
}
```

## Продакшн пример: HTTP Client с декораторами

```cs
public interface IApiClient
{
    Task<T> GetAsync<T>(string endpoint);
    Task<T> PostAsync<T>(string endpoint, object data);
}

// Базовая реализация
public class HttpApiClient : IApiClient
{
    private readonly HttpClient _httpClient;
    
    public HttpApiClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }
    
    public async Task<T> GetAsync<T>(string endpoint)
    {
        var response = await _httpClient.GetAsync(endpoint);
        response.EnsureSuccessStatusCode();
        
        var json = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<T>(json);
    }
    
    public async Task<T> PostAsync<T>(string endpoint, object data)
    {
        var json = JsonSerializer.Serialize(data);
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        
        var response = await _httpClient.PostAsync(endpoint, content);
        response.EnsureSuccessStatusCode();
        
        var responseJson = await response.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<T>(responseJson);
    }
}

// Декоратор для авторизации
public class AuthorizedApiClient : IApiClient
{
    private readonly IApiClient _innerClient;
    private readonly IAuthTokenProvider _tokenProvider;
    
    public AuthorizedApiClient(IApiClient innerClient, IAuthTokenProvider tokenProvider)
    {
        _innerClient = innerClient;
        _tokenProvider = tokenProvider;
    }
    
    public async Task<T> GetAsync<T>(string endpoint)
    {
        // Добавляем токен авторизации к запросу
        var token = await _tokenProvider.GetTokenAsync();
        // Логика добавления заголовка Authorization
        
        return await _innerClient.GetAsync<T>(endpoint);
    }
    
    public async Task<T> PostAsync<T>(string endpoint, object data)
    {
        var token = await _tokenProvider.GetTokenAsync();
        // Логика добавления заголовка Authorization
        
        return await _innerClient.PostAsync<T>(endpoint, data);
    }
}

// Декоратор для rate limiting
public class RateLimitedApiClient : IApiClient
{
    private readonly IApiClient _innerClient;
    private readonly SemaphoreSlim _semaphore;
    private readonly ILogger _logger;
    
    public RateLimitedApiClient(IApiClient innerClient, ILogger logger, int maxConcurrentRequests = 10)
    {
        _innerClient = innerClient;
        _logger = logger;
        _semaphore = new SemaphoreSlim(maxConcurrentRequests, maxConcurrentRequests);
    }
    
    public async Task<T> GetAsync<T>(string endpoint)
    {
        await _semaphore.WaitAsync();
        
        try
        {
            return await _innerClient.GetAsync<T>(endpoint);
        }
        finally
        {
            _semaphore.Release();
        }
    }
    
    public async Task<T> PostAsync<T>(string endpoint, object data)
    {
        await _semaphore.WaitAsync();
        
        try
        {
            return await _innerClient.PostAsync<T>(endpoint, data);
        }
        finally
        {
            _semaphore.Release();
        }
    }
}

// Декоратор для circuit breaker
public class CircuitBreakerApiClient : IApiClient
{
    private readonly IApiClient _innerClient;
    private readonly ILogger _logger;
    private int _failureCount = 0;
    private DateTime _lastFailureTime = DateTime.MinValue;
    private readonly TimeSpan _timeout = TimeSpan.FromMinutes(1);
    private readonly int _failureThreshold = 5;
    
    public CircuitBreakerApiClient(IApiClient innerClient, ILogger logger)
    {
        _innerClient = innerClient;
        _logger = logger;
    }
    
    public async Task<T> GetAsync<T>(string endpoint)
    {
        if (IsCircuitOpen())
        {
            throw new InvalidOperationException("Circuit breaker is open");
        }
        
        try
        {
            var result = await _innerClient.GetAsync<T>(endpoint);
            OnSuccess();
            return result;
        }
        catch
        {
            OnFailure();
            throw;
        }
    }
    
    public async Task<T> PostAsync<T>(string endpoint, object data)
    {
        if (IsCircuitOpen())
        {
            throw new InvalidOperationException("Circuit breaker is open");
        }
        
        try
        {
            var result = await _innerClient.PostAsync<T>(endpoint, data);
            OnSuccess();
            return result;
        }
        catch
        {
            OnFailure();
            throw;
        }
    }
    
    private bool IsCircuitOpen()
    {
        return _failureCount >= _failureThreshold && 
               DateTime.UtcNow - _lastFailureTime < _timeout;
    }
    
    private void OnSuccess()
    {
        _failureCount = 0;
    }
    
    private void OnFailure()
    {
        _failureCount++;
        _lastFailureTime = DateTime.UtcNow;
        _logger.LogWarning("API failure count: {FailureCount}", _failureCount);
    }
}

// Регистрация полной цепочки
public void ConfigureServices(IServiceCollection services)
{
    services.AddHttpClient<HttpApiClient>();
    
    services.AddScoped<IApiClient>(provider =>
    {
        var httpClient = provider.GetService<HttpClient>();
        var tokenProvider = provider.GetService<IAuthTokenProvider>();
        var logger = provider.GetService<ILogger<IApiClient>>();
        
        // Строим цепочку: CircuitBreaker -> RateLimit -> Authorization -> Http
        IApiClient client = new HttpApiClient(httpClient);
        client = new AuthorizedApiClient(client, tokenProvider);
        client = new RateLimitedApiClient(client, logger, maxConcurrentRequests: 5);
        client = new CircuitBreakerApiClient(client, logger);
        
        return client;
    });
}
```

## Преимущества декораторов

### 1. **Композиция поведений**

```cs
// Можем комбинировать любые декораторы в любом порядке
IUserService service = baseService;
service = new CachingUserService(service, cache);        // + кэширование
service = new LoggingUserService(service, logger);       // + логирование  
service = new ValidationUserService(service, validator); // + валидация
service = new MetricsUserService(service, metrics);      // + метрики
```

### 2. **Легкое тестирование**

```cs
[Test]
public async Task LoggingDecorator_ShouldLogCalls()
{
    // Arrange
    var mockInnerService = new Mock<IUserService>();
    var mockLogger = new Mock<ILogger>();
    
    var loggingService = new LoggingUserService(mockInnerService.Object, mockLogger.Object);
    
    // Act
    await loggingService.GetUserAsync(1);
    
    // Assert
    mockInnerService.Verify(s => s.GetUserAsync(1), Times.Once);
    mockLogger.Verify(l => l.LogInformation(It.IsAny<string>(), It.IsAny<object[]>()), Times.AtLeastOnce);
}
```

### 3. **Включение/выключение функций**

```cs
// Development - с логированием и performance monitoring
IUserService devService = new PerformanceUserService(
    new LoggingUserService(baseService, logger), 
    logger);

// Production - только с кэшированием и retry
IUserService prodService = new RetryUserService(
    new CachingUserService(baseService, cache), 
    logger);
```

## Когда использовать декораторы

### ✅ Используй декораторы когда:

- Нужно добавить **сквозную функциональность** (logging, caching, validation)
- Хочешь **не изменять** основной класс
- Нужна **гибкость** включения/выключения функций
- Требуется **композиция** нескольких поведений

### ❌ НЕ используй декораторы когда:

- Функциональность слишком **специфична** для конкретного класса
- Нужно **изменить структуру данных**, а не поведение
- Декораторов становится **слишком много** (>5-6)

**В итоге:** декораторы — это мощный способ добавления функциональности без изменения существующего кода. Особенно полезно в enterprise приложениях для добавления логирования, кэширования, безопасности и мониторинга! 🎯

**Декораторы в продакшн используются ОЧЕНЬ часто**, но обычно:

### 🎯 **Неявно:**

- Через фреймворки (ASP.NET Core, EF Core)
- Через библиотеки (Polly, MediatR, Scrutor)
- Через встроенные механизмы (.NET HTTP stack)

### 🎯 **Явно (реже):**

- Для специфичной бизнес-логики
- В Enterprise системах с сложными требованиями
- Когда готовые решения не подходят

### 🎯 **Популярные сценарии:**

1. **Cross-cutting concerns** (логирование, кэширование, метрики)
2. **Resilience patterns** (retry, circuit breaker, timeout)
3. **Security** (авторизация, аудит)
4. **Performance** (кэширование, батчинг)

**Современная тенденция:** декораторы "спрятаны" в инфраструктурном коде и библиотеках, а бизнес-логика остается чистой. Это дает все преимущества паттерна без усложнения кода для разработчиков.

## Статистика использования

### 🟢 **Очень часто (90%+ проектов):**

- **ASP.NET Core Middleware** - в каждом веб-приложении
- **HTTP Message Handlers** - для внешних API
- **Entity Framework Interceptors** - для аудита, логирования

### 🟡 **Часто (50-70% проектов):**

- **Кэширование декораторы** - в высоконагруженных системах
- **Retry/Circuit Breaker** - для внешних сервисов
- **Валидация decorators** - в CQRS архитектуре

### 🟠 **Иногда (20-30% проектов):**

- **Метрики/мониторинг декораторы** - в Enterprise
- **Ручные декораторы для бизнес-логики**
- **Security decorators** - для аудита операций

### 🔴 **Редко (5-10% проектов):**

- **Сложные цепочки декораторов** - только в очень сложных системах
- **Dynamic Proxy декораторы** - обычно заменяются AOP