
# Подход №1

Существует несколько подходов к организации уровня Application в рамках архитектурных стилей, таких как Clean Architecture, CQRS и DDD. Ниже представлены некоторые из этих подходов:

### 1. Организация по функциям

В этом подходе код организован по функциям или фичам приложения. Это помогает сгруппировать связанные команды, запросы, обработчики и другие компоненты вместе.

```
MyApp.Application/
├── Features/
│   ├── Users/
│   │   ├── Commands/
│   │   │   ├── CreateUser/
│   │   │   │   ├── CreateUserCommand.cs
│   │   │   │   ├── CreateUserCommandHandler.cs
│   │   ├── Queries/
│   │   │   ├── GetUserById/
│   │   │   │   ├── GetUserByIdQuery.cs
│   │   │   │   ├── GetUserByIdQueryHandler.cs

```

### 2. Организация по типам

Этот подход организует код по типам (команды, запросы, обработчики и т.д.). Он помогает легко находить все команды, все запросы и т.д., но может усложнить навигацию по фичам.

```
MyApp.Application/
├── Commands/
│   ├── CreateUserCommand.cs
│   ├── DeleteUserCommand.cs
├── Queries/
│   ├── GetUserByIdQuery.cs
│   ├── GetUsersListQuery.cs
├── Handlers/
│   ├── Commands/
│   │   ├── CreateUserCommandHandler.cs
│   │   ├── DeleteUserCommandHandler.cs
│   ├── Queries/
│   │   ├── GetUserByIdQueryHandler.cs
│   │   ├── GetUsersListQueryHandler.cs

```

### 3. Организация по слоям

Этот подход организует код по слоям приложения (команды, запросы, события, сервисы и т.д.), и внутри каждого слоя группирует код по функциональности.

```
MyApp.Application/
├── Commands/
│   ├── Users/
│   │   ├── CreateUserCommand.cs
│   │   ├── DeleteUserCommand.cs
├── Queries/
│   ├── Users/
│   │   ├── GetUserByIdQuery.cs
│   │   ├── GetUsersListQuery.cs
├── Handlers/
│   ├── Commands/
│   │   ├── Users/
│   │   │   ├── CreateUserCommandHandler.cs
│   │   │   ├── DeleteUserCommandHandler.cs
│   ├── Queries/
│   │   ├── Users/
│   │   │   ├── GetUserByIdQueryHandler.cs
│   │   │   ├── GetUsersListQueryHandler.cs
├── Services/
│   ├── UserService.cs
├── Events/
│   ├── UserCreatedEvent.cs
```

### 4. Организация по сценариям

Этот подход организует код по сценариям использования или действиям, которые могут включать команды, запросы, обработчики, и даже валидации.

```
MyApp.Application/
├── Scenarios/
│   ├── RegisterUser/
│   │   ├── RegisterUserCommand.cs
│   │   ├── RegisterUserCommandHandler.cs
│   │   ├── RegisterUserValidator.cs
│   │   ├── RegisterUserResult.cs
│   ├── GetUserDetails/
│   │   ├── GetUserDetailsQuery.cs
│   │   ├── GetUserDetailsQueryHandler.cs
│   │   ├── GetUserDetailsResult.cs
```

### 5. Гибридный подход

Этот подход комбинирует элементы различных подходов в зависимости от нужд проекта. Например, можно организовать код по функциям, но внутри каждой функции разделять по типам.

```
MyApp.Application/
├── Users/
│   ├── Commands/
│   │   ├── CreateUserCommand.cs
│   │   ├── DeleteUserCommand.cs
│   ├── Queries/
│   │   ├── GetUserByIdQuery.cs
│   │   ├── GetUsersListQuery.cs
│   ├── Handlers/
│   │   ├── CreateUserCommandHandler.cs
│   │   ├── DeleteUserCommandHandler.cs
│   │   ├── GetUserByIdQueryHandler.cs
│   │   ├── GetUsersListQueryHandler.cs
│   ├── Services/
│   │   ├── UserService.cs
│   ├── Events/
│   │   ├── UserCreatedEvent.cs
```

### Пример реализации с использованием MediatR, CQRS и DDD

#### Команда (CreateUserCommand)

```csharp
public class CreateUserCommand : IRequest<Result<Guid>>
{
    public string Username { get; set; }
    public string Password { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
}

public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, Result<Guid>>
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateUserCommandHandler(IUserRepository userRepository, IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Guid>> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        var user = new User(request.Username, request.Password, request.FirstName, request.LastName);
        _userRepository.Add(user);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<Guid>.Success(user.Id);
    }
}

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IMediator _mediator;

    public UsersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserCommand command)
    {
        var result = await _mediator.Send(command);
        if (result.IsSuccess)
        {
            return CreatedAtAction(nameof(GetUserById), new { id = result.Value }, result.Value);
        }
        return BadRequest(result.Errors);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserById(Guid id)
    {
        var user = await _mediator.Send(new GetUserByIdQuery { UserId = id });
        if (user == null)
        {
            return NotFound();
        }
        return Ok(user);
    }
}

```

### Заключение

Выбор подхода к организации уровня Application зависит от конкретных требований проекта и предпочтений команды разработчиков. Важно, чтобы структура была логичной, легко поддерживаемой и расширяемой.

# Подход №2

Существует несколько подходов к организации уровня Application в проекте, особенно если используются Clean Architecture и CQRS. Основная цель — четко разделить ответственность и упростить поддержку и тестирование кода. Вот некоторые популярные подходы:

### 1. Стандартная организация CQRS

Этот подход заключается в четком разделении команд и запросов, а также в добавлении слоев для промежуточных сервисов, таких как валидация и логирование.

```
MyApp.Application/
├── Commands/
│   ├── Handlers/
│   ├── Requests/
├── Queries/
│   ├── Handlers/
│   ├── Requests/
├── Services/
├── Behaviors/
├── Validators/
```

**Commands** и **Queries**:
- **Handlers**: обработчики команд и запросов.
- **Requests**: сами команды и запросы.

**Services**: бизнес-логика, которая не относится к обработчикам команд и запросов.

**Behaviors**: промежуточные обработки, такие как валидация, логирование и т.д.

**Validators**: классы для валидации команд и запросов.

### 2. Функциональная организация

Этот подход группирует классы по функциональности или модулям. Это может быть полезно для крупных проектов, где одни и те же команды и запросы относятся к одному и тому же модулю.

```
MyApp.Application/
├── Users/
│   ├── Commands/
│   │   ├── Handlers/
│   │   ├── Requests/
│   ├── Queries/
│   │   ├── Handlers/
│   │   ├── Requests/
│   ├── Services/
│   ├── Validators/
├── Products/
│   ├── Commands/
│   │   ├── Handlers/
│   │   ├── Requests/
│   ├── Queries/
│   │   ├── Handlers/
│   │   ├── Requests/
│   ├── Services/
│   ├── Validators/
```

### 3. Вертикальная организация

Этот подход заключается в создании вертикальных срезов для каждой функциональной части приложения. Каждый срез содержит все необходимое для своей функциональности, включая команды, запросы, обработчики, сервисы и модели.

```
MyApp.Application/
├── Users/
│   ├── Commands/
│   ├── Queries/
│   ├── Handlers/
│   ├── Services/
│   ├── Validators/
├── Products/
│   ├── Commands/
│   ├── Queries/
│   ├── Handlers/
│   ├── Services/
│   ├── Validators/
```

### 4. Организация по слоям

Этот подход включает в себя разделение на слои по принципу архитектурной вертикали, где каждый слой может включать команды, запросы и обработчики, относящиеся к конкретным слоям.

```
MyApp.Application/
├── Core/
│   ├── Commands/
│   ├── Queries/
│   ├── Handlers/
│   ├── Services/
│   ├── Validators/
├── Infrastructure/
│   ├── Persistence/
│   ├── Repositories/
│   ├── Services/
```

### Пример структурирования

#### Команда и обработчик

**CreateUserCommand**

```csharp
namespace MyApp.Application.Users.Commands
{
    public class CreateUserCommand : IRequest<Result<Guid>>
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
    }
}
```

**CreateUserCommandHandler**

```csharp
namespace MyApp.Application.Users.Handlers
{
    public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, Result<Guid>>
    {
        private readonly IUserRepository _userRepository;
        private readonly IUnitOfWork _unitOfWork;

        public CreateUserCommandHandler(IUserRepository userRepository, IUnitOfWork unitOfWork)
        {
            _userRepository = userRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<Guid>> Handle(CreateUserCommand request, CancellationToken cancellationToken)
        {
            var user = new User(request.Username, request.Password, request.FirstName, request.LastName);
            _userRepository.Add(user);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result<Guid>.Success(user.Id);
        }
    }
}
```

#### Запрос и обработчик

**GetUserByIdQuery**

```csharp
namespace MyApp.Application.Users.Queries
{
    public class GetUserByIdQuery : IRequest<UserDto>
    {
        public Guid UserId { get; set; }
    }
}
```

**GetUserByIdQueryHandler**

```c#
namespace MyApp.Application.Users.Handlers
{
    public class GetUserByIdQueryHandler : IRequestHandler<GetUserByIdQuery, UserDto>
    {
        private readonly IUserRepository _userRepository;

        public GetUserByIdQueryHandler(IUserRepository userRepository)
        {
            _userRepository
```


# Подход №3

Существует несколько подходов к организации уровня Application в проекте, использующем Clean Architecture. Каждый из этих подходов имеет свои преимущества и может быть адаптирован в зависимости от конкретных потребностей проекта. Вот несколько популярных подходов:

### 1. Разделение по типам операций (CQRS)

В этом подходе уровень Application организуется вокруг команд (commands) и запросов (queries), что соответствует принципам CQRS (Command Query Responsibility Segregation).

#### Структура

```
MyApp.Application/
├── Commands/
│   ├── Handlers/
│   ├── Requests/
├── Queries/
│   ├── Handlers/
│   ├── Requests/
├── Interfaces/
├── Services/
├── Behaviors/
```

**Преимущества:**
- Ясное разделение между командами и запросами.
- Хорошая поддержка принципов CQRS.
- Упрощенное тестирование.

**Недостатки:**
- Возможна некоторая дубликация кода между командами и запросами.
- Может быть сложно для понимания новичками.

### 2. Разделение по функциональным модулям

В этом подходе операции организуются вокруг функциональных модулей или агрегатов. Например, если в системе есть модули для управления пользователями и заказами, они будут выделены в отдельные папки.

#### Структура

```
MyApp.Application/
├── Users/
│   ├── Commands/
│   ├── Queries/
│   ├── Handlers/
├── Orders/
│   ├── Commands/
│   ├── Queries/
│   ├── Handlers/
├── Interfaces/
├── Services/
├── Behaviors/
```

**Преимущества:**
- Легче масштабировать и поддерживать.
- Модули легко идентифицировать.
- Упрощает работу над модулем конкретной команды.

**Недостатки:**
- Может потребоваться больше уровней вложенности директорий.
- Требует дисциплины в поддержании структуры.

### 3. Вертикальные срезы

Этот подход похож на модульный, но вместо функциональных модулей используется вертикальное разделение на срезы, которые включают все уровни приложения (от API до Infrastructure).

#### Структура

```
MyApp/
├── Users/
│   ├── API/
│   ├── Application/
│   │   ├── Commands/
│   │   ├── Queries/
│   │   ├── Handlers/
│   ├── Domain/
│   ├── Infrastructure/
├── Orders/
│   ├── API/
│   ├── Application/
│   │   ├── Commands/
│   │   ├── Queries/
│   │   ├── Handlers/
│   ├── Domain/
│   ├── Infrastructure/
```

**Преимущества:**
- Легко выделить отдельные части приложения для независимого развертывания.
- Упрощает работу над конкретными вертикальными срезами.

**Недостатки:**
- Может привести к дублированию кода.
- Требует более сложной организации и управления зависимостями.

### 4. Разделение по уровням ответственности

В этом подходе акцент делается на разделение операций по их роли в бизнес-логике.

#### Структура

```
MyApp.Application/
├── UseCases/
│   ├── Commands/
│   │   ├── Handlers/
│   │   ├── Requests/
│   ├── Queries/
│   │   ├── Handlers/
│   │   ├── Requests/
├── Interfaces/
├── Services/
├── Validators/
├── EventHandlers/
├── Behaviors/
```

**Преимущества:**
- Ясное разделение ролей и обязанностей.
- Легко добавлять новые типы операций (например, события или валидации).

**Недостатки:**
- Может быть сложнее управлять, если слишком много типов операций.
- Требует хорошего понимания бизнес-логики.

### Пример использования подходов

#### Разделение по типам операций (CQRS)

##### Команда

```csharp
namespace MyApp.Application.Commands.Requests
{
    public class CreateOrderCommand : IRequest<Result<Guid>>
    {
        public Guid UserId { get; set; }
        public List<OrderItemDto> Items { get; set; }
    }
}
```

##### Обработчик команды

```csharp
namespace MyApp.Application.Commands.Handlers
{
    public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, Result<Guid>>
    {
        private readonly IOrderRepository _orderRepository;
        private readonly IUnitOfWork _unitOfWork;

        public CreateOrderCommandHandler(IOrderRepository orderRepository, IUnitOfWork unitOfWork)
        {
            _orderRepository = orderRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<Guid>> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
        {
            var order = new Order(request.UserId, request.Items);
            _orderRepository.Add(order);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result<Guid>.Success(order.Id);
        }
    }
}
```

#### Разделение по функциональным модулям

##### Команда

```csharp
namespace MyApp.Application.Users.Commands
{
    public class CreateUserCommand : IRequest<Result<Guid>>
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }
}
```

##### Обработчик команды

```csharp
namespace MyApp.Application.Users.Handlers
{
    public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, Result<Guid>>
    {
        private readonly IUserRepository _userRepository;
        private readonly IUnitOfWork _unitOfWork;

        public CreateUserCommandHandler(IUserRepository userRepository, IUnitOfWork unitOfWork)
        {
            _userRepository = userRepository;
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<Guid>> Handle(CreateUserCommand request, CancellationToken cancellationToken)
        {
            var user = new User(request.Username, request.Password);
            _userRepository.Add(user);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result<Guid>.Success(user.Id);
        }
    }
}
```

Выбор подхода зависит от специфики вашего проекта и команды. Основная цель — сделать код легко поддерживаемым