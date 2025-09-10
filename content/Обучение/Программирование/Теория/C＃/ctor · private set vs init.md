## `{ get; private set; }` - Изменяемое изнутри класса

```cs
public class BankAccount
{
    public string AccountNumber { get; private set; }
    public decimal Balance { get; private set; }
    
    public BankAccount(string accountNumber)
    {
        AccountNumber = accountNumber; // ✅ Можно в конструкторе
        Balance = 0;
    }
    
    public void UpdateAccountNumber(string newNumber)
    {
        // ✅ Можно изменить в любом методе класса
        AccountNumber = newNumber;
    }
    
    public void Deposit(decimal amount)
    {
        // ✅ Можно изменить в любое время
        Balance += amount;
    }
}

// Использование:
var account = new BankAccount("123456");
account.Deposit(100); // Balance изменился на 100
// account.AccountNumber = "999"; // ❌ Ошибка - private set
```

## `{ get; init; }` - Устанавливается ТОЛЬКО при создании

```cs
public class Person
{
    public string Name { get; init; }
    public DateTime BirthDate { get; init; }
    public string SocialSecurityNumber { get; init; }
    
    // После создания объекта эти свойства НИКОГДА не изменятся
    public int Age => DateTime.Now.Year - BirthDate.Year;
    
    // Нет конструктора - свойства устанавливаются через инициализатор
}

// Использование:
var person = new Person 
{ 
    Name = "John", 
    BirthDate = new DateTime(1990, 1, 1),
    SocialSecurityNumber = "123-45-6789"
};

// ❌ НЕЛЬЗЯ изменить после создания - даже внутри класса!
// person.Name = "Jane"; // Ошибка компиляции
```

## Ключевые различия

### 1. **Время изменения**

```cs
// private set - можно менять всю жизнь объекта
public class MutableUser
{
    public string Email { get; private set; }
    
    public void ChangeEmail(string newEmail)
    {
        Email = newEmail; // ✅ Работает в любое время
    }
}

// init - только при создании
public class ImmutableUser
{
    public string Email { get; init; }
    
    public void ChangeEmail(string newEmail)
    {
        Email = newEmail; // ❌ ОШИБКА КОМПИЛЯЦИИ!
    }
}
```

### 2. **Паттерны использования**

```cs
// private set - для изменяемых объектов с контролируемым состоянием
public class Order
{
    public int Id { get; private set; }
    public OrderStatus Status { get; private set; } = OrderStatus.Draft;
    public DateTime CreatedAt { get; private set; } = DateTime.UtcNow;
    
    public void Confirm()
    {
        Status = OrderStatus.Confirmed; // ✅ Меняем состояние
    }
    
    public void Ship()
    {
        Status = OrderStatus.Shipped; // ✅ Меняем состояние
    }
}

// init - для неизменяемых объектов (Value Objects)
public class Money
{
    public decimal Amount { get; init; }
    public string Currency { get; init; }
    
    // Вместо мутации создаем новый объект
    public Money Add(Money other)
    {
        return new Money 
        { 
            Amount = this.Amount + other.Amount, 
            Currency = this.Currency 
        };
    }
}
```

### 3. **Безопасность потоков**

```cs
// private set - требует синхронизации для потокобезопасности
public class Counter
{
    private readonly object _lock = new();
    public int Value { get; private set; }
    
    public void Increment()
    {
        lock (_lock)
        {
            Value++; // Нужна блокировка для безопасности
        }
    }
}

// init - автоматически потокобезопасен (неизменяемый)
public class Snapshot
{
    public int Value { get; init; }
    public DateTime Timestamp { get; init; }
    
    // Никаких блокировок не нужно - объект не меняется
}
```

## Практические сценарии использования

### Используйте `{ get; private set; }` когда:

```cs
// 1. Объект меняет состояние в процессе жизни
public class GamePlayer
{
    public string Name { get; init; } // Имя не меняется
    public int Score { get; private set; } // Счет меняется
    public int Level { get; private set; } = 1; // Уровень растет
    
    public void AddScore(int points)
    {
        Score += points;
        
        // Повышение уровня при достижении порога
        if (Score >= Level * 1000)
        {
            Level++;
        }
    }
}

// 2. Управление жизненным циклом
public class DatabaseConnection
{
    public string ConnectionString { get; init; }
    public ConnectionState State { get; private set; } = ConnectionState.Closed;
    
    public void Open()
    {
        // Логика подключения
        State = ConnectionState.Open;
    }
    
    public void Close()
    {
        // Логика закрытия
        State = ConnectionState.Closed;
    }
}
```

### Используйте `{ get; init; }` когда:

```cs
// 1. Value Objects - объекты-значения
public class Address
{
    public string Street { get; init; }
    public string City { get; init; }
    public string PostalCode { get; init; }
    public string Country { get; init; }
    
    // Для изменения создаем новый объект
    public Address WithStreet(string newStreet)
    {
        return this with { Street = newStreet }; // C# 10 with expression
    }
}

// 2. Configuration объекты
public class DatabaseConfig
{
    public string Host { get; init; }
    public int Port { get; init; }
    public string Database { get; init; }
    public bool UseSSL { get; init; }
    
    // Конфигурация не должна меняться после создания
}

// 3. Events/Messages
public class OrderCreatedEvent
{
    public int OrderId { get; init; }
    public int CustomerId { get; init; }
    public DateTime Timestamp { get; init; }
    public decimal Amount { get; init; }
    
    // События неизменяемы по природе
}
```

## Комбинирование подходов

```cs
public class User
{
    // Неизменяемая идентификация
    public int Id { get; init; }
    public string Email { get; init; }
    
    // Изменяемое состояние
    public string DisplayName { get; private set; }
    public DateTime LastLoginAt { get; private set; }
    public bool IsActive { get; private set; } = true;
    
    public void UpdateDisplayName(string newName)
    {
        if (string.IsNullOrWhiteSpace(newName))
            throw new ArgumentException("Display name cannot be empty");
            
        DisplayName = newName;
    }
    
    public void RecordLogin()
    {
        LastLoginAt = DateTime.UtcNow;
    }
    
    public void Deactivate()
    {
        IsActive = false;
    }
}

// Создание:
var user = new User 
{ 
    Id = 1, 
    Email = "user@example.com",
    DisplayName = "John Doe"
};

// user.Id = 2; // ❌ Нельзя - init только
user.UpdateDisplayName("Jane Doe"); // ✅ Можно - private set
```

## Резюме различий

|Аспект|`{ get; private set; }`|`{ get; init; }`|
|---|---|---|
|**Когда можно изменить**|В любое время внутри класса|Только при создании объекта|
|**Потокобезопасность**|Требует синхронизации|Автоматически безопасен|
|**Использование**|Изменяемые объекты с контролируемым состоянием|Неизменяемые объекты-значения|
|**Производительность**|Может требовать блокировок|Без накладных расходов|
|**Версия C#**|С самого начала|С версии 9.0|

**Правило выбора:** Если объект должен менять состояние - используйте `private set`. Если объект должен быть неизменяемым после создания - используйте `init`.