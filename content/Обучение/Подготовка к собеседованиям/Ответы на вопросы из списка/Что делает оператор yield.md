---
уровень: "[[junior]]"
секция: типы, структуры и коллекции данных
пройдено: 
теги: 
дата: 02-05-2024
время: 19:56
---
Оператор `yield` в C# **используется для реализации итераторов** в методах и позволяет **возвращать значения последовательности по одному за раз,** а не сразу всю коллекцию. Он упрощает создание последовательностей без необходимости создавать временные коллекции.

```csharp
class MyClass
{
	public List<int> myList = new(){1,2,4,3,8,3};

	public void Method()
	{
		foreach(int item in myList)
		{
			Console.WriteLine(item);
		}
		foreach(int item in ReturnYieldMethod())
		{
			Console.WriteLine(item);
		}
	}
	public IEnumerable ReturnYieldMethod()
	{
		foreach(int item in myList)
		{
			if (item % 2 == 0)
				yield return item;
			if (item > 6)
				yield break;
		}
	}
}
```


```csharp
// Пример 1: Итератор для простого последовательного вывода чисел
using System;
using System.Collections.Generic;

public class Program
{
    public static void Main()
    {
        foreach (int number in GetNumbers())
        {
            Console.WriteLine(number);
        }
    }

    public static IEnumerable<int> GetNumbers()
    {
        yield return 1;
        yield return 2;
        yield return 3;
        yield return 4;
        yield return 5;
    }
}
```

```c#
// Пример 2: Итератор для генерации чисел Фибоначчи
using System;
using System.Collections.Generic;

public class Program
{
    public static void Main()
    {
        foreach (int number in GetFibonacciSequence(10))
        {
            Console.WriteLine(number);
        }
    }

    public static IEnumerable<int> GetFibonacciSequence(int count)
    {
        int previous = 0, current = 1;

        for (int i = 0; i < count; i++)
        {
            yield return previous;
            int temp = previous;
            previous = current;
            current = temp + current;
        }
    }
}
```

### Принцип работы оператора `yield`

- **`yield return`**: Используется для возвращения каждого элемента по одному. Когда метод вызывает `yield return`, текущая позиция метода сохраняется, и при следующем вызове итерации выполнение возобновляется с этой позиции.
- **`yield break`**: Используется для завершения итерации досрочно.

```c#
using System;
using System.Collections.Generic;

public class Program
{
    public static void Main()
    {
        foreach (int number in GetEvenNumbers(10))
        {
            Console.WriteLine(number);
        }
    }

    public static IEnumerable<int> GetEvenNumbers(int max)
    {
        for (int i = 0; i <= max; i++)
        {
            if (i % 2 == 0)
            {
                yield return i;
            }
            else if (i > 5)
            {
                yield break; // Прекратить итерацию после i > 5
            }
        }
    }
}

// если одновременно убрать yield в строках 20 и 24, то в строке 20 будет
// ошибка: 
// Error	CS1622	Cannot return a value from an iterator. Use the yield
// return statement to return a value, or yield break to end the
// iteration.
// а в строке 14:
```

### Преимущества использования `yield`

1. **Ленивое вычисление**: Значения вычисляются только по мере необходимости, что может улучшить производительность и уменьшить использование памяти.
2. **Упрощение кода**: Упрощает написание итераторов, устраняя необходимость в дополнительной логике и временных коллекциях.
3. **Читаемость и поддерживаемость**: Код, использующий `yield`, зачастую более компактный и легкий для понимания.

Оператор `yield` полезен, когда нужно реализовать метод, который возвращает последовательность значений, вычисляемых на лету, без необходимости предварительно вычислять всю последовательность и хранить её в памяти.