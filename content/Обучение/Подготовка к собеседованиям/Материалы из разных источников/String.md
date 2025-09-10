> A string is an object of type [String](https://learn.microsoft.com/en-us/dotnet/api/system.string) whose value is text. Internally, the text is stored as a sequential read-only collection of [Char](https://learn.microsoft.com/en-us/dotnet/api/system.char) objects. There's no null-terminating character at the end of a C# string; therefore a C# string can contain any number of embedded null characters ('\0'). The [Length](https://learn.microsoft.com/en-us/dotnet/api/system.string.length) property of a string represents the number of `Char` objects it contains, not the number of Unicode characters. To access the individual Unicode code points in a string, use the [StringInfo](https://learn.microsoft.com/en-us/dotnet/api/system.globalization.stringinfo) object.

\- [msdn](#https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/strings/)

#### доступ к определенным символам строки - как в массиве

```c#
string s5 = "Printing backwards";

for (int i = 0; i < s5.Length; i++)
{
    System.Console.Write(s5[s5.Length - i - 1]);
}
// Output: "sdrawkcab gnitnirP"
```

> An **empty** string is an instance of a [System.String](https://learn.microsoft.com/en-us/dotnet/api/system.string) object that contains zero characters.
> 
> By contrast, a **null** string doesn't refer to an instance of a [System.String](https://learn.microsoft.com/en-us/dotnet/api/system.string) object and any attempt to call a method on a null string causes a [NullReferenceException](https://learn.microsoft.com/en-us/dotnet/api/system.nullreferenceexception). However, you can use null strings in concatenation and comparison operations with other strings.

## Strings, extension methods, and LINQ

Because the [String](https://learn.microsoft.com/en-us/dotnet/api/system.string) type implements [IEnumerable<\T>](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.ienumerable-1) + [[IEnumerable]], you can use the extension methods defined in the [Enumerable](https://learn.microsoft.com/en-us/dotnet/api/system.linq.enumerable) class on strings. To avoid visual clutter, these methods are excluded from IntelliSense for the [String](https://learn.microsoft.com/en-us/dotnet/api/system.string) type, but they're available nevertheless. You can also use LINQ query expressions on strings. For more information, see [LINQ and Strings](https://learn.microsoft.com/en-us/dotnet/csharp/linq) ([[Обучение/Подготовка к собеседованиям/Материалы из разных источников/LINQ]]).

