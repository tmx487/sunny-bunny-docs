
- **Назначение:** Обрабатывают ошибки, возникающие во время выполнения действий или других фильтров. Используются для централизованной обработки исключений.
- **Примеры:** `ExceptionFilterAttribute`
- **Пример использования:**
```c#
public class MyExceptionFilter : IExceptionFilter
{
    public void OnException(ExceptionContext context)
    {
        // Логика обработки исключений
    }
}
```