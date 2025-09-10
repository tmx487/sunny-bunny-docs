
В Clean Architecture и Domain-Driven Design (DDD) обычно выделяют несколько основных слоев. Эти слои помогают структурировать приложение так, чтобы каждая часть была независимой и легко тестируемой. 

Вот пример структуры слоев:

1. **Domain** (Домен):
   - **Entities** (Сущности)
   - **Value Objects** (Объекты-значения)
   - **Aggregates** (Агрегаты)
   - **Repositories Interfaces** (Интерфейсы репозиториев)
   - **Domain Services** (Доменные сервисы)
   - **Events** (События)
   - **Specifications** (Спецификации)

2. **Application** (Приложение):
   - **Commands** (Команды)
   - **Command Handlers** (Обработчики команд)
   - **Queries** (Запросы)
   - **Query Handlers** (Обработчики запросов)
   - **DTOs** (Data Transfer Objects)
   - **Mappers** (Мапперы)
   - **Services** (Сервисы приложения)
   - **Validators** (Валидаторы)

3. **Infrastructure** (Инфраструктура):
   - **Repositories Implementations** (Реализации репозиториев)
   - **Data Context** (Контекст данных)
   - **Third-Party Services Integrations** (Интеграции с внешними сервисами)
   - **Configurations** (Конфигурации)
   - **Logging** (Логирование)

4. **Presentation** (Презентация):
   - **Controllers** (Контроллеры)
   - **Views** (Представления, если используется MVC)
   - **API** (если это Web API)

### Пример структуры папок:

```
src/
|-- Domain/
|   |-- Entities/
|   |-- ValueObjects/
|   |-- Aggregates/
|   |-- Interfaces/
|   |-- Services/
|   |-- Events/
|   |-- Specifications/
|
|-- Application/
|   |-- Commands/
|   |-- CommandHandlers/
|   |-- Queries/
|   |-- QueryHandlers/
|   |-- DTOs/
|   |-- Mappers/
|   |-- Services/
|   |-- Validators/
|
|-- Infrastructure/
|   |-- Repositories/
|   |-- DataContext/
|   |-- Services/
|   |-- Configurations/
|   |-- Logging/
|
|-- Presentation/
|   |-- Controllers/
|   |-- Views/
|   |-- API/
```

### Пример использования слоев

#### Domain Layer
```csharp
// Сущность
public class Student
{
    public Guid Id { get; private set; }
    public string Name { get; private set; }

    public Student(Guid id, string name)
    {
        Id = id;
        Name = name;
    }
}

// Интерфейс репозитория
public interface IStudentRepository
{
    IQueryable<Student> GetAll();
    Task<Student> GetByIdAsync(Guid id);
    Task AddAsync(Student student);
    Task UpdateAsync(Student student);
    Task DeleteAsync(Student student);
}
```

#### Application Layer
```csharp
// Команда
public class AddStudentCommand : IRequest<Guid>
{
    public string Name { get; set; }
}

// Обработчик команды
public class AddStudentCommandHandler : IRequestHandler<AddStudentCommand, Guid>
{
    private readonly IStudentRepository _studentRepository;

    public AddStudentCommandHandler(IStudentRepository studentRepository)
    {
        _studentRepository = studentRepository;
    }

    public async Task<Guid> Handle(AddStudentCommand request, CancellationToken cancellationToken)
    {
        var student = new Student(Guid.NewGuid(), request.Name);
        await _studentRepository.AddAsync(student);
        return student.Id;
    }
}

// Запрос
public class GetStudentByIdQuery : IRequest<StudentDto>
{
    public Guid Id { get; set; }
}

// Обработчик запроса
public class GetStudentByIdQueryHandler : IRequestHandler<GetStudentByIdQuery, StudentDto>
{
    private readonly IStudentRepository _studentRepository;

    public GetStudentByIdQueryHandler(IStudentRepository studentRepository)
    {
        _studentRepository = studentRepository;
    }

    public async Task<StudentDto> Handle(GetStudentByIdQuery request, CancellationToken cancellationToken)
    {
        var student = await _studentRepository.GetByIdAsync(request.Id);
        if (student == null)
        {
            // Обработка отсутствия студента
            return null;
        }

        return new StudentDto { Id = student.Id, Name = student.Name };
    }
}
```

#### Infrastructure Layer
```csharp
// Реализация репозитория
public class StudentRepository : IStudentRepository
{
    private readonly YourDbContext _dbContext;

    public StudentRepository(YourDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public IQueryable<Student> GetAll()
    {
        return _dbContext.Students.AsQueryable();
    }

    public async Task<Student> GetByIdAsync(Guid id)
    {
        return await _dbContext.Students.SingleOrDefaultAsync(s => s.Id == id);
    }

    public async Task AddAsync(Student student)
    {
        await _dbContext.Students.AddAsync(student);
        await _dbContext.SaveChangesAsync();
    }

    public async Task UpdateAsync(Student student)
    {
        _dbContext.Students.Update(student);
        await _dbContext.SaveChangesAsync();
    }

    public async Task DeleteAsync(Student student)
    {
        _dbContext.Students.Remove(student);
        await _dbContext.SaveChangesAsync();
    }
}
```

#### Presentation Layer
```csharp
// Контроллер
[ApiController]
[Route("api/[controller]")]
public class StudentsController : ControllerBase
{
    private readonly IMediator _mediator;

    public StudentsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> AddStudent(AddStudentCommand command)
    {
        var studentId = await _mediator.Send(command);
        return Ok(studentId);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetStudentById(Guid id)
    {
        var student = await _mediator.Send(new GetStudentByIdQuery { Id = id });
        if (student == null)
        {
            return NotFound();
        }
        return Ok(student);
    }
}
```

### Заключение

Clean Architecture и DDD помогают структурировать приложение так, чтобы каждая часть имела четкие обязанности и была изолирована от других частей. Это делает код более модульным, тестируемым и поддерживаемым. Слои помогают разделить бизнес-логику, обработку запросов и инфраструктурные детали, обеспечивая лучшую организованность и гибкость.