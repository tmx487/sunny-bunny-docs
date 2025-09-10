# Вариант БЕЗ Grafana+Prometheus

Я создал продакшн-пример middleware для логирования и мониторинга запросов в ASP.NET Core. Этот пример включает три файла:

1. **[[Реализация собственного middleware#RequestLoggingMiddleware|RequestLoggingMiddleware.cs]]** - основной класс middleware, который:
    
    - Логирует информацию о входящих HTTP запросах (метод, путь, заголовки, тело)
    - Измеряет время выполнения запроса
    - Перехватывает ответы для логирования (статус код, заголовки, тело)
    - Логирует исключения, если они возникают
    - Маскирует чувствительные данные (пароли, токены, номера кредитных карт)
    - Имеет гибкие настройки через класс `RequestLoggingOptions`
2. **[[Реализация собственного middleware#RequestLoggingMiddlewareExtensions|RequestLoggingMiddlewareExtensions.cs]]** - методы расширения для удобной регистрации middleware:
    
    - `UseRequestLogging()` для добавления middleware в конвейер
    - `AddRequestLogging()` для регистрации необходимых зависимостей
3. **[[Реализация собственного middleware#Startup|Пример использования в Startup.cs]]** - показывает, как правильно интегрировать middleware в приложение:
    
    - Регистрация в `ConfigureServices()`
    - Добавление в конвейер в `Configure()` с настройкой опций

Этот middleware имеет важные производственные особенности:

- Эффективная работа с памятью (использует `RecyclableMemoryStreamManager`)
- Ограничение размера логируемых данных
- Возможность исключать пути (например, health checks)
- Маскирование чувствительной информации
- Добавление заголовка с временем выполнения для мониторинга

### RequestLoggingMiddleware

```csharp
using System;
using System.Diagnostics;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IO;

namespace MyApp.Middleware
{
    public class RequestLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<RequestLoggingMiddleware> _logger;
        private readonly RecyclableMemoryStreamManager _memoryStreamManager;
        
        // Настройки для логирования
        private readonly RequestLoggingOptions _options;

        public RequestLoggingMiddleware(
            RequestDelegate next, 
            ILogger<RequestLoggingMiddleware> logger,
            RequestLoggingOptions options = null)
        {
            _next = next;
            _logger = logger;
            _memoryStreamManager = new RecyclableMemoryStreamManager();
            _options = options ?? new RequestLoggingOptions();
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Пропускаем логирование для путей, указанных в исключениях
            if (_options.ShouldSkipLogging(context.Request.Path))
            {
                await _next(context);
                return;
            }

            // Создаем ID запроса, если его нет
            if (string.IsNullOrEmpty(context.TraceIdentifier))
            {
                context.TraceIdentifier = Guid.NewGuid().ToString();
            }

            // Метрики времени
            var stopwatch = Stopwatch.StartNew();
            
            // Логируем информацию о запросе
            await LogRequest(context);
            
            // Создаем временный стрим для перехвата ответа
            var originalBodyStream = context.Response.Body;
            using var responseBodyStream = _memoryStreamManager.GetStream();
            context.Response.Body = responseBodyStream;

            // Передаем запрос дальше по конвейеру
            try
            {
                await _next(context);
                stopwatch.Stop();
                
                // Логируем информацию о результате
                await LogResponse(context, stopwatch.ElapsedMilliseconds, responseBodyStream);
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                
                // Логируем ошибку
                LogException(context, stopwatch.ElapsedMilliseconds, ex);
                
                // Перебрасываем исключение дальше для обработки другими middleware
                throw;
            }
            finally
            {
                // Копируем перехваченный ответ в оригинальный поток
                responseBodyStream.Position = 0;
                await responseBodyStream.CopyToAsync(originalBodyStream);
                context.Response.Body = originalBodyStream;
            }
        }

        private async Task LogRequest(HttpContext context)
        {
            context.Request.EnableBuffering();

            var requestPath = context.Request.Path;
            var method = context.Request.Method;
            var queryString = context.Request.QueryString.ToString();
            var headers = _options.LogHeaders ? GetHeadersJson(context.Request.Headers) : "";
            
            string requestBody = "";
            if (_options.LogRequestBody && context.Request.ContentLength > 0)
            {
                // Читаем тело запроса
                using var streamReader = new StreamReader(
                    context.Request.Body,
                    leaveOpen: true);
                    
                requestBody = await streamReader.ReadToEndAsync();
                
                // Сбрасываем позицию в потоке, чтобы следующие обработчики могли читать тело
                context.Request.Body.Position = 0;
                
                // Обрезаем тело запроса, если оно слишком длинное
                if (requestBody.Length > _options.MaxBodyLength)
                {
                    requestBody = requestBody.Substring(0, _options.MaxBodyLength) + "... [truncated]";
                }
            }

            // Маскируем чувствительные данные, если нужно
            if (_options.SensitiveDataPatterns.Count > 0)
            {
                requestBody = MaskSensitiveData(requestBody);
                queryString = MaskSensitiveData(queryString);
            }

            _logger.LogInformation(
                "Request {TraceId}: {Method} {Path}{QueryString} - Headers: {Headers} - Body: {RequestBody}",
                context.TraceIdentifier,
                method,
                requestPath,
                queryString,
                headers,
                requestBody);
        }

        private async Task LogResponse(HttpContext context, long elapsedMs, MemoryStream responseBodyStream)
        {
            responseBodyStream.Position = 0;
            
            var responseBody = "";
            if (_options.LogResponseBody)
            {
                using var streamReader = new StreamReader(responseBodyStream, leaveOpen: true);
                responseBody = await streamReader.ReadToEndAsync();
                
                // Обрезаем тело ответа, если оно слишком длинное
                if (responseBody.Length > _options.MaxBodyLength)
                {
                    responseBody = responseBody.Substring(0, _options.MaxBodyLength) + "... [truncated]";
                }
                
                // Маскируем чувствительные данные
                if (_options.SensitiveDataPatterns.Count > 0)
                {
                    responseBody = MaskSensitiveData(responseBody);
                }
            }

            var headers = _options.LogHeaders ? GetHeadersJson(context.Response.Headers) : "";

            _logger.LogInformation(
                "Response {TraceId}: {StatusCode} - Completed in {ElapsedMilliseconds}ms - Headers: {Headers} - Body: {ResponseBody}",
                context.TraceIdentifier,
                context.Response.StatusCode,
                elapsedMs,
                headers,
                responseBody);

            // Добавляем информацию о времени выполнения в заголовки, если нужно
            if (_options.IncludeTimingHeader)
            {
                context.Response.Headers.Add("X-Response-Time-Ms", elapsedMs.ToString());
            }
        }

        private void LogException(HttpContext context, long elapsedMs, Exception ex)
        {
            _logger.LogError(
                ex,
                "Error {TraceId}: {StatusCode} - Exception after {ElapsedMilliseconds}ms - {ExceptionMessage}",
                context.TraceIdentifier,
                context.Response.StatusCode,
                elapsedMs,
                ex.Message);
        }

        private string GetHeadersJson(IHeaderDictionary headers)
        {
            var filteredHeaders = new Dictionary<string, string>();
            
            foreach (var header in headers)
            {
                // Пропускаем чувствительные заголовки
                if (_options.SensitiveHeaders.Contains(header.Key.ToLowerInvariant()))
                {
                    filteredHeaders[header.Key] = "[Redacted]";
                }
                else
                {
                    filteredHeaders[header.Key] = header.Value.ToString();
                }
            }
            
            return System.Text.Json.JsonSerializer.Serialize(filteredHeaders);
        }

        private string MaskSensitiveData(string input)
        {
            if (string.IsNullOrEmpty(input))
                return input;
                
            var result = input;
            
            foreach (var pattern in _options.SensitiveDataPatterns)
            {
                result = System.Text.RegularExpressions.Regex.Replace(
                    result, 
                    pattern, 
                    "[Redacted]");
            }
            
            return result;
        }
    }

    public class RequestLoggingOptions
    {
        // Максимальная длина тела запроса/ответа для логирования
        public int MaxBodyLength { get; set; } = 4096;
        
        // Логировать заголовки запроса/ответа
        public bool LogHeaders { get; set; } = true;
        
        // Логировать тело запроса
        public bool LogRequestBody { get; set; } = true;
        
        // Логировать тело ответа
        public bool LogResponseBody { get; set; } = true;
        
        // Добавлять заголовок с временем выполнения запроса
        public bool IncludeTimingHeader { get; set; } = true;
        
        // Пути, которые нужно исключить из логирования
        public List<string> PathsToExclude { get; set; } = new List<string>
        {
            "/health",
            "/metrics",
            "/favicon.ico"
        };
        
        // Чувствительные заголовки, которые не нужно логировать
        public HashSet<string> SensitiveHeaders { get; set; } = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "Authorization",
            "Cookie",
            "X-API-Key"
        };
        
        // Паттерны для маскирования чувствительных данных
        public List<string> SensitiveDataPatterns { get; set; } = new List<string>
        {
            "\"password\"\\s*:\\s*\"[^\"]*\"",
            "\"token\"\\s*:\\s*\"[^\"]*\"",
            "\\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11})\\b" // Простой шаблон для кредитных карт
        };
        
        // Метод для проверки, нужно ли пропустить логирование для указанного пути
        public bool ShouldSkipLogging(PathString path)
        {
            return PathsToExclude.Any(p => path.StartsWithSegments(p, StringComparison.OrdinalIgnoreCase));
        }
    }
}
```

### RequestLoggingMiddlewareExtensions

```csharp
using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;

namespace MyApp.Middleware
{
    public static class RequestLoggingMiddlewareExtensions
    {
        /// <summary>
        /// Добавляет middleware для логирования запросов в конвейер обработки HTTP
        /// </summary>
        /// <param name="builder">Application builder</param>
        /// <param name="configureOptions">Опциональный делегат для настройки опций логирования</param>
        /// <returns>IApplicationBuilder для цепочки вызовов</returns>
        public static IApplicationBuilder UseRequestLogging(
            this IApplicationBuilder builder,
            Action<RequestLoggingOptions> configureOptions = null)
        {
            var options = new RequestLoggingOptions();
            configureOptions?.Invoke(options);
            
            return builder.UseMiddleware<RequestLoggingMiddleware>(options);
        }
        
        /// <summary>
        /// Регистрирует зависимости, необходимые для middleware логирования запросов
        /// </summary>
        /// <param name="services">Service collection</param>
        /// <returns>IServiceCollection для цепочки вызовов</returns>
        public static IServiceCollection AddRequestLogging(this IServiceCollection services)
        {
            // Здесь можно зарегистрировать дополнительные сервисы,
            // необходимые для работы middleware логирования
            return services;
        }
    }
}
```

### Startup

```csharp
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using MyApp.Middleware;

namespace MyApp
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        public void ConfigureServices(IServiceCollection services)
        {
            // Регистрируем сервисы для middleware логирования
            services.AddRequestLogging();
            
            // Другие сервисы
            services.AddControllers();
            services.AddHealthChecks();
            // ...
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/error");
                app.UseHsts();
            }

            // Middleware логирования запросов используется в начале конвейера,
            // после обработки исключений, но до авторизации
            app.UseRequestLogging(options =>
            {
                // Настраиваем опции
                options.LogHeaders = true;
                options.LogRequestBody = true;
                options.LogResponseBody = true;
                options.MaxBodyLength = 8192; // 8KB
                
                // Дополнительные пути для исключения из логирования
                options.PathsToExclude.Add("/swagger");
                
                // Добавляем шаблоны для маскирования чувствительных данных
                options.SensitiveDataPatterns.Add("\"ssn\"\\s*:\\s*\"[^\"]*\"");
            });

            app.UseHttpsRedirection();
            app.UseRouting();
            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                endpoints.MapHealthChecks("/health");
            });
        }
    }
}
```

# Вариант С Grafana+Prometheus 

Да, создание собственного middleware для логирования полностью совместимо с интеграцией Grafana и Prometheus. Более того, хорошо спроектированный middleware может стать отличным источником метрик для этих систем мониторинга.

Вот как можно дополнить наш middleware для полноценной интеграции с Prometheus и Grafana:

Да, собственный middleware для логирования отлично совместим с Grafana и Prometheus! Я дополнил пример, показав, как интегрировать их в единую систему мониторинга приложения ASP.NET Core.

## Как это работает:

1. **RequestMetricsMiddleware.cs** собирает ключевые метрики для Prometheus:
    
    - Общее количество запросов (`app_requests_total`)
    - Время выполнения запросов (`app_request_duration_seconds`)
    - Количество ошибок (`app_request_errors_total`)
    - Количество активных запросов (`app_requests_active`)
2. **PrometheusExtensions.cs** предоставляет удобные методы расширения для подключения:
    
    - `UseMetricsMiddleware()` - добавляет middleware для сбора метрик
    - `UsePrometheusServer()` - настраивает endpoint `/metrics` для Prometheus
    - `AddPrometheusMetrics()` - регистрирует нужные сервисы
3. **Startup.cs** показывает правильную интеграцию:
    
    - Инициализирует мониторинг в начале конвейера обработки запросов
    - Исключает путь `/metrics` из логирования для избежания бесконечных циклов
    - Объединяет логирование с метриками
4. **prometheus.yml** - пример конфигурации для Prometheus:
    
    - Настройка сборщика для вашего ASP.NET Core приложения
    - Указание путей для сбора метрик
5. **dashboard.json** - готовый дашборд для Grafana с визуализациями:
    
    - Количество запросов по эндпоинтам
    - Время отклика (percentiles p50/p95)
    - Количество активных запросов
    - Ошибки по типам
    - Распределение HTTP статус-кодов

## Преимущества такого подхода:

1. **Полный контроль** - вы определяете, какие именно метрики собирать
2. **Производительность** - минимальные накладные расходы на сбор метрик
3. **Низкая кардинальность** - нормализация путей уменьшает нагрузку на Prometheus
4. **Готовность к продакшн** - метрики сразу в формате для отображения в Grafana
5. **Расширяемость** - легко добавлять новые метрики по мере необходимости

Для запуска такой системы вам потребуется:

1. Добавить пакет `prometheus-net.AspNetCore` в ваш проект
2. Настроить Prometheus для сбора метрик через endpoint `/metrics`
3. Импортировать предложенный дашборд в Grafana и указать источник данных Prometheus

Хотите, чтобы я дополнительно объяснил какую-то часть этой интеграции?