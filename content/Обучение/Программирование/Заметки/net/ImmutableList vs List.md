Нет, **init-свойства** тут не подойдут, потому что тебе нужно **модифицировать** список `_proposedTopics` (добавлять новые темы).

---

### 🚀 **Почему `init` не подходит?**

Если переписать код с `init`, получится что-то вроде:

```csharp
public IReadOnlyCollection<Guid> ProposedTopics { get init; }
```

Но `init`-свойства можно установить **только один раз в конструкторе**!  
А в нашем случае мы будем **добавлять новые темы**, поэтому такой вариант **не подойдёт**.

---

### ✅ **Какой вариант можно использовать, если хочется иммутабельности?**

Если хочешь **immutable**-подход (чтобы нельзя было изменять `_proposedTopics` напрямую), то можно заменить **List** на **ImmutableList**:

```csharp
using System.Collections.Immutable;

private ImmutableList<Guid> _proposedTopics = ImmutableList<Guid>.Empty;

public IReadOnlyList<Guid> ProposedTopics => _proposedTopics;

public void AddProposedTopic(Guid topicId)
{
    _proposedTopics = _proposedTopics.Add(topicId); // Создаёт новую коллекцию!
}
```

🔹 **В чём разница?**

- `ImmutableList<Guid>` не позволяет изменять существующий список, но создаёт новый при добавлении.
- Это даёт **безопасность**, но немного увеличивает нагрузку на память.

Если хочешь **максимальную производительность**, лучше оставить **List** с `AsReadOnly()`. 🔥