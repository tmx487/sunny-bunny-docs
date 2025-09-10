## **📌 Что такое хендлеры в CQRS?**

В `CQRS` (Command and Query Responsibility Segregation) **хендлеры (handlers)** – это классы, которые:  
✅ **Обрабатывают команды (Commands) и запросы (Queries)**.  
✅ **Делегируют выполнение сервисам** с бизнес-логикой.  
✅ **Разделяют** выполнение команд (изменение данных) и запросов (чтение данных).

Пример **структуры CQRS** в `Application` слое:

```
📂 Application
 ├── 📂 Commands
 │     ├── CreateUserCommand.cs
 │     ├── UpdateUserCommand.cs
 │     └── DeleteUserCommand.cs
 ├── 📂 Queries
 │     ├── GetUserByIdQuery.cs
 │     ├── GetAllUsersQuery.cs
 │     └── SearchUsersQuery.cs
 ├── 📂 Handlers
 │     ├── CreateUserHandler.cs
 │     ├── UpdateUserHandler.cs
 │     ├── DeleteUserHandler.cs
 │     ├── GetUserByIdHandler.cs
 │     ├── GetAllUsersHandler.cs
 │     └── SearchUsersHandler.cs
 ├── 📂 Services
 │     ├── UserService.cs
 │     ├── AuthService.cs
 │     ├── TokenService.cs
```

---

## **📌 Почему не использовать только сервисы?**

Допустим, у нас есть сервис:

```csharp
public class UserService
{
    private readonly IUserRepository _userRepository;

    public UserService(IUserRepository userRepository) 
    {
        _userRepository = userRepository;
    }

    public async Task<UserDto> GetUserByIdAsync(Guid userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        return user is null ? throw new NotFoundException("User not found") : new UserDto(user);
    }
}
```

Тогда зачем нужен хендлер? 🤔

### **1. CQRS == Разделение "что" и "как"**

- **Хендлер определяет, что нужно сделать** (обрабатывает `Command` или `Query`).
- **Сервис определяет, как это сделать** (выполняет бизнес-логику).
- Если бы `Controller` напрямую вызывал сервисы, он бы зависел от бизнес-логики.

### **2. Упрощает поддержку кода**

- **Хендлеры делают код более модульным**, так как чётко отделяют **запросы (Queries)** от **команд (Commands)**.
- Если логика усложнится (например, надо добавить **кэширование, валидацию, логи**), то хендлеры помогут не засорять сервисы (читай [[#**Как handlers помогают не засорять сервисы**|далее]]).

### **3. Упрощает тестирование**

- **Хендлеры легко мокать** в тестах, можно проверять их независимо от сервисов.
- Например, можно тестировать `CreateUserHandler`, подставляя моковый `UserService`.

---

## **📌 Как выглядит обработка команды через хендлер?**

Допустим, нам надо **создать пользователя**.

### **1. Создаём команду (Command)**

```csharp
public record CreateUserCommand(string Email, string Password) : IRequest<Guid>;
```

- `IRequest<Guid>` означает, что команда **вернёт `Guid` (ID пользователя)**.
- `record` удобен для DTO и неизменяемых объектов.

### **2. Создаём хендлер (Handler)**

```csharp
public class CreateUserHandler : IRequestHandler<CreateUserCommand, Guid>
{
    private readonly IUserService _userService;

    public CreateUserHandler(IUserService userService)
    {
        _userService = userService;
    }

    public async Task<Guid> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        return await _userService.CreateUserAsync(request.Email, request.Password);
    }
}
```

- `Handle` вызывает сервис, но **не содержит бизнес-логику**.
- Это позволяет легко заменить реализацию `UserService`, если потребуется.

### **3. Вызываем команду в контроллере**

```csharp
[HttpPost]
public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
{
    var userId = await _mediator.Send(new CreateUserCommand(dto.Email, dto.Password));
    return Ok(userId);
}
```

- Мы просто отправляем команду через `MediatR`, а **контроллер не зависит от сервисов**!

---

## **📌 Итог**

✅ **Хендлеры разделяют ответственность** – они отвечают только за обработку команд/запросов, а бизнес-логика остаётся в сервисах.  
✅ **Облегчают тестирование**, так как позволяют мокать сервисы.  
✅ **Упрощают расширение приложения** – можно добавлять `кэширование`, `валидацию`, `логирование`, не меняя сервисы.

> **Вывод:** **Хендлеры – это слой, который "разруливает" CQRS**. Они не заменяют сервисы, а **разгружают их и упрощают код**. 🚀

## **🔹Как handlers помогают не засорять сервисы**
## **📌 Проблема: сервис перегружен логикой**

Допустим, у нас есть сервис `UserService`, который получает пользователя по `id`:

### ❌ **До внедрения CQRS**

```csharp
public class UserService
{
    private readonly IUserRepository _userRepository;
    private readonly ILogger<UserService> _logger;
    private readonly ICacheService _cacheService;

    public UserService(IUserRepository userRepository, ILogger<UserService> logger, ICacheService cacheService)
    {
        _userRepository = userRepository;
        _logger = logger;
        _cacheService = cacheService;
    }

    public async Task<UserDto> GetUserByIdAsync(Guid userId)
    {
        _logger.LogInformation($"Fetching user {userId}");

        // Проверяем кэш
        var cachedUser = await _cacheService.GetAsync<UserDto>($"user_{userId}");
        if (cachedUser is not null)
        {
            _logger.LogInformation($"User {userId} found in cache");
            return cachedUser;
        }

        // Получаем пользователя из БД
        var user = await _userRepository.GetByIdAsync(userId);
        if (user is null)
        {
            throw new NotFoundException("User not found");
        }

        var userDto = new UserDto(user);

        // Кладём в кэш
        await _cacheService.SetAsync($"user_{userId}", userDto, TimeSpan.FromMinutes(10));

        _logger.LogInformation($"User {userId} fetched from database");

        return userDto;
    }
}
```

### **Какие здесь проблемы?**

❌ **Сервис перегружен дополнительной логикой**:

- Кэширование (`_cacheService`)
- Логирование (`_logger`)
- Проверка на `null`
- Основная бизнес-логика перемешана с инфраструктурными деталями

❌ **Сложно тестировать**:

- Нужно мокать **и БД**, **и кэш**, **и логи** в каждом тесте

---

## **📌 Решение: переносим логику в хендлер**

Вместо того, чтобы засорять сервис, **переносим кэширование и логику в хендлер**.

---

### ✅ **1. Запрос (Query)**

Создаём **запрос (Query)** для получения пользователя:

```csharp
public record GetUserByIdQuery(Guid UserId) : IRequest<UserDto>;
```

- `IRequest<UserDto>` – это запрос, который вернёт **UserDto**.

---

### ✅ **2. Хендлер (Handler)**

В хендлере теперь обрабатываем **логирование, кэширование и работу с сервисом**:

```csharp
public class GetUserByIdHandler : IRequestHandler<GetUserByIdQuery, UserDto>
{
    private readonly IUserService _userService;
    private readonly ILogger<GetUserByIdHandler> _logger;
    private readonly ICacheService _cacheService;

    public GetUserByIdHandler(IUserService userService, ILogger<GetUserByIdHandler> logger, ICacheService cacheService)
    {
        _userService = userService;
        _logger = logger;
        _cacheService = cacheService;
    }

    public async Task<UserDto> Handle(GetUserByIdQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation($"Fetching user {request.UserId}");

        // Проверяем кэш
        var cachedUser = await _cacheService.GetAsync<UserDto>($"user_{request.UserId}");
        if (cachedUser is not null)
        {
            _logger.LogInformation($"User {request.UserId} found in cache");
            return cachedUser;
        }

        // Получаем пользователя через сервис (чистая бизнес-логика)
        var userDto = await _userService.GetUserByIdAsync(request.UserId);

        // Кладём в кэш
        await _cacheService.SetAsync($"user_{request.UserId}", userDto, TimeSpan.FromMinutes(10));

        _logger.LogInformation($"User {request.UserId} fetched from database");

        return userDto;
    }
}
```

### **Что мы улучшили?**

✅ **Сервис `UserService` теперь содержит только бизнес-логику**  
✅ **Кэширование и логирование отделены от бизнес-логики**  
✅ **Легче тестировать** – можно тестировать `UserService` без лишних зависимостей

---

### ✅ **3. Контроллер теперь вызывает MediatR**

Теперь контроллер отправляет `Query`, не зная деталей реализации:

```csharp
[HttpGet("{userId}")]
public async Task<IActionResult> GetUserById(Guid userId)
{
    var user = await _mediator.Send(new GetUserByIdQuery(userId));
    return Ok(user);
}
```

- Контроллер **не зависит от сервисов**.
- Если нужно изменить кэширование, логику валидации – **не надо трогать контроллер и сервис!**

---

## **📌 Итог**

✅ **CQRS-хендлеры помогают разделить ответственность**  
✅ **Сервисы остаются чистыми и отвечают только за бизнес-логику**  
✅ **Кэширование, логирование, валидация обрабатываются в хендлерах**  
✅ **Контроллер не зависит от сервисов, что упрощает тестирование**

> **Вывод:** Благодаря CQRS можно легко **подключать кэш, логи и валидацию**, не загромождая сервисы инфраструктурными деталями. 🚀