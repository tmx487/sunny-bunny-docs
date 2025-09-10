# Основное

**Словарь** — это коллекция, в которой каждый элемент является парой "ключ/значение". Словари чаще всего применяются для поиска и представления сортированных списков.

В .NET определен стандартный протокол для словарей через интерфейсы `IDictionary` и `IDictionaryCTKey, TValue>`, а также набор универсальных (generic) классов словарей:

- **Dictionary<TKey, TValue>** - основной класс словаря с быстрым поиском по ключу

- **SortedDictionary<TKey, TValue>** - словарь с автоматической сортировкой по ключам

- **ConcurrentDictionary<TKey, TValue>** - потокобезопасный словарь для многопоточности

- **SortedList<TKey, TValue>** - гибрид словаря и списка с сортировкой

> **Необобщенная версия** `Dictionary<TKey,TValue>` называется **Hashtable**; необобщенного класса, который бы имел имя "Dictionary", не существует. Когда мы ссылаемся просто на `Dictionary`, то имеем в виду обобщенный класс `Dictionary<TKey,TValue>.
 [[Библиотека/Книги/Албахари Дж C# 9.0. Справочник. Полное описание языка 2022.pdf#page=402&selection=97,0,168,0|Албахари Дж C# 9.0. Справочник. Полное описание языка 2022, страница 402]]


```cs
public interface IDictionary <ТКеу, TValue> :
	ICollection <KeyValuePair <TKey, TValue>>, IEnumerable
{
	bool ContainsKey (TKey key);
	bool TryGetValue (TKey key, out TValue value);
	void Add(TKey key, TValue value);
	bool Remove(TKey key);
	TValue this [TKey key]  { get; set; } // Основной индексатор - по ключу
	ICollection <TKey> Keys { get; }      // Возвращает только ключи
	ICollection <TValue> Values { get; }  // Возвращает только значения
}
```

#### 〽️Как добавить новый элемент в словарь

| Индексатор `[]`                                                                                                                               | **Метод `Add()`**                                                                                                                      |
| --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| - Если ключ существует - **перезаписывает** значение<br>- Если ключа нет - **добавляет** новый элемент<br>- Никогда не выбрасывает исключение | - Если ключ уже существует - выбрасывает `ArgumentException`<br>- Если ключа нет - добавляет новый элемент<br>- Более строгий контроль |
**Рекомендация**: `[]` для простого добавления/обновления, `Add()` когда важно избежать случайной перезаписи.

#### 〽️Как извлечь элемент из словаря

- **Через индексатор `[]`** (если ключа нет, выбросит `KeyNotFoundException`)
- **Безопасный метод `TryGetValue()`**

> Лежащая в основе `Dictionary` **хеш-таблица преобразует ключ каждого элемента в целочисленный хеш-код** — псевдоуникальное значение — и **затем применяет алгоритм для преобразования хеш-кода в хеш-ключ**. Такой хеш-ключ используется внутренне для определения, к какому "сегменту" (иначе [[buckets|bucket]]) относится запись. Если сегмент содержит более одного значения, тогда в нем производится линейный поиск. Хорошая хеш-функция не стремится возвращать строго уникальные хеш-коды (что обычно невозможно); она старается вернуть хеш-коды, которые равномерно распределены в пространстве 32-битных целых чисел. Это позволяет избежать сценария с получением нескольких очень крупных (и неэффективных) сегментов.

[[Библиотека/Книги/Албахари Дж C# 9.0. Справочник. Полное описание языка 2022.pdf#page=402&selection=626,0,835,0|Албахари Дж C# 9.0. Справочник. Полное описание языка 2022, страница 402]]

>**Благодаря своей возможности определения эквивалентности ключей и получения хеш-кодов словарь может работать с ключами любого типа.** По умолчанию эквивалентность определяется с помощью метода `object.Equals` ключа, а псевдоуникальный хеш-код получается через метод `GetHashCode` ключа. Такое поведение можно изменить, либо переопределив указанные методы, либо предоставив при конструировании словаря объект, который реализует интерфейс `IEqualityComparer`.

[[Библиотека/Книги/Албахари Дж C# 9.0. Справочник. Полное описание языка 2022.pdf#page=403&selection=0,0,80,0|Албахари Дж C# 9.0. Справочник. Полное описание языка 2022, страница 403]]

> Недостаток Dictionary и Hashtable связан с тем, что **элементы не отсортированы**. Кроме того, **первоначальный порядок**, в котором добавлялись элементы, **не предохраняется**.

[[Библиотека/Книги/Албахари Дж C# 9.0. Справочник. Полное описание языка 2022.pdf#page=403&selection=295,0,345,0|Албахари Дж C# 9.0. Справочник. Полное описание языка 2022, страница 403]]

---
# Ключевые проблемы словарей

## Коллизии в хеш-таблицах

**Что это такое**: когда разные ключи дают одинаковый хеш-код.

```csharp
// Плохой пример - много коллизий
public class BadKey
{
    public string Name { get; set; }
    public override int GetHashCode() => 1; // Все объекты дают один хеш!
}
```

**Последствия коллизий**:

- Поиск замедляется с O(1) до O(n)
- Память расходуется неэффективно
- Производительность падает в разы

**Как избежать**:

```csharp
public class GoodKey
{
    public string Name { get; set; }
    public int Id { get; set; }
    
    public override int GetHashCode()
    {
        return HashCode.Combine(Name, Id); // .NET Core 2.1+
    }
    
    public override bool Equals(object obj)
    {
        // Обязательно переопределяем Equals вместе с GetHashCode
    }
}
```

## Проблемы с потокобезопасностью

**Dictionary НЕ потокобезопасен**:

```csharp
// Опасно в многопоточности!
var cache = new Dictionary<string, User>();

// Thread 1
cache["user1"] = new User();

// Thread 2 - может привести к крашу
cache["user2"] = new User();
```

**Решения**:

```csharp
// 1. ConcurrentDictionary
var safeCache = new ConcurrentDictionary<string, User>();

// 2. Блокировки (медленнее)
private readonly object _lock = new object();
lock (_lock)
{
    cache["key"] = value;
}

// 3. ReaderWriterLockSlim для read-heavy сценариев
```

## Утечки памяти

**Проблема**: словари держат ссылки на объекты.

```csharp
// Плохо - объекты никогда не освободятся
var eventHandlers = new Dictionary<string, List<EventHandler>>();
eventHandlers["userLogin"].Add(SomeHandler);
// SomeHandler никогда не будет удален из памяти
```

**Решения**:

```csharp
// 1. WeakReference для больших объектов
var cache = new Dictionary<string, WeakReference<User>>();

// 2. Явная очистка
cache.Clear();

// 3. Использование IDisposable
using var tempCache = new Dictionary<string, IDisposable>();
```

## Проблемы производительности

**Частые изменения размера**:

```csharp
// Плохо - много перевыделений памяти
var dict = new Dictionary<string, int>(); // Capacity = 0
for (int i = 0; i < 100000; i++)
{
    dict.Add($"key{i}", i); // Постоянные resize
}

// Хорошо - заранее выделяем память
var dict = new Dictionary<string, int>(100000);
```

**Неправильные типы ключей**:

```csharp
// Медленно - строки как ключи для больших объемов
var cache = new Dictionary<string, Data>();

// Быстрее - числовые ключи
var cache = new Dictionary<int, Data>();

// Или используем StringComparer для оптимизации строк
var cache = new Dictionary<string, Data>(StringComparer.OrdinalIgnoreCase);
```

## Проблемы в production

**1. KeyNotFoundException**:

```csharp
// Защищаемся везде
if (!userPermissions.TryGetValue(userId, out var permissions))
{
    logger.LogWarning("User {UserId} not found in permissions", userId);
    return defaultPermissions;
}
```

**2. Слишком большие словари**:

```csharp
// Мониторим размер
if (cache.Count > maxCacheSize)
{
    // Очищаем старые записи
    CleanupOldEntries();
}
```

**3. Проблемы сериализации**:

```csharp
// ConcurrentDictionary может не сериализоваться корректно
// Конвертируем для JSON
var serializable = concurrentDict.ToDictionary(kvp => kvp.Key, kvp => kvp.Value);
```

## Лучшие практики для production

```csharp
// 1. Логирование и мониторинг
if (!cache.TryGetValue(key, out var value))
{
    metrics.IncrementCounter("cache.miss");
}

// 2. Graceful degradation
var user = userCache.GetValueOrDefault(userId) ?? LoadFromDatabase(userId);

// 3. Bounded collections для предотвращения OutOfMemory
if (cache.Count >= maxSize)
{
    cache.Remove(cache.Keys.First()); // LRU eviction
}
```

**Главное правило**: всегда используйте `TryGetValue()` вместо прямого обращения через `[]` в production-коде.
# Часто используемые методы
### Добавление и обновление

**`TryAdd(key, value)`** - безопасное добавление без перезаписи:

```csharp
if (cache.TryAdd("user:123", userData)) 
{
    // Успешно добавлено
}
```

**`dict[key] = value`** - добавление или обновление:

```csharp
userSettings["theme"] = "dark"; // Всегда работает
```

### Извлечение данных

**`TryGetValue(key, out value)`** - самый используемый метод:

```csharp
if (cache.TryGetValue("user:123", out var user))
{
    return user;
}
return defaultUser;
```

**`GetValueOrDefault(key, defaultValue)`** (.NET 6+):

```csharp
var theme = settings.GetValueOrDefault("theme", "light");
```

### Проверка существования

**`ContainsKey(key)`** - проверка наличия ключа:

```csharp
if (permissions.ContainsKey(userId))
{
    // У пользователя есть права
}
```

### Удаление

**`Remove(key)`** - удаление элемента:

```csharp
cache.Remove("expired:key");
```

**`TryRemove(key, out value)`** - для ConcurrentDictionary:

```csharp
if (concurrentCache.TryRemove("key", out var removedValue))
{
    // Элемент удален, можем использовать removedValue
}
```

### Массовые операции

**`Clear()`** - очистка всего словаря:

```csharp
tempCache.Clear(); // Освобождаем память
```

**`Count`** - количество элементов:

```csharp
if (activeUsers.Count > maxLimit)
{
    // Превышен лимит
}
```

### Итерация

**Перебор ключей и значений**:

```csharp
foreach (var (userId, userData) in activeUsers)
{
    ProcessUser(userId, userData);
}
```

**Работа только с ключами или значениями**:

```csharp
foreach (var userId in activeUsers.Keys)
{
    NotifyUser(userId);
}
```

### Специальные методы для ConcurrentDictionary

**`AddOrUpdate(key, addValue, updateFunction)`**:

```csharp
var newCount = counters.AddOrUpdate("requests", 1, (key, oldValue) => oldValue + 1);
```

**`GetOrAdd(key, valueFactory)`**:

```csharp
var user = userCache.GetOrAdd(userId, id => LoadUserFromDatabase(id));
```

**Самые критичные**: `TryGetValue()`, `TryAdd()`, `ContainsKey()`, `Remove()` - эти четыре метода покрывают 90% случаев использования в production.
