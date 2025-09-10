
- **Назначение:** Выполняются до и после вызова метода действия контроллера. Используются для выполнения логики перед началом действия и после его завершения.
- **Примеры:** `ActionFilterAttribute`
- **Пример использования:**
```c#
public class MyActionFilter : IActionFilter
{
    public void OnActionExecuting(ActionExecutingContext context)
    {
        // Код до выполнения действия
    }

    public void OnActionExecuted(ActionExecutedContext context)
    {
        // Код после выполнения действия
    }
}
```