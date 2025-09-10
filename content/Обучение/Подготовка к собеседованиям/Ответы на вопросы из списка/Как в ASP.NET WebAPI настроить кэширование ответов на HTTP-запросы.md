---
уровень: "[[middle]]"
секция: платформа .NET
пройдено: 
теги: 
дата: 02-05-2024
время: 20:29
---
Настройка кэширования ответов на HTTP-запросы в ASP.NET Web API помогает улучшить производительность, уменьшить нагрузку на сервер и ускорить отклик для пользователей. Можно использовать несколько методов для настройки кэширования, включая HTTP-заголовки, промежуточное ПО (middleware) и атрибуты. Вот как это можно сделать:

### 1. Использование HTTP-заголовков

Можно настроить кэширование с помощью заголовков, таких как `Cache-Control`, `Expires`, и `ETag`.

#### Пример:
```csharp
[HttpGet]
[Route("api/values")]
public IActionResult GetValues()
{
    var values = new[] { "value1", "value2" };
    
    var cacheDuration = 60; // в секундах
    Response.Headers.Add("Cache-Control", $"public, max-age={cacheDuration}");
    Response.Headers.Add("Expires", DateTime.UtcNow.AddSeconds(cacheDuration).ToString("R"));

    return Ok(values);
}
```

### 2. Использование атрибутов

В ASP.NET Core можно использовать атрибуты для настройки кэширования.

#### Пример:
```csharp
[HttpGet]
[ResponseCache(Duration = 60, Location = ResponseCacheLocation.Client)]
public IActionResult GetValues()
{
    var values = new[] { "value1", "value2" };
    return Ok(values);
}
```

### 3. Использование промежуточного ПО (Middleware)

Можно настроить кэширование на уровне промежуточного ПО для более гибкого и глобального управления.

#### Пример:
1. Установите пакет `Microsoft.AspNetCore.ResponseCaching`.

```bash
dotnet add package Microsoft.AspNetCore.ResponseCaching
```

2. Настройте промежуточное ПО в `Startup.cs`.

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddControllers();
    services.AddResponseCaching();
}

public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
{
    if (env.IsDevelopment())
    {
        app.UseDeveloperExceptionPage();
    }

    app.UseHttpsRedirection();

    app.UseRouting();

    app.UseAuthorization();

    app.UseResponseCaching();

    app.UseEndpoints(endpoints =>
    {
        endpoints.MapControllers();
    });
}
```

3. Настройте контроллер или действие.

```csharp
[HttpGet]
[Route("api/values")]
[ResponseCache(Duration = 60, Location = ResponseCacheLocation.Any)]
public IActionResult GetValues()
{
    var values = new[] { "value1", "value2" };
    return Ok(values);
}
```

### 4. Кэширование на стороне сервера (In-Memory Cache)

Можно использовать встроенное кэширование в памяти для кэширования результатов запросов.

#### Пример:
1. Установите пакет `Microsoft.Extensions.Caching.Memory`.

```bash
dotnet add package Microsoft.Extensions.Caching.Memory
```

2. Настройте кэширование в `Startup.cs`.

```csharp
public void ConfigureServices(IServiceCollection services)
{
    services.AddControllers();
    services.AddMemoryCache();
}
```

3. Используйте кэш в контроллере.

```csharp
private readonly IMemoryCache _cache;

public ValuesController(IMemoryCache cache)
{
    _cache = cache;
}

[HttpGet]
[Route("api/values")]
public IActionResult GetValues()
{
    var cacheKey = "valuesKey";
    if (!_cache.TryGetValue(cacheKey, out string[] values))
    {
        values = new[] { "value1", "value2" };
        var cacheEntryOptions = new MemoryCacheEntryOptions
            .SetSlidingExpiration(TimeSpan.FromSeconds(60));

        _cache.Set(cacheKey, values, cacheEntryOptions);
    }

    return Ok(values);
}
```

Эти методы помогут вам настроить кэширование ответов в ASP.NET Web API в зависимости от ваших требований и условий использования.