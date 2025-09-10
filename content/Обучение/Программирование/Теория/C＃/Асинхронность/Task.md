**Task** - операция, которая может выполняться параллельно с основным кодом или же завершиться в будущем.

В `C#` есть два типа Task: 

- Task - представляет задачу, которая не имеет результата
- Task\<T> - задача, у которой будет результат работы

Упрощенное представление внутренней структуры класса Task:

```cs
public class Task
{
    private object m_stateObject;          // Пользовательские данные
    private TaskScheduler m_taskScheduler; // Планировщик задач
    private volatile int m_stateFlags;     // Флаги состояния
    private int m_taskId;                  // Уникальный ID
    private Delegate m_action;             // Делегат для выполнения
    private object m_stateFlags;           // Состояние задачи
    private volatile Task m_continuationObject; // Продолжения
    private CancellationToken m_cancellationToken; // Токен отмены
}
```

На что обратить внимание в классе Task:

- **Action/Func** - код для выполнения (кст, это классический пример [[Полиморфизм|полиморфизма]])

```cs
Task task1 = new Task(() => Console.WriteLine("Hello")); // Action
Task<int> task2 = new Task<int>(() => 42); // Func<int>
```

- **TaskScheduler** - определяет, где и как выполняется задача

```cs
Task.Run(() => DoWork()); // Использует ThreadPool
Task.Factory.StartNew(() => DoWork(), CancellationToken.None, 
    TaskCreationOptions.None, TaskScheduler.Current);
```

- **CancellationToken** - механизм отмены

```cs
CancellationTokenSource cts = new CancellationTokenSource();
Task task = Task.Run(() => {
    while (!cts.Token.IsCancellationRequested)
    {
        // работа
        Thread.Sleep(100);
    }
}, cts.Token);

cts.Cancel(); // Отменяем задачу
```

- **Continuations** - продолжения (что делать после завершения задачи)

```cs
Task task = Task.Run(() => 42);
Task continuation = task.ContinueWith(t => 
{
    Console.WriteLine($"Результат: {t.Result}");
});
```

### Жизненный цикл Task

```cs
// 1. Создание
Task task = new Task(() => DoWork());

// 2. Запуск
task.Start();

// 3. Выполнение (внутренние процессы)
// - Планировщик помещает в очередь
// - Выделяется поток из ThreadPool
// - Выполняется код

// 4. Завершение
// - Устанавливается статус
// - Запускаются continuations
// - Освобождаются ресурсы
```

### TaskCompletionSource - ручное управление

```cs
public TaskCompletionSource<int> CreateManualTask()
{
    var tcs = new TaskCompletionSource<int>();
    
    // В другом месте кода:
    tcs.SetResult(42);        // Успешное завершение
    // или
    tcs.SetException(ex);     // Завершение с ошибкой
    // или  
    tcs.SetCanceled();        // Отмена
    
    return tcs;
}
```

## Критически важные методы ожидания

### 1. await - основной механизм

```csharp
// ПРАВИЛЬНО - не блокирует поток
string result = await GetDataAsync();

// НЕПРАВИЛЬНО - блокирует поток, может вызвать deadlock
string result = GetDataAsync().Result;
```

| await - асинхронное ожидание                                                                                                                                                               | Result - синхронное блокирование                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| - Поток **освобождается** и возвращается в ThreadPool<br>- Поток может **обрабатывать другие задачи**<br>- Когда операция завершается, **любой доступный поток** продолжает выполнение<br> | - Текущий поток **останавливается** и ждет<br>- Поток **не может** делать ничего другого<br>- Поток **заморожен** до завершения операции |
Когда `Result` все же допустим:

- до C# 7.1: Main метод в консольных приложениях, т.к. Main не может быть async
- конструкторы классов не могут быть `async`, поэтому там, при необходимости, можно вызывать  `Result` (хотя лучше использовать [[Фабричный метод|фабричный метод]])
- синхронные методы в legacy коде
- тесты (иногда)
- ConfigureAwait(false) + GetAwaiter().GetResult()

```cs
// В библиотечном коде, где нужно избежать deadlock
public string GetDataSync()
{
    // Более безопасная альтернатива .Result
    return GetDataAsync().ConfigureAwait(false).GetAwaiter().GetResult();
}

private async Task<string> GetDataAsync()
{
    await Task.Delay(100).ConfigureAwait(false);
    return "data";
}
```

- `Lazy<T>` инициализация

```cs
public class CacheService
{
    private readonly Lazy<Dictionary<string, string>> _cache;
    
    public CacheService()
    {
        _cache = new Lazy<Dictionary<string, string>>(() => 
        {
            // В Lazy.Value нет async/await
            return LoadCacheAsync().Result;
        });
    }
    
    // АЛЬТЕРНАТИВА - AsyncLazy из AsyncEx
    private readonly AsyncLazy<Dictionary<string, string>> _asyncCache = 
        new AsyncLazy<Dictionary<string, string>>(LoadCacheAsync);
}
```

- обработка исключений в некоторых случаях

---

>[!warning] НИКОГДА НЕ ИСПОЛЬЗУЕМ `Result` в следующих случаях:
>
>```cs
>// ❌ в UI потоке
>private void Button_Click(object sender, EventArgs e)
>{
>	var data = GetDataAsync().Result; // DEADLOCK!
>}
>
>// ❌ в ASP.NET контроллерах
>public ActionResult Index()
>{
>	var data = GetDataAsync().Result; // DEADLOCK!
>	return View(data);
>}
>
>// ❌ внутри async методов
>public async Task ProcessDataAsync()
>{
>	var data = GetDataAsync().Result; // Зачем?? если есть await!
>	return data.ToUpper();
>}
>```

### 2. ConfigureAwait - контроль контекста

```csharp
// В библиотечном коде - ОБЯЗАТЕЛЬНО
await SomeOperationAsync().ConfigureAwait(false);

// В UI коде - можно опустить (по умолчанию true)
await SomeOperationAsync();
```

### 3. Task.WhenAll/WhenAny - комбинирование задач

```csharp
// Параллельное выполнение
Task<string>[] tasks = { GetData1Async(), GetData2Async(), GetData3Async() };
string[] results = await Task.WhenAll(tasks);

// Первый завершившийся
Task<string> completedTask = await Task.WhenAny(tasks);
string result = await completedTask;
```

## Критически важные поля управления

### 1. CancellationToken

```csharp
public async Task DoWorkAsync(CancellationToken cancellationToken = default)
{
    for (int i = 0; i < 1000; i++)
    {
        cancellationToken.ThrowIfCancellationRequested(); // Проверка отмены
        
        await SomeOperationAsync();
    }
}

// Использование
var cts = new CancellationTokenSource();
var task = DoWorkAsync(cts.Token);

cts.Cancel(); // Отменить операцию
```

### 2. TaskScheduler (неявно, но важно понимать)

```csharp
// По умолчанию - ThreadPool
Task.Run(() => DoWork()); 

// UI контекст (для WPF/WinForms)
Task.Factory.StartNew(() => UpdateUI(), 
    CancellationToken.None, 
    TaskCreationOptions.None, 
    TaskScheduler.FromCurrentSynchronizationContext());
```

## Критически важные методы продолжения

### 1. ContinueWith

```csharp
task.ContinueWith(t => 
{
    if (t.IsFaulted)
        HandleError(t.Exception);
    else
        ProcessResult(t.Result);
}, TaskContinuationOptions.ExecuteSynchronously);
```

### 2. GetAwaiter().OnCompleted()

```csharp
// Низкоуровневый механизм (обычно не используется напрямую)
task.GetAwaiter().OnCompleted(() => 
{
    Console.WriteLine("Task completed");
});
```

## Критически важные паттерны использования

### 1. Правильная обработка исключений

```csharp
public async Task SafeOperationAsync()
{
    try
    {
        await RiskyOperationAsync();
    }
    catch (HttpRequestException ex)
    {
        // Специфичная обработка
        LogError(ex);
        throw; // Или не throw, зависит от логики
    }
    catch (Exception ex)
    {
        // Общая обработка
        LogError(ex);
        throw;
    }
}
```

### 2. Избегание deadlock

```csharp
// ПЛОХО - может вызвать deadlock
public string BadMethod()
{
    return GetDataAsync().Result; // Блокирующий вызов в синхронном методе
}

// ХОРОШО
public async Task<string> GoodMethod()
{
    return await GetDataAsync();
}

// Или если нужен синхронный метод
public string SyncMethod()
{
    return GetDataAsync().GetAwaiter().GetResult(); // Менее опасно, чем .Result
}
```

**Главное правило**: понимание этих членов критично для написания правильного, производительного и безопасного асинхронного кода. Неправильное использование Task может привести к deadlock, утечкам памяти и блокировке UI.

#Способы создания `Task`:

- с использованием конструктора и делегата `Action` или `Action<Object>`:

```csharp
new Task(ComputeBoundUp, 5).Start();
```

- с использованием статического метода `Run` и одного из делегатов: `Action` или `Func<TResult>`, также можно передать структуру `CancellationToken`, чтобы можно было прервать выполнение задачи:

```csharp
Task.Run(() => ComputeBoundUp(5));
```

### Как завершить задание и получить результат

Для ожидания завершения задачи используется метод `Wait()`, который может принимать еще тайм-аут или структуру `CancellationToken`:

```csharp
Task<int> t = new Task<int>(n => Sum(int n, 1000000));

t.Start(); // запускаем задачу

t.Wait(); // ждем пока задача выполниться

Console.WriteLine($"The sum is {t.Result}");
```

>[!danger] Важно
>**Логика работы метода Wait:**
>
>- Когда поток вызывает метод Wait, система сначала проверяет, началось ли уже выполнение ожидаемой задачи
>- Если задача уже выполняется, то вызывающий поток блокируется до её завершения
>- Если задача ещё не начала выполняться, система может (в зависимости от TaskScheduler) выполнить её непосредственно в том же потоке, который вызвал Wait

**Преимущества оптимизации:**

- Экономия ресурсов - не нужно создавать дополнительные потоки
- Повышение производительности - отсутствуют затраты на создание потоков и переключение контекста

**Потенциальная проблема:** При использовании Wait может возникнуть **взаимная блокировка (deadlock)** в случаях, когда:

1. Поток заблокирован на синхронизации перед вызовом Wait
2. Задача, которую он пытается выполнить, требует доступа к тем же заблокированным ресурсам

В такой ситуации возникает тупиковая ситуация - поток не может разблокировать ресурсы, пока не выполнит задачу, а задача не может выполниться без доступа к заблокированным ресурсам.

### Обработка исключений в Task

- Исключения из Task оборачиваются в `AggregateException`

```csharp
try
{
    task.Wait();
}
catch (AggregateException ex)
{
    // Обработка исключений из задачи
    foreach (var innerExce ption in ex.InnerExceptions)
    {
        Console.WriteLine($"Исключение: {innerException.Message}");
    }
}
```

- Если задача выбросила несколько исключений, все они будут доступны через свойство `InnerExceptions`
- Метод `Wait()` блокирует текущий поток до завершения задачи, включая случаи, когда задача завершается с исключением

**Альтернативы для обработки исключений:**

- Проверка свойства `task.Exception` после завершения
- Использование `task.IsFaulted` для проверки наличия исключений
- Асинхронный подход с `await` и обычными `try-catch` блоками

### Task.Delay() vs Thread.Sleep()

| Характеристика                 | Task.Delay                                                                                                                                                   | Thread.Sleep                                                                                                                        |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| блокирует поток                | нет, поток возвращается в пул потоков                                                                                                                        | **да**, поток не может выполнять другую работу                                                                                      |
| синхронный                     | нет, возвращает Task, который можно ожидать                                                                                                                  | да                                                                                                                                  |
| расходует ресурсы              | нет, т.к. поток может обрабатывать другие задачи                                                                                                             | да, т.к. заблокированный поток остается в памяти                                                                                    |
| можно прервать работу досрочно | да, через CancellationToken                                                                                                                                  | нет                                                                                                                                 |
| когда использовать             | - В веб-приложениях (ASP.NET)<br>- В UI-приложениях (WinForms, WPF)<br>- Когда важна отзывчивость и масштабируемость<br>- При работе с async/await паттерном | - В консольных приложениях или фоновых задачах<br>- Когда нужна простая пауза без асинхронности<br>- В тестах для имитации задержек |
#### Масштабируемость

```csharp
// Плохо: блокирует 1000 потоков
for (int i = 0; i < 1000; i++)
{
    Task.Run(() => Thread.Sleep(5000));
}

// Хорошо: использует минимум потоков
for (int i = 0; i < 1000; i++)
{
    Task.Delay(5000);
}
```