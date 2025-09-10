В **DDD (Domain-Driven Design)** агрегат — это совокупность объектов, которые логически связаны друг с другом и должны поддерживать согласованность. Агрегат является единицей изменения и сохранения в системе.

---

### Ключевые особенности агрегата

1. **Корневой объект (Aggregate Root)**:
   - Один из объектов в агрегате является корнем (root) и управляет всей остальной частью агрегата.
   - К корню агрегата обращаются извне, а дочерние объекты защищены от прямого доступа.

2. **Гарантия согласованности**:
   - Агрегат отвечает за соблюдение всех бизнес-правил и инвариантов внутри себя.

3. **Единица транзакции**:
   - Все изменения в пределах агрегата должны быть завершены атомарно (либо всё, либо ничего).

4. **Целостность данных**:
   - Объекты внутри агрегата напрямую связаны только через корневой объект.

---

### Примеры агрегатов

#### 1. **Агрегат: Заказ (Order)**

Корневой объект: `Order`.

Взаимосвязанные объекты:
- `Order` (корень).
- `OrderItem` (позиция заказа).

```csharp
public class Order
{
    public Guid Id { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public List<OrderItem> Items { get; private set; } = new();

    public Order()
    {
        Id = Guid.NewGuid();
        CreatedAt = DateTime.UtcNow;
    }

    public void AddItem(OrderItem item)
    {
        if (item == null)
            throw new ArgumentNullException(nameof(item));

        Items.Add(item);
    }

    public void RemoveItem(Guid itemId)
    {
        var item = Items.SingleOrDefault(i => i.Id == itemId);
        if (item == null)
            throw new ArgumentException("Item not found.");

        Items.Remove(item);
    }
}

public class OrderItem
{
    public Guid Id { get; private set; }
    public string ProductName { get; private set; }
    public int Quantity { get; private set; }
    public decimal Price { get; private set; }

    public OrderItem(string productName, int quantity, decimal price)
    {
        if (quantity <= 0)
            throw new ArgumentException("Quantity must be greater than zero.");

        if (price <= 0)
            throw new ArgumentException("Price must be greater than zero.");

        Id = Guid.NewGuid();
        ProductName = productName;
        Quantity = quantity;
        Price = price;
    }
}
```

Инварианты:
- Сумма заказа всегда должна соответствовать сумме всех позиций.
- Количество товара (`Quantity`) в `OrderItem` должно быть больше нуля.

---

#### 2. **Агрегат: Пользователь (User)**

Корневой объект: `User`.

Взаимосвязанные объекты:
- `User` (корень).
- `Address` (адрес пользователя).
- `Role` (роль пользователя).

```csharp
public class User
{
    public Guid Id { get; private set; }
    public string Name { get; private set; }
    public string Email { get; private set; }
    public List<Address> Addresses { get; private set; } = new();
    public List<Role> Roles { get; private set; } = new();

    public User(string name, string email)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name cannot be empty.");

        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("Email cannot be empty.");

        Id = Guid.NewGuid();
        Name = name;
        Email = email;
    }

    public void AddAddress(Address address)
    {
        if (address == null)
            throw new ArgumentNullException(nameof(address));

        Addresses.Add(address);
    }

    public void AssignRole(Role role)
    {
        if (role == null)
            throw new ArgumentNullException(nameof(role));

        if (Roles.Any(r => r.Name == role.Name))
            throw new InvalidOperationException($"Role {role.Name} is already assigned.");

        Roles.Add(role);
    }
}

public class Address
{
    public string Street { get; private set; }
    public string City { get; private set; }
    public string Country { get; private set; }

    public Address(string street, string city, string country)
    {
        Street = street;
        City = city;
        Country = country;
    }
}

public class Role
{
    public string Name { get; private set; }

    public Role(string name)
    {
        Name = name;
    }
}
```

Инварианты:
- У пользователя не может быть два одинаковых адреса.
- Каждая роль должна быть уникальной.

---

#### 3. **Агрегат: Учебный предмет (Subject)**

Корневой объект: `Subject`.

Взаимосвязанные объекты:
- `Subject` (корень).
- `Module` (модуль предмета).

```csharp
public class Subject
{
    public Guid Id { get; private set; }
    public string Name { get; private set; }
    public List<Module> Modules { get; private set; } = new();

    public Subject(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name cannot be empty.");

        Id = Guid.NewGuid();
        Name = name;
    }

    public void AddModule(Module module)
    {
        if (module == null)
            throw new ArgumentNullException(nameof(module));

        Modules.Add(module);
    }
}

public class Module
{
    public Guid Id { get; private set; }
    public string Title { get; private set; }

    public Module(string title)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Title cannot be empty.");

        Id = Guid.NewGuid();
        Title = title;
    }
}
```

Инварианты:
- Название предмета (`Name`) не может быть пустым.
- Название модуля (`Title`) должно быть уникальным для данного предмета.

---

### Как агрегаты взаимодействуют?

В DDD агрегаты обычно связаны через их идентификаторы, а не напрямую. Это позволяет избежать сложных зависимостей и контролировать консистентность каждого агрегата изолированно.

Пример взаимодействия:
- Заказ (`Order`) хранит только `ProductId` для каждого товара, а не сам объект `Product`.
- Если нужно получить подробности о товаре, запрос идет через соответствующий сервис или репозиторий.

---