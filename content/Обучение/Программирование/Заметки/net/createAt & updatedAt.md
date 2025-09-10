Для того чтобы создать свойства `CreatedAt` и `UpdatedAt` в классе, который будет использоваться с PostgreSQL через Entity Framework, можно сделать это следующим образом:

### 1. **Добавление свойств в класс сущности**

Просто добавь два свойства в класс сущности, которые будут хранить дату и время создания и последнего обновления объекта:

```csharp
public class YourEntity
{
    public int Id { get; set; }
    
    public string Name { get; set; }
    
    public DateTime CreatedAt { get; set; }
    
    public DateTime UpdatedAt { get; set; }
}
```

### 2. **Автоматическая установка значений при создании и обновлении**

Чтобы значения `CreatedAt` и `UpdatedAt` автоматически присваивались при сохранении сущности в базу данных, можно использовать метод `SaveChanges` в `DbContext`. Для этого переопределим метод `SaveChanges` в классе `DbContext`:

```csharp
public class YourDbContext : DbContext
{
    public DbSet<YourEntity> YourEntities { get; set; }

    public override int SaveChanges()
    {
        var entities = ChangeTracker.Entries()
            .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified);

        foreach (var entity in entities)
        {
            if (entity.State == EntityState.Added)
            {
                entity.Property("CreatedAt").CurrentValue = DateTime.UtcNow;
            }

            if (entity.State == EntityState.Modified)
            {
                entity.Property("UpdatedAt").CurrentValue = DateTime.UtcNow;
            }
        }

        return base.SaveChanges();
    }
}
```

### 3. **Миграции в PostgreSQL**

Теперь нужно создать миграцию, чтобы добавить эти поля в базу данных. В терминале (в каталоге проекта) выполните команду:

```sh
dotnet ef migrations add AddCreatedAtAndUpdatedAt
```

Затем выполните команду для применения миграции:

```sh
dotnet ef database update
```

Это создаст поля `CreatedAt` и `UpdatedAt` в таблице для вашей сущности.

### 4. **Настройка в базе данных**

Если вы хотите, чтобы поля `CreatedAt` и `UpdatedAt` в PostgreSQL автоматически обновлялись (например, `UpdatedAt` — при изменении строки), вы можете использовать **триггеры** в PostgreSQL. Однако, с использованием Entity Framework это можно сделать через код, как показано выше.

### 5. **Использование на уровне запросов**

Если вы хотите, чтобы при выполнении запросов к базе данных значения этих полей корректно учитывались, можно использовать атрибуты или настроить через Fluent API.

```csharp
public class YourDbContext : DbContext
{
    public DbSet<YourEntity> YourEntities { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<YourEntity>()
            .Property(e => e.CreatedAt)
            .HasDefaultValueSql("CURRENT_TIMESTAMP");

        modelBuilder.Entity<YourEntity>()
            .Property(e => e.UpdatedAt)
            .HasDefaultValueSql("CURRENT_TIMESTAMP");
    }
}
```

### Итог:

- `CreatedAt` — задается один раз при добавлении новой записи.
- `UpdatedAt` — обновляется каждый раз при изменении сущности.

Эти подходы позволяют автоматически отслеживать время создания и последнего изменения записи, что может быть полезно для аудита или контроля версий.