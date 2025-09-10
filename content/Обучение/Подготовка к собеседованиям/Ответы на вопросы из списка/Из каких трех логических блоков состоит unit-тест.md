---
уровень: "[[junior]]"
секция: тестирование
пройдено: 
теги: 
дата: 02-05-2024
время: 20:11
---
```c#
// Arrange

// Act

// Assert
```

[читай](https://deviq.com/testing/arrange-act-assert)


## xUnit

В библиотеке xUnit для написания модульных тестов в .NET есть два основных атрибута для определения тестовых методов: `[Fact]` и `[Theory]`. Они служат разным целям и используются для разных типов тестов.

### [Fact]

- **Что это:** `[Fact]` представляет собой тестовый метод, который не принимает никаких входных параметров.
- **Когда использовать:** Используйте `[Fact]`, когда у вас есть тест, который всегда должен выполняться одинаково, без каких-либо входных данных. Это наиболее простой вид теста, который просто проверяет определённое поведение кода.
- **Пример:**

```c#
public class MyTests
{
    [Fact]
    public void TestMethod1()
    {
        // Arrange
        var value1 = 2;
        var value2 = 2;

        // Act
        var result = value1 + value2;

        // Assert
        Assert.Equal(4, result);
    }
}
```

### [Theory]

- **Что это:** `[Theory]` представляет собой параметризованный тестовый метод, который принимает входные параметры. Для передачи данных в тестовый метод используются атрибуты `InlineData`, `MemberData`, `ClassData`, `TheoryData`.
- **Когда использовать:** Используйте `[Theory]`, когда у вас есть тест, который должен выполняться с различными входными данными. Это позволяет повторно использовать один и тот же тестовый метод для проверки нескольких наборов данных.
- **Пример с InlineData:**

```c#
public class MyParameterizedTests
{
    [Theory]
    [InlineData(2, 2, 4)]
    [InlineData(3, 3, 6)]
    [InlineData(4, 5, 9)]
    public void TestMethod2(int value1, int value2, int expectedResult)
    {
        // Act
        var result = value1 + value2;

        // Assert
        Assert.Equal(expectedResult, result);
    }
}
```

- **Пример с MemberData:**
```c#
[Theory]
[MemberData(nameof(EmailTestData))]
public void EmailParser_Should_Return_Domain(string email, string expectedDomain)
{
    // Arrange
    var parser = new EmailParser();

    // Act
    var domain = parser.ParseDomain(email);

    // Assert
    Assert.Equal(domain, expectedDomain);
}

public static IEnumerable<object[]> EmailTestData => new List<object>
{
    new object[] { "test@test.com", "test.com" },
    new object[] { "milan@milanjovanovic.tech", "milanjovanovic.tech" }
};
```

- **Пример с ClassData:**
```csharp
[Theory]
[ClassData(typeof(EmailTestData))]
public void EmailParser_Should_Return_Domain(string email, string expectedDomain)
{
    // Arrange
    var parser = new EmailParser();

    // Act
    var domain = parser.ParseDomain(email);

    // Assert
    Assert.Equal(domain, expectedDomain);
}

public class EmailTestData : IEnumerable<object[]>
{

    public IEnumerable<object[]> GetEnumerator()
    {
        yield return new object[] { "test@test.com", "test.com" };
        yield return new object[] { "milan@milanjovanovic.tech", "milanjovanovic.tech" };
    }

    IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
};
```

- **Пример с TheoryData:**
```csharp
[Theory]
[ClassData(typeof(EmailTestData))]
public void EmailParser_Should_Return_Domain(string email, string expectedDomain)
{
    // Arrange
    var parser = new EmailParser();

    // Act
    var domain = parser.ParseDomain(email);

    // Assert
    Assert.Equal(domain, expectedDomain);
}

public class EmailTestData : TheoryData<string, string>
{
    public EmailTestData()
    {
        Add("test@test.com", "test.com");
        Add("milan@milanjovanovic.tech", "milanjovanovic.tech");
    }
};
```

### Ключевые различия

1. **Фиксированные данные vs Параметризованные данные:**
    
    - `[Fact]`: Тестовый метод выполняется с фиксированными данными и не принимает параметры.
    - `[Theory]`: Тестовый метод выполняется с различными наборами параметризованных данных, что позволяет проверять один и тот же код с разными входными значениями.
2. **Гибкость тестирования:**
    
    - `[Fact]`: Менее гибкий, так как всегда тестирует одну и ту же логику с одинаковыми данными.
    - `[Theory]`: Более гибкий, так как позволяет проверять различные сценарии с разными данными, предоставляя возможность для более полного тестирования.

Использование `[Fact]` и `[Theory]` позволяет легко создавать тесты для самых разных сценариев и обеспечивать проверку кода с различными наборами данных.

> **Facts** are tests which are always true. They test invariant conditions.
> **Theories** are tests which are only true for a particular set of data.
> 
> \- https://xunit.net/docs/getting-started/netcore/cmdline

🔗[Creating Data-Driven Tests With xUnit (milanjovanovic.tech)](#https://www.milanjovanovic.tech/blog/creating-data-driven-tests-with-xunit))
