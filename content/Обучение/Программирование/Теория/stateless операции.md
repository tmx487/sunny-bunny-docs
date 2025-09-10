**Stateless операции** — это операции (методы, функции), которые **не зависят от внутреннего состояния объекта** и **не изменяют его**. Результат зависит только от входных параметров.

## Что такое состояние (state)?

**Состояние** — это данные, хранящиеся в объекте между вызовами методов.

```csharp
public class Calculator
{
    private int _accumulator = 0; // ← Это состояние
    
    public void Add(int value)
    {
        _accumulator += value; // Изменяем состояние
    }
    
    public int GetResult()
    {
        return _accumulator; // Зависим от состояния
    }
}
```

## Stateless vs Stateful

### ❌ Stateful (с состоянием)

```csharp
public class StatefulCalculator
{
    private double _currentValue = 0; // Состояние
    
    public void Add(double value)
    {
        _currentValue += value; // Изменяет состояние
    }
    
    public void Multiply(double value)
    {
        _currentValue *= value; // Изменяет состояние
    }
    
    public double GetResult()
    {
        return _currentValue; // Зависит от состояния
    }
}

// Использование - результат зависит от предыдущих вызовов
var calc = new StatefulCalculator();
calc.Add(10);      // _currentValue = 10
calc.Multiply(2);  // _currentValue = 20
Console.WriteLine(calc.GetResult()); // 20
```

### ✅ Stateless (без состояния)

```csharp
public static class StatelessCalculator
{
    public static double Add(double a, double b)
    {
        return a + b; // Не зависит от состояния, не изменяет состояние
    }
    
    public static double Multiply(double a, double b)
    {
        return a * b; // Результат зависит только от параметров
    }
    
    public static double Calculate(double initial, params (string operation, double value)[] operations)
    {
        double result = initial;
        foreach (var (operation, value) in operations)
        {
            result = operation switch
            {
                "add" => Add(result, value),
                "multiply" => Multiply(result, value),
                _ => result
            };
        }
        return result;
    }
}

// Использование - результат предсказуем
double result = StatelessCalculator.Add(10, 5); // Всегда 15
double result2 = StatelessCalculator.Multiply(4, 3); // Всегда 12
```

## Примеры stateless операций

### 1. Математические функции

```csharp
public static class MathUtils
{
    public static double CalculateDistance(Point a, Point b)
    {
        return Math.Sqrt(Math.Pow(b.X - a.X, 2) + Math.Pow(b.Y - a.Y, 2));
        // Результат зависит только от a и b
    }
    
    public static double ConvertCelsiusToFahrenheit(double celsius)
    {
        return celsius * 9.0 / 5.0 + 32;
        // Одинаковый вход → одинаковый выход
    }
    
    public static bool IsPrime(int number)
    {
        if (number < 2) return false;
        for (int i = 2; i <= Math.Sqrt(number); i++)
        {
            if (number % i == 0) return false;
        }
        return true;
        // Детерминированная функция
    }
}
```

### 2. Форматирование и валидация

```csharp
public static class StringUtils
{
    public static string FormatPhoneNumber(string phone)
    {
        // Убираем все, кроме цифр
        var digits = new string(phone.Where(char.IsDigit).ToArray());
        
        if (digits.Length != 10) 
            throw new ArgumentException("Invalid phone format");
            
        return $"({digits.Substring(0, 3)}) {digits.Substring(3, 3)}-{digits.Substring(6)}";
        // "1234567890" → "(123) 456-7890"
    }
    
    public static bool IsValidEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email)) return false;
        
        var regex = new Regex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$");
        return regex.IsMatch(email);
        // Результат зависит только от входного email
    }
    
    public static string ToTitleCase(string input)
    {
        if (string.IsNullOrEmpty(input)) return input;
        
        return CultureInfo.CurrentCulture.TextInfo.ToTitleCase(input.ToLower());
        // "hello world" → "Hello World"
    }
}
```

### 3. Преобразование данных

```csharp
public static class DataConverter
{
    public static UserDto ToDto(User user)
    {
        return new UserDto
        {
            Id = user.Id,
            FullName = $"{user.FirstName} {user.LastName}",
            Email = user.Email,
            IsActive = user.Status == UserStatus.Active
        };
        // Чистое преобразование без побочных эффектов
    }
    
    public static decimal CalculateTax(decimal amount, decimal taxRate)
    {
        return Math.Round(amount * taxRate, 2);
        // Всегда одинаковый результат для одинаковых параметров
    }
    
    public static List<T> FilterByPredicate<T>(IEnumerable<T> items, Func<T, bool> predicate)
    {
        return items.Where(predicate).ToList();
        // Не изменяет исходную коллекцию
    }
}
```

### 4. Криптография и хеширование

```csharp
public static class SecurityUtils
{
    public static string HashPassword(string password, string salt)
    {
        using var sha256 = SHA256.Create();
        var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password + salt));
        return Convert.ToBase64String(hashedBytes);
        // Детерминированная функция
    }
    
    public static string GenerateRandomToken(int length)
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        var random = new Random();
        return new string(Enumerable.Repeat(chars, length)
            .Select(s => s[random.Next(s.Length)]).ToArray());
        // ⚠️ Технически не stateless из-за Random, но концептуально pure
    }
}
```

## Контрпримеры - stateful операции

### ❌ Операции с состоянием

```csharp
public class DatabaseService
{
    private IDbConnection _connection; // Состояние
    private int _queryCount = 0;      // Состояние
    
    public void Connect()
    {
        _connection = new SqlConnection(connectionString);
        _connection.Open(); // Изменяет состояние
    }
    
    public List<User> GetUsers()
    {
        _queryCount++; // Изменяет состояние
        // Результат может зависеть от состояния соединения
        return _connection.Query<User>("SELECT * FROM Users").ToList();
    }
}

public class ShoppingCart
{
    private List<Item> _items = new(); // Состояние
    
    public void AddItem(Item item)
    {
        _items.Add(item); // Изменяет состояние
    }
    
    public decimal GetTotal()
    {
        return _items.Sum(i => i.Price); // Зависит от состояния
    }
}
```

## Преимущества stateless операций

### 1. **Предсказуемость**

```csharp
// Всегда одинаковый результат
var result1 = MathUtils.Add(5, 3); // 8
var result2 = MathUtils.Add(5, 3); // 8 (гарантированно)
```

### 2. **Тестируемость**

```csharp
[Test]
public void TestPhoneFormatting()
{
    // Простое тестирование - нет setup/teardown
    var result = StringUtils.FormatPhoneNumber("1234567890");
    Assert.AreEqual("(123) 456-7890", result);
}
```

### 3. **Потокобезопасность**

```csharp
// Можно безопасно вызывать из разных потоков
Parallel.For(0, 1000, i =>
{
    var result = MathUtils.CalculateDistance(pointA, pointB);
    // Нет race conditions
});
```

🟡**Примечание**: stateless операции потокобезопасны, т.к. у них отсутствует общее изменяемое состояние. **Race conditions** возникают, когда несколько потоков **одновременно обращаются к общим данным**, и хотя бы один из них **изменяет** эти данные.

**Но помните**: stateless ≠ автоматически потокобезопасен, если операция:

- Обращается к статическим полям (*Статические поля — это общая память для всех потоков в приложении. Даже если метод выглядит stateless, он может обращаться к общему состоянию через статические поля*)
- Изменяет объекты, переданные по ссылке
- Использует общие ресурсы (файлы, БД, сеть)
- Работает с не-потокобезопасными объектами
### 4. **Кэширование**

```csharp
// Результаты можно кэшировать
private static readonly Dictionary<(int, int), int> _cache = new();

public static int ExpensiveCalculation(int a, int b)
{
    var key = (a, b);
    if (_cache.TryGetValue(key, out var cached))
        return cached;
        
    var result = /* сложные вычисления */;
    _cache[key] = result;
    return result;
}
```

### 5. **Композируемость**

```csharp
// Легко комбинировать stateless операции
var pipeline = users
    .Select(DataConverter.ToDto)           // stateless
    .Where(dto => StringUtils.IsValidEmail(dto.Email)) // stateless
    .Select(dto => dto.FullName.ToUpper()) // stateless
    .ToList();
```

## Когда использовать stateless подход

### ✅ Подходит для:

- **Утилитарные функции** (математика, форматирование)
- **Валидация данных**
- **Преобразования** (mappers, converters)
- **Алгоритмы** (сортировка, поиск)
- **Криптографические операции**
- **Парсинг и сериализация**

### ❌ Не подходит для:

- **Работа с внешними ресурсами** (БД, файлы, сеть)
- **Управление состоянием приложения**
- **UI компоненты**
- **Сессии и аутентификация**
- **Кэширование** (нужно хранить кэш)

## Функциональное программирование

Stateless операции — основа **функционального программирования**:

```csharp
// Функциональный стиль с stateless операциями
public static class FunctionalUtils
{
    public static Func<T, R> Memoize<T, R>(Func<T, R> func)
    {
        var cache = new Dictionary<T, R>();
        return input =>
        {
            if (cache.TryGetValue(input, out var result))
                return result;
            result = func(input);
            cache[input] = result;
            return result;
        };
    }
    
    public static Func<T, R> Compose<T, U, R>(Func<T, U> f1, Func<U, R> f2)
    {
        return input => f2(f1(input));
    }
}

// Использование
var expensiveFunction = FunctionalUtils.Memoize<int, int>(x => x * x * x);
var pipeline = FunctionalUtils.Compose<string, string, int>(
    str => str.ToUpper(), 
    str => str.Length
);
```

**Вывод:** Stateless операции — это **чистые функции**, которые работают только с входными параметрами и не имеют побочных эффектов. Они делают код **предсказуемым, тестируемым и безопасным** для использования в многопоточной среде.