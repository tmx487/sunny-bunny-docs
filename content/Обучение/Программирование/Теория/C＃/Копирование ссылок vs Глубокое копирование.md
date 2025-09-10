Код ниже демонстрирует разницу между обычным [[Обучение/Менторство/OLD Карточки/Глоссарий#^370225|присваиванием ссылок (shallow copy)]] и [[Обучение/Менторство/OLD Карточки/Глоссарий#^8e989c|глубоким копированием объектов (deep copy)]].

Основные моменты в этом коде:

1. Добавлен метод `Clone()` в класс `Person` для создания копии объекта
2. Реализованы три сценария:
    - Оригинальный пример с копированием ссылок
    - Глубокое копирование с созданием новых объектов Person
    - Глубокое копирование с использованием удобного метода `ConvertAll`

При запуске код покажет, что:

- При копировании ссылок (shallow copy) изменения в одном списке влияют на другой
- При глубоком копировании (deep copy) создаются независимые копии объектов, и изменения в одном списке не влияют на другой

```csharp
using System;
using System.Collections.Generic;

// Определение класса Person
class Person
{
    public string Name;
    
    // Конструктор
    public Person(string name) => Name = name;
    
    // Метод для создания копии объекта
    public Person Clone()
    {
        return new Person(this.Name);
    }
}

// Класс A с методом для глубокого копирования списка
public class A
{
    public List<Person> personA = new();
    
    // Метод для создания глубокой копии списка
    public List<Person> CloneList()
    {
        List<Person> clonedList = new List<Person>();
        foreach (Person person in personA)
        {
            clonedList.Add(person.Clone());
        }
        return clonedList;
    }
}

// Класс B
public class B
{
    public List<Person> personB = new();
}

class Program
{
    static void Main()
    {
        // Создание экземпляров классов
        var testA = new A();
        var testB = new B();
        
        // Добавление элемента в список B
        testB.personB.Add(new Person("Alice"));
        
        Console.WriteLine("=== Пример с копированием ссылки (shallow copy) ===");
        
        // Просто копирование ссылки (как в исходном примере)
        testA.personA = testB.personB;
        
        Console.WriteLine($"Количество элементов в testA.personA: {testA.personA.Count}");
        
        // Изменение списка через одну ссылку
        testA.personA.Add(new Person("Bob"));
        
        Console.WriteLine($"Количество элементов в testB.personB после изменения testA.personA: {testB.personB.Count}");
        Console.WriteLine($"Имена в списке testB.personB: {testB.personB[0].Name}, {testB.personB[1].Name}");
        
        // Изменение поля объекта через одну ссылку
        testA.personA[0].Name = "Alice Modified";
        Console.WriteLine($"Имя первого человека в testB.personB после изменения в testA.personA: {testB.personB[0].Name}");
        
        Console.WriteLine("\n=== Пример с глубоким копированием (deep copy) ===");
        
        // Создаем новые экземпляры для чистоты эксперимента
        var deepTestA = new A();
        var deepTestB = new B();
        
        // Добавление элемента в список B
        deepTestB.personB.Add(new Person("Charlie"));
        
        // Глубокое копирование элементов из списка B в список A
        // Создается новый список с новыми объектами Person, имеющими те же значения полей
        List<Person> tempList = new List<Person>();
        foreach (Person person in deepTestB.personB)
        {
            tempList.Add(person.Clone());
        }
        deepTestA.personA = tempList;
        
        Console.WriteLine($"Количество элементов в deepTestA.personA: {deepTestA.personA.Count}");
        
        // Изменение списка через одну ссылку
        deepTestA.personA.Add(new Person("David"));
        
        Console.WriteLine($"Количество элементов в deepTestB.personB после изменения deepTestA.personA: {deepTestB.personB.Count}");
        
        // Изменение поля объекта через одну ссылку
        deepTestA.personA[0].Name = "Charlie Modified";
        Console.WriteLine($"Имя в deepTestA.personA: {deepTestA.personA[0].Name}");
        Console.WriteLine($"Имя в deepTestB.personB: {deepTestB.personB[0].Name}");
        
        // Использование метода CloneList из класса A
        Console.WriteLine("\n=== Пример с использованием метода CloneList ===");
        
        var methodTestA = new A();
        var methodTestB = new B();
        
        methodTestB.personB.Add(new Person("Eva"));
        
        // Глубокое копирование с использованием метода
        methodTestA.personA = methodTestB.personB.ConvertAll(person => person.Clone());
        
        Console.WriteLine($"Количество элементов в methodTestA.personA: {methodTestA.personA.Count}");
        
        // Изменение поля объекта через одну ссылку
        methodTestA.personA[0].Name = "Eva Modified";
        
        Console.WriteLine($"Имя в methodTestA.personA: {methodTestA.personA[0].Name}");
        Console.WriteLine($"Имя в methodTestB.personB: {methodTestB.personB[0].Name}");
    }
}
```