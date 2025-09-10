В **Moq** метод `.Verifiable()` используется для пометки настроек моков, которые должны быть проверены на вызов позже с помощью `Verify()`. Это помогает убедиться, что ожидаемые методы действительно вызывались в тестируемом коде.

---

### 📌 **Как работает `Verifiable()`?**

Когда ты добавляешь `.Verifiable()`, Moq помечает этот `Setup` как важный. Позже, при вызове `Verify()`, Moq проверяет, был ли этот метод вызван. Если метод не был вызван, `Verify()` выбросит исключение и тест не пройдет.

#### **Простой пример без `Verifiable()`**

```csharp
_mockService.Setup(s => s.DoSomething()).Returns(true);

_mockService.Object.DoSomething(); // Вызываем метод

_mockService.Verify(s => s.DoSomething(), Times.Once); // Проверяем, что метод был вызван 1 раз
```

Тест пройдет, если метод `DoSomething()` вызван ровно 1 раз.

---

#### **Пример с `Verifiable()`**

```csharp
_mockService
    .Setup(s => s.DoSomething())
    .Returns(true)
    .Verifiable();

_mockService.Object.DoSomething();

_mockService.Verify(); // Проверит все мокированные вызовы с `Verifiable()`
```

Здесь **`Verify()` без аргументов проверяет ВСЕ вызовы**, которые были помечены `Verifiable()`.

#### **Еще пример с `Verifiable()`**

```csharp
[Fact]
public async Task DeleteManyTopics_Should_ReturnSuccess_WhenAllTopicsExist()
{
    // Arrange
    var topicsToDelete = new List<Topic> { 
        CreateDefaultTopic(),
        CreateDefaultTopic(),
        CreateDefaultTopic(),
    };

    // Мокаем метод GetFilteredAsync с Verifiable
    _topicRepository
        .Setup(repo => repo.GetFilteredAsync(It.IsAny<Expression<Func<Topic, bool>>>(), It.IsAny<CancellationToken>()))
        .ReturnsAsync(topicsToDelete)
        .Verifiable();  // Это значит, что этот метод должен быть вызван в тесте

    // Act
    var result = await _topicService.DeleteManyTopics(topicsToDelete.Select(t => t.Id), CancellationToken.None);

    // Assert
    result.IsSuccess.Should().BeTrue();
    
    // Проверяем, что RemoveRange был вызван
    _topicRepository.Verify(repo => repo.RemoveRange(topicsToDelete), Times.Once);
    
    // Проверяем, что метод SaveChangesAsync был вызван
    _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);

    // Проверяем, что GetFilteredAsync был вызван
    _topicRepository.Verify();  // Мы вызываем Verify() без аргументов, чтобы проверить, что Setup() был вызван; если нигде в коде не встретился Verifiable(), то данная строка не имеет смысла
}
```
### Как работает код:

1. **Setup**: Мокируем вызов метода `GetFilteredAsync` на репозитории с параметрами.
    - Мы также вызываем `Verifiable()` для этого метода, что говорит библиотеке Moq: "Этот метод должен быть вызван, иначе тест не должен пройти".
2. **Act**: Запускаем действие — в данном случае вызываем метод сервиса `DeleteManyTopics`.
3. **Verify**: После выполнения действия вызываем `Verify()` для проверки, был ли вызван метод, который мы пометили как обязательный для проверки с помощью `Verifiable()`.

---

### 📌 **Когда `Verifiable()` полезен?**

1. **Когда много моков**
    
    - Если у тебя несколько `Setup()`, вместо множества `Verify()` можно использовать один `Verify()` для всех.
2. **Когда забываешь `Verify()`**
    
    - Если забыть `Verify()`, `Verifiable()` можно использовать с `VerifyAll()` для автоматической проверки.

**Когда использовать**:

- Используется, когда важно удостовериться, что определенные методы были вызваны в ходе выполнения теста.
- Полезно для проверки side-effects (побочных эффектов) — например, если вы хотите проверить, что после выполнения какой-то операции был вызван метод сохранения в базе данных.
---

### 📌 **Альтернативный метод `VerifyAll()`**

```csharp
_mockService
    .Setup(s => s.DoSomething())
    .Returns(true)
    .Verifiable();

_mockService
    .Setup(s => s.DoSomethingElse())
    .Returns(false)
    .Verifiable();

_mockService.Object.DoSomething();
_mockService.Object.DoSomethingElse();

_mockService.VerifyAll(); // Проверит ВСЕ помеченные `Verifiable()`
```

Если **любой `Verifiable()` метод не вызван**, тест упадет.

---

### 🛑 **Когда НЕ использовать `Verifiable()`?**

- Если у тебя **много настроек, но не все должны быть проверены** — лучше использовать `Verify()` только для нужных моков.
- В **сложных тестах**, где несколько `Verify()`, `Verifiable()` может запутать, какие вызовы действительно должны быть проверены.

### 🚀 **Вывод**

✅ `Verifiable()` удобно использовать, если у тебя много моков, и ты хочешь автоматизировать `Verify()`.  
❌ Но если нужно проверять только конкретные вызовы, лучше использовать `Verify()` напрямую.