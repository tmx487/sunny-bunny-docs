---
уровень: "[[junior]]"
секция: классы, структуры и интерфейсы
пройдено: 
теги: 
дата: 02-05-2024
время: 20:05
---
The [readonly](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/readonly) keyword differs from the `const` keyword. A `const` field can only be initialized at the declaration of the field. A `readonly` field can be initialized either at the declaration or in a constructor. Therefore, `readonly` fields can have different values depending on the constructor used. Also, although a `const` field is a compile-time constant, the `readonly` field can be used for run-time constants, as in this line:
`public static readonly uint l1 = (uint)DateTime.Now.Ticks;`

Ключевое слово readonly отличается от ключевого слова const. Константное поле может быть инициализировано только при объявлении поля. Поле только для чтения может быть инициализировано либо в объявлении, либо в конструкторе. Таким образом, поля только для чтения могут иметь разные значения в зависимости от используемого конструктора. Кроме того, хотя поле const является константой времени компиляции, поле readonly можно использовать для констант времени выполнения, как в этой строке: public static readonly uint l1 = (uint)DateTime.Now.Ticks;

- константе обязательно должно быть присвоено значение в месте ее объявления (иначе будет ошибка: CS0145	A const field requires a value to be provided), при этом далее в коде нельзя будет изменить ее значение (т.е. написать так как ниже)

```c#
public class MyCalss
{
	public const int PI = 3,14;
}

public class SomeClass
{
	PI = 1; // будет ошибка
}
```

- все константы неявно статические, при этом указать модификатор `static` нельзя

readonly
- в отличие от `const` не нужно в месте объявления инициализировать значение
- не является по умолчанию `static`, но его можно сделать явно статическим: `public static readonly int a;` (при этом стоит учесть, что инициализация значением `static readonly` может быть осуществлена либо в `static`, либо в месте объявления)

урок 69 от SimpleCode