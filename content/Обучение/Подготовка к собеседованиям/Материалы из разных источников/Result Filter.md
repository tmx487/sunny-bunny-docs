
- **Назначение:** Выполняются до и после выполнения результата действия. Используются для выполнения логики перед рендерингом результата (например, перед отправкой данных клиенту).
- **Примеры:** `ResultFilterAttribute`
- **Пример использования:**
```c#
public class MyResultFilter : IResultFilter
{
    public void OnResultExecuting(ResultExecutingContext context)
    {
        // Код до выполнения результата
    }

    public void OnResultExecuted(ResultExecutedContext context)
    {
        // Код после выполнения результата
    }
}
```