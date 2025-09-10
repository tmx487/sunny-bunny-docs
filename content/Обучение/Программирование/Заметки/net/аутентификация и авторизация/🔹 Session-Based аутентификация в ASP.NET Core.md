В отличие от JWT, где клиент хранит токен и отправляет его в заголовках, при session-based аутентификации сервер хранит информацию о сессии в базе (например, Redis), а клиенту отдает только идентификатор сессии (session ID) в куки.

---

## 📌 Как это реализовать в ASP.NET Core?

### 🔸 1. **Добавляем поддержку сессий в `Program.cs`**

```csharp
builder.Services.AddDistributedMemoryCache(); // Используем in-memory (можно Redis)
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30); // Время жизни сессии
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});
builder.Services.AddAuthentication("Cookies")
    .AddCookie(options =>
    {
        options.LoginPath = "/Account/Login"; 
        options.LogoutPath = "/Account/Logout";
        options.AccessDeniedPath = "/Account/AccessDenied";
    });
```

🔹 Можно заменить **In-Memory Cache** на **Redis**:

```csharp
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = "localhost:6379"; // Адрес Redis
});
```

---

### 🔸 2. **Создаем контроллер для логина**

```csharp
[Route("account")]
public class AccountController : Controller
{
    private readonly IUserService _userService; // Сервис работы с пользователями

    public AccountController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginModel model)
    {
        var user = await _userService.ValidateUserAsync(model.Username, model.Password);
        if (user == null)
        {
            return Unauthorized("Неверные учетные данные");
        }

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Role, user.Role)
        };

        var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        var authProperties = new AuthenticationProperties
        {
            IsPersistent = true
        };

        await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, 
                                      new ClaimsPrincipal(claimsIdentity), 
                                      authProperties);

        return Ok("Вы успешно вошли!");
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return Ok("Вы успешно вышли!");
    }
}
```

🔹 **Что здесь происходит?**

- Проверяем учетные данные пользователя.
- Создаем **ClaimsIdentity** (список данных о пользователе).
- **Сохраняем сессию на сервере** и отправляем клиенту `Set-Cookie`.
- При `logout` удаляем сессию.

---

### 🔸 3. **Добавляем Middleware в `Program.cs`**

```csharp
var app = builder.Build();
app.UseSession();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
```

**Важно!** Сессия должна быть **до аутентификации** (`UseSession()` перед `UseAuthentication()`).

---

### 🔸 4. **Доступ к данным пользователя в API**

Чтобы получить текущего пользователя:

```csharp
var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
```

---

## 🔹 Использование Redis для хранения сессий

Если приложение распределенное (несколько серверов), **In-Memory Cache не подойдет** → **нужно хранить сессии в Redis**.

### 🔸 1. **Добавляем Redis в `Program.cs`**

```csharp
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = "localhost:6379"; // Адрес Redis
});
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});
```

### 🔸 2. **Настроим хранилище сессий в Redis**

```csharp
builder.Services.AddDistributedRedisCache(options =>
{
    options.Configuration = "localhost:6379";
    options.InstanceName = "MySession:";
});
```

Теперь сессии пользователей будут храниться в Redis, и даже если сервер перезапустится, пользователи останутся залогинены.

---

## 🔹 Итог

🔹 **Как это работает?**

1. При логине сервер **создает сессию** в Redis и отдает клиенту **идентификатор**.
2. Клиент отправляет этот `session_id` (в куки).
3. Сервер валидирует `session_id` в Redis.
4. Если администратор **удалит сессию из Redis**, пользователь выйдет из системы.

💡 **Когда использовать session-based аутентификацию?**

- Когда нужна возможность **мгновенного отзыва доступа** (удаляем сессию из Redis).
- Когда **не хотим хранить токены на клиенте**.
- Когда **JWT избыточен** и хватит обычных куки.

Если у тебя **SPA (React/Vue/Angular)** → session-based аутентификация сложнее (нужны `SameSite=None, Secure` куки).  
Если у тебя **MVC/Blazor** → session-based аутентификация будет проще.

Ты планируешь использовать это для всего приложения или только для админов? 😊