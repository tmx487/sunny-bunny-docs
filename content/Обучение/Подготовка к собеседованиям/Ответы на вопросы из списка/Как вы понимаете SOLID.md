---
уровень: "[[middle]]"
секция: общее
пройдено: 
теги: 
дата: 02-05-2024
время: 20:16
---

🔗[Architectural principles](#https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/architectural-principles#dependency-inversion)

Принципы SOLID — это набор из пяти основных принципов объектно-ориентированного программирования и дизайна, которые помогают создавать гибкие, масштабируемые и поддерживаемые программные системы. Вот краткое объяснение каждого из них:

### 1. **S - Single Responsibility Principle (Принцип единственной ответственности)**

**Определение**: Каждый класс должен иметь одну и только одну причину для изменения. Иными словами, класс должен иметь только одну ответственность или роль в системе.

**Пояснение**:
- Класс должен быть сфокусирован на одной задаче. Это облегчает его тестирование и поддержку.
- Если класс выполняет несколько функций, его сложнее изменить и тестировать.

**Пример**:
- Если у вас есть класс `Order`, который управляет данными заказа и также занимается отправкой уведомлений, это нарушает принцип SRP. Лучше разделить эти обязанности на два класса: один для управления данными заказа и другой для отправки уведомлений.

### 2. **O - Open/Closed Principle (Принцип открытости/закрытости)**

**Определение**: Сущности программного обеспечения (например, классы, модули, функции) должны быть открыты для расширения, но закрыты для модификации.

**Пояснение**:
- Это означает, что вы должны быть в состоянии расширять поведение класса без изменения его исходного кода.
- Используйте абстракции и наследование, чтобы добавлять новую функциональность, не нарушая существующую.

**Пример**:
- Если у вас есть класс `Shape`, который рассчитывает площадь, вместо того чтобы изменять этот класс для добавления нового типа фигуры, вы создаете новые классы, наследующие `Shape`, такие как `Circle` или `Rectangle`.

### 3. **L - Liskov Substitution Principle (Принцип подстановки Лисков)**

**Определение**: Объекты подкласса должны быть заменяемыми объектами базового класса без нарушения корректности программы.

**Пояснение**:
- Подклассы должны дополнять, а не изменять базовый класс. Если вы заменяете объект базового класса на объект подкласса, система должна работать корректно.
- Это помогает обеспечить правильное использование наследования.

**Пример**:
- Если у вас есть базовый класс `Bird` и подклассы `Sparrow` и `Penguin`, то методы, которые работают с `Bird`, не должны ломаться при использовании `Sparrow` или `Penguin`.

### 4. **I - Interface Segregation Principle (Принцип разделения интерфейсов)**

**Определение**: Клиенты не должны зависеть от интерфейсов, которые они не используют. Интерфейсы должны быть специализированными, а не общими.

**Пояснение**:
- Вместо создания одного большого интерфейса с множеством методов, создайте несколько маленьких интерфейсов с узкой специализацией.
- Это позволяет уменьшить зависимость от ненужных методов.

**Пример**:
- Вместо одного интерфейса `IMachine` с методами `Print`, `Scan`, `Fax`, создайте три отдельных интерфейса: `IPrinter`, `IScanner`, и `IFax`, и реализуйте их в соответствующих классах.

### 5. **D - Dependency Inversion Principle (Принцип инверсии зависимостей)**

🔗[### Dependency inversion](#https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/architectural-principles#dependency-inversion)

**Определение**: Модули верхнего уровня не должны зависеть от модулей нижнего уровня. Оба должны зависеть от абстракций. Абстракции не должны зависеть от деталей. Детали должны зависеть от абстракций.

**Пояснение**:
- Сначала определите абстракции (интерфейсы), а затем реализуйте их в конкретных классах.
- Это уменьшает зависимость от конкретных реализаций и облегчает замену компонентов.

**Пример**:
- Вместо того чтобы класс `OrderProcessor` напрямую зависел от класса `EmailService`, он должен зависеть от абстракции `IEmailService`. Это позволяет легко заменить реализацию `IEmailService` без изменения кода `OrderProcessor`.

### Примеры Применения

#### Пример нарушения SRP:
```csharp
public class User
{
    public string Name { get; set; }
    
    public void SaveToDatabase() 
    {
        // Код для сохранения пользователя в базу данных
    }

    public void SendEmailNotification() 
    {
        // Код для отправки уведомления по электронной почте
    }
}
```
#### Пример исправления SRP:
```csharp
public class User
{
    public string Name { get; set; }
}

public class UserRepository
{
    public void Save(User user) 
    {
        // Код для сохранения пользователя в базу данных
    }
}

public class EmailService
{
    public void SendNotification(User user) 
    {
        // Код для отправки уведомления по электронной почте
    }
}
```

#### Пример нарушения OCP:
```csharp
public class Rectangle
{
    public int Width { get; set; }
    public int Height { get; set; }
}

public class AreaCalculator
{
    public int CalculateArea(Rectangle rectangle)
    {
        return rectangle.Width * rectangle.Height;
    }
}
```
#### Пример исправления OCP:
```csharp
public interface IShape
{
    int CalculateArea();
}

public class Rectangle : IShape
{
    public int Width { get; set; }
    public int Height { get; set; }

    public int CalculateArea()
    {
        return Width * Height;
    }
}

public class Circle : IShape
{
    public int Radius { get; set; }

    public int CalculateArea()
    {
        return (int)(Math.PI * Radius * Radius);
    }
}

public class AreaCalculator
{
    public int CalculateArea(IShape shape)
    {
        return shape.CalculateArea();
    }
}
```

### Пример нарушения LSP

Принцип подстановки Лисков (Liskov Substitution Principle, LSP) гласит, что объекты базового типа должны заменяться объектами производных типов без изменения правильности программы. Нарушение этого принципа возникает, когда поведение подкласса не согласуется с поведением базового класса, что может привести к неожиданным результатам.

Рассмотрим пример, который демонстрирует нарушение принципа подстановки Лисков.

Допустим, у нас есть базовый класс `Bird` и два производных класса: `Penguin` и `Sparrow`.

```csharp
public class Bird
{
    public virtual void Fly()
    {
        Console.WriteLine("The bird is flying.");
    }
}

public class Sparrow : Bird
{
    public override void Fly()
    {
        Console.WriteLine("The sparrow is flying.");
    }
}

public class Penguin : Bird
{
    public override void Fly()
    {
        throw new NotSupportedException("Penguins can't fly!");
    }
}
```

### Проблема

В данном примере, класс `Penguin` наследует от класса `Bird`, но переопределяет метод `Fly` таким образом, что вызывает исключение `NotSupportedException`. Это нарушает принцип подстановки Лисков, поскольку мы не можем заменить экземпляр `Bird` на `Penguin` без нарушения корректности программы. Например:

```csharp
public void MakeBirdFly(Bird bird)
{
    bird.Fly();
}

Bird sparrow = new Sparrow();
MakeBirdFly(sparrow); // Все в порядке: "The sparrow is flying."

Bird penguin = new Penguin();
MakeBirdFly(penguin); // Исключение: NotSupportedException
```

Когда мы передаем `Penguin` в метод `MakeBirdFly`, мы ожидаем, что птица сможет летать, поскольку это поведение, определенное в базовом классе. Однако, когда `Penguin` пытается выполнить метод `Fly`, возникает исключение. Это и есть нарушение принципа подстановки Лисков.

### Как избежать нарушения LSP

Для соблюдения LSP в данном случае, лучше изменить структуру классов таким образом, чтобы класс `Penguin` не наследовался от `Bird`, если он не может выполнять все действия, которые выполняет базовый класс. Например, можно создать отдельные интерфейсы:

```csharp
public interface IFlyable
{
    void Fly();
}

public class Bird
{
    // Общие свойства и методы для всех птиц
}

public class Sparrow : Bird, IFlyable
{
    public void Fly()
    {
        Console.WriteLine("The sparrow is flying.");
    }
}

public class Penguin : Bird
{
    // Специфические методы для пингвинов
}
```

Теперь `Sparrow` реализует интерфейс `IFlyable`, а `Penguin` — нет. Это позволяет использовать `IFlyable` там, где требуется возможность полета, и избегать проблем с заменой одного типа другим.

Принцип разделения интерфейсов (Interface Segregation Principle, ISP) утверждает, что клиенты не должны зависеть от интерфейсов, которые они не используют. Это означает, что интерфейсы должны быть узко специализированными и предоставлять только те методы, которые действительно необходимы.

### Пример нарушения ISP

Рассмотрим пример, в котором один интерфейс содержит методы, не относящиеся к всем его реализациям:

```csharp
public interface IWorker
{
    void Work();
    void Eat();
}

public class HumanWorker : IWorker
{
    public void Work()
    {
        Console.WriteLine("Human is working.");
    }

    public void Eat()
    {
        Console.WriteLine("Human is eating.");
    }
}

public class RobotWorker : IWorker
{
    public void Work()
    {
        Console.WriteLine("Robot is working.");
    }

    public void Eat()
    {
        // Робот не ест, но обязан реализовать метод Eat.
        throw new NotImplementedException("Robots do not eat.");
    }
}
```

### Проблема

В этом примере `RobotWorker` нарушает принцип разделения интерфейсов, потому что он вынужден реализовывать метод `Eat`, который не имеет смысла для робота. Этот метод не используется роботом, но он присутствует в интерфейсе `IWorker`. Это делает интерфейс слишком широким и принуждает `RobotWorker` реализовывать методы, которые ему не нужны.

### Как исправить нарушение ISP

Чтобы исправить нарушение ISP, следует разделить интерфейс на несколько специализированных интерфейсов, чтобы клиенты могли зависеть только от тех методов, которые им действительно необходимы:

```csharp
public interface IWorker
{
    void Work();
}

public interface IFeeder
{
    void Eat();
}

public class HumanWorker : IWorker, IFeeder
{
    public void Work()
    {
        Console.WriteLine("Human is working.");
    }

    public void Eat()
    {
        Console.WriteLine("Human is eating.");
    }
}

public class RobotWorker : IWorker
{
    public void Work()
    {
        Console.WriteLine("Robot is working.");
    }
}
```

### Преимущества исправления

Теперь `HumanWorker` реализует оба интерфейса `IWorker` и `IFeeder`, потому что ему нужны оба метода. `RobotWorker` реализует только интерфейс `IWorker`, так как метод `Eat` не имеет смысла для робота. Это делает интерфейсы более специализированными и удобными в использовании, а также позволяет избежать ненужных зависимостей и реализаций.

### Пример нарушения DIP

Принцип инверсии зависимостей (Dependency Inversion Principle, DIP) — это один из пяти принципов SOLID, который гласит:

1. **Модули верхнего уровня не должны зависеть от модулей нижнего уровня. Оба типа модулей должны зависеть от абстракций (интерфейсов).**
2. **Абстракции не должны зависеть от деталей. Детали должны зависеть от абстракций.**

Это означает, что высокоуровневые модули (например, бизнес-логика) не должны напрямую зависеть от низкоуровневых модулей (например, реализации конкретных данных или сервисов), а оба типа модулей должны зависеть от абстракций (интерфейсов), которые могут быть внедрены в систему через инверсию зависимостей.

Рассмотрим пример, где нарушение DIP приводит к жесткой зависимости между высокоуровневыми и низкоуровневыми модулями:

```csharp
public class EmailService
{
    public void SendEmail(string message)
    {
        // Реализация отправки email
        Console.WriteLine($"Sending email with message: {message}");
    }
}

public class NotificationManager
{
    private EmailService _emailService;

    public NotificationManager()
    {
        _emailService = new EmailService(); // Зависимость от конкретной реализации
    }

    public void Notify(string message)
    {
        _emailService.SendEmail(message);
    }
}
```

### Проблема

В этом примере класс `NotificationManager` напрямую зависит от конкретного класса `EmailService`. Это жесткая зависимость и делает код трудным для тестирования и изменения. Если вам нужно заменить `EmailService` другой реализацией (например, сервисом отправки SMS), вы должны изменять код в `NotificationManager`, что нарушает принцип инверсии зависимостей.

### Как исправить нарушение DIP

Чтобы исправить нарушение DIP, следует ввести абстракции (интерфейсы) и использовать их в качестве зависимостей:

```csharp
// Интерфейс абстракции
public interface IMessageService
{
    void SendMessage(string message);
}

// Конкретная реализация интерфейса
public class EmailService : IMessageService
{
    public void SendMessage(string message)
    {
        // Реализация отправки email
        Console.WriteLine($"Sending email with message: {message}");
    }
}

// Конкретная реализация другого типа сервиса
public class SmsService : IMessageService
{
    public void SendMessage(string message)
    {
        // Реализация отправки SMS
        Console.WriteLine($"Sending SMS with message: {message}");
    }
}

// Класс, который зависит от абстракции, а не от конкретной реализации
public class NotificationManager
{
    private readonly IMessageService _messageService;

    // Зависимость внедряется через конструктор
    public NotificationManager(IMessageService messageService)
    {
        _messageService = messageService;
    }

    public void Notify(string message)
    {
        _messageService.SendMessage(message);
    }
}
```

### Преимущества исправления

Теперь `NotificationManager` зависит от абстракции `IMessageService`, а не от конкретной реализации `EmailService`. Это делает код гибким и легко тестируемым. Вы можете легко заменить `EmailService` на `SmsService` или другую реализацию, не изменяя код в `NotificationManager`. Также, вы можете использовать Dependency Injection (DI) для управления зависимостями, что делает код более модульным и поддерживаемым.

Использование SOLID принципов помогает создавать более структурированные, поддерживаемые и расширяемые программные системы. Они способствуют улучшению архитектуры кода и снижению рисков ошибок при внесении изменений.