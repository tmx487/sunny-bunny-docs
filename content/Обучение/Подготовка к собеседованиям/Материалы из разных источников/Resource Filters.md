
- **Назначение:** Выполняются до или после выполнения любого другого фильтра. Их можно использовать для обработки кэширования или манипуляций с ресурсами.
- **Примеры:** `ResourceFilterAttribute`
- **Пример использования**
```c#
public class MyResourceFilter : IResourceFilter
{
    public void OnResourceExecuting(ResourceExecutingContext context)
    {
        // Код до выполнения действия
    }

    public void OnResourceExecuted(ResourceExecutedContext context)
    {
        // Код после выполнения действия
    }
}
```