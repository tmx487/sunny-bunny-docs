**1. Когда нужно равенство по значению вместо равенства по ссылке:**

```csharp
public class Person
{
    public string Name { get; set; }
    public int Age { get; set; }
    
    // Без перегрузки два объекта с одинаковыми данными не будут равны
    // С перегрузкой - будут равны, если Name и Age одинаковы
}
```

**2. При использовании объектов в коллекциях, зависящих от хеширования:**

- `Dictionary<TKey, TValue>` (в качестве ключа)
- `HashSet<T>`
- `Hashtable`
- Методы `Distinct()`, `Union()`, `Intersect()` в LINQ

**3. Для value objects и data objects:**

```csharp
public class Money
{
    public decimal Amount { get; }
    public string Currency { get; }
    
    // Два объекта Money с одинаковой суммой и валютой должны быть равны
}
```

## Правила перегрузки

**Обязательно перегружать оба метода вместе:**

```csharp
public class Person : IEquatable<Person>
{
    public string Name { get; }
    public int Age { get; }
    
    public Person(string name, int age)
    {
        Name = name ?? throw new ArgumentNullException(nameof(name));
        Age = age;
    }
    
    // 1. Перегрузка Equals(object)
    public override bool Equals(object obj)
    {
        return Equals(obj as Person);
    }
    
    // 2. Типизированный Equals (IEquatable<T>)
    public bool Equals(Person other)
    {
        if (other is null) return false;
        if (ReferenceEquals(this, other)) return true;
        
        return Name == other.Name && Age == other.Age;
    }
    
    // 3. GetHashCode
    public override int GetHashCode()
    {
        return HashCode.Combine(Name, Age);
    }
    
    // 4. Операторы == и !=
    public static bool operator ==(Person left, Person right)
    {
        return EqualityComparer<Person>.Default.Equals(left, right);
    }
    
    public static bool operator !=(Person left, Person right)
    {
        return !(left == right);
    }
}
```
## Когда НЕ нужно перегружать

- Если класс использует равенство по ссылке (например, для entity objects с идентификаторами)
- Если объекты класса изменяемы и используются в качестве ключей в хеш-коллекциях
- Для большинства обычных классов с поведением

## Важные требования

**Контракт Equals:**

- Рефлексивность: `x.Equals(x)` всегда `true`
- Симметричность: `x.Equals(y)` == `y.Equals(x)`
- Транзитивность: если `x.Equals(y)` и `y.Equals(z)`, то `x.Equals(z)`
- Консистентность: результат не должен изменяться

**Контракт GetHashCode:**

- Если `x.Equals(y)`, то `x.GetHashCode()` == `y.GetHashCode()`
- Хеш-код не должен изменяться для неизменяемых объектов
- Должен быть равномерно распределен

Перегрузка этих методов особенно важна для классов, представляющих значения или данные, а не сущности с уникальной идентичностью.