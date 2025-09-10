---
уровень: "[[junior]]"
секция: общее
пройдено: 
теги: 
дата: 2024-05-02T00:00:00
время: 19:23
---

📑[[Почему вместо Excpetion советуют использовать паттерн ResultObject]]

`Exception` в C# — это базовый класс, который представляет ошибки, возникающие во время выполнения программы. Когда происходит ошибка, программа генерирует (или "выбрасывает") исключение, которое может быть обработано с помощью блоков `try-catch` для предотвращения падения программы.

### Основные моменты о `Exception`

1. **Иерархия классов исключений**:
   - `Exception` — это базовый класс для всех исключений в .NET.
   - От `Exception` наследуются другие классы, представляющие конкретные виды ошибок, такие как:
     - `SystemException` (например, `NullReferenceException`, `IndexOutOfRangeException`, `InvalidOperationException`).
     - `ApplicationException` — используется для создания пользовательских исключений, но в современных приложениях рекомендуется напрямую наследоваться от `Exception`.
     - `IOException` — для ошибок ввода-вывода.
     - `ArgumentException` — для ошибок, связанных с недопустимыми аргументами методов.

2. **Создание и выбрасывание исключений**:
   - Исключения могут быть выброшены с использованием оператора `throw`.
   - Пример:
     ```csharp
     public void Divide(int a, int b)
     {
         if (b == 0)
         {
             throw new DivideByZeroException("Деление на ноль невозможно.");
         }
         Console.WriteLine(a / b);
     }
     ```
   - В этом примере, если значение `b` равно нулю, выбрасывается исключение `DivideByZeroException`.

3. **Обработка исключений**:
   - Исключения могут быть перехвачены и обработаны с помощью блока `try-catch`.
   - Пример:
     ```csharp
     try
     {
         Divide(10, 0);
     }
     catch (DivideByZeroException ex)
     {
         Console.WriteLine($"Ошибка: {ex.Message}");
     }
     finally
     {
         Console.WriteLine("Завершение работы метода.");
     }
     ```
   - Здесь, если происходит деление на ноль, исключение перехватывается, и программа продолжает работу, не завершаясь аварийно.

4. **Свойства класса `Exception`**:
   - `Message` — содержит текстовое описание ошибки.
   - `StackTrace` — возвращает строку, представляющую последовательность вызовов методов, которая привела к исключению.
   - `InnerException` — предоставляет вложенное исключение, если одно исключение вызвано другим.
   - `Data` — возвращает коллекцию пар "ключ-значение", которая может содержать дополнительные пользовательские данные о произошедшем исключении.

5. **Пример создания пользовательского исключения**:
   - Вы можете создать собственное исключение, унаследовавшись от `Exception`:
     ```csharp
     public class MyCustomException : Exception
     {
         public MyCustomException(string message) : base(message) { }
     }
     ```

### Основные типы исключений в C#

- **`NullReferenceException`**: возникает при попытке использования объекта, который равен `null`.
- **`ArgumentException`**: возникает при передаче недопустимого аргумента методу.
- **`InvalidOperationException`**: возникает при вызове метода, который недопустим в текущем состоянии объекта.
- **`IOException`**: возникает при ошибках ввода-вывода, например, при работе с файлами.
- **`DivideByZeroException`**: возникает при делении на ноль.

### Когда использовать исключения

Исключения следует использовать для обработки непредвиденных ситуаций, которые делают дальнейшее выполнение программы невозможным или некорректным. Примеры таких ситуаций включают деление на ноль, попытки доступа к несуществующим файлам или неправильное использование API. Исключения не должны использоваться для управления обычными потоками выполнения программы, так как это может негативно сказаться на производительности и читабельности кода.

[Exceptions are created by using the `throw` keyword](#https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/exceptions/)

Before the catch block is executed, the runtime checks for finally blocks. Finally blocks enable the programmer to clean up any ambiguous state that could be left over from an aborted try block, or to release any external resources (such as graphics handles, database connections, or file streams) without waiting for the garbage collector in the runtime to finalize the objects (take from [this](#https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/exceptions/using-exceptions)).

If no compatible `catch` block is found on the call stack after an exception is thrown, one of three things occurs [link](#https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/exceptions/using-exceptions):

- If the exception is within a [finalizer](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/finalizers), the finalizer is aborted and the base finalizer, if any, is called.
- If the call stack contains a static constructor, or a static field initializer, a [TypeInitializationException](https://learn.microsoft.com/en-us/dotnet/api/system.typeinitializationexception) is thrown, with the original exception assigned to the [InnerException](https://learn.microsoft.com/en-us/dotnet/api/system.exception.innerexception) property of the new exception.
- If the start of the thread is reached, the thread is terminated.

A `catch` block can specify the type of exception to catch. The type specification is called an **_exception filter_**. The exception type should be derived from [Exception](https://learn.microsoft.com/en-us/dotnet/api/system.exception). In general, don't specify [Exception](https://learn.microsoft.com/en-us/dotnet/api/system.exception) as the exception filter unless either you know how to handle all exceptions that might be thrown in the `try` block, or you've included a [`throw` statement](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/exception-handling-statements#the-throw-statement) at the end of your `catch` block. [link](#https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/exceptions/exception-handling)