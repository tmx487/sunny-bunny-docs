# Основное

**Массив** - ссылочный тип данных, базовым классом которого является абстрактный класс `System.Array`. Поэтому все массивы хранятся в куче. При этом, не важно элементы какого типа, значимого или ссылочного, содержит массив, они все всё равно будут храниться в куче. 

>[!danger] Важно
>
>Даже если в массиве лежат элементы значимого типа, ***их упаковка не происходит***. Они лежат в куче в "сыром" виде:
>
>```cs
>// В массиве int[] элементы хранятся как "сырые" биты
>int[] array = new int[3];
>array[0] = 42;
>
>// Примерное представление массива array в памяти (little-endian):
>// [заголовок массива: тип, длина, синхронизация, etc. - ~24 байта]
>// [2А][00][00][00] - array[0] = 42, 4 байта
>// [00][00][00][00] - array[1] = 0 (значение по умолчанию)
>// [00][00][00][00] - array[2] = 0 (значение по умолчанию)
>// НЕ [ссылка на объект, содержащий 42]
>
>
>Упаковка происходит только при явном или неявном приведении value type к object или интерфейсу, а не просто от факта хранения в массиве.

```plaintext
Стек:
myIntegers → [ссылка на кучу]

Куча:
[заголовок массива: тип, длина, etc.][42][0][0]
                                       ↑   ↑   ↑
                               Элементы в куче, но НЕ упакованы!
```

## Основные методы Array

**Array.Copy(Array, Array, int)** - копирует элементы из одного массива в другой

```csharp
int[] source = {1, 2, 3, 4, 5};
int[] destination = new int[5];
Array.Copy(source, destination, 3); // Копируем первые 3 элемента
// destination: [1, 2, 3, 0, 0]
```

**Array.IndexOf(Array, object)** - находит индекс первого вхождения элемента

```csharp
string[] names = {"Alice", "Bob", "Charlie", "Bob"};
int index = Array.IndexOf(names, "Bob"); // Возвращает 1
int notFound = Array.IndexOf(names, "David"); // Возвращает -1
```

**Array.Sort(Array)** - сортирует элементы массива по возрастанию

```csharp
int[] numbers = {5, 2, 8, 1, 9};
Array.Sort(numbers);
// numbers: [1, 2, 5, 8, 9]
```

**Array.Reverse(Array)** - переворачивает порядок элементов

```csharp
string[] words = {"first", "second", "third"};
Array.Reverse(words);
// words: ["third", "second", "first"]
```

**Array.Clear(Array, int, int)** - устанавливает элементы в значение по умолчанию

```csharp
int[] data = {1, 2, 3, 4, 5};
Array.Clear(data, 1, 3); // Очищаем 3 элемента начиная с индекса 1
// data: [1, 0, 0, 0, 5]
```

**Array.Resize(ref Array, int)** - изменяет размер массива

```csharp
int[] numbers = {1, 2, 3};
Array.Resize(ref numbers, 5); // Увеличиваем до 5 элементов
// numbers: [1, 2, 3, 0, 0]

Array.Resize(ref numbers, 2); // Уменьшаем до 2 элементов  
// numbers: [1, 2]
```

## LINQ методы (самые популярные в продакшн)

**Where(Func<T, bool>)** - фильтрует элементы по условию

```csharp
int[] numbers = {1, 2, 3, 4, 5, 6};
var evenNumbers = numbers.Where(x => x % 2 == 0).ToArray();
// evenNumbers: [2, 4, 6]
```

**Select(Func<T, TResult>)** - преобразует каждый элемент

```csharp
string[] names = {"alice", "bob", "charlie"};
var upperNames = names.Select(name => name.ToUpper()).ToArray();
// upperNames: ["ALICE", "BOB", "CHARLIE"]
```

**FirstOrDefault(Func<T, bool>)** - находит первый элемент или значение по умолчанию

```csharp
int[] numbers = {1, 3, 5, 8, 9};
int firstEven = numbers.FirstOrDefault(x => x % 2 == 0); // 8
int firstNegative = numbers.FirstOrDefault(x => x < 0);  // 0 (default)
```

**Any(Func<T, bool>)** - проверяет, есть ли элементы, удовлетворяющие условию

```csharp
string[] emails = {"user@gmail.com", "admin@company.com", "test@yahoo.com"};
bool hasGmail = emails.Any(email => email.Contains("gmail")); // true
bool hasHotmail = emails.Any(email => email.Contains("hotmail")); // false
```

**All(Func<T, bool>)** - проверяет, все ли элементы удовлетворяют условию

```csharp
int[] ages = {25, 30, 35, 40};
bool allAdults = ages.All(age => age >= 18); // true
bool allSeniors = ages.All(age => age >= 65); // false
```

**Count(Func<T, bool>)** - подсчитывает элементы, удовлетворяющие условию

```csharp
string[] products = {"Apple iPhone", "Samsung Galaxy", "Apple iPad", "Google Pixel"};
int appleProducts = products.Count(p => p.StartsWith("Apple")); // 2
```

**GroupBy(Func<T, TKey>)** - группирует элементы по ключу

```csharp
var orders = new[]
{
    new { Customer = "Alice", Amount = 100 },
    new { Customer = "Bob", Amount = 200 },
    new { Customer = "Alice", Amount = 150 }
};

var grouped = orders.GroupBy(o => o.Customer).ToArray();
foreach (var group in grouped)
{
    Console.WriteLine($"{group.Key}: {group.Sum(o => o.Amount)}");
}
// Alice: 250
// Bob: 200
```

**OrderBy(Func<T, TKey>)** - сортирует элементы по ключу

```csharp
var employees = new[]
{
    new { Name = "John", Salary = 50000 },
    new { Name = "Alice", Salary = 75000 },
    new { Name = "Bob", Salary = 60000 }
};

var sortedBySalary = employees.OrderBy(e => e.Salary).ToArray();
// John (50000), Bob (60000), Alice (75000)
```

**Sum/Average/Min/Max** - агрегатные функции

```csharp
int[] scores = {85, 92, 78, 96, 88};
int total = scores.Sum();           // 439
double average = scores.Average();  // 87.8
int minimum = scores.Min();         // 78
int maximum = scores.Max();         // 96
```

## Проверка и поиск

**Contains(T)** - проверяет наличие элемента

```csharp
string[] allowedRoles = {"Admin", "User", "Manager"};
bool canAccess = allowedRoles.Contains("Admin"); // true
```

**Array.BinarySearch(Array, object)** - бинарный поиск в отсортированном массиве

```csharp
int[] sortedNumbers = {1, 3, 5, 7, 9, 11};
int index = Array.BinarySearch(sortedNumbers, 7); // 3
int notFound = Array.BinarySearch(sortedNumbers, 6); // отрицательное число
```

## Практические сценарии в продакшн

**Валидация данных**

```csharp
string[] userInputs = {"", "valid@email.com", null, "another@email.com"};
string[] validEmails = userInputs
    .Where(email => !string.IsNullOrEmpty(email))
    .Where(email => email.Contains("@"))
    .ToArray();
```

**Преобразование для API**

```csharp
var users = GetUsersFromDatabase();
var userDtos = users
    .Where(u => u.IsActive)
    .Select(u => new UserDto 
    { 
        Id = u.Id, 
        Name = u.FullName, 
        Email = u.Email 
    })
    .ToArray();
```

**Обработка конфигурации**

```csharp
string[] configValues = {"setting1=value1", "setting2=value2", "setting3=value3"};
var settings = configValues
    .Select(config => config.Split('='))
    .Where(parts => parts.Length == 2)
    .ToDictionary(parts => parts[0], parts => parts[1]);
```

**Пагинация**

```csharp
var allItems = GetAllItems();
int pageSize = 10;
int pageNumber = 2;

var pageItems = allItems
    .Skip((pageNumber - 1) * pageSize)
    .Take(pageSize)
    .ToArray();
```

Эти методы покрывают 90% случаев работы с массивами в реальных проектах. LINQ методы особенно популярны благодаря своей выразительности и функциональному стилю программирования.
# Может ли нумерация в массиве начинаться не с 0?

***Да, может, однако, такой подход не рекомендуется***. Если производительность и межязыковая совместимость не имеют значения, то использовать массивы, начальный индекс которых начинается не с 0. Детали использования представлены ниже.
## Многомерные массивы с custom boundaries

В .NET есть возможность создавать многомерные массивы с **произвольными границами**:

```csharp
// Array.CreateInstance позволяет задать custom bounds
// Создаем массив с индексами от -5 до 5
int[] lowerBounds = {-5};  // Начальный индекс
int[] lengths = {11};      // Длина (от -5 до 5 = 11 элементов)

Array customArray = Array.CreateInstance(typeof(int), lengths, lowerBounds);

// Устанавливаем значения
customArray.SetValue(100, -5);  // array[-5] = 100
customArray.SetValue(200, -4);  // array[-4] = 200
customArray.SetValue(300, 0);   // array[0] = 300
customArray.SetValue(400, 5);   // array[5] = 400

// Читаем значения
Console.WriteLine(customArray.GetValue(-5)); // 100
Console.WriteLine(customArray.GetValue(0));  // 300
Console.WriteLine(customArray.GetValue(5));  // 400

// Проверяем границы
Console.WriteLine($"Lower bound: {customArray.GetLowerBound(0)}"); // -5
Console.WriteLine($"Upper bound: {customArray.GetUpperBound(0)}"); // 5
```

## Двумерный массив с custom boundaries

```csharp
// Создаем 2D массив: строки от 1 до 3, столбцы от -2 до 2
int[] lowerBounds = {1, -2};   // Начальные индексы для каждого измерения
int[] lengths = {3, 5};        // Длины: 3 строки, 5 столбцов

Array matrix = Array.CreateInstance(typeof(string), lengths, lowerBounds);

// Заполняем
matrix.SetValue("A", 1, -2);   // matrix[1,-2] = "A"
matrix.SetValue("B", 1, -1);   // matrix[1,-1] = "B"  
matrix.SetValue("C", 2, 0);    // matrix[2,0] = "C"
matrix.SetValue("D", 3, 2);    // matrix[3,2] = "D"

// Читаем
Console.WriteLine(matrix.GetValue(1, -2)); // "A"
Console.WriteLine(matrix.GetValue(3, 2));  // "D"

// Границы по измерениям
Console.WriteLine($"Rows: {matrix.GetLowerBound(0)} to {matrix.GetUpperBound(0)}"); // 1 to 3
Console.WriteLine($"Cols: {matrix.GetLowerBound(1)} to {matrix.GetUpperBound(1)}"); // -2 to 2
```

## Реальный пример — шахматная доска

```csharp
// Шахматная доска: строки 1-8, столбцы a-h (преобразуем в числа 1-8)
int[] lowerBounds = {1, 1};  // От 1 до 8 для обеих осей
int[] lengths = {8, 8};      // 8x8 клеток

Array chessBoard = Array.CreateInstance(typeof(string), lengths, lowerBounds);

// Расставляем фигуры "естественным" способом
chessBoard.SetValue("♜", 8, 1); // Ладья на a8
chessBoard.SetValue("♞", 8, 2); // Конь на b8
chessBoard.SetValue("♝", 8, 3); // Слон на c8
chessBoard.SetValue("♛", 8, 4); // Ферзь на d8
chessBoard.SetValue("♚", 8, 5); // Король на e8

// Пешки на 7-й горизонтали
for (int col = 1; col <= 8; col++)
{
    chessBoard.SetValue("♟", 7, col);
}

// Читаем позицию короля
Console.WriteLine($"Король: {chessBoard.GetValue(8, 5)}"); // ♚

// Обходим доску
for (int row = 8; row >= 1; row--)
{
    for (int col = 1; col <= 8; col++)
    {
        var piece = chessBoard.GetValue(row, col) ?? "·";
        Console.Write(piece + " ");
    }
    Console.WriteLine($" {row}");
}
Console.WriteLine("a b c d e f g h");
```

## Проверка типа массива

```csharp
void AnalyzeArray(Array array)
{
    Console.WriteLine($"Dimensions: {array.Rank}");
    
    for (int dimension = 0; dimension < array.Rank; dimension++)
    {
        int lower = array.GetLowerBound(dimension);
        int upper = array.GetUpperBound(dimension);
        int length = array.GetLength(dimension);
        
        Console.WriteLine($"Dimension {dimension}: [{lower}..{upper}] (length: {length})");
    }
    
    // Проверяем, является ли массив "zero-based"
    bool isZeroBased = true;
    for (int i = 0; i < array.Rank; i++)
    {
        if (array.GetLowerBound(i) != 0)
        {
            isZeroBased = false;
            break;
        }
    }
    
    Console.WriteLine($"Zero-based: {isZeroBased}");
}

// Тестируем
int[] normalArray = {1, 2, 3};
AnalyzeArray(normalArray);
// Output:
// Dimensions: 1
// Dimension 0: [0..2] (length: 3)  
// Zero-based: True

AnalyzeArray(customArray);
// Output:
// Dimensions: 1
// Dimension 0: [-5..5] (length: 11)
// Zero-based: False
```

## Ограничения custom boundaries

### 1. Нет синтаксического сахара

```csharp
// ❌ Нельзя использовать обычную индексацию
// customArray[-5] = 100; // Ошибка компиляции!

// ✅ Только через методы
customArray.SetValue(100, -5);
int value = (int)customArray.GetValue(-5);
```

### 2. Нет поддержки в LINQ

```csharp
// ❌ LINQ не работает с custom bounds массивами
// customArray.Where(x => x > 50); // Ошибка!

// ✅ Нужно конвертировать
var values = customArray.Cast<int>().Where(x => x > 50);
```

### 3. Производительность

```csharp
// Обычный массив: array[i] - очень быстро
int value1 = normalArray[2]; // Прямое обращение к памяти

// Custom bounds: медленнее из-за вычислений смещения
int value2 = (int)customArray.GetValue(-3); // Вызов метода + вычисления
```

## Когда использовать custom boundaries

### ✅ Полезно для:

- **Научных вычислений** (матрицы с индексами 1..n)
- **Игровых полей** (координаты не с 0)
- **Моделирования реальных систем** (годы 2020-2030)
- **[[Интероперабельность (Interoperability)|Интероперабельности]]** с legacy системами

### ❌ Избегайте для:

- **Обычного программирования** (слишком сложно)
- **Performance-critical кода** (накладные расходы)
- **LINQ операций** (нет поддержки)
- **Сериализации** (проблемы совместимости)

## Альтернативы

```csharp
// Вместо custom bounds часто лучше использовать:

// 1. Dictionary для sparse данных
var sparseArray = new Dictionary<int, int>
{
    [-5] = 100,
    [-4] = 200,
    [0] = 300,
    [5] = 400
};

// 2. Wrapper класс
public class IndexedArray<T>
{
    private readonly T[] array;
    private readonly int offset;
    
    public IndexedArray(int start, int length)
    {
        array = new T[length];
        offset = -start;
    }
    
    public T this[int index]
    {
        get => array[index + offset];
        set => array[index + offset] = value;
    }
}

var indexed = new IndexedArray<int>(-5, 11);
indexed[-5] = 100; // Работает как обычная индексация!
```