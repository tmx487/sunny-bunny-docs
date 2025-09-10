**DbContext (контекст базы данных)** — это центральный компонент Entity Framework, который представляет сеанс взаимодействия с базой данных и служит основным интерфейсом для доступа к данным и управления ими.

## Что такое DbContext

### 1. Основное назначение

DbContext — это класс, представляющий:

- **Сессию работы с базой данных** — группирует операции в логический "сеанс"
- **Unit of Work** — отслеживает все изменения и применяет их как единое целое
- **Репозиторий** — предоставляет доступ к коллекциям сущностей через свойства DbSet

Упрощенно говоря, это контейнер, в котором хранятся и отслеживаются сущности, загруженные из базы данных или готовящиеся к сохранению в ней.

### 2. Основные компоненты DbContext

- **DbSet\<T>** — коллекции сущностей определенного типа, отображаемые на таблицы
- **ChangeTracker** — механизм отслеживания изменений сущностей
- **Model** — метаданные о модели данных (сущностях, их свойствах и связях)
- **Database** — доступ к низкоуровневой функциональности базы данных

## Жизненный цикл DbContext

### 1. Создание контекста

```csharp
// Явное создание контекста
using (var context = new AppDbContext())
{
    // Работа с контекстом
}

// Или через внедрение зависимостей (DI)
public class CustomerService
{
    private readonly AppDbContext _context;

    public CustomerService(AppDbContext context)
    {
        _context = context;
    }
}
```

### 2. Работа с контекстом

- **Запросы к базе данных** через DbSet\<T>
- **Модификация сущностей** (добавление, изменение, удаление)
- **Отслеживание изменений** автоматическое или явное
- **Сохранение изменений** через SaveChanges()

### 3. Освобождение ресурсов

- Контекст реализует интерфейс IDisposable
- Важно освобождать ресурсы после использования (с помощью using или явного вызова Dispose())

## Основные операции DbContext

### 1. Запросы к базе данных

```csharp
// Получение коллекции
var customers = context.Customers.ToList();

// Запрос с фильтрацией
var activeCustomers = context.Customers
    .Where(c => c.Status == CustomerStatus.Active)
    .ToList();

// Получение одной сущности
var customer = context.Customers.Find(1); // По первичному ключу
var firstCustomer = context.Customers.FirstOrDefault(c => c.Email == "email@example.com");
```

### 2. Создание сущностей

```csharp
// Создание и добавление в контекст
var newCustomer = new Customer { Name = "Иван", Email = "ivan@example.com" };
context.Customers.Add(newCustomer);

// Можно добавить сразу диапазон сущностей
context.Customers.AddRange(customersList);
```

### 3. Изменение сущностей

```csharp
// Изменение загруженной сущности
var customer = context.Customers.Find(1);
customer.Name = "Новое имя";
// Изменения автоматически отслеживаются

// Явное указание сущности как измененной (для отсоединенных сущностей)
context.Entry(customer).State = EntityState.Modified;
```

### 4. Удаление сущностей

```csharp
// Удаление загруженной сущности
var customer = context.Customers.Find(1);
context.Customers.Remove(customer);

// Удаление по ID без предварительной загрузки
context.Customers.Remove(new Customer { Id = 1 });
```

### 5. Сохранение изменений

```csharp
// Сохранение всех отслеживаемых изменений в базе данных
int affectedRows = context.SaveChanges();

// В EF Core доступен асинхронный вариант
await context.SaveChangesAsync();
```

## Внутреннее устройство DbContext

### 1. Отслеживание сущностей

- **_entitySets** — словарь, содержащий все DbSet свойства контекста
- **_stateManager** — хранит состояния и снепшоты всех отслеживаемых сущностей
- **_entityEntries** — кэш для быстрого доступа к записям сущностей

### 2. Работа с отсоединенными сущностями

```csharp
// Присоединение отсоединенной сущности к контексту
context.Customers.Attach(customer); // В статусе Unchanged

// Обновление всей сущности
context.Entry(customer).State = EntityState.Modified;

// Обновление только определенных свойств
context.Entry(customer).Property(c => c.Name).IsModified = true;
```

### 3. Работа со связанными сущностями

```csharp
// Загрузка связанных сущностей
var order = context.Orders.Find(1);
context.Entry(order).Reference(o => o.Customer).Load(); // Загрузка свойства-ссылки
context.Entry(customer).Collection(c => c.Orders).Load(); // Загрузка коллекции
```

## Расширенные возможности

### 1. Настройка модели

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Customer>()
        .HasKey(c => c.Id);
        
    modelBuilder.Entity<Order>()
        .HasOne(o => o.Customer)
        .WithMany(c => c.Orders)
        .HasForeignKey(o => o.CustomerId);
}
```

### 2. Управление транзакциями

```csharp
using (var transaction = context.Database.BeginTransaction())
{
    try
    {
        // Операции с данными
        context.SaveChanges();
        transaction.Commit();
    }
    catch
    {
        transaction.Rollback();
        throw;
    }
}
```

читай про явные транзакции в заметке [[Для чего нужны явные транзакции в EF Core]]
### 3. Журналирование и отладка

```csharp
// В EF Core
context.Database.Log = message => Debug.WriteLine(message);

// Или для более детального логирования через ILoggerFactory
```

## Управление производительностью

### 1. Оптимизация запросов

- **IQueryable vs IEnumerable** — правильное формирование запросов
- **Проекция** — загрузка только необходимых данных
- **Отключение отслеживания** — для запросов только для чтения

### 2. Управление размером контекста

- Короткие жизненные циклы контекста предпочтительнее
- Очистка контекста при долгоживущих инстансах
- Использование контекста только для части модели (при необходимости)

DbContext — это значительно больше, чем просто контейнер для сущностей. Это полноценный инструмент управления состоянием объектов и их синхронизации с базой данных, реализующий архитектурные паттерны Unit of Work и Repository и обеспечивающий согласованное взаимодействие с базой данных.