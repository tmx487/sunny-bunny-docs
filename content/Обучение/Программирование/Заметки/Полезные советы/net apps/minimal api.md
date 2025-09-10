В C# для Minimal API есть несколько проверенных подходов для организации кода в продакшене:

## Размещение методов

**Для небольших проектов** - можно размещать прямо в Program.cs:

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/users", async (IUserService userService) => 
{
    return await userService.GetAllUsersAsync();
});

app.Run();
```

**Для продакшн-проектов** лучше выносить в отдельные классы через extension methods:

```csharp
// UserEndpoints.cs
public static class UserEndpoints
{
    public static void MapUserEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/users")
            .WithTags("Users")
            .WithOpenApi();

        group.MapGet("/", GetAllUsers);
        group.MapGet("/{id}", GetUserById);
        group.MapPost("/", CreateUser);
        group.MapPut("/{id}", UpdateUser);
        group.MapDelete("/{id}", DeleteUser);
    }

    private static async Task<IResult> GetAllUsers(IUserService userService)
    {
        var users = await userService.GetAllUsersAsync();
        return Results.Ok(users);
    }

    private static async Task<IResult> GetUserById(int id, IUserService userService)
    {
        var user = await userService.GetUserByIdAsync(id);
        return user is not null ? Results.Ok(user) : Results.NotFound();
    }

    private static async Task<IResult> CreateUser(
        [FromBody] CreateUserRequest request, 
        IUserService userService)
    {
        var user = await userService.CreateUserAsync(request);
        return Results.Created($"/api/users/{user.Id}", user);
    }
}
```

## Передача параметров

**Из URL (route parameters):**

```csharp
app.MapGet("/users/{id:int}", (int id) => $"User ID: {id}");
```

**Из query string:**

```csharp
app.MapGet("/users", (int page = 1, int size = 10) => 
    $"Page: {page}, Size: {size}");
```

**Из body (JSON):**

```csharp
app.MapPost("/users", ([FromBody] CreateUserRequest request) => 
{
    // обработка
});
```

**Из headers:**

```csharp
app.MapGet("/users", ([FromHeader(Name = "X-User-Id")] string userId) => 
{
    // обработка
});
```

**Dependency Injection автоматически:**

```csharp
app.MapGet("/users", (IUserService userService, ILogger<Program> logger) => 
{
    // сервисы инжектятся автоматически
});
```

## Важные атрибуты для продакшна

**Валидация:**

```csharp
public record CreateUserRequest(
    [Required] string Name,
    [EmailAddress] string Email,
    [Range(18, 120)] int Age
);

app.MapPost("/users", async ([FromBody] CreateUserRequest request, 
    IValidator<CreateUserRequest> validator) =>
{
    var validationResult = await validator.ValidateAsync(request);
    if (!validationResult.IsValid)
    {
        return Results.ValidationProblem(validationResult.ToDictionary());
    }
    // обработка
});
```

**OpenAPI/Swagger аннотации:**

```csharp
app.MapGet("/users/{id}", GetUserById)
    .WithName("GetUser")
    .WithSummary("Get user by ID")
    .WithDescription("Returns a user by their unique identifier")
    .Produces<User>(StatusCodes.Status200OK)
    .Produces(StatusCodes.Status404NotFound)
    .WithOpenApi();
```

**Авторизация:**

```csharp
app.MapGet("/admin/users", () => "Admin data")
    .RequireAuthorization("AdminPolicy");

app.MapPost("/users", CreateUser)
    .RequireAuthorization()
    .AllowAnonymous(); // для переопределения глобальной авторизации
```

## Организация для продакшна

**Program.cs:**

```csharp
var builder = WebApplication.CreateBuilder(args);

// Сервисы
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<Program>();

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

// Endpoints
app.MapUserEndpoints();
app.MapProductEndpoints();

app.Run();
```

**Группировка endpoints:**

```csharp
public static class EndpointExtensions
{
    public static void MapApiEndpoints(this WebApplication app)
    {
        var apiGroup = app.MapGroup("/api")
            .WithOpenApi()
            .RequireAuthorization();

        apiGroup.MapGroup("/users").MapUserEndpoints();
        apiGroup.MapGroup("/products").MapProductEndpoints();
    }
}
```

**Обработка ошибок:**

```csharp
app.UseExceptionHandler(exceptionHandlerApp =>
{
    exceptionHandlerApp.Run(async context =>
    {
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/json";
        
        var response = new { error = "An error occurred" };
        await context.Response.WriteAsync(JsonSerializer.Serialize(response));
    });
});
```

**Filters для кросс-каттинг concerns:**

```csharp
app.MapPost("/users", CreateUser)
    .AddEndpointFilter<ValidationFilter<CreateUserRequest>>()
    .AddEndpointFilter<LoggingFilter>();
```

Такой подход обеспечивает хорошую организацию кода, тестируемость и поддерживаемость в продакшене.

# query параметры в endpoint

Для добавления query параметров в ваш endpoint есть несколько способов:

## 1. Простые query параметры

```csharp
group.MapGet("/", (string? fileName, int? page, int pageSize = 10) => ReadFile(fileName, page, pageSize))
    .Produces(StatusCodes.Status200OK)
    .Produces(StatusCodes.Status400BadRequest);
```

## 2. Через отдельный метод с параметрами

```csharp
group.MapGet("/", ReadFile)
    .Produces(StatusCodes.Status200OK)
    .Produces(StatusCodes.Status400BadRequest);

private static async Task<IResult> ReadFile(
    string? fileName, 
    int page = 1, 
    int pageSize = 10,
    string? format = "json")
{
    if (string.IsNullOrEmpty(fileName))
        return Results.BadRequest("fileName is required");
    
    // логика чтения файла
    return Results.Ok(result);
}
```

## 3. Через DTO для сложных query параметров (prod+)

```csharp
public record ReadFileQuery(
    string? FileName,
    int Page = 1,
    int PageSize = 10,
    string Format = "json",
    DateTime? FromDate = null,
    DateTime? ToDate = null
);

group.MapGet("/", ([AsParameters] ReadFileQuery query) => ReadFile(query))
    .Produces(StatusCodes.Status200OK)
    .Produces(StatusCodes.Status400BadRequest);

private static async Task<IResult> ReadFile(ReadFileQuery query)
{
    if (string.IsNullOrEmpty(query.FileName))
        return Results.BadRequest("fileName is required");
    
    // логика с использованием query.Page, query.PageSize и т.д.
    return Results.Ok(result);
}
```

## 4. С валидацией query параметров (prod+)


```csharp
public record ReadFileQuery(
    [Required] string FileName,
    [Range(1, int.MaxValue)] int Page = 1,
    [Range(1, 100)] int PageSize = 10,
    [RegularExpression("^(json|xml|csv)$")] string Format = "json"
);

group.MapGet("/", async ([AsParameters] ReadFileQuery query, IValidator<ReadFileQuery> validator) =>
{
    var validationResult = await validator.ValidateAsync(query);
    if (!validationResult.IsValid)
    {
        return Results.ValidationProblem(validationResult.ToDictionary());
    }
    
    return await ReadFile(query);
})
.Produces(StatusCodes.Status200OK)
.Produces(StatusCodes.Status400BadRequest)
.ProducesValidationProblem();
```

## 5. С OpenAPI документацией

```csharp
group.MapGet("/", ReadFile)
    .WithSummary("Read file content")
    .WithDescription("Reads file content with pagination support")
    .Produces(StatusCodes.Status200OK)
    .Produces(StatusCodes.Status400BadRequest)
    .WithOpenApi(operation =>
    {
        operation.Parameters.Add(new OpenApiParameter
        {
            Name = "fileName",
            In = ParameterLocation.Query,
            Required = true,
            Schema = new OpenApiSchema { Type = "string" }
        });
        operation.Parameters.Add(new OpenApiParameter
        {
            Name = "page",
            In = ParameterLocation.Query,
            Required = false,
            Schema = new OpenApiSchema { Type = "integer", Default = new OpenApiInteger(1) }
        });
        return operation;
    });
```

## 6. Использование в URL

После настройки endpoint будет доступен так:

```
GET /api/files?fileName=test.txt&page=1&pageSize=20&format=json
```

## Рекомендации для продакшна:

1. **Используйте `[AsParameters]`** для сложных query объектов
2. **Добавляйте валидацию** через FluentValidation или атрибуты
3. **Указывайте значения по умолчанию** для опциональных параметров
4. **Документируйте параметры** через OpenAPI
5. **Ограничивайте размер pageSize** для защиты от DoS

Самый чистый подход для продакшна - это вариант с DTO и валидацией (#3-4).

# query and service's injection

Ваш код уже правильно использует dependency injection! В Minimal API сервисы автоматически инжектируются через параметры метода. Вот несколько способов улучшить ваш подход:

## 1. Ваш текущий код уже корректен

```csharp
private static async Task<IResult> ReadFile(ICsvFileReader csvFileReader)
{
    try
    {
        var result = await csvFileReader.ReadByBatch("financial_records.csv");
        return result is not null ? Results.Ok(result) : Results.BadRequest();
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.ToString(), statusCode: 500);
    }
}
```

## 2. Добавление логирования

```csharp
private static async Task<IResult> ReadFile(
    int? pa, 
    ICsvFileReader csvFileReader,
    ILogger<Program> logger)
{
    try
    {
        logger.LogInformation("Reading file with parameter: {Parameter}", pa);
        
        var result = await csvFileReader.ReadByBatch("financial_records.csv");
        return result is not null ? Results.Ok(result) : Results.BadRequest();
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Error reading file");
        return Results.Problem(detail: ex.Message, statusCode: 500);
    }
}
```

## 3. Несколько сервисов одновременно

```csharp
private static async Task<IResult> ReadFile(
    int? pa,
    ICsvFileReader csvFileReader,
    IFileValidator validator,
    ILogger<Program> logger,
    CancellationToken cancellationToken)
{
    try
    {
        logger.LogInformation("Reading file with parameter: {Parameter}", pa);
        
        // Валидация
        var isValid = await validator.ValidateFileAsync("financial_records.csv", cancellationToken);
        if (!isValid)
        {
            return Results.BadRequest("Invalid file format");
        }
        
        var result = await csvFileReader.ReadByBatch("financial_records.csv");
        return result is not null ? Results.Ok(result) : Results.BadRequest();
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Error reading file");
        return Results.Problem(detail: ex.Message, statusCode: 500);
    }
}
```

## 4. Смешивание с query параметрами

```csharp
private static async Task<IResult> ReadFile(
    [AsParameters] ReadFileQuery query,  // query параметры
    ICsvFileReader csvFileReader,        // injected service
    ILogger<Program> logger)             // injected service
{
    try
    {
        logger.LogInformation("Reading file {FileName} with page {Page}", 
            query.FileName, query.Page);
        
        var result = await csvFileReader.ReadByBatch(query.FileName, query.Page);
        return result is not null ? Results.Ok(result) : Results.BadRequest();
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Error reading file {FileName}", query.FileName);
        return Results.Problem(detail: ex.Message, statusCode: 500);
    }
}
```

## 5. Регистрация сервисов в Program.cs

```csharp
var builder = WebApplication.CreateBuilder(args);

// Регистрация ваших сервисов
builder.Services.AddScoped<ICsvFileReader, CsvFileReader>();
builder.Services.AddScoped<IFileValidator, FileValidator>();

// Другие стандартные сервисы
builder.Services.AddLogging();
builder.Services.AddHttpClient();

var app = builder.Build();

// Ваши endpoints
app.MapGet("/files", ReadFile);
```

## 6. Использование HttpContext если нужно

```csharp
private static async Task<IResult> ReadFile(
    HttpContext context,
    ICsvFileReader csvFileReader,
    ILogger<Program> logger)
{
    var userAgent = context.Request.Headers.UserAgent.ToString();
    var userId = context.User.FindFirst("user_id")?.Value;
    
    logger.LogInformation("User {UserId} reading file", userId);
    
    // остальная логика
}
```

## 7. Обработка ошибок можно улучшить

```csharp
private static async Task<IResult> ReadFile(
    int? pa, 
    ICsvFileReader csvFileReader,
    ILogger<Program> logger)
{
    try
    {
        var result = await csvFileReader.ReadByBatch("financial_records.csv");
        return result is not null ? Results.Ok(result) : Results.NotFound("File not found");
    }
    catch (FileNotFoundException)
    {
        logger.LogWarning("File not found: financial_records.csv");
        return Results.NotFound("File not found");
    }
    catch (UnauthorizedAccessException)
    {
        logger.LogWarning("Access denied to file");
        return Results.Forbid();
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Unexpected error reading file");
        return Results.Problem("An error occurred while reading the file", statusCode: 500);
    }
}
```

## Важные моменты для продакшна:

1. **Не выводите полный stack trace** в production (используйте `ex.Message` вместо `ex.ToString()`)
2. **Всегда логируйте ошибки** для мониторинга
3. **Используйте CancellationToken** для длительных операций
4. **Порядок параметров не важен** - DI автоматически найдет нужные сервисы
5. **Можно смешивать** route параметры, query параметры и injected сервисы в любом порядке

Ваш подход с DI уже правильный, просто добавьте логирование и улучшите обработку ошибок!

# \[AsParameters]


Когда вы используете `[AsParameters]` для query параметров и DI для сервисов, роут прописывается точно так же:

## Простой вариант

```csharp
group.MapGet("/", ReadFile)
    .Produces(StatusCodes.Status200OK)
    .Produces(StatusCodes.Status400BadRequest);
```

## Полный пример

```csharp
// Модель для query параметров
public record ReadFileQuery(
    string? FileName,
    int Page = 1,
    int PageSize = 10
);

// Endpoint класс
public static class FileEndpoints
{
    public static void MapFileEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/files")
            .WithTags("Files")
            .WithOpenApi();

        group.MapGet("/", ReadFile)
            .WithSummary("Read file content")
            .WithDescription("Reads CSV file with pagination")
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status404NotFound);
    }

    private static async Task<IResult> ReadFile(
        [AsParameters] ReadFileQuery query,  // query параметры
        ICsvFileReader csvFileReader,        // injected service
        ILogger<Program> logger)             // injected service
    {
        try
        {
            logger.LogInformation("Reading file {FileName} with page {Page}", 
                query.FileName, query.Page);
            
            if (string.IsNullOrEmpty(query.FileName))
            {
                return Results.BadRequest("FileName is required");
            }
            
            var result = await csvFileReader.ReadByBatch(query.FileName, query.Page, query.PageSize);
            return result is not null ? Results.Ok(result) : Results.NotFound();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error reading file {FileName}", query.FileName);
            return Results.Problem(detail: ex.Message, statusCode: 500);
        }
    }
}
```

## В Program.cs

```csharp
var builder = WebApplication.CreateBuilder(args);

// Регистрация сервисов
builder.Services.AddScoped<ICsvFileReader, CsvFileReader>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Регистрация endpoints
app.MapFileEndpoints();

app.Run();
```

## Использование

Endpoint будет доступен так:

```
GET /api/files?fileName=financial_records.csv&page=1&pageSize=20
```

## Если нужны и route параметры

```csharp
group.MapGet("/{category}", ReadFileByCategory)
    .Produces(StatusCodes.Status200OK)
    .Produces(StatusCodes.Status400BadRequest);

private static async Task<IResult> ReadFileByCategory(
    string category,                     // route parameter
    [AsParameters] ReadFileQuery query,  // query parameters
    ICsvFileReader csvFileReader,        // injected service
    ILogger<Program> logger)             // injected service
{
    logger.LogInformation("Reading {Category} file {FileName}", category, query.FileName);
    
    // логика
}
```

## Альтернативный синтаксис через лямбду

```csharp
group.MapGet("/", async ([AsParameters] ReadFileQuery query, 
                        ICsvFileReader csvFileReader, 
                        ILogger<Program> logger) =>
{
    try
    {
        logger.LogInformation("Reading file {FileName}", query.FileName);
        
        var result = await csvFileReader.ReadByBatch(query.FileName, query.Page, query.PageSize);
        return result is not null ? Results.Ok(result) : Results.NotFound();
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Error reading file");
        return Results.Problem(detail: ex.Message, statusCode: 500);
    }
})
.Produces(StatusCodes.Status200OK)
.Produces(StatusCodes.Status400BadRequest);
```

**Главное**: роут остается таким же простым `group.MapGet("/", ReadFile)`, потому что:

- `[AsParameters]` автоматически парсит query параметры
- DI автоматически инжектирует сервисы
- Minimal API сам разберется что откуда брать