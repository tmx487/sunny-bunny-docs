Предварительно нужно установить

```bash
dotnet add package StackExchange.Redis
```

Вот пример структуры слоев:

```markdown
- MyProject
  - Application
    - Interfaces
      - ITokenService.cs
    - Services
      - TokenService.cs (можно также создать отдельный проект для сервисов)
  - Infrastructure
    - Redis
      - RedisTokenService.cs (реализация ITokenService)
  - Presentation (или Web)
    - Controllers
      - AuthController.cs
```


Чтобы адаптировать код для работы с Redis в контексте Clean Architecture, следует разделить логику на слои и использовать интерфейсы для зависимости. Вот как это можно сделать:

1. **Создание интерфейса для управления токенами**: Создайте интерфейс в проекте, который отвечает за работу с revoked токенами.
    
    ```csharp
    public interface ITokenService
    {
        Task RevokeTokenAsync(string token);
        Task<bool> IsTokenRevokedAsync(string token);
    }
    ```
    
2. **Реализация интерфейса**: Создайте класс, реализующий интерфейс `ITokenService`, который будет взаимодействовать с Redis.
    
    ```csharp
    public class TokenService : ITokenService
    {
        private readonly IDistributedCache _cache;
    
        public TokenService(IDistributedCache cache)
        {
            _cache = cache;
        }
    
        public async Task RevokeTokenAsync(string token)
        {
            await _cache.SetStringAsync($"revoked_token:{token}", "revoked", 
                new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(30)
                });
        }
    
        public async Task<bool> IsTokenRevokedAsync(string token)
        {
            var revokedToken = await _cache.GetStringAsync($"revoked_token:{token}");
            return revokedToken != null;
        }
    }
    ```
    
3. **Изменение контроллера для использования сервиса**: Внедрите `ITokenService` в ваш контроллер и используйте его для отзыва токенов.
    
    ```csharp
    public class AuthController : ControllerBase
    {
        private readonly ITokenService _tokenService;
    
        public AuthController(ITokenService tokenService)
        {
            _tokenService = tokenService;
        }
    
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var accessToken = HttpContext.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
    
            // Отзываем токен
            await _tokenService.RevokeTokenAsync(accessToken);
    
            return Ok();
        }
    }
    ```
    
4. **Изменение middleware для использования сервиса**: Создайте middleware, который будет использовать `ITokenService` для проверки токенов.
    
    ```csharp
    public class TokenValidationMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IServiceScopeFactory _serviceScopeFactory;

    public TokenValidationMiddleware(RequestDelegate next, IServiceScopeFactory serviceScopeFactory)
    {
        _next = next;
        _serviceScopeFactory = serviceScopeFactory;
    }

    public async Task Invoke(HttpContext context)
    {
        using (var scope = _serviceScopeFactory.CreateScope())
        {
            var tokenService = scope.ServiceProvider.GetRequiredService<ITokenService>();

            var accessToken = context.Request.Headers["Authorization"].ToString().Replace("Bearer ", "");

            if (!string.IsNullOrEmpty(accessToken) && await tokenService.IsTokenRevokedAsync(accessToken))
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await context.Response.WriteAsync("Token is revoked.");
                return;
            }
        }

        await _next(context);
    }
}

    ```
    
5. **Регистрация зависимостей**: В файле `Startup.cs` или в классе `Program.cs` добавьте регистрацию сервиса.
    
    ```csharp
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddStackExchangeRedisCache(options =>
        {
            options.Configuration = "localhost:6379"; // Укажите ваш Redis сервер
        });
    
        services.AddScoped<ITokenService, TokenService>();
        services.AddControllers();
    }
    ```
    
6. **Регистрация middleware**: В `Startup.cs` добавьте регистрацию middleware.

    ```csharp
    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        app.UseMiddleware<TokenValidationMiddleware>();
    
        // Другие middleware
        app.UseAuthentication();
        app.UseAuthorization();
        app.UseEndpoints(endpoints => { endpoints.MapControllers(); });
    }
    ```
