---
уровень: "[[junior]]"
секция: классы, структуры и интерфейсы
пройдено: 
теги: 
дата: 02-05-2024
время: 20:04
---
[Классы и структуры: когда использовать ovveride и new](#https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/knowing-when-to-use-override-and-new-keywords)

Виртуальные методы используются для управления версиями типов (см. [[Библиотека/Книги/Рихтер Дж. - CLR via C#. Программирование на платформе Microsoft .NET Framework 4.5 на языке C#. 4-е изд. (Мастер-класс) - 2013.pdf#page=205&selection=37,0,43,14|Рихтер Дж. - CLR via C#. Программирование на платформе Microsoft .NET Framework 4.5 на языке C#. 4-е изд. (Мастер-класс) - 2013, страница 205]])

В C# метод в классе-наследнике может иметь такое же название, что и метод в базовом классе. Можно указать какой именно нужно будет вызывать посредством ключевых слов `new` и `override`. Модификатор `override` ***расширяет*** базовый виртуальный метод, а модификатор`new` ***скрывает*** доступный метод базового класса

```csharp
using System;  
using System.Text;  
  
namespace OverrideAndNew  
{  
    class Program  
    {  
        static void Main(string[] args)  
        {  
            BaseClass bc = new BaseClass();  
            DerivedClass dc = new DerivedClass();  
            BaseClass bcdc = new DerivedClass();  
  
            // The following two calls do what you would expect. They call  
            // the methods that are defined in BaseClass.  
            bc.Method1();  // Base - Method1
            bc.Method2();  // Base - Method2 
            
            // The following two calls do what you would expect. They call  
            // the methods that are defined in DerivedClass.  
            dc.Method1();  // Derived - Method1 
            dc.Method2();  // Derived - Method2 
            
            // The following two calls produce different results, depending
            // on whether override (Method1) or new (Method2) is used.  
            bcdc.Method1();  // Derived - Method1
            bcdc.Method2();  // Base - Method2 
        }  
    }  
  
    class BaseClass  
    {  
        public virtual void Method1() => Console.WriteLine("Base - Method1");   
        public virtual void Method2() => Console.WriteLine("Base - Method2");
    }  
  
    class DerivedClass : BaseClass  
    {  
        public override void Method1() => Console.WriteLine("Derived - Method1");
  
        public new void Method2() => Console.WriteLine("Derived - Method2");
    }  
}
```

> `virtual` - пишется в базовом классе, а `ovveride` (или `new`, в зависимости от потребности) - в дочернем

> ==Короче==
> Если в дочернем объявить метод базового через `new`, то когда мы получим вызов метода базового класса

```csharp
BaseClass dc = new DerivedClass();
dc.Method2(); // Base - Method2 

DerivedClass dc1 = new DerivedClass();
dc1.Method2(); // Derived - Method2  
```


```csharp
namespace StartUpProject.NewAndOverride
{
    public class Animal
    {
        public virtual void Move() => Console.WriteLine("Animal is moving");
    }

    public sealed class Frog : Animal
    {
        public override void Move() => Console.WriteLine("Frog is jumping");
    }

    public sealed class Rabbit : Animal
    {
        public new void Move() => Console.WriteLine("Rabbit is runnig");
    }

    public class AnimalsMovementTesting
    {
        public void TestAnumalActions()
        {
            Animal animal = new Animal();
            Animal frog = new Frog();
            Animal rabbit = new Rabbit();
            Rabbit rabbit2 = new Rabbit();

            animal.Move(); // Animal starts moving
            frog.Move();   // Frog is jumping
            rabbit.Move(); // Animal starts moving
            rabbit2.Move();// Rabbit is runnig

			// и rabbit, и rabbit2 имеют тип Rabbit
        }
    }
}
```

##### Method signatures

> Methods are declared in a `class`, `record`, or `struct` by specifying:

- An optional access level, such as `public` or `private`. The default is `private`.
- Optional modifiers such as `abstract` or `sealed`.
- The return value, or `void` if the method has none.
- The method name.
- Any method parameters. Method parameters are enclosed in parentheses and are separated by commas. Empty parentheses indicate that the method requires no parameters.

These parts together form the method signature.

==**Important**
A **return type** of a method is not part of the signature of the method for the purposes of method overloading. However, it is part of the signature of the method when determining the compatibility between a delegate and the method that it points to.==

==Возвращаемый тип метода не является частью сигнатуры метода, когда идет речь о перегрузке метода. Однако, он является частью сигнатуры при определении совместимости между делегатом и методом, на который он указывает==