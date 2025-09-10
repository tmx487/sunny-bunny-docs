
## Query Filters

**Автоматические фильтры на уровне модели** - добавляют WHERE ко всем SELECT запросам.

```csharp
// Настройка в OnModelCreating
modelBuilder.Entity<User>().HasQueryFilter(u => !u.IsDeleted);

// Использование
var users = await context.Users.ToListAsync(); // автоматически WHERE IsDeleted = false
var all = await context.Users.IgnoreQueryFilters().ToListAsync(); // все записи
```

**Плюсы:** Простота, автоматическая фильтрация  
**Минусы:** Только для SELECT, сложно с составными условиями

## Interceptors

**Перехватчики операций EF** - позволяют вмешиваться в процесс сохранения.

```csharp
public class SoftDeleteInterceptor : SaveChangesInterceptor
{
    public override InterceptionResult<int> SavingChanges(DbContextEventData eventData, InterceptionResult<int> result)
    {
        var deleted = eventData.Context.ChangeTracker.Entries()
            .Where(e => e.State == EntityState.Deleted && e.Entity is ISoftDeletable);

        foreach (var entry in deleted)
        {
            entry.State = EntityState.Modified;
            ((ISoftDeletable)entry.Entity).IsDeleted = true;
        }
        return base.SavingChanges(eventData, result);
    }
}
```

**Плюсы:** Полный контроль, работа с любыми операциями  
**Минусы:** Сложнее, больше кода

## Сравнение

| |Query Filters|Interceptors|
|---|---|---|
|**Область**|Только SELECT|Все операции|
|**Сложность**|Простые|Сложнее|
|**Автоматизм**|Высокий|Средний|
|**Гибкость**|Ограниченная|Максимальная|

## Рекомендация

**Используйте оба:**

- **Query Filters** - для автофильтрации в запросах
- **Interceptors** - для перехвата операций удаления

```csharp
// В OnModelCreating
modelBuilder.Entity<User>().HasQueryFilter(u => !u.IsDeleted);

// В OnConfiguring
optionsBuilder.AddInterceptors(new SoftDeleteInterceptor());
```

Это обеспечивает полное покрытие: автоматическую фильтрацию + корректную обработку delete операций.