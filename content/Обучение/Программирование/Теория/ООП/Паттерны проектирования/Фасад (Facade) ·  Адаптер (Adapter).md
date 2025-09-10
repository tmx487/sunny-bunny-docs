## Паттерн Фасад (Facade)

**Цель:** Упростить интерфейс к сложной подсистеме, предоставив единую точку входа.

```csharp
// Сложная подсистема
class DatabaseManager
{
    public void Connect() => Console.WriteLine("Подключение к БД");
    public void ExecuteQuery(string sql) => Console.WriteLine($"Выполнение: {sql}");
    public void Disconnect() => Console.WriteLine("Отключение от БД");
}

class Logger
{
    public void LogInfo(string message) => Console.WriteLine($"INFO: {message}");
    public void LogError(string error) => Console.WriteLine($"ERROR: {error}");
}

class EmailService
{
    public void SendEmail(string to, string subject) => 
        Console.WriteLine($"Отправка email: {to} - {subject}");
}

// Фасад - упрощенный интерфейс
class OrderFacade
{
    private DatabaseManager _db = new();
    private Logger _logger = new();
    private EmailService _email = new();

    public void ProcessOrder(int orderId, string customerEmail)
    {
        _db.Connect();
        _db.ExecuteQuery($"INSERT INTO orders VALUES ({orderId})");
        _logger.LogInfo($"Заказ {orderId} обработан");
        _email.SendEmail(customerEmail, "Заказ подтвержден");
        _db.Disconnect();
    }
}

// Использование
var orderProcessor = new OrderFacade();
orderProcessor.ProcessOrder(123, "user@email.com");
```

## Паттерн Адаптер (Adapter)

**Цель:** Позволить несовместимым классам работать вместе, "переводя" один интерфейс в другой.

```csharp
// Существующий класс с несовместимым интерфейсом
class OldPrinter
{
    public void PrintOldFormat(string text)
    {
        Console.WriteLine($"[Старый принтер]: {text}");
    }
}

// Интерфейс, который ожидает клиент
interface IModernPrinter
{
    void Print(string document, bool isColor);
}

// Адаптер
class PrinterAdapter : IModernPrinter
{
    private OldPrinter _oldPrinter;

    public PrinterAdapter(OldPrinter oldPrinter)
    {
        _oldPrinter = oldPrinter;
    }

    public void Print(string document, bool isColor)
    {
        // Адаптируем новый интерфейс к старому
        string prefix = isColor ? "[ЦВЕТНАЯ ПЕЧАТЬ] " : "[ЧБ ПЕЧАТЬ] ";
        _oldPrinter.PrintOldFormat(prefix + document);
    }
}

// Использование
var oldPrinter = new OldPrinter();
IModernPrinter modernPrinter = new PrinterAdapter(oldPrinter);
modernPrinter.Print("Документ", true);
```

## Ключевые различия

**Фасад:**

- Упрощает сложный интерфейс
- Скрывает детали реализации
- Один фасад → много подсистем

**Адаптер:**

- Делает несовместимые интерфейсы совместимыми
- "Переводит" один интерфейс в другой
- Один адаптер → один адаптируемый класс

Фасад упрощает то, что сложно, а Адаптер совмещает то, что несовместимо.