Паттерн **Specification** — это паттерн проектирования, который используется для того, чтобы инкапсулировать правила бизнес-логики или критерии запроса, такие как *фильтрация, сортировка и другие условия*. Вместо того чтобы передавать логику фильтрации прямо в репозиторий, мы создаем объект **Specification**, который может быть использован в репозитории для построения запросов. Это позволяет избежать жесткой зависимости бизнес-слоя от конкретных реализаций запросов в базе данных, а также улучшить тестируемость и читаемость кода.

### Основные идеи паттерна Specification

- **Инкапсуляция условий поиска:** Все условия фильтрации или поиска инкапсулируются в отдельных классах, называемых **спецификациями**.
- **Составление спецификаций:** Спецификации можно комбинировать (с помощью логических операций: AND, OR), что позволяет строить более сложные условия фильтрации.
- **Гибкость:** С помощью спецификаций легко добавлять новые критерии или изменять логику фильтрации, не изменяя основной код репозитория или сервиса.

### Структура паттерна Specification

1. **Интерфейс `ISpecification<T>`** — описывает спецификацию, предоставляя метод для получения выражения (предиката), которое будет использовано в запросе.
2. **Конкретные реализации спецификаций** — описывают бизнес-правила или критерии, которые будут применяться к сущности.
3. **Метод репозитория для применения спецификации** — метод, который принимает спецификацию и использует её для выполнения запроса.

### Пример реализации паттерна Specification

#### 1. Интерфейс `ISpecification<T>`

Интерфейс спецификации определяет метод `ToExpression()`, который возвращает `Expression<Func<T, bool>>`, который будет использован для фильтрации данных.

```csharp
public interface ISpecification<TEntity>
{
    // Возвращает выражение, которое будет использоваться для фильтрации данных
    Expression<Func<TEntity, bool>> ToExpression();
}
```

#### 2. Конкретные реализации спецификаций

Предположим, у нас есть сущность `Topic`, и мы хотим создать несколько спецификаций для фильтрации тем по их заголовкам или описаниям.

```csharp
public class TitleContainsSpecification : ISpecification<Topic>
{
    private readonly string _title;

    public TitleContainsSpecification(string title)
    {
        _title = title;
    }

    public Expression<Func<Topic, bool>> ToExpression()
    {
        return topic => topic.Title.Contains(_title);
    }
}

public class DescriptionContainsSpecification : ISpecification<Topic>
{
    private readonly string _description;

    public DescriptionContainsSpecification(string description)
    {
        _description = description;
    }

    public Expression<Func<Topic, bool>> ToExpression()
    {
        return topic => topic.Description.Contains(_description);
    }
}
```

Здесь у нас есть две спецификации:

- `TitleContainsSpecification` — фильтрует темы по части заголовка.
- `DescriptionContainsSpecification` — фильтрует темы по части описания.

#### 3. Репозиторий с применением спецификаций

Теперь в репозитории мы можем использовать спецификации для выполнения запросов. Мы передаем спецификацию в репозиторий, а репозиторий будет применять её для фильтрации.

```csharp
public interface IRepository<TEntity> where TEntity : class
{
    Task<IEnumerable<TEntity>> GetBySpecificationAsync(ISpecification<TEntity> specification, CancellationToken cancellationToken);
    // Другие методы...
}

public class BaseRepository<TEntity> : IRepository<TEntity> where TEntity : class
{
    private readonly DbSet<TEntity> _entities;

    public BaseRepository(TSDbContext context)
    {
        _entities = context.Set<TEntity>();
    }

    public async Task<IEnumerable<TEntity>> GetBySpecificationAsync(ISpecification<TEntity> specification, CancellationToken cancellationToken)
    {
        var query = _entities.AsQueryable();
        var expression = specification.ToExpression();
        return await query.Where(expression).ToListAsync(cancellationToken);
    }
}
```

Метод `GetBySpecificationAsync` в репозитории принимает спецификацию и применяет её, фильтруя данные в базе. Мы получаем предикат от спецификации, который будет использоваться в `Where()`.

#### 4. Пример использования в сервисе

Теперь в сервисе мы можем комбинировать несколько спецификаций и передавать их в репозиторий.

```csharp
public class TopicService
{
    private readonly IRepository<Topic> _topicRepository;

    public TopicService(IRepository<Topic> topicRepository)
    {
        _topicRepository = topicRepository;
    }

    public async Task<IEnumerable<Topic>> GetFilteredTopics(string title, string description, CancellationToken cancellationToken)
    {
        var titleSpec = new TitleContainsSpecification(title);
        var descriptionSpec = new DescriptionContainsSpecification(description);

        // Комбинируем спецификации (в случае необходимости можно объединить их с помощью логических операций)
        var combinedSpec = new AndSpecification<Topic>(titleSpec, descriptionSpec);

        return await _topicRepository.GetBySpecificationAsync(combinedSpec, cancellationToken);
    }
}
```

В этом примере мы создаем две спецификации (по заголовку и по описанию) и комбинируем их в одну с помощью логической операции `AND`. Для этого можно создать специальную спецификацию `AndSpecification`.

#### 5. Комбинированные спецификации

Для комбинирования спецификаций можно создать дополнительный класс, который будет позволять объединять спецификации с помощью логических операций.

```csharp
public class AndSpecification<TEntity> : ISpecification<TEntity>
{
    private readonly ISpecification<TEntity> _first;
    private readonly ISpecification<TEntity> _second;

    public AndSpecification(ISpecification<TEntity> first, ISpecification<TEntity> second)
    {
        _first = first;
        _second = second;
    }

    public Expression<Func<TEntity, bool>> ToExpression()
    {
        var firstExpression = _first.ToExpression();
        var secondExpression = _second.ToExpression();

        var parameter = Expression.Parameter(typeof(TEntity));
        var combinedBody = Expression.AndAlso(
            Expression.Invoke(firstExpression, parameter),
            Expression.Invoke(secondExpression, parameter)
        );

        return Expression.Lambda<Func<TEntity, bool>>(combinedBody, parameter);
    }
}
```

### Преимущества использования паттерна Specification

1. **Чистота кода:** Логика фильтрации и запросов изолирована от репозитория и бизнес-слоя, что упрощает тестирование и поддержку.
2. **Гибкость:** Легко изменять и комбинировать различные спецификации, что позволяет динамически изменять логику фильтрации.
3. **Читаемость:** Код становится более читаемым и понятным, так как специфическая логика вынесена в отдельные классы.

### Заключение

Паттерн **Specification** позволяет гибко и чисто работать с фильтрацией и запросами в базе данных, не передавая логику фильтрации напрямую в репозиторий. Он инкапсулирует критерии запросов в отдельных классах и позволяет комбинировать их с помощью логических операций. Это помогает повысить читаемость и тестируемость кода, следуя принципам **Clean Architecture** и **DDD**.