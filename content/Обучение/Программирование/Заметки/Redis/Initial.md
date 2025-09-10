Redis (Remote Dictionary Server) — это высокопроизводительная in-memory структура данных, которая работает как база данных, кэш и брокер сообщений.

### Основные принципы:

**Хранение в памяти**: Все данные хранятся в оперативной памяти, что обеспечивает очень быстрый доступ. Опционально данные могут сохраняться на диск для персистентности.

**Структуры данных**: Redis поддерживает различные типы данных — строки, хеши, списки, множества, отсортированные множества, битовые карты, HyperLogLog и потоки.

**Атомарность операций**: Все операции Redis атомарны, что означает их полное выполнение или полный откат.

**Персистентность**: Redis предлагает два механизма сохранения данных — RDB (снимки) и AOF (журнал команд).

**Репликация**: Поддержка master-slave репликации для обеспечения отказоустойчивости.

**Кластеризация**: Возможность горизонтального масштабирования через Redis Cluster.

## Наиболее частые сценарии использования Redis

### 1. Кэширование данных

**Самый популярный сценарий** - кэширование результатов запросов к базе данных, API или вычислений.

```csharp
// Кэширование результатов запроса к БД
public async Task<User> GetUserAsync(int userId)
{
    string cacheKey = $"user:{userId}";
    
    // Попытка получить из кэша
    var cachedUser = await _redis.StringGetAsync(cacheKey);
    if (cachedUser.HasValue)
    {
        return JsonSerializer.Deserialize<User>(cachedUser);
    }
    
    // Если нет в кэше - запрос к БД
    var user = await _userRepository.GetByIdAsync(userId);
    if (user != null)
    {
        // Сохранить в кэш на 1 час
        await _redis.StringSetAsync(cacheKey, 
            JsonSerializer.Serialize(user), 
            TimeSpan.FromHours(1));
    }
    
    return user;
}

// Кэширование результатов API
public async Task<WeatherData> GetWeatherAsync(string city)
{
    string cacheKey = $"weather:{city.ToLower()}";
    
    var cached = await _redis.StringGetAsync(cacheKey);
    if (cached.HasValue)
    {
        return JsonSerializer.Deserialize<WeatherData>(cached);
    }
    
    var weather = await _weatherApiClient.GetWeatherAsync(city);
    await _redis.StringSetAsync(cacheKey, 
        JsonSerializer.Serialize(weather), 
        TimeSpan.FromMinutes(15)); // Обновлять каждые 15 минут
    
    return weather;
}
```

### 2. Управление сессиями

Хранение данных пользовательских сессий для веб-приложений.

```csharp
// Создание сессии
public async Task<string> CreateSessionAsync(int userId, Dictionary<string, object> sessionData)
{
    string sessionId = Guid.NewGuid().ToString();
    string sessionKey = $"session:{sessionId}";
    
    var data = new Dictionary<string, object>(sessionData)
    {
        ["userId"] = userId,
        ["createdAt"] = DateTime.UtcNow,
        ["lastActivity"] = DateTime.UtcNow
    };
    
    await _redis.HashSetAsync(sessionKey, data.Select(kvp => 
        new HashEntry(kvp.Key, JsonSerializer.Serialize(kvp.Value))).ToArray());
    
    // Сессия истекает через 24 часа
    await _redis.KeyExpireAsync(sessionKey, TimeSpan.FromHours(24));
    
    return sessionId;
}

// Получение сессии
public async Task<SessionData> GetSessionAsync(string sessionId)
{
    string sessionKey = $"session:{sessionId}";
    var sessionFields = await _redis.HashGetAllAsync(sessionKey);
    
    if (!sessionFields.Any())
        return null;
    
    // Обновить время последней активности
    await _redis.HashSetAsync(sessionKey, "lastActivity", 
        JsonSerializer.Serialize(DateTime.UtcNow));
    await _redis.KeyExpireAsync(sessionKey, TimeSpan.FromHours(24));
    
    return DeserializeSession(sessionFields);
}
```

### 3. Очереди задач и фоновые задания

Реализация очередей для асинхронной обработки задач.

```csharp
// Producer - добавление задач в очередь
public async Task EnqueueTaskAsync<T>(string queueName, T task) where T : class
{
    var taskData = new
    {
        Id = Guid.NewGuid(),
        Type = typeof(T).Name,
        Data = task,
        CreatedAt = DateTime.UtcNow,
        Attempts = 0
    };
    
    await _redis.ListLeftPushAsync($"queue:{queueName}", 
        JsonSerializer.Serialize(taskData));
    
    // Опционально - счетчик задач
    await _redis.StringIncrementAsync($"queue:{queueName}:total");
}

// Consumer - обработка задач
public async Task<T> DequeueTaskAsync<T>(string queueName, int timeoutSeconds = 10)
{
    var result = await _redis.ListRightPopAsync($"queue:{queueName}");
    
    if (!result.HasValue)
        return default(T);
    
    var taskWrapper = JsonSerializer.Deserialize<TaskWrapper<T>>(result);
    
    // Переместить в очередь обработки (для надежности)
    await _redis.ListLeftPushAsync($"queue:{queueName}:processing", result);
    
    return taskWrapper.Data;
}

// Email очередь
public async Task SendEmailAsync(string to, string subject, string body)
{
    await EnqueueTaskAsync("emails", new EmailTask
    {
        To = to,
        Subject = subject,
        Body = body
    });
}
```

### 4. Счетчики и аналитика в реальном времени

Подсчет различных метрик: просмотры, лайки, активные пользователи.

```csharp
// Счетчики просмотров
public async Task IncrementPageViewAsync(string pageId)
{
    string today = DateTime.UtcNow.ToString("yyyy-MM-dd");
    
    // Общий счетчик
    await _redis.StringIncrementAsync($"pageviews:{pageId}");
    
    // Счетчик по дням
    await _redis.StringIncrementAsync($"pageviews:{pageId}:{today}");
    
    // Счетчик по часам
    string hour = DateTime.UtcNow.ToString("yyyy-MM-dd:HH");
    await _redis.StringIncrementAsync($"pageviews:{pageId}:{hour}");
    
    // Установить TTL для почасовых счетчиков
    await _redis.KeyExpireAsync($"pageviews:{pageId}:{hour}", TimeSpan.FromDays(7));
}

// Активные пользователи
public async Task TrackActiveUserAsync(int userId)
{
    string today = DateTime.UtcNow.ToString("yyyy-MM-dd");
    
    // Добавить в множество активных пользователей
    await _redis.SetAddAsync($"active_users:{today}", userId);
    
    // TTL - хранить 30 дней
    await _redis.KeyExpireAsync($"active_users:{today}", TimeSpan.FromDays(30));
}

public async Task<long> GetActiveUsersCountAsync(DateTime date)
{
    string dateKey = date.ToString("yyyy-MM-dd");
    return await _redis.SetLengthAsync($"active_users:{dateKey}");
}

// Рейтинг/лидерборд
public async Task UpdateUserScoreAsync(int userId, double score)
{
    await _redis.SortedSetAddAsync("leaderboard", userId, score);
    
    // Недельный рейтинг
    string week = GetWeekKey(DateTime.UtcNow);
    await _redis.SortedSetAddAsync($"leaderboard:week:{week}", userId, score);
    await _redis.KeyExpireAsync($"leaderboard:week:{week}", TimeSpan.FromDays(14));
}
```

### 5. Уведомления и pub/sub

Система уведомлений в реальном времени.

```csharp
// Publisher - отправка уведомлений
public async Task SendNotificationAsync(int userId, string message, string type = "info")
{
    var notification = new
    {
        Id = Guid.NewGuid(),
        UserId = userId,
        Message = message,
        Type = type,
        Timestamp = DateTime.UtcNow
    };
    
    // Персональный канал пользователя
    await _subscriber.PublishAsync($"user:{userId}:notifications", 
        JsonSerializer.Serialize(notification));
    
    // Общий канал по типу
    await _subscriber.PublishAsync($"notifications:{type}", 
        JsonSerializer.Serialize(notification));
    
    // Сохранить в список уведомлений пользователя
    await _redis.ListLeftPushAsync($"notifications:{userId}", 
        JsonSerializer.Serialize(notification));
    
    // Ограничить количество сохраненных уведомлений
    await _redis.ListTrimAsync($"notifications:{userId}", 0, 99); // Последние 100
}

// Subscriber - получение уведомлений
public async Task SubscribeToUserNotificationsAsync(int userId, 
    Action<string> onNotification)
{
    await _subscriber.SubscribeAsync($"user:{userId}:notifications", 
        (channel, message) => onNotification(message));
}

// Чат/мессенджер
public async Task SendChatMessageAsync(string chatId, int fromUserId, string message)
{
    var chatMessage = new
    {
        Id = Guid.NewGuid(),
        ChatId = chatId,
        FromUserId = fromUserId,
        Message = message,
        Timestamp = DateTime.UtcNow
    };
    
    // Опубликовать в канал чата
    await _subscriber.PublishAsync($"chat:{chatId}", 
        JsonSerializer.Serialize(chatMessage));
    
    // Сохранить в историю чата
    await _redis.ListLeftPushAsync($"chat:{chatId}:messages", 
        JsonSerializer.Serialize(chatMessage));
}
```

### 6. Кэширование распределенных блокировок

Координация доступа к ресурсам в распределенной системе.

```csharp
public class DistributedLock
{
    private readonly IDatabase _redis;
    private readonly string _lockKey;
    private readonly string _lockValue;
    private readonly TimeSpan _expiry;

    public DistributedLock(IDatabase redis, string resource, TimeSpan expiry)
    {
        _redis = redis;
        _lockKey = $"lock:{resource}";
        _lockValue = Environment.MachineName + ":" + Thread.CurrentThread.ManagedThreadId;
        _expiry = expiry;
    }

    public async Task<bool> AcquireAsync()
    {
        return await _redis.StringSetAsync(_lockKey, _lockValue, _expiry, When.NotExists);
    }

    public async Task<bool> ReleaseAsync()
    {
        const string script = @"
            if redis.call('GET', KEYS[1]) == ARGV[1] then
                return redis.call('DEL', KEYS[1])
            else
                return 0
            end";
        
        var result = await _redis.ScriptEvaluateAsync(script, 
            new RedisKey[] { _lockKey }, 
            new RedisValue[] { _lockValue });
        
        return (int)result == 1;
    }
}

// Использование
public async Task ProcessOrderAsync(int orderId)
{
    var lockResource = $"order:{orderId}";
    var distributedLock = new DistributedLock(_redis, lockResource, TimeSpan.FromMinutes(5));
    
    if (await distributedLock.AcquireAsync())
    {
        try
        {
            // Обработка заказа
            await ProcessOrderInternal(orderId);
        }
        finally
        {
            await distributedLock.ReleaseAsync();
        }
    }
    else
    {
        throw new InvalidOperationException("Order is being processed by another instance");
    }
}
```

### 7. Rate Limiting (ограничение частоты запросов)

Контроль нагрузки и предотвращение злоупотреблений.

```csharp
// Простой rate limiter
public async Task<bool> IsRateLimitExceededAsync(string identifier, int maxRequests, TimeSpan window)
{
    string key = $"ratelimit:{identifier}";
    
    var current = await _redis.StringIncrementAsync(key);
    
    if (current == 1)
    {
        // Первый запрос - установить TTL
        await _redis.KeyExpireAsync(key, window);
    }
    
    return current > maxRequests;
}

// Sliding window rate limiter
public async Task<bool> CheckSlidingWindowRateLimitAsync(string userId, int maxRequests, TimeSpan window)
{
    string key = $"ratelimit:sliding:{userId}";
    var now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
    var windowStart = now - (long)window.TotalMilliseconds;
    
    // Удаляем старые записи
    await _redis.SortedSetRemoveRangeByScoreAsync(key, 0, windowStart);
    
    // Подсчитываем текущие запросы
    var currentCount = await _redis.SortedSetLengthAsync(key);
    
    if (currentCount >= maxRequests)
    {
        return false; // Лимит превышен
    }
    
    // Добавляем текущий запрос
    await _redis.SortedSetAddAsync(key, Guid.NewGuid().ToString(), now);
    
    // Устанавливаем TTL
    await _redis.KeyExpireAsync(key, window);
    
    return true; // Разрешен
}

// Использование в middleware
public async Task<IActionResult> ApiEndpoint()
{
    string userId = GetCurrentUserId();
    
    if (!await CheckSlidingWindowRateLimitAsync(userId, 100, TimeSpan.FromHours(1)))
    {
        return StatusCode(429, "Rate limit exceeded");
    }
    
    return Ok(await GetDataAsync());
}
```

### 8. Кэширование конфигурации и настроек

Быстрый доступ к конфигурационным данным.

```csharp
public class ConfigurationCache
{
    private readonly IDatabase _redis;
    private const string CONFIG_PREFIX = "config:";

    public async Task<T> GetConfigAsync<T>(string key, Func<Task<T>> valueFactory = null, 
        TimeSpan? expiry = null)
    {
        string cacheKey = $"{CONFIG_PREFIX}{key}";
        var cached = await _redis.StringGetAsync(cacheKey);
        
        if (cached.HasValue)
        {
            return JsonSerializer.Deserialize<T>(cached);
        }
        
        if (valueFactory != null)
        {
            var value = await valueFactory();
            await _redis.StringSetAsync(cacheKey, JsonSerializer.Serialize(value), 
                expiry ?? TimeSpan.FromMinutes(30));
            return value;
        }
        
        return default(T);
    }

    public async Task SetConfigAsync<T>(string key, T value, TimeSpan? expiry = null)
    {
        string cacheKey = $"{CONFIG_PREFIX}{key}";
        await _redis.StringSetAsync(cacheKey, JsonSerializer.Serialize(value), 
            expiry ?? TimeSpan.FromHours(1));
    }

    // Инвалидация кэша при изменении настроек
    public async Task InvalidateConfigAsync(string key)
    {
        await _redis.KeyDeleteAsync($"{CONFIG_PREFIX}{key}");
        
        // Уведомить другие сервисы об изменении
        await _subscriber.PublishAsync("config:invalidated", key);
    }
}
```

### 9. Геолокационные данные

Работа с геопространственными данными.

```csharp
// Добавление локаций
public async Task AddLocationAsync(string entityId, double longitude, double latitude)
{
    await _redis.GeoAddAsync("locations", longitude, latitude, entityId);
}

// Поиск ближайших объектов
public async Task<List<string>> FindNearbyAsync(double longitude, double latitude, 
    double radiusKm, int count = 10)
{
    var results = await _redis.GeoRadiusAsync("locations", longitude, latitude, 
        radiusKm, GeoUnit.Kilometers, count, Order.Ascending);
    
    return results.Select(r => r.Member.ToString()).ToList();
}

// Трекинг курьеров/такси
public async Task UpdateCourierLocationAsync(int courierId, double lng, double lat)
{
    await _redis.GeoAddAsync("couriers:active", lng, lat, courierId.ToString());
    
    // Также сохранить в историю
    var locationData = new { Longitude = lng, Latitude = lat, Timestamp = DateTime.UtcNow };
    await _redis.ListLeftPushAsync($"courier:{courierId}:track", 
        JsonSerializer.Serialize(locationData));
    
    // Ограничить историю
    await _redis.ListTrimAsync($"courier:{courierId}:track", 0, 999);
}
```

### 10. Временные данные и TTL

Автоматическое удаление временных данных.

```csharp
// Одноразовые коды (OTP)
public async Task<string> GenerateOtpAsync(string phone)
{
    string otp = new Random().Next(100000, 999999).ToString();
    string key = $"otp:{phone}";
    
    await _redis.StringSetAsync(key, otp, TimeSpan.FromMinutes(5));
    return otp;
}

public async Task<bool> ValidateOtpAsync(string phone, string otp)
{
    string key = $"otp:{phone}";
    var storedOtp = await _redis.StringGetAsync(key);
    
    if (storedOtp == otp)
    {
        await _redis.KeyDeleteAsync(key); // Удалить после использования
        return true;
    }
    
    return false;
}

// Временные токены
public async Task<string> CreateTempTokenAsync(int userId, Dictionary<string, object> claims)
{
    string token = Guid.NewGuid().ToString();
    string key = $"temp_token:{token}";
    
    var tokenData = new Dictionary<string, object>(claims)
    {
        ["userId"] = userId,
        ["createdAt"] = DateTime.UtcNow
    };
    
    await _redis.HashSetAsync(key, tokenData.Select(kvp => 
        new HashEntry(kvp.Key, JsonSerializer.Serialize(kvp.Value))).ToArray());
    
    await _redis.KeyExpireAsync(key, TimeSpan.FromHours(1));
    
    return token;
}
```

Эти сценарии покрывают 90% реальных случаев использования Redis в production приложениях. Каждый из них может быть адаптирован под конкретные требования проекта.