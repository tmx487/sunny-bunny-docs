В C# `record` — это ссылочный тип, предназначенный для **неизменяемых (immutable)** объектов с **сравнением по значению**, а не по ссылке. Он отлично подходит для моделей данных, DTO, сообщений и пр.

---

## ✅ 1. Определение `record`

```csharp
public record Person(string Name, int Age);
```

Это _позиционный record_. C# сам генерирует `init`-свойства, конструктор, `Equals`, `GetHashCode`, `ToString`, `with`-копирование и т. д.

---

## ✅ 2. Инициализация record

### 🔹 2.1 Позиционный `record` через конструктор

```csharp
var person = new Person("Anna", 30);
```

### 🔹 2.2 `record` с именованными свойствами

```csharp
public record Person
{
    public string Name { get; init; }
    public int Age { get; init; }
}
```

#### Инициализация:

```csharp
var person = new Person { Name = "Anna", Age = 30 };
```

---

## ✅ 3. Использование `with`-выражения

```csharp
var updated = person with { Age = 31 };
```

Создаёт **копию** объекта с изменённым полем.

---

## ✅ 4. Сравнение по значению

```csharp
var a = new Person("Anna", 30);
var b = new Person("Anna", 30);

Console.WriteLine(a == b); // true
```

Это работает, потому что `record` переопределяет `Equals()` и `==`.

---

## ✅ 5. Пример с `record class` и `record struct`

```csharp
public record class User(string Login);    // ссылочный тип
public readonly record struct Point(int X, int Y); // значимый тип (с .NET 6+)
```

---

## ✅ 6. Преимущества `record`

- Иммутабельность по умолчанию (init-only свойства).
    
- Сравнение по значению.
    
- Удобное копирование через `with`.
    
- Автогенерируемый `ToString()`.
    

---

## ✅ 7. Пример полного использования

```csharp
public record Product(string Name, decimal Price);

var product1 = new Product("Coffee", 9.99m);
var product2 = product1 with { Price = 11.99m };

Console.WriteLine(product1);  // Product { Name = Coffee, Price = 9.99 }
Console.WriteLine(product2);  // Product { Name = Coffee, Price = 11.99 }

Console.WriteLine(product1 == product2); // false
```

---

## 🟡 Когда использовать `record`

- DTO, команды, события.
    
- Результаты API.
    
- Объекты, которые не должны меняться (например, модель представления).
    
- Когда важно сравнение по значению.
    

Если хочешь, могу помочь переписать конкретный `class` в `record`, или показать, как использовать его в твоём проекте.