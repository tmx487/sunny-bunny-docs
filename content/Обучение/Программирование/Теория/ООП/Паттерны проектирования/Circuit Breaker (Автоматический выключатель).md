**Circuit Breaker** (автоматический выключатель) — это паттерн стабильности, который предотвращает каскадные сбои в распределенных системах. Работает по аналогии с электрическим автоматом — когда что-то идет не так, он "размыкает цепь" и останавливает вызовы к проблемному сервису.

## Основная идея

Представь ситуацию:

- Твой сервис вызывает внешний API
- API начинает "тормозить" или падать
- Все твои запросы висят в ожидании ответа
- Пользователи не могут получить ответ от твоего сервиса
- **Каскадный сбой** — один упавший сервис "роняет" всю систему

**Circuit Breaker** решает это так:

- Отслеживает количество ошибок
- При превышении порога — "размыкает цепь" (перестает делать запросы)
- Возвращает заранее подготовленные ответы или ошибки
- Периодически проверяет, не "починился" ли сервис

## Состояния Circuit Breaker

```
    [Успешные запросы]
         ↓
    ┌─────────┐
    │ CLOSED  │ ←─── Нормальная работа
    │ (работа)│      
    └─────────┘
         ↓ [Много ошибок]
    ┌─────────┐
    │  OPEN   │ ←─── Запросы блокируются  
    │(сломано)│      Возвращаем fallback
    └─────────┘
         ↓ [Таймаут истек]
    ┌─────────┐
    │HALF-OPEN│ ←─── Пробуем один запрос  
    │ (тест)  │      
    └─────────┘
         ↓
    [Успех] → CLOSED
    [Ошибка] → OPEN
```

## Простая реализация Circuit Breaker

```cs
public class CircuitBreaker
{
    private readonly int _failureThreshold;
    private readonly TimeSpan _timeout;
    private readonly ILogger _logger;
    
    private int _failureCount = 0;
    private DateTime _lastFailureTime = DateTime.MinValue;
    private CircuitBreakerState _state = CircuitBreakerState.Closed;
    private readonly object _lock = new object();
    
    public CircuitBreaker(int failureThreshold, TimeSpan timeout, ILogger logger)
    {
        _failureThreshold = failureThreshold;
        _timeout = timeout;
        _logger = logger;
    }
    
    public async Task<T> ExecuteAsync<T>(Func<Task<T>> operation, Func<Task<T>> fallback = null)
    {
        lock (_lock)
        {
            if (_state == CircuitBreakerState.Open)
            {
                // Проверяем, не пора ли попробовать снова
                if (DateTime.UtcNow - _lastFailureTime > _timeout)
                {
                    _state = CircuitBreakerState.HalfOpen;
                    _logger.LogInformation("Circuit breaker state changed to HalfOpen");
                }
                else
                {
                    _logger.LogWarning("Circuit breaker is OPEN, blocking request");
                    
                    if (fallback != null)
                        return await fallback();
                        
                    throw new CircuitBreakerOpenException("Circuit breaker is OPEN");
                }
            }
        }
        
        try
        {
            var result = await operation();
            
            // Успех - сбрасываем счетчик
            OnSuccess();
            return result;
        }
        catch (Exception ex)
        {
            OnFailure(ex);
            throw;
        }
    }
    
    private void OnSuccess()
    {
        lock (_lock)
        {
            _failureCount = 0;
            _state = CircuitBreakerState.Closed;
            _logger.LogDebug("Circuit breaker reset to CLOSED state");
        }
    }
    
    private void OnFailure(Exception ex)
    {
        lock (_lock)
        {
            _failureCount++;
            _lastFailureTime = DateTime.UtcNow;
            
            _logger.LogWarning("Circuit breaker failure #{FailureCount}: {Error}", 
                _failureCount, ex.Message);
            
            if (_failureCount >= _failureThreshold)
            {
                _state = CircuitBreakerState.Open;
                _logger.LogError("Circuit breaker OPENED after {FailureCount} failures", _failureCount);
            }
        }
    }
    
    public CircuitBreakerState CurrentState
    {
        get
        {
            lock (_lock)
            {
                return _state;
            }
        }
    }
}

public enum CircuitBreakerState
{
    Closed,   // Нормальная работа
    Open,     // Блокируем запросы
    HalfOpen  // Тестируем один запрос
}

public class CircuitBreakerOpenException : Exception
{
    public CircuitBreakerOpenException(string message) : base(message) { }
}
```

## Продакшн пример: HTTP API с Circuit Breaker

```cs
public interface IExternalApiService
{
    Task<UserData> GetUserAsync(int userId);
    Task<OrderData> GetOrderAsync(int orderId);
}

public class ExternalApiService : IExternalApiService
{
    private readonly HttpClient _httpClient;
    private readonly CircuitBreaker _circuitBreaker;
    private readonly IMemoryCache _cache;
    private readonly ILogger<ExternalApiService> _logger;
    
    public ExternalApiService(
        HttpClient httpClient, 
        IMemoryCache cache,
        ILogger<ExternalApiService> logger)
    {
        _httpClient = httpClient;
        _cache = cache;
        _logger = logger;
        
        // Circuit Breaker: 5 ошибок за 30 секунд = блокировка на 1 минуту
        _circuitBreaker = new CircuitBreaker(
            failureThreshold: 5,
            timeout: TimeSpan.FromMinutes(1),
            logger);
    }
    
    public async Task<UserData> GetUserAsync(int userId)
    {
        return await _circuitBreaker.ExecuteAsync(
            // Основная операция
            operation: async () =>
            {
                _logger.LogDebug("Calling external API for user {UserId}", userId);
                
                var response = await _httpClient.GetAsync($"api/users/{userId}");
                response.EnsureSuccessStatusCode();
                
                var json = await response.Content.ReadAsStringAsync();
                var userData = JsonSerializer.Deserialize<UserData>(json);
                
                // Кэшируем успешный результат
                _cache.Set($"user:{userId}", userData, TimeSpan.FromMinutes(10));
                
                return userData;
            },
            // Fallback - что делать, если circuit breaker открыт
            fallback: async () =>
            {
                _logger.LogWarning("Circuit breaker is OPEN, trying to get user {UserId} from cache", userId);
                
                // Пробуем взять из кэша
                if (_cache.TryGetValue($"user:{userId}", out UserData cachedUser))
                {
                    _logger.LogInformation("Returned cached user data for {UserId}", userId);
                    return cachedUser;
                }
                
                // Если в кэше нет - возвращаем заглушку
                _logger.LogWarning("No cached data for user {UserId}, returning default", userId);
                return new UserData 
                { 
                    Id = userId, 
                    Name = "Unknown User", 
                    Email = "unavailable@service.down",
                    IsFromCache = true 
                };
            });
    }
    
    public async Task<OrderData> GetOrderAsync(int orderId)
    {
        return await _circuitBreaker.ExecuteAsync(
            operation: async () =>
            {
                var response = await _httpClient.GetAsync($"api/orders/{orderId}");
                response.EnsureSuccessStatusCode();
                
                var json = await response.Content.ReadAsStringAsync();
                return JsonSerializer.Deserialize<OrderData>(json);
            },
            fallback: async () =>
            {
                // Для заказов fallback может быть более критичным
                _logger.LogError("Cannot get order {OrderId} - external service is down", orderId);
                throw new ServiceUnavailableException($"Order service is temporarily unavailable");
            });
    }
}

public class UserData
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public bool IsFromCache { get; set; } = false;
}

public class OrderData
{
    public int Id { get; set; }
    public decimal Amount { get; set; }
    public string Status { get; set; }
}

public class ServiceUnavailableException : Exception
{
    public ServiceUnavailableException(string message) : base(message) { }
}
```

## Circuit Breaker с Polly (рекомендуемый подход)

**Polly** — это популярная библиотека для .NET, которая включает готовую реализацию Circuit Breaker:

```cs
public class PollyExternalApiService : IExternalApiService
{
    private readonly HttpClient _httpClient;
    private readonly IAsyncPolicy<HttpResponseMessage> _circuitBreakerPolicy;
    private readonly IMemoryCache _cache;
    private readonly ILogger<PollyExternalApiService> _logger;
    
    public PollyExternalApiService(
        HttpClient httpClient,
        IMemoryCache cache,
        ILogger<PollyExternalApiService> logger)
    {
        _httpClient = httpClient;
        _cache = cache;
        _logger = logger;
        
        // Создаем Circuit Breaker политику с Polly
        _circuitBreakerPolicy = Policy
            .HandleResult<HttpResponseMessage>(r => !r.IsSuccessStatusCode)
            .Or<HttpRequestException>()
            .Or<TaskCanceledException>() // Timeout
            .CircuitBreakerAsync(
                // Количество последовательных ошибок для открытия
                handledEventsAllowedBeforeBreaking: 5,
                // Время, на которое открываем circuit breaker
                durationOfBreak: TimeSpan.FromMinutes(1),
                // Callback при открытии
                onBreak: (exception, duration) =>
                {
                    _logger.LogError("Circuit breaker OPENED for {Duration}s due to: {Exception}",
                        duration.TotalSeconds, exception.Exception?.Message ?? exception.Result?.StatusCode.ToString());
                },
                // Callback при закрытии
                onReset: () =>
                {
                    _logger.LogInformation("Circuit breaker CLOSED - service is healthy again");
                },
                // Callback при половинном открытии
                onHalfOpen: () =>
                {
                    _logger.LogInformation("Circuit breaker HALF-OPEN - testing service health");
                });
    }
    
    public async Task<UserData> GetUserAsync(int userId)
    {
        try
        {
            var response = await _circuitBreakerPolicy.ExecuteAsync(async () =>
            {
                _logger.LogDebug("Calling external API for user {UserId}", userId);
                return await _httpClient.GetAsync($"api/users/{userId}");
            });
            
            var json = await response.Content.ReadAsStringAsync();
            var userData = JsonSerializer.Deserialize<UserData>(json);
            
            // Кэшируем успешный результат
            _cache.Set($"user:{userId}", userData, TimeSpan.FromMinutes(10));
            
            return userData;
        }
        catch (CircuitBreakerOpenException)
        {
            _logger.LogWarning("Circuit breaker is OPEN for user {UserId}, using fallback", userId);
            
            // Fallback logic
            if (_cache.TryGetValue($"user:{userId}", out UserData cachedUser))
            {
                return cachedUser;
            }
            
            return new UserData 
            { 
                Id = userId, 
                Name = "Service Unavailable", 
                Email = "service@unavailable.com",
                IsFromCache = true 
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user {UserId}", userId);
            throw;
        }
    }
    
    public async Task<OrderData> GetOrderAsync(int orderId)
    {
        try
        {
            var response = await _circuitBreakerPolicy.ExecuteAsync(async () =>
            {
                return await _httpClient.GetAsync($"api/orders/{orderId}");
            });
            
            var json = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<OrderData>(json);
        }
        catch (CircuitBreakerOpenException)
        {
            _logger.LogError("Cannot get order {OrderId} - circuit breaker is OPEN", orderId);
            throw new ServiceUnavailableException("Order service is temporarily unavailable");
        }
    }
}
```

## Комбинирование Circuit Breaker с другими паттернами

### 1. Circuit Breaker + Retry + Timeout

```cs
public class ResilientApiService : IExternalApiService
{
    private readonly HttpClient _httpClient;
    private readonly IAsyncPolicy _resilientPolicy;
    private readonly ILogger<ResilientApiService> _logger;
    
    public ResilientApiService(HttpClient httpClient, ILogger<ResilientApiService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        
        // Комбинируем несколько политик
        var retryPolicy = Policy
            .Handle<HttpRequestException>()
            .Or<TaskCanceledException>()
            .WaitAndRetryAsync(
                retryCount: 3,
                sleepDurationProvider: retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)),
                onRetry: (outcome, timespan, retryCount, context) =>
                {
                    _logger.LogWarning("Retry {RetryCount} after {Delay}ms: {Exception}",
                        retryCount, timespan.TotalMilliseconds, outcome.Exception?.Message);
                });
        
        var circuitBreakerPolicy = Policy
            .Handle<HttpRequestException>()
            .Or<TaskCanceledException>()
            .CircuitBreakerAsync(
                handledEventsAllowedBeforeBreaking: 3,
                durationOfBreak: TimeSpan.FromSeconds(30),
                onBreak: (exception, duration) =>
                    _logger.LogError("Circuit breaker opened for {Duration}s", duration.TotalSeconds),
                onReset: () => _logger.LogInformation("Circuit breaker closed"));
        
        var timeoutPolicy = Policy
            .TimeoutAsync(TimeSpan.FromSeconds(10));
        
        // Оборачиваем политики: Timeout -> CircuitBreaker -> Retry
        _resilientPolicy = Policy.WrapAsync(timeoutPolicy, circuitBreakerPolicy, retryPolicy);
    }
    
    public async Task<UserData> GetUserAsync(int userId)
    {
        return await _resilientPolicy.ExecuteAsync(async () =>
        {
            _logger.LogDebug("Calling external API for user {UserId}", userId);
            
            var response = await _httpClient.GetAsync($"api/users/{userId}");
            response.EnsureSuccessStatusCode();
            
            var json = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<UserData>(json);
        });
    }
}
```

### 2. Circuit Breaker с мониторингом и метриками

```cs
public class MonitoredCircuitBreakerService : IExternalApiService
{
    private readonly HttpClient _httpClient;
    private readonly IAsyncPolicy _policy;
    private readonly IMetrics _metrics;
    private readonly ILogger<MonitoredCircuitBreakerService> _logger;
    
    public MonitoredCircuitBreakerService(
        HttpClient httpClient, 
        IMetrics metrics,
        ILogger<MonitoredCircuitBreakerService> logger)
    {
        _httpClient = httpClient;
        _metrics = metrics;
        _logger = logger;
        
        _policy = Policy
            .Handle<HttpRequestException>()
            .Or<TaskCanceledException>()
            .CircuitBreakerAsync(
                handledEventsAllowedBeforeBreaking: 5,
                durationOfBreak: TimeSpan.FromMinutes(1),
                onBreak: (exception, duration) =>
                {
                    _metrics.IncrementCounter("circuit_breaker.opened");
                    _metrics.SetGauge("circuit_breaker.state", 1); // 1 = Open
                    
                    _logger.LogError("Circuit breaker opened: {Exception}", exception.Exception?.Message);
                    
                    // Уведомляем мониторинг
                    NotifyMonitoring("Circuit breaker opened", exception.Exception);
                },
                onReset: () =>
                {
                    _metrics.IncrementCounter("circuit_breaker.closed");
                    _metrics.SetGauge("circuit_breaker.state", 0); // 0 = Closed
                    
                    _logger.LogInformation("Circuit breaker closed");
                    NotifyMonitoring("Circuit breaker closed", null);
                },
                onHalfOpen: () =>
                {
                    _metrics.SetGauge("circuit_breaker.state", 0.5); // 0.5 = HalfOpen
                    _logger.LogInformation("Circuit breaker half-open");
                });
    }
    
    public async Task<UserData> GetUserAsync(int userId)
    {
        var stopwatch = Stopwatch.StartNew();
        
        try
        {
            return await _policy.ExecuteAsync(async () =>
            {
                var response = await _httpClient.GetAsync($"api/users/{userId}");
                response.EnsureSuccessStatusCode();
                
                var json = await response.Content.ReadAsStringAsync();
                return JsonSerializer.Deserialize<UserData>(json);
            });
        }
        catch (CircuitBreakerOpenException)
        {
            _metrics.IncrementCounter("api.requests.blocked");
            throw new ServiceUnavailableException("Service temporarily unavailable");
        }
        catch (Exception ex)
        {
            _metrics.IncrementCounter("api.requests.failed");
            throw;
        }
        finally
        {
            stopwatch.Stop();
            _metrics.RecordValue("api.request.duration", stopwatch.ElapsedMilliseconds);
        }
    }
    
    private void NotifyMonitoring(string message, Exception exception)
    {
        // Интеграция с системами мониторинга (Slack, Teams, PagerDuty, etc.)
        // Здесь можно отправлять уведомления в Slack или создавать инциденты
    }
}
```

## Регистрация в DI с Polly

```cs
public void ConfigureServices(IServiceCollection services)
{
    // Регистрируем HttpClient с Circuit Breaker
    services.AddHttpClient<IExternalApiService, PollyExternalApiService>(client =>
    {
        client.BaseAddress = new Uri("https://external-api.com/");
        client.Timeout = TimeSpan.FromSeconds(30);
    })
    .AddPolicyHandler(GetCircuitBreakerPolicy())
    .AddPolicyHandler(GetRetryPolicy())
    .AddPolicyHandler(GetTimeoutPolicy());
    
    services.AddMemoryCache();
}

private static IAsyncPolicy<HttpResponseMessage> GetCircuitBreakerPolicy()
{
    return HttpPolicyExtensions
        .HandleTransientHttpError()
        .CircuitBreakerAsync(
            handledEventsAllowedBeforeBreaking: 5,
            durationOfBreak: TimeSpan.FromMinutes(1),
            onBreak: (result, duration) =>
            {
                Console.WriteLine($"Circuit opened for {duration}");
            },
            onReset: () =>
            {
                Console.WriteLine("Circuit closed");
            });
}

private static IAsyncPolicy<HttpResponseMessage> GetRetryPolicy()
{
    return HttpPolicyExtensions
        .HandleTransientHttpError()
        .WaitAndRetryAsync(
            retryCount: 3,
            sleepDurationProvider: retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)));
}

private static IAsyncPolicy<HttpResponseMessage> GetTimeoutPolicy()
{
    return Policy.TimeoutAsync<HttpResponseMessage>(TimeSpan.FromSeconds(10));
}
```

## Health Check с Circuit Breaker

```cs
public class ExternalApiHealthCheck : IHealthCheck
{
    private readonly IExternalApiService _apiService;
    private readonly ILogger<ExternalApiHealthCheck> _logger;
    
    public ExternalApiHealthCheck(IExternalApiService apiService, ILogger<ExternalApiHealthCheck> logger)
    {
        _apiService = apiService;
        _logger = logger;
    }
    
    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context, 
        CancellationToken cancellationToken = default)
    {
        try
        {
            // Проверяем состояние circuit breaker
            if (_apiService is MonitoredCircuitBreakerService monitoredService)
            {
                var circuitBreakerState = GetCircuitBreakerState(monitoredService);
                
                if (circuitBreakerState == CircuitBreakerState.Open)
                {
                    return HealthCheckResult.Unhealthy("Circuit breaker is OPEN");
                }
                
                if (circuitBreakerState == CircuitBreakerState.HalfOpen)
                {
                    return HealthCheckResult.Degraded("Circuit breaker is HALF-OPEN");
                }
            }
            
            // Пробуем простой вызов
            await _apiService.GetUserAsync(1);
            
            return HealthCheckResult.Healthy("External API is responsive");
        }
        catch (ServiceUnavailableException)
        {
            return HealthCheckResult.Unhealthy("External API is unavailable");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Health check failed");
            return HealthCheckResult.Unhealthy($"Health check failed: {ex.Message}");
        }
    }
    
    private CircuitBreakerState GetCircuitBreakerState(MonitoredCircuitBreakerService service)
    {
        // Логика получения состояния circuit breaker
        // Можно через reflection или специальный интерфейс
        return CircuitBreakerState.Closed;
    }
}

// Регистрация Health Check
services.AddHealthChecks()
    .AddCheck<ExternalApiHealthCheck>("external-api");
```

## Заключение

**Circuit Breaker паттерн** — это критически важный инструмент для построения отказоустойчивых систем:

### ✅ Преимущества:

- **Предотвращает каскадные сбои**
- **Быстрые fallback ответы** вместо таймаутов
- **Автоматическое восстановление** при починке сервиса
- **Защищает ресурсы** от перегрузки

### ⚙️ Ключевые параметры:

- **Failure Threshold** — сколько ошибок для открытия (обычно 3-10)
- **Timeout** — на сколько открываем circuit breaker (30с - 5мин)
- **Fallback Strategy** — что делать при открытом circuit breaker

### 🎯 Используй когда:

- Вызываешь **внешние сервисы**
- Работаешь с **базами данных**
- Есть риск **каскадных сбоев**
- Нужна **высокая доступность** системы

**Рекомендация:** Используй **Polly** для production приложений — это проверенная, настраиваемая и мощная библиотека с отличной интеграцией в .NET экосистему! 🚀