---
уровень: "[[junior]]"
секция: общее
пройдено: 
теги: 
дата: 02-05-2024
время: 19:24
---
[A `when` exception filter](#https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/exception-handling-statements#a-when-exception-filter)

Along with an exception type, you can also specify an exception filter that further examines an exception and decides if the corresponding **catch** block handles that exception. An exception filter is a Boolean expression that follows the **when** keyword, as the following example shows:

```c#
try
{
    var result = Process(-3, 4);
    Console.WriteLine($"Processing succeeded: {result}");
}
catch (Exception e) when (e is ArgumentException || e is DivideByZeroException)
{
    Console.WriteLine($"Processing failed: {e.Message}");
}
````

The preceding example uses an exception filter to provide a single `catch` block to handle exceptions of two specified types.

You can provide several `catch` clauses for the same exception type if they distinguish by exception filters. One of those clauses might have no exception filter. If such a clause exists, it must be the last of the clauses that specify that exception type.

If a `catch` clause has an exception filter, it can specify the exception type that is the same as or less derived than an exception type of a `catch` clause that appears after it. For example, if an exception filter is present, a `catch (Exception e)` clause doesn't need to be the last clause.


#### Детали реализации

> При обнаружении блока catch нужного типа CLR исполняет все внутренние блоки finally, начиная со связанного с блоком try, в котором было вброшено исключение, и заканчивая блоком catch нужного типа. При этом ни один блок finally не выполняется до завершения действий с блоком catch, обрабатывающим исключение.

[[Библиотека/Книги/Рихтер Дж. - CLR via C#. Программирование на платформе Microsoft .NET Framework 4.5 на языке C#. 4-е изд. (Мастер-класс) - 2013.pdf#page=500&selection=116,0,140,11|Рихтер Дж. - CLR via C#. Программирование на платформе Microsoft .NET Framework 4.5 на языке C#. 4-е изд. (Мастер-класс) - 2013, страница 500]]

##### Пояснение

Когда в коде выбрасывается исключение, происходит несколько шагов:

1. **Поиск подходящего блока catch**: CLR (Common Language Runtime) начинает искать блок `catch`, который может обработать это исключение. Поиск начинается с самого внутреннего блока `try` и продолжается вверх по стеку вызовов.
    
2. **Выполнение блоков finally**: При поиске подходящего блока `catch`, CLR выполняет все блоки `finally`, начиная с того, который связан с текущим блоком `try`, в котором произошло исключение, и до самого верхнего блока `try`.
    
3. **Исполнение блока catch**: После того как был найден подходящий блок `catch`, он выполняется.

***Пример***

```c#
try
{
    // Внешний блок try
    try
    {
        // Внутренний блок try
        throw new Exception("Ошибка!");
    }
    catch (SpecificException ex)
    {
        // Этот блок catch не будет выполнен, так как тип исключения не совпадает
    }
    finally
    {
        // Этот блок finally будет выполнен
        Console.WriteLine("Выполнение внутреннего finally");
    }
}
catch (Exception ex)
{
    // Этот блок catch будет выполнен, так как тип исключения совпадает
    Console.WriteLine("Обработка исключения");
}
finally
{
    // Этот блок finally будет выполнен
    Console.WriteLine("Выполнение внешнего finally");
}
```

- Внутри внутреннего блока `try` выбрасывается исключение `Exception`.
- CLR начинает искать блок `catch`, который может обработать это исключение.
- Внутренний блок `catch` не подходит, так как он ловит исключения типа `SpecificException`, а у нас выброшено исключение типа `Exception`.
- CLR выполняет внутренний блок `finally`
- Далее CLR продолжает искать подходящий блок `catch` и находит его во внешнем блоке
- После выполнения блока `catch`, CLR выполняет внешний блок `finally`

#### Итоговая последовательность выполнения

1. Исключение выброшено во внутреннем блоке `try`.
2. Внутренний блок `finally` выполняется.
3. Внешний блок `catch` выполняется.
4. Внешний блок `finally` выполняется.