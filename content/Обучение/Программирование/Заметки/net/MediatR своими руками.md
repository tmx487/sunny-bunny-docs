MediatR — это популярная библиотека для реализации паттерна посредника (Mediator) в .NET. Давайте разберемся, что у неё под капотом и как можно создать свою реализацию.

## Что такое MediatR и как он работает

В основе MediatR лежат несколько ключевых концепций:

1. **Запросы и обработчики запросов** - для операций, возвращающих данные
2. **Команды и обработчики команд** - для операций без возврата данных
3. **Уведомления и обработчики уведомлений** - для событийной модели
4. **Пайплайны поведения** - для сквозной функциональности (логирование, валидация)

Основной принцип — разделение отправителя запроса от его получателя через централизованного посредника.

## Упрощенная реализация MediatR

Вот как можно создать базовую версию медиатора:

```csharp
// 1. Определяем основные интерфейсы
public interface IRequest<out TResponse> { }

public interface IRequestHandler<in TRequest, TResponse> 
    where TRequest : IRequest<TResponse>
{
    Task<TResponse> Handle(TRequest request, CancellationToken cancellationToken);
}

// 2. Интерфейс медиатора
public interface IMediator
{
    Task<TResponse> Send<TResponse>(IRequest<TResponse> request, CancellationToken cancellationToken = default);
    Task Publish<TNotification>(TNotification notification, CancellationToken cancellationToken = default)
        where TNotification : INotification;
}

public interface INotification { }

public interface INotificationHandler<in TNotification>
    where TNotification : INotification
{
    Task Handle(TNotification notification, CancellationToken cancellationToken);
}

// 3. Реализация медиатора
public class Mediator : IMediator
{
    private readonly IServiceProvider _serviceProvider;
    
    public Mediator(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }
    
    public async Task<TResponse> Send<TResponse>(IRequest<TResponse> request, CancellationToken cancellationToken = default)
    {
        // Определяем тип обработчика на основе типа запроса
        var requestType = request.GetType();
        var handlerType = typeof(IRequestHandler<,>).MakeGenericType(requestType, typeof(TResponse));
        
        // Получаем обработчик из контейнера зависимостей
        var handler = _serviceProvider.GetService(handlerType);
        
        if (handler == null)
            throw new InvalidOperationException($"No handler registered for {requestType.Name}");
        
        // Вызываем метод Handle через рефлексию
        var method = handlerType.GetMethod("Handle");
        return await (Task<TResponse>)method.Invoke(handler, new object[] { request, cancellationToken });
    }
    
    public async Task Publish<TNotification>(TNotification notification, CancellationToken cancellationToken = default)
        where TNotification : INotification
    {
        // Получаем все обработчики уведомлений
        var handlerType = typeof(INotificationHandler<>).MakeGenericType(notification.GetType());
        var handlers = _serviceProvider.GetServices(handlerType);
        
        var tasks = new List<Task>();
        foreach (var handler in handlers)
        {
            var method = handlerType.GetMethod("Handle");
            tasks.Add((Task)method.Invoke(handler, new object[] { notification, cancellationToken }));
        }
        
        await Task.WhenAll(tasks);
    }
}
```

## Регистрация в DI

Для работы самописного медиатора нужно зарегистрировать его в контейнере зависимостей:

```csharp
public static class MediatorExtensions
{
    public static IServiceCollection AddCustomMediator(this IServiceCollection services, params Assembly[] assemblies)
    {
        // Регистрируем сам медиатор
        services.AddScoped<IMediator, Mediator>();
        
        // Автоматически регистрируем все обработчики
        foreach (var assembly in assemblies)
        {
            RegisterHandlers(services, assembly, typeof(IRequestHandler<,>));
            RegisterHandlers(services, assembly, typeof(INotificationHandler<>));
        }
        
        return services;
    }
    
    private static void RegisterHandlers(IServiceCollection services, Assembly assembly, Type handlerType)
    {
        var handlers = assembly.GetTypes()
            .Where(t => t.GetInterfaces().Any(i => 
                i.IsGenericType && i.GetGenericTypeDefinition() == handlerType));
        
        foreach (var handler in handlers)
        {
            var interfaces = handler.GetInterfaces()
                .Where(i => i.IsGenericType && i.GetGenericTypeDefinition() == handlerType);
            
            foreach (var handlerInterface in interfaces)
            {
                services.AddTransient(handlerInterface, handler);
            }
        }
    }
}
```

## Расширение для пайплайнов поведения

Одна из важных функций MediatR — пайплайны поведения. Вот как их можно реализовать:

```csharp
public interface IPipelineBehavior<TRequest, TResponse>
{
    Task<TResponse> Handle(
        TRequest request, 
        RequestHandlerDelegate<TResponse> next, 
        CancellationToken cancellationToken);
}

public delegate Task<TResponse> RequestHandlerDelegate<TResponse>();

// Обновляем медиатор для поддержки пайплайнов
public class Mediator : IMediator
{
    private readonly IServiceProvider _serviceProvider;
    
    public Mediator(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }
    
    public async Task<TResponse> Send<TResponse>(IRequest<TResponse> request, CancellationToken cancellationToken = default)
    {
        var requestType = request.GetType();
        
        // Построение пайплайна обработки
        var pipeline = BuildPipeline<TResponse>(requestType, request);
        
        return await pipeline();
    }
    
    private RequestHandlerDelegate<TResponse> BuildPipeline<TResponse>(Type requestType, IRequest<TResponse> request)
    {
        // Получаем все поведения для типа запроса
        var behaviors = _serviceProvider.GetServices(typeof(IPipelineBehavior<,>)
            .MakeGenericType(requestType, typeof(TResponse)))
            .Cast<IPipelineBehavior<IRequest<TResponse>, TResponse>>()
            .ToList();
            
        // Определяем конечный обработчик
        RequestHandlerDelegate<TResponse> handler = () =>
        {
            var handlerType = typeof(IRequestHandler<,>).MakeGenericType(requestType, typeof(TResponse));
            var handlerInstance = _serviceProvider.GetService(handlerType);
            
            if (handlerInstance == null)
                throw new InvalidOperationException($"No handler registered for {requestType.Name}");
                
            var handleMethod = handlerType.GetMethod("Handle");
            return (Task<TResponse>)handleMethod.Invoke(handlerInstance, new object[] { request, CancellationToken.None });
        };
        
        // Строим пайплайн, оборачивая каждый следующий обработчик предыдущим
        return behaviors
            .Reverse()
            .Aggregate(handler, (next, pipeline) => () => 
                pipeline.Handle(request, next, CancellationToken.None));
    }
    
    // Реализация Publish остаётся прежней
}
```

## Пример использования самописного медиатора

```csharp
// Запрос
public class GetUserByIdQuery : IRequest<UserDto>
{
    public int UserId { get; set; }
}

// Обработчик
public class GetUserByIdHandler : IRequestHandler<GetUserByIdQuery, UserDto>
{
    private readonly IUserRepository _userRepository;
    
    public GetUserByIdHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }
    
    public async Task<UserDto> Handle(GetUserByIdQuery request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId);
        return new UserDto { Id = user.Id, Name = user.Name };
    }
}

// Пример поведения - логирование
public class LoggingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly ILogger<LoggingBehavior<TRequest, TResponse>> _logger;
    
    public LoggingBehavior(ILogger<LoggingBehavior<TRequest, TResponse>> logger)
    {
        _logger = logger;
    }
    
    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        _logger.LogInformation($"Handling {typeof(TRequest).Name}");
        
        var response = await next();
        
        _logger.LogInformation($"Handled {typeof(TRequest).Name}");
        
        return response;
    }
}
```

## Плюсы и минусы самостоятельной реализации

**Плюсы:**

- Полный контроль над функциональностью
- Возможность настроить под конкретные требования проекта
- Отсутствие зависимости от внешней библиотеки
- Глубокое понимание паттерна и его реализации

**Минусы:**

- Больше кода для поддержки
- Необходимость отлавливать краевые случаи самостоятельно
- Отсутствие сообщества, решающего проблемы
- Риск пропуска важной функциональности или оптимизаций

Самописная реализация MediatR может быть подходящим решением для проектов с особыми требованиями или когда команда хочет полного контроля над механизмом медиатора, но для большинства случаев оригинальная библиотека будет более надежным и проверенным решением.