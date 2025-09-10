**Чистая архитектура (Clean Architecture)** - это архитектурный подход, предложенный Робертом Мартином (Uncle Bob), который организует код в концентрические слои с четкими правилами зависимостей (рис. 1).

![[Pasted image 20250723114425.png]]
Рисунок 1 - Схема чистой архитектуры по Роберту Мартину ([[https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html|источник]])
## Основные принципы:

**1. Правило зависимостей:** Внутренние слои не должны знать о внешних. Зависимости направлены только внутрь.

**2. Слои (от центра наружу):**

```
┌─────────────────────────────────────┐
│        Frameworks & Drivers         │  ← UI, БД, Web
├─────────────────────────────────────┤
│        Interface Adapters           │  ← Controllers, Presenters
├─────────────────────────────────────┤
│          Use Cases                  │  ← Бизнес-логика приложения
├─────────────────────────────────────┤
│           Entities                  │  ← Доменные объекты
└─────────────────────────────────────┘
```

## Пример на C#:

**Entities (центр):**

```cs
public class User
{
    public int Id { get; set; }
    public string Email { get; set; }
    public bool IsActive { get; set; }
}
```

**Use Cases:**

```cs
public interface IUserRepository
{
    Task<User> GetByIdAsync(int id);
}

public class GetUserUseCase
{
    private readonly IUserRepository _repository;
    
    public GetUserUseCase(IUserRepository repository)
    {
        _repository = repository;
    }
    
    public async Task<User> ExecuteAsync(int userId)
    {
        return await _repository.GetByIdAsync(userId);
    }
}
```

**Interface Adapters:**

```cs
[ApiController]
public class UsersController : ControllerBase
{
    private readonly GetUserUseCase _getUserUseCase;
    
    [HttpGet("{id}")]
    public async Task<IActionResult> GetUser(int id)
    {
        var user = await _getUserUseCase.ExecuteAsync(id);
        return Ok(user);
    }
}
```

**Frameworks & Drivers:**

```cs
public class SqlUserRepository : IUserRepository
{
    public async Task<User> GetByIdAsync(int id)
    {
        // Работа с БД
    }
}
```

## Преимущества:

- **Независимость от фреймворков** - можно менять UI/БД без изменения бизнес-логики
- **Тестируемость** - легко мокать внешние зависимости
- **Независимость от UI** - одну логику можно использовать в разных интерфейсах

## На собеседовании важно знать:

- Направление зависимостей (только внутрь)
- Инверсия зависимостей через интерфейсы
- Разделение бизнес-логики и технических деталей