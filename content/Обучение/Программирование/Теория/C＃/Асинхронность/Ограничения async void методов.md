## Основные проблемы

### 1. **Невозможно await** НА async void

```csharp
// ❌ НЕЛЬЗЯ - компилятор не позволит
async void BadMethod() { await Task.Delay(1000); }

public void Caller()
{
    await BadMethod(); // ОШИБКА КОМПИЛЯЦИИ
}

// ✅ ПРАВИЛЬНО
async Task GoodMethod() { await Task.Delay(1000); }

public async void Caller()
{
    await GoodMethod(); // OK
}
```

### 2. **Fire-and-forget с невидимыми исключениями**

```csharp
async void DangerousMethod()
{
    await Task.Delay(100);
    throw new Exception("Ошибка!"); // Исключение "пропадает"
}

public void CallDangerous()
{
    DangerousMethod(); // Вызвали и забыли
    // Исключение упадет в глобальный обработчик или crash приложения
}
```

### 3. **Проблемы с тестированием**

```csharp
[Test]
public void Test_AsyncVoid() // ❌ Тест завершится до выполнения async void
{
    SomeAsyncVoidMethod();
    // Тест "прошел", но метод еще выполняется
}

[Test]
public async Task Test_AsyncTask() // ✅ Тест дождется завершения
{
    await SomeAsyncTaskMethod();
    // Тест реально завершен
}
```

### 4. **Нет возврата результата**

```csharp
// ❌ async void не может вернуть значение
async void GetDataAsync() 
{
    var result = await _service.GetAsync();
    return result; // ОШИБКА
}

// ✅ async Task<T> возвращает результат
async Task<Data> GetDataAsync()
{
    return await _service.GetAsync(); // OK
}
```

## Единственное правильное применение

### Event handlers

```csharp
// ✅ Единственный валидный случай
public partial class MainWindow : Window
{
    private async void Button_Click(object sender, RoutedEventArgs e)
    {
        try
        {
            await LoadDataAsync();
        }
        catch (Exception ex)
        {
            // ОБЯЗАТЕЛЬНО обрабатывать исключения
            MessageBox.Show($"Ошибка: {ex.Message}");
        }
    }
}
```

## Сравнение подходов

|                          | async void | async Task | async Task\<T> |
| ------------------------ | ---------- | ---------- | -------------- |
| **Можно await**          | ❌          | ✅          | ✅              |
| **Возврат значения**     | ❌          | ❌          | ✅              |
| **Обработка исключений** | ❌ Сложно   | ✅          | ✅              |
| **Тестируемость**        | ❌          | ✅          | ✅              |
| **Event handlers**       | ✅          | ❌          | ❌              |

## Примеры проблем и решений

### Проблема: Fire-and-forget

```csharp
// ❌ ПЛОХО
public void ProcessData()
{
    ProcessDataAsync(); // Fire-and-forget
}

async void ProcessDataAsync() // Исключения потеряются
{
    await _service.ProcessAsync();
}

// ✅ ХОРОШО
public async Task ProcessDataAsync()
{
    await _service.ProcessAsync();
}

public void ProcessData()
{
    _ = ProcessDataAsync(); // Явный fire-and-forget, если нужно
}
```

### Проблема: [[Решения проблемы deadlock|Deadlock]] в синхронном коде

```csharp
// ❌ ПЛОХО - может вызвать deadlock
public void SyncMethod()
{
    var task = AsyncMethod();
    task.Wait(); // Потенциальный deadlock
}

async Task AsyncMethod() { /* ... */ }

// ✅ ХОРОШО
public async Task SyncMethodAsync()
{
    await AsyncMethod();
}
```


```text
UI поток: Wait() → ждет завершения AsyncMethod()
                       ↓
AsyncMethod: await завершился → пытается вернуться на UI поток
                       ↓
UI поток: ЗАБЛОКИРОВАН в Wait() → не может принять продолжение
                       ↓
                   DEADLOCK! 🔒
```
## Лучшие практики

### 1. **Всегда используйте Task**

```csharp
// ✅ Правильно
public async Task<string> GetDataAsync() => await _api.GetAsync();
public async Task SaveDataAsync(string data) => await _api.SaveAsync(data);
```

### 2. **Для event handlers - обязательно try/catch**

```csharp
private async void OnTimerElapsed(object sender, ElapsedEventArgs e)
{
    try
    {
        await ProcessPeriodicTaskAsync();
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Periodic task failed");
        // Не падаем, продолжаем работу
    }
}
```

### 3. **Явный fire-and-forget**

```csharp
// Если действительно нужно fire-and-forget
public void StartBackgroundWork()
{
    _ = Task.Run(async () =>
    {
        try
        {
            await DoBackgroundWorkAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Background work failed");
        }
    });
}
```

## Ключевые правила

1. **Избегайте async void** везде кроме event handlers
2. **В event handlers** обязательно try/catch
3. **Используйте async Task** для всех остальных случаев
4. **Не делайте .Wait()** на async void (это невозможно)
5. **Тестируйте async Task**, не async void

**Мнемоническое правило:** "async void = async avoid" (избегайте async void)