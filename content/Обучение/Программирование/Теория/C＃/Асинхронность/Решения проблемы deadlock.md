### 1. **ConfigureAwait(false)**

```csharp
async Task AsyncMethod()
{
    await SomeAsyncOperation().ConfigureAwait(false);
    // Не возвращается на исходный поток - нет deadlock
}

public void SyncMethod()
{
    var task = AsyncMethod();
    task.Wait(); // OK - нет попытки вернуться на UI поток
}
```

### 2. **Использовать async/await везде**

```csharp
// ✅ ПРАВИЛЬНО
public async Task SyncMethodAsync()
{
    await AsyncMethod(); // Не блокирует поток
}

private async void Button_Click(object sender, EventArgs e)
{
    await SyncMethodAsync(); // UI поток освобождается во время await
}
```

### 3. **Task.Run для CPU-bound работы**

```csharp
public void SyncMethod()
{
    var task = Task.Run(async () => await AsyncMethod());
    task.Wait(); // OK - выполняется в ThreadPool
}
```

## Визуализация проблемы:

```
Поток 1 (UI):    SyncMethod() → task.Wait() → 🔒 БЛОКИРОВАН
                                    ↑
                                    ждет
                                    ↓
Поток 2 (Task):  AsyncMethod() → await завершился → 
                 пытается вернуться на Поток 1 → 🔒 НЕ МОЖЕТ
```

## Ключевые моменты:

- **SynchronizationContext** "помнит" исходный поток
- **await** по умолчанию пытается вернуться на тот же поток
- **Wait()** блокирует поток синхронно
- **ConfigureAwait(false)** отключает возврат на исходный поток
- **ASP.NET Core** не имеет SynchronizationContext → нет проблемы

**Правило:** В UI/ASP.NET приложениях избегайте `.Wait()` и `.Result` на async методах!