
- **Назначение:** Позволяют использовать Dependency Injection для создания экземпляров фильтров.
- **Пример использования:**
```c#
[TypeFilter(typeof(MyActionFilter))]
public class MyController : Controller
{
    // ...
}
```