## Проблема

**По умолчанию EF выполняет JOIN'ы** для связанных данных, что создает **декартово произведение** и дублирование.

```csharp
// Один запрос с JOIN - ПЛОХО для коллекций
var blogs = context.Blogs
    .Include(b => b.Posts)
    .ThenInclude(p => p.Comments)
    .ToList();
```

**Результат SQL:**

```sql
SELECT b.*, p.*, c.*
FROM Blogs b
LEFT JOIN Posts p ON b.Id = p.BlogId  
LEFT JOIN Comments c ON p.Id = c.PostId
```

**Проблемы:**

- Огромный объем данных (дублирование blog/post для каждого comment)
- Медленная передача по сети
- Высокое потребление памяти

## Решение: Split Query

**Split Query разбивает запрос** на несколько отдельных SQL-команд.

```csharp
// Включить для конкретного запроса
var blogs = context.Blogs
    .AsSplitQuery()
    .Include(b => b.Posts)
    .ThenInclude(p => p.Comments)
    .ToList();
```

**Результат SQL:**

```sql
-- Запрос 1: Blogs + Posts
SELECT b.*, p.*
FROM Blogs b
LEFT JOIN Posts p ON b.Id = p.BlogId

-- Запрос 2: Comments
SELECT c.*
FROM Comments c
INNER JOIN Posts p ON c.PostId = p.Id
WHERE p.BlogId IN (1, 2, 3...)
```

## Глобальная настройка

```csharp
protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
{
    // Все Include запросы будут split по умолчанию
    optionsBuilder.UseSqlServer(connectionString)
                  .UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery);
}

// Отключить для конкретного запроса
var blogs = context.Blogs
    .AsSingleQuery() // Принудительно один запрос
    .Include(b => b.Posts)
    .ToList();
```

## Когда использовать

### ✅ Split Query хорош для:

```csharp
// Множественные коллекции
var authors = context.Authors
    .AsSplitQuery()
    .Include(a => a.Books)     // 1:N
    .Include(a => a.Articles)  // 1:N  
    .ToList(); // Избегаем декартово произведение

// Глубокая вложенность
var blogs = context.Blogs
    .AsSplitQuery()
    .Include(b => b.Posts)
        .ThenInclude(p => p.Comments)
            .ThenInclude(c => c.Replies)
    .ToList();
```

### ❌ Single Query лучше для:

```csharp
// Простые 1:1 отношения
var user = context.Users
    .AsSingleQuery()
    .Include(u => u.Profile) // 1:1
    .FirstOrDefault();

// Небольшие коллекции
var blog = context.Blogs
    .AsSingleQuery()
    .Include(b => b.Tags) // Мало тегов
    .FirstOrDefault();
```

## Практический пример

```csharp
public class BlogService
{
    // Для больших коллекций - split
    public async Task<List<Blog>> GetBlogsWithContentAsync()
    {
        return await _context.Blogs
            .AsSplitQuery()
            .Include(b => b.Posts)
                .ThenInclude(p => p.Comments)
            .Include(b => b.Tags)
            .ToListAsync();
    }

    // Для простых запросов - single
    public async Task<Blog> GetBlogWithAuthorAsync(int id)
    {
        return await _context.Blogs
            .AsSingleQuery()
            .Include(b => b.Author) // 1:1
            .FirstOrDefaultAsync(b => b.Id == id);
    }
}
```

## Сравнение производительности

|Сценарий|Single Query|Split Query|
|---|---|---|
|**1:1 отношения**|✅ Лучше|❌ Избыточно|
|**Небольшие коллекции**|✅ Один round-trip|❌ Больше запросов|
|**Большие коллекции**|❌ Декартово произведение|✅ Меньше данных|
|**Множественные Include**|❌ Огромный JOIN|✅ Оптимально|
|**Медленная сеть**|❌ Большой объем|✅ Меньше трафика|

## Ключевые моменты

- **Split Query** = меньше данных, больше round-trips
- **Single Query** = больше данных, меньше round-trips
- **По умолчанию** EF использует Single Query
- **Автоматически не оптимизирует** - нужно явно указывать
- **Транзакционность**: Split Query может видеть изменения между запросами

**Правило:** Split для коллекций, Single для простых отношений.