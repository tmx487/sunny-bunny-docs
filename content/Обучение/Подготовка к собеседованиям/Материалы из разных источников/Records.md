
🔗 [msdn](#https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/records)

## When to use records

Consider using a record in place of a class or struct in the following scenarios:

- You want to define a data model that depends on [value equality](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/statements-expressions-operators/equality-comparisons#value-equality).
- You want to define a type for which objects are immutable.

### Так говорил ChatGPT

В C# `record` — это тип данных, введенный в C# 9.0, предназначенный для создания неизменяемых объектов (immutable objects), которые упрощают работу с данными, особенно если эти данные представляют собой набор полей, таких как объекты DTO (Data Transfer Object). `record` обладает рядом особенностей и преимуществ по сравнению с классами и структурами:

### Основные особенности `record`:

1. **Неизменяемость (Immutable по умолчанию)**:
   - Свойства, объявленные в `record`, по умолчанию неизменяемы (имеют только get-аксессоры), что делает `record` отличным выбором для представления объектов данных, которые не должны изменяться после создания.
   - Можно добавить `init`-аксессоры, которые позволяют инициализировать свойства только во время создания объекта.

2. **Value Equality (Сравнение по значению)**:
   - В отличие от классов, которые по умолчанию сравниваются по ссылке, `record` сравниваются по значению. Это означает, что два экземпляра `record` считаются равными, если все их свойства равны.
   
   ```csharp
   public record Person(string FirstName, string LastName);

   var person1 = new Person("John", "Doe");
   var person2 = new Person("John", "Doe");

   Console.WriteLine(person1 == person2); // True, так как все свойства равны
   ```

3. **Сокращенный синтаксис**:
   - Для `record` предусмотрен лаконичный синтаксис с использованием позиционных параметров, что делает код более чистым и компактным.

   ```csharp
   public record Person(string FirstName, string LastName);
   ```

   Такой код создает `record` с двумя свойствами, автоматически реализует методы `ToString`, `Equals`, `GetHashCode` и позволяет использовать `deconstruct` (деконструкцию).

4. **Деконструкция**:
   - `record` автоматически поддерживают деконструкцию, позволяя легко извлекать значения свойств в отдельные переменные.

   ```csharp
   var person = new Person("John", "Doe");
   var (firstName, lastName) = person;
   ```

5. **Существуют классы и структуры-record**:
   - Record могут быть как `class`, так и `struct`. Использование ключевого слова `record struct` позволяет создавать неизменяемые структуры.

   ```csharp
   public record struct Point(int X, int Y);
   ```

### Пример использования `record`:

```csharp
public record Person(string FirstName, string LastName);

var person1 = new Person("John", "Doe");
var person2 = new Person("John", "Doe");

Console.WriteLine(person1 == person2); // True, так как все свойства равны

// Деконструкция
var (firstName, lastName) = person1;
Console.WriteLine(firstName); // John
Console.WriteLine(lastName); // Doe

// Неизменяемость
// person1.FirstName = "Jane"; // Ошибка компиляции, так как свойства только для чтения
```

### Когда использовать `record`?

- Когда вам нужно создать объект данных, который представляет собой набор полей, и при этом вам важно, чтобы сравнение объектов происходило по значению, а не по ссылке.
- Когда вы хотите, чтобы объекты были неизменяемыми.
- Когда требуется компактный и лаконичный синтаксис для определения DTO, ViewModel или других простых объектов данных. 

`record` в C# предоставляют мощные инструменты для работы с неизменяемыми данными и существенно упрощают разработку за счет встроенной поддержки равенства по значению, удобного синтаксиса и возможности деконструкции.