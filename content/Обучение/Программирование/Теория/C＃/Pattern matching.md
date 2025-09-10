**Pattern matching** — это функциональность, позволяющая проверять значения на соответствие определенным шаблонам и извлекать данные из них.
### Развитие Pattern Matching в C\#

#### C# 7.0 - Базовый pattern matching

```cs
// switch expression с типами
object obj = "Hello";
switch (obj)
{
    case string s:
        Console.WriteLine($"Строка: {s}");
        break;
    case int i when i > 0:
        Console.WriteLine($"Положительное число: {i}");
        break;
    case null:
        Console.WriteLine("null");
        break;
}

// is expression
if (obj is string str)
{
    Console.WriteLine(str.Length);
}
```

#### C# 8.0 - Switch expressions

```cs
public static string DescribeAnimal(Animal animal) => animal switch
{
    Dog => "Лает",
    Cat => "Мяукает",
    Bird bird when bird.CanFly => "Летает",
    Bird => "Не летает",
    null => "Нет животного",
    _ => "Неизвестное животное"
};

// Property patterns
public static string DescribePerson(Person person) => person switch
{
    { Age: < 18 } => "Ребенок",
    { Age: >= 18, Age: < 65 } => "Взрослый", 
    { Age: >= 65 } => "Пенсионер",
    _ => "Неизвестно"
};
```

#### C# 9.0 - Расширенные возможности

```cs
// Tuple patterns
public static string RockPaperScissors(string first, string second) => (first, second) switch
{
    ("rock", "paper") => "Бумага побеждает",
    ("rock", "scissors") => "Камень побеждает",
    ("paper", "rock") => "Бумага побеждает",
    // ...
    _ => "Ничья"
};

// Relational patterns
public static string CategorizeBMI(double bmi) => bmi switch
{
    < 18.5 => "Недостаток веса",
    >= 18.5 and < 25 => "Нормальный вес",
    >= 25 and < 30 => "Избыточный вес",
    >= 30 => "Ожирение"
};

// Logical patterns (and, or, not)
public static bool IsValid(int value) => value switch
{
    > 0 and < 100 => true,
    _ => false
};
```

#### C# 10.0 - Дальнейшие улучшения

```cs
// Extended property patterns
public static string DescribeAddress(Person person) => person switch
{
    { Address: { Country: "Russia", City: "Moscow" } } => "Москвич",
    { Address: { Country: "Russia" } } => "Россиянин",
    { Address: not null } => "Есть адрес",
    _ => "Адрес неизвестен"
};
```

#### C# 11.0 - List patterns

```cs
public static string DescribeList(int[] numbers) => numbers switch
{
    [] => "Пустой массив",
    [var single] => $"Один элемент: {single}",
    [var first, var second] => $"Два элемента: {first}, {second}",
    [var first, .., var last] => $"Первый: {first}, последний: {last}",
    _ => "Много элементов"
};
```

### Практические примеры использования

#### Обработка результатов операций

```cs
public record Result<T>
{
    public record Success(T Value) : Result<T>;
    public record Error(string Message) : Result<T>;
}

public static void HandleResult<T>(Result<T> result)
{
    switch (result)
    {
        case Result<T>.Success(var value):
            Console.WriteLine($"Успех: {value}");
            break;
        case Result<T>.Error(var message):
            Console.WriteLine($"Ошибка: {message}");
            break;
    }
}
```

#### Парсинг команд

```cs
public static void ExecuteCommand(string[] args) => args switch
{
    ["help"] => ShowHelp(),
    ["version"] => ShowVersion(),
    ["install", var package] => InstallPackage(package),
    ["install", var package, "--global"] => InstallPackageGlobally(package),
    _ => ShowUsage()
};
```

### Преимущества Pattern Matching

1. **Читаемость**: код становится более декларативным
2. **Безопасность**: компилятор проверяет полноту покрытия
3. **Производительность**: оптимизации на уровне компилятора
4. **Функциональный стиль**: альтернатива наследованию и полиморфизму

### Ссылки на документацию и ресурсы

**Официальная документация Microsoft:**

- [Pattern matching overview](https://docs.microsoft.com/en-us/dotnet/csharp/fundamentals/functional/pattern-matching)
- [Switch expressions (C# 8.0)](https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/operators/switch-expression)
- [Patterns (C# reference)](https://docs.microsoft.com/en-us/dotnet/csharp/language-reference/operators/patterns)

**Подробные руководства:**

- [Pattern Matching in C# 8.0](https://docs.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-8#switch-expressions)
- [Pattern Matching in C# 9.0](https://docs.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-9#pattern-matching-enhancements)
- [Pattern Matching in C# 10.0](https://docs.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-10#extended-property-patterns)
- [Pattern Matching in C# 11.0](https://docs.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-11#list-patterns)

**Дополнительные ресурсы:**

- [C# Pattern Matching Tutorial - Code Maze](https://code-maze.com/csharp-pattern-matching/)
- [Pattern Matching in C# - Pluralsight](https://www.pluralsight.com/guides/pattern-matching-in-csharp)

Pattern matching в C# эволюционирует с каждой версией и становится все более мощным инструментом для написания выразительного и безопасного кода.