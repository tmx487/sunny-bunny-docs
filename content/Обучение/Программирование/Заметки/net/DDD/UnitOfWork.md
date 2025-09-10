### 🔹 Что такое **Unit of Work (UoW)**?

`UnitOfWork` — это паттерн, который управляет транзакциями и изменениями в базе данных, гарантируя, что все операции выполняются как единое целое. Он позволяет:  
✅ Группировать несколько операций в одну транзакцию.  
✅ Обеспечивать атомарность (либо все изменения фиксируются, либо откатываются).  
✅ Уменьшать количество открытых соединений к БД.

---

## 🔹 **Как реализовать Unit of Work в .NET?**

Рассмотрим реализацию на `Entity Framework Core`.

### 1️⃣ **Создаем интерфейс `IUnitOfWork`**

```csharp
public interface IUnitOfWork : IDisposable
{
    ICourseTopicRepository CourseTopics { get; }
    IStudentRepository Students { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
```

- Здесь мы определяем репозитории (`CourseTopics`, `Students`).
- `SaveChangesAsync()` фиксирует изменения в БД.

---

### 2️⃣ **Реализуем `UnitOfWork`**

```csharp
public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;

    public ICourseTopicRepository CourseTopics { get; }
    public IStudentRepository Students { get; }

    public UnitOfWork(ApplicationDbContext context, 
                      ICourseTopicRepository courseTopics,
                      IStudentRepository students)
    {
        _context = context;
        CourseTopics = courseTopics;
        Students = students;
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}
```

- **Контекст БД** (`ApplicationDbContext`) управляет транзакцией.
- **Репозитории** передаются в `UnitOfWork` через DI.
- `SaveChangesAsync()` сохраняет все изменения одной транзакцией.

---

### 3️⃣ **Используем `UnitOfWork` в сервисах**

Пример использования в `CourseService`:

```csharp
public class CourseService
{
    private readonly IUnitOfWork _unitOfWork;

    public CourseService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task AddCourseTopicAsync(string title, CancellationToken cancellationToken)
    {
        var topic = new CourseTopic { Title = title };
        _unitOfWork.CourseTopics.Add(topic);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
```

---

### 4️⃣ **Настраиваем DI в `Program.cs` (или `Startup.cs`)**

```csharp
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<ICourseTopicRepository, CourseTopicRepository>();
builder.Services.AddScoped<IStudentRepository, StudentRepository>();
builder.Services.AddScoped<CourseService>();
```

Теперь `UnitOfWork` можно внедрять в сервисы.

---

## 🔹 **Когда использовать `UnitOfWork`?**

✅ Когда нужно **группировать несколько операций в одной транзакции**.  
✅ Когда нужно **изолировать работу с БД** в одном объекте.  
✅ В больших проектах с **множеством репозиториев**.

❌ **Когда НЕ нужно**:

- Если используешь **EF Core напрямую**, т.к. `DbContext` уже реализует Unit of Work.
- Если у тебя **простой CRUD** без сложных операций.