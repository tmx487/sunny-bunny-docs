Вот 8 практических задач разного уровня сложности! Они покрывают основные паттерны, которые встречаются в реальных проектах:

## 🎯 **Рекомендую начать с:**

**Задача 1 (Email Batch)** - похожа на вашу исходную, но с retry механизмом  
**Задача 2 (File Processing)** - классический pipeline паттерн

## 📈 **Уровни сложности:**

**Beginner:** Задачи 1-2  
**Intermediate:** Задачи 3-5  
**Advanced:** Задачи 6-8

## 🔧 **Что потренируете:**

- **SemaphoreSlim** - ограничение параллелизма
- **Producer-Consumer** - обработка очередей
- **Rate Limiting** - управление нагрузкой на API
- **Caching** - производительность и консистентность
- **Circuit Breaker** - устойчивость к сбоям
- **Background processing** - фоновые задачи

## 💡 **Подходы к решению:**

1. **Начните с простой версии** - заставьте работать
2. **Добавьте обработку ошибок** - что если что-то пойдет не так?
3. **Оптимизируйте производительность** - где узкие места?
4. **Напишите тесты** - как убедиться что работает правильно?

## 🚀 **Дополнительные челленджи:**

После решения основных задач можете:

- Добавить метрики и мониторинг
- Реализовать graceful shutdown
- Добавить конфигурируемость параметров
- Создать fluent API для настройки
- 
```csharp
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

// =====================================================
// ЗАДАЧА 1: Batch Processing с retry механизмом
// =====================================================

public interface IEmailService
{
    Task<bool> SendEmailAsync(string email, string subject, string body);
}

public class EmailRequest
{
    public string Email { get; set; }
    public string Subject { get; set; }
    public string Body { get; set; }
}

public static class EmailExtensions
{
    // TODO: Реализовать отправку множества email'ов с:
    // - Ограничением параллелизма (maxConcurrency)
    // - Retry механизмом (maxRetries)
    // - Возвращать список неуспешных отправок
    public static async Task<List<EmailRequest>> SendBatchAsync(
        this IEmailService emailService,
        List<EmailRequest> requests,
        int maxConcurrency,
        int maxRetries = 3)
    {
        // Ваша реализация здесь
        throw new NotImplementedException();
    }
}

// =====================================================
// ЗАДАЧА 2: File Processing Pipeline
// =====================================================

public interface IFileProcessor
{
    Task<string> ReadFileAsync(string filePath);
    Task<string> TransformAsync(string content);
    Task WriteFileAsync(string filePath, string content);
}

public static class FileProcessingExtensions
{
    // TODO: Реализовать пайплайн обработки файлов:
    // - Чтение → Трансформация → Запись
    // - Ограничить количество одновременно обрабатываемых файлов
    // - Сохранить порядок обработки
    // - Обработать ошибки (если файл не удалось обработать, пропустить его)
    public static async Task<string[]> ProcessFilesAsync(
        this IFileProcessor processor,
        string[] inputPaths,
        string[] outputPaths,
        int maxConcurrency)
    {
        // Должен вернуть массив путей успешно обработанных файлов
        // Ваша реализация здесь
        throw new NotImplementedException();
    }
}

// =====================================================
// ЗАДАЧА 3: API Rate Limited Client
// =====================================================

public interface IApiClient
{
    Task<T> GetAsync<T>(string endpoint);
}

public class RateLimitedApiClient
{
    private readonly IApiClient _client;
    
    public RateLimitedApiClient(IApiClient client)
    {
        _client = client;
    }

    // TODO: Реализовать клиент с ограничением частоты запросов:
    // - Максимум requestsPerSecond запросов в секунду
    // - Использовать sliding window или token bucket алгоритм
    // - Если лимит превышен, ждать до следующего доступного слота
    public async Task<T> GetAsync<T>(string endpoint, int requestsPerSecond)
    {
        // Ваша реализация здесь
        throw new NotImplementedException();
    }

    // TODO: Batch версия с лимитом
    public async Task<T[]> GetBatchAsync<T>(string[] endpoints, int requestsPerSecond)
    {
        // Ваша реализация здесь
        throw new NotImplementedException();
    }
}

// =====================================================
// ЗАДАЧА 4: Cache with Timeout и Background Refresh
// =====================================================

public interface IDataService
{
    Task<string> GetDataAsync(string key);
}

public class CachedDataService
{
    private readonly IDataService _dataService;
    private readonly Dictionary<string, (string value, DateTime expiry)> _cache = new();
    
    public CachedDataService(IDataService dataService)
    {
        _dataService = dataService;
    }

    // TODO: Реализовать кэш с:
    // - TTL (время жизни записи)
    // - Background refresh (обновление в фоне до истечения TTL)
    // - Защита от multiple concurrent requests для одного ключа
    // - Fallback на старые данные если refresh упал
    public async Task<string> GetAsync(string key, TimeSpan ttl, TimeSpan refreshBeforeExpiry)
    {
        // Ваша реализация здесь
        throw new NotImplementedException();
    }
}

// =====================================================
// ЗАДАЧА 5: Producer-Consumer с Backpressure
// =====================================================

public class WorkItem
{
    public int Id { get; set; }
    public string Data { get; set; }
}

public interface IWorkProcessor
{
    Task ProcessAsync(WorkItem item);
}

public class WorkQueue
{
    private readonly IWorkProcessor _processor;
    
    public WorkQueue(IWorkProcessor processor)
    {
        _processor = processor;
    }

    // TODO: Реализовать очередь работ с:
    // - Ограниченным размером очереди (maxQueueSize)
    // - Backpressure: если очередь полная, блокировать AddWork
    // - Несколько consumer'ов (workerCount)
    // - Graceful shutdown с CancellationToken
    // - Статистика: сколько элементов обработано/в очереди
    public async Task StartAsync(int maxQueueSize, int workerCount, CancellationToken cancellationToken)
    {
        // Ваша реализация здесь
        throw new NotImplementedException();
    }

    public async Task AddWorkAsync(WorkItem item, CancellationToken cancellationToken)
    {
        // Ваша реализация здесь
        throw new NotImplementedException();
    }

    public (int processed, int queued) GetStats()
    {
        // Ваша реализация здесь
        throw new NotImplementedException();
    }
}

// =====================================================
// ЗАДАЧА 6: Circuit Breaker Pattern
// =====================================================

public enum CircuitState
{
    Closed,    // Нормальная работа
    Open,      // Блокируем вызовы
    HalfOpen   // Пробуем восстановиться
}

public class CircuitBreaker<T>
{
    // TODO: Реализовать Circuit Breaker:
    // - Считать количество ошибок в скользящем окне времени
    // - Если ошибок больше порога, переходить в Open состояние
    // - В Open состоянии сразу кидать исключение без вызова функции
    // - Через timeout переходить в HalfOpen
    // - В HalfOpen пропускать один вызов для проверки
    // - Если вызов успешен, переходить в Closed, иначе обратно в Open
    
    public async Task<T> ExecuteAsync(Func<Task<T>> operation, 
        int failureThreshold,           // Сколько ошибок для открытия
        TimeSpan timeout,               // Время до перехода в HalfOpen
        TimeSpan samplingDuration)      // Окно для подсчета ошибок
    {
        // Ваша реализация здесь
        throw new NotImplementedException();
    }

    public CircuitState State { get; private set; }
}

// =====================================================
// ЗАДАЧА 7: Parallel Web Scraper
// =====================================================

public class WebPage
{
    public string Url { get; set; }
    public string Content { get; set; }
    public List<string> Links { get; set; } = new();
    public Exception Error { get; set; }
}

public interface IWebClient
{
    Task<string> DownloadAsync(string url);
}

public class WebScraper
{
    private readonly IWebClient _webClient;
    
    public WebScraper(IWebClient webClient)
    {
        _webClient = webClient;
    }

    // TODO: Реализовать веб-скрапер:
    // - Скачать стартовые страницы
    // - Извлечь ссылки с каждой страницы
    // - Скачать найденные страницы (до maxDepth уровней)
    // - Не скачивать одну страницу дважды
    // - Ограничить параллелизм (чтобы не DDos'ить сайт)
    // - Добавить задержку между запросами к одному домену
    public async Task<List<WebPage>> ScrapeAsync(
        string[] startUrls,
        int maxDepth,
        int maxConcurrency,
        TimeSpan delayBetweenRequests)
    {
        // Ваша реализация здесь
        throw new NotImplementedException();
    }

    private List<string> ExtractLinks(string content, string baseUrl)
    {
        // Простая заглушка для извлечения ссылок
        // В реальности использовали бы HtmlAgilityPack или AngleSharp
        return new List<string>();
    }
}

// =====================================================
// БОНУСНАЯ ЗАДАЧА 8: Async Lock с приоритетами
// =====================================================

public enum Priority
{
    Low = 0,
    Normal = 1, 
    High = 2,
    Critical = 3
}

public class PriorityAsyncLock
{
    // TODO: Реализовать асинхронный lock с приоритетами:
    // - Высокоприоритетные задачи получают доступ раньше
    // - Поддержка timeout'ов
    // - Cancellation support
    // - Защита от starvation (низкоприоритетные задачи тоже должны выполняться)
    
    public async Task<IDisposable> AcquireAsync(
        Priority priority = Priority.Normal,
        TimeSpan timeout = default,
        CancellationToken cancellationToken = default)
    {
        // Ваша реализация здесь
        throw new NotImplementedException();
    }
}

// =====================================================
// ПОДСКАЗКИ ДЛЯ РЕШЕНИЯ:
// =====================================================

/*
ЗАДАЧА 1 (Email Batch):
- Используйте SemaphoreSlim для ограничения параллелизма  
- Для retry используйте цикл с await Task.Delay между попытками
- Собирайте неуспешные отправки в ConcurrentBag

ЗАДАЧА 2 (File Processing):
- Создайте pipeline: read → transform → write
- Используйте Task.WhenAll с ограничением через SemaphoreSlim
- Для обработки ошибок оберните каждую операцию в try-catch

ЗАДАЧА 3 (Rate Limiting):
- Используйте SemaphoreSlim + Timer для token bucket
- Или ведите список timestamp'ов последних запросов
- DateTime.UtcNow для отслеживания времени

ЗАДАЧА 4 (Cache):
- Dictionary + SemaphoreSlim для thread-safety
- Task.Run для background refresh
- Используйте TaskCompletionSource для дедупликации запросов

ЗАДАЧА 5 (Producer-Consumer):
- Channel<T> или BlockingCollection<T>
- Task.Run для каждого worker'а
- CancellationToken.Register для graceful shutdown

ЗАДАЧА 6 (Circuit Breaker):
- Ведите список timestamp'ов ошибок
- Используйте состояние + DateTime для timeout'ов
- lock для thread-safety состояния

ЗАДАЧА 7 (Web Scraper):
- HashSet для отслеживания посещенных URL
- SemaphoreSlim + Dictionary<domain, DateTime> для rate limiting по доменам
- Queue<(url, depth)> для BFS обхода

ЗАДАЧА 8 (Priority Lock):
- SortedDictionary или PriorityQueue для очереди ожидания
- TaskCompletionSource для каждого ожидающего
- Механизм anti-starvation (например, временное повышение приоритета)
*/
```

# Task 2

```csharp
public static class FileProcessingExtensions
{
    public static async Task<string[]> ProcessFilesAsync(
        this IFileProcessor processor,
        string[] inputPaths,
        string[] outputPaths,
        int maxConcurrency)
    {
        if (inputPaths.Length != outputPaths.Length)
            throw new ArgumentException("Input and output paths arrays must have the same length");

        var semaphore = new SemaphoreSlim(maxConcurrency, maxConcurrency);
        var successfulPaths = new List<string>();
        var lockObject = new object();

        // Создаем задачи для каждого файла
        var tasks = inputPaths.Select(async (inputPath, index) =>
        {
            await semaphore.WaitAsync();
            try
            {
                // Pipeline: Read → Transform → Write
                var content = await processor.ReadFileAsync(inputPath);
                var transformedContent = await processor.TransformAsync(content);
                await processor.WriteFileAsync(outputPaths[index], transformedContent);

                // Добавляем успешно обработанный путь
                lock (lockObject)
                {
                    successfulPaths.Add(outputPaths[index]);
                }
            }
            catch (Exception ex)
            {
                // Логируем ошибку или обрабатываем по необходимости
                // В данном случае просто пропускаем файл
                Console.WriteLine($"Failed to process {inputPath}: {ex.Message}");
            }
            finally
            {
                semaphore.Release();
            }
        });

        // Ждем завершения всех задач
        await Task.WhenAll(tasks);

        return successfulPaths.ToArray();
    }
}

// Альтернативная реализация с сохранением порядка
public static class FileProcessingExtensionsV2
{
    public static async Task<string[]> ProcessFilesAsync(
        this IFileProcessor processor,
        string[] inputPaths,
        string[] outputPaths,
        int maxConcurrency)
    {
        if (inputPaths.Length != outputPaths.Length)
            throw new ArgumentException("Input and output paths arrays must have the same length");

        var semaphore = new SemaphoreSlim(maxConcurrency, maxConcurrency);
        var results = new bool[inputPaths.Length];

        // Создаем задачи для каждого файла с индексом
        var tasks = inputPaths.Select(async (inputPath, index) =>
        {
            await semaphore.WaitAsync();
            try
            {
                // Pipeline: Read → Transform → Write
                var content = await processor.ReadFileAsync(inputPath);
                var transformedContent = await processor.TransformAsync(content);
                await processor.WriteFileAsync(outputPaths[index], transformedContent);

                results[index] = true; // Помечаем как успешный
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to process {inputPath}: {ex.Message}");
                results[index] = false; // Помечаем как неуспешный
            }
            finally
            {
                semaphore.Release();
            }
        });

        // Ждем завершения всех задач
        await Task.WhenAll(tasks);

        // Возвращаем только успешно обработанные пути в исходном порядке
        return outputPaths
            .Where((path, index) => results[index])
            .ToArray();
    }
}
```