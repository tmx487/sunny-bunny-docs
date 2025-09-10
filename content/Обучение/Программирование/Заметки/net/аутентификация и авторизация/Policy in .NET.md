# Index

- [[#Общее]]
	- [[#📌 **1. Как настроить Policy в .NET**]]
	- [[#📌 **2. Применение политики**]]
	- [[#📌 **3. Создание сложных политик**]]
	- [[#📌 **4. Политики с `IAuthorizationRequirement`**]]
	- [[#🎯 **Вывод**]]
- [[#Как .NET извлекает claims из запроса?]]
	- [[#📌 **Где искать клеймы в коде?**]]
	- [[#📌 **Какой клейм искать?**]]
	- [[#🎯 **Вывод**]]
## Общее

В **ASP.NET Core** политики (**Policy**) используются для **авторизации** и позволяют задавать гибкие правила доступа к ресурсам на основе **клеймов (Claims)**, **ролей (Roles)** или **других условий**.

Политики позволяют сказать:

> «Доступ к этому ресурсу разрешен только, если у пользователя есть нужный клейм или он соответствует определенному условию.»

---

## 📌 **1. Как настроить Policy в .NET**

### **1.1. Регистрация политики в `Program.cs`**

```csharp
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireAdminRole", policy =>
        policy.RequireRole("Admin")); // Политика требует роль "Admin"

    options.AddPolicy("Age18OrOlder", policy =>
        policy.RequireClaim("Age", "18", "19", "20", "21")); // Политика требует клейм "Age" >= 18
});
```

🔹 Здесь мы определяем две политики:

1. **`RequireAdminRole`** – разрешает доступ только пользователям с ролью `"Admin"`.
2. **`Age18OrOlder`** – требует, чтобы в клеймах пользователя было поле `"Age"` с допустимыми значениями.

---

## 📌 **2. Применение политики**

### **2.1. В контроллерах**

Чтобы использовать политику в контроллере, добавляем `[Authorize(Policy = "...")]`:

```csharp
[Authorize(Policy = "RequireAdminRole")]
[HttpGet("admin")]
public IActionResult GetAdminData()
{
    return Ok("This is admin data");
}
```

💡 Только пользователи с ролью **Admin** смогут получить доступ к этому эндпоинту.

---

### **2.2. В минимальном API**

```csharp
app.MapGet("/admin", () => "Admin only data")
    .RequireAuthorization("RequireAdminRole");
```

Здесь политика `"RequireAdminRole"` применяется к `MapGet()`.

---

## 📌 **3. Создание сложных политик**

Политики могут быть сложнее. Например, проверять **возраст на основе числа, а не строк**:

```csharp
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdultOnly", policy =>
        policy.RequireAssertion(context =>
        {
            var ageClaim = context.User.FindFirst("Age");
            if (ageClaim == null) return false;
            return int.TryParse(ageClaim.Value, out var age) && age >= 18;
        }));
});
```

🔹 Здесь:

- Мы ищем клейм `"Age"`, преобразуем в число и проверяем, **больше ли 18**.
- Если нет клейма `"Age"` или он некорректный → доступ запрещен.

---

## 📌 **4. Политики с `IAuthorizationRequirement`**

Для **сложных правил** создаются **кастомные политики**.

### **4.1. Создаем правило авторизации**

```csharp
public class MinimumAgeRequirement : IAuthorizationRequirement
{
    public int MinimumAge { get; }

    public MinimumAgeRequirement(int minimumAge)
    {
        MinimumAge = minimumAge;
    }
}
```

### **4.2. Создаем обработчик**

```csharp
public class MinimumAgeHandler : AuthorizationHandler<MinimumAgeRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context, 
        MinimumAgeRequirement requirement)
    {
        var ageClaim = context.User.FindFirst(c => c.Type == "Age");
        if (ageClaim != null && int.TryParse(ageClaim.Value, out var age) && age >= requirement.MinimumAge)
        {
            context.Succeed(requirement); // Авторизация успешна ✅
        }

        return Task.CompletedTask;
    }
}
```

### **4.3. Регистрируем в `Program.cs`**

```csharp
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("Age21OrOlder", policy =>
        policy.Requirements.Add(new MinimumAgeRequirement(21)));
});

builder.Services.AddSingleton<IAuthorizationHandler, MinimumAgeHandler>();
```

Теперь политика `"Age21OrOlder"` **работает через обработчик**.

### **4.4. Использование**

```csharp
[Authorize(Policy = "Age21OrOlder")]
public IActionResult RestrictedContent()
{
    return Ok("Welcome! You're 21 or older.");
}
```

✅ Теперь доступ разрешен **только если возраст ≥ 21**.

---

## 🎯 **Вывод**

- **Политики (Policy)** позволяют задавать сложные правила авторизации.
- Они могут проверять **роли, клеймы, значения полей** и другие условия.
- Можно использовать **простые политики** (`RequireRole()`, `RequireClaim()`) или **создавать свои обработчики** через `IAuthorizationRequirement`.

Если тебе нужно что-то конкретное по политикам — спрашивай! 🚀

## Как .NET извлекает claims из запроса?

Когда пользователь отправляет **запрос с JWT-токеном**, ASP.NET Core **извлекает клеймы из токена** и делает их доступными в `HttpContext.User`.

Этот процесс проходит несколько этапов:

1. **Токен передается в заголовке запроса**
    
    ```
    Authorization: Bearer <your_token>
    ```
    
2. **JWT Middleware валидации токена (`AddAuthentication` и `JwtBearer`)**
    
    - Проверяет **подпись** токена
    - Проверяет **срок действия**
    - Извлекает **payload** (где хранятся claims)
    - Преобразует claims в объект `ClaimsPrincipal`
3. **Claims попадают в `HttpContext.User`**, откуда их можно достать.
    

---

## 📌 **Где искать клеймы в коде?**

### **1️⃣ В контроллере через `User.Claims`**

```csharp
[Authorize]
[HttpGet("user-info")]
public IActionResult GetUserInfo()
{
    var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value; // ID пользователя
    var email = User.FindFirst(ClaimTypes.Email)?.Value; // Email пользователя
    var roles = User.Claims.Where(c => c.Type == ClaimTypes.Role).Select(c => c.Value).ToList(); // Все роли

    return Ok(new { userId, email, roles });
}
```

🔹 Здесь:

- `FindFirst(ClaimTypes.NameIdentifier)` ищет **первый** клейм с типом **NameIdentifier** (обычно это `sub` в JWT).
- `FindFirst(ClaimTypes.Email)` ищет email.
- `Where(c => c.Type == ClaimTypes.Role)` собирает **все** роли.

---

### **2️⃣ В кастомной политике через `AuthorizationHandlerContext`**

Если ты используешь **авторизационные политики**, клеймы ищутся так:

```csharp
public class MinimumAgeHandler : AuthorizationHandler<MinimumAgeRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context, MinimumAgeRequirement requirement)
    {
        var ageClaim = context.User.FindFirst(c => c.Type == "Age");
        if (ageClaim != null && int.TryParse(ageClaim.Value, out var age) && age >= requirement.MinimumAge)
        {
            context.Succeed(requirement); // Авторизация успешна
        }

        return Task.CompletedTask;
    }
}
```

🔹 Здесь:

- `context.User.FindFirst("Age")` ищет **клейм с ключом `"Age"`**.
- Если он найден и возраст **>= минимального**, авторизация успешна.

---

### **3️⃣ В middleware (`HttpContext.User`)**

Клеймы можно достать напрямую из `HttpContext`:

```csharp
app.Use(async (context, next) =>
{
    var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    Console.WriteLine($"Current User ID: {userId}");
    await next();
});
```

🔹 Это полезно, если ты хочешь **логировать** или **менять поведение приложения** в зависимости от пользователя.

---

## 📌 **Какой клейм искать?**

В JWT токене есть **разные типы клеймов**, вот примеры:

|Claim|Описание|
|---|---|
|`sub`|ID пользователя (обычно `ClaimTypes.NameIdentifier`)|
|`email`|Email пользователя (`ClaimTypes.Email`)|
|`role`|Роль пользователя (`ClaimTypes.Role`)|
|`iat`|Дата выдачи токена|
|`exp`|Дата истечения|

### **Пример JWT-токена (payload)**

```json
{
  "sub": "12345",
  "email": "user@example.com",
  "role": ["Admin", "User"],
  "iat": 1708540800,
  "exp": 1708544400
}
```

🔹 Если токен содержит `"sub": "12345"`, то:

```csharp
User.FindFirst(ClaimTypes.NameIdentifier)?.Value; // "12345"
```

---

## 🎯 **Вывод**

- **ASP.NET Core автоматически извлекает клеймы** из токена при проверке через `JwtBearer`.
- **Все клеймы доступны в `HttpContext.User.Claims`**.
- Можно искать их через:
    - `User.FindFirst(ClaimTypes.NameIdentifier)`
    - `context.User.FindFirst("Age")`
    - `User.Claims.Where(c => c.Type == ClaimTypes.Role)`

Если у тебя проблема с поиском клейма, проверь:

1. Есть ли нужный клейм в токене (можно проверить на [jwt.io](https://jwt.io/)).
2. Правильно ли ты указываешь его **тип** (например, `ClaimTypes.Email` или просто `"email"`).
3. Правильно ли конфигурирован `JwtBearerOptions`.

### Интересный момент об объявлении политик

Строка:

```csharp
options.AddPolicy("OwnerOrSupervisor", policy => policy.RequireRole("Owner", "Supervisor"));
```

означает, что к методам в контроллере, помеченным как `[Authorize(Policy = "OwnerOrSupervisor")]`, смогут получить доступ **пользователи, у которых есть хотя бы одна из этих ролей** — **`Owner`** или **`Supervisor`**.

Т.е., если у пользователя есть роль **`Owner`**, либо **`Supervisor`**, он сможет получить доступ к этим методам.

### Пояснение:

- В этом случае, **`RequireRole("Owner", "Supervisor")`** задаёт политику, в которой роль пользователя должна быть либо **`Owner`**, либо **`Supervisor`**.
- Это **логическое "ИЛИ"**: либо у пользователя есть роль **`Owner`**, либо **`Supervisor`**, и для этого достаточно одной роли.

Если бы вы использовали **`RequireRole("Owner", "Supervisor")`** с **`AND`**, то это означало бы, что пользователь должен иметь **обе роли** — и **`Owner`**, и **`Supervisor`**. Однако **`RequireRole`** с несколькими параметрами действует как **`OR`**, то есть пользователь может иметь одну из этих ролей.

### Пример:

1. Пользователь с ролью **`Owner`** или **`Supervisor`** сможет пройти авторизацию и получить доступ к методу.
2. Пользователь с обеими ролями **`Owner`** и **`Supervisor`** также сможет пройти авторизацию.

Если ты хочешь, чтобы пользователь должен был иметь **обе роли** одновременно, используй **`RequireRole`** несколько раз:

```csharp
options.AddPolicy("OwnerAndSupervisor", policy =>
    policy.RequireRole("Owner").RequireRole("Supervisor"));
```

Этот вариант будет означать, что пользователь должен быть и **`Owner`**, и **`Supervisor`**.