**Buckets** (корзины) - это базовая структура данных внутри [[Хеш-таблица|хеш-таблицы]].

## Что такое buckets

**Bucket** - это "корзина" или "ведро", куда попадают элементы с определенным хеш-кодом. Это основа работы любой хеш-таблицы.

```csharp
// Упрощенная внутренняя структура Dictionary
internal struct Dictionary<TKey, TValue>
{
    private int[] buckets;      // Массив "корзин" 
    private Entry[] entries;    // Массив элементов
    private int count;          // Количество элементов
}

internal struct Entry
{
    public int hashCode;    // Хеш-код ключа
    public int next;        // Индекс следующего элемента в цепочке
    public TKey key;        // Ключ
    public TValue value;    // Значение
}
```

## Как работают buckets

### 1. Определение номера bucket

```csharp
// Алгоритм определения bucket
string key = "example";
int hashCode = key.GetHashCode();           // Получаем хеш
int bucketIndex = hashCode % buckets.Length; // Определяем номер bucket

// Пример:
// hashCode = 1234567
// buckets.Length = 7
// bucketIndex = 1234567 % 7 = 4
// Элемент попадет в bucket[4]
```

### 2. Структура buckets

```
buckets[]:     [2] [-1] [5] [-1] [0] [8] [-1]
                ↓              ↓   ↓
entries[]:  [0] Entry1    [5] Entry2  [8] Entry3
            [1] Entry4    [6] Entry5
            [2] Entry6 → [7] Entry7
            [3] Entry8
            [4] Entry9

// -1 означает "пустой bucket"
// Цифры в buckets[] - это индексы в массиве entries[]
```

## Визуальный пример работы

Допустим, у нас есть Dictionary с 7 buckets:

```csharp
var dict = new Dictionary<string, int>();

// Добавляем элементы
dict["apple"] = 1;   // hash % 7 = 2 → bucket[2]
dict["banana"] = 2;  // hash % 7 = 5 → bucket[5] 
dict["cherry"] = 3;  // hash % 7 = 2 → bucket[2] (коллизия!)
dict["date"] = 4;    // hash % 7 = 0 → bucket[0]
```

Результат:

```
Bucket 0: → Entry("date", 4)
Bucket 1: (пустой)
Bucket 2: → Entry("apple", 1) → Entry("cherry", 3)  // Цепочка коллизий
Bucket 3: (пустой)
Bucket 4: (пустой)
Bucket 5: → Entry("banana", 2)
Bucket 6: (пустой)
```

## Разрешение коллизий через цепочки

Когда несколько ключей попадают в один bucket:

```csharp
// Поиск элемента "cherry"
int bucketIndex = "cherry".GetHashCode() % buckets.Length; // = 2
int entryIndex = buckets[bucketIndex];  // Получаем первый элемент цепочки

while (entryIndex >= 0)
{
    Entry entry = entries[entryIndex];
    
    if (entry.hashCode == targetHash && 
        EqualityComparer<TKey>.Default.Equals(entry.key, "cherry"))
    {
        return entry.value; // Нашли!
    }
    
    entryIndex = entry.next; // Переходим к следующему в цепочке
}
```

## Производительность и размер buckets

### Коэффициент загрузки (Load Factor)

```csharp
// Load Factor = количество элементов / количество buckets
float loadFactor = dict.Count / (float)buckets.Length;

// Оптимальный Load Factor ≈ 0.75
// При превышении Dictionary увеличивает размер buckets
```

### Процесс resize

```csharp
// Когда Load Factor > 0.75, происходит resize:
void Resize()
{
    int oldLength = buckets.Length;
    int newLength = oldLength * 2; // Удваиваем размер
    
    // Создаем новые массивы
    int[] newBuckets = new int[newLength];
    Entry[] newEntries = new Entry[newLength];
    
    // Перехешируем все элементы!
    for (int i = 0; i < count; i++)
    {
        int newBucketIndex = entries[i].hashCode % newLength;
        // Перераспределяем элементы по новым buckets
    }
}
```

## Влияние на производительность

### Хорошее распределение

```
Bucket 0: → Entry1
Bucket 1: → Entry2  
Bucket 2: → Entry3
Bucket 3: → Entry4
Bucket 4: → Entry5
// Поиск = O(1)
```

### Плохое распределение (много коллизий)

```
Bucket 0: (пустой)
Bucket 1: (пустой)
Bucket 2: → Entry1 → Entry2 → Entry3 → Entry4 → Entry5
Bucket 3: (пустой)
Bucket 4: (пустой)
// Поиск = O(n) - как в обычном списке!
```

## Как диагностировать проблемы с buckets

```csharp
public static void AnalyzeBucketDistribution<TKey, TValue>(Dictionary<TKey, TValue> dict)
{
    // Рефлексия для доступа к внутренним полям (только для диагностики!)
    var bucketsField = typeof(Dictionary<TKey, TValue>)
        .GetField("buckets", BindingFlags.NonPublic | BindingFlags.Instance);
    var entriesField = typeof(Dictionary<TKey, TValue>)
        .GetField("entries", BindingFlags.NonPublic | BindingFlags.Instance);
    
    var buckets = (int[])bucketsField.GetValue(dict);
    var entries = (Array)entriesField.GetValue(dict);
    
    // Анализируем распределение
    int emptyBuckets = 0;
    int maxChainLength = 0;
    
    for (int i = 0; i < buckets.Length; i++)
    {
        if (buckets[i] == -1)
        {
            emptyBuckets++;
        }
        else
        {
            // Считаем длину цепочки в этом bucket
            int chainLength = CountChainLength(buckets[i], entries);
            maxChainLength = Math.Max(maxChainLength, chainLength);
        }
    }
    
    Console.WriteLine($"Всего buckets: {buckets.Length}");
    Console.WriteLine($"Пустых buckets: {emptyBuckets}");
    Console.WriteLine($"Максимальная длина цепочки: {maxChainLength}");
    Console.WriteLine($"Load Factor: {dict.Count / (float)buckets.Length:F2}");
}
```

## Оптимизация работы с buckets

```csharp
// 1. Правильный начальный размер
var dict = new Dictionary<string, int>(capacity: 1000); // Избегаем resize

// 2. Хороший GetHashCode для равномерного распределения
public override int GetHashCode()
{
    return HashCode.Combine(Field1, Field2, Field3); // Хорошее распределение
}

// 3. Мониторинг производительности
var stopwatch = Stopwatch.StartNew();
var value = dict["key"];
if (stopwatch.ElapsedTicks > threshold)
{
    // Возможно, слишком много коллизий
    AnalyzeBucketDistribution(dict);
}
```

**Ключевая идея**: buckets - это "адресная книга" хеш-таблицы. Хорошее распределение по buckets = быстрый поиск O(1), плохое распределение = медленный поиск O(n).