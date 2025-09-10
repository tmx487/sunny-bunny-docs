![[Pasted image 20250808153719.png]]

```cs
using Microsoft.AspNetCore.Mvc;
using System.Collections.Concurrent;
using System.Text.Json;

// Модели данных
public record TemperatureData(DateTime Timestamp, double Temperature, string Source);

public record YearlyTemperatureResponse(
    int Year,
    double TempAvg,
    List<MonthlyTemperature> Months
);

public record MonthlyTemperature(
    int Month,
    double TempAvg,
    List<double> Temps
);

public record PaginatedResponse<T>(
    List<T> Data,
    PaginationInfo Pagination
);

public record PaginationInfo(
    int CurrentPage,
    int PageSize,
    int TotalCount,
    int TotalPages,
    bool HasNext,
    bool HasPrevious
);

public record SwitchSupplierRequest(string? Supplier);

public record SupplierResponse(
    string CurrentSupplier,
    DateTime LastSwitchTime,
    string Message
);

// Сервис для работы с данными
public interface ITemperatureService
{
    Task AddTemperatureAsync(TemperatureData data, CancellationToken cancellationToken = default);
    Task<List<TemperatureData>> GetTemperaturesAsync(DateTime? date = null, CancellationToken cancellationToken = default);
    Task<YearlyTemperatureResponse> GetYearlyAggregatedDataAsync(int year, CancellationToken cancellationToken = default);
}

public class TemperatureService : ITemperatureService
{
    private readonly ConcurrentBag<TemperatureData> _temperatureData = new();
    private readonly ILogger<TemperatureService> _logger;

    public TemperatureService(ILogger<TemperatureService> logger)
    {
        _logger = logger;
        SeedTestData();
    }

    private void SeedTestData()
    {
        var random = new Random();
        var baseDate = new DateTime(2025, 1, 1);

        for (int month = 1; month <= 12; month++)
        {
            for (int day = 1; day <= DateTime.DaysInMonth(2025, month); day++)
            {
                var date = new DateTime(2025, month, day);
                
                // Данные от поставщика A
                _temperatureData.Add(new TemperatureData(
                    date.AddHours(random.Next(0, 12)),
                    Math.Round(random.NextDouble() * 30 - 10, 1),
                    "A"
                ));
                
                // Данные от поставщика B
                _temperatureData.Add(new TemperatureData(
                    date.AddHours(random.Next(12, 24)),
                    Math.Round(random.NextDouble() * 30 - 10, 1),
                    "B"
                ));
            }
        }
    }

    public async Task AddTemperatureAsync(TemperatureData data, CancellationToken cancellationToken = default)
    {
        // Проверяем отмену операции
        cancellationToken.ThrowIfCancellationRequested();
        
        // Симулируем асинхронную операцию (например, запись в БД)
        await Task.Delay(10, cancellationToken);
        
        _temperatureData.Add(data);
        _logger.LogInformation("Added temperature data: {Temperature}°C from source {Source} at {Timestamp}",
            data.Temperature, data.Source, data.Timestamp);
    }

    public async Task<List<TemperatureData>> GetTemperaturesAsync(DateTime? date = null, CancellationToken cancellationToken = default)
    {
        // Проверяем отмену операции
        cancellationToken.ThrowIfCancellationRequested();
        
        // Симулируем асинхронную операцию (например, чтение из БД)
        await Task.Delay(50, cancellationToken);
        
        var result = _temperatureData.AsEnumerable();

        if (date.HasValue)
        {
            result = result.Where(t => t.Timestamp.Date == date.Value.Date);
        }

        return result.OrderBy(t => t.Timestamp).ToList();
    }

    public async Task<YearlyTemperatureResponse> GetYearlyAggregatedDataAsync(int year, CancellationToken cancellationToken = default)
    {
        // Проверяем отмену операции
        cancellationToken.ThrowIfCancellationRequested();
        
        // Симулируем асинхронную операцию (например, сложные вычисления)
        await Task.Delay(100, cancellationToken);
        
        var yearData = _temperatureData
            .Where(t => t.Timestamp.Year == year)
            .ToList();

        if (!yearData.Any())
        {
            return new YearlyTemperatureResponse(year, 0, new List<MonthlyTemperature>());
        }

        // Проверяем отмену перед тяжелыми вычислениями
        cancellationToken.ThrowIfCancellationRequested();

        var monthlyData = yearData
            .GroupBy(t => t.Timestamp.Month)
            .Select(g => new MonthlyTemperature(
                g.Key,
                Math.Round(g.Average(t => t.Temperature), 1),
                g.Select(t => Math.Round(t.Temperature, 1)).OrderBy(t => t).ToList()
            ))
            .OrderBy(m => m.Month)
            .ToList();

        var response = new YearlyTemperatureResponse(
            year,
            Math.Round(yearData.Average(t => t.Temperature), 1),
            monthlyData
        );

        return response;
    }
}

// Сервис для управления поставщиками
public class SupplierService
{
    private string _currentSupplier = "A";
    private DateTime _lastSwitchTime = DateTime.UtcNow;
    private readonly ITemperatureService _temperatureService;
    private readonly ILogger<SupplierService> _logger;

    public SupplierService(ITemperatureService temperatureService, ILogger<SupplierService> logger)
    {
        _temperatureService = temperatureService;
        _logger = logger;
    }

    public SupplierResponse GetCurrentSupplier() => 
        new(_currentSupplier, _lastSwitchTime, $"Currently receiving data from supplier {_currentSupplier}");

    public async Task<object> SwitchSupplierAsync(string? newSupplier = null, CancellationToken cancellationToken = default)
    {
        // Проверяем отмену операции
        cancellationToken.ThrowIfCancellationRequested();
        
        newSupplier ??= _currentSupplier == "A" ? "B" : "A";

        if (newSupplier != "A" && newSupplier != "B")
        {
            throw new ArgumentException("Supplier must be 'A' or 'B'");
        }

        var previousSupplier = _currentSupplier;
        _currentSupplier = newSupplier;
        _lastSwitchTime = DateTime.UtcNow;

        // Симулируем получение данных от нового поставщика
        var random = new Random();
        var newTemperatureData = new TemperatureData(
            DateTime.UtcNow,
            Math.Round(random.NextDouble() * 30 - 10, 1),
            _currentSupplier
        );

        await _temperatureService.AddTemperatureAsync(newTemperatureData, cancellationToken);

        _logger.LogInformation("Switched from supplier {PreviousSupplier} to supplier {CurrentSupplier}",
            previousSupplier, _currentSupplier);

        return new
        {
            Message = $"Successfully switched from supplier {previousSupplier} to supplier {_currentSupplier}",
            PreviousSupplier = previousSupplier,
            CurrentSupplier = _currentSupplier,
            SwitchTime = _lastSwitchTime,
            NewDataReceived = newTemperatureData
        };
    }
}

var builder = WebApplication.CreateBuilder(args);

// Добавляем сервисы
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSingleton<ITemperatureService, TemperatureService>();
builder.Services.AddSingleton<SupplierService>();

// Настраиваем CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Настраиваем pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseHttpsRedirection();

// Задание 1: Получить данные от поставщика B (аналогично ApiClientA)
app.MapGet("/api/temperatures", async (
    ITemperatureService temperatureService, 
    ILogger<Program> logger,
    CancellationToken cancellationToken,
    DateTime? date = null) =>
{
    try
    {
        var temperatures = await temperatureService.GetTemperaturesAsync(date, cancellationToken);
        logger.LogInformation("Retrieved {Count} temperature records", temperatures.Count);
        return Results.Ok(temperatures);
    }
    catch (OperationCanceledException)
    {
        logger.LogInformation("Temperature retrieval was cancelled");
        return Results.Problem("Request was cancelled", statusCode: 499);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Error retrieving temperatures");
        return Results.Problem("Internal server error", statusCode: 500);
    }
})
.WithName("GetTemperatures")
.WithTags("Temperatures")
.WithSummary("Получить температурные данные")
.WithDescription("Получает все температурные данные или данные за определенную дату");

// Задание 2: Добавить пагинацию и фильтрацию по дате без времени
app.MapGet("/api/temperatures/paginated", async (
    ITemperatureService temperatureService,
    ILogger<Program> logger,
    CancellationToken cancellationToken,
    DateTime? date = null,
    int page = 1,
    int pageSize = 10) =>
{
    try
    {
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 100) pageSize = 10;

        var allTemperatures = await temperatureService.GetTemperaturesAsync(date, cancellationToken);
        var totalCount = allTemperatures.Count;
        var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

        var pagedTemperatures = allTemperatures
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        var result = new PaginatedResponse<TemperatureData>(
            pagedTemperatures,
            new PaginationInfo(page, pageSize, totalCount, totalPages, page < totalPages, page > 1)
        );

        return Results.Ok(result);
    }
    catch (OperationCanceledException)
    {
        logger.LogInformation("Paginated temperature retrieval was cancelled");
        return Results.Problem("Request was cancelled", statusCode: 499);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Error retrieving paginated temperatures");
        return Results.Problem("Internal server error", statusCode: 500);
    }
})
.WithName("GetTemperaturesPaginated")
.WithTags("Temperatures")
.WithSummary("Получить температурные данные с пагинацией")
.WithDescription("Получает температурные данные с поддержкой пагинации и фильтрации по дате");

// Задание 3: Получить агрегированные данные по году и месяцам
app.MapGet("/api/temperatures/aggregated/{year:int}", async (
    int year,
    ITemperatureService temperatureService,
    ILogger<Program> logger,
    CancellationToken cancellationToken) =>
{
    try
    {
        if (year < 1900 || year > DateTime.Now.Year + 10)
        {
            return Results.BadRequest("Invalid year provided");
        }

        var result = await temperatureService.GetYearlyAggregatedDataAsync(year, cancellationToken);
        logger.LogInformation("Retrieved aggregated data for year {Year}", year);
        return Results.Ok(result);
    }
    catch (OperationCanceledException)
    {
        logger.LogInformation("Aggregated data retrieval for year {Year} was cancelled", year);
        return Results.Problem("Request was cancelled", statusCode: 499);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Error retrieving aggregated data for year {Year}", year);
        return Results.Problem("Internal server error", statusCode: 500);
    }
})
.WithName("GetAggregatedTemperatures")
.WithTags("Temperatures")
.WithSummary("Получить агрегированные данные по году")
.WithDescription("Возвращает средние температуры по году и месяцам с детализацией");

// Добавить новые температурные данные
app.MapPost("/api/temperatures", async (
    TemperatureData temperatureData,
    ITemperatureService temperatureService,
    ILogger<Program> logger,
    CancellationToken cancellationToken) =>
{
    try
    {
        if (string.IsNullOrWhiteSpace(temperatureData.Source))
        {
            temperatureData = temperatureData with { Source = "Unknown" };
        }

        if (temperatureData.Timestamp == default)
        {
            temperatureData = temperatureData with { Timestamp = DateTime.UtcNow };
        }

        await temperatureService.AddTemperatureAsync(temperatureData, cancellationToken);
        return Results.Created($"/api/temperatures", temperatureData);
    }
    catch (OperationCanceledException)
    {
        logger.LogInformation("Temperature addition was cancelled");
        return Results.Problem("Request was cancelled", statusCode: 499);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Error adding temperature data");
        return Results.Problem("Internal server error", statusCode: 500);
    }
})
.WithName("AddTemperature")
.WithTags("Temperatures")
.WithSummary("Добавить температурные данные")
.WithDescription("Добавляет новые температурные данные в систему");

// Задание 4: Получить текущего поставщика
app.MapGet("/api/supplier/current", (SupplierService supplierService) =>
{
    var result = supplierService.GetCurrentSupplier();
    return Results.Ok(result);
})
.WithName("GetCurrentSupplier")
.WithTags("Supplier")
.WithSummary("Получить текущего поставщика")
.WithDescription("Возвращает информацию о текущем активном поставщике данных");

// Задание 4: Переключить поставщика
app.MapPost("/api/supplier/switch", async (
    SwitchSupplierRequest request,
    SupplierService supplierService,
    ILogger<Program> logger,
    CancellationToken cancellationToken) =>
{
    try
    {
        var result = await supplierService.SwitchSupplierAsync(request.Supplier, cancellationToken);
        return Results.Ok(result);
    }
    catch (OperationCanceledException)
    {
        logger.LogInformation("Supplier switch was cancelled");
        return Results.Problem("Request was cancelled", statusCode: 499);
    }
    catch (ArgumentException ex)
    {
        logger.LogWarning(ex, "Invalid supplier provided");
        return Results.BadRequest(ex.Message);
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Error switching supplier");
        return Results.Problem("Internal server error", statusCode: 500);
    }
})
.WithName("SwitchSupplier")
.WithTags("Supplier")
.WithSummary("Переключить поставщика")
.WithDescription("Переключает активного поставщика данных между A и B");

// Информация о запуске
app.Lifetime.ApplicationStarted.Register(() =>
{
    var logger = app.Services.GetRequiredService<ILogger<Program>>();
    logger.LogInformation("Temperature Minimal API Service started successfully!");
    logger.LogInformation("Available endpoints:");
    logger.LogInformation("  GET /api/temperatures - Get all temperatures (with optional date filter)");
    logger.LogInformation("  GET /api/temperatures/paginated - Get temperatures with pagination");
    logger.LogInformation("  GET /api/temperatures/aggregated/{{year}} - Get yearly aggregated data");
    logger.LogInformation("  POST /api/temperatures - Add new temperature data");
    logger.LogInformation("  GET /api/supplier/current - Get current supplier");
    logger.LogInformation("  POST /api/supplier/switch - Switch supplier");
    logger.LogInformation("  Swagger UI available at: /swagger");
});

app.Run();
```