Принцип подстановки Лисков (англ. Liskov Substitution Principle, LSP) — принцип организации подтипов в объектно-ориентированном программировании:

> **"Объекты суперкласса должны быть заменяемы объектами подклассов без нарушения корректности программы"**

Более популярна интерпретация Роберта Мартина: функции, которые используют базовый тип, должны иметь возможность использовать подтипы базового типа, не зная об этом.

## Что означает LSP на практике

### ❌Простой пример нарушения

```cs
public abstract class Employee
    {
        public virtual string GetWorkDetails(int id)
        {
            return "Base Work";
        }

        public virtual string GetEmployeeDetails(int id)
        {
            return "Base Employee";
        }
    }

    public class SeniorEmployee : Employee
    {
        public override string GetWorkDetails(int id)
        {
            return "Senior Work";
        }

        public override string GetEmployeeDetails(int id)
        {
            return "Senior Employee";
        }
    }

    public class JuniorEmployee : Employee
    {
        // Допустим, для Junior’a отсутствует информация
        public override string GetWorkDetails(int id)
        {
            throw new NotImplementedException();        }

        
        public override string GetEmployeeDetails(int id)
        {
            return "Junior Employee";

        }
    }
    
// Использование
List<Employee> list = new List<Employee>();

list.Add(new JuniorEmployee());
list.Add(new SeniorEmployee());

foreach (Employee emp in list)
{
    emp.GetEmployeeDetails(985);
}
```

>Проблема: Для JuniorEmployee невозможно вернуть информацию о работе, поэтому вы получите необработанное исключение, что нарушит принцип LSP
## Контрактное программирование и LSP

Принцип подстановки (замещения) Лисков имеет близкое отношение к методологии контрактного программирования:

### 1. Предусловия не могут быть усилены

```cs
public class FileProcessor
{
    // Базовый контракт: принимает любой файл
    public virtual void ProcessFile(string filePath)
    {
        // Предусловие: файл должен существовать
        if (!File.Exists(filePath))
            throw new FileNotFoundException();
            
        // Обработка файла
        Console.WriteLine($"Processing file: {filePath}");
    }
}

public class ImageProcessor : FileProcessor
{
    // ❌ НАРУШЕНИЕ LSP - усиливаем предусловие
    public override void ProcessFile(string filePath)
    {
        // Усиленное предусловие: файл должен быть изображением
        if (!IsImageFile(filePath))
            throw new ArgumentException("File must be an image!");
            
        base.ProcessFile(filePath);
    }
    
    private bool IsImageFile(string filePath)
    {
        var extension = Path.GetExtension(filePath).ToLower();
        return extension is ".jpg" or ".png" or ".gif" or ".bmp";
    }
}

// Проблема в использовании
public void ProcessFiles(FileProcessor processor, string[] files)
{
    foreach (string file in files)
    {
        // Код ожидает, что любой существующий файл можно обработать
        processor.ProcessFile(file); // Упадет на ImageProcessor для .txt файла!
    }
}
```

### 2. Постусловия не могут быть ослаблены

```cs
public abstract class DataReader
{
    // Постусловие: метод всегда возвращает не-null данные или кидает исключение
    public abstract string ReadData(string source);
}

public class DatabaseReader : DataReader
{
    public override string ReadData(string connectionString)
    {
        if (string.IsNullOrEmpty(connectionString))
            throw new ArgumentException("Connection string required");
            
        // Всегда возвращаем данные или кидаем исключение
        return "Database data";
    }
}

public class CacheReader : DataReader
{
    // ❌ НАРУШЕНИЕ LSP - ослабляем постусловие
    public override string ReadData(string key)
    {
        // Возвращаем null если нет в кэше - нарушение контракта!
        return _cache.TryGetValue(key, out var value) ? value : null;
    }
    
    private readonly Dictionary<string, string> _cache = new();
}

// Проблема в использовании
public void ProcessData(DataReader reader, string source)
{
    var data = reader.ReadData(source);
    
    // Код не ожидает null - крэш!
    Console.WriteLine($"Data length: {data.Length}"); // NullReferenceException для CacheReader
}
```

### 3. Инварианты должны сохраняться

```cs
public class BankAccount
{
    protected decimal _balance;
    
    // Инвариант: баланс всегда >= 0
    public virtual decimal Balance => _balance;
    
    public virtual void Withdraw(decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentException("Amount must be positive");
            
        if (_balance < amount)
            throw new InvalidOperationException("Insufficient funds");
            
        _balance -= amount;
        
        // Инвариант сохраняется: _balance >= 0
    }
    
    public virtual void Deposit(decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentException("Amount must be positive");
            
        _balance += amount;
    }
}

public class CreditAccount : BankAccount
{
    private readonly decimal _creditLimit;
    
    public CreditAccount(decimal creditLimit)
    {
        _creditLimit = creditLimit;
    }
    
    // ❌ НАРУШЕНИЕ LSP - нарушаем инвариант базового класса
    public override void Withdraw(decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentException("Amount must be positive");
            
        // Разрешаем отрицательный баланс - нарушение инварианта!
        if (_balance - amount < -_creditLimit)
            throw new InvalidOperationException("Credit limit exceeded");
            
        _balance -= amount;
        // Теперь _balance может быть < 0!
    }
}

// Проблема в использовании
public void TransferFunds(BankAccount from, BankAccount to, decimal amount)
{
    from.Withdraw(amount);
    
    // Код ожидает, что баланс >= 0
    if (from.Balance < 0)
    {
        // Этого не должно происходить согласно контракту BankAccount!
        throw new InvalidOperationException("Account balance cannot be negative!");
    }
    
    to.Deposit(amount);
}
```

## Правильные решения для LSP

### 1. Исправление Rectangle/Square

```cs
// ✅ Правильное решение - разделение ответственностей
public abstract class Shape
{
    public abstract double Area { get; }
    public abstract void Draw();
}

public class Rectangle : Shape
{
    public int Width { get; }
    public int Height { get; }
    
    public Rectangle(int width, int height)
    {
        Width = width;
        Height = height;
    }
    
    public override double Area => Width * Height;
    
    public override void Draw()
    {
        Console.WriteLine($"Drawing rectangle {Width}x{Height}");
    }
    
    // Методы специфичные для прямоугольника
    public Rectangle ResizeWidth(int newWidth) => new Rectangle(newWidth, Height);
    public Rectangle ResizeHeight(int newHeight) => new Rectangle(Width, newHeight);
}

public class Square : Shape
{
    public int Side { get; }
    
    public Square(int side)
    {
        Side = side;
    }
    
    public override double Area => Side * Side;
    
    public override void Draw()
    {
        Console.WriteLine($"Drawing square {Side}x{Side}");
    }
    
    // Методы специфичные для квадрата
    public Square Resize(int newSide) => new Square(newSide);
}

// Или используем композицию
public interface IResizable
{
    void Resize(int width, int height);
}

public class ResizableRectangle : Shape, IResizable
{
    public int Width { get; private set; }
    public int Height { get; private set; }
    
    public ResizableRectangle(int width, int height)
    {
        Width = width;
        Height = height;
    }
    
    public override double Area => Width * Height;
    
    public override void Draw()
    {
        Console.WriteLine($"Drawing resizable rectangle {Width}x{Height}");
    }
    
    public void Resize(int width, int height)
    {
        Width = width;
        Height = height;
    }
}

// Square НЕ реализует IResizable - он не может менять ширину/высоту независимо
public class FixedSquare : Shape
{
    public int Side { get; }
    
    public FixedSquare(int side)
    {
        Side = side;
    }
    
    public override double Area => Side * Side;
    
    public override void Draw()
    {
        Console.WriteLine($"Drawing fixed square {Side}x{Side}");
    }
}
```

### 2. Исправление FileProcessor

```cs
// ✅ Правильное решение - специализация через интерфейсы
public interface IFileProcessor
{
    bool CanProcess(string filePath);
    void ProcessFile(string filePath);
}

public class GeneralFileProcessor : IFileProcessor
{
    public virtual bool CanProcess(string filePath)
    {
        return File.Exists(filePath);
    }
    
    public virtual void ProcessFile(string filePath)
    {
        if (!CanProcess(filePath))
            throw new ArgumentException("Cannot process this file");
            
        Console.WriteLine($"Processing file: {filePath}");
    }
}

public class ImageFileProcessor : IFileProcessor
{
    private readonly string[] _supportedExtensions = { ".jpg", ".png", ".gif", ".bmp" };
    
    public bool CanProcess(string filePath)
    {
        if (!File.Exists(filePath))
            return false;
            
        var extension = Path.GetExtension(filePath).ToLower();
        return _supportedExtensions.Contains(extension);
    }
    
    public void ProcessFile(string filePath)
    {
        if (!CanProcess(filePath))
            throw new ArgumentException("File is not a supported image format");
            
        Console.WriteLine($"Processing image: {filePath}");
        // Специфичная обработка изображений
    }
}

// Система обработки файлов
public class FileProcessingService
{
    private readonly List<IFileProcessor> _processors;
    
    public FileProcessingService(IEnumerable<IFileProcessor> processors)
    {
        _processors = processors.ToList();
    }
    
    public void ProcessFile(string filePath)
    {
        var processor = _processors.FirstOrDefault(p => p.CanProcess(filePath));
        
        if (processor == null)
            throw new NotSupportedException($"No processor available for file: {filePath}");
            
        processor.ProcessFile(filePath);
    }
}

// Использование - LSP соблюден
var service = new FileProcessingService(new IFileProcessor[]
{
    new GeneralFileProcessor(),
    new ImageFileProcessor()
});

service.ProcessFile("document.txt");  // Обработается GeneralFileProcessor
service.ProcessFile("photo.jpg");     // Обработается ImageFileProcessor
service.ProcessFile("video.mp4");     // Обработается GeneralFileProcessor
```

### 3. Исправление BankAccount

```cs
// ✅ Правильное решение - явное разделение типов счетов
public abstract class Account
{
    protected decimal _balance;
    public decimal Balance => _balance;
    
    public abstract bool CanWithdraw(decimal amount);
    public abstract void Withdraw(decimal amount);
    
    public virtual void Deposit(decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentException("Amount must be positive");
            
        _balance += amount;
    }
}

public class DebitAccount : Account
{
    // Инвариант: баланс >= 0
    public override bool CanWithdraw(decimal amount)
    {
        return amount > 0 && _balance >= amount;
    }
    
    public override void Withdraw(decimal amount)
    {
        if (!CanWithdraw(amount))
            throw new InvalidOperationException("Insufficient funds or invalid amount");
            
        _balance -= amount;
        // Инвариант сохраняется: _balance >= 0
    }
}

public class CreditAccount : Account
{
    private readonly decimal _creditLimit;
    
    public CreditAccount(decimal creditLimit)
    {
        _creditLimit = creditLimit;
    }
    
    // Инвариант: баланс >= -_creditLimit
    public override bool CanWithdraw(decimal amount)
    {
        return amount > 0 && (_balance - amount) >= -_creditLimit;
    }
    
    public override void Withdraw(decimal amount)
    {
        if (!CanWithdraw(amount))
            throw new InvalidOperationException("Credit limit exceeded or invalid amount");
            
        _balance -= amount;
        // Инвариант сохраняется: _balance >= -_creditLimit
    }
    
    public decimal AvailableCredit => _creditLimit + _balance;
}

// Использование - каждый тип счета ведет себя предсказуемо
public class BankingService
{
    public void ProcessTransfer(Account fromAccount, Account toAccount, decimal amount)
    {
        // Проверяем возможность списания без нарушения контракта
        if (!fromAccount.CanWithdraw(amount))
            throw new InvalidOperationException("Cannot withdraw specified amount");
            
        fromAccount.Withdraw(amount);
        toAccount.Deposit(amount);
        
        // Каждый тип счета сохраняет свои инварианты
    }
    
    public void DisplayAccountInfo(Account account)
    {
        Console.WriteLine($"Balance: {account.Balance:C}");
        
        // Можем безопасно работать с любым типом счета
        if (account is CreditAccount creditAccount)
        {
            Console.WriteLine($"Available Credit: {creditAccount.AvailableCredit:C}");
        }
    }
}
```

## Современные примеры нарушения LSP

### Проблема с коллекциями

```cs
// ❌ Нарушение LSP
public class ReadOnlyList<T> : List<T>
{
    public override void Add(T item)
    {
        throw new NotSupportedException("Collection is read-only");
    }
    
    public override void Remove(T item)
    {
        throw new NotSupportedException("Collection is read-only");
    }
    
    public override void Clear()
    {
        throw new NotSupportedException("Collection is read-only");
    }
}

// Проблема в использовании
public void ProcessItems(List<string> items)
{
    items.Add("New item"); // Упадет для ReadOnlyList!
}

// ✅ Правильное решение
public interface IReadOnlyList<out T> : IEnumerable<T>
{
    T this[int index] { get; }
    int Count { get; }
}

public interface IList<T> : IReadOnlyList<T>
{
    new T this[int index] { get; set; }
    void Add(T item);
    bool Remove(T item);
    void Clear();
}
```

### Проблема с асинхронностью

```cs
// ❌ Нарушение LSP
public abstract class DataService
{
    public abstract Task<string> GetDataAsync(int id);
}

public class DatabaseService : DataService
{
    public override async Task<string> GetDataAsync(int id)
    {
        await Task.Delay(100); // Реальная асинхронная операция
        return $"Data from database: {id}";
    }
}

public class CacheService : DataService
{
    private readonly Dictionary<int, string> _cache = new();
    
    // ❌ Нарушение контракта - синхронная операция в асинхронном методе
    public override Task<string> GetDataAsync(int id)
    {
        var data = _cache.TryGetValue(id, out var value) ? value : $"Cached data: {id}";
        return Task.FromResult(data); // Псевдо-асинхронность
    }
}

// ✅ Правильное решение - честная асинхронность везде
public abstract class DataService
{
    public abstract Task<string> GetDataAsync(int id);
}

public class DatabaseService : DataService
{
    public override async Task<string> GetDataAsync(int id)
    {
        await Task.Delay(100);
        return $"Data from database: {id}";
    }
}

public class CacheService : DataService
{
    private readonly Dictionary<int, string> _cache = new();
    
    public override async Task<string> GetDataAsync(int id)
    {
        // Честная асинхронность даже для кэша
        await Task.Yield();
        var data = _cache.TryGetValue(id, out var value) ? value : $"Cached data: {id}";
        return data;
    }
}
```

## Практические советы для соблюдения LSP

### 1. Используйте [[Контрактное программирование (Design by Contract)|контрактное программирование]]

```cs
public abstract class PaymentProcessor
{
    /// <summary>
    /// Обрабатывает платеж
    /// Предусловие: amount > 0
    /// Постусловие: возвращает результат с IsSuccess или Error
    /// </summary>
    public abstract Task<PaymentResult> ProcessAsync(decimal amount);
}

public class CreditCardProcessor : PaymentProcessor
{
    public override async Task<PaymentResult> ProcessAsync(decimal amount)
    {
        // Соблюдаем предусловие
        if (amount <= 0)
            throw new ArgumentException("Amount must be positive");
            
        try
        {
            // Обработка
            await ProcessCreditCardAsync(amount);
            
            // Соблюдаем постусловие
            return PaymentResult.Success("Payment processed");
        }
        catch (Exception ex)
        {
            // Соблюдаем постусловие - всегда возвращаем результат
            return PaymentResult.Error(ex.Message);
        }
    }
}
```

### 2. Тестируйте подстановку

```cs
[TestClass]
public class LSPTests
{
    [TestMethod]
    public void AllPaymentProcessors_ShouldHandleValidAmount()
    {
        // Тестируем LSP - все наследники должны работать одинаково
        var processors = new PaymentProcessor[]
        {
            new CreditCardProcessor(),
            new PayPalProcessor(),
            new BankTransferProcessor()
        };
        
        foreach (var processor in processors)
        {
            var result = processor.ProcessAsync(100).Result;
            
            // Каждый наследник должен соблюдать контракт
            Assert.IsTrue(result.IsSuccess || !string.IsNullOrEmpty(result.Error));
        }
    }
}
```

### 3. Используйте статический анализ

```cs
// Атрибуты для контрактов (Code Contracts)
public abstract class Shape
{
    [Pure]
    public abstract double Area { get; }
    
    [ContractInvariantMethod]
    private void ObjectInvariant()
    {
        Contract.Invariant(Area >= 0); // Площадь всегда >= 0
    }
}
```

## Заключение

LSP — это про **поведенческую совместимость**. Наследники должны **усиливать** систему, а не ломать ожидания клиентского кода.

**Ключевые моменты:**

1. **Не усиливайте предусловия** в наследниках
2. **Не ослабляйте постусловия** в наследниках
3. **Сохраняйте инварианты** базового класса
4. **Не кидайте новые исключения**, которых не ожидает клиентский код
5. **Тестируйте подстановку** - весь код должен работать с любым наследником

Соблюдение LSP делает код более надежным и предсказуемым!