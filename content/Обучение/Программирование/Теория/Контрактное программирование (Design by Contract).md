**Контрактное программирование** — это методология проектирования ПО, при которой поведение программных компонентов описывается точными и формально проверяемыми спецификациями (**контрактами**).
## Основная идея

Каждый метод/класс имеет **контракт** — формальное соглашение о том:

- **Что требуется** для корректной работы (предусловия)
- **Что гарантируется** после выполнения (постусловия)
- **Что остается неизменным** в течение жизни объекта (инварианты)

## История и создатель

Концепцию разработал **Бертран Мейер** в конце 1980-х годов для языка Eiffel. Он написал классическую книгу **"Object-Oriented Software Construction"**, где детально описал эту методологию.

## Три типа контрактов

### 1. Предусловия (Preconditions)

**"Что клиент должен обеспечить перед вызовом метода"**

```cs
public class BankAccount
{
    private decimal _balance;
    
    public void Withdraw(decimal amount)
    {
        // ПРЕДУСЛОВИЯ:
        // 1. Сумма должна быть положительной
        // 2. Сумма не должна превышать баланс
        Contract.Requires(amount > 0, "Amount must be positive");
        Contract.Requires(amount <= _balance, "Insufficient funds");
        
        _balance -= amount;
    }
}

// Без библиотеки Code Contracts - обычные проверки
public void Withdraw(decimal amount)
{
    // Предусловия через обычный код
    if (amount <= 0)
        throw new ArgumentException("Amount must be positive");
    if (amount > _balance)
        throw new InvalidOperationException("Insufficient funds");
        
    _balance -= amount;
}
```

### 2. Постусловия (Postconditions)

**"Что метод гарантирует после выполнения"**

```cs
public class Calculator
{
    public int Add(int a, int b)
    {
        var result = a + b;
        
        // ПОСТУСЛОВИЕ: результат равен сумме входных параметров
        Contract.Ensures(Contract.Result<int>() == a + b);
        
        return result;
    }
    
    public int Divide(int dividend, int divisor)
    {
        // Предусловие
        Contract.Requires(divisor != 0, "Division by zero");
        
        var result = dividend / divisor;
        
        // ПОСТУСЛОВИЯ:
        // 1. Результат умноженный на делитель должен быть близок к делимому
        // 2. Результат должен быть в разумных пределах
        Contract.Ensures(Math.Abs((Contract.Result<int>() * divisor) - dividend) <= Math.Abs(divisor));
        
        return result;
    }
}

// Без Code Contracts - проверки в конце метода
public int Add(int a, int b)
{
    var result = a + b;
    
    // Постусловие через debug assert
    Debug.Assert(result == a + b, "Addition result is incorrect");
    
    return result;
}
```

### 3. Инварианты (Invariants)

**"Что должно оставаться истинным на протяжении всей жизни объекта"**

```cs
public class Rectangle
{
    private int _width;
    private int _height;
    
    public int Width 
    { 
        get => _width;
        set
        {
            _width = value;
            // После изменения проверяем инварианты
            CheckInvariants();
        }
    }
    
    public int Height 
    { 
        get => _height;
        set
        {
            _height = value;
            CheckInvariants();
        }
    }
    
    public int Area => Width * Height;
    
    // ИНВАРИАНТЫ класса Rectangle
    [ContractInvariantMethod]
    private void ObjectInvariant()
    {
        Contract.Invariant(_width >= 0, "Width must be non-negative");
        Contract.Invariant(_height >= 0, "Height must be non-negative");
        Contract.Invariant(Area == _width * _height, "Area must equal width * height");
    }
    
    // Альтернативно - без Code Contracts
    private void CheckInvariants()
    {
        Debug.Assert(_width >= 0, "Width must be non-negative");
        Debug.Assert(_height >= 0, "Height must be non-negative");
        Debug.Assert(Area == _width * _height, "Area calculation is wrong");
    }
}
```

## Контрактное программирование в C# (.NET)

### Microsoft Code Contracts (Legacy)

```cs
using System.Diagnostics.Contracts;

public class UserService
{
    private readonly List<User> _users = new();
    
    public void AddUser(User user)
    {
        // Предусловия
        Contract.Requires(user != null, "User cannot be null");
        Contract.Requires(!string.IsNullOrEmpty(user.Email), "Email is required");
        Contract.Requires(user.Age >= 0, "Age cannot be negative");
        
        // Постусловие - количество пользователей увеличилось на 1
        Contract.Ensures(_users.Count == Contract.OldValue(_users.Count) + 1);
        Contract.Ensures(_users.Contains(user), "User must be added to collection");
        
        _users.Add(user);
    }
    
    public User GetUserById(int id)
    {
        Contract.Requires(id > 0, "ID must be positive");
        Contract.Ensures(Contract.Result<User>() != null || !_users.Any(u => u.Id == id));
        
        return _users.FirstOrDefault(u => u.Id == id);
    }
    
    // Инварианты класса
    [ContractInvariantMethod]
    private void ObjectInvariant()
    {
        Contract.Invariant(_users != null, "Users collection cannot be null");
        Contract.Invariant(_users.All(u => u != null), "All users must be non-null");
        Contract.Invariant(_users.All(u => u.Id > 0), "All user IDs must be positive");
    }
}
```

### Современный подход - явные проверки

```cs
public class OrderService
{
    private readonly List<Order> _orders = new();
    
    public void CreateOrder(Customer customer, List<OrderItem> items)
    {
        // Явные предусловия
        EnsureNotNull(customer, nameof(customer));
        EnsureNotNullOrEmpty(items, nameof(items));
        EnsureAllItemsValid(items);
        
        var order = new Order(customer, items);
        var initialCount = _orders.Count;
        
        _orders.Add(order);
        
        // Явные постусловия
        EnsurePostCondition(_orders.Count == initialCount + 1, 
            "Order count should increase by 1");
        EnsurePostCondition(_orders.Contains(order), 
            "Order should be added to collection");
    }
    
    public decimal CalculateTotal(Order order)
    {
        EnsureNotNull(order, nameof(order));
        EnsureInvariant(order.Items.Any(), "Order must have items");
        
        var total = order.Items.Sum(item => item.Price * item.Quantity);
        
        EnsurePostCondition(total >= 0, "Total cannot be negative");
        
        return total;
    }
    
    // Вспомогательные методы для контрактов
    private static void EnsureNotNull<T>(T value, string paramName) where T : class
    {
        if (value == null)
            throw new ArgumentNullException(paramName);
    }
    
    private static void EnsureNotNullOrEmpty<T>(IEnumerable<T> collection, string paramName)
    {
        if (collection == null)
            throw new ArgumentNullException(paramName);
        if (!collection.Any())
            throw new ArgumentException("Collection cannot be empty", paramName);
    }
    
    private static void EnsureAllItemsValid(List<OrderItem> items)
    {
        foreach (var item in items)
        {
            if (item.Quantity <= 0)
                throw new ArgumentException("All items must have positive quantity");
            if (item.Price < 0)
                throw new ArgumentException("All items must have non-negative price");
        }
    }
    
    private static void EnsurePostCondition(bool condition, string message)
    {
        if (!condition)
            throw new InvalidOperationException($"Postcondition violated: {message}");
    }
    
    private static void EnsureInvariant(bool condition, string message)
    {
        if (!condition)
            throw new InvalidOperationException($"Invariant violated: {message}");
    }
}
```

## Продакшн пример: Система банковских переводов

```cs
public class BankAccount
{
    private decimal _balance;
    private readonly string _accountNumber;
    private readonly List<Transaction> _transactions = new();
    
    public decimal Balance => _balance;
    public string AccountNumber => _accountNumber;
    public IReadOnlyList<Transaction> Transactions => _transactions.AsReadOnly();
    
    public BankAccount(string accountNumber, decimal initialBalance = 0)
    {
        // Предусловия конструктора
        if (string.IsNullOrWhiteSpace(accountNumber))
            throw new ArgumentException("Account number is required");
        if (initialBalance < 0)
            throw new ArgumentException("Initial balance cannot be negative");
            
        _accountNumber = accountNumber;
        _balance = initialBalance;
        
        if (initialBalance > 0)
        {
            _transactions.Add(new Transaction("Initial Deposit", initialBalance, _balance));
        }
        
        // Проверяем инварианты после создания
        CheckInvariants();
    }
    
    public void Deposit(decimal amount, string description = "Deposit")
    {
        // ПРЕДУСЛОВИЯ
        if (amount <= 0)
            throw new ArgumentException("Deposit amount must be positive");
        if (string.IsNullOrWhiteSpace(description))
            throw new ArgumentException("Description is required");
            
        CheckInvariants(); // Проверяем инварианты до операции
        
        var oldBalance = _balance;
        var oldTransactionCount = _transactions.Count;
        
        _balance += amount;
        _transactions.Add(new Transaction(description, amount, _balance));
        
        // ПОСТУСЛОВИЯ
        if (_balance != oldBalance + amount)
            throw new InvalidOperationException("Balance was not updated correctly");
        if (_transactions.Count != oldTransactionCount + 1)
            throw new InvalidOperationException("Transaction was not recorded");
        if (_transactions.Last().NewBalance != _balance)
            throw new InvalidOperationException("Transaction balance is incorrect");
            
        CheckInvariants(); // Проверяем инварианты после операции
    }
    
    public void Withdraw(decimal amount, string description = "Withdrawal")
    {
        // ПРЕДУСЛОВИЯ
        if (amount <= 0)
            throw new ArgumentException("Withdrawal amount must be positive");
        if (amount > _balance)
            throw new InvalidOperationException("Insufficient funds");
        if (string.IsNullOrWhiteSpace(description))
            throw new ArgumentException("Description is required");
            
        CheckInvariants();
        
        var oldBalance = _balance;
        var oldTransactionCount = _transactions.Count;
        
        _balance -= amount;
        _transactions.Add(new Transaction(description, -amount, _balance));
        
        // ПОСТУСЛОВИЯ
        if (_balance != oldBalance - amount)
            throw new InvalidOperationException("Balance was not updated correctly");
        if (_transactions.Count != oldTransactionCount + 1)
            throw new InvalidOperationException("Transaction was not recorded");
        if (_balance < 0)
            throw new InvalidOperationException("Balance cannot be negative after withdrawal");
            
        CheckInvariants();
    }
    
    public void Transfer(BankAccount targetAccount, decimal amount, string description = "Transfer")
    {
        // ПРЕДУСЛОВИЯ
        if (targetAccount == null)
            throw new ArgumentNullException(nameof(targetAccount));
        if (targetAccount == this)
            throw new ArgumentException("Cannot transfer to the same account");
        if (amount <= 0)
            throw new ArgumentException("Transfer amount must be positive");
        if (amount > _balance)
            throw new InvalidOperationException("Insufficient funds for transfer");
            
        CheckInvariants();
        targetAccount.CheckInvariants();
        
        var oldFromBalance = _balance;
        var oldToBalance = targetAccount._balance;
        var totalOldBalance = oldFromBalance + oldToBalance;
        
        // Атомарная операция
        this.Withdraw(amount, $"Transfer to {targetAccount.AccountNumber}: {description}");
        targetAccount.Deposit(amount, $"Transfer from {this.AccountNumber}: {description}");
        
        // ПОСТУСЛОВИЯ для перевода
        var totalNewBalance = _balance + targetAccount._balance;
        if (Math.Abs(totalNewBalance - totalOldBalance) > 0.01m)
            throw new InvalidOperationException("Total balance changed during transfer");
            
        CheckInvariants();
        targetAccount.CheckInvariants();
    }
    
    // ИНВАРИАНТЫ класса
    private void CheckInvariants()
    {
        // 1. Баланс не может быть отрицательным
        if (_balance < 0)
            throw new InvalidOperationException("Invariant violation: Balance cannot be negative");
            
        // 2. Номер счета не может быть пустым
        if (string.IsNullOrWhiteSpace(_accountNumber))
            throw new InvalidOperationException("Invariant violation: Account number cannot be empty");
            
        // 3. Список транзакций не может быть null
        if (_transactions == null)
            throw new InvalidOperationException("Invariant violation: Transactions list cannot be null");
            
        // 4. Последняя транзакция должна соответствовать текущему балансу
        if (_transactions.Any() && _transactions.Last().NewBalance != _balance)
            throw new InvalidOperationException("Invariant violation: Last transaction balance doesn't match current balance");
            
        // 5. Все транзакции должны быть последовательными
        for (int i = 1; i < _transactions.Count; i++)
        {
            var prev = _transactions[i - 1];
            var curr = _transactions[i];
            var expectedBalance = prev.NewBalance + curr.Amount;
            
            if (Math.Abs(curr.NewBalance - expectedBalance) > 0.01m)
                throw new InvalidOperationException($"Invariant violation: Transaction {i} has incorrect balance");
        }
    }
}

public record Transaction(string Description, decimal Amount, decimal NewBalance)
{
    public DateTime Timestamp { get; } = DateTime.UtcNow;
}
```

## Тестирование контрактов

```cs
[TestClass]
public class BankAccountContractTests
{
    [TestMethod]
    public void Deposit_WithValidAmount_ShouldSatisfyContract()
    {
        // Arrange
        var account = new BankAccount("12345", 100);
        var initialBalance = account.Balance;
        var initialTransactionCount = account.Transactions.Count;
        
        // Act
        account.Deposit(50, "Test deposit");
        
        // Assert - проверяем постусловия
        Assert.AreEqual(initialBalance + 50, account.Balance);
        Assert.AreEqual(initialTransactionCount + 1, account.Transactions.Count);
        Assert.AreEqual(account.Balance, account.Transactions.Last().NewBalance);
    }
    
    [TestMethod]
    [ExpectedException(typeof(ArgumentException))]
    public void Deposit_WithNegativeAmount_ShouldViolatePrecondition()
    {
        // Arrange
        var account = new BankAccount("12345", 100);
        
        // Act & Assert - нарушение предусловия
        account.Deposit(-10, "Invalid deposit");
    }
    
    [TestMethod]
    public void Transfer_BetweenAccounts_ShouldPreserveTotalBalance()
    {
        // Arrange
        var account1 = new BankAccount("12345", 1000);
        var account2 = new BankAccount("67890", 500);
        var totalInitialBalance = account1.Balance + account2.Balance;
        
        // Act
        account1.Transfer(account2, 200, "Test transfer");
        
        // Assert - постусловие: общий баланс должен сохраниться
        var totalFinalBalance = account1.Balance + account2.Balance;
        Assert.AreEqual(totalInitialBalance, totalFinalBalance);
        Assert.AreEqual(800, account1.Balance);
        Assert.AreEqual(700, account2.Balance);
    }
}
```

## Преимущества контрактного программирования

### 1. **Документация в коде**

```cs
public void ProcessPayment(decimal amount, PaymentMethod method)
{
    // Контракт служит живой документацией
    Contract.Requires(amount > 0, "Amount must be positive");
    Contract.Requires(amount <= 10000, "Amount cannot exceed $10,000");
    Contract.Requires(method != null, "Payment method is required");
    Contract.Ensures(Contract.Result<PaymentResult>().IsProcessed);
    
    // Любой программист понимает требования без чтения реализации
}
```

### 2. **Раннее обнаружение ошибок**

```cs
public class Stack<T>
{
    private readonly T[] _items;
    private int _count;
    
    public void Push(T item)
    {
        Contract.Requires(item != null, "Cannot push null item");
        Contract.Ensures(_count == Contract.OldValue(_count) + 1);
        
        // Ошибка будет обнаружена сразу при нарушении контракта
        _items[_count++] = item;
    }
    
    public T Pop()
    {
        Contract.Requires(_count > 0, "Cannot pop from empty stack");
        Contract.Ensures(Contract.Result<T>() != null);
        Contract.Ensures(_count == Contract.OldValue(_count) - 1);
        
        return _items[--_count];
    }
}
```

### 3. **Безопасность при рефакторинге**

```cs
public class OrderCalculator
{
    public decimal CalculateDiscount(Order order, Customer customer)
    {
        // Контракты защищают от случайных изменений логики
        Contract.Requires(order != null);
        Contract.Requires(customer != null);
        Contract.Requires(order.TotalAmount > 0);
        Contract.Ensures(Contract.Result<decimal>() >= 0);
        Contract.Ensures(Contract.Result<decimal>() <= order.TotalAmount);
        
        // При рефакторинге нельзя нарушить контракт
        var discount = CalculateDiscountInternal(order, customer);
        return discount;
    }
}
```

## Недостатки и ограничения

### 1. **Производительность**

```cs
// Контракты проверяются в runtime - накладные расходы
public void ExpensiveMethod(int[] data)
{
    Contract.Requires(data != null);
    Contract.Requires(data.Length > 0);
    Contract.Requires(data.All(x => x >= 0)); // Дорогая проверка!
    
    // В production можно отключить проверки
}
```

### 2. **Сложность написания**

```cs
// Некоторые контракты трудно выразить формально
public class Graph
{
    public void AddEdge(int from, int to)
    {
        // Как проверить, что граф остается ациклическим?
        Contract.Requires(from >= 0 && to >= 0);
        // Contract.Ensures(?); // Сложно выразить отсутствие циклов
    }
}
```

## Альтернативы в современном C#

### Nullable Reference Types (C# 8+)

```cs
// Компилятор помогает с null-безопасностью
public void ProcessUser(User user) // user не может быть null
{
    // Не нужен Contract.Requires(user != null);
    Console.WriteLine(user.Name); // Безопасно
}

public User? FindUser(int id) // Может вернуть null
{
    // Компилятор заставит проверить результат
    return users.FirstOrDefault(u => u.Id == id);
}
```

### Методы Guard

```cs
public static class Guard
{
    public static void NotNull<T>(T value, string paramName) where T : class
    {
        if (value == null)
            throw new ArgumentNullException(paramName);
    }
    
    public static void Positive(decimal value, string paramName)
    {
        if (value <= 0)
            throw new ArgumentException($"{paramName} must be positive", paramName);
    }
    
    public static void InRange(int value, int min, int max, string paramName)
    {
        if (value < min || value > max)
            throw new ArgumentOutOfRangeException(paramName, $"Value must be between {min} and {max}");
    }
}

// Использование
public void Transfer(BankAccount account, decimal amount)
{
    Guard.NotNull(account, nameof(account));
    Guard.Positive(amount, nameof(amount));
    
    // Остальная логика
}
```

## Заключение

**Контрактное программирование** — это мощная методология, которая делает код:

- **Более надежным** (ошибки обнаруживаются рано)
- **Лучше документированным** (контракты = живая документация)
- **Проще в сопровождении** (ясные ожидания от каждого компонента)

В C# можно применять как через специальные библиотеки (Code Contracts), так и через явные проверки и современные возможности языка (nullable reference types, guard clauses).

**Ключевое правило:** контракты должны проверяться в местах пересечения границ ответственности — на входах в публичные методы, при передаче данных между модулями, в критических точках бизнес-логики.