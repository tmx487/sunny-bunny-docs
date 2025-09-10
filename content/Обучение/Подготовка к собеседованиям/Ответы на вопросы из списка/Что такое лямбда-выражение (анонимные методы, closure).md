---
уровень: "[[junior]]"
секция: общее
пройдено: 
теги: 
дата: 02-05-2024
время: 19:13
---
> [docs](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/lambda-expressions)

> см. Рихтер, с.453 Упрощение 2

```c#
a lambda expression (=>) is being used to create an anonymous function.

(input-parameters) => expression // Expression lambda

(input-parameters) => { <sequence-of-statements> } // Statement lambda
```

Лямбда-выражение может быть преобразовано в тип [делегата](https://learn.microsoft.com/ru-ru/dotnet/csharp/language-reference/builtin-types/reference-types#the-delegate-type). Типы его параметров и возвращаемое значение определяют тип делегата, в который можно преобразовать лямбда-выражение. Если лямбда-выражение не возвращает значение, оно может быть преобразовано в один из типов делегата Action; в противном случае его можно преобразовать в один из типов делегатов Func.